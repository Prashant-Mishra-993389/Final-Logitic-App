// js/components/fileUpload.js — Drag-and-drop file upload component
import { CONFIG } from '../core/config.js';
import { API } from '../core/api.js';
import { Toast } from './toast.js';
import { Formatter } from '../utils/formatter.js';

export function FileUpload({ id, accept = '*', multiple = false, label = 'Upload File', onUploaded }) {
  const wrapper = document.createElement('div');
  wrapper.id = `fu-${id}`;
  wrapper.innerHTML = `
    <div id="fu-drop-${id}" style="
      border:2px dashed rgba(255,255,255,0.12);border-radius:12px;padding:2rem;
      text-align:center;cursor:pointer;transition:all 0.2s;background:rgba(255,255,255,0.02);
    ">
      <div style="font-size:2rem;margin-bottom:8px;">📂</div>
      <div style="color:#94a3b8;font-size:0.875rem;">${label}</div>
      <div style="color:#64748b;font-size:0.75rem;margin-top:4px;">Drag & drop or click to browse</div>
      <div style="color:#64748b;font-size:0.72rem;margin-top:2px;">Max ${CONFIG.MAX_FILE_SIZE_MB}MB</div>
      <input id="fu-input-${id}" type="file" accept="${accept}" ${multiple?'multiple':''} style="display:none;" />
    </div>
    <div id="fu-preview-${id}" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;"></div>
    <div id="fu-progress-${id}" style="display:none;margin-top:8px;">
      <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
        <div id="fu-bar-${id}" style="height:100%;background:#f59e0b;width:0%;transition:width 0.3s;border-radius:4px;"></div>
      </div>
    </div>
  `;

  const drop = wrapper.querySelector(`#fu-drop-${id}`);
  const input = wrapper.querySelector(`#fu-input-${id}`);
  const preview = wrapper.querySelector(`#fu-preview-${id}`);

  drop.addEventListener('click', () => input.click());
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.style.borderColor='#f59e0b'; });
  drop.addEventListener('dragleave', () => drop.style.borderColor='rgba(255,255,255,0.12)');
  drop.addEventListener('drop', e => { e.preventDefault(); drop.style.borderColor='rgba(255,255,255,0.12)'; handleFiles(e.dataTransfer.files); });
  input.addEventListener('change', () => handleFiles(input.files));

  async function handleFiles(files) {
    for (const file of files) {
      if (file.size > CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
        Toast.error(`${file.name} exceeds ${CONFIG.MAX_FILE_SIZE_MB}MB limit`); continue;
      }
      const form = new FormData();
      form.append('file', file);
      const thumb = addPreview(file);
      const res = await API.upload('/upload', form);
      if (res.success) {
        const url = res.url || res.data?.url;
        thumb.dataset.url = url;
        onUploaded?.(url, file, res);
      } else {
        thumb.remove();
      }
    }
  }

  function addPreview(file) {
    const isImg = file.type.startsWith('image/');
    const thumb = document.createElement('div');
    thumb.style.cssText = 'position:relative;background:#1a1d27;border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;width:80px;height:80px;display:flex;align-items:center;justify-content:center;';
    if (isImg) {
      const reader = new FileReader();
      reader.onload = e => { thumb.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;"/>`; };
      reader.readAsDataURL(file);
    } else {
      thumb.innerHTML = `<div style="font-size:1.5rem;">📄</div><div style="font-size:0.6rem;color:#64748b;padding:2px;text-align:center;">${Formatter.fileSize(file.size)}</div>`;
    }
    preview.appendChild(thumb);
    return thumb;
  }

  return wrapper;
}
