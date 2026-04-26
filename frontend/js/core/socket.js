// js/core/socket.js — Socket.IO client wrapper
import { CONFIG } from './config.js';
import { TokenStorage } from './storage.js';

let socket = null;

export const SocketClient = {
  connect() {
    if (socket?.connected) return socket;
    socket = io(CONFIG.SOCKET_URL, {
      auth: { token: TokenStorage.getToken() },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
    socket.on('disconnect', () => console.log('[Socket] Disconnected'));
    socket.on('error', (e) => console.error('[Socket] Error:', e));
    return socket;
  },

  disconnect() { socket?.disconnect(); socket = null; },
  get() { return socket; },
  isConnected() { return socket?.connected ?? false; },

  joinOrder(orderId) { socket?.emit('joinOrderRoom', typeof orderId === 'object' ? orderId.orderId : orderId); },
  leaveOrder(orderId) { socket?.emit('leaveOrderRoom', typeof orderId === 'object' ? orderId.orderId : orderId); },

  on(event, fn)  { socket?.on(event, fn); },
  off(event, fn) { socket?.off(event, fn); },
  emit(event, data) { socket?.emit(event, data); },
};
