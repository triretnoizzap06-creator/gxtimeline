// /api/report — shared report data (Supabase via api/_store.js). Keys stay on the server.
//
// GET  /api/report               → latest report (gzip JSON) · headers x-published-at, x-import-id, x-revision
//                                  404 { error:'empty', open } when nothing has been imported yet
// GET  /api/report?meta=1        → { empty, at, import_id, revision, open }   (cheap update check)
// GET  /api/report?history=1     → { items:[{ id, at, title, auto, size }], open }
// GET  /api/report?snap=<id>     → one history snapshot (gzip JSON)
// POST /api/report?type=import   → body gzip { S, DS }        new import → latest report for everyone
// POST /api/report?type=state    → body gzip { S, import_id } fills/settings; 409 if a newer import replaced it
// POST /api/report?snap=1&title=…&auto=0|1 → body gzip { S, DS } save to history
// POST /api/report?del=<id>      → delete a history snapshot
// POST /api/report?check=1       → password check only
// PUBLISH_KEY set → every POST needs header x-publish-key. Not set → open mode (anyone using the site can save).
import { AppError, configured, isOpen, keyOk, getMeta, getLatest, publishImport, saveState, saveSnapshot, listSnapshots, getSnapshot, deleteSnapshot, parseGzJson } from './_store.js';

const send = (res, status, body, headers = {}) => {
  res.statusCode = status;
  for (const [k, v] of Object.entries({ 'cache-control': 'no-store', ...headers })) res.setHeader(k, v);
  res.end(body);
};
const json = (res, obj, status = 200) => send(res, status, JSON.stringify(obj), { 'content-type': 'application/json' });
const bytes = (res, buf, headers = {}) => send(res, 200, buf, { 'content-type': 'application/octet-stream', ...headers });

async function readBody(req) {
  if (req.body != null && (Buffer.isBuffer(req.body) || typeof req.body === 'string')) return Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body, 'binary');
  const chunks = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams;
  try {
    if (req.method === 'GET' || req.method === 'HEAD') {
      if (!configured()) return json(res, { error: 'storage-not-configured', detail: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel.' }, 501);
      if (q.has('meta')) return json(res, { ...(await getMeta()), open: isOpen() });
      if (q.has('history')) return json(res, { items: await listSnapshots(), open: isOpen() });
      if (q.has('snap')) return bytes(res, await getSnapshot(q.get('snap')));
      const l = await getLatest();
      if (!l) return json(res, { error: 'empty', open: isOpen() }, 404);
      return bytes(res, l.body, { 'x-published-at': String(l.at), 'x-import-id': String(l.import_id), 'x-revision': String(l.revision) });
    }
    if (req.method !== 'POST') return json(res, { error: 'method-not-allowed' }, 405);
    if (!keyOk(req.headers['x-publish-key'])) return json(res, { error: 'unauthorized' }, 401);
    if (q.has('check')) return json(res, { ok: true, storage: configured(), open: isOpen() });
    if (!configured()) return json(res, { error: 'storage-not-configured', detail: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel.' }, 501);
    if (q.has('del')) return json(res, await deleteSnapshot(q.get('del')));
    const p = parseGzJson(await readBody(req));
    if (q.has('snap')) return json(res, await saveSnapshot(p, q.get('title') || 'Report', q.get('auto') === '1'));
    const type = q.get('type') || (p.DS ? 'import' : 'state');
    if (type === 'import') return json(res, await publishImport(p));
    if (type === 'state') return json(res, await saveState(p));
    return json(res, { error: 'bad-type' }, 400);
  } catch (e) {
    if (e instanceof AppError) return json(res, { error: e.code, detail: e.detail }, e.status);
    return json(res, { error: 'server-error', detail: String((e && e.message) || e) }, 500);
  }
}
