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
    rev: 0, base: null,          // rev counts local edits; base = last draft data this editor saved/loaded (for merging)
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
  Admin.isGuest = function () { return !!S.guest; };
  Admin.isAdmin = function () { return S.role === 'admin'; };

  /* ================= Boot & auth ================= */
  Admin.start = function (opts) {
    App = window.GX27App; Sync = window.GX27Sync;
    S.guestPage = !!(opts && opts.guest);     // public page in open-edit mode: no login needed
    if (!S.guestPage) addNav();
    rerender();
    Sync.onAuth(function (ev, session) {
      if (ev === 'SIGNED_IN' && session && !S.email && S.phase !== 'loading') init();
      if (ev === 'SIGNED_OUT') { resetState(); S.phase = 'login'; rerender(); }
    });
    init();
    window.addEventListener('beforeunload', function (e) {
      if (!S.dirty) return;
      if (autoSaveOn() && !S.saving) save(false, true);      // last-moment flush; the browser may still cut it off
      e.preventDefault(); e.returnValue = '';
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && Admin.canEdit()) { e.preventDefault(); save(false); }
    });
    // keep every open admin panel in sync: refetch when the tab comes back, when the network returns
    document.addEventListener('visibilitychange', function () {
      if (S.phase !== 'ready') return;
      if (document.visibilityState === 'hidden') { if (S.dirty && autoSaveOn() && !S.saving) save(false, true); }
      else checkRemote();
    });
    window.addEventListener('online', function () { if (S.phase !== 'ready') return; S.netDown = false; updLive(); checkRemote(); if (S.dirty) scheduleAutoSave(200); });
    window.addEventListener('offline', function () { updLive(); });
    // anything waiting for the open modal (merging remote edits replaces the data the modal is editing)
    var mr = document.getElementById('modalRoot');
    if (mr && window.MutationObserver) new MutationObserver(function () { if (!modalOpen()) flushIdle(); }).observe(mr, { childList: true });
    document.addEventListener('focusout', function () { if (pendingRender) setTimeout(function () { if (pendingRender) softRender(); }, 0); });
    document.addEventListener('input', function (e) { if (e.target.closest && e.target.closest('#settingsForm,#teamForm')) S.formDirty = true; });
  };
  function resetState() {
    S.email = ''; S.role = null; S.draft = null; S.published = null; S.dirty = false; S.sideLoaded = false;
    S.log = S.versions = S.admins = null; S.remoteNewer = S.conflictCache = null; S.pub = ''; S.base = null;
    clearTimeout(saveTimer); clearTimeout(pollT);
  }
  function addNav() {
    var nav = document.getElementById('nav');
    if (!nav || nav.querySelector('[data-page="admin"]')) return;
    var sep = document.createElement('span'); sep.className = 'sep';
    var b = document.createElement('button'); b.setAttribute('data-page', 'admin');
    b.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>Admin panel';
    nav.appendChild(sep); nav.appendChild(b);
  }
  var initRun = null;
  function init() {
    if (initRun) return initRun;            // auth listener + login button can both ask; run once
    S.phase = 'loading'; rerender();
    if (S.guestPage) {
      // no login: everyone edits the same shared data
      S.guest = true; S.email = ''; S.role = 'admin';
      initRun = loadContent().catch(function (err) { S.phase = 'error'; S.errorMsg = err.message; }).then(function () { initRun = null; rerender(); });
      return initRun;
    }
    initRun = Sync.getSession().then(function (session) {
      // open edit on the public page: everyone edits as a guest (logged-in admins keep their role)
      var asGuest = function () { S.guest = true; S.email = ''; S.role = 'admin'; return loadContent(); };
      if (!session) { if (S.guestPage) return asGuest(); S.phase = 'login'; return; }
      S.email = (session.user && session.user.email || '').toLowerCase();
      return Sync.myRole().then(function (role) {
        S.role = role || null;
        if (!S.role) { if (S.guestPage) return asGuest(); S.phase = 'denied'; return; }
        if (S.guestPage) addNav();
        return loadContent();
      });
    }).catch(function (err) { S.phase = 'error'; S.errorMsg = err.message; }).then(function () { initRun = null; rerender(); });
    return initRun;
  }
  function loadContent() {
    return Promise.all([Sync.loadDraft(), Sync.loadPublishedMeta()]).then(function (r) {
      var draft = r[0]; S.published = r[1] || null;
      if (!draft) {
        // Empty database: fill it straight away so the site has data without any extra step.
        // Prefer the data this browser already has (latest edits), otherwise the built-in data.
        var cands = findLocalData(), pick = cands[0];
        S.notice = S.guest ? '' : 'Database masih kosong, jadi otomatis diisi dari ' + (pick.key === 'seed' ? 'data bawaan website' : 'data yang tersimpan di browser ini') + ' dan langsung dipublish. Mau pakai data lain? Admin panel → Data tools.';
        initWith(JSON.parse(JSON.stringify(pick.data)), true);
        return;
      }
      S.draft = meta(draft);
      App.setDb(clone(draft.data)); S.base = snapshot();
      var cache = readUnsaved(), job = null;
      if (cache && cache.email === S.email && cache.data) {
        if (cache.baseVersion === draft.version) {
          App.setDb(cache.data); S.dirty = true; S.rev++;
          S.notice = 'Perubahan yang belum tersimpan dari sesi sebelumnya dipulihkan' + (autoSaveOn() ? ' dan sedang disimpan.' : '. Klik Save untuk menyimpannya.');
        } else {
          // the draft moved on since then: merge the leftover edits on top of the newest draft
          job = Sync.getVersion(cache.baseVersion).then(function (b) {
            var merged = merge3(App.normalizeDb(clone(b.data)), App.normalizeDb(clone(cache.data)), clone(S.base));
            if (stable(merged) === stable(S.base)) { clearUnsaved(); return; }
            App.setDb(merged); S.dirty = true; S.rev++;
            S.notice = 'Perubahan yang belum tersimpan dari ' + when(cache.at) + ' digabung dengan draft terbaru (v' + draft.version + ').';
          }).catch(function () { S.conflictCache = cache; });
        }
      }
      return Promise.resolve(job).then(function () {
        S.phase = 'ready';
        startWatching();
        // one-time data changes made by this version (e.g. start dates → 1 Oct) are saved for everyone
        if (!draft.data.doorprizeOne || !draft.data.startOct1 || !Array.isArray((draft.data.settings || {}).pics) || !(draft.data.settings || {}).finMinimal || !draft.data.timelineV3 || !draft.data.taskFieldsV2 || !draft.data.todoV1 || !draft.data.reimbV40) S.dirty = true;
        if (S.dirty) { Admin.markDirty(App.getDb()); }
      });
    });
  }

  /* ================= Realtime sync =================
     Every open admin panel follows the draft row, every visitor follows the published row.
     Supabase Realtime (websocket) is the fast path; polling is the fallback when the socket is down,
     plus a refetch when the tab becomes visible again or the network comes back. */
  var live = { draft: '', published: '' }, pollT = null, pulling = null, pendingRender = false, idleQ = [];
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function meta(d) { return { version: d.version, updated_at: d.updated_at, updated_by: d.updated_by }; }
  function modalOpen() { var m = document.getElementById('modalRoot'); return !!(m && m.children.length); }
  function whenNoModal() { return new Promise(function (res) { if (!modalOpen()) res(); else idleQ.push(res); }); }
  function flushIdle() { var q = idleQ; idleQ = []; q.forEach(function (f) { f(); }); }
  function typing() {
    var a = document.activeElement, m = document.getElementById('main');
    return !!(a && m && m.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
  }
  // re-render without yanking a field the user is typing in (or an unapplied settings form)
  function softRender() {
    if (typing() || (S.formDirty && App.getPage() === 'admin')) { pendingRender = true; updBar(); return; }
    pendingRender = false; rerender();
  }
  function liveState() {
    if (S.netDown || (typeof navigator !== 'undefined' && navigator.onLine === false)) return 'offline';
    return live.draft === 'live' && live.published === 'live' ? 'live' : 'polling';
  }
  function updLive() { if (App.setLive) App.setLive(liveState()); }
  function startWatching() {
    if (watching) return; watching = true;
    Sync.watch('draft', function () { pullDraft(); }, function (st) { live.draft = st; updLive(); if (st === 'live') checkRemote(); });
    Sync.watch('published', function () { pullPublishedMeta(); }, function (st) { live.published = st; updLive(); });
    updLive(); schedulePoll();
  }
  function schedulePoll() {
    clearTimeout(pollT);
    pollT = setTimeout(function () { checkRemote().then(schedulePoll, schedulePoll); }, liveState() === 'live' ? 30000 : 5000);
  }
  function checkRemote() {
    if (S.phase !== 'ready') return Promise.resolve();
    return Promise.all([Sync.loadDraftMeta(), Sync.loadPublishedMeta()]).then(function (r) {
      if (S.netDown) { S.netDown = false; updLive(); }
      setPublished(r[1]);
      if (r[0] && (!S.draft || r[0].version > S.draft.version)) return pullDraft();
    }, function () { S.netDown = true; updLive(); });
  }
  function pullPublishedMeta() { Sync.loadPublishedMeta().then(setPublished).catch(noop); }
  function setPublished(m) {
    if (!m) return;
    var p = S.published;
    if (p && p.source_version === m.source_version && p.updated_at === m.updated_at) return;
    S.published = m; if (S.pub !== 'Publishing') updBar();
  }
  // fetch the newest draft and bring it into the editor (merging with unsaved edits)
  function pullDraft() {
    if (S.phase !== 'ready') return Promise.resolve();
    if (S.saving || S.merging) { S.pullAfterSave = true; return Promise.resolve(); }
    if (pulling) return pulling;
    pulling = whenNoModal().then(function () { return Sync.loadDraft(); }).then(function (d) {
      if (!d || (S.draft && d.version <= S.draft.version)) return;
      if (S.saving || S.merging) { S.pullAfterSave = true; return; }
      applyRemote(d);
    }).catch(noop).then(function () { pulling = null; });
    return pulling;
  }
  function applyRemote(d) {
    var theirs = App.normalizeDb(clone(d.data)), who = d.updated_by && d.updated_by !== S.email ? d.updated_by : '';
    if (!S.dirty) {
      App.setDb(theirs); S.base = snapshot(); S.draft = meta(d); clearUnsaved();
      softRender(); if (who) App.toast('Diperbarui oleh ' + who);
      return;
    }
    var merged = merge3(S.base, snapshot(), clone(theirs));
    App.setDb(merged); S.base = clone(theirs); S.draft = meta(d); S.rev++;
    if (stable(snapshot()) === stable(S.base)) { S.dirty = false; clearUnsaved(); }
    else { S.dirty = true; cacheUnsaved(); scheduleAutoSave(300); }
    softRender(); if (who) App.toast('Perubahan dari ' + who + ' digabung dengan editanmu');
  }

  /* ---------- 3-way merge ----------
     base = last version both sides started from, mine = this editor, theirs = newest in the database.
     Lists (tasks, finance, rundown, zones) merge per item id, items edited on both sides merge per field
     (mine wins on the same field). Settings and other keys merge per key. Nothing edited is dropped:
     an item deleted on one side but edited on the other is kept. */
  var LISTS = ['tasks', 'finance', 'rundown', 'zones'];
  function same(a, b) { return stable(a) === stable(b); }
  function mergeKeys(b, m, t) {
    b = b || {}; m = m || {}; t = t || {};
    var out = {}, keys = {};
    [b, m, t].forEach(function (o) { Object.keys(o).forEach(function (k) { keys[k] = 1; }); });
    Object.keys(keys).forEach(function (k) {
      var v = (k in m) !== (k in b) || !same(m[k], b[k]) ? m[k] : t[k];
      if (v !== undefined) out[k] = v;
    });
    return out;
  }
  function byId(a) { var o = {}; (a || []).forEach(function (x) { if (x && x.id != null) o[x.id] = x; }); return o; }
  function mergeList(b, m, t) {
    var B = byId(b), M = byId(m), T = byId(t), val = {}, ids = {};
    [b, m, t].forEach(function (a) { (a || []).forEach(function (x) { if (x && x.id != null) ids[x.id] = 1; }); });
    Object.keys(ids).forEach(function (id) {
      var inB = id in B, inM = id in M, inT = id in T;
      var mCh = inB ? (!inM || !same(M[id], B[id])) : inM;
      var tCh = inB ? (!inT || !same(T[id], B[id])) : inT;
      var r;
      if (!mCh) r = inT ? T[id] : null;
      else if (!tCh) r = inM ? M[id] : null;
      else if (inM && inT) r = mergeKeys(inB ? B[id] : {}, M[id], T[id]);
      else r = inM ? M[id] : T[id];
      if (r) val[id] = r;
    });
    function rel(a, ref) { return (a || []).map(function (x) { return x && x.id; }).filter(function (id) { return id in ref; }); }
    var mMoved = rel(m, B).join('|') !== rel(b, M).join('|'), tMoved = rel(t, B).join('|') !== rel(b, T).join('|');
    var primary = mMoved && !tMoved ? m : t, secondary = primary === m ? t : m;
    var res = [], seen = {}, prev = null;
    (primary || []).forEach(function (x) { if (x && val[x.id] && !seen[x.id]) { res.push(x.id); seen[x.id] = 1; } });
    (secondary || []).forEach(function (x) {
      if (!x || !val[x.id]) return;
      if (seen[x.id]) { prev = x.id; return; }
      res.splice(prev == null ? 0 : res.indexOf(prev) + 1, 0, x.id); seen[x.id] = 1; prev = x.id;
    });
    return res.map(function (id) { return val[id]; });
  }
  function merge3(b, m, t) {
    b = b || {};
    var top = function (o) { var c = {}; Object.keys(o || {}).forEach(function (k) { if (LISTS.indexOf(k) < 0 && k !== 'settings') c[k] = o[k]; }); return c; };
    var out = mergeKeys(top(b), top(m), top(t));
    LISTS.forEach(function (k) { out[k] = mergeList(b[k], m[k], t[k]); });
    out.settings = mergeKeys(b.settings, m.settings, t.settings);
    out.seq = Math.max(+m.seq || 0, +t.seq || 0);
    return App.normalizeDb(out);
  }
  Admin._merge3 = merge3;   // used by the tests

  /* ================= Unsaved cache (survives refresh, never touches the public data) ================= */
  function readUnsaved() { try { return JSON.parse(localStorage.getItem(UNSAVED_KEY) || 'null'); } catch (e) { return null; } }
  function clearUnsaved() { try { localStorage.removeItem(UNSAVED_KEY); } catch (e) {} }
  function cacheUnsaved() {
    try { localStorage.setItem(UNSAVED_KEY, JSON.stringify({ email: S.email, baseVersion: S.draft ? S.draft.version : 0, data: App.getDb(), at: Date.now() })); } catch (e) {}
  }
  Admin.markDirty = function () {
    S.dirty = true; S.rev++;
    cacheUnsaved();
    scheduleAutoSave();
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

  /* ================= Save (auto-save + manual) ================= */
  var saveTimer = null, retryT = null, pubT = null, conflictTries = 0;
  function autoSaveOn() { var s = App.getDb().settings || {}; return s.autoSave !== false; }
  function autoPublishOn() { var s = App.getDb().settings || {}; return s.autoPublish !== false; }
  Admin.autoSaveOn = function () { return !!App && autoSaveOn(); };
  function scheduleAutoSave(delay) {
    if (!autoSaveOn() || !Admin.canEdit()) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { if (S.dirty) save(false, true); }, delay == null ? 1200 : delay);
  }
  function snapshot() { var d = clone(App.getDb()); delete d.savedAt; return d; }
  function save(force, auto) {
    if (!Admin.canEdit()) return Promise.resolve(false);
    if (S.saving || S.merging) { S.saveQueued = true; return S.saveP || Promise.resolve(false); }
    if (!S.dirty && S.draft && !force) { if (!auto) App.toast('Tidak ada perubahan untuk disimpan.'); return Promise.resolve(true); }
    clearTimeout(saveTimer); clearTimeout(retryT);
    var rev = S.rev, snap = snapshot();
    S.saving = true; S.saveError = ''; updBar();
    S.saveP = Sync.saveDraft(snap, S.draft ? S.draft.version : 0, !!force).then(function (v) {
      S.draft = { version: v, updated_at: new Date().toISOString(), updated_by: S.email };
      S.base = snap; S.saving = false; S.conflictCache = null; S.remoteNewer = null; conflictTries = 0;
      if (S.rev === rev) { S.dirty = false; clearUnsaved(); } else { cacheUnsaved(); scheduleAutoSave(400); }
      if (S.pub === 'Failed') S.pub = '';
      if (!auto) { S.notice = ''; App.toast('Tersimpan ke database · versi ' + v); }
      if (App.getPage() === 'admin') softRender(); else updBar();
      refreshHistory();
      if (S.role === 'admin' && autoPublishOn()) schedulePublish();
      return true;
    }, function (err) {
      S.saving = false;
      if (err.conflict) {
        if (conflictTries++ < 3) return mergeThenSave(auto);
        conflictTries = 0; softRender(); conflictDialog(err.conflict); return false;
      }
      S.saveError = err.message; softRender();
      if (!auto) App.toast('Gagal menyimpan: ' + err.message, true);
      if (autoSaveOn()) retryT = setTimeout(function () { if (S.dirty) save(false, true); }, 8000);
      return false;
    }).then(function (ok) {
      if (S.saveQueued) { S.saveQueued = false; if (S.dirty) scheduleAutoSave(200); }
      if (S.pullAfterSave) { S.pullAfterSave = false; pullDraft(); }
      return ok;
    });
    return S.saveP;
  }
  // someone saved first: pull their version, merge ours on top, save again
  function mergeThenSave(auto) {
    S.merging = true; updBar();
    return whenNoModal().then(function () { return Sync.loadDraft(); }).then(function (d) {
      S.merging = false;
      if (d) applyRemote(d);
      return S.dirty ? save(false, true) : true;
    }, function (err) {
      S.merging = false; S.saveError = err.message; softRender(); return false;
    }).then(function (ok) { if (ok && !auto) App.toast('Tersimpan · digabung dengan perubahan admin lain'); return ok; });
  }
  function conflictDialog(current) {
    App.openModal('<div class="modal-h"><h3>Draft sudah diubah orang lain</h3></div><div class="modal-b one"><p style="margin:0">Draft di database sekarang versi <b>' + current + '</b>, sedangkan kamu mulai mengedit dari versi <b>' + (S.draft ? S.draft.version : 0) + '</b>. Penggabungan otomatis gagal beberapa kali.</p>' +
      '<p class="muted" style="margin:0">Versi lama tetap tersimpan di Version history, jadi pilihan apa pun tidak menghapus data.</p></div>' +
      '<div class="modal-f"><button class="btn" data-admin="load-latest">Muat versi terbaru (buang perubahanku)</button><div class="right"><button class="btn primary" data-admin="force-save">Simpan versiku sebagai terbaru</button></div></div>', 'sm', { allowReadonly: true });
  }
  function loadLatest() {
    return Sync.loadDraft().then(function (d) {
      App.setDb(d.data); S.draft = meta(d); S.base = snapshot();
      S.dirty = false; S.remoteNewer = null; S.conflictCache = null; clearUnsaved(); App.closeModal(); rerender();
      App.toast('Draft terbaru dimuat (versi ' + d.version + ')');
    }).catch(function (e) { App.toast(e.message, true); });
  }
  // admin + auto-publish: every saved draft goes live right after it is saved
  function schedulePublish() { clearTimeout(pubT); pubT = setTimeout(autoPublish, 250); }
  function autoPublish() {
    if (S.role !== 'admin' || !S.draft) return;
    if (S.pub === 'Publishing') { S.pubQueued = true; return; }
    if (S.published && S.published.source_version === S.draft.version) return;
    S.pub = 'Publishing'; updBar();
    Sync.publish('Auto-publish').then(function (r) {
      S.published = { source_version: r.source_version, updated_at: r.published_at, updated_by: r.published_by };
      S.pub = ''; S.pubError = '';
      if (App.getPage() === 'admin') softRender(); else updBar();
      refreshHistory();
    }, function (err) {
      S.pub = 'Failed'; S.pubError = err.message; softRender();
      Sync.logEvent('content', 'Failed', S.draft ? S.draft.version : null, err.message).catch(noop);
    }).then(function () { if (S.pubQueued) { S.pubQueued = false; schedulePublish(); } });
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
    return { tasks: part('tasks', 'name'), finance: part('finance', 'item'), rundown: part('rundown', 'segment'), zones: part('zones', 'name'), settings: b ? sets : Object.keys(sa) };
  }
  function diffHtml(dd, first) {
    if (first) return '<p style="margin:0">Belum ada versi live di database. Publish pertama akan menampilkan seluruh draft ke website.</p>';
    function line(label, r) {
      var n = r.added.length + r.changed.length + r.removed.length;
      if (!n) return '<li><b>' + label + ':</b> <span class="muted">tidak ada perubahan</span></li>';
      function names(arr) { return arr.slice(0, 4).map(function (x) { return esc(x || '(tanpa nama)'); }).join(', ') + (arr.length > 4 ? ' +' + (arr.length - 4) : ''); }
      return '<li><b>' + label + ':</b> ' + [r.added.length ? r.added.length + ' baru (' + names(r.added) + ')' : '', r.changed.length ? r.changed.length + ' diubah (' + names(r.changed) + ')' : '', r.removed.length ? r.removed.length + ' dihapus (' + names(r.removed) + ')' : ''].filter(Boolean).join(' · ') + '</li>';
    }
    return '<ul class="diff-list">' + line('Tasks', dd.tasks) + line('Budget', dd.finance) + line('Rundown', dd.rundown) + line('Zona & area', dd.zones) + '<li><b>Settings:</b> ' + (dd.settings.length ? esc(dd.settings.join(', ')) : '<span class="muted">tidak ada perubahan</span>') + '</li></ul>';
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
      Sync.listAdmins().then(function (r) { S.admins = r; }, function (e) { S.sideErr.admins = e.message; }),
      Sync.openEdit().then(function (v) { S.openEdit = v; }, function () { S.openEdit = null; })
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
    if (S.phase === 'loading') return S.guestPage ? '<div class="empty" style="padding:80px 16px"><b>Memuat data…</b>Mengambil versi terbaru dari server.</div>' : card('Memuat admin panel…', '<p class="muted">Menghubungkan ke database.</p>');
    if (S.phase === 'error' && S.guestPage) return '<div class="banner" role="alert">Tidak bisa memuat data: ' + esc(S.errorMsg) + ' <button class="btn sm" data-admin="retry">Coba lagi</button></div>';
    if (S.phase === 'error') return card('Tidak bisa memuat admin panel', '<p>' + esc(S.errorMsg) + '</p><div class="gate-actions"><button class="btn primary" data-admin="retry">Coba lagi</button>' + back + '</div>');
    if (S.phase === 'login' || S.phase === 'sent') {
      return card('Admin login', (S.phase === 'sent'
        ? '<p>Link login sudah dikirim ke <b>' + esc(S.loginEmail) + '</b>. Buka email itu di perangkat ini dan klik linknya.</p><p class="muted">Tidak masuk? Cek folder spam, atau kirim ulang.</p>'
        : Sync.pendingLink ? '<p>Masukkan lagi email yang kamu pakai saat minta link login, untuk menyelesaikan login di perangkat ini.</p>'
        : '<p class="muted">' + (Sync.googleLogin ? 'Login dengan akun Google atau link email' : 'Masukkan email yang terdaftar sebagai admin/editor. Kami kirim link login sekali pakai') + '.</p>') +
        (Sync.pendingLink || !Sync.googleLogin ? '' : '<button class="btn google" type="button" data-admin="google"><svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> Login dengan Google</button><div class="gate-or">atau pakai link email</div>') +
        '<form id="loginForm" class="gate-form" novalidate><label for="loginEmail">Email</label><input class="input" id="loginEmail" type="email" autocomplete="email" required placeholder="nama@globalxtreme.net">' +
        (S.loginMsg ? '<div class="form-err">' + esc(S.loginMsg) + '</div>' : '') +
        '<div class="gate-actions"><button class="btn primary" type="submit">' + (Sync.pendingLink ? 'Selesaikan login' : S.phase === 'sent' ? 'Kirim ulang link' : 'Kirim link login') + '</button>' + back + '</div></form>');
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
  var filling = false;
  function initWith(data, auto) {
    if (filling) return; filling = true;
    if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.finance)) { App.toast('Data tidak valid: butuh tasks dan finance.', true); return; }
    App.setDb(data); S.phase = 'ready'; S.draft = null; S.dirty = true; Admin.markDirty(App.getDb());
    startWatching(); if (!S.guest) App.setPage('admin');
    var note = S.notice;
    save(false).then(function (ok) {
      if (!ok) return;
      if (note) { S.notice = note; rerender(); }   // save() clears notices; keep the explanation visible
      if (S.role === 'admin' && !S.published) {
        // first fill goes live immediately so the public site shows the same data
        S.pub = 'Publishing'; rerender();
        return Sync.publish(auto ? 'Publish awal otomatis' : 'Publish awal').then(function (r) {
          S.published = { source_version: r.source_version, updated_at: r.published_at, updated_by: r.published_by };
          S.pub = ''; rerender(); App.toast('Database terisi dan website live sudah menampilkan datanya.');
        }, function (err) { S.pub = 'Failed'; S.pubError = err.message; rerender(); });
      }
      App.toast('Database terisi. Admin perlu klik Publish supaya tampil di website.');
    });
  }

  /* ================= Admin bar (every page) ================= */
  var PILL = { Draft: 'b-warn', Publishing: 'b-info', Published: 'b-ok', Failed: 'b-crit' };
  function updBar() {
    var el = document.querySelector('.admin-bar');
    if (!el) { if (S.guest) barCore(); return; }
    var tmp = document.createElement('div'); tmp.innerHTML = barCore();
    el.parentNode.replaceChild(tmp.firstChild, el);
  }
  Admin.barHtml = function () { return barCore() + bannersHtml(); };
  function barCore() {
    var auto = autoSaveOn();
    var saveState = S.saving || S.merging ? ['b-info', auto ? 'Menyimpan…' : 'Saving…'] : S.saveError ? ['b-crit', 'Gagal simpan'] :
      S.dirty ? (auto ? ['b-info', 'Menyimpan…'] : ['b-warn', 'Unsaved changes']) : ['b-ok', (auto ? 'Tersimpan otomatis' : 'Saved') + (S.draft ? ' · v' + S.draft.version : '')];
    var ps = pubStatus();
    if (S.guest) {
      var si = document.getElementById('saveInd');
      if (si) { si.hidden = false; si.className = 'save-ind ' + saveState[0]; si.textContent = saveState[1] + (S.pub === 'Publishing' ? ' · mengirim…' : ''); }
      return '';
      return '<div class="admin-bar guest" role="region" aria-label="Edit controls">' +
        '<div class="ab-who"><span class="ab-tag">EDIT</span><span class="ab-email">Siapa pun bisa edit · perubahan langsung tersimpan untuk semua</span></div>' +
        '<div class="ab-status"><span class="badge ' + saveState[0] + '">' + saveState[1] + '</span>' +
        '<span class="badge ' + PILL[ps] + '">' + (ps === 'Draft' ? 'Belum tayang' : ps === 'Published' ? 'Tayang' : ps) + '</span></div>' +
        '<div class="ab-actions">' + (auto ? '' : '<button class="btn primary" data-admin="save" ' + (S.saving || !S.dirty ? 'disabled' : '') + '>Simpan</button>') +
        (autoPublishOn() ? '' : '<button class="btn accent" data-admin="publish" ' + (S.pub === 'Publishing' || S.saving ? 'disabled' : '') + '>' + (S.pub === 'Publishing' ? 'Publishing…' : 'Tayangkan') + '</button>') + '</div></div>';
    }
    return '<div class="admin-bar" role="region" aria-label="Admin controls">' +
      '<div class="ab-who"><span class="ab-tag">' + (S.role === 'admin' ? 'ADMIN' : 'EDITOR') + '</span><span class="ab-email">' + esc(S.email) + '</span></div>' +
      '<div class="ab-status"><span class="badge ' + saveState[0] + '" title="Status penyimpanan ke database">' + saveState[1] + '</span>' +
      '<span class="badge ' + PILL[ps] + '" title="Status website live">' + (ps === 'Draft' ? 'Draft · belum live' : ps === 'Published' ? 'Published · live' : ps) + '</span></div>' +
      '<div class="ab-actions"><button class="btn primary" data-admin="save" ' + (S.saving || !S.dirty ? 'disabled' : '') + '>Save changes</button>' +
      '<button class="btn accent" data-admin="publish" ' + (S.role !== 'admin' || S.pub === 'Publishing' || S.saving ? 'disabled title="' + (S.role !== 'admin' ? 'Hanya admin yang bisa publish' : '') + '"' : '') + '>' + (S.pub === 'Publishing' ? 'Publishing…' : 'Publish') + '</button>' +
      (App.getPage() !== 'admin' ? '<button class="btn" data-admin="open-panel">Admin panel</button>' : '') +
      '<a class="btn ghost" href="/" target="_blank" rel="noopener">Lihat website ↗</a></div></div>';
  }
  function bannersHtml() {
    var h = '';
    if (S.saveError) h += '<div class="banner" role="alert">Gagal menyimpan: ' + esc(S.saveError) + ' Perubahan masih ada di browser ini. <button class="btn sm" data-admin="save">Coba lagi</button></div>';
    if (S.pub === 'Failed') h += '<div class="banner" role="alert">Publish gagal: ' + esc(S.pubError) + ' Website live tidak berubah. <button class="btn sm" data-admin="publish">Coba lagi</button></div>';
    if (S.conflictCache) h += '<div class="banner warn" role="alert">Ada perubahan yang belum disimpan dari ' + when(S.conflictCache.at) + ', tapi draft di database sudah berubah sejak itu (sekarang v' + S.draft.version + '). <button class="btn sm" data-admin="restore-cache">Pakai perubahanku</button> <button class="btn sm" data-admin="discard-cache">Buang</button></div>';
    if (S.remoteNewer) h += '<div class="banner warn" role="alert">' + esc(S.remoteNewer.updated_by || 'Admin lain') + ' menyimpan draft versi ' + S.remoteNewer.version + '. Kamu masih punya perubahan yang belum disimpan. <button class="btn sm" data-admin="load-latest">Muat versi terbaru</button> <button class="btn sm" data-admin="save">Simpan versiku</button></div>';
    if (S.notice) h += '<div class="banner warn" role="status">' + esc(S.notice) + ' <button class="btn sm ghost" data-admin="dismiss-notice">Tutup</button></div>';
    return h;
  }

  /* ================= Admin panel page ================= */
  Admin.renderPage = function () {
    var db = App.getDb(), st = App.taskStats(), ft = App.totals(db.finance), ps = pubStatus(), isAdmin = S.role === 'admin';
    var set = db.settings;
    S.formDirty = false;
    var h = '<div class="page-head"><div><h1>Admin panel</h1><p>Satu tempat untuk menyimpan, mempublish, dan mengatur website. Perubahan task & budget dilakukan di halamannya masing-masing, lalu Save + Publish dari sini atau dari bar di atas.</p></div></div>';

    // Status
    h += '<div class="adm-grid">' +
      admCard('Draft (database)', '<div class="adm-big">' + (S.draft ? 'v' + S.draft.version : '—') + '</div><div class="muted">' + (S.draft ? 'Disimpan ' + when(S.draft.updated_at) + ' oleh ' + esc(S.draft.updated_by || '—') : 'Belum pernah disimpan') + '</div>' +
        '<div class="adm-row">' + (S.dirty ? '<span class="badge b-warn">Ada perubahan belum disimpan</span>' : '<span class="badge b-ok">Semua perubahan tersimpan</span>') + '</div>' +
        '<button class="btn primary" data-admin="save" ' + (S.saving || !S.dirty ? 'disabled' : '') + '>' + (S.saving ? 'Saving…' : 'Save changes') + '</button>') +
      admCard('Website live', '<div class="adm-big"><span class="badge ' + PILL[ps] + '" style="font-size:13px">' + ps + '</span></div><div class="muted">' + (S.published ? 'Live: draft v' + S.published.source_version + ' · ' + when(S.published.updated_at) + ' oleh ' + esc(S.published.updated_by || '—') : 'Belum pernah dipublish') + '</div>' +
        (S.pub === 'Failed' ? '<div class="flag crit" style="white-space:normal">' + esc(S.pubError) + '</div>' : '') +
        '<button class="btn accent" data-admin="publish" ' + (!isAdmin || S.pub === 'Publishing' ? 'disabled' : '') + '>' + (S.pub === 'Publishing' ? 'Publishing…' : 'Publish to live site') + '</button>' + (!isAdmin ? '<span class="muted" style="font-size:12px">Hanya admin yang bisa publish.</span>' : '')) +
      admCard('Konten', '<div class="adm-big">' + st.total + ' <span class="muted" style="font-size:14px;font-weight:500">task</span> · ' + db.finance.length + ' <span class="muted" style="font-size:14px;font-weight:500">budget</span> · ' + (db.rundown || []).length + ' <span class="muted" style="font-size:14px;font-weight:500">segmen</span></div><div class="muted">Est. budget ' + App.rp(ft.est) + ' · paid ' + App.rp(ft.paid) + '</div>' +
        '<div class="adm-links"><button class="btn sm" data-admin="go" data-page="timeline">Timeline</button><button class="btn sm" data-admin="go" data-page="rundown">Rundown</button><button class="btn sm" data-admin="go" data-page="tasks">Tasks</button><button class="btn sm" data-admin="go" data-page="finance">Finance</button><button class="btn sm" data-admin="go" data-page="calendar">Calendar</button></div>') +
      '</div>';

    // Realtime
    var aS = set.autoSave !== false, aP = set.autoPublish !== false, ls = liveState();
    h += section('Realtime & sinkronisasi', '<div class="adm-two"><div>' +
      '<p style="margin-top:0">Status koneksi: <span class="live-pill lv-' + ls + '"><i></i>' + LIVE_TEXT[ls] + '</span></p>' +
      '<ul class="adm-list"><li>Semua yang membuka admin panel (beda device / beda email) melihat perubahan draft dalam hitungan detik.</li><li>Pengunjung website melihat versi live terbaru tanpa refresh.</li><li>Kalau dua orang mengedit bersamaan, perubahan digabung per item. Kalau field yang sama diubah dua-duanya, yang terakhir disimpan yang dipakai.</li><li>Kalau koneksi realtime putus, website otomatis cek ulang tiap 5 detik.</li></ul></div><div>' +
      '<label class="tgl"><input type="checkbox" data-admin-toggle="autoSave"' + (aS ? ' checked' : '') + (isAdmin ? '' : ' disabled') + '><span><b>Auto-save</b><br><span class="muted">Setiap perubahan langsung tersimpan ke database (±1 detik). Tidak perlu klik Save.</span></span></label>' +
      '<label class="tgl"><input type="checkbox" data-admin-toggle="autoPublish"' + (aP ? ' checked' : '') + (isAdmin ? '' : ' disabled') + '><span><b>Auto-publish perubahan admin</b><br><span class="muted">Perubahan yang disimpan admin langsung tampil di website live. Perubahan editor tetap menunggu admin Publish.</span></span></label>' +
      '<label class="tgl"><input type="checkbox" data-admin-openedit' + (S.openEdit ? ' checked' : '') + (isAdmin && S.openEdit != null ? '' : ' disabled') + '><span><b>Siapa pun bisa edit tanpa login</b><br><span class="muted">Semua orang yang membuka website bisa tambah, ubah, dan hapus data. Matikan kalau mau edit hanya lewat /admin.' + (S.openEdit == null ? ' (memuat…)' : '') + '</span></span></label>' +
      (isAdmin ? '' : '<p class="muted" style="font-size:12.5px">Hanya admin yang bisa mengubah pengaturan ini.</p>') + '</div></div>');

    // What is managed where
    h += section('Apa yang bisa diatur dari sini', '<div class="adm-two"><div><h4>Langsung dari website (Save → Publish)</h4><ul class="adm-list"><li>Task: tambah, edit, hapus, status, PIC, deadline, notes, blockers</li><li>Budget & pembayaran: item, invoice, DP, status, bukti transfer</li><li>Master Timeline & Calendar (ikut data task)</li><li>Rundown Event Day: tambah, edit, hapus segmen, PIC, status</li><li>Kategori task & workstream: tambah, ganti nama, urutkan, hapus</li><li>Judul, subjudul, nama & tanggal event, preparation deadlines, tagline</li><li>Logo (upload) dan link budget sheet</li><li>Tim admin/editor, riwayat publish, restore versi lama</li></ul></div>' +
      '<div><h4>Butuh perubahan kode + deploy (GitHub → Vercel)</h4><ul class="adm-list"><li>Layout, warna, font, halaman baru</li><li>Kolom/field baru dan aturan perhitungan finance</li><li>Fitur baru di admin panel</li><li>Mapping import dari sheet (scripts/build_seed.py)</li></ul><p class="muted" style="font-size:12.5px;margin:6px 0 0">Push perubahan kode ke GitHub → Vercel otomatis deploy. Tombol Redeploy di bawah untuk build ulang manual.</p></div></div>');

    // Categories
    var cats = function (kind) { var K = App.CAT_KINDS[kind], list = set[K.key] || []; return '<div class="adm-card"><h3>' + K.label + ' · ' + list.length + '</h3><div class="muted" style="font-size:13px">' + list.map(esc).join(' · ') + '</div><button class="btn" data-admin="categories" data-kind="' + kind + '">Kelola ' + K.label.toLowerCase() + '</button></div>'; };
    h += section('Kategori & workstream', '<p class="muted" style="margin-top:0">Tambah, ganti nama, urutkan, atau hapus. Ganti nama otomatis memperbarui semua task & budget yang memakainya; hapus kategori yang masih dipakai akan minta pilih penggantinya dulu.</p><div class="adm-grid" style="margin:0">' + cats('category') + cats('workstream') + '</div>');

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
        '<div class="logo-ctrl"><input type="file" id="logoFile" accept="image/png,image/jpeg,image/svg+xml,image/webp"><input type="hidden" id="f-logoUrl" name="logoUrl" value="' + esc(set.logoUrl || '') + '"><input class="input" id="logoUrlText" type="url" placeholder="atau tempel URL gambar https://…" value="' + esc(/^https?:/.test(set.logoUrl || '') ? set.logoUrl : '') + '"><div class="gate-actions" style="margin:0"><button class="btn sm" type="button" data-admin="logo-default">Pakai logo bawaan</button>' + (/^data:/.test(set.logoUrl || '') ? '<span class="muted" style="font-size:12px">Sekarang: logo hasil upload</span>' : '') + '</div><span class="hint">PNG/JPG/SVG/WebP. Logo otomatis dikecilkan dan diupload ke Supabase Storage. Tampil di website setelah Apply → Save → Publish.</span></div></div><span class="msg" hidden></span></div>' +
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
  var LIVE_TEXT = { live: 'Live · realtime', polling: 'Sinkron tiap 5 detik', offline: 'Offline · menunggu koneksi' };
  function savedHint() {
    return autoSaveOn() ? ' Karena auto-save aktif, ini langsung tersimpan' + (S.role === 'admin' && autoPublishOn() ? ' dan tampil di website' : '') + '. Versi sebelumnya tetap ada di Version history.'
      : ' Belum tersimpan sampai kamu klik Save; versi sebelumnya tetap ada di Version history.';
  }
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
      case 'google': S.loginMsg = ''; el.disabled = true; el.lastChild.textContent = ' Mengalihkan ke Google…';
        Sync.signInGoogle().catch(function (err) { S.loginMsg = err.message; rerender(); }); break;  // the page redirects to Google, then back to /admin
      case 'categories': App.categoryManager(el.getAttribute('data-kind') || 'category'); break;
      case 'logo-default':
        var hid = document.getElementById('f-logoUrl'), pv = document.getElementById('logoPreview'), tx = document.getElementById('logoUrlText');
        if (hid) hid.value = ''; if (tx) tx.value = ''; if (pv) pv.src = App.DEFAULT_LOGO;
        App.toast('Logo bawaan dipilih. Klik "Apply ke draft".'); break;
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
        App.confirmDialog('Muat versi ' + v + ' ke editor?', 'Isi editor diganti dengan versi ' + v + '.' + savedHint() + (S.dirty ? ' Perubahan yang belum disimpan sekarang akan diganti.' : ''), 'Muat versi ' + v, function () {
          Sync.getVersion(v).then(function (r) { App.setDb(r.data); Admin.markDirty(App.getDb()); rerender(); App.toast('Versi ' + v + ' dimuat ke editor' + (autoSaveOn() ? ' dan disimpan sebagai draft terbaru.' : '. Klik Save untuk menjadikannya draft terbaru.')); }).catch(function (err) { App.toast(err.message, true); });
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
        else if (t === 'reset-seed') App.confirmDialog('Muat data awal bawaan?', 'Isi editor diganti dengan data awal (timeline + budget sheet Acara).' + savedHint(), 'Muat data awal', function () { App.setDb(App.seed()); App.commit('Data awal dimuat ke editor'); });
        else if (t === 'from-browser') {
          var found = findLocalData().filter(function (x) { return x.key !== 'seed'; });
          if (!found.length) { App.toast('Tidak ada data lama di browser ini.', true); break; }
          var f = found[0];
          App.confirmDialog('Pakai data dari browser ini?', f.tasks + ' task dan ' + f.finance + ' baris budget (terakhir diubah ' + when(f.savedAt || f.at) + ') dimuat ke editor.' + savedHint(), 'Muat data', function () { App.setDb(JSON.parse(JSON.stringify(f.data))); App.commit('Data browser dimuat ke editor'); });
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
      Sync.signIn(email).then(function (r) { if (r && r.completed) { init(); return; } S.phase = 'sent'; rerender(); }).catch(function (err) { S.loginMsg = err.message; rerender(); });
    } else if (f.id === 'publishForm') {
      e.preventDefault(); doPublish((document.getElementById('pubNote').value || '').trim());
    } else if (f.id === 'settingsForm') {
      e.preventDefault(); S.formDirty = false; applySettingsForm(f);
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
      if (file.size > 5 * 1024 * 1024) { App.toast('File logo maksimal 5 MB.', true); t.value = ''; return; }
      App.toast('Mengupload logo…');
      Sync.uploadLogo(file).then(function (url) {
        var u = document.getElementById('f-logoUrl'), p = document.getElementById('logoPreview'), tx = document.getElementById('logoUrlText');
        if (u) u.value = url; if (p) p.src = url; if (tx) tx.value = '';
        App.toast('Logo terupload. Klik "Apply ke draft", lalu Save & Publish.');
      }).catch(function (err) { App.toast('Upload gagal: ' + err.message, true); t.value = ''; });
    } else if (t.id === 'logoUrlText') {
      var hid2 = document.getElementById('f-logoUrl'), p2 = document.getElementById('logoPreview');
      if (hid2) hid2.value = t.value.trim(); if (p2) p2.src = t.value.trim() || App.DEFAULT_LOGO;
    } else if (t.hasAttribute('data-admin-openedit')) {
      var on = t.checked; t.disabled = true;
      Sync.setOpenEdit(on).then(function (v) { S.openEdit = v; rerender(); App.toast(v ? 'Siapa pun sekarang bisa edit website tanpa login' : 'Edit sekarang hanya lewat /admin'); },
        function (err) { t.checked = !on; t.disabled = false; App.toast(err.message, true); });
    } else if (t.hasAttribute('data-admin-toggle')) {
      if (S.role !== 'admin') { t.checked = !t.checked; return; }
      var key = t.getAttribute('data-admin-toggle');
      App.getDb().settings[key] = !!t.checked;
      App.commit(key === 'autoSave' ? (t.checked ? 'Auto-save aktif' : 'Auto-save dimatikan — klik Save untuk menyimpan') : (t.checked ? 'Auto-publish aktif' : 'Auto-publish dimatikan — klik Publish untuk tayang'));
      if (key === 'autoSave' && !t.checked) save(false, true);   // the switch itself still has to reach the others
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
    if (v.logoUrl && !/^https:\/\/|^data:image\//.test(v.logoUrl)) errs.logoUrl = 'URL logo harus diawali https://';
    if (v.budgetSheetUrl && !/^https?:\/\//.test(v.budgetSheetUrl)) errs.budgetSheetUrl = 'Link harus diawali https://';
    if (Object.keys(errs).length) { App.showErrors(form, errs); return; }
    var s = App.getDb().settings;
    ['siteTitle', 'siteSubtitle', 'eventName', 'eventDate', 'timelineSubtitle', 'timelineTagline', 'budgetSheetUrl', 'logoUrl'].forEach(function (k) { s[k] = v[k] || ''; });
    s.prepDeadlines = dates.filter(function (d, i) { return dates.indexOf(d) === i; }).sort();
    App.commit('Settings diterapkan ke draft');
  }
})();
