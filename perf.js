// /api/perf — data Helpdesk Performance Report (Best Employee) per periode, disimpan di Supabase.
// GET  /api/perf?list=1             → { items:[{ period, revision, updated_at }], open }
// GET  /api/perf?period=2026-Q2     → { period, data, revision, updated_at } · 404 { error:'empty' } bila belum ada
// POST /api/perf?period=2026-Q2     → body JSON { data, revision }  · 409 bila ada perubahan lebih baru
// PUBLISH_KEY diisi → POST butuh header x-publish-key (sama dengan Helpdesk Report).
import { AppError, configured, isOpen, keyOk, db, dbError } from './_store.js';

const MAX = 3 * 1024 * 1024;
const json = (res, obj, status = 200) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(obj));
};
const okPeriod = p => typeof p === 'string' && /^\d{4}-Q[1-4]$/.test(p);

async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  let buf;
  if (req.body != null) buf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body));
  else { const c = []; for await (const x of req) c.push(Buffer.isBuffer(x) ? x : Buffer.from(x)); buf = Buffer.concat(c); }
  if (buf.length > MAX) throw new AppError('too-large', 413, 'Data terlalu besar (maks 3 MB). Perkecil foto agent.');
  try { return JSON.parse(buf.toString('utf8')); } catch { throw new AppError('bad-payload', 400, 'JSON tidak valid.'); }
}

export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams;
  try {
    if (!configured()) return json(res, { error: 'storage-not-configured', detail: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel.' }, 501);
    if (req.method === 'GET') {
      if (q.has('list')) {
        const { data, error } = await db().from('perf_reports').select('period,revision,updated_at').order('period');
        if (error) throw dbError(error);
        return json(res, { items: data || [], open: isOpen() });
      }
      const period = q.get('period');
      if (!okPeriod(period)) return json(res, { error: 'bad-period' }, 400);
      const { data, error } = await db().from('perf_reports').select('period,data,revision,updated_at').eq('period', period).maybeSingle();
      if (error) throw dbError(error);
      if (!data) return json(res, { error: 'empty', open: isOpen() }, 404);
      return json(res, { ...data, open: isOpen() });
    }
    if (req.method !== 'POST') return json(res, { error: 'method-not-allowed' }, 405);
    if (!keyOk(req.headers['x-publish-key'])) return json(res, { error: 'unauthorized' }, 401);
    if (q.has('check')) return json(res, { ok: true, open: isOpen() });
    const period = q.get('period');
    if (!okPeriod(period)) return json(res, { error: 'bad-period' }, 400);
    const body = await readJson(req);
    if (!body || typeof body.data !== 'object' || body.data === null) throw new AppError('bad-payload', 400, 'Field data wajib ada.');
    const { data, error } = await db().rpc('gx_perf_save', { p_period: period, p_data: body.data, p_revision: body.revision ?? null });
    if (error) throw dbError(error);
    if (data && data.conflict) return json(res, { error: 'conflict', revision: data.revision }, 409);
    return json(res, data);
  } catch (e) {
    if (e instanceof AppError) return json(res, { error: e.code, detail: e.detail }, e.status);
    return json(res, { error: 'server-error', detail: String((e && e.message) || e) }, 500);
  }
}
