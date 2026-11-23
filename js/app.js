(() => {
  const $ = s => document.querySelector(s);
  const state = { data: null, day: 0, picked: false, filter: "all", completed: {} };
  const KEY = "bahia-2027-checklist";
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const labels = { accommodation: "Hospedagem", region: "Região", beach: "Praia", restaurant: "Restaurante", tourist_area: "Ponto turístico", church: "Igreja", attraction: "Atração", square: "Praça", market: "Mercado", city: "Cidade" };

  function overview(d) {
    const t = d.trip, stay = t.accommodation || {}, loc = TripData.getLocation(d, stay.location_id);
    $("#hero-dates").textContent = `${TripData.formatDate(t.start_date).toUpperCase()} A ${TripData.formatDate(t.end_date).toUpperCase()}`;
    $("#hero-summary").textContent = t.summary || "Uma viagem para aproveitar cada momento juntos.";
    $("#hero-travelers").textContent = t.travelers?.total ?? "—";
    $("#footer-title").innerHTML = `${esc(t.destination || "Viagem")} <span>${esc((t.start_date || "").slice(0,4))}</span>`;
    $('[data-stat="travelers"]').textContent = t.travelers?.total ?? "—";
    $('[data-stat="days"]').textContent = t.duration_days ?? d.days.length;
    $('[data-stat="locations"]').textContent = d.locations.length;
    $("#stay-name").textContent = stay.name || "Nossa hospedagem";
    $("#stay-address").textContent = [stay.region, stay.state].filter(Boolean).join(" — ") || loc?.address || "";
    const url = stay.google_maps_url || TripData.mapsUrl(loc);
    $("#stay-map").href = url || "#"; $("#stay-map").hidden = !url;
    $("#footer-message").textContent = d.metadata?.closing_message || "Que seja uma viagem cheia de alegria e boas lembranças!";
  }
  function days(d) {
    const today = new Date().toLocaleDateString("sv");
    const todayIndex = d.days.findIndex(x => x.date === today);
    if (!state.picked && todayIndex >= 0) state.day = todayIndex;
    $("#day-tabs").innerHTML = d.days.map((day, i) => `<button class="day-tab" id="day-tab-${i}" role="tab" type="button" aria-controls="day-panel" aria-selected="${i === state.day}" tabindex="${i === state.day ? 0 : -1}" data-day="${i}"><strong>${esc(day.title)}${day.date === today ? ' <span class="today-badge">Hoje</span>' : ""}</strong><span>${esc(TripData.formatDate(day.date, { day: "2-digit", month: "2-digit" }))} · ${esc(day.weekday)}</span></button>`).join("");
    $("#day-tabs").onclick = e => { const b = e.target.closest("[data-day]"); if (b) { state.day = +b.dataset.day; state.picked = true; days(state.data); } };
    const day = d.days[state.day]; $("#day-panel").setAttribute("aria-labelledby", `day-tab-${state.day}`); if (!day) { $("#day-panel").innerHTML = '<div class="empty-state">Nenhum dia cadastrado.</div>'; return; }
    $("#day-panel").innerHTML = `<div class="day-panel-head"><div><span class="eyebrow eyebrow-blue">${esc(day.weekday)} · ${esc(TripData.formatDate(day.date))}</span><h3>${esc(day.title)}</h3><p>${esc(day.theme || day.destination || "")}</p></div><span class="location-type">${day.activities.length} ${day.activities.length === 1 ? "atividade" : "atividades"}</span></div>
    <ul class="activity-list">${day.activities.map(a => { const loc = TripData.getLocation(d, a.location_id), url = TripData.mapsUrl(loc), time = a.start_time ? `${a.start_time}${a.end_time ? "–" + a.end_time : ""}` : "A definir"; return `<li class="activity"><span class="activity-time">${esc(time)}</span><div><h4>${esc(a.title)}</h4><p>${esc(a.description)}</p></div>${url ? `<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener">Ver mapa ↗</a>` : ""}</li>` }).join("")}</ul>
    ${day.notes?.length ? `<div class="day-notes"><strong>Observações</strong><ul>${day.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul></div>` : ""}`;
  }
  function locations(d) {
    const cats = [...new Set(d.locations.map(x => x.category).filter(Boolean))], filters = [{ id: "all", label: "Todos" }, ...cats.map(id => ({ id, label: labels[id] || id }))];
    $("#location-filters").innerHTML = filters.map(f => `<button class="filter-chip ${state.filter === f.id ? "active" : ""}" data-filter="${esc(f.id)}">${esc(f.label)}</button>`).join("");
    $("#location-filters").onclick = e => { const b = e.target.closest("[data-filter]"); if (b) { state.filter = b.dataset.filter; locations(state.data); } };
    const items = d.locations.filter(x => state.filter === "all" || x.category === state.filter);
    $("#locations-grid").innerHTML = items.map(loc => {
      const url = TripData.mapsUrl(loc), waze = TripData.wazeUrl(loc);
      return `<article class="location-card"><span class="location-type">${esc(labels[loc.category] || loc.category || "Local")}</span><h3>${esc(loc.name)}</h3><p>${esc(loc.address || "Endereço não informado")}</p><div class="location-actions">${url ? `<a class="button button-primary" href="${esc(url)}" target="_blank" rel="noopener">Abrir rota no Maps ↗</a>` : ""}${waze ? `<a class="button button-secondary" href="${esc(waze)}" target="_blank" rel="noopener">Waze ↗</a>` : ""}<button class="button button-secondary" type="button" data-copy-address="${esc(loc.address || loc.name)}">Copiar endereço</button></div></article>`;
    }).join("") || '<div class="empty-state">Nenhum local nesta categoria.</div>';
    $("#locations-grid").onclick = async e => {
      const b = e.target.closest("[data-copy-address]"); if (!b) return;
      try { await navigator.clipboard.writeText(b.dataset.copyAddress); const toast = $("#toast"); toast.textContent = "Endereço copiado."; toast.classList.add("show"); }
      catch { const toast = $("#toast"); toast.textContent = "Não foi possível copiar. Selecione o endereço manualmente."; toast.classList.add("show"); }
    };
  }
  function checklist(d) {
    const items = d.checklist || [];
    $("#checklist").innerHTML = items.map(x => { const done = Object.prototype.hasOwnProperty.call(state.completed, x.id) ? state.completed[x.id] : x.status === "completed"; return `<label class="check-item ${done ? "done" : ""}"><input type="checkbox" data-check="${esc(x.id)}" ${done ? "checked" : ""}><span>${esc(x.title)}</span></label>` }).join("") || '<p class="muted">Nenhuma tarefa cadastrada.</p>';
    $("#checklist").onchange = e => { const input = e.target.closest("[data-check]"); if (!input) return; state.completed[input.dataset.check] = input.checked; localStorage.setItem(KEY, JSON.stringify(state.completed)); checklist(state.data); };
    const done = items.filter(x => Object.prototype.hasOwnProperty.call(state.completed, x.id) ? state.completed[x.id] : x.status === "completed").length;
    $("#check-progress").textContent = `${done}/${items.length} concluídos`; $("#check-progress-bar").style.width = items.length ? `${done / items.length * 100}%` : "0%";
  }
  function alerts(d) {
    $("#alerts-list").innerHTML = (d.alerts || []).map(a => `<article class="alert-item severity-${esc(a.severity || "info")}"><strong><span class="alert-dot"></span>${esc(a.title)}</strong><p>${esc(a.message)}</p></article>`).join("") || '<p class="muted">Nenhum aviso cadastrado.</p>';
  }
  function render(d) {
    state.data = d; if (state.day >= d.days.length) state.day = 0;
    overview(d); days(d); locations(d); checklist(d); alerts(d);
    const updated = d.metadata?.updated_at; $("#last-updated").textContent = updated ? `Dados atualizados em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(updated))}` : "Data de atualização não informada";
  }
  async function refresh(silent = false) {
    try {
      const fresh = await TripData.load();
      const signature = JSON.stringify(fresh);
      if (signature !== state.signature) { state.signature = signature; render(fresh); }
    }
    catch (err) { console.error(err); if (!state.data) $("#day-panel").innerHTML = `<div class="empty-state">${esc(err.message)} Abra o site por um servidor local e confira se roteiro.json está na raiz.</div>`; else if (!silent) { const t = $("#toast"); t.textContent = "Falha ao atualizar o roteiro."; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2200); } }
  }
  document.addEventListener("DOMContentLoaded", () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      state.completed = Array.isArray(saved) ? Object.fromEntries(saved.map(id => [id, true])) : saved;
    } catch { state.completed = {}; }
    const menu = $("#menu-toggle"), links = $("#nav-links");
    menu.addEventListener("click", () => { const open = links.classList.toggle("open"); menu.setAttribute("aria-expanded", String(open)); menu.textContent = open ? "×" : "☰"; });
    links.addEventListener("click", e => { if (e.target.closest("a")) { links.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); menu.textContent = "☰"; } });
    refresh();
    setInterval(() => { if (document.visibilityState === "visible") refresh(true); }, 300000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refresh(true); });
    window.addEventListener("online", () => refresh(true));
    $("#day-tabs").addEventListener("keydown", e => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      const tabs = [...$("#day-tabs").querySelectorAll("[role=tab]")];
      let next = tabs.findIndex(t => t.getAttribute("aria-selected") === "true");
      next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (next + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      e.preventDefault(); tabs[next]?.click(); tabs[next]?.focus();
    });
    $("#share-button").addEventListener("click", async () => {
      const shareData = { title: document.title, text: "Roteiro da viagem em família à Bahia.", url: location.href };
      try { if (navigator.share) await navigator.share(shareData); else if (navigator.clipboard) { await navigator.clipboard.writeText(location.href); $("#toast").textContent = "Link copiado."; $("#toast").classList.add("show"); } }
      catch (e) { if (e.name !== "AbortError") console.error(e); }
    });
    if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  });
})();