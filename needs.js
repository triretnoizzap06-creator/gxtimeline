/* GX27 — Need per Station (add-on).
   Satu file mandiri: tidak mengubah app.js / styles.css. Memakai API resmi window.GX27App.
   Satu station = satu task. Daftar need disimpan di dalam task itu sendiri (task.needs),
   jadi ikut tersimpan & tersinkron seperti task biasa. */
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
  function stats(t) {
    var n = t.needs || [], r = n.filter(function (x) { return x.ready; }).length;
    return { total: n.length, ready: r, design: n.filter(function (x) { return x.design === 'Not Started' || x.design === 'In Progress'; }).length, pct: n.length ? Math.round(r / n.length * 100) : 0 };
  }
  function dcls(d) { return d === 'Done' ? 'done' : d === 'In Progress' ? 'doing' : d === 'Not Started' ? 'todo' : 'none'; }
  function save(msg) { keepY = window.scrollY; App.commit(msg); }

  /* ---------- page ---------- */
  function pageHtml() {
    var list = db().tasks.filter(isStation).sort(function (a, b) { return String(a.area || '~').localeCompare(String(b.area || '~')) || String(a.name).localeCompare(String(b.name)); });
    var tot = 0, rdy = 0, dsg = 0;
    list.forEach(function (t) { var s = stats(t); tot += s.total; rdy += s.ready; dsg += s.design; });
    var h = '<div class="page-head"><div><h1>Need per Station</h1><p>Checklist keperluan tiap station. Setiap station adalah sebuah task — buka task-nya untuk deadline, PIC, dan status.</p></div>' +
      '<div class="toolbar" style="margin:0"><button class="btn primary" data-nact="new-station">+ Station Baru</button></div></div>';
    if (!list.length) {
      return h + '<div class="need-empty"><p>Belum ada station.</p><button class="btn primary" data-nact="seed">Isi dari Sheet Need per Station</button> ' +
        '<span class="muted">atau buat sendiri dengan “+ Station baru”, atau aktifkan checklist di task yang sudah ada (Tasks → buka baris → “+ Checklist need”).</span></div>';
    }
    h += '<div class="need-stats"><div><b>' + list.length + '</b><span>Station</span></div><div><b>' + rdy + '/' + tot + '</b><span>Perlengkapan Siap</span></div><div><b>' + dsg + '</b><span>Design Belum Selesai</span></div></div>';
    var last = null;
    list.forEach(function (t) {
      var area = t.area || 'Tanpa lokasi', s = stats(t), iid = esc(t.id);
      if (area !== last) { h += '<h2 class="need-area">' + esc(area) + '</h2>'; last = area; }
      h += '<section class="need-card"><div class="need-head"><div class="need-title"><h3>' + esc(t.name) + '</h3>' +
        '<span class="muted">' + (t.deadline ? 'Deadline ' + App.fmtDate(t.deadline, true) + ' · ' : '') + statusBadge(t.status) + '</span>' +
        (t.notes ? '<span class="muted need-note">' + esc(t.notes) + '</span>' : '') + '</div>' +
        '<div class="need-prog" aria-label="' + s.ready + ' dari ' + s.total + ' siap"><b>' + s.ready + '/' + s.total + '</b><div class="need-bar"><i style="width:' + s.pct + '%"></i></div></div>' +
        '<div class="need-actions"><input class="input need-area-in" id="area-' + iid + '" data-nf="area" data-id="' + iid + '" value="' + esc(t.area || '') + '" placeholder="Lokasi" aria-label="Lokasi ' + esc(t.name) + '" list="needAreaList">' +
        '<button class="btn sm" data-act="edit-task" data-id="' + iid + '">Buka Task</button></div></div>' +
        '<div class="table-wrap"><table class="need-tbl"><colgroup><col style="width:40px"><col style="width:30%"><col style="width:76px"><col style="width:140px"><col style="width:104px"><col><col style="width:44px"></colgroup>' +
        '<thead><tr><th>No</th><th>Keperluan</th><th>Qty</th><th>Design</th><th>Perlengkapan</th><th>Notes</th><th></th></tr></thead><tbody>' +
        (t.needs.length ? t.needs.map(function (x, i) {
          var b = 'data-id="' + iid + '" data-nid="' + esc(x.id) + '"', k = 'n-' + esc(x.id) + '-';
          return '<tr class="' + (x.ready ? 'need-ok' : '') + '"><td class="faint">' + (i + 1) + '</td>' +
            '<td><input class="input" id="' + k + 'item" ' + b + ' data-nf="item" value="' + esc(x.item) + '" aria-label="Keperluan"></td>' +
            '<td><input class="input" id="' + k + 'qty" ' + b + ' data-nf="qty" value="' + esc(x.qty == null ? '' : x.qty) + '" inputmode="numeric" aria-label="Qty"></td>' +
            '<td><select class="input need-d-' + dcls(x.design) + '" id="' + k + 'design" ' + b + ' data-nf="design" aria-label="Design">' + DESIGN.map(function (d) { return '<option' + (d === x.design ? ' selected' : '') + '>' + esc(d) + '</option>'; }).join('') + '</select></td>' +
            '<td class="need-chk"><label><input type="checkbox" id="' + k + 'ready" ' + b + ' data-nf="ready"' + (x.ready ? ' checked' : '') + '> <span>' + (x.ready ? '✅ Siap' : '❌ Belum') + '</span></label></td>' +
            '<td><textarea class="input need-notes" id="' + k + 'notes" ' + b + ' data-nf="notes" rows="1" aria-label="Notes">' + esc(x.notes) + '</textarea></td>' +
            '<td><button class="btn sm ghost" data-nact="del" ' + b + ' aria-label="Hapus ' + esc(x.item) + '">✕</button></td></tr>';
        }).join('') : '<tr><td colspan="7" class="faint" style="padding:12px">Belum ada need.</td></tr>') +
        '</tbody></table></div><div class="need-foot"><button class="btn sm" data-nact="add" data-id="' + iid + '">+ Tambah Need</button></div></section>';
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
    if (!canEdit()) main.querySelectorAll('[data-nf],[data-nact]').forEach(function (el) { el.disabled = true; });
    markNav();
    if (keepY != null) { window.scrollTo(window.scrollX, keepY); keepY = null; }
    if (fid && /^(n-|area-)/.test(fid)) { var el = document.getElementById(fid); if (el) { el.focus({ preventScroll: true }); try { if (sel != null) el.setSelectionRange(sel, sel); } catch (e) {} } }
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
      if (sub && isStation(t) && !sub.querySelector('.need-chip')) { var s = stats(t); sub.insertAdjacentHTML('beforeend', ' <span class="need-chip">Need ' + s.ready + '/' + s.total + '</span>'); }
      if (tr.classList.contains('expanded')) {
        var det = tr.nextElementSibling && tr.nextElementSibling.querySelector('.detail');
        if (!det || det.hasAttribute('data-needs-deco')) return;
        det.setAttribute('data-needs-deco', '1');
        var actions = det.querySelector('.actions');
        if (isStation(t)) {
          var s2 = stats(t), box = document.createElement('div');
          box.innerHTML = '<h4>Need per station · ' + s2.ready + '/' + s2.total + ' siap</h4>' + (t.needs.length ? '<ul class="need-mini">' + t.needs.map(function (x) {
            return '<li class="' + (x.ready ? 'ok' : '') + '"><span aria-hidden="true">' + (x.ready ? '✅' : '❌') + '</span> ' + esc(x.item || '—') + (x.qty !== '' && x.qty != null ? ' <b>×' + esc(x.qty) + '</b>' : '') + '</li>';
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
  function newTask(name, area, deadline, note, needs) {
    return { id: rid('TN'), createdAt: Date.now(), updatedAt: Date.now(), name: name, workstream: 'Event Day', category: 'Procurement', start: '', deadline: deadline || '',
      pic: '', status: defaultStatus(), notes: note || '', blockers: '', dependencies: '', source: 'confirmed', verifyNote: '', area: area || '', needs: needs };
  }
  function stationForm() {
    App.openModal('<form id="stForm" novalidate><div class="modal-h"><h3>Station Baru</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b form-grid">' +
      App.field('name', 'Nama station', App.inp('name', '', 'text', 'maxlength="160" required'), { req: true, full: true, hint: 'Station ini otomatis juga menjadi sebuah task.' }) +
      App.field('area', 'Lokasi', App.inp('area', '', 'text', 'list="needAreaList" placeholder="Basement, Lt. 3, …"')) +
      App.field('deadline', 'Deadline (opsional)', App.inp('deadline', '', 'date')) +
      '</div><div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">Buat Station</button></div></div></form>', 'sm');
    document.getElementById('stForm').onsubmit = function (e) {
      e.preventDefault();
      var fd = new FormData(e.target), v = {}; fd.forEach(function (val, k) { v[k] = String(val).trim(); });
      if (!v.name) { App.showErrors(e.target, { name: 'Nama station wajib diisi.' }); return; }
      db().tasks.push(newTask(v.name, v.area, v.deadline, '', [])); App.closeModal(); save('Station dibuat');
    };
  }
  function guard() { if (!canEdit()) { App.toast('Hanya admin yang bisa mengubah data.', true); return false; } return true; }

  main.addEventListener('click', function (e) {
    var el = e.target.closest('[data-nact]'); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    var act = el.dataset.nact, t = taskById(el.dataset.id);
    if (act === 'open') { open(); return; }
    if (!guard()) return;
    if (act === 'seed') seed();
    else if (act === 'new-station') stationForm();
    else if (act === 'enable' && t && !isStation(t)) { t.needs = []; t.updatedAt = Date.now(); save('Checklist need aktif'); open(); }
    else if (act === 'add' && t && isStation(t)) {
      var nn = { id: rid('N'), item: '', qty: '', design: "Doesn't Need", ready: false, notes: '' };
      t.needs.push(nn); t.updatedAt = Date.now(); save();
      setTimeout(function () { var i = document.getElementById('n-' + nn.id + '-item'); if (i) i.focus(); }, 0);
    } else if (act === 'del' && t && isStation(t)) { t.needs = t.needs.filter(function (x) { return x.id !== el.dataset.nid; }); t.updatedAt = Date.now(); save(); }
  }, true);

  main.addEventListener('change', function (e) {
    var el = e.target; if (!el.dataset || !el.dataset.nf) return;
    e.stopPropagation();
    if (!guard()) return;
    var t = taskById(el.dataset.id); if (!t) return;
    if (el.dataset.nf === 'area') { t.area = el.value.trim(); }
    else {
      var nd = (t.needs || []).filter(function (x) { return x.id === el.dataset.nid; })[0]; if (!nd) return;
      nd[el.dataset.nf] = el.dataset.nf === 'ready' ? el.checked : el.value.trim();
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
    '.need-area{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:22px 20px 8px;font-weight:600}',
    '.need-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;margin:0 20px 14px;overflow:hidden;min-width:0}',
    '.need-head{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 14px;border-bottom:1px solid var(--line)}',
    '.need-title{min-width:0;flex:1 1 220px}.need-title h3{margin:0;font-size:15px;overflow-wrap:anywhere}',
    '.need-title .muted{display:block;font-size:12.5px}.need-note{overflow-wrap:anywhere;white-space:pre-wrap}',
    '.need-prog{display:flex;align-items:center;gap:8px;min-width:130px}.need-prog b{font-variant-numeric:tabular-nums;font-size:13px}',
    '.need-bar{flex:1;height:7px;background:rgba(128,128,128,.2);border-radius:99px;overflow:hidden;min-width:70px}',
    '.need-bar i{display:block;height:100%;background:var(--accent)}',
    '.need-actions{display:flex;gap:8px;align-items:center}.need-area-in{width:130px}',
    '.need-tbl{width:100%;border-collapse:collapse;table-layout:fixed;min-width:640px}',
    '.need-tbl th,.need-tbl td{padding:6px 8px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}',
    '.need-tbl th{font-size:11.5px;color:var(--muted);font-weight:500}',
    '.need-tbl .input{width:100%;min-width:0;box-sizing:border-box}',
    '.need-notes{resize:vertical;min-height:34px;max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:pre-wrap;field-sizing:content}',
    '.need-chk label{display:flex;align-items:center;gap:6px;cursor:pointer;padding-top:6px;white-space:nowrap}',
    '.need-ok td:first-child{box-shadow:inset 3px 0 0 var(--accent)}',
    '.need-d-done{color:#8fbf7a}.need-d-doing{color:var(--accent)}.need-d-todo{color:#e0a458}.need-d-none{color:var(--muted)}',
    '.need-foot{padding:8px 14px}',
    '.need-empty{margin:20px;padding:28px;border:1px dashed var(--line);border-radius:12px;text-align:center}',
    '.need-chip{display:inline-block;margin-left:6px;font-size:11px;padding:1px 7px;border-radius:6px;border:1px solid var(--line);color:var(--muted)}',
    '.need-mini{list-style:none;margin:0;padding:0}.need-mini li{padding:2px 0;overflow-wrap:anywhere}.need-mini li.ok{color:var(--muted)}'
  ].join('\n');
  document.head.appendChild(css);

  if (location.hash === '#needs') { active = true; }
  if (pageStart()) { if (active) paint(); else decorate(); }
})();
