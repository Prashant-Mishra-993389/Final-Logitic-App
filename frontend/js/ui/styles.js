// js/ui/styles.js — Global CSS injected into <style> tag
import { KEYFRAMES } from './animations.js';

export function injectStyles() {
  if (document.getElementById('app-styles')) return;
  const style = document.createElement('style');
  style.id = 'app-styles';
  style.textContent = `
    ${KEYFRAMES}

    :root {
      --bg-primary:   #090d14;
      --bg-secondary: #101622;
      --bg-card:      #131b2a;
      --bg-sidebar:   #0c111d;
      --accent:       #38bdf8;
      --accent-2:     #2dd4bf;
      --accent-hover: #0ea5e9;
      --accent-light: rgba(56,189,248,0.10);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted:   #64748b;
      --border:       rgba(255,255,255,0.07);
      --border-accent: rgba(56,189,248,0.25);
      --success:      #2dd4bf;
      --danger:       #ef4444;
      --warning:      #f59e0b;
      --sidebar-w:    260px;
      --grad:         linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%);
    }

    /* ─── Global 3D Background ─────────────────── */
    .bg-3d-anim {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: -999; background: #090d14; overflow: hidden; perspective: 1000px;
    }
    .bg-3d-anim::before {
      content: ''; position: absolute; width: 200%; height: 200%;
      top: -50%; left: -50%;
      background: radial-gradient(circle at center, rgba(56,189,248,0.04) 0%, transparent 60%);
      animation: rotateBg 40s linear infinite;
    }
    .grid-plane {
      position: absolute; width: 200%; height: 200%; top: 0; left: -50%;
      background-image: 
        linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px);
      background-size: 60px 60px;
      transform: rotateX(65deg) translateY(-100px) translateZ(-200px);
      animation: moveGrid 20s linear infinite;
    }
    @keyframes rotateBg { 100% { transform: rotate(360deg); } }
    @keyframes moveGrid {
      0% { transform: rotateX(65deg) translateY(0) translateZ(-200px); }
      100% { transform: rotateX(65deg) translateY(60px) translateZ(-200px); }
    }


    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg-primary); color: var(--text-primary);
      min-height: 100vh; overflow-x: hidden; font-size: 14px; line-height: 1.5;
    }

    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.15); border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.3); }

    a { color: inherit; }
    button { font-family: inherit; }
    input, select, textarea { font-family: inherit; }

    /* ─── Utility ─────────────────────────────── */
    .fade-in    { animation: fadeIn 0.3s ease; }
    .fade-in-up { animation: fadeInUp 0.35s ease; }
    .scale-in   { animation: scaleIn 0.25s ease; }

    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    @media (max-width: 1024px) { .grid-4 { grid-template-columns: repeat(2,1fr); } .grid-3 { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 640px)  { .grid-4,.grid-3,.grid-2 { grid-template-columns: 1fr; } }

    /* ─── Buttons ──────────────────────────────── */
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; border-radius: 9px; font-weight: 600;
      font-size: 0.875rem; cursor: pointer; border: none;
      transition: all 0.2s; font-family: inherit; text-decoration: none;
      white-space: nowrap;
    }
    .btn-primary  { background: var(--grad); color: #090d14; box-shadow: 0 4px 14px rgba(56,189,248,0.25); }
    .btn-primary:hover  { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(56,189,248,0.35); }
    .btn-secondary { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.09); }
    .btn-secondary:hover { background: rgba(56,189,248,0.08); color: #38bdf8; border-color: rgba(56,189,248,0.2); }
    .btn-success  { background: rgba(45,212,191,0.12); color: #2dd4bf; border: 1px solid rgba(45,212,191,0.25); }
    .btn-success:hover  { background: rgba(45,212,191,0.2); }
    .btn-danger   { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
    .btn-danger:hover   { background: rgba(239,68,68,0.18); }
    .btn-sm { padding: 6px 12px; font-size: 0.78rem; border-radius: 7px; }

    /* ─── Layout ───────────────────────────────── */
    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.5rem; padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .page-header h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.6rem; font-weight: 700; color: var(--text-primary);
      letter-spacing: -0.3px;
    }
    .page-header p { font-size: 0.875rem; color: var(--text-muted); margin-top: 3px; }

    .section-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .section-card h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1rem; font-weight: 700; color: var(--text-primary);
      margin-bottom: 1rem; padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    /* ─── Timeline ─────────────────────────────── */
    .timeline-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .timeline-item:last-child { border-bottom: none; }
    .timeline-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); margin-top: 5px; flex-shrink: 0; }

    /* ─── Sidebar nav active ───────────────────── */
    .nav-item.active {
      background: rgba(56,189,248,0.08) !important;
      color: #38bdf8 !important;
      border-left: 2px solid #38bdf8 !important;
    }

    /* ─── Form inputs ──────────────────────────── */
    .df-input {
      width:100%; padding:10px 12px;
      background: rgba(255,255,255,0.03);
      border:1px solid var(--border); border-radius:9px;
      color:#f8fafc; font-size:0.875rem; outline:none; transition:border-color 0.2s;
    }
    .df-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(56,189,248,0.1); }

    /* ─── Auth pages ───────────────────────────── */
    .auth-page {
      display: flex; align-items: center; justify-content: center;
      min-height: calc(100vh - 64px); padding: 2rem 1rem;
      background: radial-gradient(ellipse at 65% 0%, rgba(56,189,248,0.06) 0%, transparent 60%),
                  radial-gradient(ellipse at 10% 85%, rgba(45,212,191,0.04) 0%, transparent 50%);
    }
    .auth-card {
      background: var(--bg-card);
      border: 1px solid var(--border-accent);
      border-radius: 20px; padding: 2.5rem 2rem;
      width: 100%; max-width: 440px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.05);
    }
    .auth-logo { text-align: center; margin-bottom: 2rem; }
    .auth-logo .icon {
      display: inline-flex; width: 64px; height: 64px;
      border-radius: 16px; align-items: center; justify-content: center;
      font-size: 2rem; margin-bottom: 1rem;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(56,189,248,0.25);
    }
    .auth-logo .icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
    .auth-logo h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;
    }
    .auth-logo p { color: var(--text-muted); font-size: 0.9rem; }
    .auth-input {
      width:100%; padding:11px 13px;
      background: rgba(255,255,255,0.03);
      border:1px solid rgba(255,255,255,0.09);
      border-radius:10px; color:#f8fafc; font-size:0.875rem;
      outline:none; font-family:inherit; transition: all 0.2s;
    }
    .auth-input:focus { border-color: rgba(56,189,248,0.5); box-shadow: 0 0 0 3px rgba(56,189,248,0.08); }

    /* ─── Stat Cards ───────────────────────────── */
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border); border-radius: 14px;
      padding: 1.25rem; transition: all 0.2s;
    }
    .stat-card:hover { border-color: var(--border-accent); transform: translateY(-2px); }
  `;
  document.head.appendChild(style);
}