/* GX27 Admin — login, Save (to Supabase), Publish (to the live site), settings, team,
   history, data tools and code redeploy. Loaded only by admin.html; app.js calls into it. */
(function () {
  'use strict';
  var UNSAVED_KEY = 'gx27.admin.unsaved';
  var App = null, Sync = null, watching = false, pollTimer = null;
  var S = {
    phase: 'loading',            // loading | login | sent | denied | error | init | ready
    email: '', role: null,
    draft: null,                 // { version, updated_at, updated_by }
    published: null,             // { version, source_version, updated_at, updated_by }
    dirty: false, saving: false, saveError: '',
    pub: '', pubError: '',       // '' | Publishing | Failed  (Draft / Published are derived)
    remoteNewer: null, conflictCache: null, notice: '',
    loginMsg: '', loginEmail: '', errorMsg: '',
    candidates: [],
    sideLoaded: false, log: null, versions: null, admins: null, sideErr: {},
    deploy: { status: '', msg: '', latest: null, recent: null, configured: null, startedAt: 0 }
  };
  var Admin = window.GX27Admin = {};
  function esc(s) { return App.esc(s); }
  function noop() {}
  function when(iso) { if (!iso) return '—'; var d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  function rerender() { App.render(); }

  Admin.canEdit = function () { return S.phase === 'ready' && (S.role === 'admin' || S.role === 'editor'); };
  Admin.isAdmin = function () { return S.role === 'admin'; };

  /* ================= Boot & auth ================= */
  Admin.start = function () {
    App = window.GX27App; Sync = window.GX27Sync;
    addNav();
    rerender();
    Sync.onAuth(function (ev, session) {
      if (ev === 'SIGNED_IN' && session && !S.email) init();
      if (ev === 'SIGNED_OUT') { resetState(); S.phase = 'login'; rerender(); }
    });
    init();
    window.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && Admin.canEdit()) { e.preventDefault(); save(false); }
    });
  };
  function resetState() {
    S.email = ''; S.role = null; S.draft = null; S.published = null; S.dirty = false; S.sideLoaded = false;
    S.log = S.versions = S.admins = null; S.remoteNewer = S.conflictCache = null; S.pub = '';
  }
  function addNav() {
    var nav = document.getElementById('nav');
    if (!nav || nav.querySelector('[data-page="admin"]')) return;
    var sep = document.createElement('span'); sep.className = 'sep';
    var b = document.createElement('button'); b.setAttribute('data-page', 'admin');
    b.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>Admin panel';
    nav.appendChild(sep); nav.appendChild(b);
  }
  function init() {
    S.phase = 'loading'; rerender();
    return Sync.getSession().then(function (session) {
      if (!session) { S.phase = 'login'; return; }
      S.email = (session.user && session.user.email || '').toLowerCase();
      return Sync.myRole().then(function (role) {
        S.role = role || null;
        if (!S.role) { S.phase = 'denied'; return; }
        return loadContent();
      });
    }).catch(function (err) { S.phase = 'error'; S.errorMsg = err.message; }).then(rerender);
  }
  function loadContent() {
    return Promise.all([Sync.loadDraft(), Sync.loadPublishedMeta()]).then(function (r) {
      var draft = r[0]; S.published = r[1] || null;
      if (!draft) { S.draft = null; S.candidates = findLocalData(); S.phase = 'init'; return; }
      S.draft = { version: draft.version, updated_at: draft.updated_at, updated_by: draft.updated_by };
      var cache = readUnsaved();
      if (cache && cache.email === S.email && cache.data) {
        if (cache.baseVersion === draft.version) {
          App.setDb(cache.data); S.dirty = true;
          S.notice = 'Perubahan yang belum disimpan dari sesi sebelumnya dipulihkan. Klik Save untuk menyimpannya.';
        } else { App.setDb(draft.data); S.conflictCache = cache; }
      } else App.setDb(draft.data);
      S.phase = 'ready';
      startWatching();
    });
  }
  function startWatching() {
    if (watching) return; watching = true;
    Sync.watch('draft', function () {
      if (S.saving) return;
      Sync.loadDraftMeta().then(function (meta) {
        if (!meta || !S.draft || meta.version <= S.draft.version) return;
        if (!S.dirty) {
          return Sync.loadDraft().then(function (d) {
            App.setDb(d.data); S.draft = { version: d.version, updated_at: d.updated_at, updated_by: d.updated_by };
            rerender(); App.toast('Draft diperbarui oleh ' + (d.updated_by || 'admin lain'));
          });
        }
        S.remoteNewer = meta; rerender();
      }).catch(noop);
    });
    Sync.watch('published', function () {
      Sync.loadPublishedMeta().then(function (m) { S.published = m; if (S.pub !== 'Publishing') rerender(); }).catch(noop);
    });
  }

  /* ================= Unsaved cache (survives refresh, never touches the public data) ================= */
  function readUnsaved() { try { return JSON.parse(localStorage.getItem(UNSAVED_KEY) || 'null'); } catch (e) { return null; } }
  function clearUnsaved() { try { localStorage.removeItem(UNSAVED_KEY); } catch (e) {} }
  Admin.markDirty = function (d) {
    S.dirty = true;
    try { localStorage.setItem(UNSAVED_KEY, JSON.stringify({ email: S.email, baseVersion: S.draft ? S.draft.version : 0, data: d, at: Date.now() })); } catch (e) {}
    return true;
  };
  function findLocalData() {
    var out = [];
    App.LEGACY_KEYS.forEach(function (k) {
      try {
        var d = JSON.parse(localStorage.getItem(k) || 'null');
        if (d && Array.isArray(d.tasks) && Array.isArray(d.finance)) out.push({ label: 'Data yang tersimpan di browser ini', key: k, data: d, tasks: d.tasks.length, finance: d.finance.length, at: d.savedAt });
      } catch (e) {}
    });
    var s = App.seed();
    out.push({ label: 'Data awal bawaan website (timeline + budget sheet Acara)', key: 'seed', data: s, tasks: s.tasks.length, finance: s.finance.length, at: null });
    return out;
  }

  /* ================= Save ================= */
  function snapshot() { var d = JSON.parse(JSON.stringify(App.getDb())); delete d.savedAt; return d; }
  function save(force) {
    if (!Admin.canEdit()) return Promise.resolve(false);
    if (!S.dirty && S.draft && !force) { App.toast('Tidak ada perubahan untuk disimpan.'); return Promise.resolve(true); }
    S.saving = true; S.saveError = ''; rerender();
    return Sync.saveDraft(snapshot(), S.draft ? S.draft.version : 0, !!force).then(function (v) {
      S.draft = { version: v, updated_at: new Date().toISOString(), updated_by: S.email };
      S.dirty = false; S.saving = false; S.conflictCache = null; S.remoteNewer = null; S.notice = '';
      if (S.pub === 'Failed') S.pub = '';
      clearUnsaved(); rerender(); refreshHistory();
      App.toast('Tersimpan ke database · versi ' + v);
      return true;
    }).catch(function (err) {
      S.saving = false;
      if (err.conflict) { rerender(); conflictDialog(err.conflict); return false; }
      S.saveError = err.message; rerender(); App.toast('Gagal menyimpan: ' + err.message, true);
      return false;
    });
  }
  function conflictDialog(current) {
    App.openModal('<div class="modal-h"><h3>Draft sudah diubah orang lain</h3></div><div class="modal-b one"><p style="margin:0">Draft di database sekarang versi <b>' + current + '</b>, sedangkan kamu mulai mengedit dari versi <b>' + (S.draft ? S.draft.version : 0) + '</b>.</p>' +
      '<p class="muted" style="margin:0">Versi lama tetap tersimpan di Version history, jadi pilihan apa pun tidak menghapus data.</p></div>' +
      '<div class="modal-f"><button class="btn" data-admin="load-latest">Muat versi terbaru (buang perubahanku)</button><div class="right"><button class="btn primary" data-admin="force-save">Simpan versiku sebagai terbaru</button></div></div>', 'sm', { allowReadonly: true });
  }
  function loadLatest() {
    return Sync.loadDraft().then(function (d) {
      App.setDb(d.data); S.draft = { version: d.version, updated_at: d.updated_at, updated_by: d.updated_by };
      S.dirty = false; S.remoteNewer = null; S.conflictCache = null; clearUnsaved(); App.closeModal(); rerender();
      App.toast('Draft terbaru dimuat (versi ' + d.version + ')');
    }).catch(function (e) { App.toast(e.message, true); });
  }

  /* ================= Publish ================= */
  function pubStatus() {
    if (S.pub) return S.pub;
    if (!S.published || !S.draft || S.dirty) return 'Draft';
    return S.published.source_version === S.draft.version ? 'Published' : 'Draft';
  }
  function stable(o) {
    if (Array.isArray(o)) return '[' + o.map(stable).join(',') + ']';
    if (o && typeof o === 'object') return '{' + Object.keys(o).sort().filter(function (k) { return k !== 'updatedAt' && k !== 'savedAt'; }).map(function (k) { return JSON.stringify(k) + ':' + stable(o[k]); }).join(',') + '}';
    return JSON.stringify(o);
  }
  function diff(a, b) {
    function part(key, nameKey) {
      var A = {}, B = {}, r = { added: [], removed: [], changed: [] };
      (a[key] || []).forEach(function (x) { A[x.id] = x; });
      ((b && b[key]) || []).forEach(function (x) { B[x.id] = x; });
      Object.keys(A).forEach(function (id) { if (!B[id]) r.added.push(A[id][nameKey]); else if (stable(A[id]) !== stable(B[id])) r.changed.push(A[id][nameKey]); });
      Object.keys(B).forEach(function (id) { if (!A[id]) r.removed.push(B[id][nameKey]); });
      return r;
    }
    var sa = (a && a.settings) || {}, sb = (b && b.settings) || {}, sets = [];
    Object.keys(Object.assign({}, sa, sb)).forEach(function (k) { if (stable(sa[k]) !== stable(sb[k])) sets.push(k); });
    return { tasks: part('tasks', 'name'), finance: part('finance', 'item'), settings: b ? sets : Object.keys(sa) };
  }
  function diffHtml(dd, first) {
    if (first) return '<p style="margin:0">Belum ada versi live di database. Publish pertama akan menampilkan seluruh draft ke website.</p>';
    function line(label, r) {
      var n = r.added.length + r.changed.length + r.removed.length;
      if (!n) return '<li><b>' + label + ':</b> <span class="muted">tidak ada perubahan</span></li>';
      function names(arr) { return arr.slice(0, 4).map(function (x) { return esc(x || '(tanpa nama)'); }).join(', ') + (arr.length > 4 ? ' +' + (arr.length - 4) : ''); }
      return '<li><b>' + label + ':</b> ' + [r.added.length ? r.added.length + ' baru (' + names(r.added) + ')' : '', r.changed.length ? r.changed.length + ' diubah (' + names(r.changed) + ')' : '', r.removed.length ? r.removed.length + ' dihapus (' + names(r.removed) + ')' : ''].filter(Boolean).join(' · ') + '</li>';
    }
    return '<ul class="diff-list">' + line('Tasks', dd.tasks) + line('Budget', dd.finance) + '<li><b>Settings:</b> ' + (dd.settings.length ? esc(dd.settings.join(', ')) : '<span class="muted">tidak ada perubahan</span>') + '</li></ul>';
  }
  function publishFlow() {
    if (S.role !== 'admin') { App.toast('Hanya admin yang bisa publish. Kamu login sebagai editor.', true); return; }
    var proceed = function () {
      Sync.loadPublished().then(function (p) {
        var dd = diff(App.getDb(), p ? p.data : null);
        App.openModal('<form id="publishForm"><div class="modal-h"><h3>Publish ke website live?</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one">' +
          '<p style="margin:0">Draft <b>versi ' + S.draft.version + '</b> akan menggantikan konten yang sedang tampil di website' + (p ? ' (versi ' + p.source_version + ', dipublish ' + when(p.updated_at) + ' oleh ' + esc(p.updated_by || '—') + ')' : '') + '.</p>' +
          diffHtml(dd, !p) +
          '<div class="field"><label for="pubNote">Catatan (opsional)</label><input class="input" id="pubNote" maxlength="200" placeholder="mis. Update status vendor & DP Hyrox"></div>' +
          '<p class="muted" style="margin:0;font-size:12.5px">Hanya konten (task, budget, settings, logo) yang berubah. Kode/tampilan website tidak berubah tanpa deploy dari GitHub.</p></div>' +
          '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Batal</button><button type="submit" class="btn accent">Publish sekarang</button></div></div></form>', 'sm', { allowReadonly: true });
      }).catch(function (e) { App.toast('Tidak bisa membaca versi live: ' + e.message, true); });
    };
    if (S.dirty || !S.draft) save(false).then(function (ok) { if (ok) proceed(); });
    else proceed();
  }
  function doPublish(note) {
    App.closeModal();
    S.pub = 'Publishing'; S.pubError = ''; rerender();
    Sync.publish(note).then(function (r) {
      S.published = { source_version: r.source_version, updated_at: r.published_at, updated_by: r.published_by };
      S.pub = ''; rerender(); refreshHistory();
      App.toast('Website live sudah diperbarui (versi ' + r.source_version + ')');
    }).catch(function (err) {
      S.pub = 'Failed'; S.pubError = err.message; rerender();
      App.toast('Publish gagal: ' + err.message, true);
      Sync.logEvent('content', 'Failed', S.draft ? S.draft.version : null, err.message).catch(noop);
    });
  }

  /* ================= Code redeploy (Vercel deploy hook) ================= */
  function deployFlow() {
    if (S.role !== 'admin') return;
    App.confirmDialog('Redeploy website?', 'Vercel akan build ulang website dari commit terbaru di GitHub. Pakai ini setelah ada perubahan kode yang sudah di-push. Konten (task/budget) tidak perlu redeploy — cukup Publish.', 'Redeploy', function () {
      S.deploy.status = 'Publishing'; S.deploy.msg = 'Meminta Vercel build ulang…'; S.deploy.startedAt = Date.now(); rerender();
      Sync.triggerDeploy().then(function () {
        S.deploy.msg = 'Build dimulai. Biasanya selesai dalam 30–90 detik.';
        Sync.logEvent('deploy', 'Publishing', null, 'Redeploy diminta').catch(noop);
        rerender(); pollDeploy(0);
      }).catch(function (err) {
        S.deploy.status = 'Failed'; S.deploy.msg = err.message; rerender();
        Sync.logEvent('deploy', 'Failed', null, err.message).catch(noop);
      });
    });
  }
  function pollDeploy(n) {
    clearTimeout(pollTimer);
    if (!window.GX27Sync.deployStatusEnabled) { S.deploy.status = ''; S.deploy.msg = 'Redeploy sudah diminta. Status build bisa dicek di dashboard Vercel (VERCEL_TOKEN belum diset untuk status otomatis).'; rerender(); return; }
    if (n > 60) { S.deploy.msg = 'Belum ada kabar dari Vercel setelah 5 menit. Cek dashboard Vercel.'; rerender(); return; }
    pollTimer = setTimeout(function () {
      Sync.deployStatus().then(function (r) {
        S.deploy.configured = r.configured; S.deploy.latest = r.latest; S.deploy.recent = r.recent;
        var l = r.latest, fresh = l && l.createdAt && l.createdAt >= S.deploy.startedAt - 5000;
        if (fresh && l.status === 'Published') { S.deploy.status = 'Published'; S.deploy.msg = 'Deploy selesai. Refresh website untuk melihat versi terbaru.'; Sync.logEvent('deploy', 'Published', null, l.commitMessage || '').catch(noop); rerender(); return; }
        if (fresh && l.status === 'Failed') { S.deploy.status = 'Failed'; S.deploy.msg = 'Build gagal di Vercel (' + l.state + '). Cek log di dashboard Vercel.'; Sync.logEvent('deploy', 'Failed', null, l.state).catch(noop); rerender(); return; }
        if (fresh) S.deploy.msg = 'Status Vercel: ' + l.state + '…';
        rerender(); pollDeploy(n + 1);
      }).catch(function () { pollDeploy(n + 1); });
    }, 5000);
  }

  /* ================= Side data (history, team, deploy status) ================= */
  function loadSide() {
    S.sideLoaded = true;
    var jobs = [
      Sync.listLog(25).then(function (r) { S.log = r; }, function (e) { S.sideErr.log = e.message; }),
      Sync.listVersions(30).then(function (r) { S.versions = r; }, function (e) { S.sideErr.versions = e.message; }),
      Sync.listAdmins().then(function (r) { S.admins = r; }, function (e) { S.sideErr.admins = e.message; })
    ];
    if (window.GX27Sync.deployStatusEnabled) jobs.push(Sync.deployStatus().then(function (r) { S.deploy.configured = r.configured; S.deploy.latest = r.latest; S.deploy.recent = r.recent; }, function (e) { S.sideErr.deploy = e.message; }));
    Promise.all(jobs).then(rerender);
  }
  function refreshHistory() {
    if (!S.sideLoaded) return;
    Promise.all([Sync.listLog(25).then(function (r) { S.log = r; }), Sync.listVersions(30).then(function (r) { S.versions = r; })]).then(rerender, noop);
  }
  Admin.afterRender = function () {
    if (S.phase === 'ready' && App.getPage() === 'admin' && !S.sideLoaded) loadSide();
    var em = document.getElementById('loginEmail'); if (em && !em.value && S.loginEmail) em.value = S.loginEmail;
  };

  /* ================= Gates (login, access, first-time setup) ================= */
  Admin.gate = function () {
    var back = '<a class="btn ghost" href="/">← Lihat website</a>';
    if (S.phase === 'loading') return card('Memuat admin panel…', '<p class="muted">Menghubungkan ke database.</p>');
    if (S.phase === 'error') return card('Tidak bisa memuat admin panel', '<p>' + esc(S.errorMsg) + '</p><div class="gate-actions"><button class="btn primary" data-admin="retry">Coba lagi</button>' + back + '</div>');
    if (S.phase === 'login' || S.phase === 'sent') {
      return card('Admin login', (S.phase === 'sent'
        ? '<p>Link login sudah dikirim ke <b>' + esc(S.loginEmail) + '</b>. Buka email itu di perangkat ini dan klik linknya.</p><p class="muted">Tidak masuk? Cek folder spam, atau kirim ulang.</p>'
        : '<p class="muted">Masukkan email yang terdaftar sebagai admin/editor. Kami kirim link login sekali pakai.</p>') +
        '<form id="loginForm" class="gate-form" novalidate><label for="loginEmail">Email</label><input class="input" id="loginEmail" type="email" autocomplete="email" required placeholder="nama@globalxtreme.net">' +
        (S.loginMsg ? '<div class="form-err">' + esc(S.loginMsg) + '</div>' : '') +
        '<div class="gate-actions"><button class="btn primary" type="submit">' + (S.phase === 'sent' ? 'Kirim ulang link' : 'Kirim link login') + '</button>' + back + '</div></form>');
    }
    if (S.phase === 'denied') return card('Akun belum punya akses', '<p><b>' + esc(S.email) + '</b> sudah login, tapi belum terdaftar sebagai admin atau editor.</p><p class="muted">Minta admin menambahkan email ini di Admin panel → Team & permissions.</p><div class="gate-actions"><button class="btn" data-admin="signout">Logout</button>' + back + '</div>');
    if (S.phase === 'init') {
      return card('Isi database untuk pertama kali', '<p>Database online masih kosong. Pilih data awal untuk draft. Tidak ada data yang dihapus: data di browser tetap ada, dan draft bisa diubah sebelum dipublish.</p>' +
        '<div class="init-list">' + S.candidates.map(function (c, i) {
          return '<div class="init-item"><div><b>' + esc(c.label) + '</b><span class="muted">' + c.tasks + ' task · ' + c.finance + ' baris budget' + (c.at ? ' · terakhir diubah ' + when(c.at) : '') + '</span></div><button class="btn ' + (i === 0 ? 'primary' : '') + '" data-admin="init-use" data-idx="' + i + '">Pakai ini</button></div>';
        }).join('') + '</div>' +
        '<details class="init-paste"><summary>Atau paste backup JSON</summary><textarea class="input code" id="initPaste" placeholder="{ &quot;tasks&quot;: [...], &quot;finance&quot;: [...] }"></textarea><button class="btn" data-admin="init-paste">Pakai backup ini</button></details>');
    }
    return '';
  };
  function card(title, body) { return '<div class="gate"><div class="gate-card"><img class="gate-logo" src="' + esc((App.getDb().settings || {}).logoUrl || App.DEFAULT_LOGO) + '" alt=""><h1>' + esc(title) + '</h1>' + body + '</div></div>'; }
  function initWith(data) {
    if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.finance)) { App.toast('Data tidak valid: butuh tasks dan finance.', true); return; }
    App.setDb(data); S.phase = 'ready'; S.draft = null; S.dirty = true; Admin.markDirty(App.getDb());
    startWatching(); App.setPage('admin');
    save(false).then(function (ok) { if (ok) App.toast('Database terisi. Cek datanya, lalu Publish supaya tampil di website.'); });
  }

  /* ================= Admin bar (every page) ================= */
  var PILL = { Draft: 'b-warn', Publishing: 'b-info', Published: 'b-ok', Failed: 'b-crit' };
  Admin.barHtml = function () {
    var saveState = S.saving ? ['b-info', 'Saving…'] : S.saveError ? ['b-crit', 'Save error'] : S.dirty ? ['b-warn', 'Unsaved changes'] : ['b-ok', 'Saved' + (S.draft ? ' · v' + S.draft.version : '')];
    var ps = pubStatus();
    var h = '<div class="admin-bar" role="region" aria-label="Admin controls">' +
      '<div class="ab-who"><span class="ab-tag">' + (S.role === 'admin' ? 'ADMIN' : 'EDITOR') + '</span><span class="ab-email">' + esc(S.email) + '</span></div>' +
      '<div class="ab-status"><span class="badge ' + saveState[0] + '" title="Status penyimpanan ke database">' + saveState[1] + '</span>' +
      '<span class="badge ' + PILL[ps] + '" title="Status website live">' + (ps === 'Draft' ? 'Draft · belum live' : ps === 'Published' ? 'Published · live' : ps) + '</span></div>' +
      '<div class="ab-actions"><button class="btn primary" data-admin="save" ' + (S.saving || !S.dirty ? 'disabled' : '') + '>Save changes</button>' +
      '<button class="btn accent" data-admin="publish" ' + (S.role !== 'admin' || S.pub === 'Publishing' || S.saving ? 'disabled title="' + (S.role !== 'admin' ? 'Hanya admin yang bisa publish' : '') + '"' : '') + '>' + (S.pub === 'Publishing' ? 'Publishing…' : 'Publish') + '</button>' +
      (App.getPage() !== 'admin' ? '<button class="btn" data-admin="open-panel">Admin panel</button>' : '') +
      '<a class="btn ghost" href="/" target="_blank" rel="noopener">Lihat website ↗</a></div></div>';
    if (S.saveError) h += '<div class="banner" role="alert">Gagal menyimpan: ' + esc(S.saveError) + ' Perubahan masih ada di browser ini. <button class="btn sm" data-admin="save">Coba lagi</button></div>';
    if (S.pub === 'Failed') h += '<div class="banner" role="alert">Publish gagal: ' + esc(S.pubError) + ' Website live tidak berubah. <button class="btn sm" data-admin="publish">Coba lagi</button></div>';
    if (S.conflictCache) h += '<div class="banner warn" role="alert">Ada perubahan yang belum disimpan dari ' + when(S.conflictCache.at) + ', tapi draft di database sudah berubah sejak itu (sekarang v' + S.draft.version + '). <button class="btn sm" data-admin="restore-cache">Pakai perubahanku</button> <button class="btn sm" data-admin="discard-cache">Buang</button></div>';
    if (S.remoteNewer) h += '<div class="banner warn" role="alert">' + esc(S.remoteNewer.updated_by || 'Admin lain') + ' menyimpan draft versi ' + S.remoteNewer.version + '. Kamu masih punya perubahan yang belum disimpan. <button class="btn sm" data-admin="load-latest">Muat versi terbaru</button> <button class="btn sm" data-admin="save">Simpan versiku</button></div>';
    if (S.notice) h += '<div class="banner warn" role="status">' + esc(S.notice) + ' <button class="btn sm ghost" data-admin="dismiss-notice">Tutup</button></div>';
    return h;
  };

  /* ================= Admin panel page ================= */
  Admin.renderPage = function () {
    var db = App.getDb(), st = App.taskStats(), ft = App.totals(db.finance), ps = pubStatus(), isAdmin = S.role === 'admin';
    var set = db.settings;
    var h = '<div class="page-head"><div><h1>Admin panel</h1><p>Satu tempat untuk menyimpan, mempublish, dan mengatur website. Perubahan task & budget dilakukan di halamannya masing-masing, lalu Save + Publish dari sini atau dari bar di atas.</p></div></div>';

    // Status
    h += '<div class="adm-grid">' +
      admCard('Draft (database)', '<div class="adm-big">' + (S.draft ? 'v' + S.draft.version : '—') + '</div><div class="muted">' + (S.draft ? 'Disimpan ' + when(S.draft.updated_at) + ' oleh ' + esc(S.draft.updated_by || '—') : 'Belum pernah disimpan') + '</div>' +
        '<div class="adm-row">' + (S.dirty ? '<span class="badge b-warn">Ada perubahan belum disimpan</span>' : '<span class="badge b-ok">Semua perubahan tersimpan</span>') + '</div>' +
        '<button class="btn primary" data-admin="save" ' + (S.saving || !S.dirty ? 'disabled' : '') + '>' + (S.saving ? 'Saving…' : 'Save changes') + '</button>') +
      admCard('Website live', '<div class="adm-big"><span class="badge ' + PILL[ps] + '" style="font-size:13px">' + ps + '</span></div><div class="muted">' + (S.published ? 'Live: draft v' + S.published.source_version + ' · ' + when(S.published.updated_at) + ' oleh ' + esc(S.published.updated_by || '—') : 'Belum pernah dipublish') + '</div>' +
        (S.pub === 'Failed' ? '<div class="flag crit" style="white-space:normal">' + esc(S.pubError) + '</div>' : '') +
        '<button class="btn accent" data-admin="publish" ' + (!isAdmin || S.pub === 'Publishing' ? 'disabled' : '') + '>' + (S.pub === 'Publishing' ? 'Publishing…' : 'Publish to live site') + '</button>' + (!isAdmin ? '<span class="muted" style="font-size:12px">Hanya admin yang bisa publish.</span>' : '')) +
      admCard('Konten', '<div class="adm-big">' + st.total + ' <span class="muted" style="font-size:14px;font-weight:500">task</span> · ' + db.finance.length + ' <span class="muted" style="font-size:14px;font-weight:500">budget</span></div><div class="muted">Est. budget ' + App.rp(ft.est) + ' · paid ' + App.rp(ft.paid) + '</div>' +
        '<div class="adm-links"><button class="btn sm" data-admin="go" data-page="timeline">Timeline</button><button class="btn sm" data-admin="go" data-page="tasks">Tasks</button><button class="btn sm" data-admin="go" data-page="finance">Finance</button><button class="btn sm" data-admin="go" data-page="calendar">Calendar</button></div>') +
      '</div>';

    // What is managed where
    h += section('Apa yang bisa diatur dari sini', '<div class="adm-two"><div><h4>Langsung dari website (Save → Publish)</h4><ul class="adm-list"><li>Task: tambah, edit, hapus, status, PIC, deadline, notes, blockers</li><li>Budget & pembayaran: item, invoice, DP, status, bukti transfer</li><li>Master Timeline & Calendar (ikut data task)</li><li>Judul, subjudul, nama & tanggal event, preparation deadlines, tagline</li><li>Logo (upload) dan link budget sheet</li><li>Tim admin/editor, riwayat publish, restore versi lama</li></ul></div>' +
      '<div><h4>Butuh perubahan kode + deploy (GitHub → Vercel)</h4><ul class="adm-list"><li>Layout, warna, font, halaman baru</li><li>Kolom/field baru dan aturan perhitungan finance</li><li>Fitur baru di admin panel</li><li>Mapping import dari sheet (scripts/build_seed.py)</li></ul><p class="muted" style="font-size:12.5px;margin:6px 0 0">Push perubahan kode ke GitHub → Vercel otomatis deploy. Tombol Redeploy di bawah untuk build ulang manual.</p></div></div>');

    // Settings
    h += section('Website settings', '<form id="settingsForm" class="adm-form" novalidate>' +
      '<div class="modal-b" style="padding:0">' +
      App.field('siteTitle', 'Judul website', App.inp('siteTitle', set.siteTitle, 'text', 'maxlength="60"'), { req: true }) +
      App.field('siteSubtitle', 'Subjudul (sidebar)', App.inp('siteSubtitle', set.siteSubtitle, 'text', 'maxlength="100"')) +
      App.field('eventName', 'Nama event', App.inp('eventName', set.eventName, 'text', 'maxlength="100"'), { req: true }) +
      App.field('eventDate', 'Tanggal event', App.inp('eventDate', set.eventDate, 'date'), { req: true, hint: 'Dipakai countdown & kalender. Task Event Day tidak ikut pindah otomatis.' }) +
      App.field('timelineSubtitle', 'Subjudul Master Timeline', App.inp('timelineSubtitle', set.timelineSubtitle, 'text', 'maxlength="160"'), { full: true }) +
      App.field('timelineTagline', 'Tagline footer timeline', App.inp('timelineTagline', set.timelineTagline, 'text', 'maxlength="120"')) +
      App.field('budgetSheetUrl', 'Link budget sheet (admin only)', App.inp('budgetSheetUrl', set.budgetSheetUrl || ((db.meta && db.meta.url) || ''), 'url', 'maxlength="400"')) +
      App.field('prepDeadlines', 'Preparation deadlines', App.ta('prepDeadlines', (set.prepDeadlines || []).join('\n')), { full: true, hint: 'Satu tanggal per baris, format YYYY-MM-DD (atau 13/10/2026).' }) +
      '<div class="field full" data-field="logoUrl"><label>Logo</label><div class="logo-row"><img id="logoPreview" src="' + esc(set.logoUrl || App.DEFAULT_LOGO) + '" alt="Logo preview">' +
        '<div class="logo-ctrl"><input type="file" id="logoFile" accept="image/png,image/jpeg,image/svg+xml,image/webp"><input class="input" id="f-logoUrl" name="logoUrl" type="url" placeholder="atau URL gambar (kosongkan = logo bawaan)" value="' + esc(set.logoUrl || '') + '"><span class="hint">PNG/JPG/SVG/WebP maks 2 MB. Upload langsung disimpan di storage; tampil di website setelah Apply → Save → Publish.</span></div></div><span class="msg" hidden></span></div>' +
      '</div><div class="gate-actions"><button class="btn primary" type="submit">Apply ke draft</button><button class="btn ghost" type="button" data-admin="reset-settings">Kembalikan ke default</button></div></form>');

    // Team
    var team = S.admins == null ? (S.sideErr.admins ? '<p class="flag crit">' + esc(S.sideErr.admins) + '</p>' : '<p class="muted">Memuat…</p>') :
      '<div class="table-wrap"><table><thead><tr><th>Email</th><th>Role</th><th>Ditambahkan</th><th></th></tr></thead><tbody>' + S.admins.map(function (a) {
        var me = a.email === S.email;
        return '<tr><td>' + esc(a.email) + (me ? ' <span class="badge b-neutral nodot">kamu</span>' : '') + '</td><td>' +
          (isAdmin && !me ? '<select class="inline-select" data-admin-role="' + esc(a.email) + '">' + ['admin', 'editor'].map(function (r) { return '<option' + (r === a.role ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>' : esc(a.role)) +
          '</td><td class="muted">' + when(a.added_at) + (a.added_by ? ' · ' + esc(a.added_by) : '') + '</td><td>' + (isAdmin && !me ? '<button class="btn sm danger" data-admin="remove-admin" data-email="' + esc(a.email) + '">Hapus</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += section('Team & permissions', '<p class="muted" style="margin-top:0"><b>Admin</b>: edit, save, publish, kelola tim, redeploy. <b>Editor</b>: edit & save draft, tidak bisa publish. Pengunjung biasa hanya bisa melihat website.</p>' + team +
      (isAdmin ? '<form id="teamForm" class="team-form" novalidate><input class="input" id="teamEmail" type="email" placeholder="email@globalxtreme.net" required aria-label="Email"><select class="select" id="teamRole" aria-label="Role"><option value="editor">editor</option><option value="admin">admin</option></select><button class="btn" type="submit">Tambah</button></form><p class="muted" style="font-size:12.5px">Orang yang ditambahkan login lewat /admin dengan email tersebut.</p>' : ''));

    // Publish history
    var log = S.log == null ? (S.sideErr.log ? '<p class="flag crit">' + esc(S.sideErr.log) + '</p>' : '<p class="muted">Memuat…</p>') : !S.log.length ? '<p class="muted">Belum ada riwayat.</p>' :
      '<div class="table-wrap"><table><thead><tr><th>Waktu</th><th>Jenis</th><th>Status</th><th class="r">Versi</th><th>Oleh</th><th>Catatan</th></tr></thead><tbody>' + S.log.map(function (l) {
        return '<tr><td class="muted">' + when(l.created_at) + '</td><td>' + ({ save: 'Save', content: 'Publish', deploy: 'Code deploy' }[l.kind] || esc(l.kind)) + '</td><td><span class="badge ' + (PILL[l.status] || 'b-ok') + '">' + esc(l.status) + '</span></td><td class="num r">' + (l.version || '—') + '</td><td>' + esc(l.actor || '—') + '</td><td class="muted">' + esc(l.message || '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += section('Riwayat save & publish', log);

    // Versions
    var vers = S.versions == null ? (S.sideErr.versions ? '<p class="flag crit">' + esc(S.sideErr.versions) + '</p>' : '<p class="muted">Memuat…</p>') : !S.versions.length ? '<p class="muted">Belum ada versi.</p>' :
      '<div class="table-wrap"><table><thead><tr><th class="r">Versi</th><th>Disimpan</th><th>Oleh</th><th>Status</th><th></th></tr></thead><tbody>' + S.versions.map(function (v) {
        var tags = (S.draft && v.version === S.draft.version ? '<span class="badge b-info nodot">draft</span> ' : '') + (S.published && v.version === S.published.source_version ? '<span class="badge b-ok nodot">live</span>' : '');
        return '<tr><td class="num r">v' + v.version + '</td><td class="muted">' + when(v.saved_at) + '</td><td>' + esc(v.saved_by || '—') + '</td><td>' + tags + '</td><td>' + (S.draft && v.version === S.draft.version ? '' : '<button class="btn sm" data-admin="load-version" data-v="' + v.version + '">Muat ke editor</button>') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += section('Version history', '<p class="muted" style="margin-top:0">Setiap Save tersimpan sebagai versi. "Muat ke editor" mengganti isi editor dengan versi itu sebagai perubahan belum disimpan — tidak ada versi yang dihapus.</p>' + vers);

    // Data tools
    h += section('Data tools', '<div class="adm-tools">' +
      tool('Export backup (JSON)', 'Salin seluruh data draft yang sedang dibuka.', 'export') +
      tool('Restore backup', 'Paste backup JSON ke editor (jadi perubahan belum disimpan).', 'restore') +
      tool('Import budget sheet', 'Paste baris dari Excel/Google Sheets.', 'import-csv') +
      tool('Ambil data dari browser ini', 'Data lama yang tersimpan di browser ini sebelum database aktif.', 'from-browser') +
      tool('Muat data awal bawaan', 'Timeline + budget sheet Acara versi awal (ke editor, belum disimpan).', 'reset-seed') +
      '</div>');

    // Code deployment
    var dp = S.deploy, lat = dp.latest;
    var depBody = '<p class="muted" style="margin-top:0">Perubahan kode (layout, fitur) masuk lewat GitHub: push ke branch <code>main</code> → Vercel otomatis deploy. Tombol di bawah memicu build ulang dari commit terbaru (berguna kalau auto-deploy tidak jalan atau setelah ganti environment variable).</p>';
    if (!window.GX27Sync.deployHook) depBody += '<div class="banner warn">Deploy hook belum diset. Tambahkan <code>VERCEL_DEPLOY_HOOK_URL</code> di Vercel → Settings → Environment Variables (lihat SETUP.md), lalu redeploy sekali dari dashboard Vercel.</div>';
    depBody += '<div class="adm-row">' + (dp.status ? '<span class="badge ' + PILL[dp.status] + '">' + dp.status + '</span> ' : '') + (dp.msg ? '<span>' + esc(dp.msg) + '</span>' : '') + '</div>';
    if (lat) depBody += '<p style="margin:6px 0">Deploy production terakhir: <span class="badge ' + (PILL[lat.status] || 'b-neutral') + '">' + esc(lat.state) + '</span> ' + when(lat.createdAt) + (lat.commitMessage ? ' · <span class="muted">' + esc(lat.commitMessage.split('\n')[0]) + '</span>' : '') + (lat.commitSha ? ' <code>' + esc(lat.commitSha.slice(0, 7)) + '</code>' : '') + '</p>';
    else if (!window.GX27Sync.deployStatusEnabled) depBody += '<p class="muted" style="font-size:12.5px">Status build otomatis aktif kalau <code>VERCEL_TOKEN</code> dan <code>VERCEL_PROJECT_ID</code> diisi.</p>';
    if (S.sideErr.deploy) depBody += '<p class="flag crit">' + esc(S.sideErr.deploy) + '</p>';
    depBody += '<button class="btn" data-admin="deploy" ' + (!isAdmin || !window.GX27Sync.deployHook || dp.status === 'Publishing' ? 'disabled' : '') + '>Redeploy website dari GitHub</button>';
    h += section('Code deployment (GitHub → Vercel)', depBody);

    h += section('Akun', '<p style="margin-top:0">Login sebagai <b>' + esc(S.email) + '</b> (' + esc(S.role) + ').</p><button class="btn" data-admin="signout">Logout</button>');
    return h;
  };
  function admCard(title, body) { return '<div class="adm-card"><h3>' + title + '</h3>' + body + '</div>'; }
  function section(title, body) { return '<section class="adm-section"><h2>' + title + '</h2>' + body + '</section>'; }
  function tool(title, desc, act) { return '<button class="adm-tool" data-admin="tool" data-tool="' + act + '"><b>' + title + '</b><span>' + desc + '</span></button>'; }

  /* ================= Events ================= */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-admin]'); if (!el || !App) return;
    var a = el.getAttribute('data-admin');
    if (el.disabled) return;
    switch (a) {
      case 'save': save(false); break;
      case 'force-save': App.closeModal(); save(true); break;
      case 'load-latest': loadLatest(); break;
      case 'publish': publishFlow(); break;
      case 'open-panel': App.go('admin'); break;
      case 'go': App.go(el.getAttribute('data-page')); break;
      case 'retry': init(); break;
      case 'signout':
        if (S.dirty) { App.confirmDialog('Logout?', 'Ada perubahan yang belum disimpan. Perubahan tetap tersimpan di browser ini dan bisa dipulihkan saat login lagi.', 'Logout', function () { Sync.signOut().catch(noop); }); }
        else Sync.signOut().catch(function (err) { App.toast(err.message, true); });
        break;
      case 'dismiss-notice': S.notice = ''; rerender(); break;
      case 'restore-cache': App.setDb(S.conflictCache.data); S.dirty = true; S.conflictCache = null; Admin.markDirty(App.getDb()); rerender(); App.toast('Perubahanmu dipulihkan. Save akan menimpa draft terbaru (versi lama tetap di history).'); break;
      case 'discard-cache': S.conflictCache = null; clearUnsaved(); rerender(); break;
      case 'init-use': var c = S.candidates[+el.getAttribute('data-idx')]; if (c) initWith(JSON.parse(JSON.stringify(c.data))); break;
      case 'init-paste':
        try { initWith(JSON.parse(document.getElementById('initPaste').value)); } catch (err) { App.toast('JSON tidak valid: ' + err.message, true); }
        break;
      case 'remove-admin':
        var em = el.getAttribute('data-email');
        App.confirmDialog('Hapus akses?', esc(em) + ' tidak bisa lagi masuk ke admin panel.', 'Hapus akses', function () {
          Sync.removeAdmin(em).then(function () { return Sync.listAdmins(); }).then(function (r) { S.admins = r; rerender(); App.toast('Akses dihapus'); }).catch(function (err) { App.toast(err.message, true); });
        });
        break;
      case 'load-version':
        var v = +el.getAttribute('data-v');
        App.confirmDialog('Muat versi ' + v + ' ke editor?', 'Isi editor diganti dengan versi ' + v + '. Ini belum mengubah database atau website sampai kamu klik Save (dan Publish).' + (S.dirty ? ' Perubahan yang belum disimpan sekarang akan diganti.' : ''), 'Muat versi ' + v, function () {
          Sync.getVersion(v).then(function (r) { App.setDb(r.data); Admin.markDirty(App.getDb()); rerender(); App.toast('Versi ' + v + ' dimuat ke editor. Klik Save untuk menjadikannya draft terbaru.'); }).catch(function (err) { App.toast(err.message, true); });
        });
        break;
      case 'reset-settings':
        App.confirmDialog('Kembalikan settings ke default?', 'Judul, tanggal event, tagline, deadlines dan logo kembali ke nilai bawaan (di draft, belum disimpan).', 'Kembalikan', function () {
          App.getDb().settings = JSON.parse(JSON.stringify(App.SETTINGS_DEFAULT)); App.commit('Settings dikembalikan ke default');
        });
        break;
      case 'deploy': deployFlow(); break;
      case 'tool':
        var t = el.getAttribute('data-tool');
        if (t === 'export') App.exportDialog();
        else if (t === 'restore') App.importJsonDialog();
        else if (t === 'import-csv') App.importCsvDialog();
        else if (t === 'reset-seed') App.confirmDialog('Muat data awal bawaan?', 'Isi editor diganti dengan data awal (timeline + budget sheet Acara). Belum tersimpan sampai kamu klik Save; versi sebelumnya tetap ada di Version history.', 'Muat data awal', function () { App.setDb(App.seed()); App.commit('Data awal dimuat ke editor'); });
        else if (t === 'from-browser') {
          var found = findLocalData().filter(function (x) { return x.key !== 'seed'; });
          if (!found.length) { App.toast('Tidak ada data lama di browser ini.', true); break; }
          var f = found[0];
          App.confirmDialog('Pakai data dari browser ini?', f.tasks + ' task dan ' + f.finance + ' baris budget (terakhir diubah ' + when(f.savedAt || f.at) + ') dimuat ke editor. Belum tersimpan sampai kamu klik Save.', 'Muat data', function () { App.setDb(JSON.parse(JSON.stringify(f.data))); App.commit('Data browser dimuat ke editor'); });
        }
        break;
    }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!App) return;
    if (f.id === 'loginForm') {
      e.preventDefault();
      var email = (document.getElementById('loginEmail').value || '').trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { S.loginMsg = 'Isi email yang valid.'; rerender(); return; }
      S.loginMsg = ''; S.loginEmail = email;
      var btn = f.querySelector('button[type=submit]'); if (btn) { btn.disabled = true; btn.textContent = 'Mengirim…'; }
      Sync.signIn(email).then(function () { S.phase = 'sent'; }).catch(function (err) { S.loginMsg = err.message; }).then(rerender);
    } else if (f.id === 'publishForm') {
      e.preventDefault(); doPublish((document.getElementById('pubNote').value || '').trim());
    } else if (f.id === 'settingsForm') {
      e.preventDefault(); applySettingsForm(f);
    } else if (f.id === 'teamForm') {
      e.preventDefault();
      var em = (document.getElementById('teamEmail').value || '').trim().toLowerCase(), role = document.getElementById('teamRole').value;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { App.toast('Isi email yang valid.', true); return; }
      Sync.setAdmin(em, role).then(function () { return Sync.listAdmins(); }).then(function (r) { S.admins = r; rerender(); App.toast(em + ' ditambahkan sebagai ' + role); }).catch(function (err) { App.toast(err.message, true); });
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target; if (!App) return;
    if (t.id === 'logoFile' && t.files && t.files[0]) {
      var file = t.files[0];
      if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)) { App.toast('Format logo harus PNG, JPG, SVG atau WebP.', true); t.value = ''; return; }
      if (file.size > 2 * 1024 * 1024) { App.toast('Logo maksimal 2 MB.', true); t.value = ''; return; }
      App.toast('Mengupload logo…');
      Sync.uploadLogo(file).then(function (url) {
        var u = document.getElementById('f-logoUrl'), p = document.getElementById('logoPreview');
        if (u) u.value = url; if (p) p.src = url;
        App.toast('Logo terupload. Klik "Apply ke draft", lalu Save & Publish.');
      }).catch(function (err) { App.toast('Upload gagal: ' + err.message, true); t.value = ''; });
    } else if (t.id === 'f-logoUrl') {
      var p2 = document.getElementById('logoPreview'); if (p2) p2.src = t.value || App.DEFAULT_LOGO;
    } else if (t.hasAttribute('data-admin-role')) {
      var em = t.getAttribute('data-admin-role'), role = t.value;
      Sync.setAdmin(em, role).then(function () { return Sync.listAdmins(); }).then(function (r) { S.admins = r; rerender(); App.toast(em + ' sekarang ' + role); }).catch(function (err) { App.toast(err.message, true); rerender(); });
    }
  });
  function applySettingsForm(form) {
    var v = {}, errs = {};
    new FormData(form).forEach(function (val, k) { v[k] = String(val).trim(); });
    if (!v.siteTitle) errs.siteTitle = 'Judul wajib diisi.';
    if (!v.eventName) errs.eventName = 'Nama event wajib diisi.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate || '')) errs.eventDate = 'Pilih tanggal event.';
    var dates = [], bad = [];
    (v.prepDeadlines || '').split(/[\n,;]+/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (x) { var d = App.parseFlexDate(x); if (d) dates.push(d); else bad.push(x); });
    if (bad.length) errs.prepDeadlines = 'Tanggal tidak dikenali: ' + bad.join(', ');
    if (v.logoUrl && !/^https?:\/\/|^assets\//.test(v.logoUrl)) errs.logoUrl = 'URL logo harus diawali https://';
    if (v.budgetSheetUrl && !/^https?:\/\//.test(v.budgetSheetUrl)) errs.budgetSheetUrl = 'Link harus diawali https://';
    if (Object.keys(errs).length) { App.showErrors(form, errs); return; }
    var s = App.getDb().settings;
    ['siteTitle', 'siteSubtitle', 'eventName', 'eventDate', 'timelineSubtitle', 'timelineTagline', 'budgetSheetUrl', 'logoUrl'].forEach(function (k) { s[k] = v[k] || ''; });
    s.prepDeadlines = dates.filter(function (d, i) { return dates.indexOf(d) === i; }).sort();
    App.commit('Settings diterapkan ke draft');
  }
})();
