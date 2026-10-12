/* GX27 Sync — Firebase (Firestore + Authentication) and the Vercel deploy endpoints.
   Every method returns a Promise and rejects with an Error that has a readable message.

   Firestore layout
     content/draft        { json, version, updated_at, updated_by }        editors + admins
     content/published    { json, version, source_version, updated_at, updated_by }   public read, admins write
     versions/{id}        { json, version, saved_at, saved_by }             every saved draft (never overwritten)
     log/{id}             { kind, status, version, message, actor, created_at }
     admins/{email}       { role: 'admin' | 'editor', added_at, added_by }
   Content is stored as a JSON string so the document stays one small, index-free field. */
(function () {
  'use strict';
  var cfg = window.GX27_CONFIG || null;
  var Sync = {
    hasConfig: !!cfg,
    configured: !!(cfg && cfg.configured),
    libLoaded: !!(window.firebase && window.firebase.initializeApp && window.firebase.firestore),
    deployHook: !!(cfg && cfg.deployHook),
    deployStatusEnabled: !!(cfg && cfg.deployStatus),
    provider: 'firebase'
  };
  Sync.ready = Sync.configured && Sync.libLoaded;
  window.GX27Sync = Sync;
  if (!Sync.ready) return;

  var app = window.firebase.apps && window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(cfg.firebase);
  var fs = window.firebase.firestore(app);
  var auth = window.firebase.auth ? window.firebase.auth(app) : null;
  var EMAIL_KEY = 'gx27.loginEmail';
  var MAX_BYTES = 900000; // Firestore documents are limited to 1 MiB

  function nowIso() { return new Date().toISOString(); }
  function friendly(err) {
    var code = (err && err.code) || '', msg = (err && err.message) || String(err);
    if (/permission-denied|insufficient permissions/i.test(code + msg)) return 'Akun ini tidak punya izin untuk aksi ini.';
    if (/unavailable|network|offline|Failed to fetch/i.test(code + msg)) return 'Tidak bisa terhubung ke database. Cek koneksi internet.';
    if (/auth\/invalid-email/.test(code)) return 'Format email tidak valid.';
    if (/auth\/unauthorized-continue-uri|auth\/unauthorized-domain/.test(code)) return 'Domain website belum didaftarkan di Firebase → Authentication → Settings → Authorized domains.';
    if (/auth\/operation-not-allowed/.test(code)) return 'Metode login ini belum diaktifkan di Firebase → Authentication → Sign-in method.';
    if (/auth\/popup-closed-by-user|auth\/cancelled-popup-request/.test(code)) return 'Login dibatalkan.';
    if (/auth\/invalid-action-code|auth\/expired-action-code/.test(code)) return 'Link login sudah kedaluwarsa atau sudah dipakai. Minta link baru.';
    if (/auth\/quota-exceeded/.test(code)) return 'Kuota email login Firebase hari ini habis. Pakai "Login dengan Google" atau coba lagi besok.';
    return msg.replace(/^Firebase:\s*/, '');
  }
  function fail(err) { var e = new Error(friendly(err)); e.code = err && err.code; throw e; }
  function parse(snap) {
    if (!snap || !snap.exists) return null;
    var d = snap.data(), out = { version: d.version, updated_at: d.updated_at, updated_by: d.updated_by, source_version: d.source_version };
    Object.defineProperty(out, 'data', { enumerable: true, get: function () { return JSON.parse(d.json || 'null'); } });
    return out;
  }
  function meta(snap) {
    if (!snap || !snap.exists) return null;
    var d = snap.data();
    return { version: d.version, updated_at: d.updated_at, updated_by: d.updated_by, source_version: d.source_version };
  }
  function pad(v) { return String(v).padStart(6, '0'); }

  /* ---------- Auth ---------- */
  var currentUser = null, firstAuth = null;
  var authReady = new Promise(function (resolve) { firstAuth = resolve; });
  var authListeners = [];
  if (auth) {
    // Finish an email-link sign-in when the page was opened from the login email
    if (auth.isSignInWithEmailLink && auth.isSignInWithEmailLink(location.href)) {
      var stored = null; try { stored = localStorage.getItem(EMAIL_KEY); } catch (e) {}
      Sync.pendingLink = { email: stored };
    }
    auth.onAuthStateChanged(function (user) {
      var was = currentUser; currentUser = user || null;
      if (firstAuth) { firstAuth(); firstAuth = null; }
      authListeners.forEach(function (cb) { cb(user ? 'SIGNED_IN' : 'SIGNED_OUT', session(user), !!was); });
    });
  } else firstAuth();
  function session(user) { return user ? { user: { email: (user.email || '').toLowerCase(), verified: !!user.emailVerified } } : null; }
  function cleanLinkFromUrl() { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} }

  Sync.getSession = function () {
    return authReady.then(function () {
      if (!currentUser && Sync.pendingLink && Sync.pendingLink.email) return Sync.completeLink(Sync.pendingLink.email);
    }).then(function () { return session(currentUser); });
  };
  Sync.completeLink = function (email) {
    return auth.signInWithEmailLink(email, location.href).then(function (cred) {
      try { localStorage.removeItem(EMAIL_KEY); } catch (e) {}
      Sync.pendingLink = null; cleanLinkFromUrl(); currentUser = cred.user;
      return session(cred.user);
    }, function (err) { Sync.pendingLink = null; cleanLinkFromUrl(); fail(err); });
  };
  Sync.onAuth = function (cb) { authListeners.push(cb); };
  Sync.signIn = function (email) {
    if (Sync.pendingLink) return Sync.completeLink(email).then(function () { return { completed: true }; });
    return auth.sendSignInLinkToEmail(email, { url: location.origin + '/admin', handleCodeInApp: true }).then(function () {
      try { localStorage.setItem(EMAIL_KEY, email); } catch (e) {}
      return { sent: true };
    }, fail);
  };
  Sync.signInGoogle = function () {
    var provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return auth.signInWithPopup(provider).then(function (cred) { currentUser = cred.user; return session(cred.user); }, function (err) {
      if (err && /popup-blocked|operation-not-supported-in-this-environment/.test(err.code || '')) return auth.signInWithRedirect(provider);
      fail(err);
    });
  };
  Sync.signOut = function () { return auth.signOut().catch(fail); };
  Sync.myRole = function () {
    if (!currentUser || !currentUser.email) return Promise.resolve(null);
    if (!currentUser.emailVerified) return Promise.resolve(null);
    return fs.doc('admins/' + currentUser.email.toLowerCase()).get().then(function (s) {
      var r = s.exists ? s.data().role : null;
      return r === 'admin' || r === 'editor' ? r : null;
    }, function (err) { if (err && err.code === 'permission-denied') return null; fail(err); });
  };
  function me() { return currentUser ? (currentUser.email || '').toLowerCase() : ''; }

  /* ---------- Content ---------- */
  Sync.loadDraft = function () { return fs.doc('content/draft').get().then(parse, fail); };
  Sync.loadPublished = function () { return fs.doc('content/published').get().then(parse, fail); };
  Sync.loadPublishedMeta = function () { return fs.doc('content/published').get().then(meta, fail); };
  Sync.loadDraftMeta = function () { return fs.doc('content/draft').get().then(meta, fail); };

  // Resolves to the new draft version. Rejects with .conflict = <current version> when someone else saved first.
  Sync.saveDraft = function (data, baseVersion, force) {
    var json = JSON.stringify(data);
    if (json.length > MAX_BYTES) return Promise.reject(new Error('Data terlalu besar untuk satu dokumen Firestore (' + Math.round(json.length / 1024) + ' KB, maksimal ±900 KB). Kurangi ukuran logo atau hapus data yang tidak perlu.'));
    var draftRef = fs.doc('content/draft'), email = me(), at = nowIso();
    // If the draft doc was ever removed, continue numbering after the newest saved version
    return fs.collection('versions').orderBy('version', 'desc').limit(1).get().then(function (vs) {
      var maxSaved = vs.empty ? 0 : (vs.docs[0].data().version || 0);
      return fs.runTransaction(function (tx) {
        return tx.get(draftRef).then(function (snap) {
          var cur = snap.exists ? snap.data().version : 0;
          if (snap.exists && !force && cur !== (baseVersion || 0)) { var c = new Error('conflict'); c.conflict = cur; throw c; }
          var next = Math.max(cur, snap.exists ? 0 : maxSaved) + 1;
          tx.set(draftRef, { json: json, version: next, updated_at: at, updated_by: email });
          tx.set(fs.collection('versions').doc('v' + pad(next) + '-' + Date.now()), { json: json, version: next, saved_at: at, saved_by: email });
          tx.set(fs.collection('log').doc(), { kind: 'save', status: 'Saved', version: next, message: null, actor: email, created_at: at });
          return next;
        });
      });
    }).catch(function (err) {
      if (err && err.conflict != null) { var e = new Error('Draft di database sudah diubah orang lain (versi ' + err.conflict + ').'); e.conflict = err.conflict; throw e; }
      fail(err);
    });
  };
  Sync.publish = function (note) {
    var draftRef = fs.doc('content/draft'), pubRef = fs.doc('content/published'), email = me(), at = nowIso();
    return fs.runTransaction(function (tx) {
      return Promise.all([tx.get(draftRef), tx.get(pubRef)]).then(function (r) {
        var d = r[0], p = r[1];
        if (!d.exists) throw new Error('Belum ada draft tersimpan. Simpan dulu sebelum publish.');
        var dv = d.data();
        tx.set(pubRef, { json: dv.json, version: p.exists ? (p.data().version || 0) + 1 : 1, source_version: dv.version, updated_at: at, updated_by: email });
        tx.set(fs.collection('log').doc(), { kind: 'content', status: 'Published', version: dv.version, message: note || null, actor: email, created_at: at });
        return { source_version: dv.version, published_at: at, published_by: email };
      });
    }).catch(fail);
  };
  Sync.logEvent = function (kind, status, version, message) {
    return fs.collection('log').add({ kind: kind, status: status, version: version || null, message: message ? String(message).slice(0, 1000) : null, actor: me(), created_at: nowIso() }).catch(fail);
  };
  Sync.listLog = function (limit) {
    return fs.collection('log').orderBy('created_at', 'desc').limit(limit || 25).get().then(function (s) { return s.docs.map(function (d) { return d.data(); }); }, fail);
  };
  Sync.listVersions = function (limit) {
    return fs.collection('versions').orderBy('version', 'desc').limit(limit || 30).get().then(function (s) {
      return s.docs.map(function (d) { var x = d.data(); return { version: x.version, saved_at: x.saved_at, saved_by: x.saved_by }; });
    }, fail);
  };
  Sync.getVersion = function (v) {
    return fs.collection('versions').where('version', '==', v).limit(1).get().then(function (s) {
      if (s.empty) throw new Error('Versi ' + v + ' tidak ditemukan.');
      var x = s.docs[0].data();
      return { version: x.version, data: JSON.parse(x.json), saved_at: x.saved_at, saved_by: x.saved_by };
    }).catch(function (err) { if (err && err.code) fail(err); throw err; });
  };

  /* ---------- Team ---------- */
  Sync.listAdmins = function () {
    return fs.collection('admins').get().then(function (s) {
      return s.docs.map(function (d) { var x = d.data(); return { email: d.id, role: x.role, added_at: x.added_at || null, added_by: x.added_by || null }; })
        .sort(function (a, b) { return a.role === b.role ? a.email.localeCompare(b.email) : (a.role === 'admin' ? -1 : 1); });
    }, fail);
  };
  Sync.setAdmin = function (email, role) {
    email = String(email || '').trim().toLowerCase();
    if (email === me()) return Promise.reject(new Error('Role akunmu sendiri tidak bisa diubah dari sini (supaya selalu ada minimal satu admin).'));
    var ref = fs.doc('admins/' + email);
    return ref.get().then(function (s) {
      var data = s.exists ? { role: role, added_at: s.data().added_at || nowIso(), added_by: s.data().added_by || me() } : { role: role, added_at: nowIso(), added_by: me() };
      return ref.set(data);
    }).catch(fail);
  };
  Sync.removeAdmin = function (email) {
    email = String(email || '').toLowerCase();
    if (email === me()) return Promise.reject(new Error('Akunmu sendiri tidak bisa dihapus dari sini (supaya selalu ada minimal satu admin).'));
    return fs.doc('admins/' + email).delete().catch(fail);
  };

  /* ---------- Logo ----------
     Stored inside the content as a small data URL (Firebase Storage needs a paid plan).
     Raster images are resized to fit 600×200 so the content stays small. */
  Sync.uploadLogo = function (file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('File tidak bisa dibaca.')); };
      reader.onload = function () {
        var url = reader.result;
        if (file.type === 'image/svg+xml') {
          if (url.length > 200000) return reject(new Error('SVG terlalu besar (maks ±150 KB).'));
          return resolve(url);
        }
        var img = new Image();
        img.onerror = function () { reject(new Error('Gambar tidak valid.')); };
        img.onload = function () {
          var scale = Math.min(1, 600 / img.width, 200 / img.height);
          var c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.width * scale)); c.height = Math.max(1, Math.round(img.height * scale));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var out = c.toDataURL('image/png');
          if (out.length > 300000) out = c.toDataURL('image/webp', 0.9);
          if (out.length > 300000) return reject(new Error('Logo masih terlalu besar setelah dikecilkan. Pakai gambar yang lebih sederhana.'));
          resolve(out);
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    });
  };

  /* ---------- Realtime ---------- */
  Sync.watch = function (id, cb) {
    var first = true;
    try {
      return fs.doc('content/' + id).onSnapshot(function () { if (first) { first = false; return; } cb(); }, function () {});
    } catch (e) { return null; }
  };

  /* ---------- Vercel deploy (via our own serverless functions) ---------- */
  function authedFetch(url, opts) {
    if (!currentUser) return Promise.reject(new Error('Login dulu.'));
    return currentUser.getIdToken().then(function (token) {
      opts = opts || {};
      opts.headers = Object.assign({ Authorization: 'Bearer ' + token }, opts.headers || {});
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
