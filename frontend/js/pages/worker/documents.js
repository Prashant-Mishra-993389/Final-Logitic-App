// js/pages/worker/documents.js — Worker document upload
import { renderLayout } from '../../ui/layout.js';
import { FileUpload } from '../../components/fileUpload.js';
import { API } from '../../core/api.js';
import { Toast } from '../../components/toast.js';
import { Badge } from '../../components/badge.js';

export async function documentsPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up" style="max-width:640px;">
        <div class="page-header"><h1>Documents</h1><p>Upload your ID proof, certificates, and other documents for verification.</p></div>

        <div class="section-card">
          <h2>ID Proof</h2>
          <div id="id-proof-upload"></div>
          <div id="id-proof-preview" style="margin-top:10px;"></div>
        </div>

        <div class="section-card">
          <h2>Certificates & Qualifications</h2>
          <div id="cert-upload"></div>
        </div>

        <div class="section-card">
          <h2>Profile Photo</h2>
          <div id="photo-upload"></div>
        </div>
        <button id="save-docs-btn" class="btn btn-primary" style="margin-top:0.5rem;">Save Documents</button>
      </div>
    `;

    const uploads = { idProof: [], certificates: [], photo: null };

    const idUploader = FileUpload({
      id: 'id-proof', accept: 'image/*,.pdf', multiple: false,
      label: 'Upload Aadhar, PAN, or Passport',
      onUploaded: (url) => { uploads.idProof = [url]; },
    });
    document.getElementById('id-proof-upload').appendChild(idUploader);

    const certUploader = FileUpload({
      id: 'certs', accept: 'image/*,.pdf', multiple: true,
      label: 'Upload certificates',
      onUploaded: (url) => uploads.certificates.push(url),
    });
    document.getElementById('cert-upload').appendChild(certUploader);

    const photoUploader = FileUpload({
      id: 'photo', accept: 'image/*', multiple: false,
      label: 'Upload profile photo',
      onUploaded: (url) => { uploads.photo = url; },
    });
    document.getElementById('photo-upload').appendChild(photoUploader);

    // Load existing profile
    const res = await API.get('/auth/me', { silent: true });
    const profile = res.user?.workerProfile;
    if (profile?.verificationStatus) {
      document.querySelector('.page-header p').innerHTML += ` ${Badge(profile.verificationStatus)}`;
    }

    document.getElementById('save-docs-btn').addEventListener('click', async () => {
      const btn = document.getElementById('save-docs-btn');
      btn.disabled = true; btn.textContent = 'Saving...';
      const r = await API.put('/auth/update', {
        workerProfile: {
          idProof: uploads.idProof[0] || undefined,
          certificates: uploads.certificates.length ? uploads.certificates : undefined,
          profilePhoto: uploads.photo || undefined,
        }
      });
      btn.disabled = false; btn.textContent = 'Save Documents';
      if (r.success) Toast.success('Documents saved!');
    });
  }, { title: 'Documents' });
}
