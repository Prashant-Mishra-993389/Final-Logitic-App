// js/core/api.js — Authenticated fetch wrapper
import { CONFIG } from './config.js';
import { TokenStorage } from './storage.js';

/**
 * All backend responses follow ApiResponse shape:
 * { statusCode, success, data, message }
 * We normalize them so callers get: { success, data, message, ...spread(data) }
 */
async function request(method, endpoint, body, options = {}) {
  const url = `${CONFIG.API_BASE}${endpoint}`;
  const token = TokenStorage.getToken();

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fetchOpts = { method, headers, credentials: 'include' };
  if (body && method !== 'GET') fetchOpts.body = JSON.stringify(body);

  try {
    const resp = await fetch(url, fetchOpts);
    const json = await resp.json();

    // Normalize: spread data fields to top level for easy access
    const normalized = {
      success: json.success ?? resp.ok,
      message: json.message || '',
      data: json.data,
      statusCode: json.statusCode || resp.status,
      // Spread data fields to top level (e.g. res.user, res.token, res.orders)
      ...(json.data && typeof json.data === 'object' && !Array.isArray(json.data) ? json.data : {}),
    };

    if (!json.success && !options.silent) {
      // Show error toast
      import('../components/toast.js').then(({ Toast }) =>
        Toast.error(json.message || 'Something went wrong')
      );
    }

    return normalized;
  } catch (err) {
    if (!options.silent) {
      import('../components/toast.js').then(({ Toast }) =>
        Toast.error('Network error — please check your connection')
      );
    }
    return { success: false, message: err.message, data: null };
  }
}

export const API = {
  get: (url, opts) => request('GET', url, null, opts),
  post: (url, body, opts) => request('POST', url, body, opts),
  put: (url, body, opts) => request('PUT', url, body, opts),
  patch: (url, body, opts) => request('PATCH', url, body, opts),
  delete: (url, opts) => request('DELETE', url, null, opts),
};
