window.TripData = {
  async load() {
    const response = await fetch(`./roteiro.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Não foi possível carregar roteiro.json (${response.status}).`);
    return response.json();
  },
  formatDate(value, options = { day: "2-digit", month: "long" }) {
    return value ? new Intl.DateTimeFormat("pt-BR", options).format(new Date(`${value}T12:00:00`)) : "";
  },
  getLocation(data, id) { return data.locations.find(item => item.id === id) || null; },
  mapsUrl(location) {
    if (!location) return null;
    if (location.google_maps_url) return location.google_maps_url;
    if (location.coordinates) return `https://www.google.com/maps?q=${location.coordinates.latitude},${location.coordinates.longitude}`;
    return null;
  }
};