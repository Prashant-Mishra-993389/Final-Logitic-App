// js/core/auth.js — Auth session management
import { API } from './api.js';
import { TokenStorage } from './storage.js';
import { AppState } from './state.js';

export const Auth = {
  async login(email, password) {
    const res = await API.post('/auth/login', { email, password });
    // res.data = { user, token }  (ApiResponse shape, already spread by api.js)
    if (res.success) {
      const token = res.token || res.data?.token;
      const user  = res.user  || res.data?.user;
      if (token) TokenStorage.setToken(token);
      if (user)  TokenStorage.setUser(user);
      AppState.update({
        user, token,
        isAuthenticated: true,
        role: user?.role,
      });
    }
    return res;
  },

  async register(data) {
    return API.post('/auth/register', data);
  },

  async verifyOtp({ userId, email, otp }) {
    // Backend expects { userId, otp } — try userId first, fall back to email lookup
    const payload = userId ? { userId, otp } : { email, otp };
    const res = await API.post('/auth/verify-otp', payload);
    if (res.success) {
      const token = res.token || res.data?.token;
      const user  = res.user  || res.data?.user;
      if (token) TokenStorage.setToken(token);
      if (user)  TokenStorage.setUser(user);
      AppState.update({
        user, token,
        isAuthenticated: !!(token),
        role: user?.role,
      });
    }
    return res;
  },

  async logout() {
    await API.post('/auth/logout', {}, { silent: true });
    TokenStorage.clearAll();
    AppState.update({ user: null, token: null, isAuthenticated: false, role: null });
    window.location.hash = '#/login';
  },

  async getMe() {
    const res = await API.get('/auth/me', { silent: true });
    if (res.success) {
      // /auth/me → ApiResponse(200, req.user) → res.data = user object
      // api.js spreads data so res fields like res._id, res.role etc are available
      // But we need the full user — it's in res.data OR spread into res
      const user = res.data || res;
      // Exclude meta fields from spread
      const cleanUser = {
        _id:         res._id         || res.data?._id,
        name:        res.name        || res.data?.name,
        email:       res.email       || res.data?.email,
        phone:       res.phone       || res.data?.phone,
        role:        res.role        || res.data?.role,
        isVerified:  res.isVerified  ?? res.data?.isVerified,
        isBlocked:   res.isBlocked   ?? res.data?.isBlocked,
        avatar:      res.avatar      || res.data?.avatar,
        workerProfile: res.workerProfile || res.data?.workerProfile,
      };
      if (cleanUser._id) {
        TokenStorage.setUser(cleanUser);
        AppState.update({ user: cleanUser, isAuthenticated: true, role: cleanUser.role });
      }
    }
    return res;
  },

  async updateProfile(data) {
    const res = await API.put('/auth/update', data);
    if (res.success) {
      const user = res.data || res;
      TokenStorage.setUser(user);
      AppState.set('user', user);
    }
    return res;
  },

  async changePassword(data) {
    // Backend expects { oldPassword, newPassword }
    const payload = {
      oldPassword: data.currentPassword || data.oldPassword,
      newPassword: data.newPassword,
    };
    return API.put('/auth/change-password', payload);
  },

  async forgotPassword(email) {
    return API.post('/auth/forgot-password', { email });
  },

  isLoggedIn() {
    return !!(AppState.get('isAuthenticated') || TokenStorage.getToken());
  },

  getRole() {
    return AppState.get('role') || TokenStorage.getUser()?.role || null;
  },

  getUser() {
    return AppState.get('user') || TokenStorage.getUser() || null;
  },

  async init() {
    const token = TokenStorage.getToken();
    const cached = TokenStorage.getUser();

    if (token && cached) {
      // Restore state from cache immediately (no network needed)
      AppState.update({
        user: cached,
        token,
        isAuthenticated: true,
        role: cached.role,
      });
    }

    if (token) {
      // Verify token is still valid + refresh user data
      const res = await this.getMe();
      return res.success;
    }

    return false;
  },
};
