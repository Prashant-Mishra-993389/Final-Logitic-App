// js/pages/customer/tracking.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { MapManager } from '../../core/map.js';
import { SocketClient } from '../../core/socket.js';
import { DateUtil } from '../../utils/date.js';

// Helper function to turn Address Text into Real Coordinates (Geocoding)
async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.warn("Geocoding failed for", address);
  }
  return null;
}

function getOrderId() {
  const m = window.location.hash.match(/orderId=([^&]+)/);
  return m ? m[1] : null;
}

export async function trackingPage() {
  renderLayout(async (content) => {
    const orderId = getOrderId();

    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>📍 Live Tracking</h1></div>
        ${!orderId ? `
        <div class="section-card" style="margin-bottom:1rem;">
          <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Select Active Order</label>
          <select id="track-order-sel" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;">
            <option>Loading active orders...</option>
          </select>
        </div>` : ''}
        <div class="section-card">
          <div id="tracking-status" style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;flex-wrap:wrap;">
            <span style="color:#64748b;font-size:0.875rem;">Loading tracking info...</span>
          </div>
          <div id="tracking-map" class="map-container" style="height:480px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);"></div>
          <div id="tracking-eta" style="margin-top:1rem;"></div>
        </div>
      </div>
    `;

    let activeOrderId = orderId;
    let pollInterval = null;
    let mapReady = false;
    let jobDestination = null;

    setTimeout(async () => {
      // Initialize map to show all of India (zoom level 5) until real location is found
      await MapManager.init('tracking-map', 20.5937, 78.9629, 5); 
      MapManager.invalidate();
      mapReady = true;
      if (activeOrderId) startTracking(activeOrderId);
    }, 300);

    if (!orderId) {
      try {
        const res = await API.get('/orders/my', { silent: true });
        const active = (res.orders || res.data || []).filter(o => ['in_progress', 'assigned', 'on_the_way'].includes(o.status));
        const sel = document.getElementById('track-order-sel');
        if (!active.length) sel.innerHTML = `<option>No active orders to track</option>`;
        else {
          sel.innerHTML = `<option value="">-- Select Order --</option>` + active.map(o => `<option value="${o._id}">${o.categoryId?.name || 'Order'} — ${DateUtil.format(o.createdAt)}</option>`).join('');
          sel.addEventListener('change', () => {
            activeOrderId = sel.value;
            if (activeOrderId) {
              if (pollInterval) clearInterval(pollInterval);
              jobDestination = null;
              if (mapReady) startTracking(activeOrderId);
            }
          });
          if (active.length === 1) { sel.value = active[0]._id; activeOrderId = active[0]._id; }
        }
      } catch (err) {
        console.error("Failed to load orders");
      }
    } else {
      startTracking(orderId);
    }

    async function startTracking(oId) {
      if (!mapReady) return;

      try {
        const orderRes = await API.get(`/orders/${oId}`, { silent: true });
        const orderData = orderRes.order || orderRes.data;
        
        const loc = orderData?.location || orderData?.address;
        
        // Find Real Location from Coords OR String Address
        if (loc?.lat && loc?.lng) {
          jobDestination = { lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) };
        } else if (typeof loc === 'string' || loc?.address) {
          const addressStr = typeof loc === 'string' ? loc : loc.address;
          const statusEl = document.getElementById('tracking-status');
          if(statusEl) statusEl.innerHTML = `<span style="color:#f59e0b;font-size:0.875rem;">🔍 Finding location for "${addressStr}"...</span>`;
          jobDestination = await geocodeAddress(addressStr);
        }

        if (jobDestination) {
          MapManager.addMarker('dest', jobDestination.lat, jobDestination.lng, { color: '#ef4444', size: 16, popup: '📍 Job Site' });
          MapManager.panTo(jobDestination.lat, jobDestination.lng, 14); // Zoom directly to the real city
        }
      } catch (err) { console.warn(err); }

      try { SocketClient.connect(); } catch(e){}
      SocketClient.joinOrder(oId);

      SocketClient.on('locationUpdate', (data) => {
        if (data.orderId !== oId) return;
        const workerLat = parseFloat(data.lat);
        const workerLng = parseFloat(data.lng);
        if (!mapReady || isNaN(workerLat) || isNaN(workerLng)) return;

        if (MapManager.getMarker && MapManager.getMarker('worker')) {
          MapManager.updateMarker('worker', workerLat, workerLng);
        } else {
          MapManager.addMarker('worker', workerLat, workerLng, { color: '#f59e0b', size: 18, popup: '🔧 Worker (Live)' });
        }
        
        // Safe UI Update
        const statusEl = document.getElementById('tracking-status');
        if (statusEl) {
          statusEl.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,0.3);animation:pulse 1.5s infinite;flex-shrink:0;"></span><span style="font-weight:600;color:#22c55e;font-size:0.875rem;">LIVE</span>`;
        }

        if (jobDestination) showDirections(workerLat, workerLng, jobDestination.lat, jobDestination.lng);
      });

      fetchSession(oId);
      pollInterval = setInterval(() => fetchSession(oId), 10000);
    }

    async function fetchSession(oId) {
      if (!mapReady) return;
      try {
        const res = await API.get(`/tracking/${oId}`, { silent: true });
        const session = res.session || res.data;
        const statusEl = document.getElementById('tracking-status');

        if (!session || !session.currentLocation) {
          if (statusEl) statusEl.innerHTML = `<span style="color:#64748b;font-size:0.875rem;">⏳ Worker hasn't started sharing location yet.</span>`;
          return;
        }

        const isLive = session.status === 'active';
        if (statusEl) {
          statusEl.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${isLive ? '#22c55e' : '#64748b'};${isLive ? 'box-shadow:0 0 0 3px rgba(34,197,94,0.3);animation:pulse 1.5s infinite;' : ''}flex-shrink:0;"></span><span style="font-weight:600;color:${isLive ? '#22c55e' : '#94a3b8'};font-size:0.875rem;">${isLive ? 'LIVE' : 'Tracking Ended'}</span>`;
        }

        const workerLat = parseFloat(session.currentLocation.lat);
        const workerLng = parseFloat(session.currentLocation.lng);

        if (!isNaN(workerLat) && !isNaN(workerLng)) {
          MapManager.addMarker('worker', workerLat, workerLng, { color: '#f59e0b', size: 18, popup: '🔧 Worker Location' });
          
          if (session.destinationLocation?.lat && session.destinationLocation?.lng) {
            jobDestination = { lat: parseFloat(session.destinationLocation.lat), lng: parseFloat(session.destinationLocation.lng) };
          }
          
          if (jobDestination && !isNaN(jobDestination.lat)) {
            showDirections(workerLat, workerLng, jobDestination.lat, jobDestination.lng);
            MapManager.fitMarkers();
          }
        }
      } catch (err) {}
    }

    async function showDirections(wLat, wLng, dLat, dLng) {
      if (!window.L || isNaN(wLat) || isNaN(wLng) || isNaN(dLat) || isNaN(dLng)) return;
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${wLng},${wLat};${dLng},${dLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
          MapManager.drawRoute(coords, '#f59e0b');
          
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMins = Math.ceil(route.duration / 60);
          const etaEl = document.getElementById('tracking-eta');
          
          if (etaEl) {
            etaEl.innerHTML = `<div style="background:#1a1d27;border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:12px 16px;display:inline-flex;gap:10px;align-items:center;"><span style="font-size:1.2rem;">🕐</span><div><div style="font-weight:700;color:#f59e0b;font-size:1rem;">${durationMins} mins</div><div style="color:#64748b;font-size:0.78rem;">ETA (${distanceKm} km away)</div></div></div>`;
          }
        }
      } catch (err) {}
    }

    window.addEventListener('hashchange', () => {
      if (pollInterval) clearInterval(pollInterval);
      try { SocketClient.leaveOrder(activeOrderId); } catch(e){}
    }, { once: true });

  }, { title: 'Live Tracking' });
}