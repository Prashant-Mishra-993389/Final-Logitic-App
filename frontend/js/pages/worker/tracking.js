// js/pages/worker/tracking.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { MapManager } from '../../core/map.js';
import { SocketClient } from '../../core/socket.js';
import { Toast } from '../../components/toast.js';
import { DateUtil } from '../../utils/date.js';

async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) { console.warn("Geocoding failed for", address); }
  return null;
}

function getOrderId() {
  const m = window.location.hash.match(/orderId=([^&]+)/);
  return m ? m[1] : null;
}

export async function workerTrackingPage() {
  renderLayout(async (content) => {
    const orderId = getOrderId();

    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>📍 Job Tracking</h1></div>
        ${!orderId ? `
        <div class="section-card" style="margin-bottom:1rem;">
          <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Select Active Job</label>
          <select id="track-job-sel" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;">
            <option>Loading active jobs...</option>
          </select>
        </div>` : ''}
        <div class="section-card">
          <div style="display:flex;gap:10px;margin-bottom:1rem;flex-wrap:wrap;align-items:center;">
            <button id="start-tracking-btn" class="btn btn-primary">▶ Start Tracking & Share Location</button>
            <button id="stop-tracking-btn" class="btn btn-danger" style="display:none;">⏹ Stop Tracking</button>
            <span id="tracking-status-label" style="color:#64748b;font-size:0.85rem;"></span>
          </div>
          <div id="worker-tracking-map" class="map-container" style="height:480px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);"></div>
          <div id="directions-panel" style="margin-top:1rem;"></div>
        </div>
      </div>
    `;

    let activeOrderId = orderId;
    let activeOrder = null;
    let watchId = null;
    let sock = null;

    if (!orderId) {
      const res = await API.get('/orders/my', { silent: true });
      const jobs = (res.orders || res.data || []).filter(o => ['assigned', 'in_progress', 'on_the_way'].includes(o.status));
      const sel = document.getElementById('track-job-sel');
      if (!jobs.length) {
        sel.innerHTML = `<option>No active jobs assigned to you</option>`;
      } else {
        sel.innerHTML = `<option value="">-- Select Active Job --</option>` +
          jobs.map(j => {
            const lat = j.location?.lat || j.address?.lat || '';
            const lng = j.location?.lng || j.address?.lng || '';
            const addrString = typeof j.address === 'string' ? j.address : (j.location?.address || '');
            return `<option value="${j._id}" data-loc-lat="${lat}" data-loc-lng="${lng}" data-loc-addr="${addrString}">${j.categoryId?.name || 'Job'} — ${j.customerId?.name || ''} (${DateUtil.format(j.createdAt)})</option>`;
          }).join('');
          
        sel.addEventListener('change', async () => {
          activeOrderId = sel.value;
          const opt = sel.options[sel.selectedIndex];
          if (activeOrderId) {
            let destLat = parseFloat(opt.dataset.locLat);
            let destLng = parseFloat(opt.dataset.locLng);
            const addressText = opt.dataset.locAddr;

            // ---> If Coordinates are missing, Geocode the Text Address (e.g. Jalandhar)
            if (isNaN(destLat) || isNaN(destLng)) {
              document.getElementById('tracking-status-label').innerText = "Finding real location...";
              const geo = await geocodeAddress(addressText);
              if(geo) { destLat = geo.lat; destLng = geo.lng; }
              document.getElementById('tracking-status-label').innerText = "";
            }

            activeOrder = { _id: activeOrderId, location: { lat: destLat, lng: destLng, address: addressText } };
            if(!isNaN(destLat)) showJobSiteMarker(activeOrder);
          }
        });
        
        if (jobs.length === 1) { sel.value = jobs[0]._id; sel.dispatchEvent(new Event('change')); }
      }
    } else {
      const res = await API.get(`/orders/${orderId}`, { silent: true });
      activeOrder = res.order || res.data;
      
      const loc = activeOrder?.location || activeOrder?.address;
      if (!loc?.lat && loc) {
        const addrStr = typeof loc === 'string' ? loc : loc.address;
        const geo = await geocodeAddress(addrStr);
        if(geo) activeOrder.location = { lat: geo.lat, lng: geo.lng, address: addrStr };
      }
    }

    setTimeout(async () => {
      // Zoom level 5 -> Shows all of India instead of just Delhi
      await MapManager.init('worker-tracking-map', 20.5937, 78.9629, 5); 
      MapManager.invalidate();
      if (activeOrder?.location?.lat && !isNaN(activeOrder.location.lat)) showJobSiteMarker(activeOrder);
    }, 200);

    function showJobSiteMarker(order) {
      if (!order?.location?.lat || isNaN(order.location.lat)) return;
      const { lat, lng, address } = order.location;
      MapManager.addMarker('destination', lat, lng, { color: '#ef4444', size: 18, popup: `📍 Job Site: ${address || 'Location'}` });
      MapManager.panTo(lat, lng, 14);
    }

    async function showDirections(workerLat, workerLng, destLat, destLng) {
      if (!window.L || isNaN(workerLat) || isNaN(destLat)) return;
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${workerLng},${workerLat};${destLng},${destLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if(!res.ok) return;
        const data = await res.json();
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
          MapManager.drawRoute(coords, '#f59e0b');
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMins = Math.ceil(route.duration / 60);
          document.getElementById('directions-panel').innerHTML = `<div style="background:#1a1d27;border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:14px 16px;display:flex;gap:16px;flex-wrap:wrap;"><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:1.3rem;">🚗</span><div><div style="font-weight:700;color:#f59e0b;">${distanceKm} km</div><div style="color:#64748b;font-size:0.75rem;">Distance to job</div></div></div><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:1.3rem;">🕐</span><div><div style="font-weight:700;color:#f1f5f9;">${durationMins} mins</div><div style="color:#64748b;font-size:0.75rem;">Estimated arrival</div></div></div></div>`;
        }
      } catch (err) {}
    }

    document.getElementById('start-tracking-btn').addEventListener('click', async () => {
      if (!activeOrderId) { Toast.error('Please select a job first'); return; }

      const btn = document.getElementById('start-tracking-btn');
      btn.disabled = true; btn.textContent = 'Starting...';

      const destLat = activeOrder?.location?.lat;
      const destLng = activeOrder?.location?.lng;

      if (!destLat || isNaN(destLat)) {
        Toast.error("Customer location not found properly.");
        btn.disabled = false; btn.textContent = '▶ Start Tracking & Share Location';
        return;
      }

      const startRes = await API.post(`/tracking/start/${activeOrderId}`, { destinationLocation: { lat: destLat, lng: destLng } });
      if (!startRes.success) { btn.disabled = false; btn.textContent = '▶ Start Tracking'; return; }

      btn.style.display = 'none';
      document.getElementById('stop-tracking-btn').style.display = '';
      document.getElementById('tracking-status-label').innerHTML = '<span style="color:#22c55e;">🟢 Sharing your location with customer</span>';

      try { sock = SocketClient.connect(); } catch(e){}
      SocketClient.joinOrder(activeOrderId);

      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          async (pos) => {
            const lat = pos.coords.latitude; const lng = pos.coords.longitude;
            MapManager.addMarker('me', lat, lng, { color: '#22c55e', size: 18, pulse: true, popup: '🧑‍🔧 Your Location' });
            showDirections(lat, lng, destLat, destLng);
            await API.patch(`/tracking/location/${activeOrderId}`, { lat, lng });
            sock?.emit('locationUpdate', { orderId: activeOrderId, lat, lng });
          }, 
          (err) => { Toast.error('Please allow GPS access to start tracking'); }, 
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      } else { Toast.error('GPS not supported on this device'); }
    });

    document.getElementById('stop-tracking-btn').addEventListener('click', async () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      MapManager.clearRoute();
      await API.post(`/tracking/stop/${activeOrderId}`);
      document.getElementById('start-tracking-btn').style.display = '';
      document.getElementById('start-tracking-btn').disabled = false;
      document.getElementById('start-tracking-btn').textContent = '▶ Start Tracking & Share Location';
      document.getElementById('stop-tracking-btn').style.display = 'none';
      document.getElementById('tracking-status-label').textContent = '⏸ Tracking stopped';
      document.getElementById('directions-panel').innerHTML = '';
      Toast.info('Tracking stopped');
    });

    window.addEventListener('hashchange', () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); }, { once: true });
  }, { title: 'Job Tracking' });
}