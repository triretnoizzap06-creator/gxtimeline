// /api/health — quick setup check. Open it in a browser. Never prints keys.
import { configured, db, dbError, env, isOpen } from './_store.js';

export default async function handler(req, res) {
  const e = env();
  const out = { server: 'ok', node: process.version, supabaseUrl: !!e.url, supabaseServiceKey: !!e.key, publishKey: !!e.publishKey, openMode: isOpen(), database: 'not-tested' };
  if (!configured()) {
    out.database = 'not-configured';
    out.hint = 'Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di Vercel → Settings → Environment Variables, lalu Redeploy.';
  } else {
    try {
      const sb = db();
      for (const t of ['report_imports', 'report_state', 'report_snapshots']) {
        const r = await sb.from(t).select('id', { count: 'exact' }).limit(1);
        if (r.error) throw dbError(r.error);
        out[t] = r.count ?? 0;
      }
      // the functions exist? (import id -1 never matches → no change)
      const f = await sb.rpc('gx_save_state', { p_import_id: -1, p_settings: {} });
      if (f.error) throw dbError(f.error);
      const st = await sb.from('report_state').select('import_id,revision,updated_at').eq('id', 1).maybeSingle();
      if (st.error) throw dbError(st.error);
      const pf = await sb.from('perf_reports').select('period', { count: 'exact' }).limit(1);
      if (pf.error) {
        out.performanceTable = 'missing';
        out.performanceHint = 'Tabel Helpdesk Performance belum ada: jalankan perf-schema.sql di Supabase → SQL Editor.';
      } else out.performanceTable = 'ok · ' + (pf.count ?? 0) + ' periode';
      const em = await sb.from('hd_employees').select('id', { count: 'exact' }).limit(1);
      if (em.error) { out.directoryTable = 'missing'; out.directoryHint = 'Tabel Employee Directory belum ada: jalankan directory-schema.sql di Supabase → SQL Editor.'; }
      else out.directoryTable = 'ok · ' + (em.count ?? 0) + ' karyawan';
      out.database = 'ok';
      out.latestReport = st.data && st.data.import_id ? { importId: st.data.import_id, revision: st.data.revision, savedAt: st.data.updated_at } : null;
      out.hint = out.latestReport ? 'Semua siap. Semua yang membuka web melihat report terbaru ini.' : 'Semua siap. Import data sekali di web; report langsung terlihat oleh semua orang.';
    } catch (err) {
      out.database = 'error';
      out.error = err.code || 'db-error';
      out.detail = err.detail || String(err.message || err);
      out.hint = err.code === 'schema-missing' ? 'Jalankan supabase/schema.sql di Supabase → SQL Editor, lalu muat ulang halaman ini.'
        : err.code === 'supabase-auth' ? 'Pakai kunci service_role / secret (bukan anon / publishable) untuk SUPABASE_SERVICE_ROLE_KEY, lalu Redeploy.'
        : 'Database error — lihat detail.';
    }
  }
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(out, null, 2));
}
