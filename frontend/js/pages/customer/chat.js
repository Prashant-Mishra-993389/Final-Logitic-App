// js/pages/customer/chat.js — Chat page
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Auth } from '../../core/auth.js';
import { SocketClient } from '../../core/socket.js';
import { DateUtil } from '../../utils/date.js';
import { Formatter } from '../../utils/formatter.js';

function getOrderId() {
  const m = window.location.hash.match(/orderId=([^&]+)/);
  return m ? m[1] : null;
}

export async function chatPage() {
  renderLayout(async (content) => {
    const user    = Auth.getUser();
    const orderId = getOrderId();

    content.innerHTML = `
      <div class="fade-in-up" style="height:calc(100vh - 130px);display:flex;flex-direction:column;">
        <div class="page-header"><h1>Chat</h1></div>
        ${!orderId ? `
        <div class="section-card" style="margin-bottom:1rem;">
          <select id="chat-order-sel" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;">
            <option>Loading orders...</option>
          </select>
        </div>` : ''}
        <div class="section-card" style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
          <div id="chat-header" style="padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.07);margin-bottom:12px;"></div>
          <div id="messages-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:4px;padding-right:4px;"></div>
          <div id="chat-input-area" style="display:none;margin-top:12px;display:flex;gap:8px;align-items:center;">
            <input id="msg-input" type="text" placeholder="Type a message..." style="
              flex:1;padding:10px 14px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
              border-radius:10px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
            " onfocus="this.style.borderColor='rgba(245,158,11,0.4)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
            <button id="send-btn" style="
              padding:10px 18px;background:#f59e0b;border:none;border-radius:10px;
              color:#0d0f14;font-weight:700;cursor:pointer;font-family:inherit;
            ">Send</button>
          </div>
        </div>
      </div>
    `;

    let threadId = null;
    let activeOrderId = orderId;

    if (!orderId) {
      const res = await API.get('/orders/my', { silent: true });
      const orders = res.orders || res.data || [];
      const sel = document.getElementById('chat-order-sel');
      sel.innerHTML = `<option value="">-- Select Order --</option>` +
        orders.map(o => {
          const otherName = user?.role === 'customer' ? (o.providerId?.name || 'Unassigned Worker') : (o.customerId?.name || 'Unknown Customer');
          return `<option value="${o._id}">Chat with ${otherName} — ${o.categoryId?.name || 'Service'}</option>`;
        }).join('');
      sel.addEventListener('change', () => { activeOrderId = sel.value; if (activeOrderId) initChat(activeOrderId); });
    } else {
      initChat(orderId);
    }

    async function initChat(oId) {
      // Get or create thread
      const thRes = await API.post('/chat/thread', { orderId: oId });
      const thread = thRes.thread || thRes.data;
      if (!thread) return;
      threadId = thread._id;

      const other = thread.participants?.find(p => p._id !== user?._id);
      document.getElementById('chat-header').innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:0.85rem;">
            ${Formatter.initials(other?.name || '?')}
          </div>
          <div>
            <div style="font-weight:600;color:#f1f5f9;">${other?.name || 'Support'}</div>
            <div style="font-size:0.72rem;color:#64748b;">${other?.role ? other.role.charAt(0).toUpperCase() + other.role.slice(1) : 'Order chat'}</div>
          </div>
        </div>
      `;

      document.getElementById('chat-input-area').style.display = 'flex';
      await loadMessages();

      // Socket
      const sock = SocketClient.connect();
      SocketClient.joinOrder(oId);
      SocketClient.on('newMessage', (msg) => {
        if (msg.threadId === threadId) appendMessage(msg);
      });

      // Send
      const sendMsg = async () => {
        const input = document.getElementById('msg-input');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        const res = await API.post('/chat/message', { threadId, text: text });
        if (!res.success) input.value = text;
      };
      document.getElementById('send-btn').addEventListener('click', sendMsg);
      document.getElementById('msg-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(); });
    }

    async function loadMessages() {
      const res = await API.get(`/chat/messages/${threadId}`, { silent: true });
      const msgs = res.messages || res.data || [];
      const list = document.getElementById('messages-list');
      list.innerHTML = msgs.length ? '' : `<div style="text-align:center;color:#64748b;font-size:0.85rem;padding:2rem;">No messages yet. Say hello!</div>`;
      msgs.forEach(m => appendMessage(m, false));
      list.scrollTop = list.scrollHeight;
    }

    function appendMessage(msg, scroll = true) {
      const list = document.getElementById('messages-list');
      const mine = msg.sender?._id === user?._id || msg.sender === user?._id || msg.senderId === user?._id;
      const div = document.createElement('div');
      div.style.cssText = `display:flex;flex-direction:column;align-items:${mine?'flex-end':'flex-start'};`;
      div.innerHTML = `
        <div class="msg-bubble ${mine?'msg-mine':'msg-other'}">
          <div style="font-size:0.875rem;color:#f1f5f9;">${msg.text || msg.content || msg.message}</div>
          <div style="font-size:0.7rem;color:#64748b;margin-top:3px;text-align:${mine?'right':'left'};">${DateUtil.formatTime(msg.createdAt)}</div>
        </div>
      `;
      list.appendChild(div);
      if (scroll) list.scrollTop = list.scrollHeight;
    }
  }, { title: 'Chat' });
}
