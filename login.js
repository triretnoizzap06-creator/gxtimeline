// POST /api/login  (form: password, next) → set cookie & redirect ke halaman tujuan
// GET  /api/login?logout=1                → hapus cookie, kembali ke dashboard utama
// GET  /api/login?check=1                 → { authed, team } (dipakai halaman untuk tombol Logout)
// POST /api/login  JSON { team: 1, password } → akses tim (GX_TEAM_PASSWORD) untuk melihat password tools
import { passOk, sessionCookie, clearCookie, safeNext, authed, authConfigured, teamPassOk, teamCookie, teamAuthed, teamConfigured } from './_auth.js';

async function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  let s = '';
  if (req.body != null) s = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
  else { const c = []; for await (const x of req) c.push(Buffer.isBuffer(x) ? x : Buffer.from(x)); s = Buffer.concat(c).toString('utf8'); }
  if (s.length > 4096) return {};
  if (/^\s*\{/.test(s)) { try { return JSON.parse(s); } catch { return {}; } }
  return Object.fromEntries(new URLSearchParams(s));
}
const redirect = (res, to, cookie) => { res.statusCode = 303; if (cookie) res.setHeader('set-cookie', cookie); res.setHeader('location', to); res.setHeader('cache-control', 'no-store'); res.end(); };

export default async function handler(req, res) {
  const u = new URL(req.url, 'http://x');
  if (req.method === 'GET' && u.searchParams.has('logout')) return redirect(res, '/', clearCookie());
  if (req.method === 'GET') {
    res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'no-store');
    return res.end(JSON.stringify({ authed: authed(req), configured: authConfigured(), team: authed(req) || teamAuthed(req), teamConfigured: teamConfigured() }));
  }
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const b = await readBody(req);
  if (b.team) {
    res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'no-store');
    if (!teamConfigured()) { res.statusCode = 503; return res.end(JSON.stringify({ error: 'team-not-configured' })); }
    if (teamPassOk(b.password)) { res.setHeader('set-cookie', teamCookie()); return res.end(JSON.stringify({ ok: true })); }
    await new Promise(r => setTimeout(r, 600));
    res.statusCode = 401; return res.end(JSON.stringify({ error: 'wrong-password' }));
  }
  const next = safeNext(b.next);
  if (passOk(b.password)) return redirect(res, next, sessionCookie());
  await new Promise(r => setTimeout(r, 600));   // perlambat tebak-tebakan password
  const [p, h] = next.split('#');
  return redirect(res, p + (p.includes('?') ? '&' : '?') + 'err=1' + (h ? '#' + h : ''));
}
