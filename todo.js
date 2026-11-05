// /api/todo — To-do list SPV Helpdesk + dokumen (Report H1) di Supabase.
// SPV (login dashboard):
//   GET    /api/todo?month=2026-11          → { tasks, months }
//   GET    /api/todo?from=2026-07&to=2026-12 → { tasks } (Management Report H2)
//   POST   /api/todo        { task }        → simpan / tambah task          → { task }
//   POST   /api/todo        { copy:{from,to} } → salin task rutin ke bulan baru
//   POST   /api/todo        { import:[tasks] } → import awal (Monthly Tracker)
//   DELETE /api/todo?id=…
//   GET    /api/todo?doc=spv-h1-2026        → { data, revision }   ·   POST { doc, data, revision }
//   GET    /api/todo?doc=knowledge-base     → dibaca tim tanpa login (Knowledge Base, team-tools); POST tetap wajib login
//   GET    /api/todo?secrets=HD             → password tools tim (SPV / cookie tim GX_TEAM_PASSWORD)
// Tim (tanpa login, hanya task yang di-assign ke timnya):
//   GET    /api/todo?team=HD|AM             → { tasks }
//   PATCH  /api/todo?id=…&team=HD  { status, team_note, team_by }
import { AppError, configured, db, dbError } from './_store.js';
import { authed, teamAuthed } from './_auth.js';

