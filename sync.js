/* GX27 Sync — thin wrapper around Supabase (database, login, storage, realtime)
   and the Vercel deploy endpoints. Every method returns a Promise and throws an Error
   with a readable message on failure. */
(function () {
  'use strict';
  var cfg = window.GX27_CONFIG || null;
  var Sync = {
    hasConfig: !!cfg,
    configured: !!(cfg && cfg.configured),
    libLoaded: !!(window.supabase && window.supabase.createClient),
    deployHook: !!(cfg && cfg.deployHook),
    deployStatusEnabled: !!(cfg && cfg.deployStatus)
  };
  Sync.ready = Sync.configured && Sync.libLoaded;
  window.GX27Sync = Sync;
  if (!Sync.ready) return;

  var client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' }
  });
  Sync.client = client;

  function unwrap(res) {
    if (res.error) { var e = new Error(friendly(res.error.message || String(res.error))); e.raw = res.error; throw e; }
    return res.data;
  }
  function friendly(msg) {
    if (/not_authorized/.test(msg)) return 'Akun ini tidak punya izin untuk aksi ini.';
    if (/last_admin/.test(msg)) return 'Harus ada minimal satu admin.';
    if (/no_draft/.test(msg)) return 'Belum ada draft tersimpan. Simpan dulu sebelum publish.';
    if (/Failed to fetch|NetworkError|network/i.test(msg)) return 'Tidak bisa terhubung ke database. Cek koneksi internet.';
    if (/JWT expired|invalid JWT/i.test(msg)) return 'Sesi login habis. Login ulang.';
    return msg;
  }

  /* ---------- Auth ---------- */
  Sync.getSession = function () { return client.auth.getSession().then(function (r) { return unwrap(r).session; }); };
  Sync.onAuth = function (cb) { return client.auth.onAuthStateChange(function (ev, session) { cb(ev, session); }); };
  Sync.signIn = function (email) {
    return client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + '/admin', shouldCreateUser: true } }).then(unwrap);
  };
  Sync.signOut = function () { return client.auth.signOut().then(unwrap); };
  Sync.myRole = function () { return client.rpc('my_role').then(unwrap); };

  /* ---------- Content ---------- */
  Sync.loadDraft = function () {
    return client.from('site_content').select('data,version,updated_at,updated_by').eq('id', 'draft').maybeSingle().then(unwrap);
  };
  Sync.loadPublished = function () {
    return client.from('site_content').select('data,version,source_version,updated_at,updated_by').eq('id', 'published').maybeSingle().then(unwrap);
  };
  Sync.loadPublishedMeta = function () {
    return client.from('site_content').select('version,source_version,updated_at,updated_by').eq('id', 'published').maybeSingle().then(unwrap);
  };
  Sync.loadDraftMeta = function () {
    return client.from('site_content').select('version,updated_at,updated_by').eq('id', 'draft').maybeSingle().then(unwrap);
  };
  // Returns the new draft version. Throws an Error with .conflict = <current version> when someone else saved first.
  Sync.saveDraft = function (data, baseVersion, force) {
    return client.rpc('save_draft', { p_data: data, p_base_version: baseVersion || 0, p_force: !!force }).then(function (res) {
      if (res.error) {
        var m = /conflict:(\d+)/.exec(res.error.message || '');
        var e = new Error(m ? 'Draft di database sudah diubah orang lain (versi ' + m[1] + ').' : friendly(res.error.message));
        if (m) e.conflict = +m[1];
        throw e;
      }
      return res.data;
    });
  };
  Sync.publish = function (note) { return client.rpc('publish_content', { p_note: note || null }).then(unwrap); };
  Sync.logEvent = function (kind, status, version, message) {
    return client.rpc('log_event', { p_kind: kind, p_status: status, p_version: version || null, p_message: message || null }).then(unwrap);
  };
  Sync.listLog = function (limit) {
    return client.from('publish_log').select('*').order('created_at', { ascending: false }).limit(limit || 25).then(unwrap);
  };
  Sync.listVersions = function (limit) {
    return client.from('content_versions').select('version,saved_at,saved_by').order('version', { ascending: false }).limit(limit || 30).then(unwrap);
  };
  Sync.getVersion = function (v) {
    return client.from('content_versions').select('version,data,saved_at,saved_by').eq('version', v).single().then(unwrap);
  };

  /* ---------- Team ---------- */
  Sync.listAdmins = function () { return client.from('site_admins').select('*').order('role').order('email').then(unwrap); };
  Sync.setAdmin = function (email, role) { return client.rpc('set_admin', { p_email: email, p_role: role }).then(unwrap); };
  Sync.removeAdmin = function (email) { return client.rpc('remove_admin', { p_email: email }).then(unwrap); };

  /* ---------- Storage ---------- */
  Sync.uploadLogo = function (file) {
    var safe = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-').slice(-60);
    var path = 'logo/' + Date.now() + '-' + safe;
    return client.storage.from('site-assets').upload(path, file, { contentType: file.type, upsert: false }).then(function (res) {
      unwrap(res);
      return client.storage.from('site-assets').getPublicUrl(path).data.publicUrl;
    });
  };

  /* ---------- Realtime ---------- */
  // cb is called when the row changes; callers refetch (payloads can be large).
  Sync.watch = function (id, cb) {
    try {
      return client.channel('site-content-' + id)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content', filter: 'id=eq.' + id }, function () { cb(); })
        .subscribe();
    } catch (e) { return null; }
  };

  /* ---------- Vercel deploy (via our own serverless functions) ---------- */
  function authedFetch(url, opts) {
    return Sync.getSession().then(function (s) {
      if (!s) throw new Error('Login dulu.');
      opts = opts || {};
      opts.headers = Object.assign({ Authorization: 'Bearer ' + s.access_token }, opts.headers || {});
      return fetch(url, opts);
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        if (!r.ok) throw new Error(body.error || ('HTTP ' + r.status));
        return body;
      });
    });
  }
  Sync.triggerDeploy = function () { return authedFetch('/api/deploy', { method: 'POST' }); };
  Sync.deployStatus = function () { return authedFetch('/api/deploy-status'); };
})();
