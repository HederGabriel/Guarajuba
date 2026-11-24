window.TripData = {
  async load() {
    const response = await fetch("./roteiro.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Não foi possível carregar roteiro.json (${response.status}).`);
    return response.json();
  },
  formatDate(value, options = { day: "2-digit", month: "long" }) {
    return value ? new Intl.DateTimeFormat("pt-BR", options).format(new Date(`${value}T12:00:00`)) : "";
  },
  getLocation(data, id) { return data.locations.find(item => item.id === id) || null; },
  mapsUrl(location) {
    if (!location) return null;
    if (location.coordinates) return `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.latitude},${location.coordinates.longitude}`;
    return location.google_maps_url || null;
  },
  wazeUrl(location) {
    if (!location) return null;
    const c = location.coordinates;
    return c ? `https://waze.com/ul?ll=${c.latitude}%2C${c.longitude}&navigate=yes` :
      `https://waze.com/ul?q=${encodeURIComponent(location.address || location.name)}&navigate=yes`;
  }
};
