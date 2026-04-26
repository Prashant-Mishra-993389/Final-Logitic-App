// js/pages/customer/createOrder.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Toast } from '../../components/toast.js';
import { Loader } from '../../components/loader.js';
import { renderDynamicForm, collectDynamicValues } from '../../modules/dynamicForm/dynamicFormRenderer.js';
import { FileUpload } from '../../components/fileUpload.js';
import { setButtonLoading } from '../../components/form.js';

export async function createOrderPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header">
          <div><h1>Create Service Request</h1><p>Fill in the details to create your order</p></div>
        </div>
        <div style="max-width:720px;">
          <form id="create-order-form">
            <div class="section-card">
              <h2>Select Service</h2>
              <div style="margin-bottom:1rem;">
                <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Category *</label>
                <select id="cat-select" required style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;
                ">
                  <option value="">Loading categories...</option>
                </select>
              </div>
              <div id="subcat-wrap" style="margin-bottom:1rem;display:none;">
                <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Subcategory *</label>
                <select id="subcat-select" required style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;
                ">
                  <option value="">Select subcategory...</option>
                </select>
              </div>
              <div id="service-wrap" style="margin-bottom:1rem;display:none;">
                <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Service Type</label>
                <select id="service-select" style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;
                ">
                  <option value="">Any available service</option>
                </select>
              </div>
            </div>

            <div class="section-card">
              <h2>Order Details</h2>
              <div style="margin-bottom:1rem;">
                <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Description *</label>
                <textarea id="description" rows="3" placeholder="Describe your service requirement in detail..." required style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;
                " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'"></textarea>
              </div>
              <div class="grid-2">
                <div>
                  <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Location / Address *</label>
                  <input id="location" type="text" placeholder="Site address or city" required style="
                    width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                    border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
                  " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
                </div>
                <div>
                  <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Preferred Date</label>
                  <input id="preferred-date" type="date" style="
                    width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                    border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
                  " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
                </div>
              </div>
            </div>

            <div class="section-card" id="dynamic-section" style="display:none;">
              <h2>Additional Details</h2>
              <div id="dynamic-fields-container"></div>
            </div>

            <div class="section-card">
              <h2>Attachments</h2>
              <div id="upload-area"></div>
            </div>

            <div style="display:flex;gap:10px;justify-content:flex-end;">
              <a href="#/customer/orders" class="btn btn-secondary">Cancel</a>
              <button id="submit-order-btn" type="submit" class="btn btn-primary">Submit Order →</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Load categories
    const catRes = await API.get('/categories');
    const cats = catRes.categories || catRes.data || [];
    const catSel = document.getElementById('cat-select');
    catSel.innerHTML = `<option value="">-- Select Category --</option>` +
      cats.map(c => `<option value="${c._id}">${c.name}</option>`).join('');

    // Upload area
    const uploadArea = document.getElementById('upload-area');
    const uploadedUrls = [];
    const uploader = FileUpload({
      id: 'order-files', multiple: true, accept: 'image/*,.pdf',
      label: 'Upload photos, documents, or sketches',
      onUploaded: (url) => uploadedUrls.push(url),
    });
    uploadArea.appendChild(uploader);

    // On category change
    let dynFields = [];
    catSel.addEventListener('change', async () => {
      const catId = catSel.value;
      document.getElementById('subcat-wrap').style.display = catId ? '' : 'none';
      document.getElementById('service-wrap').style.display = 'none';
      document.getElementById('dynamic-section').style.display = 'none';
      if (!catId) return;

      const subcatSel = document.getElementById('subcat-select');
      subcatSel.innerHTML = `<option value="">Loading...</option>`;
      const res = await API.get(`/subcategories/category/${catId}`);
      const subcats = res.subcategories || res.data || [];
      subcatSel.innerHTML = `<option value="">-- Select Subcategory --</option>` +
        subcats.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
    });

    // On subcategory change
    document.getElementById('subcat-select').addEventListener('change', async () => {
      const subcatId = document.getElementById('subcat-select').value;
      if (!subcatId) return;

      // Load services
      const svcRes = await API.get(`/services/subcategory/${subcatId}`);
      const svcs = svcRes.services || svcRes.data || [];
      const svcSel = document.getElementById('service-select');
      svcSel.innerHTML = `<option value="">Any available service</option>` +
        svcs.map(s => `<option value="${s._id}">${s.title}${s.basePrice ? ` — ₹${s.basePrice}` : ''}</option>`).join('');
      document.getElementById('service-wrap').style.display = '';

      // Load dynamic fields
      const dynContainer = document.getElementById('dynamic-fields-container');
      dynFields = await renderDynamicForm(dynContainer, subcatId);
      document.getElementById('dynamic-section').style.display = dynFields.length ? '' : 'none';
    });

    // Submit
    document.getElementById('create-order-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submit-order-btn');
      setButtonLoading(btn, true);

      const dynamicData = collectDynamicValues(dynFields);
      
      const answersArray = dynFields.map(f => ({
        fieldKey: f.fieldKey,
        label: f.label,
        value: dynamicData[f.fieldKey]
      }));
      
      const attachmentsArray = uploadedUrls.map(url => ({ 
        url, 
        resourceType: url.endsWith('.pdf') ? 'pdf' : 'image' 
      }));
      
      const locValue = document.getElementById('location').value.trim();
      let orderLat = 28.6139;
      let orderLng = 77.2090;

      if (locValue) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locValue)}`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            orderLat = parseFloat(geoData[0].lat);
            orderLng = parseFloat(geoData[0].lon);
          }
        } catch (e) {
          console.warn('Geocoding failed, falling back to default', e);
        }
      }

      const payload = {
        categoryId:       document.getElementById('cat-select').value,
        subcategoryId:    document.getElementById('subcat-select').value,
        serviceId:        document.getElementById('service-select').value || undefined,
        description:      document.getElementById('description').value.trim(),
        location:         { lat: orderLat, lng: orderLng, address: locValue },
        scheduledAt:      document.getElementById('preferred-date').value || undefined,
        attachments:      attachmentsArray,
        answers:          answersArray,
      };

      if (!payload.categoryId || !payload.subcategoryId || !payload.description || !locValue) {
        Toast.error('Please fill all required fields'); setButtonLoading(btn, false, 'Submit Order →'); return;
      }

      const res = await API.post('/orders', payload);
      setButtonLoading(btn, false, 'Submit Order →');
      if (res.success) {
        Toast.success('Order created successfully!');
        window.location.hash = `#/customer/order/${res.order?._id || res.data?._id}`;
      }
    });
  }, { title: 'Create Order' });
}
