/* GX27 — Need per Station (add-on).
   Satu station = satu task. Daftar need disimpan di dalam task itu sendiri (task.needs),
   jadi ikut tersimpan & tersinkron seperti task biasa.
   v13: dikelompokkan per Workstream (nama & urutan dari Manage Categories), kolom bisa diatur
   (Manage Columns: ganti nama, sembunyikan, urutkan, tambah kolom sendiri, ubah pilihan dropdown),
   kolom "Perlengkapan" jadi centang biasa. Susunan kolom disimpan di settings.needCols. */
(function () {
  'use strict';
  var App = window.GX27App;
  if (!App) { console.warn('needs.js: GX27App tidak ditemukan (pastikan needs.js dimuat setelah app.js)'); return; }
  var main = document.getElementById('main'), nav = document.getElementById('nav');
  if (!main || !nav) return;

  var DESIGN = ["Doesn't Need", 'Not Started', 'In Progress', 'Done'];
  var SEED = [
    { name: 'GX Access Point (Registrasi)', area: 'Basement', items: [
      ['Meja', 1, "Doesn't Need", 1, ''], ['Kursi', 2, "Doesn't Need", 1, ''], ['Acrylic Stand', 1, 'Not Started', 1, 'Acrylic ke perlengkapan'],
      ['Gelang', 800, 'In Progress', 0, ''], ['Kartu GX Game Pass', 800, 'In Progress', 0, 'Collect stamp kemenangan games untuk dapat extra merch'],
      ['Stamp', 12, 'Not Started', 0, ''], ['Stock merch', 20, 'In Progress', 0, 'HANYA UNTUK YANG COMPLETE 6 STAMP GX GAME PASS!!!'],
      ['PIC', '', "Doesn't Need", 0, ''], ['Tempat Sampah', '', 'In Progress', 0, ''] ] },
    { name: 'DJ Bestman', area: 'Basement', items: [
      ['Meja', 1, "Doesn't Need", 1, ''], ['Kursi', 1, "Doesn't Need", 1, ''], ['DJ Mixer', '', "Doesn't Need", 0, 'Dibawa dari DJ nya'] ] },
    { name: 'GX Face Art (Face Painting)', area: 'Basement', items: [
      ['Meja', 2, "Doesn't Need", 1, ''], ['Kursi', 6, "Doesn't Need", 1, ''], ['Acrylic Stand', 1, 'Not Started', 1, 'Acrylic ke perlengkapan'] ] },
    { name: 'GX Create (DIY Tote Bag Printing)', area: 'Basement', items: [
      ['Meja', 1, "Doesn't Need", 1, ''], ['Kursi', 1, "Doesn't Need", 1, ''], ['Acrylic Stand', 1, 'Not Started', 1, 'Acrylic ke perlengkapan'],
      ['Kotak2 kecil', 15, "Doesn't Need", 1, 'Storage untuk film DTF'], ['Stop kontak', 2, "Doesn't Need", 1, 'Untuk 2 mini press heat'] ] },
    { name: 'Tin Can Ball Toss & Ring Toss', area: 'Basement', items: [
      ['T Banner', 2, 'Not Started', 1, 'How to win'], ['PIC', '', "Doesn't Need", 0, ''],
      ['Stock merch per game', 40, 'In Progress', 0, '20 per game'], ['Stamp per game', 2, 'Not Started', 0, 'Masing-masing game 1 stamp'] ] },
    { name: 'GX Wall of Wishes', area: 'Basement', note: 'Nanti nulis judul gede di boardnya.', items: [
      ['Board', 1, "Doesn't Need", 1, ''], ['Spidol warna-warni', 5, "Doesn't Need", 0, ''] ] },
    { name: 'People of GX', area: 'Parkiran Pak X', items: [['T Banner', 1, 'Not Started', 1, 'How to vote']] },
    { name: 'GX Play Zone', area: 'Lt. 3', items: [
      ['T Banner', 10, 'Not Started', 1, 'How to win'], ['Stock merch per game', 200, 'In Progress', 0, '20 per game'],
      ['Stamp per game', 10, 'Not Started', 0, ''], ['T Banner GX Fortune', 1, 'Not Started', 1, 'Untuk di station tarot'] ] },
    { name: 'GX HYROX Challenge', area: 'Lt. 4', items: [
      ['T Banner', 10, 'Not Started', 1, 'How to win'], ['Stock merch per game', 200, 'In Progress', 0, '20 per game'],
      ['Stamp per game', 10, 'Not Started', 0, ''], ['T Banner GX Fortune', 1, 'Not Started', 1, 'Untuk di station tarot'],
      ['TV', 1, "Doesn't Need", 1, ''], ['Meja DJ', '', "Doesn't Need", 1, ''], ['Kursi DJ', '', "Doesn't Need", 1, ''] ] }
  ];

  /* ---------- kolom (bisa diatur) ---------- */
  var BUILTIN = [
    { key: 'item', label: 'Keperluan', type: 'text', locked: true },
    { key: 'qty', label: 'Qty', type: 'text' },
    { key: 'design', label: 'Design', type: 'select', options: DESIGN },
    { key: 'ready', label: 'Perlengkapan', type: 'checkbox' },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ];
  var TYPES = [['text', 'Teks'], ['textarea', 'Teks Panjang'], ['number', 'Angka'], ['date', 'Tanggal'], ['select', 'Pilihan (Dropdown)'], ['checkbox', 'Centang']];
  var NO_NAME = 'Tanpa Workstream';
  function typeLabel(t) { var x = TYPES.filter(function (y) { return y[0] === t; })[0]; return x ? x[1] : t; }
  function builtin(key) { return BUILTIN.filter(function (b) { return b.key === key; })[0] || null; }
  function cols() {
    var s = db().settings, c = Array.isArray(s.needCols) ? s.needCols : null;
    if (!c) c = s.needCols = BUILTIN.map(function (b) { return { key: b.key, label: b.label, type: b.type, visible: true, options: b.options ? b.options.slice() : undefined }; });
    BUILTIN.forEach(function (b) {
      var x = c.filter(function (y) { return y.key === b.key; })[0];
      if (!x) c.push({ key: b.key, label: b.label, type: b.type, visible: true, options: b.options ? b.options.slice() : undefined });
      else { x.type = b.type; if (b.locked) x.visible = true; if (b.type === 'select' && (!Array.isArray(x.options) || !x.options.length)) x.options = b.options.slice(); }
    });
    return c;
  }
  function visCols() { return cols().filter(function (c) { return c.visible !== false; }); }
  function colByKey(k) { return cols().filter(function (c) { return c.key === k; })[0] || null; }
  // semua kolom punya lebar awal (px); tabel melebar & bisa di-scroll kalau kolomnya banyak
  function colWidth(c) {
    if (c.key === 'item') return 260;
    if (c.key === 'qty') return 80;
    return { number: 100, date: 150, select: 150, checkbox: 100, textarea: 260, text: 170 }[c.type] || 170;
  }
  function statLabel(label, word) { return label.toLowerCase().indexOf(word.toLowerCase()) > -1 ? label : label + ' ' + word; }

  /* ---------- helpers ---------- */
  var esc = App.esc, active = false, painting = false, keepY = null;
  function db() { return App.getDb(); }
  function isStation(t) { return Array.isArray(t.needs); }
  function taskById(id) { var l = db().tasks; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function canEdit() { return !document.body.classList.contains('readonly'); }
  function rid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function stDefs() { return (db().settings && db().settings.taskStatuses) || []; }
  function defaultStatus() { var d = stDefs().filter(function (x) { return x.type === 'todo'; })[0] || stDefs()[0]; return d ? d.name : 'To do'; }
  function statusBadge(s) { var d = stDefs().filter(function (x) { return x.name === s; })[0] || {}; return '<span class="badge b-' + esc(d.color || 'neutral') + '">' + esc(s) + '</span>'; }
  function wsName(t) { return t.workstream || NO_NAME; }
  function wsList() { return App.allWorkstreams ? App.allWorkstreams() : (db().settings.workstreams || []); }
  function wsTag(w) { return w === NO_NAME ? '<span class="ws">' + esc(w) + '</span>' : App.wsTag(w); }
  // "design belum selesai" = bukan pilihan pertama (mis. Doesn't Need) dan bukan pilihan terakhir (mis. Done)
  function designPending(v) { var c = colByKey('design'), o = (c && c.options) || DESIGN; return !!v && v !== o[0] && v !== o[o.length - 1]; }
  function dcls(v) {
    var c = colByKey('design'), o = (c && c.options) || DESIGN, i = o.indexOf(v);
    return i < 0 ? 'none' : i === 0 ? 'none' : i === o.length - 1 ? 'done' : i === 1 ? 'todo' : 'doing';
  }
  function stats(list) {
    var tot = 0, r = 0, dsg = 0;
    list.forEach(function (t) { (t.needs || []).forEach(function (x) { tot++; if (x.ready) r++; if (designPending(x.design)) dsg++; }); });
    return { total: tot, ready: r, design: dsg, pct: tot ? Math.round(r / tot * 100) : 0 };
  }
  function save(msg) { keepY = window.scrollY; App.commit(msg); }
  function wsOptions(cur) {
    var l = wsList().slice(); if (cur && l.indexOf(cur) < 0) l.unshift(cur);
    return l.map(function (w) { return '<option value="' + esc(w) + '"' + (w === cur ? ' selected' : '') + '>' + esc(w) + '</option>'; }).join('');
  }

  /* ---------- sel per tipe kolom ---------- */
  function cellHtml(c, x, b, k) {
    var v = x[c.key], id = k + esc(c.key), a = 'id="' + id + '" ' + b + ' data-nf="' + esc(c.key) + '" aria-label="' + esc(c.label) + '"';
    if (c.type === 'checkbox') return '<td class="need-chk"><input type="checkbox" ' + a + (v ? ' checked' : '') + '></td>';
    if (c.type === 'textarea') return '<td><textarea class="input need-notes" ' + a + ' rows="1">' + esc(v == null ? '' : v) + '</textarea></td>';
    if (c.type === 'select') {
      var o = (c.options || []).slice(); if (v && o.indexOf(v) < 0) o.push(v);
      return '<td><select class="input' + (c.key === 'design' ? ' need-d-' + dcls(v) : '') + '" ' + a + '>' + (c.key === 'design' ? '' : '<option value=""></option>') +
        o.map(function (d) { return '<option' + (d === v ? ' selected' : '') + '>' + esc(d) + '</option>'; }).join('') + '</select></td>';
    }
    if (c.type === 'date') return '<td><input class="input" type="date" ' + a + ' value="' + esc(v || '') + '"></td>';
    return '<td><input class="input" ' + a + ' value="' + esc(v == null ? '' : v) + '"' + (c.type === 'number' || c.key === 'qty' ? ' inputmode="decimal"' : '') + '></td>';
  }

  /* ---------- page ---------- */
  function stationCard(t, C) {
    var s = stats([t]), iid = esc(t.id);
    var h = '<section class="need-card"><div class="need-head"><div class="need-title"><h3>' + esc(t.name) + '</h3>' +
      '<span class="muted">' + (t.area ? esc(t.area) + ' · ' : '') + (t.deadline ? 'Deadline ' + App.fmtDate(t.deadline, true) + ' · ' : '') + statusBadge(t.status) + '</span>' +
      (t.notes ? '<span class="muted need-note">' + esc(t.notes) + '</span>' : '') + '</div>' +
      '<div class="need-prog" aria-label="' + s.ready + ' dari ' + s.total + ' siap"><b>' + s.ready + '/' + s.total + '</b><div class="need-bar"><i style="width:' + s.pct + '%"></i></div></div>' +
      '<div class="need-actions">' +
      '<select class="select need-ws-in" id="ws-' + iid + '" data-nf="__ws" data-id="' + iid + '" aria-label="Workstream ' + esc(t.name) + '" title="Pindah ke workstream lain">' + wsOptions(t.workstream || '') + '</select>' +
      '<input class="input need-area-in" id="area-' + iid + '" data-nf="__area" data-id="' + iid + '" value="' + esc(t.area || '') + '" placeholder="Lokasi" aria-label="Lokasi ' + esc(t.name) + '" list="needAreaList">' +
      '<button class="btn sm" data-act="edit-task" data-id="' + iid + '">Buka Task</button></div></div>' +
      '<div class="table-wrap"><table class="need-tbl" data-rz="needs" style="min-width:' + (88 + C.reduce(function (a, c) { return a + colWidth(c); }, 0)) + 'px"><colgroup><col style="width:44px">' +
      C.map(function (c) { return '<col style="width:' + colWidth(c) + 'px">'; }).join('') + '<col style="width:44px"></colgroup>' +
      '<thead><tr><th data-ck="__no">No</th>' + C.map(function (c) { return '<th data-ck="' + esc(c.key) + '"' + (c.type === 'checkbox' ? ' class="c"' : '') + '>' + esc(c.label) + '</th>'; }).join('') + '<th data-ck="__del"></th></tr></thead><tbody>';
    h += t.needs.length ? t.needs.map(function (x, i) {
      var b = 'data-id="' + iid + '" data-nid="' + esc(x.id) + '"', k = 'n-' + esc(x.id) + '-';
      return '<tr class="' + (x.ready ? 'need-ok' : '') + '"><td class="faint">' + (i + 1) + '</td>' + C.map(function (c) { return cellHtml(c, x, b, k); }).join('') +
        '<td><button class="btn sm ghost" data-nact="del" ' + b + ' aria-label="Hapus ' + esc(x.item) + '">✕</button></td></tr>';
    }).join('') : '<tr><td colspan="' + (C.length + 2) + '" class="faint" style="padding:12px">Belum ada need.</td></tr>';
    return h + '</tbody></table></div><div class="need-foot"><button class="btn sm" data-nact="add" data-id="' + iid + '">+ Tambah Need</button></div></section>';
  }
  function pageHtml() {
    var list = db().tasks.filter(isStation), C = visCols(), cReady = colByKey('ready'), cDesign = colByKey('design');
    var h = '<div class="page-head"><div><h1>Need per Station</h1><p>Checklist keperluan tiap station, dikelompokkan per workstream. Setiap station adalah sebuah task — buka task-nya untuk deadline, PIC, dan status.</p></div>' +
      '<div class="toolbar" style="margin:0"><button class="btn" data-nact="manage-cols">Manage Columns</button><button class="btn primary" data-nact="new-station">+ Station Baru</button></div></div>';
    if (!list.length) {
      return h + '<div class="need-empty"><p>Belum ada station.</p><button class="btn primary" data-nact="seed">Isi dari Sheet Need per Station</button> ' +
        '<span class="muted">atau buat sendiri dengan “+ Station baru”, atau aktifkan checklist di task yang sudah ada (Tasks → buka baris → “+ Checklist need”).</span></div>';
    }
    var all = stats(list);
    h += '<div class="need-stats"><div><b>' + list.length + '</b><span>Station</span></div>' +
      (cReady && cReady.visible !== false ? '<div><b>' + all.ready + '/' + all.total + '</b><span>' + esc(statLabel(cReady.label, 'Siap')) + '</span></div>' : '') +
      (cDesign && cDesign.visible !== false ? '<div><b>' + all.design + '</b><span>' + esc(statLabel(cDesign.label, 'Belum Selesai')) + '</span></div>' : '') + '</div>';
    // kelompok per workstream, urutan mengikuti Manage Categories
    var groups = {}, order = wsList().slice();
    list.forEach(function (t) { var w = wsName(t); (groups[w] = groups[w] || []).push(t); if (order.indexOf(w) < 0) order.push(w); });
    order.filter(function (w) { return groups[w]; }).forEach(function (w) {
      var g = groups[w].sort(function (a, b) { return String(a.area || '~').localeCompare(String(b.area || '~')) || String(a.name).localeCompare(String(b.name)); }), gs = stats(g);
      h += '<div class="need-ws"><h2>' + wsTag(w) + '</h2><span class="muted">' + g.length + ' station · ' + gs.ready + '/' + gs.total + ' siap</span>' +
        '<button class="btn sm ghost" data-nact="new-station" data-ws="' + esc(w === NO_NAME ? '' : w) + '">+ Station di ' + esc(w) + '</button></div>';
      g.forEach(function (t) { h += stationCard(t, C); });
    });
    var areas = {}; db().tasks.forEach(function (t) { if (t.area) areas[t.area] = 1; });
    return h + '<datalist id="needAreaList">' + Object.keys(areas).map(function (a) { return '<option value="' + esc(a) + '">'; }).join('') + '</datalist>';
  }

  // Isi halaman = semua elemen di main setelah admin-bar & banner. Layar login/loading tidak disentuh.
  function pageStart() {
    var c = main.firstElementChild;
    if (!c || /(^|\s)(gate|empty)(\s|$)/.test(c.className) || main.querySelector('.gate-card, .gate-form')) return null;
    while (c && /(^|\s)(admin-bar|banner)(\s|$)/.test(c.className)) c = c.nextElementSibling;
    return c;
  }
  function paint() {
    var head = pageStart();
    if (!head) return;
    var fid = document.activeElement && document.activeElement.id, sel = null;
    try { sel = document.activeElement.selectionStart; } catch (e) {}
    painting = true;
    while (head.nextSibling) main.removeChild(head.nextSibling);
    main.removeChild(head);
    main.insertAdjacentHTML('beforeend', pageHtml());
    if (!canEdit()) main.querySelectorAll('[data-nf],[data-nact]:not([data-nact="manage-cols"])').forEach(function (el) { el.disabled = true; });
    try { if (App.rzApply) App.rzApply(main); } catch (e) {}
    markNav();
    if (keepY != null) { window.scrollTo(window.scrollX, keepY); keepY = null; }
    if (fid && /^(n-|area-|ws-)/.test(fid)) { var el = document.getElementById(fid); if (el) { el.focus({ preventScroll: true }); try { if (sel != null) el.setSelectionRange(sel, sel); } catch (e) {} } }
    obs.takeRecords(); painting = false;
  }
  function markNav() {
    document.querySelectorAll('#nav button').forEach(function (b) {
      if (b.hasAttribute('data-needs-nav')) b.setAttribute('aria-current', active ? 'page' : 'false');
      else if (active) b.setAttribute('aria-current', 'false');
    });
  }

  /* ---------- integrasi di halaman Tasks ---------- */
  function decorate() {
    main.querySelectorAll('tr.row[data-id]').forEach(function (tr) {
      var t = taskById(tr.dataset.id); if (!t) return;
      var sub = tr.querySelector('.tsub');
      if (sub && isStation(t) && !sub.querySelector('.need-chip')) { var s = stats([t]); sub.insertAdjacentHTML('beforeend', ' <span class="need-chip">Need ' + s.ready + '/' + s.total + '</span>'); }
      if (tr.classList.contains('expanded')) {
        var det = tr.nextElementSibling && tr.nextElementSibling.querySelector('.detail');
        if (!det || det.hasAttribute('data-needs-deco')) return;
        det.setAttribute('data-needs-deco', '1');
        var actions = det.querySelector('.actions');
        if (isStation(t)) {
          var s2 = stats([t]), box = document.createElement('div');
          box.innerHTML = '<h4>Need per station · ' + s2.ready + '/' + s2.total + ' siap</h4>' + (t.needs.length ? '<ul class="need-mini">' + t.needs.map(function (x) {
            return '<li class="' + (x.ready ? 'ok' : '') + '"><input type="checkbox" disabled' + (x.ready ? ' checked' : '') + ' aria-label="' + (x.ready ? 'Siap' : 'Belum siap') + '"> ' + esc(x.item || '—') + (x.qty !== '' && x.qty != null ? ' <b>×' + esc(x.qty) + '</b>' : '') + '</li>';
          }).join('') + '</ul>' : '<p class="faint">Belum ada need.</p>') + '<p style="margin-top:6px"><a href="#needs" data-nact="open">Buka di Need per Station →</a></p>';
          if (actions) det.insertBefore(box, actions); else det.appendChild(box);
        } else if (actions && canEdit()) {
          actions.insertAdjacentHTML('afterbegin', '<button class="btn sm" data-nact="enable" data-id="' + esc(t.id) + '">+ Checklist Need</button>');
        }
      }
    });
  }

  /* ---------- observer: jaga halaman kita tetap tampil setelah app.js render ulang ---------- */
  var obs = new MutationObserver(function () { if (painting) return; if (active) paint(); else decorate(); });
  obs.observe(main, { childList: true });

  function open() {
    active = true;
    try { history.replaceState(null, '', '#needs'); } catch (e) {}
    App.render();
    if (!main.querySelector('.need-card, .need-empty, .need-stats')) paint();
  }
  function leave() { active = false; markNav(); }

  /* ---------- nav ---------- */
  var btn = document.createElement('button');
  btn.type = 'button'; btn.setAttribute('data-needs-nav', '1');
  btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2.5" width="12" height="11" rx="1"/><path d="M4.5 6l1 1 2-2M4.5 10.5l1 1 2-2M9 6h3M9 10.5h3"/></svg>Need per Station';
  var tasksBtn = nav.querySelector('button[data-page="tasks"]');
  if (tasksBtn && tasksBtn.nextSibling) nav.insertBefore(btn, tasksBtn.nextSibling); else nav.appendChild(btn);
  btn.addEventListener('click', open);
  nav.addEventListener('click', function (e) { var b = e.target.closest('button[data-page]'); if (b) leave(); }, true);
  window.addEventListener('hashchange', function () {
    var h = location.hash.replace('#', '');
    if (h === 'needs') { if (!active) open(); }
    else if (active) { leave(); if (h && App.go) App.go(h); else App.render(); }
  });

  /* ---------- aksi ---------- */
  function seed() {
    var have = {}; db().tasks.forEach(function (t) { have[String(t.name).toLowerCase()] = 1; });
    var n = 0;
    SEED.forEach(function (s) {
      if (have[s.name.toLowerCase()]) return;
      db().tasks.push(newTask(s.name, s.area, '', s.note, s.items.map(function (r) { return { id: rid('N'), item: r[0], qty: r[1], design: r[2], ready: !!r[3], notes: r[4] }; }))); n++;
    });
    save(n ? n + ' station ditambahkan' : 'Semua station sudah ada');
  }
  function newTask(name, area, deadline, note, needs, ws) {
    return { id: rid('TN'), createdAt: Date.now(), updatedAt: Date.now(), name: name, workstream: ws || (App.wsCurrent ? App.wsCurrent('Event Day') : 'Event Day'), category: 'Procurement', start: '', deadline: deadline || '',
      pic: '', status: defaultStatus(), notes: note || '', blockers: '', dependencies: '', source: 'confirmed', verifyNote: '', area: area || '', needs: needs };
  }
  function stationForm(ws) {
    var def = ws || (App.wsCurrent ? App.wsCurrent('Event Day') : 'Event Day');
    App.openModal('<form id="nsForm" novalidate><div class="modal-h"><h3>Station Baru</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b form-grid">' +
      App.field('name', 'Nama station', App.inp('name', '', 'text', 'maxlength="160" required'), { req: true, full: true, hint: 'Station ini otomatis juga menjadi sebuah task.' }) +
      App.field('workstream', 'Workstream', '<select class="select" id="f-workstream" name="workstream">' + wsOptions(def) + '</select>') +
      App.field('area', 'Lokasi', App.inp('area', '', 'text', 'list="needAreaList" placeholder="Basement, Lt. 3, …"')) +
      App.field('deadline', 'Deadline (opsional)', App.inp('deadline', '', 'date')) +
      '</div><div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">Buat Station</button></div></div></form>', 'sm');
    document.getElementById('nsForm').onsubmit = function (e) {
      e.preventDefault();
      var fd = new FormData(e.target), v = {}; fd.forEach(function (val, k) { v[k] = String(val).trim(); });
      if (!v.name) { App.showErrors(e.target, { name: 'Nama station wajib diisi.' }); return; }
      db().tasks.push(newTask(v.name, v.area, v.deadline, '', [], v.workstream)); App.closeModal(); save('Station dibuat');
    };
  }
  function guard() { if (!canEdit()) { App.toast('Hanya admin yang bisa mengubah data.', true); return false; } return true; }

  /* ---------- Manage Columns (Need per Station) ---------- */
  function ncErr(m) { var el = document.getElementById('ncErr'); if (el) { el.textContent = m; el.hidden = !m; } }
  function colManager() {
    var C = cols();
    var rows = C.map(function (c, i) {
      var b = builtin(c.key);
      return '<div class="col-row' + (c.visible === false ? ' off' : '') + '" data-ri="' + i + '">' + (App.DRAG_GRIP || '') +
        '<label class="col-vis" title="Tampilkan di tabel"><input type="checkbox" data-ncv="' + i + '"' + (c.visible !== false ? ' checked' : '') + (b && b.locked ? ' disabled' : '') + '></label>' +
        '<input class="input" id="ncl-' + i + '" value="' + esc(c.label) + '" maxlength="60" aria-label="Nama kolom">' +
        '<span class="col-type">' + esc(typeLabel(c.type)) + (b ? ' · Bawaan' : '') +
          (c.type === 'select' ? '<input class="input" id="nco-' + i + '" value="' + esc((c.options || []).join(', ')) + '" placeholder="Pilihan, pisahkan koma" aria-label="Pilihan dropdown">' : '') + '</span>' +
        '<span class="st-btns">' + (b ? '<span class="col-lock">' + (b.locked ? 'wajib' : 'bawaan') + '</span>' : '<button class="btn sm danger" type="button" data-nact="col-del" data-idx="' + i + '">Hapus</button>') + '</span></div>';
    }).join('');
    App.openModal('<form id="ncForm" novalidate><div class="modal-h"><h3>Manage Columns · Need per Station</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div>' +
      '<div class="modal-b one"><p class="muted" style="margin:0">Urutan dari atas ke bawah = urutan kolom dari kiri ke kanan (drag ⋮⋮ untuk ubah urutan). Centang = tampil di tabel. Ganti judul kolom langsung di kotaknya. Untuk kolom dropdown, isi pilihannya dipisah koma (urutan pilihan pertama sampai terakhir dipakai untuk warna Design: pertama = tidak perlu, terakhir = selesai). Kolom bawaan hanya bisa disembunyikan; kolom tambahan yang dihapus ikut menghapus isinya.</p>' +
      '<div class="cat-list" data-reorder="hook:needcols">' + rows + '</div>' +
      '<div class="col-add"><input class="input" id="ncNew" placeholder="Nama kolom baru, mis. PIC, Vendor, Link" maxlength="60"><select class="select" id="ncNewType" aria-label="Tipe kolom">' +
      TYPES.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('') + '</select>' +
      '<input class="input" id="ncNewOpts" placeholder="Pilihan dropdown, pisahkan koma" hidden><button type="button" class="btn" data-nact="col-add">+ Tambah Kolom</button></div>' +
      '<div class="form-err" id="ncErr" hidden></div></div>' +
      '<div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Tutup</button><button type="submit" class="btn primary">Simpan</button></div></div></form>', 'wide');
    var ty = document.getElementById('ncNewType'), op = document.getElementById('ncNewOpts');
    if (ty) ty.addEventListener('change', function () { op.hidden = ty.value !== 'select'; });
    var nw = document.getElementById('ncNew'); if (nw) nw.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); colAdd(); } });
    document.getElementById('ncForm').onsubmit = function (e) { e.preventDefault(); if (!guard()) return; if (colApply()) { App.closeModal(); save('Kolom disimpan'); } };
  }
  function splitOpts(s) { return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(function (x, j, a) { return x && a.indexOf(x) === j; }); }
  // baca judul / tampil / pilihan dari dialog ke settings; false kalau ada yang salah
  function colApply() {
    var C = cols(), names = [];
    for (var i = 0; i < C.length; i++) {
      var el = document.getElementById('ncl-' + i); if (!el) continue;
      var nm = el.value.trim();
      if (!nm) { ncErr('Judul kolom tidak boleh kosong.'); el.focus(); return false; }
      if (names.indexOf(nm.toLowerCase()) > -1) { ncErr('Judul kolom "' + nm + '" dipakai dua kali.'); el.focus(); return false; }
      names.push(nm.toLowerCase());
      var op = document.getElementById('nco-' + i);
      if (op && !splitOpts(op.value).length) { ncErr('Kolom "' + nm + '" butuh minimal satu pilihan.'); op.focus(); return false; }
    }
    C.forEach(function (c, i) {
      var el = document.getElementById('ncl-' + i), vis = document.querySelector('[data-ncv="' + i + '"]'), op = document.getElementById('nco-' + i);
      if (el) c.label = el.value.trim();
      if (vis && !vis.disabled) c.visible = vis.checked;
      if (op) c.options = splitOpts(op.value);
    });
    return true;
  }
  function colAdd() {
    if (!guard() || !colApply()) return;
    var nm = (document.getElementById('ncNew').value || '').trim(), type = document.getElementById('ncNewType').value;
    if (!nm) { ncErr('Isi nama kolom dulu.'); return; }
    if (cols().some(function (c) { return c.label.toLowerCase() === nm.toLowerCase(); })) { ncErr('Kolom "' + nm + '" sudah ada.'); return; }
    var o = type === 'select' ? splitOpts(document.getElementById('ncNewOpts').value) : undefined;
    if (type === 'select' && !o.length) { ncErr('Isi pilihan dropdown dulu, pisahkan koma.'); return; }
    cols().push({ key: rid('c'), label: nm, type: type, visible: true, options: o });
    save('Kolom "' + nm + '" ditambahkan'); colManager();
  }
  function colDel(i) {
    if (!guard() || !colApply()) return;
    var C = cols(), c = C[i]; if (!c || builtin(c.key)) return;
    var used = 0; db().tasks.forEach(function (t) { (t.needs || []).forEach(function (x) { if (x[c.key] != null && x[c.key] !== '' && x[c.key] !== false) used++; }); });
    App.confirmDialog('Hapus kolom "' + c.label + '"?', used ? 'Isi kolom ini di ' + used + ' baris need ikut terhapus.' : 'Kolom ini belum ada isinya.', 'Hapus Kolom', function () {
      db().settings.needCols = cols().filter(function (x) { return x.key !== c.key; });
      db().tasks.forEach(function (t) { (t.needs || []).forEach(function (x) { delete x[c.key]; }); });
      save('Kolom dihapus'); colManager();
    });
  }
  if (App.onReorder) App.onReorder('needcols', function (from, to) {
    if (!guard() || !colApply()) return;
    var C = cols(); if (to >= C.length) return;
    C.splice(to, 0, C.splice(from, 1)[0]);
    save(); colManager();
  });

  function onAct(e) {
    var el = e.target.closest('[data-nact]'); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    var act = el.dataset.nact, t = taskById(el.dataset.id);
    if (act === 'open') { open(); return; }
    if (act === 'manage-cols') { colManager(); return; }
    if (!guard()) return;
    if (act === 'seed') seed();
    else if (act === 'new-station') stationForm(el.dataset.ws);
    else if (act === 'col-add') colAdd();
    else if (act === 'col-del') colDel(+el.dataset.idx);
    else if (act === 'enable' && t && !isStation(t)) { t.needs = []; t.updatedAt = Date.now(); save('Checklist need aktif'); open(); }
    else if (act === 'add' && t && isStation(t)) {
      var nn = { id: rid('N'), item: '', qty: '', design: (cols().filter(function (c) { return c.key === 'design'; })[0].options || DESIGN)[0], ready: false, notes: '' };
      t.needs.push(nn); t.updatedAt = Date.now(); save();
      setTimeout(function () { var i = document.getElementById('n-' + nn.id + '-item'); if (i) i.focus(); }, 0);
    } else if (act === 'del' && t && isStation(t)) { t.needs = t.needs.filter(function (x) { return x.id !== el.dataset.nid; }); t.updatedAt = Date.now(); save(); }
  }
  main.addEventListener('click', onAct, true);
  var modalRoot = document.getElementById('modalRoot');
  if (modalRoot) modalRoot.addEventListener('click', onAct, true);

  main.addEventListener('change', function (e) {
    var el = e.target; if (!el.dataset || !el.dataset.nf) return;
    e.stopPropagation();
    if (!guard()) return;
    var t = taskById(el.dataset.id); if (!t) return;
    var f = el.dataset.nf;
    if (f === '__area') t.area = el.value.trim();
    else if (f === '__ws') {
      var old = t.workstream, nw = el.value;
      t.workstream = nw;
      if (Array.isArray(t.workstreams)) t.workstreams = [nw].concat(t.workstreams.filter(function (w) { return w !== old && w !== nw; }));
      t.updatedAt = Date.now(); save('Station dipindah ke ' + nw); return;
    } else {
      var nd = (t.needs || []).filter(function (x) { return x.id === el.dataset.nid; })[0]; if (!nd) return;
      nd[f] = el.type === 'checkbox' ? el.checked : el.value.trim();
    }
    t.updatedAt = Date.now(); save();
  }, true);

  /* ---------- CSS ---------- */
  var css = document.createElement('style'); css.id = 'gx-needs-css';
  css.textContent = [
    '.need-stats{display:flex;gap:12px;flex-wrap:wrap;margin:0 20px 8px}',
    '.need-stats>div{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 16px;min-width:140px}',
    '.need-stats b{display:block;font-size:22px;font-variant-numeric:tabular-nums}',
    '.need-stats span{font-size:12px;color:var(--muted)}',
    '.need-ws{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:26px 20px 10px}',
    '.need-ws h2{margin:0;font-size:15px;line-height:1}.need-ws h2 .ws{font-size:13px;padding:4px 10px}',
    '.need-ws>.muted{font-size:12.5px}.need-ws .btn{margin-left:auto}',
    '.need-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;margin:0 20px 14px;overflow:hidden;min-width:0}',
    '.need-head{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 14px;border-bottom:1px solid var(--line)}',
    '.need-title{min-width:0;flex:1 1 220px}.need-title h3{margin:0;font-size:15px;overflow-wrap:anywhere}',
    '.need-title .muted{display:block;font-size:12.5px}.need-note{overflow-wrap:anywhere;white-space:pre-wrap}',
    '.need-prog{display:flex;align-items:center;gap:8px;min-width:130px}.need-prog b{font-variant-numeric:tabular-nums;font-size:13px}',
    '.need-bar{flex:1;height:7px;background:rgba(128,128,128,.2);border-radius:99px;overflow:hidden;min-width:70px}',
    '.need-bar i{display:block;height:100%;background:var(--accent)}',
    '.need-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.need-area-in{width:130px}.need-ws-in{width:170px;max-width:100%}',
    '.need-card .table-wrap{border:0;border-radius:0;box-shadow:none;max-height:none}',
    '.need-tbl{width:100%;border-collapse:collapse;table-layout:fixed;min-width:640px}',
    '.need-tbl th,.need-tbl td{padding:6px 8px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}',
    '.need-tbl th{font-size:11.5px;color:var(--muted);font-weight:500;position:relative}',
    '.need-tbl th.c{text-align:center}',
    '.need-tbl .input{width:100%;min-width:0;box-sizing:border-box}',
    '.need-notes{resize:vertical;min-height:34px;max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:pre-wrap;field-sizing:content}',
    '.need-chk{text-align:center;padding-top:12px !important}',
    '.need-chk input{width:18px;height:18px;margin:0;cursor:pointer;accent-color:var(--accent);vertical-align:middle}',
    '.need-ok td:first-child{box-shadow:inset 3px 0 0 var(--accent)}',
    '.need-d-done{color:#8fbf7a}.need-d-doing{color:var(--accent)}.need-d-todo{color:#e0a458}.need-d-none{color:var(--muted)}',
    '.need-foot{padding:8px 14px}',
    '.need-empty{margin:20px;padding:28px;border:1px dashed var(--line);border-radius:12px;text-align:center}',
    '.need-chip{display:inline-block;margin-left:6px;font-size:11px;padding:1px 7px;border-radius:6px;border:1px solid var(--line);color:var(--muted)}',
    '.need-mini{list-style:none;margin:0;padding:0}.need-mini li{padding:2px 0;overflow-wrap:anywhere;display:flex;align-items:center;gap:6px}.need-mini li.ok{color:var(--muted)}',
    '.need-mini input{margin:0;accent-color:var(--accent)}'
  ].join('\n');
  document.head.appendChild(css);

  if (location.hash === '#needs') { active = true; }
  if (pageStart()) { if (active) paint(); else decorate(); }
})();
