/* v43: rename any text on the site ("Ubah Nama").
   Overrides live in db.settings.labels { original text: new text } so the whole team sees them.
   Every text on screen whose full text equals an original is shown with the new name (menu, titles, buttons,
   column headers, filters, summary cards, form labels, slide titles, …). Item / task / category names are data:
   those are renamed in their own form or in Manage Categories. */
(function () {
  var A = window.GX27App; if (!A) return;
  var editing = false, busy = false, raf = 0;
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, svg: 1, SVG: 1 };

  function map() { var s = (A.getDb() || {}).settings || {}; var m = s.labels; return m && typeof m === 'object' && !Array.isArray(m) ? m : {}; }
  function origOf(node) { return node.__gxo != null ? node.__gxo : node.nodeValue.trim(); }

  function applyNode(node, m) {
    var cur = node.nodeValue, key = node.__gxo != null ? node.__gxo : cur.trim();
    if (!key) return;
    var want = m[key];
    if (node.__gxo != null && cur.trim() !== (node.__gxv || '')) { key = cur.trim(); node.__gxo = null; want = m[key]; }   // the app wrote new text
    if (want != null && want !== '') {
      if (cur.trim() === want) return;
      var lead = cur.match(/^\s*/)[0], trail = cur.match(/\s*$/)[0];
      node.__gxo = key; node.__gxv = want; node.nodeValue = lead + want + trail;
    } else if (node.__gxo != null) {                                    // override removed → back to original
      var l2 = cur.match(/^\s*/)[0], t2 = cur.match(/\s*$/)[0];
      node.nodeValue = l2 + node.__gxo + t2; node.__gxo = null; node.__gxv = null;
    }
  }
  function apply(root) {
    var m = map();
    busy = true;
    try {
      var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
        var p = n.parentNode; if (!p || SKIP[p.nodeName] || (p.closest && p.closest('svg,[data-gx-raw]'))) return NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      } });
      var n; while ((n = w.nextNode())) applyNode(n, m);
      (root || document.body).querySelectorAll('input[placeholder],textarea[placeholder]').forEach(function (el) {
        var o = el.__gxp != null ? el.__gxp : el.getAttribute('placeholder'), v = m[o];
        if (v) { el.__gxp = o; if (el.getAttribute('placeholder') !== v) el.setAttribute('placeholder', v); }
        else if (el.__gxp != null) { el.setAttribute('placeholder', el.__gxp); el.__gxp = null; }
      });
    } finally { busy = false; }
  }
  function schedule() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; apply(document.body); }); }
  new MutationObserver(function () { if (!busy) schedule(); }).observe(document.body, { childList: true, subtree: true, characterData: true });

  /* ---------- edit mode ---------- */
  function dataNames() {
    var db = A.getDb(), s = {};
    (db.tasks || []).forEach(function (t) { if (t.name) s[t.name.trim()] = 'task'; });
    (db.finance || []).forEach(function (f) { if (f.item) s[f.item.trim()] = 'item'; });
    (db.rundown || []).forEach(function (r) { ['title', 'name', 'activity'].forEach(function (k) { if (r[k]) s[String(r[k]).trim()] = 'rundown'; }); });
    (A.allWorkstreams ? A.allWorkstreams() : []).forEach(function (w) { s[String(w).trim()] = 'cat'; });
    return s;
  }
  function textAt(e) {
    var r = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null, n = r && r.startContainer;
    if (n && n.nodeType === 3 && n.nodeValue.trim()) return n;
    var el = e.target; if (!el) return null;
    for (var i = 0; i < el.childNodes.length; i++) { var c = el.childNodes[i]; if (c.nodeType === 3 && c.nodeValue.trim()) return c; }
    return null;
  }
  function bar() {
    var b = document.getElementById('lblBar');
    if (!editing) { if (b) b.remove(); document.body.classList.remove('lbl-edit'); return; }
    document.body.classList.add('lbl-edit');
    if (!b) { b = document.createElement('div'); b.id = 'lblBar'; b.setAttribute('data-gx-raw', ''); document.body.appendChild(b); }
    var n = Object.keys(map()).length;
    b.innerHTML = '<span>✎ <b>Mode Ubah Nama</b> · klik teks mana saja untuk mengganti namanya</span>' +
      '<button type="button" class="btn sm" data-lbl="list">Semua perubahan (' + n + ')</button><button type="button" class="btn sm primary" data-lbl="done">Selesai</button>';
  }
  function setEditing(on) { editing = on; bar(); var t = document.getElementById('lblToggle'); if (t) t.classList.toggle('on', on); }
  function save(key, val) {
    var db = A.getDb(); db.settings = db.settings || {};
    var m = Object.assign({}, map());
    if (val && val !== key) m[key] = val; else delete m[key];
    db.settings.labels = m;
    A.commit(val && val !== key ? '"' + key + '" → "' + val + '"' : 'Nama "' + key + '" dikembalikan');
    setTimeout(function () { apply(document.body); bar(); }, 30);
  }
  function renameDialog(key) {
    var cur = map()[key] || key, esc = A.esc;
    A.openModal('<form id="lblForm" novalidate data-gx-raw><div class="modal-h"><h3>Ubah Nama</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one">' +
      '<p class="muted" style="margin:0">Teks asli: <b>' + esc(key) + '</b><br>Berlaku di semua tempat yang memakai teks persis ini, untuk semua orang.</p>' +
      '<div class="field full" data-field="lbl"><label for="f-lbl">Nama baru</label><input class="input" id="f-lbl" name="lbl" maxlength="160" value="' + esc(cur) + '" autocomplete="off"><span class="msg" hidden></span></div>' +
      '</div><div class="modal-f">' + (map()[key] ? '<button type="button" class="btn" id="lblReset">Kembalikan asli</button>' : '') +
      '<div class="right"><button type="button" class="btn" data-act="modal-cancel">Batal</button><button type="submit" class="btn primary">Simpan</button></div></div></form>', 'sm');
    var f = document.getElementById('lblForm'), i = document.getElementById('f-lbl'); i.focus(); i.select();
    f.onsubmit = function (e) { e.preventDefault(); var v = i.value.trim(); if (!v) return A.showErrors(f, { lbl: 'Tidak boleh kosong. Pakai "Kembalikan asli" untuk nama awal.' }); A.closeModal(); save(key, v); };
    var r = document.getElementById('lblReset'); if (r) r.onclick = function () { A.closeModal(); save(key, ''); };
  }
  function listDialog() {
    var m = map(), keys = Object.keys(m).sort(), esc = A.esc;
    A.openModal('<div data-gx-raw><div class="modal-h"><h3>Semua perubahan nama · ' + keys.length + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one">' +
      (keys.length ? '<ul class="lbl-list">' + keys.map(function (k) { return '<li><span><span class="muted">' + esc(k) + '</span> → <b>' + esc(m[k]) + '</b></span><span><button type="button" class="btn sm" data-lbl-edit="' + esc(k) + '">Ubah</button> <button type="button" class="btn sm ghost" data-lbl-reset="' + esc(k) + '">Kembalikan</button></span></li>'; }).join('') + '</ul>'
        : '<p class="faint">Belum ada. Nyalakan Mode Ubah Nama lalu klik teks yang mau diganti.</p>') +
      '<h4 style="margin:6px 0 0">Tambah manual</h4><p class="muted" style="margin:0;font-size:12.5px">Untuk teks yang tidak bisa diklik (pilihan dropdown, placeholder kolom isian). Tulis teks aslinya persis.</p>' +
      '<div class="lbl-add"><input class="input" id="lblFrom" placeholder="Teks asli"><input class="input" id="lblTo" placeholder="Nama baru"><button type="button" class="btn sm primary" data-lbl="add">Tambah</button></div>' +
      '</div><div class="modal-f"><div class="right"><button type="button" class="btn" data-act="modal-cancel">Tutup</button></div></div></div>', 'sm', { allowReadonly: true });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var lb = t.closest && t.closest('[data-lbl],[data-lbl-edit],[data-lbl-reset],#lblToggle');
    if (lb) {
      e.preventDefault(); e.stopPropagation();
      if (lb.id === 'lblToggle') { if (!A.canEdit()) return A.toast('Hanya editor yang bisa mengubah nama.', true); setEditing(!editing); return; }
      if (lb.dataset.lbl === 'done') return setEditing(false);
      if (lb.dataset.lbl === 'list') return listDialog();
      if (lb.dataset.lbl === 'add') { var fr = document.getElementById('lblFrom').value.trim(), to = document.getElementById('lblTo').value.trim(); if (!fr || !to) return A.toast('Isi teks asli dan nama baru.', true); A.closeModal(); return save(fr, to); }
      if (lb.dataset.lblEdit) { A.closeModal(); return renameDialog(lb.dataset.lblEdit); }
      if (lb.dataset.lblReset) { A.closeModal(); return save(lb.dataset.lblReset, ''); }
    }
    if (!editing) return;
    if (t.closest && t.closest('#toastRoot,#lblBar,#sideToggle,[data-gx-raw],input,select,textarea,option,[data-act="modal-cancel"]')) return;   // typing and closing dialogs keep working
    e.preventDefault(); e.stopPropagation();
    var n = textAt(e); if (!n) return A.toast('Klik tepat di tulisannya.', true);
    var key = origOf(n), kind = dataNames()[key];
    if (kind === 'cat') return A.toast('Ini nama kategori: ganti lewat "Manage Categories" supaya datanya ikut berubah.', true);
    if (kind) return A.toast('Ini nama ' + (kind === 'task' ? 'task' : kind === 'item' ? 'item budget' : 'rundown') + ': klik Selesai, lalu ubah lewat form-nya.', true);
    if (/^[\d\s.,:%·+−\-–\/Rp]+$/.test(key)) return A.toast('Angka / tanggal dihitung otomatis, tidak bisa diganti nama.', true);
    renameDialog(key);
  }, true);
  document.addEventListener('keydown', function (e) { if (editing && e.key === 'Escape' && !document.querySelector('#modalRoot .modal')) setEditing(false); });

  // button in the sidebar (editors only)
  function addToggle() {
    if (document.getElementById('lblToggle')) return;
    var cd = document.getElementById('countdown'); if (!cd) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'lblToggle'; b.className = 'lbl-toggle'; b.setAttribute('data-gx-raw', '');
    b.innerHTML = '✎ Ubah Nama Teks'; b.title = 'Ganti nama menu, judul, tombol, kolom, dll.';
    cd.parentNode.insertBefore(b, cd);
  }
  function syncToggle() { addToggle(); var b = document.getElementById('lblToggle'); if (b) b.hidden = !A.canEdit(); }
  syncToggle(); setInterval(syncToggle, 2000);
  apply(document.body);
  A.applyLabels = function () { apply(document.body); };
})();
