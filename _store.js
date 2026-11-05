// Lapisan data Supabase untuk GX Helpdesk Report (dipakai oleh /api/*).
import { createClient } from '@supabase/supabase-js';
import { gzipSync, gunzipSync } from 'node:zlib';
import { createHash, timingSafeEqual } from 'node:crypto';

export const MAX_BODY = 4.2 * 1024 * 1024; // batas body request Vercel Functions ±4.5 MB

export const env = () => ({
  url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || '',
  publishKey: process.env.PUBLISH_KEY || '',
});
export const configured = () => { const e = env(); return !!(e.url && e.key); };
export const isOpen = () => !env().publishKey;

let client = null;
export function db() {
  if (!client) {
    const e = env();
    client = createClient(e.url, e.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  }
  return client;
}

export function keyOk(given) {
  const want = env().publishKey;
  if (!want) return true; // mode terbuka: semua yang membuka web boleh menyimpan
  if (!given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ---------- error yang mudah dipahami ---------- */
export class AppError extends Error { constructor(code, status, detail) { super(code); this.code = code; this.status = status; this.detail = detail; } }
export function dbError(err) {
  const msg = String((err && (err.message || err.details || err.hint)) || err || '');
  const code = err && err.code;
  if (code === '42P01' || code === 'PGRST205' || code === 'PGRST202' || /does not exist|Could not find the (table|function)/i.test(msg))
    return new AppError('schema-missing', 500, 'Tabel/fungsi Supabase belum dibuat. Jalankan supabase/schema.sql di Supabase SQL Editor. (' + msg + ')');
  if (code === '42501' || /permission denied|JWT|Invalid API key|apikey/i.test(msg))
    return new AppError('supabase-auth', 500, 'Kunci Supabase salah / bukan service_role key. Cek env SUPABASE_SERVICE_ROLE_KEY. (' + msg + ')');
  return new AppError('db-error', 500, msg);
}
const must = ({ data, error }) => { if (error) throw dbError(error); return data; };

/* ---------- payload ---------- */
const gz = s => gzipSync(Buffer.isBuffer(s) ? s : Buffer.from(s), { level: 9 });
export function parseGzJson(buf) {
  if (!buf || buf.length < 20 || buf[0] !== 0x1f || buf[1] !== 0x8b) throw new AppError('bad-payload', 400, 'Body harus JSON terkompres gzip.');
  if (buf.length > MAX_BODY) throw new AppError('too-large', 413, `Data ${(buf.length / 1e6).toFixed(1)} MB melebihi batas 4.2 MB. Persempit periode data.`);
  let o;
  try { o = JSON.parse(gunzipSync(buf).toString('utf8')); } catch (e) { throw new AppError('bad-payload', 400, 'JSON tidak valid.'); }
  if (!o || typeof o !== 'object') throw new AppError('bad-payload', 400, 'JSON tidak valid.');
  return o;
}
function packDatasets(DS) {
  const ds = { cs: DS && DS.cs || null, vip: DS && DS.vip || null, rc: DS && DS.rc || null };
  if (!ds.cs && !ds.vip && !ds.rc) throw new AppError('empty-datasets', 400, 'Tidak ada data import untuk disimpan.');
  for (const k of ['cs', 'vip', 'rc']) {
    const d = ds[k];
    if (d && (!Array.isArray(d.headers) || !Array.isArray(d.rows))) throw new AppError('bad-payload', 400, `Dataset ${k} tidak valid.`);
  }
  const text = JSON.stringify(ds);
  const hash = createHash('sha256').update(text).digest('hex');
  const b64 = gz(text).toString('base64');
  const summary = {};
  for (const k of ['cs', 'vip', 'rc']) if (ds[k]) summary[k] = { name: ds[k].name || '', rows: ds[k].rows.length, cols: ds[k].headers.length };
  return { hash, b64, size: text.length, summary };
}
const settingsOf = S => { const s = S && typeof S === 'object' ? { ...S } : {}; delete s.cur; return s; };
const ms = t => (t ? new Date(t).getTime() : 0);

/* Bangun payload lengkap {v, at, import_id, revision, S, DS} tanpa parse ulang dataset */
function buildPayload({ at, import_id, revision, settings, datasets_gz }) {
  const dsText = gunzipSync(Buffer.from(datasets_gz, 'base64')).toString('utf8');
  const head = JSON.stringify({ v: 2, at, import_id, revision, S: settings || {} });
  return gz(head.slice(0, -1) + ',"DS":' + dsText + '}');
}

/* ---------- operasi ---------- */
export async function getMeta() {
  const row = must(await db().from('report_state').select('import_id,revision,updated_at').eq('id', 1).maybeSingle());
  if (!row) return { empty: true, at: 0, import_id: null, revision: 0 };
  return { empty: !row.import_id, at: ms(row.updated_at), import_id: row.import_id, revision: row.revision };
}

export async function getLatest() {
  const row = must(await db().from('report_state').select('import_id,revision,updated_at,settings,report_imports(datasets_gz)').eq('id', 1).maybeSingle());
  if (!row || !row.import_id || !row.report_imports) return null;
  const at = ms(row.updated_at);
  return { at, import_id: row.import_id, revision: row.revision, body: buildPayload({ at, import_id: row.import_id, revision: row.revision, settings: row.settings, datasets_gz: row.report_imports.datasets_gz }) };
}

export async function publishImport(p) {
  const pk = packDatasets(p.DS);
  const rows = must(await db().rpc('gx_publish_import', { p_hash: pk.hash, p_datasets_gz: pk.b64, p_size: pk.size, p_summary: pk.summary, p_settings: settingsOf(p.S) }));
  const r = Array.isArray(rows) ? rows[0] : rows;
  if (!r) throw new AppError('db-error', 500, 'Gagal menyimpan import.');
  return { ok: true, kind: 'import', import_id: r.import_id, revision: r.revision, at: ms(r.updated_at), hash: pk.hash.slice(0, 12), size: pk.size };
}

export async function saveState(p) {
  const importId = p.import_id == null ? null : Number(p.import_id);
  const rows = must(await db().rpc('gx_save_state', { p_import_id: importId, p_settings: settingsOf(p.S) }));
  const r = Array.isArray(rows) ? rows[0] : rows;
  if (!r) {
    const m = await getMeta();
    throw new AppError('conflict', 409, `Data terbaru sudah berganti (import #${m.import_id}). Halaman memuat data terbaru dulu.`);
  }
  return { ok: true, kind: 'state', import_id: r.import_id, revision: r.revision, at: ms(r.updated_at) };
}

export async function saveSnapshot(p, title, auto) {
  const pk = packDatasets(p.DS);
  const rows = must(await db().rpc('gx_save_snapshot', { p_hash: pk.hash, p_datasets_gz: pk.b64, p_size: pk.size, p_summary: pk.summary, p_settings: settingsOf(p.S), p_title: String(title || 'Report').slice(0, 200), p_auto: !!auto }));
  const r = Array.isArray(rows) ? rows[0] : rows;
  return { ok: true, id: String(r.id), at: ms(r.created_at), title, auto: !!auto };
}

export async function listSnapshots() {
  const rows = must(await db().from('report_snapshots').select('id,created_at,title,auto,report_imports(size_bytes)').order('created_at', { ascending: false }).limit(100));
  return rows.map(x => ({ id: String(x.id), at: ms(x.created_at), title: x.title, auto: x.auto, size: x.report_imports ? x.report_imports.size_bytes : 0 }));
}

export async function getSnapshot(id) {
  if (!/^\d{1,18}$/.test(String(id || ''))) throw new AppError('not-found', 404, 'Riwayat tidak ditemukan.');
  const row = must(await db().from('report_snapshots').select('id,created_at,settings,import_id,report_imports(datasets_gz)').eq('id', id).maybeSingle());
  if (!row || !row.report_imports) throw new AppError('not-found', 404, 'Riwayat tidak ditemukan.');
  return buildPayload({ at: ms(row.created_at), import_id: row.import_id, revision: 0, settings: row.settings, datasets_gz: row.report_imports.datasets_gz });
}

export async function deleteSnapshot(id) {
  if (!/^\d{1,18}$/.test(String(id || ''))) throw new AppError('bad-id', 400, 'ID riwayat tidak valid.');
  must(await db().from('report_snapshots').delete().eq('id', id));
  return { ok: true };
}
