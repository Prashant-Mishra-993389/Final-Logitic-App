// js/core/storage.js — localStorage/sessionStorage helpers

const PREFIX = 'indserv_';

export const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch(e) { /* quota exceeded */ }
  },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch(e) { return fallback; }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  },

  // Session (tab-only)
  session: {
    set(key, value) {
      try { sessionStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch(e) {}
    },
    get(key, fallback = null) {
      try {
        const raw = sessionStorage.getItem(PREFIX + key);
        return raw !== null ? JSON.parse(raw) : fallback;
      } catch(e) { return fallback; }
    },
    remove(key) { sessionStorage.removeItem(PREFIX + key); },
  },
};

// Auth token helpers
export const TokenStorage = {
  setToken(token) { Storage.set('token', token); },
  getToken()       { return Storage.get('token'); },
  removeToken()    { Storage.remove('token'); },

  setUser(user) { Storage.set('user', user); },
  getUser()     { return Storage.get('user'); },
  removeUser()  { Storage.remove('user'); },

  clearAll() {
    Storage.remove('token');
    Storage.remove('user');
  },
};
