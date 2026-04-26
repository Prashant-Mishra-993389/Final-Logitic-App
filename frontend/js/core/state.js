// js/core/state.js — Global reactive state

import { TokenStorage } from './storage.js';

const _listeners = {};

function createState(initial = {}) {
  let _state = { ...initial };

  return {
    get(key) { return key ? _state[key] : { ..._state }; },

    set(key, value) {
      _state[key] = value;
      this._emit(key, value);
    },

    update(partial) {
      Object.assign(_state, partial);
      Object.entries(partial).forEach(([k, v]) => this._emit(k, v));
    },

    on(key, fn) {
      if (!_listeners[key]) _listeners[key] = new Set();
      _listeners[key].add(fn);
      return () => _listeners[key].delete(fn); // unsubscribe fn
    },

    _emit(key, value) {
      if (_listeners[key]) _listeners[key].forEach(fn => fn(value));
      if (_listeners['*']) _listeners['*'].forEach(fn => fn(key, value));
    },
  };
}

// Singleton global state
export const AppState = createState({
  user:                null,
  token:               TokenStorage.getToken(),
  role:                null,          // 'customer' | 'worker' | 'admin'
  isAuthenticated:     false,
  sidebarCollapsed:    false,
  notifications:       [],
  unreadNotifications: 0,
  currentRoute:        null,
  loading:             false,
});