const STATUS = ['NOT STARTED', 'PLAN', 'IN PROGRESS', 'DONE'];
const PRIO = ['High', 'Medium', 'Low'];
const SECTIONS = ['DAILY', 'WEEKLY', 'MONTHLY', 'FERRE', 'ONEOFF'];
const RECURRING = ['DAILY', 'WEEKLY', 'MONTHLY', 'FERRE'];
const TEAMS = ['HD', 'AM'];
const PUBLIC_DOCS = ['knowledge-base', 'team-tools'];
/* Snapshot Management Report (mr-h2-2026, mr-h1-2026, …) dibaca lewat link viewer tanpa login */
const isPublicDoc = k => PUBLIC_DOCS.includes(k) || (typeof k === 'string' && /^mr-[a-z0-9-]{3,30}$/.test(k));
/* due date ikut bergeser 1 bulan saat task rutin disalin (tgl 31 → akhir bulan) */
const shiftDue = (d, to) => {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const [y, m] = to.split('-').map(Number), last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${to}-${String(Math.min(+d.slice(8, 10), last)).padStart(2, '0')}`;
};
const okMonth = m => typeof m === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(m);
const okDoc = k => typeof k === 'string' && /^[a-z0-9-]{3,40}$/.test(k);
const str = (v, n) => String(v == null ? '' : v).slice(0, n);
const TEAM_COLS = 'id,month,section,category,title,links,priority,status,remarks,assignee,team,due,team_note,team_by,updated_at';

const json = (res, obj, status = 200) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(obj));
};
async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  let buf;
  if (req.body != null) buf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body));
  else { const c = []; for await (const x of req) c.push(Buffer.isBuffer(x) ? x : Buffer.from(x)); buf = Buffer.concat(c); }
  if (buf.length > 2 * 1024 * 1024) throw new AppError('too-large', 413, 'Data terlalu besar.');
  try { return JSON.parse(buf.toString('utf8') || '{}'); } catch { throw new AppError('bad-payload', 400, 'JSON tidak valid.'); }
}
function cleanLinks(a) {
  return (Array.isArray(a) ? a : []).slice(0, 12).map(l => ({ label: str(l && l.label, 120), url: str(l && l.url, 1000).trim() }))
    .filter(l => /^https?:\/\/[^\s]+$/i.test(l.url));
}
function clean(t) {
  const team = TEAMS.includes(t.team) ? t.team : null;
  const out = {
    month: okMonth(t.month) ? t.month : null,
    section: SECTIONS.includes(t.section) ? t.section : 'ONEOFF',
    sort: Number.isFinite(+t.sort) ? Math.round(+t.sort) : 0,
    category: str(t.category, 40),
    title: str(t.title, 500).trim(),
    links: cleanLinks(t.links),
    priority: PRIO.includes(t.priority) ? t.priority : 'Medium',
    status: STATUS.includes(t.status) ? t.status : 'NOT STARTED',
    remarks: str(t.remarks, 4000),
    assignee: str(t.assignee, 80),
    team,
    due: /^\d{4}-\d{2}-\d{2}$/.test(t.due || '') ? t.due : null,
  };
  if (!out.month) throw new AppError('bad-month', 400, 'Bulan tidak valid.');
  if (!out.title) throw new AppError('bad-title', 400, 'Judul task wajib diisi.');
  return out;
}
const must = ({ data, error }) => { if (error) throw dbError(error); return data; };

export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams;
  try {
    if (!configured()) return json(res, { error: 'storage-not-configured', detail: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel.' }, 501);
    const team = q.get('team');

    /* ---------- akses tim (tanpa login) ---------- */
    if (team) {
      if (!TEAMS.includes(team)) return json(res, { error: 'bad-team' }, 400);
      if (req.method === 'GET') {
        const since = new Date(Date.now() - 62 * 864e5).toISOString();
        const rows = must(await db().from('gx_tasks').select(TEAM_COLS).eq('team', team).or(`status.neq.DONE,updated_at.gte.${since}`).order('due', { ascending: true, nullsFirst: false }).order('updated_at', { ascending: false }).limit(300));
        return json(res, { tasks: rows || [] });
      }
      if (req.method === 'PATCH') {
        const id = q.get('id'); if (!id) return json(res, { error: 'bad-id' }, 400);
        const b = await readJson(req);
        const cur = must(await db().from('gx_tasks').select('id,team').eq('id', id).maybeSingle());
        if (!cur || cur.team !== team) return json(res, { error: 'not-found' }, 404);
        const upd = { team_note: str(b.team_note, 2000), team_by: str(b.team_by, 80) };
        if (STATUS.includes(b.status)) upd.status = b.status;
        const row = must(await db().from('gx_tasks').update(upd).eq('id', id).select(TEAM_COLS).single());
        return json(res, { task: row });
      }
      return json(res, { error: 'method' }, 405);
    }

    /* ---------- Password tools tim: hanya SPV atau tim yang sudah memasukkan password tim ---------- */
    if (req.method === 'GET' && q.get('secrets')) {
      const team = q.get('secrets');
      if (!TEAMS.includes(team)) return json(res, { error: 'bad-team' }, 400);
      if (!authed(req) && !teamAuthed(req)) return json(res, { error: 'team-login-required' }, 401);
      const row = must(await db().from('gx_docs').select('data').eq('key', 'team-secrets').maybeSingle());
      return json(res, { secrets: (row && row.data && row.data[team]) || {} });
    }
    /* ---------- Knowledge Base: boleh dibaca tim tanpa login (edit tetap wajib login SPV) ---------- */
    if (req.method === 'GET' && isPublicDoc(q.get('doc'))) {
      const row = must(await db().from('gx_docs').select('data,revision,updated_at').eq('key', q.get('doc')).maybeSingle());
      return row ? json(res, { ...row, canEdit: authed(req) }) : json(res, { error: 'empty', canEdit: authed(req) }, 404);
    }

    /* ---------- SPV (wajib login) ---------- */
    if (!authed(req)) return json(res, { error: 'login-required' }, 401);

    if (req.method === 'GET') {
      const doc = q.get('doc');
      if (doc) {
        if (!okDoc(doc)) return json(res, { error: 'bad-doc' }, 400);
        const row = must(await db().from('gx_docs').select('data,revision,updated_at').eq('key', doc).maybeSingle());
        return row ? json(res, row) : json(res, { error: 'empty' }, 404);
      }
      const from = q.get('from'), to = q.get('to');
      if (okMonth(from) && okMonth(to)) {
        if (from > to) return json(res, { error: 'bad-month' }, 400);
        const rows = must(await db().from('gx_tasks').select('*').gte('month', from).lte('month', to).order('month').order('section').order('sort').order('created_at').limit(3000));
        return json(res, { tasks: rows || [] });
      }
      const month = q.get('month');
      const mrows = must(await db().from('gx_tasks').select('month').limit(5000));
      const months = [...new Set((mrows || []).map(r => r.month))].sort();
      if (!okMonth(month)) return json(res, { tasks: [], months });
      const rows = must(await db().from('gx_tasks').select('*').eq('month', month).order('section').order('sort').order('created_at'));
      return json(res, { tasks: rows || [], months });
    }
    if (req.method === 'DELETE') {
      const id = q.get('id'); if (!id) return json(res, { error: 'bad-id' }, 400);
      must(await db().from('gx_tasks').delete().eq('id', id));
      return json(res, { ok: true });
    }
    if (req.method === 'POST') {
      const b = await readJson(req);
      if (b.doc) {
        if (!okDoc(b.doc) || !b.data || typeof b.data !== 'object') return json(res, { error: 'bad-doc' }, 400);
        const r = must(await db().rpc('gx_doc_save', { p_key: b.doc, p_data: b.data, p_revision: b.revision ?? null }));
        if (r && r.conflict) return json(res, { error: 'conflict', revision: r.revision }, 409);
        return json(res, r);
      }
      if (b.copy) {
        const { from, to } = b.copy;
        if (!okMonth(from) || !okMonth(to) || from === to) return json(res, { error: 'bad-month' }, 400);
        const exist = must(await db().from('gx_tasks').select('id').eq('month', to).limit(1));
        if (exist && exist.length) return json(res, { error: 'target-not-empty', detail: 'Bulan tujuan sudah punya task.' }, 409);
        const src = must(await db().from('gx_tasks').select('*').eq('month', from).in('section', RECURRING));
        const rows = (src || []).map(t => ({ ...clean({ ...t, month: to, status: 'NOT STARTED', due: shiftDue(t.due, to) }), team_note: '', team_by: '' }));
        if (rows.length) must(await db().from('gx_tasks').insert(rows));
        return json(res, { ok: true, copied: rows.length });
      }
      if (Array.isArray(b.import)) {
        const rows = b.import.slice(0, 500).map(clean);
        const months = [...new Set(rows.map(r => r.month))];
        const exist = must(await db().from('gx_tasks').select('id').in('month', months).limit(1));
        if (exist && exist.length) return json(res, { error: 'target-not-empty', detail: 'Bulan ini sudah punya task — import dibatalkan supaya tidak dobel.' }, 409);
        if (rows.length) must(await db().from('gx_tasks').insert(rows));
        return json(res, { ok: true, imported: rows.length });
      }
      if (b.task) {
        const t = clean(b.task);
        if (b.task.id) {
          const row = must(await db().from('gx_tasks').update(t).eq('id', b.task.id).select('*').single());
          return json(res, { task: row });
        }
        const row = must(await db().from('gx_tasks').insert(t).select('*').single());
        return json(res, { task: row });
      }
      return json(res, { error: 'bad-payload' }, 400);
    }
    return json(res, { error: 'method' }, 405);
  } catch (e) {
    const err = e instanceof AppError ? e : dbError(e);
    return json(res, { error: err.code || 'error', detail: err.detail || String(e.message || e) }, err.status || 500);
  }
}
