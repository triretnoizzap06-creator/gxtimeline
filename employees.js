// /api/employees — Helpdesk Employee Directory (Supabase tabel hd_employees).
// GET  /api/employees              → { items:[...], open }
// POST /api/employees              → body JSON satu karyawan (tanpa id = tambah, dengan id = ubah)
// POST /api/employees?del=<id>     → hapus karyawan
// POST /api/employees?check=1      → cek password
// Data berisi tanggal lahir & kontrak, jadi bila PUBLISH_KEY diisi di Vercel, MEMBACA pun butuh password (header x-publish-key).
import { AppError, configured, isOpen, keyOk, db, dbError } from './_store.js';

const COLS = 'id,full_name,nickname,subdivision,employee_id,birthday,start_contract,end_contract,photo,active,contract_history,sort_order,updated_at';
const json = (res, obj, status = 200) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(obj));
};
const isDate = v => v === null || (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v + 'T00:00:00Z')));
const PHOTO_FILE = /^photo-[a-z0-9-]+\.jpg$/;

async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  let buf;
  if (req.body != null) buf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body));
  else { const c = []; for await (const x of req) c.push(Buffer.isBuffer(x) ? x : Buffer.from(x)); buf = Buffer.concat(c); }
  if (buf.length > 1024 * 1024) throw new AppError('too-large', 413, 'Data terlalu besar (maks 1 MB). Perkecil foto.');
  try { return JSON.parse(buf.toString('utf8')); } catch { throw new AppError('bad-payload', 400, 'JSON tidak valid.'); }
}

function clean(b) {
  const name = String(b.full_name || '').trim().replace(/\s+/g, ' ');
  if (!name) throw new AppError('bad-payload', 400, 'Nama lengkap wajib diisi.');
  const row = { full_name: name.slice(0, 120) };
  const nick = b.nickname == null ? '' : String(b.nickname).trim();
  row.nickname = nick ? nick.slice(0, 40) : null;
  const sub = b.subdivision == null ? '' : String(b.subdivision).trim();
  row.subdivision = sub ? sub.slice(0, 60) : null;
  const eid = b.employee_id == null ? null : String(b.employee_id).trim();
  if (b.employee_id !== undefined) row.employee_id = eid ? eid.slice(0, 40) : null;
  for (const k of ['birthday', 'start_contract', 'end_contract']) {
    const v = b[k] === '' || b[k] == null ? null : b[k];
    if (!isDate(v)) throw new AppError('bad-payload', 400, `Tanggal ${k} tidak valid (format YYYY-MM-DD).`);
    row[k] = v;
  }
  if (row.start_contract && row.end_contract && row.end_contract < row.start_contract) throw new AppError('bad-payload', 400, 'End Contract tidak boleh sebelum Start Contract.');
  const ph = b.photo == null ? null : String(b.photo);
  if (ph && !PHOTO_FILE.test(ph) && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(ph)) throw new AppError('bad-payload', 400, 'Foto tidak valid.');
  if (ph && ph.length > 700000) throw new AppError('too-large', 413, 'Foto terlalu besar.');
  row.photo = ph || null;
  row.active = b.active !== false;
  if (b.sort_order != null && isFinite(Number(b.sort_order))) row.sort_order = Math.round(Number(b.sort_order));
  return row;
}

export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams;
  try {
    if (!configured()) return json(res, { error: 'storage-not-configured', detail: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel.' }, 501);
    const authed = keyOk(req.headers['x-publish-key']);
    if (req.method === 'GET') {
      if (!authed) return json(res, { error: 'locked', open: false }, 401);
      const { data, error } = await db().from('hd_employees').select(COLS).order('sort_order').order('full_name');
      if (error) throw dbError(error);
      return json(res, { items: data || [], open: isOpen() });
    }
    if (req.method !== 'POST') return json(res, { error: 'method-not-allowed' }, 405);
    if (!authed) return json(res, { error: 'unauthorized' }, 401);
    if (q.has('check')) return json(res, { ok: true, open: isOpen() });
    if (q.has('del')) {
      const id = Number(q.get('del'));
      if (!Number.isInteger(id)) return json(res, { error: 'bad-id' }, 400);
      const { error } = await db().from('hd_employees').delete().eq('id', id);
      if (error) throw dbError(error);
      return json(res, { ok: true });
    }
    const body = await readJson(req);
    const row = clean(body || {});
    let r;
    if (body.id != null) {
      const id = Number(body.id);
      if (!Number.isInteger(id)) return json(res, { error: 'bad-id' }, 400);
      r = await db().from('hd_employees').update(row).eq('id', id).select(COLS).maybeSingle();
      if (!r.error && !r.data) return json(res, { error: 'not-found' }, 404);
    } else {
      r = await db().from('hd_employees').insert(row).select(COLS).single();
    }
    if (r.error) {
      if (r.error.code === '23505') return json(res, { error: 'duplicate', detail: 'Nama karyawan sudah ada.' }, 409);
      throw dbError(r.error);
    }
    return json(res, { ok: true, item: r.data });
  } catch (e) {
    if (e instanceof AppError) return json(res, { error: e.code, detail: e.detail }, e.status);
    return json(res, { error: 'server-error', detail: String((e && e.message) || e) }, 500);
  }
}
