// js/core/map.js — Leaflet Maps wrapper
let map = null;
let markers = {};
let routeLine = null;
let leafletPromise = null;

async function loadLeaflet() {
  if (window.L) return;
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });

  return leafletPromise;
}

export const MapManager = {
  async init(containerId, lat = 20.5937, lng = 78.9629, zoom = 13) {
    try {
      await loadLeaflet();
      const el = document.getElementById(containerId);
      if (!el) return null;
      
      el.innerHTML = '';
      if (map) { map.remove(); map = null; }
      
      map = L.map(containerId, { zoomControl: false }).setView([lat, lng], zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markers = {};
      routeLine = null;
      return map;
    } catch (err) {
      console.error('[Maps] Failed to init Leaflet:', err);
      return null;
    }
  },

  addMarker(id, lat, lng, opts = {}) {
    if (!map || !window.L) return;
    if (markers[id]) map.removeLayer(markers[id]);
    
    const color = opts.color || '#f59e0b';
    const size = opts.size || 14;
    
    const html = `
      <div style="
        width: ${size}px; height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 0 10px ${color};
      "></div>
    `;
    const icon = L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size/2, size/2] });
    
    const marker = L.marker([lat, lng], { icon }).addTo(map);
    if (opts.popup) marker.bindPopup(opts.popup);
    
    markers[id] = marker;
    return marker;
  },

  updateMarker(id, lat, lng) {
    if (markers[id]) markers[id].setLatLng([lat, lng]);
  },

  removeMarker(id) {
    if (markers[id]) { map.removeLayer(markers[id]); delete markers[id]; }
  },

  drawRoute(points, color = '#f59e0b') {
    if (!map || !window.L) return;
    if (routeLine) map.removeLayer(routeLine);
    
    routeLine = L.polyline(points, { color, weight: 4, opacity: 0.8 }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
  },

  clearRoute() {
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
  },

  panTo(lat, lng, zoom) {
    if (!map) return;
    if (zoom) map.setView([lat, lng], zoom);
    else map.panTo([lat, lng]);
  },

  fitMarkers() {
    if (!map || !window.L) return;
    const group = new L.featureGroup(Object.values(markers));
    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [40, 40] });
    }
  },

  invalidate() {
    if (map) map.invalidateSize();
  },

  getMap() { return map; },
  getMarker(id) { return markers[id] || null; },

  destroy() {
    if (map) {
      map.remove();
      map = null;
      markers = {};
      routeLine = null;
    }
  }
};
