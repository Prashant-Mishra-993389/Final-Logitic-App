// js/core/router.js — Hash-based SPA router with param matching
import { Auth } from './auth.js';
import { AppState } from './state.js';

// Routes stored as [{ pattern, regex, keys, handler, opts }]
const routes = [];

function pathToRegex(hash) {
  // Extract the path portion after # (e.g. '#/customer/order/:id' → '/customer/order/:id')
  const path = hash.replace(/^#/, '');
  const keys = [];
  const regexStr = path
    .replace(/[-[\]{}()*+?.,\\^$|]/g, (c) => (c === '*' ? '.*' : '\\' + c))
    .replace(/:([A-Za-z_]+)/g, (_, key) => { keys.push(key); return '([^/]+)'; });
  return { regex: new RegExp(`^${regexStr}$`), keys };
}

export const Router = {
  register(hash, handler, opts = {}) {
    if (hash === '*') {
      routes.push({ pattern: hash, regex: /.*/, keys: [], handler, opts, wildcard: true });
    } else {
      const { regex, keys } = pathToRegex(hash);
      routes.push({ pattern: hash, regex, keys, handler, opts });
    }
  },

  _match(hash) {
    // Extract base path without query string
    const basePath = (hash || '#/').split('?')[0];
    
    // Normalize: strip trailing slash, keep #
    const h = basePath.replace(/([^/])$/, '$1').replace(/\/$/, '') || '#/';
    const path = h.replace(/^#/, '');

    for (const route of routes) {
      if (route.wildcard) continue; // try wildcard last
      const m = path.match(route.regex);
      if (m) {
        const params = {};
        route.keys.forEach((k, i) => { params[k] = m[i + 1]; });
        return { route, params };
      }
    }
    // Fallback to wildcard
    const wc = routes.find(r => r.wildcard);
    return wc ? { route: wc, params: {} } : null;
  },

  async navigate(hash) {
    const normalHash = (hash || '#/').replace(/\/$/, '') || '#/';
    const matched = this._match(normalHash);
    if (!matched) { this._go('#/'); return; }

    const { route, params } = matched;
    const { handler, opts } = route;

    // Auth guard — use cached state (no API call)
    if (opts.auth) {
      if (!Auth.isLoggedIn()) { this._go('#/login'); return; }
    }

    // Role guard
    if (opts.role) {
      const role = Auth.getRole();
      if (!role) { this._go('#/login'); return; }
      if (role !== opts.role) { this._go(`#/${role}/dashboard`); return; }
    }

    AppState.set('currentRoute', normalHash);
    AppState.set('routeParams', params);

    const app = document.getElementById('app');
    if (app) app.innerHTML = '';

    try { await handler(params); }
    catch (e) { console.error('[Router] Page error:', e); }
  },

  _go(hash) {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      this.navigate(hash);
    }
  },

  start() {
    const go = () => this.navigate(window.location.hash || '#/');
    window.addEventListener('hashchange', go);
    go();
  },

  // Helper to get current route params anywhere
  getParams() { return AppState.get('routeParams') || {}; },

  push(hash) { window.location.hash = hash; },
  back()     { history.back(); },
};
