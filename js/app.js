import sb from './supabase.js';
import { getUser, signOut } from './auth.js';

// ── Toast notifications ──────────────────────────────────────────────────────

export function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Form helpers ─────────────────────────────────────────────────────────────

export function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
  btn.textContent = loading ? 'Please wait…' : btn.dataset.originalText;
}

export function getFormData(form) {
  return Object.fromEntries(new FormData(form));
}

// ── Date / time ──────────────────────────────────────────────────────────────

export function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Avatar initials ──────────────────────────────────────────────────────────

export function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Mobile nav toggle ────────────────────────────────────────────────────────

export function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('sidebar-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// ── Logout button wiring ─────────────────────────────────────────────────────

export function initLogout() {
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  });
}

// ── Tab switcher ─────────────────────────────────────────────────────────────

export function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const tabs = container.querySelectorAll('[data-tab]');
  const panels = container.querySelectorAll('[data-panel]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = container.querySelector(`[data-panel="${tab.dataset.tab}"]`);
      if (target) target.classList.add('active');
    });
  });
}

// ── Realtime unread badge ────────────────────────────────────────────────────

export async function watchUnreadMessages(userId, badgeEl) {
  if (!badgeEl) return;
  const update = async () => {
    const { count } = await sb
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);
    badgeEl.textContent = count || '';
    badgeEl.style.display = count ? 'inline-flex' : 'none';
  };
  await update();
  sb.channel('unread')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, update)
    .subscribe();
}
