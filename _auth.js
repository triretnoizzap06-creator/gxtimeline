// Kunci dashboard (Dashboard SPV, Helpdesk Report, Performance, Directory).
// Password TIDAK ditulis di kode: diisi di Vercel → Settings → Environment Variables → GX_DASH_PASSWORD.
// Setelah login, browser menyimpan cookie HttpOnly berisi HMAC dari password (berlaku 30 hari).
// Ganti password di Vercel = semua sesi lama otomatis tidak berlaku.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE = 'gx_dash';
export const MAX_AGE = 60 * 60 * 24 * 30;
const pw = () => process.env.GX_DASH_PASSWORD || '';
export const authConfigured = () => !!pw();
const token = () => createHmac('sha256', pw()).update('gx-dash-v1').digest('hex');
const h = s => createHmac('sha256', 'gx-cmp').update(String(s)).digest();

export function cookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return out;
}
export function authed(req) {
  if (!pw()) return false;
  const c = cookies(req)[COOKIE];
  if (!c) return false;
  return timingSafeEqual(h(c), h(token()));
}
export function passOk(given) {
  if (!pw() || !given) return false;
  return timingSafeEqual(h(given), h(pw()));
}
export function sessionCookie() {
  return `${COOKIE}=${token()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
/* hanya path lokal (cegah open redirect) */
export function safeNext(n) { const s = String(n || '/'); return /^\/(?![\/\\])/.test(s) ? s : '/'; }

/* ---------- Akses tim (Tools & Access di Dashboard Helpdesk / AM) ----------
   Password tim TIDAK di kode: Vercel → Environment Variables → GX_TEAM_PASSWORD.
   Dipakai hanya untuk membuka password tools yang disimpan SPV di Supabase. */
export const TEAM_COOKIE = 'gx_team';
const tpw = () => process.env.GX_TEAM_PASSWORD || '';
export const teamConfigured = () => !!tpw();
const ttoken = () => createHmac('sha256', tpw()).update('gx-team-v1').digest('hex');
export function teamAuthed(req) {
  if (!tpw()) return false;
  const c = cookies(req)[TEAM_COOKIE];
  return !!c && timingSafeEqual(h(c), h(ttoken()));
}
export function teamPassOk(given) {
  if (!tpw() || !given) return false;
  return timingSafeEqual(h(given), h(tpw()));
}
export const teamCookie = () => `${TEAM_COOKIE}=${ttoken()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
