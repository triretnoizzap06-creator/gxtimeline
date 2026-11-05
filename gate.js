// Gerbang halaman terkunci. Halaman HTML hanya dikirim bila cookie login valid.
// Link viewer deck (?view=1) Helpdesk Report & Performance tetap bisa dibuka tanpa login (read-only).
import { readFileSync } from 'node:fs';
import { authed, authConfigured, safeNext } from './_auth.js';

const PAGES = {
  report: { file: 'helpdesk-report.html', name: 'Helpdesk Report', viewer: true },
  performance: { file: 'helpdesk-performance.html', name: 'Helpdesk Performance Report', viewer: true },
  directory: { file: 'helpdesk-directory.html', name: 'Helpdesk Employee Directory', viewer: false },
  spv: { file: 'spv.html', name: 'Helpdesk Management', viewer: false },
};
const cache = {};
const load = f => cache[f] || (cache[f] = readFileSync(new URL('./' + f, import.meta.url), 'utf8'));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function pageOf(u) {
  const p = u.searchParams.get('page');
  if (p && PAGES[p]) return p;
  const path = u.pathname.toLowerCase();
  if (path.includes('performance')) return 'performance';
  if (path.includes('directory')) return 'directory';
  if (path.includes('report')) return 'report';
  return 'spv';
}
function send(res, status, html) {
  res.statusCode = status;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-robots-tag', 'noindex');
  res.end(html);
}

export function loginPage(name, next, err, msg) {
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Login · ${esc(name)}</title><link rel="icon" href="/mark.png"><meta name="robots" content="noindex">
<style>
*{box-sizing:border-box}html,body{margin:0;height:100%;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#F5F5F7;color:#1D1D1F}
body{display:grid;place-items:center;padding:20px}
.box{width:100%;max-width:380px;background:#fff;border:1px solid #E5E5EA;border-radius:16px;padding:28px 26px;box-shadow:0 20px 50px rgba(0,0,0,.08)}
.logo{height:24px;display:block;margin-bottom:22px}.lock{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#FFC93C,#F5A70A);margin-bottom:14px}
.lock svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
h1{font-size:19px;margin:0 0 4px;letter-spacing:-.01em}p{margin:0 0 18px;color:#6E6E73;font-size:13.5px;line-height:1.5}
label{display:block;font-size:12px;font-weight:700;color:#6E6E73;margin-bottom:6px;letter-spacing:.02em}
input{width:100%;font:15px inherit;font-family:inherit;padding:11px 12px;border:1px solid #D2D2D7;border-radius:10px;outline:none}input:focus{border-color:#F5A70A;box-shadow:0 0 0 3px rgba(245,167,10,.2)}
button{width:100%;margin-top:14px;font:700 14px inherit;font-family:inherit;padding:11px;border:0;border-radius:10px;background:#1D1D1F;color:#fff;cursor:pointer}button:hover{background:#000}
.err{background:#FEF2F2;color:#B91C1C;border-radius:10px;padding:9px 12px;font-size:13px;margin-bottom:14px}
a{color:#6E6E73;font-size:13px;display:inline-block;margin-top:16px}
</style></head><body><form class="box" method="post" action="/api/login">
<img class="logo" src="/wordmark.png" alt="GlobalXtreme"><div class="lock"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div>
<h1>${esc(name)}</h1><p>Halaman ini terkunci. Masukkan password dashboard Helpdesk.</p>
${msg ? `<div class="err">${esc(msg)}</div>` : err ? '<div class="err">Password salah. Coba lagi.</div>' : ''}
<label for="pw">Password</label><input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
<input type="hidden" name="next" value="${esc(next)}"><button type="submit">Masuk</button>
<a href="/">← Kembali ke dashboard</a></form>
<script>var n=document.querySelector('[name=next]');if(location.hash&&n.value.indexOf('#')<0)n.value+=location.hash;</script></body></html>`;
}

export default function handler(req, res) {
  const u = new URL(req.url, 'http://x');
  const key = pageOf(u), P = PAGES[key];
  const viewer = P.viewer && u.searchParams.get('view') === '1';
  if (viewer || authed(req)) {
    try { return send(res, 200, load(P.file)); }
    catch (e) { return send(res, 500, 'Halaman tidak ditemukan di server: ' + esc(P.file)); }
  }
  const qs = new URLSearchParams(u.search); qs.delete('page'); qs.delete('err');
  const path = u.pathname.startsWith('/gate') ? '/' + (key === 'spv' ? 'spv' : 'helpdesk-' + key) : u.pathname;
  const next = safeNext(path + (qs.toString() ? '?' + qs : ''));
  if (!authConfigured()) return send(res, 503, loginPage(P.name, next, false, 'Password dashboard belum diatur. Isi env GX_DASH_PASSWORD di Vercel → Settings → Environment Variables, lalu Redeploy.'));
  return send(res, 401, loginPage(P.name, next, u.searchParams.get('err') === '1'));
}
