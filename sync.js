/* GX27 Sync — Supabase (Auth, Database, Storage, Realtime) and the Vercel deploy endpoints.
   Every method returns a Promise and rejects with an Error that has a readable message.

   Database (see supabase/schema.sql)
     site_content       'draft' (admins/editors) and 'published' (public) rows, data = whole dashboard JSON
     content_versions   every saved draft (append-only)
     site_admins        email → role 'admin' | 'editor'
     publish_log        save / publish / deploy history
   All writes go through RPC functions that check the role server-side. */
(function () {
  'use strict';
  var cfg = window.GX27_CONFIG || null;
  var Sync = {
    hasConfig: !!cfg,
    configured: !!(cfg && cfg.configured),
    libLoaded: !!(window.supabase && window.supabase.createClient),
    deployHook: !!(cfg && cfg.deployHook),
    deployStatusEnabled: !!(cfg && cfg.deployStatus),
    googleLogin: !!(cfg && cfg.googleLogin),
    provider: 'supabase'
  };
  Sync.ready = Sync.configured && Sync.libLoaded;
  window.GX27Sync = Sync;
  if (!Sync.ready) return;

  var client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' }
  });
  Sync.client = client;
  var BUCKET = 'site-assets';

  function friendly(msg) {
    msg = String(msg || '');
    if (/not_authorized|permission denied|row-level security/i.test(msg)) return 'Akun ini tidak punya izin untuk aksi ini.';
    if (/self_change/.test(msg)) return 'Role akunmu sendiri tidak bisa diubah atau dihapus dari sini (supaya selalu ada admin).';
    if (/last_admin/.test(msg)) return 'Harus ada minimal satu admin.';
    if (/no_draft/.test(msg)) return 'Belum ada draft tersimpan. Simpan dulu sebelum publish.';
    if (/invalid_email/.test(msg)) return 'Format email tidak valid.';
    if (/invalid_data/.test(msg)) return 'Data tidak valid (tasks/finance harus berupa daftar).';
    if (/Failed to fetch|NetworkError|network|Load failed/i.test(msg)) return 'Tidak bisa terhubung ke Supabase. Cek koneksi internet.';
    if (/JWT expired|invalid JWT|refresh_token/i.test(msg)) return 'Sesi login habis. Login ulang.';
    if (/rate limit|too many|over_email_send_rate_limit|email rate/i.test(msg)) return 'Terlalu banyak permintaan email login. Tunggu beberapa menit lalu coba lagi.';
    if (/provider is not enabled|Unsupported provider/i.test(msg)) return 'Login Google belum diaktifkan di Supabase → Authentication → Providers.';
    if (/Signups not allowed/i.test(msg)) return 'Pendaftaran akun baru dimatikan di Supabase. Minta admin membuat akun di Authentication → Users.';
    if (/could not find the function|schema cache/i.test(msg)) return 'Fungsi database belum ada. Jalankan supabase/schema.sql di SQL Editor.';
    if (/relation .* does not exist/i.test(msg)) return 'Tabel database belum ada. Jalankan supabase/schema.sql di SQL Editor.';
    return msg;
  }
  function fail(err) { var e = new Error(friendly(err && (err.message || err.error_description || err))); e.raw = err; throw e; }
  function unwrap(res) { if (res.error) fail(res.error); return res.data; }

  /* ---------- Auth ---------- */
  function session(s) { return s && s.user ? { access_token: s.access_token, user: { email: (s.user.email || '').toLowerCase() } } : null; }
  Sync.getSession = function () { return client.auth.getSession().then(function (r) { return session(unwrap(r).session); }); };
  Sync.onAuth = function (cb) {
    client.auth.onAuthStateChange(function (ev, s) {
      if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT') setTimeout(function () { cb(ev, session(s)); }, 0);
    });
  };
  Sync.signIn = function (email) {
    return client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + '/admin', shouldCreateUser: true } })
      .then(function (r) { unwrap(r); return { sent: true }; });
  };
  Sync.signInGoogle = function () {
    return client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/admin' } }).then(unwrap);
  };
  Sync.signOut = function () { return client.auth.signOut().then(function (r) { if (r && r.error) fail(r.error); }); };
  Sync.myRole = function () { return client.rpc('my_role').then(unwrap); };
  // open edit: anyone may edit without login (set by an admin; enforced by the database)
  Sync.openEdit = function () { return client.rpc('open_edit').then(unwrap).then(function (v) { return v === true; }); };
  Sync.setOpenEdit = function (on) { return client.rpc('set_open_edit', { p_value: !!on }).then(unwrap); };

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
  // Resolves to the new draft version. Rejects with .conflict = <current version> when someone else saved first.
  Sync.saveDraft = function (data, baseVersion, force) {
    return client.rpc('save_draft', { p_data: data, p_base_version: baseVersion || 0, p_force: !!force }).then(function (res) {
      if (res.error) {
        var m = /conflict:(\d+)/.exec(res.error.message || '');
        if (m) { var c = new Error('Draft di database sudah diubah orang lain (versi ' + m[1] + ').'); c.conflict = +m[1]; throw c; }
        fail(res.error);
      }
      return res.data;
    });
  };
  Sync.publish = function (note) { return client.rpc('publish_content', { p_note: note || null }).then(unwrap); };
  Sync.logEvent = function (kind, status, version, message) {
    return client.rpc('log_event', { p_kind: kind, p_status: status, p_version: version || null, p_message: message ? String(message).slice(0, 1000) : null }).then(unwrap);
  };
  Sync.listLog = function (limit) {
    return client.from('publish_log').select('kind,status,version,message,actor,created_at').order('created_at', { ascending: false }).limit(limit || 25).then(unwrap);
  };
  Sync.listVersions = function (limit) {
    return client.from('content_versions').select('version,saved_at,saved_by').order('version', { ascending: false }).limit(limit || 30).then(unwrap);
  };
  Sync.getVersion = function (v) {
    return client.from('content_versions').select('version,data,saved_at,saved_by').eq('version', v).maybeSingle().then(function (r) {
      var d = unwrap(r); if (!d) throw new Error('Versi ' + v + ' tidak ditemukan.'); return d;
    });
  };

  /* ---------- Team ---------- */
  Sync.listAdmins = function () {
    return client.from('site_admins').select('email,role,added_at,added_by').order('role').order('email').then(unwrap);
  };
  Sync.setAdmin = function (email, role) { return client.rpc('set_admin', { p_email: email, p_role: role }).then(unwrap); };
  Sync.removeAdmin = function (email) { return client.rpc('remove_admin', { p_email: email }).then(unwrap); };

  /* ---------- Logo (Supabase Storage, bucket site-assets) ----------
     Raster images are resized to fit 600×200 first so the logo loads fast everywhere. */
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      if (file.type === 'image/svg+xml') return resolve(file);
      var url = URL.createObjectURL(file), img = new Image();
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Gambar tidak valid.')); };
      img.onload = function () {
        URL.revokeObjectURL(url);
        var scale = Math.min(1, 600 / img.width, 200 / img.height), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * scale)); c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error('Gagal memproses gambar.')); }, 'image/png');
      };
      img.src = url;
    });
  }
  Sync.uploadLogo = function (file) {
    return shrink(file).then(function (blob) {
      var ext = file.type === 'image/svg+xml' ? 'svg' : 'png';
      var path = 'logo/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
      return client.storage.from(BUCKET).upload(path, blob, { contentType: ext === 'svg' ? 'image/svg+xml' : 'image/png', upsert: false, cacheControl: '31536000' })
        .then(function (r) { unwrap(r); return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl; });
    });
  };

  /* ---------- Realtime ----------
     Supabase Realtime pushes row changes over a websocket. cb() runs on every change of that row
     (callers refetch; payloads can be large). onStatus(state) gets 'live' | 'down'. */
  Sync.watch = function (id, cb, onStatus) {
    try {
      return client.channel('gx27-content-' + id)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content', filter: 'id=eq.' + id }, function () { cb(); })
        .subscribe(function (status) {
          if (!onStatus) return;
          if (status === 'SUBSCRIBED') onStatus('live');
          else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') onStatus('down');
        });
    } catch (e) { if (onStatus) onStatus('down'); return null; }
  };

  /* ---------- Vercel deploy (via our own serverless functions) ---------- */
  function authedFetch(url, opts) {
    return client.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
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
