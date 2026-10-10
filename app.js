(function () {
'use strict';

/* ================= Constants ================= */
var STORE_KEY = 'gx27.dashboard.v3';
var UI_KEY = 'gx27.ui.v2';
var EVENT_DATE = '2026-11-21';
var PREP_DEADLINES = ['2026-10-13','2026-10-16','2026-10-20','2026-10-23','2026-10-24','2026-10-26','2026-10-30'];
var DEFAULT_LOGO = 'assets/globalxtreme-logo.png';
var SETTINGS_DEFAULT = {
  siteTitle: 'GX27 Operations',
  siteSubtitle: 'Festival of Connectivity · 21 Nov 2026',
  eventName: 'GX 27 Festival of Connectivity',
  eventDate: EVENT_DATE,
  prepDeadlines: PREP_DEADLINES.slice(),
  timelineSubtitle: 'Pre-event programs hingga Festival of Connectivity · Oktober–November 2026',
  timelineTagline: 'One journey · Four programs · One celebration',
  logoUrl: '',
  budgetSheetUrl: ''
};
// 'local'  = no database configured: edits stay in this browser (original behaviour)
// 'public' = visitors: read-only view of the published content
// 'admin'  = /admin: signed-in editors/admins edit the draft, Save + Publish
var MODE = 'local';
function canEdit() { return MODE === 'local' || (MODE === 'admin' && !!window.GX27Admin && window.GX27Admin.canEdit()); }
function normalizeDb(d) {
  d = d && typeof d === 'object' ? d : {};
  if (!Array.isArray(d.tasks)) d.tasks = [];
  if (!Array.isArray(d.finance)) d.finance = [];
  var s = {}, k;
  for (k in SETTINGS_DEFAULT) s[k] = SETTINGS_DEFAULT[k];
  if (d.settings && typeof d.settings === 'object') for (k in d.settings) if (d.settings[k] !== undefined && d.settings[k] !== null) s[k] = d.settings[k];
  if (!Array.isArray(s.prepDeadlines)) s.prepDeadlines = SETTINGS_DEFAULT.prepDeadlines.slice();
  d.settings = s;
  return d;
}
function logoSrc() { return (db && db.settings && db.settings.logoUrl) || DEFAULT_LOGO; }
function applySettings() {
  var s = db.settings || SETTINGS_DEFAULT;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s.eventDate || '')) EVENT_DATE = s.eventDate;
  PREP_DEADLINES = (s.prepDeadlines || []).filter(function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(x); }).sort();
  var title = s.siteTitle || SETTINGS_DEFAULT.siteTitle;
  var nameEl = document.querySelector('.brand .name');
  if (nameEl) nameEl.innerHTML = /^GX27/.test(title) ? 'GX<span>27</span>' + esc(title.slice(4)) : esc(title);
  var subEl = document.querySelector('.brand .sub'); if (subEl) subEl.textContent = s.siteSubtitle || '';
  var logoEl = document.querySelector('.brand .logo'); if (logoEl && logoEl.getAttribute('src') !== logoSrc()) logoEl.setAttribute('src', logoSrc());
  document.title = title + (MODE === 'admin' ? ' · Admin' : '');
}
var TASK_STATUS = ['Not Started','In Progress','Pending Approval','Blocked','Done'];
var CATEGORIES = ['Program Milestone','Preparation','Procurement','Production','Coordination','Event Day'];
var PAY_STATUS = ['Pending Payment','DP Paid','Full Paid'];
var INV_STATUS = ['Unsubmitted','Submitted'];
var BASE_WS = ['GX Connect','GX Got Talent','Mobile Legends','HYROX','Event Day','Preparation','Design & Production','Games & Competition','Entertainment','Tenants','Doorprize',"Winners' Prizes",'Procurement','Emergency Fund'];
var WS_CLASS = {'GX Connect':'connect','GX Got Talent':'ggt','Mobile Legends':'ml','HYROX':'hyrox','Event Day':'event'};

/* ================= Seed data ================= */
var SHEET_SEED = window.GX27_BUDGET_SEED || { meta: null, items: [] };

function seed() {
  var tasks = [], finance = [], n = 0;
  function id(p) { n++; return p + String(n).padStart(3, '0'); }
  function t(ws, name, start, deadline, notes, cat) {
    var o = { id: id('T'), name: name, workstream: ws, category: cat || 'Program Milestone', start: start || '', deadline: deadline,
      pic: '', status: 'Not Started', notes: notes || '', blockers: '', dependencies: '', source: 'confirmed',
      verifyNote: '', createdAt: Date.now(), updatedAt: Date.now() };
    tasks.push(o); return o;
  }
  // Master timeline (confirmed, from "Road to GX 27 — Master Timeline")
  t('GX Connect','Pengumuman & pembagian tim','', '2026-10-05');
  t('GX Got Talent','Launch · Registrasi','2026-10-05','2026-10-11','Registrasi 05–11 OCT');
  t('GX Connect','Technical Meeting','', '2026-10-06','16.00–17.00 WITA');
  t('GX Connect','Photo Hunting · 5 misi tim','2026-10-07','2026-10-21');
  t('GX Got Talent','Technical Meeting','', '2026-10-12','14.00 WITA');
  t('Mobile Legends','Registration Open','', '2026-10-12');
  t('HYROX','Registration Open','', '2026-10-12');
  t('GX Got Talent','Performer preparation & rehearsal','2026-10-15','2026-11-10');
  t('GX Connect','Pengembalian kamera','', '2026-10-22','11.00 WITA');
  t('HYROX','Registration Close','', '2026-10-23','00.00 WITA');
  t('GX Connect','Ambil hasil foto, frame & cash · Mulai People of GX Frame','', '2026-10-24');
  t('GX Connect','Submit 5 misi','2026-10-24','2026-10-26','Deadline 26 OCT, 00.00 WITA');
  t('HYROX','Technical Meeting','', '2026-10-27','16.00–17.00 WITA');
  t('Mobile Legends','Registration Close','', '2026-10-30','00.00 WITA');
  t('GX Got Talent','Audition Schedule Announcement','', '2026-11-01');
  t('GX Connect','Instagram Voting','2026-11-01','2026-11-08','Voting dimulai 01 NOV, berjalan 01–08 NOV');
  t('Mobile Legends','Technical Meeting','', '2026-11-02','16.00–17.00 WITA · PIC / Team Captain');
  t('GX Connect','Voting Close','', '2026-11-08','00.00 WITA');
  t('GX Connect','Final Review + Frame Submission','', '2026-11-09','17.00 WITA');
  t('GX Got Talent','Audition · Golden Ticket Selection','', '2026-11-11','15.00–21.00 WITA');
  t('Mobile Legends','Qualifier Day 1','', '2026-11-12','20.00–22.00 WITA');
  t('GX Got Talent','Top 5 Curation','2026-11-12','2026-11-13');
  t('Mobile Legends','Qualifier Day 2 · Semifinal · 3rd Place Match','', '2026-11-13','20.00–22.00 WITA');
  t('GX Got Talent','Top 5 Main Stage Reveal','', '2026-11-14');
  ['GX Connect Winners','GX Got Talent Top 5','Mobile Legends Grand Final','HYROX Challenge','Anniversary Ceremony'].forEach(function (s) {
    t('Event Day', s, '', EVENT_DATE, 'GX 27 Festival of Connectivity — Event Day', 'Event Day');
  });
  // Preparation task list (confirmed rows from the earlier GX27 Operations "All Tasks" database screenshot)
  var TRUNC = 'Notes terpotong di screenshot sumber — lengkapi teks aslinya.';
  function p(ws, name, d, cat, status, notes, dep, verify) {
    var o = t(ws, name, '', d, notes, cat); o.status = status || 'Not Started'; o.dependencies = dep || '';
    if (verify) { o.source = 'verify'; o.verifyNote = verify; }
    return o;
  }
  p('Design & Production','A4 designs — Registration, Face Art, GX Create','2026-10-13','Production','','Approval desain A4.');
  p('Design & Production','People of GX & GX Game Zone T-Banner foamboards','2026-10-16','Production');
  p('Design & Production','A6 QR voting placeholders for each team','2026-10-16','Production','','20 team voting frames.');
  p('Design & Production','Winners & Xtreme Award landscape foamboards','2026-10-16','Production');
  p('Design & Production','DTF sticker design','2026-10-16','Production','In Progress','Design belum selesai.');
  p('Design & Production','DIY tote bag design & package','2026-10-16','Production','Pending Approval','Menunggu approval Pak X.','Approval Pak X','Nama approver tercatat sebagai "Pak X" — konfirmasi nama aslinya.');
  p('Design & Production','"Wishes for GlobalXtreme" lettering','2026-10-23','Production','','Approve design before productio…','',TRUNC);
  p('Design & Production','Mobile Legends TV still image','2026-10-30','Production','','For Qualifier, Semifinal, 3rd Plac…','',TRUNC);
  p('Design & Production','Print all required foamboards & game vouchers','2026-10-30','Production','','Includes approved Alfamart and …','Final design approvals',TRUNC);
  p('Games & Competition','Finalize rules & winning mechanisms for all games','2026-10-16','Coordination');
  p('Games & Competition','Approve Alfamart voucher — Tebak Lagu','2026-10-20','Coordination');
  p('Games & Competition','Approve Diamond voucher — Tebak Hero','2026-10-20','Coordination');
  p('Games & Competition','Finalize Spin Wheel','2026-10-30','Coordination');
  p('Games & Competition','GX Got Talent judge handouts — Audition & Grand Final','2026-10-30','Production','','','','Judul terpotong di sumber ("Grand Fina…") — dianggap "Grand Final", mohon cek.');
  var OPS = 'Di database lama status operasionalnya tertulis "DP Paid" (itu status pembayaran). Status pembayaran dipindah ke Finance; status operasional perlu dikonfirmasi. Deadline kosong di sumber.';
  var bali = p('Games & Competition','Bali Games rental coordination','','Procurement','','DP 50%. Invoice and transfer re…','Vendor confirmation',OPS + ' ' + TRUNC);
  var bumi = p('Games & Competition','BUMI Creative game equipment coordination','','Procurement','','Scream Meter, Race Simulator, B…','Vendor confirmation',OPS + ' ' + TRUNC);
  p('Procurement','Paper wristbands','2026-10-16','Procurement','Done','Existing record confirms purchas…','',TRUNC);
  // Preparation deadlines (dates confirmed, scope not yet provided)
  PREP_DEADLINES.forEach(function (d) {
    var o = t('Preparation', 'Preparation deadline · ' + fmtDate(d, true), '', d, '', 'Preparation');
    o.source = 'verify'; o.verifyNote = 'Tanggal confirmed. Lihat task lain dengan deadline yang sama; scope checkpoint ini belum dirinci.';
  });
  // Procurement tasks that hold the budget lines from the sheet (task scope confirmed by the sheet; deadline & PIC not given)
  [['GX Connect','Procurement · GX Connect (Kodak, print, frame, cash fund)'], ['GX Game Pass','Procurement · GX Game Pass (card & stamp)'],
   ['GX Got Talent','GX Got Talent · Budget Top 5 Team'], ['Activation','Vendor · Face Painting & Tarot Reader'],
   ['HYROX','Vendor · HYROX full service (Ultrafit)'], ['Entertainment','Vendor · Entertainment (band, MC, DJ)'],
   ["Winners' Prizes",'Hadiah pemenang lomba & team building'], ['Doorprize','Doorprize procurement'], ['Emergency Fund','Alokasi Emergency Fund']
  ].forEach(function (x) {
    var o = t(x[0], x[1], '', '', '', 'Procurement');
    o.source = 'verify'; o.verifyNote = 'Task dibuat untuk menampung baris budget di sheet. Deadline, PIC & status operasional belum diberikan.';
  });
  // Finance: sheet "EDIT DISINI", Divisi Acara (rows 3–79)
  var keyToId = {};
  SHEET_SEED.items.forEach(function (r) {
    var f = { id: id('F') };
    for (var k in r) if (k !== 'key' && k !== 'parent' && k !== 'task') f[k] = r[k];
    if (r.key) keyToId[r.key] = f.id;
    f.parentId = r.parent ? keyToId[r.parent] : null;
    var tk = r.task ? tasks.filter(function (x) { return x.name === r.task; })[0] : null;
    f.taskId = tk ? tk.id : null;
    f.createdAt = f.updatedAt = Date.now();
    finance.push(f);
  });
  return { version: 3, seq: n, tasks: tasks, finance: finance, meta: SHEET_SEED.meta, settings: JSON.parse(JSON.stringify(SETTINGS_DEFAULT)), savedAt: Date.now() };
}

/* ================= Utilities ================= */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function parseISO(s) { if (!s) return null; var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); if (!m) return null; return new Date(+m[1], +m[2] - 1, +m[3]); }
function toISO(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function todayISO() { return toISO(new Date()); }
function daysBetween(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 864e5); }
function fmtDate(s, short) { var d = parseISO(s); if (!d) return '—'; return String(d.getDate()).padStart(2, '0') + ' ' + MONTHS[d.getMonth()] + (short ? '' : ' ' + d.getFullYear()); }
function fmtRange(t) { if (t.start && t.deadline && t.start !== t.deadline) return fmtDate(t.start, true) + ' – ' + fmtDate(t.deadline, true); return fmtDate(t.deadline, true); }
var rpFmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
function rp(n) { return n == null ? '—' : 'Rp ' + rpFmt.format(n); }
function numOrNull(v) { return (v === null || v === undefined || v === '' || isNaN(v)) ? null : Number(v); }
function parseAmount(raw) {
  if (raw == null) return { ok: true, value: null };
  var s = String(raw).trim();
  if (!s || s === '-' || s === '—') return { ok: true, value: null };
  s = s.replace(/rp\.?/i, '').replace(/\s/g, '');
  if (/[^0-9.,\-]/.test(s)) return { ok: false };
  if (/^-/.test(s)) return { ok: false, negative: true };
  // Indonesian "1.500.000" or "1.500.000,50"; English "1,500,000.50"
  var lastDot = s.lastIndexOf('.'), lastComma = s.lastIndexOf(',');
  var dec = null;
  if (lastComma > -1 && lastComma > lastDot && s.length - lastComma - 1 <= 2 && s.split(',').length === 2) dec = ',';
  else if (lastDot > -1 && lastDot > lastComma && s.length - lastDot - 1 <= 2 && s.split('.').length === 2) dec = '.';
  if (dec) { var parts = s.split(dec); s = parts[0].replace(/[.,]/g, '') + '.' + parts[1]; }
  else s = s.replace(/[.,]/g, '');
  var v = Number(s);
  return isNaN(v) ? { ok: false } : { ok: true, value: Math.round(v) };
}
function parseFlexDate(s) {
  if (!s) return '';
  s = String(s).trim(); if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/.exec(s);
  if (m) { var y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); }
  var mm = { jan:1,feb:2,mar:3,apr:4,mei:5,may:5,jun:6,jul:7,agu:8,agt:8,aug:8,sep:9,okt:10,oct:10,nov:11,des:12,dec:12 };
  m = /^(\d{1,2})\s+([a-z]{3})[a-z]*\.?\s*(\d{4})?$/i.exec(s);
  if (m && mm[m[2].toLowerCase()]) return (m[3] || '2026') + '-' + String(mm[m[2].toLowerCase()]).padStart(2, '0') + '-' + m[1].padStart(2, '0');
  return null;
}
function wsClass(ws) { return WS_CLASS[ws] || ''; }
function wsTag(ws) { return '<span class="ws ' + wsClass(ws) + '">' + esc(ws || '—') + '</span>'; }
function statusBadge(s) {
  var c = { 'Done': 'b-ok', 'In Progress': 'b-info', 'Pending Approval': 'b-warn', 'Blocked': 'b-crit', 'Not Started': 'b-neutral' }[s] || 'b-neutral';
  return '<span class="badge ' + c + '">' + esc(s) + '</span>';
}
function payBadge(s) { var c = { 'Full Paid': 'b-ok', 'DP Paid': 'b-info', 'Pending Payment': 'b-warn' }[s] || 'b-neutral'; return '<span class="badge ' + c + '">' + esc(s) + '</span>'; }
function invBadge(s) { return '<span class="badge ' + (s === 'Submitted' ? 'b-ok' : 'b-neutral') + '">' + esc(s) + '</span>'; }
function srcTag(s) { return s === 'verify' ? '<span class="src verify" title="Needs verification">Verify</span>' : '<span class="src confirmed" title="Confirmed source data">Confirmed</span>'; }
function opts(list, sel, emptyLabel) {
  var h = emptyLabel != null ? '<option value="">' + esc(emptyLabel) + '</option>' : '';
  return h + list.map(function (v) { var val = typeof v === 'object' ? v.value : v, lab = typeof v === 'object' ? v.label : v; return '<option value="' + esc(val) + '"' + (val === sel ? ' selected' : '') + '>' + esc(lab) + '</option>'; }).join('');
}

/* ================= Store ================= */
var storageOK = true, storageError = '';
var db = normalizeDb({ tasks: [], finance: [] });
function load() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      var d = JSON.parse(raw);
      if (d && Array.isArray(d.tasks) && Array.isArray(d.finance)) return d;
      storageError = 'Saved data was unreadable, so the initial GX27 data was loaded.';
    }
  } catch (e) { storageOK = false; storageError = 'Browser storage is blocked here. Changes will be lost when you refresh.'; }
  var s = seed(); persist(s); return s;
}
function persist(d) {
  d.savedAt = Date.now();
  if (MODE === 'admin') return window.GX27Admin ? window.GX27Admin.markDirty(d) : false;
  if (MODE === 'public') return true;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); return true; }
  catch (e) { storageOK = false; storageError = 'Could not save to browser storage. Changes in this session may be lost on refresh.'; return false; }
}
function commit(msg) {
  if (!canEdit()) { toast('Hanya admin yang bisa mengubah data.', true); return; }
  var ok = persist(db); render();
  if (msg) toast(ok ? msg + (MODE === 'admin' ? ' · klik Save untuk menyimpan ke database' : '') : 'Change kept for this session only — storage unavailable', !ok);
}
function nextId(prefix) { db.seq = (db.seq || 0) + 1; return prefix + String(db.seq).padStart(3, '0'); }
function taskById(id) { for (var i = 0; i < db.tasks.length; i++) if (db.tasks[i].id === id) return db.tasks[i]; return null; }
function finById(id) { for (var i = 0; i < db.finance.length; i++) if (db.finance[i].id === id) return db.finance[i]; return null; }
function finForTask(id) { return db.finance.filter(function (f) { return f.taskId === id; }); }
function allWorkstreams() {
  var set = BASE_WS.slice();
  db.tasks.concat(db.finance).forEach(function (r) { if (r.workstream && set.indexOf(r.workstream) < 0) set.push(r.workstream); });
  return set;
}

var ui = loadUI();
function loadUI() {
  var d = { page: 'timeline', mtHide: [], taskView: 'all', q: '', fWs: '', fStatus: '', fSrc: '', sort: { key: 'deadline', dir: 1 }, expanded: null,
    finQ: '', finWs: '', finPay: '', finInv: '', calMonth: '2026-10' };
  try { var raw = localStorage.getItem(UI_KEY); if (raw) { var p = JSON.parse(raw); for (var k in p) d[k] = p[k]; } } catch (e) {}
  var h = (location.hash || '').replace('#', '');
  if (['timeline','overview','tasks','finance','calendar','admin'].indexOf(h) > -1) d.page = h;
  return d;
}
function saveUI() { try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch (e) {} }

/* ================= Derived ================= */
function dueState(t) {
  if (!t.deadline) return { kind: 'none', days: null };
  var days = daysBetween(todayISO(), t.deadline);
  if (t.status === 'Done') return { kind: 'done', days: days };
  if (days < 0) return { kind: 'overdue', days: days };
  if (days <= 3) return { kind: 'soon', days: days };
  return { kind: 'ok', days: days };
}
function dueLabel(t) {
  var s = dueState(t);
  if (s.kind === 'none') return '<span class="faint">No deadline</span>';
  var txt = fmtRange(t), sub = '';
  if (s.kind === 'overdue') sub = ' · ' + (-s.days) + 'd overdue';
  else if (s.kind === 'soon') sub = s.days === 0 ? ' · today' : ' · in ' + s.days + 'd';
  return '<span class="due ' + s.kind + '">' + txt + sub + '</span>';
}
function kidsOf(f) { return f && f.id ? db.finance.filter(function (c) { return c.parentId === f.id; }) : []; }
function calc(f) {
  var qty = numOrNull(f.qty), unit = numOrNull(f.unitCost), estIn = numOrNull(f.estimated);
  var inv = numOrNull(f.invoice), dp = numOrNull(f.dp), fee = numOrNull(f.fee) || 0, paidAmt = numOrNull(f.paidAmount);
  var flags = [], parent = f.parentId ? finById(f.parentId) : null;
  var kids = (f.kind === 'vendor' || f.kind === 'allocation') ? kidsOf(f) : [];
  var est = estIn != null ? estIn : (qty != null && unit != null ? qty * unit : null);
  if (estIn == null && f.kind === 'vendor' && kids.length) est = kids.reduce(function (s, k) { return s + (calc(k).est || 0); }, 0);
  if (estIn != null && qty != null && unit != null && Math.abs(qty * unit - estIn) > 0.5) flags.push({ lvl: 'warn', msg: 'Qty × harga (' + rp(qty * unit) + ') ≠ total di sheet (' + rp(estIn) + ')' });
  if (parent && parent.kind === 'vendor') return { qty: qty, est: est, inv: null, dp: null, base: est, paid: 0, fee: 0, outstanding: null, flags: flags, inherited: true, parent: parent };
  if (f.kind === 'allocation') {
    var used = kids.reduce(function (s, k) { return s + (calc(k).base || 0); }, 0);
    if (est != null && used > est) flags.push({ lvl: 'crit', msg: 'Pemakaian (' + rp(used) + ') melebihi alokasi' });
    return { qty: qty, est: est, inv: null, dp: null, base: est, paid: 0, fee: 0, outstanding: null, used: used, fundLeft: est == null ? null : est - used, flags: flags, allocation: true };
  }
  var base = inv != null ? inv : est, paid = 0;
  if (paidAmt != null) paid = paidAmt;
  else if (f.paymentStatus === 'Full Paid') paid = base || 0;
  else if (f.paymentStatus === 'DP Paid') paid = dp || 0;
  if (f.paymentStatus === 'Full Paid' && inv == null) flags.push({ lvl: 'crit', msg: 'Full Paid tapi invoice amount kosong' });
  if (f.paymentStatus === 'DP Paid' && dp == null && paidAmt == null) flags.push({ lvl: 'crit', msg: 'DP Paid tapi nominal DP kosong' });
  if (f.paymentStatus === 'Pending Payment' && paidAmt != null && paidAmt > 0) flags.push({ lvl: 'warn', msg: 'Ada nominal transfer tapi status Pending Payment' });
  if (dp != null && base != null && dp > base) flags.push({ lvl: 'crit', msg: 'DP (' + rp(dp) + ') lebih besar dari ' + (inv != null ? 'invoice' : 'estimasi') });
  if (base != null && paid > base) flags.push({ lvl: 'crit', msg: 'Transfer (' + rp(paid) + ') melebihi invoice ' + rp(base) });
  if (f.paymentStatus === 'Full Paid' && base != null && paid < base) flags.push({ lvl: 'crit', msg: 'Full Paid tapi transfer kurang ' + rp(base - paid) });
  if (inv != null && est != null && inv > est * 1.1) flags.push({ lvl: 'warn', msg: 'Invoice ' + Math.round((inv / est - 1) * 100) + '% di atas estimasi' });
  if (f.paymentStatus !== 'Pending Payment' && !f.receipt) flags.push({ lvl: 'warn', msg: 'Bukti transfer belum dilampirkan' });
  if (f.paymentStatus !== 'Pending Payment' && f.invoiceStatus === 'Unsubmitted') flags.push({ lvl: 'warn', msg: 'Sudah dibayar tapi invoice masih Unsubmitted' });
  if (f.paymentDeadline && f.paymentDeadline < todayISO() && f.paymentStatus !== 'Full Paid') flags.push({ lvl: 'crit', msg: 'Lewat payment deadline (' + fmtDate(f.paymentDeadline, true) + ')' });
  if (base == null) flags.push({ lvl: 'warn', msg: 'Nominal belum diisi' });
  var outstanding = base == null ? null : Math.max(base - paid, 0);
  return { qty: qty, est: est, inv: inv, dp: dp, base: base, paid: paid, fee: fee, outstanding: outstanding, flags: flags, basedOnEstimate: inv == null && est != null };
}
function totals(list) {
  var inList = {}; list.forEach(function (f) { inList[f.id] = 1; });
  var t = { est: 0, inv: 0, paid: 0, fee: 0, outstanding: 0, missing: 0, flagged: 0, count: list.length };
  list.forEach(function (f) {
    var c = calc(f), p = f.parentId ? finById(f.parentId) : null;
    // budget: count each figure once — vendor parents carry their line items; allocation children sit inside the allocation
    if (!p || (p.kind === 'vendor' && !inList[p.id])) t.est += c.est || 0;
    if (!c.inherited) { t.inv += c.inv || 0; t.paid += c.paid; t.fee += c.fee || 0; t.outstanding += c.outstanding || 0; if (c.base == null) t.missing++; }
    if (c.flags.length || f.source === 'verify') t.flagged++;
  });
  return t;
}
function taskStats() {
  var s = { total: db.tasks.length, done: 0, prog: 0, appr: 0, blocked: 0, overdue: 0, notUpdated: 0 };
  db.tasks.forEach(function (t) {
    if (t.status === 'Done') s.done++; else if (t.status === 'In Progress') s.prog++; else if (t.status === 'Pending Approval') s.appr++; else if (t.status === 'Blocked') s.blocked++;
    if (dueState(t).kind === 'overdue') s.overdue++;
  });
  return s;
}

/* ================= Rendering ================= */
var main = document.getElementById('main');
function render() {
  db = normalizeDb(db);
  var focusId = document.activeElement && document.activeElement.id, selStart = null;
  try { selStart = document.activeElement.selectionStart; } catch (e) {}
  applySettings();
  document.body.classList.toggle('readonly', !canEdit());
  document.body.classList.toggle('mode-admin', MODE === 'admin');
  document.querySelectorAll('#nav button').forEach(function (b) { b.setAttribute('aria-current', b.dataset.page === ui.page ? 'page' : 'false'); });
  var st = taskStats();
  document.getElementById('navTaskCount').textContent = st.total;
  document.getElementById('navOverdue').textContent = st.overdue ? st.overdue + ' overdue' : '';
  var dl = daysBetween(todayISO(), EVENT_DATE);
  document.getElementById('countdown').innerHTML = dl >= 0
    ? '<div class="d">' + dl + '</div><div class="l">' + (dl === 1 ? 'day' : 'days') + ' to Event Day · ' + fmtDate(EVENT_DATE, true) + '</div>'
    : '<div class="d">Done</div><div class="l">Event Day was ' + fmtDate(EVENT_DATE) + '</div>';
  document.getElementById('storeNote').textContent = storageOK ? 'Saved in this browser · last save ' + new Date(db.savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Storage unavailable';
  var banner = storageError ? '<div class="banner' + (storageOK ? ' warn' : '') + '" role="alert">' + esc(storageError) + '</div>' : '';
  var html = '', Admin = MODE === 'admin' ? window.GX27Admin : null;
  var gate = Admin ? Admin.gate() : '';
  if (gate) { main.innerHTML = gate; saveUI(); if (Admin.afterRender) Admin.afterRender(); return; }
  if (ui.page === 'admin' && !Admin) ui.page = 'timeline';
  try {
    if (ui.page === 'admin') html = Admin.renderPage();
    else if (ui.page === 'timeline') html = renderMaster();
    else if (ui.page === 'overview') html = renderOverview();
    else if (ui.page === 'tasks') html = renderTasks();
    else if (ui.page === 'finance') html = renderFinance();
    else html = renderCalendar();
  } catch (e) {
    console.error(e);
    html = '<div class="banner" role="alert">Something went wrong drawing this page (' + esc(e.message) + '). Your data is still saved. Try another page or refresh.</div>';
  }
  main.innerHTML = (Admin ? Admin.barHtml() : '') + banner + html;
  if (!canEdit()) main.querySelectorAll('[data-inline]').forEach(function (el) { el.disabled = true; });
  saveUI();
  if (Admin && Admin.afterRender) Admin.afterRender();
  if (focusId) { var el = document.getElementById(focusId); if (el) { el.focus(); try { if (selStart != null) el.setSelectionRange(selStart, selStart); } catch (e) {} } }
}

function pageHead(title, sub, actions) {
  return '<div class="page-head"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="toolbar" style="margin:0">' + actions + '</div>' : '') + '</div>';
}


/* ---------- Master Timeline ---------- */
var PROGRAMS = ['GX Connect','GX Got Talent','Mobile Legends','HYROX'];
function renderMaster() {
  var hide = ui.mtHide || [];
  var all = db.tasks.filter(function (t) { return t.deadline && (t.category === 'Event Day' || (PROGRAMS.indexOf(t.workstream) > -1 && t.category !== 'Procurement')); });
  var eventItems = all.filter(function (t) { return t.category === 'Event Day'; });
  var pre = all.filter(function (t) { return t.category !== 'Event Day' && hide.indexOf(t.workstream) < 0; });
  var doneN = all.filter(function (t) { return t.status === 'Done'; }).length;
  var nextT = all.filter(function (t) { return t.status !== 'Done' && t.deadline >= todayISO(); }).sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; })[0];
  var h = '<div class="mt-head"><div><div class="mt-eyebrow">— Road to GX 27</div><h1 class="mt-title">MASTER <span>TIMELINE</span></h1><p>' + esc(db.settings.timelineSubtitle || '') + '</p></div>' +
    '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px"><button class="btn primary" data-act="new-milestone">+ Add milestone</button><div class="mt-legend" role="group" aria-label="Show programs">' +
    PROGRAMS.map(function (p) { return '<button class="mt-pill ' + wsClass(p) + '" data-act="mt-toggle" data-ws="' + esc(p) + '" aria-pressed="' + (hide.indexOf(p) < 0) + '">' + esc(p) + '</button>'; }).join('') + '</div></div></div>';
  h += '<div class="mt-progress"><span><b>' + doneN + '/' + all.length + '</b> milestones done</span>' + (nextT ? '<span>Next: <b>' + fmtDate(nextT.deadline, true).toUpperCase() + '</b> ' + esc(nextT.workstream) + ' · ' + esc(nextT.name) + '</span>' : '') + '<span>' + (canEdit() ? 'Klik item untuk edit' : 'Klik item untuk detail') + '</span></div>';
  // group by month (of start date) then by date label
  var months = {};
  pre.forEach(function (t) { var key = (t.start || t.deadline).slice(0, 7); (months[key] = months[key] || []).push(t); });
  var monthKeys = Object.keys(months).sort();
  if (!monthKeys.length && !eventItems.length) return h + '<div class="table-wrap">' + emptyBox('No milestones to show', 'Turn a program back on above, or add a milestone.') + '</div>';
  var cards = monthKeys.map(function (m) {
    var groups = {}, order = [];
    months[m].sort(function (a, b) { var x = a.start || a.deadline, y = b.start || b.deadline; return x < y ? -1 : x > y ? 1 : (a.deadline < b.deadline ? -1 : 1); })
      .forEach(function (t) { var lab = fmtRange(t).toUpperCase(); if (!groups[lab]) { groups[lab] = []; order.push(lab); } groups[lab].push(t); });
    var d = parseISO(m + '-01');
    var rows = order.map(function (lab) {
      var g = groups[lab], dotCls = 'dot-' + wsClass(g[0].workstream);
      return '<div class="mt-row"><div class="mt-date"><i class="' + dotCls + '"></i>' + lab + '</div><div class="mt-items">' + g.map(function (t) {
        var st = dueState(t), stColor = t.status === 'Done' ? 'var(--ok)' : st.kind === 'overdue' ? 'var(--crit)' : t.status === 'Blocked' ? 'var(--crit)' : t.status === 'In Progress' ? 'var(--info)' : t.status === 'Pending Approval' ? 'var(--warn)' : 'transparent';
        return '<button class="mt-item' + (t.status === 'Done' ? ' done' : '') + '" data-act="edit-task" data-id="' + t.id + '" title="' + esc(t.status + (st.kind === 'overdue' ? ' · overdue' : '')) + '"><span class="prog ' + wsClass(t.workstream) + '">' + esc(t.workstream) + '</span><span class="txt">' + esc(t.name) + (t.notes ? ' · ' + esc(t.notes.split('\n')[0]) : '') + '</span><span class="st" style="background:' + stColor + '"></span></button>';
      }).join('') + '</div></div>';
    }).join('');
    return '<div class="mt-card"><div class="mt-card-h"><b>' + MONTHS_FULL[d.getMonth()] + ' ' + d.getFullYear() + '</b><span>' + order.length + ' MILESTONES</span></div><div class="mt-rows">' + rows + '</div></div>';
  });
  var ev = '';
  if (eventItems.length) {
    var ed = eventItems[0].deadline;
    ev = '<div class="mt-event"><div><div class="d">' + fmtDate(ed, true).toUpperCase().replace(/^0/, '') + '</div><div class="l">EVENT DAY</div></div><div><h3>' + esc((db.settings.eventName || '').toUpperCase()) + '</h3><div class="mt-chips">' +
      eventItems.map(function (t, i) { return '<button class="mt-chip' + (/ceremony/i.test(t.name) ? ' hl' : '') + (t.status === 'Done' ? ' done' : '') + '" data-act="edit-task" data-id="' + t.id + '" title="' + esc(t.status) + '">' + esc(t.name) + '</button>'; }).join('') +
      '<button class="mt-chip" data-act="new-event-item" aria-label="Add event day segment">+</button></div></div></div>';
  }
  var left = cards[0] || '', right = cards.slice(1).join('') + ev;
  if (!cards.length) left = ev, right = '';
  h += '<div class="mt-grid"><div class="mt-col">' + left + '</div><div class="mt-col">' + right + '</div></div>';
  h += '<div class="mt-foot"><img src="' + esc(logoSrc()) + '" alt="Logo"><span>' + esc(db.settings.timelineTagline || '') + '</span></div>';
  return h;
}

/* ---------- Overview ---------- */
function renderOverview() {
  var s = taskStats(), ft = totals(db.finance), today = todayISO();
  var h = pageHead('Overview', 'Status hari ini, ' + fmtDate(today) + '. Data timeline dari Master Timeline Road to GX 27.',
    '<button class="btn" data-act="new-task">+ Task</button><button class="btn primary" data-act="new-fin">+ Budget item</button>');
  h += '<div class="kpis">' +
    kpi('Total tasks', s.total, s.blocked + ' blocked · ' + s.overdue + ' overdue') +
    kpi('Completed', s.done, s.total ? Math.round(s.done / s.total * 100) + '% of all tasks' : '—') +
    kpi('In progress', s.prog, 'operational status') +
    kpi('Pending approval', s.appr, 'waiting for sign-off', s.appr > 0) +
    '</div><div class="kpis">' +
    kpi('Estimated budget', rp(ft.est), ft.count + ' line items · ' + ft.missing + ' without amount', false, true) +
    kpi('Payments made', rp(ft.paid), '+ ' + rp(ft.fee) + ' biaya transfer', false, true) +
    kpi('Outstanding', rp(ft.outstanding), 'invoice (or estimate) minus paid', ft.outstanding > 0, true) +
    kpi('Needs verification', ft.flagged + db.tasks.filter(function (t) { return t.source === 'verify'; }).length, 'finance + task records') +
    '</div>';

  // Prep strip
  h += '<div class="panel-h" style="border:none;padding:0 0 8px"><h2>Preparation deadlines</h2><span class="muted" style="font-size:12px">Event Day 21 Nov 2026</span></div><div class="prep-strip">';
  var nextFound = false;
  PREP_DEADLINES.forEach(function (d) {
    var t = db.tasks.filter(function (x) { return x.category === 'Preparation' && x.deadline === d; })[0];
    var due = db.tasks.filter(function (x) { return x.deadline === d && x.category !== 'Preparation'; }).length;
    var cls = d < today ? 'past' : (!nextFound ? (nextFound = true, 'next') : '');
    h += '<div class="' + cls + '" data-act="open-task" data-id="' + (t ? t.id : '') + '" role="button" tabindex="0"><div class="m">' + MONTHS[parseISO(d).getMonth()].toUpperCase() + '</div><div class="d">' + parseISO(d).getDate() + '</div><div style="margin-top:4px">' + (t ? statusBadge(t.status) : '<span class="faint">—</span>') + '</div><div class="faint" style="font-size:11px;margin-top:3px">' + due + ' other due</div></div>';
  });
  h += '</div>';

  // Urgent + upcoming
  var urgent = db.tasks.filter(function (t) { var k = dueState(t).kind; return t.status !== 'Done' && (k === 'overdue' || k === 'soon' || t.status === 'Blocked'); })
    .sort(function (a, b) { return (a.deadline || '9') < (b.deadline || '9') ? -1 : 1; });
  var upcoming = db.tasks.filter(function (t) { var d = dueState(t); return t.status !== 'Done' && d.kind !== 'none' && d.days >= 0 && d.days <= 14; })
    .sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; });
  h += '<div class="grid-2">' +
    panel('Urgent · overdue, due ≤3 days, blocked', urgent.length, urgent.length ? urgent.slice(0, 12).map(listRow).join('') + more(urgent.length, 12, 'pending') : emptyBox('Nothing urgent', 'No overdue, blocked or due-soon tasks.')) +
    panel('Upcoming · next 14 days', upcoming.length, upcoming.length ? upcoming.slice(0, 12).map(listRow).join('') + more(upcoming.length, 12, 'timeline') : emptyBox('No deadlines in the next 14 days', 'Add deadlines to tasks to see them here.')) +
    '</div>';

  // Workstream summary + verification
  var wsRows = allWorkstreams().map(function (ws) {
    var ts = db.tasks.filter(function (t) { return t.workstream === ws; });
    var fs = db.finance.filter(function (f) { return f.workstream === ws; });
    if (!ts.length && !fs.length) return '';
    var done = ts.filter(function (t) { return t.status === 'Done'; }).length, ft2 = totals(fs);
    var pct = ts.length ? Math.round(done / ts.length * 100) : 0;
    return '<tr><td>' + wsTag(ws) + '</td><td class="num r">' + done + '/' + ts.length + '</td><td><div class="wsbar" title="' + pct + '%"><i style="width:' + pct + '%"></i></div></td><td class="num r">' + (fs.length ? rp(ft2.est) : '<span class="faint">—</span>') + '</td><td class="num r">' + (fs.length ? rp(ft2.paid) : '<span class="faint">—</span>') + '</td></tr>';
  }).join('');
  var vItems = [];
  db.finance.forEach(function (f) { var c = calc(f); if (c.flags.length || f.source === 'verify') vItems.push({ kind: 'fin', id: f.id, title: f.item, ws: f.workstream, msgs: (f.verifyNote ? [f.verifyNote] : []).concat(c.flags.map(function (x) { return x.msg; })) }); });
  db.tasks.forEach(function (t) { if (t.source === 'verify') vItems.push({ kind: 'task', id: t.id, title: t.name, ws: t.workstream, msgs: [t.verifyNote || 'Needs verification'] }); });
  h += '<div class="grid-2"><div class="panel"><div class="panel-h"><h2>By workstream</h2></div><div class="table-wrap" style="border:none"><table><thead><tr><th>Workstream</th><th class="r">Done</th><th>Progress</th><th class="r">Est. budget</th><th class="r">Paid</th></tr></thead><tbody>' + wsRows + '</tbody></table></div></div>' +
    panel('Needs verification', vItems.length, vItems.length ? '<div class="verify-list">' + vItems.slice(0, 14).map(function (v) {
      return '<div class="v-row" data-act="' + (v.kind === 'fin' ? 'edit-fin' : 'open-task') + '" data-id="' + v.id + '" role="button" tabindex="0"><div style="display:flex;gap:8px;align-items:center;min-width:0">' + wsTag(v.ws) + '<b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(v.title) + '</b></div><div class="flag">' + esc(v.msgs.join(' · ')) + '</div></div>';
    }).join('') + '</div>' + (vItems.length > 14 ? '<div class="empty" style="padding:10px">+' + (vItems.length - 14) + ' more in Tasks and Finance</div>' : '') : emptyBox('All records verified', 'Nothing is flagged right now.')) + '</div>';
  return h;
}
function kpi(k, v, s, hl, money) { return '<div class="kpi' + (hl ? ' hl' : '') + '"><span class="k">' + k + '</span><span class="v' + (money ? ' money' : '') + '">' + v + '</span><span class="s">' + s + '</span></div>'; }
function panel(title, count, body) { return '<div class="panel"><div class="panel-h"><h2>' + title + '</h2><span class="num muted">' + count + '</span></div><div class="panel-b">' + body + '</div></div>'; }
function emptyBox(t, s) { return '<div class="empty"><b>' + esc(t) + '</b>' + esc(s) + '</div>'; }
function more(n, lim, view) { return n > lim ? '<div style="padding:6px 14px"><button class="btn sm ghost" data-act="go-tasks" data-view="' + view + '">View all ' + n + ' →</button></div>' : ''; }
function listRow(t) {
  return '<div class="list-row" data-act="open-task" data-id="' + t.id + '" role="button" tabindex="0"><span>' + wsTag(t.workstream) + '</span><span class="t">' + esc(t.name) + '<br><span style="font-size:12px">' + dueLabel(t) + '</span></span><span>' + statusBadge(t.status) + '</span></div>';
}

/* ---------- Tasks ---------- */
function filteredTasks(view) {
  var q = ui.q.trim().toLowerCase();
  var list = db.tasks.filter(function (t) {
    if (ui.fWs && t.workstream !== ui.fWs) return false;
    if (ui.fStatus && t.status !== ui.fStatus) return false;
    if (ui.fSrc && t.source !== ui.fSrc) return false;
    if (q && [t.name, t.workstream, t.category, t.pic, t.notes, t.blockers, t.dependencies, t.id].join(' ').toLowerCase().indexOf(q) < 0) return false;
    if (view === 'operational' && t.category === 'Procurement') return false;
    if (view === 'pending') { var k = dueState(t).kind; if (!(t.status === 'Pending Approval' || t.status === 'Blocked' || ((t.blockers || t.dependencies) && t.status !== 'Done') || k === 'overdue')) return false; }
    return true;
  });
  var key = ui.sort.key, dir = ui.sort.dir;
  var order = { 'Blocked': 0, 'Pending Approval': 1, 'In Progress': 2, 'Not Started': 3, 'Done': 4 };
  list.sort(function (a, b) {
    var va, vb;
    if (key === 'status') { va = order[a.status]; vb = order[b.status]; }
    else if (key === 'deadline') { va = a.deadline || '9999'; vb = b.deadline || '9999'; }
    else { va = String(a[key] || '').toLowerCase(); vb = String(b[key] || '').toLowerCase(); }
    if (va < vb) return -dir; if (va > vb) return dir;
    return (a.deadline || '9999') < (b.deadline || '9999') ? -1 : 1;
  });
  return list;
}
function renderTasks() {
  var views = [['all', 'All Tasks'], ['operational', 'Operational'], ['pending', 'Pending & Blocked'], ['timeline', 'Timeline']];
  var h = pageHead('Task Management', 'Satu database task. Status operasional terpisah dari status pembayaran.', '<button class="btn primary" data-act="new-task">+ New task</button>');
  h += '<div class="tabs" role="tablist">' + views.map(function (v) {
    return '<button role="tab" data-act="task-view" data-view="' + v[0] + '" aria-selected="' + (ui.taskView === v[0]) + '">' + v[1] + '<span class="c">' + filteredTasks(v[0]).length + '</span></button>';
  }).join('') + '</div>';
  h += '<div class="toolbar">' +
    '<input class="input search" id="taskSearch" type="search" placeholder="Search task, PIC, notes, blockers…" value="' + esc(ui.q) + '" aria-label="Search tasks">' +
    '<select class="select" id="fWs" aria-label="Workstream">' + opts(allWorkstreams(), ui.fWs, 'All workstreams') + '</select>' +
    '<select class="select" id="fStatus" aria-label="Status">' + opts(TASK_STATUS, ui.fStatus, 'All statuses') + '</select>' +
    '<select class="select" id="fSrc" aria-label="Data source">' + opts([{ value: 'confirmed', label: 'Confirmed' }, { value: 'verify', label: 'Needs verification' }], ui.fSrc, 'All sources') + '</select>' +
    ((ui.q || ui.fWs || ui.fStatus || ui.fSrc) ? '<button class="btn ghost sm" data-act="clear-filters">Clear filters</button>' : '') + '</div>';
  var list = filteredTasks(ui.taskView);
  if (!db.tasks.length) return h + '<div class="table-wrap">' + emptyBox('No tasks yet', 'Create the first task to get started.') + '</div>';
  if (!list.length) return h + '<div class="table-wrap">' + emptyBox('No tasks match', ui.taskView === 'pending' ? 'Nothing pending approval, blocked or overdue with these filters.' : 'Try a different search or clear the filters.') + '</div>';
  if (ui.taskView === 'timeline') return h + renderTimeline(list);
  if (ui.taskView === 'operational') {
    var groups = {};
    list.forEach(function (t) { (groups[t.workstream] = groups[t.workstream] || []).push(t); });
    return h + allWorkstreams().filter(function (w) { return groups[w]; }).map(function (w) {
      var g = groups[w], done = g.filter(function (t) { return t.status === 'Done'; }).length;
      return '<div style="margin-bottom:18px"><div style="display:flex;gap:10px;align-items:center;margin-bottom:6px">' + wsTag(w) + '<span class="muted num" style="font-size:12px">' + done + '/' + g.length + ' done</span></div>' + taskTable(g, true) + '</div>';
    }).join('');
  }
  return h + taskTable(list, false, ui.taskView === 'pending');
}
function sortTh(key, label, cls) {
  var on = ui.sort.key === key;
  return '<th class="sortable ' + (cls || '') + '" data-act="sort" data-key="' + key + '" aria-sort="' + (on ? (ui.sort.dir > 0 ? 'ascending' : 'descending') : 'none') + '">' + label + (on ? ' <span class="arr">' + (ui.sort.dir > 0 ? '↑' : '↓') + '</span>' : '') + '</th>';
}
function taskTable(list, compact, showBlockers) {
  var cols = 7 + (showBlockers ? 1 : 0) - (compact ? 1 : 0);
  var h = '<div class="table-wrap"><table><thead><tr>' + sortTh('name', 'Task') + (compact ? '' : sortTh('workstream', 'Workstream')) + sortTh('category', 'Category') + sortTh('deadline', 'Deadline') + sortTh('pic', 'PIC') + sortTh('status', 'Status') + (showBlockers ? '<th>Blockers / waiting on</th>' : '') + '<th>Payment</th></tr></thead><tbody>';
  list.forEach(function (t) {
    var fins = finForTask(t.id), pay = '<span class="faint">—</span>';
    if (fins.length) {
      var tt = totals(fins), allPaid = fins.every(function (f) { return f.paymentStatus === 'Full Paid'; }), anyPaid = fins.some(function (f) { return f.paymentStatus !== 'Pending Payment'; });
      pay = payBadge(allPaid ? 'Full Paid' : anyPaid ? 'DP Paid' : 'Pending Payment') + (tt.outstanding ? ' <span class="num muted" style="font-size:12px">' + rp(tt.outstanding) + ' due</span>' : '');
    }
    var exp = ui.expanded === t.id;
    h += '<tr class="row' + (exp ? ' expanded' : '') + '" data-act="expand" data-id="' + t.id + '" aria-expanded="' + exp + '">' +
      '<td><span class="tname">' + esc(t.name) + '</span><span class="tsub">' + (t.notes ? esc(t.notes.split('\n')[0]) + ' · ' : '') + srcTag(t.source) + '</span></td>' +
      (compact ? '' : '<td>' + wsTag(t.workstream) + '</td>') +
      '<td class="muted" style="white-space:nowrap">' + esc(t.category) + '</td><td>' + dueLabel(t) + '</td><td>' + (t.pic ? esc(t.pic) : '<span class="faint">Unassigned</span>') + '</td>' +
      '<td><select class="inline-select" data-inline="status" data-id="' + t.id + '" aria-label="Status for ' + esc(t.name) + '">' + opts(TASK_STATUS, t.status) + '</select></td>' +
      (showBlockers ? '<td style="max-width:240px">' + (t.blockers ? '<span class="flag crit">' + esc(t.blockers) + '</span>' : '') + (t.dependencies ? '<span class="tsub">Waiting on: ' + esc(t.dependencies) + '</span>' : '') + (!t.blockers && !t.dependencies ? '<span class="faint">—</span>' : '') + '</td>' : '') +
      '<td>' + pay + '</td></tr>';
    if (exp) h += '<tr class="expanded"><td colspan="' + cols + '">' + taskDetail(t) + '</td></tr>';
  });
  return h + '</tbody></table></div>';
}
function taskDetail(t) {
  var fins = finForTask(t.id);
  var finHtml = fins.length ? fins.map(function (f) {
    var c = calc(f);
    return '<div class="fin-item"><span><a href="#finance" data-act="edit-fin" data-id="' + f.id + '">' + esc(f.item) + '</a><br>' + payBadge(f.paymentStatus) + ' ' + invBadge(f.invoiceStatus) + '</span><span class="num r" style="text-align:right">' + rp(c.base) + '<br><span class="muted" style="font-size:12px">sisa ' + rp(c.outstanding) + '</span></span></div>';
  }).join('') : '<p class="faint">No finance record linked.</p>';
  return '<div class="detail">' +
    '<div><h4>Notes</h4><p>' + (t.notes ? esc(t.notes) : '<span class="faint">—</span>') + '</p></div>' +
    '<div><h4>Blockers</h4><p>' + (t.blockers ? '<span class="flag crit">' + esc(t.blockers) + '</span>' : '<span class="faint">None</span>') + '</p>' +
    '<h4 style="margin-top:10px">Dependencies</h4><p>' + (t.dependencies ? esc(t.dependencies) : '<span class="faint">None</span>') + '</p>' +
    (t.verifyNote ? '<h4 style="margin-top:10px">Verification</h4><p class="flag" style="white-space:normal">' + esc(t.verifyNote) + '</p>' : '') + '</div>' +
    '<div><h4>Finance (payment tracked separately)</h4>' + finHtml + '</div>' +
    '<div class="actions"><button class="btn sm primary" data-act="edit-task" data-id="' + t.id + '">' + (canEdit() ? 'Edit task' : 'View details') + '</button><button class="btn sm" data-act="new-fin" data-task="' + t.id + '">+ Link budget item</button>' +
    '<button class="btn sm danger" data-act="delete-task" data-id="' + t.id + '">Delete</button><span class="faint" style="font-size:12px;align-self:center;margin-left:auto">' + t.id + ' · ' + esc(t.workstream) + ' · ' + (t.start ? 'start ' + fmtDate(t.start, true) + ' · ' : '') + 'updated ' + new Date(t.updatedAt).toLocaleDateString('id-ID') + '</span></div></div>';
}
function renderTimeline(list) {
  var dated = list.filter(function (t) { return t.deadline; }), undated = list.filter(function (t) { return !t.deadline; });
  var byMonth = {};
  dated.forEach(function (t) { var key = (t.start || t.deadline).slice(0, 7); var k2 = t.deadline.slice(0, 7); var m = t.start && t.start.slice(0, 7) === k2 ? k2 : (t.start ? t.start.slice(0, 7) : k2); (byMonth[m] = byMonth[m] || []).push(t); });
  var today = todayISO(), h = '';
  Object.keys(byMonth).sort().forEach(function (m) {
    var items = byMonth[m].sort(function (a, b) { var x = a.start || a.deadline, y = b.start || b.deadline; return x < y ? -1 : x > y ? 1 : 0; });
    var byDay = {};
    items.forEach(function (t) { var label = fmtRange(t); (byDay[label] = byDay[label] || { key: t.start || t.deadline, end: t.deadline, items: [] }).items.push(t); });
    var d = parseISO(m + '-01');
    h += '<div class="tl-month"><h3>' + MONTHS_FULL[d.getMonth()] + ' ' + d.getFullYear() + '</h3>';
    Object.keys(byDay).sort(function (a, b) { return byDay[a].key < byDay[b].key ? -1 : byDay[a].key > byDay[b].key ? 1 : 0; }).forEach(function (label) {
      var g = byDay[label], isEvent = g.end === EVENT_DATE && g.items.every(function (t) { return t.category === 'Event Day'; });
      var past = g.end < today;
      h += '<div class="tl-day' + (isEvent ? ' tl-event' : '') + '"><div class="tl-date' + (past ? ' past' : '') + '"><span class="dot"></span>' + label.toUpperCase() + '</div><div class="tl-items">' +
        g.items.map(function (t) {
          return '<div class="tl-item" data-act="open-task" data-id="' + t.id + '" role="button" tabindex="0">' + wsTag(t.workstream) + '<span>' + esc(t.name) + (t.notes ? ' <span class="' + (isEvent ? '' : 'muted') + '" style="opacity:.75">· ' + esc(t.notes.split('\n')[0]) + '</span>' : '') + '</span>' + statusBadge(t.status) + '</div>';
        }).join('') + '</div></div>';
    });
    h += '</div>';
  });
  if (undated.length) h += '<div class="tl-month"><h3>No deadline yet</h3><div class="tl-items">' + undated.map(function (t) { return '<div class="tl-item" data-act="open-task" data-id="' + t.id + '" role="button" tabindex="0">' + wsTag(t.workstream) + '<span>' + esc(t.name) + ' ' + srcTag(t.source) + '</span>' + statusBadge(t.status) + '</div>'; }).join('') + '</div></div>';
  return h;
}

/* ---------- Finance ---------- */
function filteredFinance() {
  var q = ui.finQ.trim().toLowerCase();
  var match = function (f) {
    if (ui.finWs && f.workstream !== ui.finWs) return false;
    if (ui.finPay && f.paymentStatus !== ui.finPay) return false;
    if (ui.finInv && f.invoiceStatus !== ui.finInv) return false;
    if (q) { var t = taskById(f.taskId); if ([f.item, f.workstream, f.notes, f.receipt, f.invoiceRef, f.id, f.sheetRow, t ? t.name : ''].join(' ').toLowerCase().indexOf(q) < 0) return false; }
    return true;
  };
  var hit = {}; db.finance.forEach(function (f) { if (match(f)) hit[f.id] = 1; });
  // keep vendor groups together: a matching line item brings its vendor row, a matching vendor row brings its line items
  db.finance.forEach(function (f) { if (hit[f.id] && f.parentId) hit[f.parentId] = hit[f.parentId] || 2; });
  db.finance.forEach(function (f) { if (f.parentId && hit[f.parentId] === 1 && !ui.finPay && !ui.finInv) hit[f.id] = hit[f.id] || 1; });
  return db.finance.filter(function (f) { return hit[f.id]; });
}
function finCategories() {
  var order = {}, seq = 0;
  db.finance.slice().sort(rowOrder).forEach(function (f) { if (!(f.workstream in order)) order[f.workstream] = seq++; });
  return Object.keys(order).sort(function (a, b) { return order[a] - order[b]; });
}
function rowOrder(a, b) { return (a.sheetRow || 9999) - (b.sheetRow || 9999) || (a.createdAt || 0) - (b.createdAt || 0); }
function renderFinance() {
  var all = totals(db.finance), list = filteredFinance(), meta = db.meta ? Object.assign({}, db.meta) : null;
  if (meta && db.settings.budgetSheetUrl) meta.url = db.settings.budgetSheetUrl;
  var h = pageHead('Finance &amp; Procurement', meta ? 'Sumber: sheet <b>' + esc(meta.sheet) + '</b> · Divisi ' + esc(meta.division) + ' · baris ' + esc(meta.rows) + ' · snapshot ' + fmtDate(meta.snapshot) + '. Subtotal dihitung otomatis dari item, tidak disimpan.' : 'Total dihitung dari baris item; subtotal tidak disimpan sebagai record.',
    (meta && meta.url ? '<a class="btn admin-only" href="' + esc(meta.url) + '" target="_blank" rel="noopener">Open budget sheet ↗</a>' : '') + '<button class="btn" data-act="import-csv">Import</button><button class="btn primary" data-act="new-fin">+ Budget item</button>');
  h += '<div class="kpis">' + kpi('Estimated budget', rp(all.est), all.count + ' rows', false, true) + kpi('Invoiced', rp(all.inv), 'sum of invoice amounts', false, true) +
    kpi('Paid to vendors', rp(all.paid), '+ ' + rp(all.fee) + ' biaya transfer', false, true) + kpi('Outstanding', rp(all.outstanding), 'invoice (atau estimasi) − paid', all.outstanding > 0, true) +
    kpi('Flagged', all.flagged, all.missing + ' rows without amount', all.flagged > 0) + '</div>';
  if (meta && meta.sheetSubTotal != null) {
    var dEst = all.est - meta.sheetSubTotal, dTf = (all.paid + all.fee) - meta.sheetTransferred;
    h += '<div class="banner ' + (dEst || dTf ? 'warn' : '') + '" style="' + (dEst || dTf ? '' : 'background:var(--ok-bg);color:var(--ok)') + '"><div><b>Rekonsiliasi dengan sheet.</b> Sub Total sheet ' + rp(meta.sheetSubTotal) + ' · app ' + rp(all.est) + (dEst ? ' (selisih ' + rp(dEst) + ')' : ' ✓') +
      '. Total transfer sheet (DP Total) ' + rp(meta.sheetTransferred) + ' · app ' + rp(all.paid + all.fee) + (dTf ? ' (selisih ' + rp(dTf) + ' — lihat baris yang di-flag)' : ' ✓') + '.</div></div>';
  }
  h += '<div class="toolbar"><input class="input search" id="finSearch" type="search" placeholder="Search item, vendor, invoice, row…" value="' + esc(ui.finQ) + '" aria-label="Search budget items">' +
    '<select class="select" id="finWs" aria-label="Category">' + opts(finCategories(), ui.finWs, 'All categories') + '</select>' +
    '<select class="select" id="finPay" aria-label="Payment status">' + opts(PAY_STATUS, ui.finPay, 'All payment status') + '</select>' +
    '<select class="select" id="finInv" aria-label="Invoice status">' + opts(INV_STATUS, ui.finInv, 'All invoice status') + '</select>' +
    ((ui.finQ || ui.finWs || ui.finPay || ui.finInv) ? '<button class="btn ghost sm" data-act="clear-fin-filters">Clear filters</button>' : '') + '</div>';
  if (!db.finance.length) return h + '<div class="table-wrap">' + emptyBox('No budget items yet', 'Add an item or import your budget sheet (paste from Excel / Google Sheets).') + '</div>';
  if (!list.length) return h + '<div class="table-wrap">' + emptyBox('No items match', 'Try a different search or clear the filters.') + '</div>';
  var groups = {};
  list.forEach(function (f) { (groups[f.workstream] = groups[f.workstream] || []).push(f); });
  var head = '<tr><th>Item</th><th class="r">Qty</th><th class="r">Harga</th><th class="r">Est. total</th><th class="r">Invoice</th><th class="r">DP</th><th class="r">Paid</th><th class="r">Remaining</th><th>Pay deadline</th><th>Invoice</th><th>Payment</th><th>Bukti TF</th><th>Linked task</th><th>Check</th></tr>';
  var body = '';
  function row(f, child) {
    var c = calc(f), t = taskById(f.taskId) || (c.parent ? taskById(c.parent.taskId) : null);
    var flagHtml = (f.source === 'verify' ? '<span class="src verify" title="' + esc(f.verifyNote || 'Needs verification') + '">Verify</span> ' : '') +
      (c.flags.length ? '<span class="flag' + (c.flags.some(function (x) { return x.lvl === 'crit'; }) ? ' crit' : '') + '" title="' + esc(c.flags.map(function (x) { return x.msg; }).join('\n')) + '">⚠ ' + c.flags.length + '</span>' : (f.source === 'verify' ? '' : '<span class="flag" style="color:var(--ok)">✓</span>'));
    var sub = [];
    if (f.kind === 'vendor') sub.push('Vendor invoice · ' + kidsOf(f).length + ' line item');
    if (f.kind === 'allocation') sub.push('Alokasi dana');
    if (f.invoiceRef) sub.push('Inv: ' + esc(f.invoiceRef));
    if (f.notes) sub.push(esc(f.notes.split('\n')[0]));
    if (f.sheetRow) sub.push('Row ' + f.sheetRow);
    var qtyTxt = c.qty != null ? rpFmt.format(c.qty) + (f.unit ? ' <span class="faint">' + esc(f.unit) + '</span>' : '') : '<span class="faint">—</span>';
    var pay, paid, rem, dpc, inv, ivs, rec, pd;
    if (c.inherited) {
      var via = '<span class="faint" style="font-size:12px">via vendor</span>';
      inv = dpc = paid = rem = '<span class="faint">·</span>'; ivs = pay = rec = pd = via;
    } else if (c.allocation) {
      inv = dpc = paid = '<span class="faint">—</span>';
      rem = '<span title="Terpakai ' + rp(c.used) + '">sisa ' + rp(c.fundLeft) + '</span><span class="tsub">terpakai ' + rp(c.used) + '</span>';
      ivs = pay = rec = pd = '<span class="badge b-neutral nodot">Allocation</span>';
    } else {
      inv = rp(c.inv); dpc = rp(c.dp);
      paid = rp(c.base == null && !c.paid ? null : c.paid) + (c.fee ? '<span class="tsub">+ fee ' + rp(c.fee) + '</span>' : '');
      rem = rp(c.outstanding) + (c.basedOnEstimate && c.outstanding ? '<span class="tsub" title="Invoice belum ada; dihitung dari estimasi">est.</span>' : '');
      pd = f.paymentDeadline ? '<span class="due ' + (f.paymentStatus !== 'Full Paid' && f.paymentDeadline < todayISO() ? 'overdue' : '') + '">' + fmtDate(f.paymentDeadline, true) + '</span>' : '<span class="faint">—</span>';
      ivs = invBadge(f.invoiceStatus); pay = payBadge(f.paymentStatus);
      rec = f.receipt ? '<span class="badge b-ok nodot" title="' + esc(f.receipt) + '" style="max-width:150px;overflow:hidden;text-overflow:ellipsis">' + esc(f.receipt) + '</span>' : '<span class="faint">—</span>';
    }
    return '<tr class="row' + (child ? ' child' : '') + (f.kind ? ' parent' : '') + '" data-act="edit-fin" data-id="' + f.id + '"><td><span class="tname">' + (child ? '<span class="faint">↳ </span>' : '') + esc(f.item || '(tanpa nama)') + '</span>' + (sub.length ? '<span class="tsub">' + sub.join(' · ') + '</span>' : '') + '</td>' +
      '<td class="num r">' + qtyTxt + '</td><td class="num r">' + rp(numOrNull(f.unitCost)) + '</td><td class="num r">' + rp(c.est) + '</td><td class="num r">' + inv + '</td><td class="num r">' + dpc + '</td><td class="num r">' + paid + '</td>' +
      '<td class="num r">' + rem + '</td><td>' + pd + '</td><td>' + ivs + '</td><td>' + pay + '</td><td>' + rec + '</td>' +
      '<td style="max-width:200px">' + (child ? (t ? '<span class="faint" style="font-size:12px">' + esc(t.name) + '</span>' : '') : t ? '<a href="#tasks" data-act="open-task" data-id="' + t.id + '" style="color:inherit">' + esc(t.name) + '</a><span class="tsub">' + statusBadge(t.status) + '</span>' : '<span class="flag">Not linked</span>') + '</td>' +
      '<td>' + flagHtml + '</td></tr>';
  }
  var inList = {}; list.forEach(function (f) { inList[f.id] = 1; });
  finCategories().filter(function (w) { return groups[w]; }).forEach(function (w) {
    var g = groups[w].slice().sort(rowOrder), st = totals(g);
    body += '<tr class="group"><td colspan="14">' + wsTag(w) + ' <span class="muted num" style="font-size:12px">' + g.length + ' row' + (g.length > 1 ? 's' : '') + '</span></td></tr>';
    g.forEach(function (f) {
      if (f.parentId && inList[f.parentId]) return;
      body += row(f, !!f.parentId);
      g.filter(function (k) { return k.parentId === f.id; }).forEach(function (k) { body += row(k, true); });
    });
    body += '<tr class="subtotal"><td>Subtotal ' + esc(w) + ' <span class="muted" style="font-weight:400">(auto)</span></td><td></td><td></td><td class="num r">' + rp(st.est) + '</td><td class="num r">' + rp(st.inv) + '</td><td></td><td class="num r">' + rp(st.paid) + '</td><td class="num r">' + rp(st.outstanding) + '</td><td colspan="6"></td></tr>';
  });
  var gt = totals(list);
  body += '<tr class="grand"><td>' + (list.length === db.finance.length ? 'Grand total' : 'Total (filtered)') + '</td><td></td><td></td><td class="num r">' + rp(gt.est) + '</td><td class="num r">' + rp(gt.inv) + '</td><td></td><td class="num r">' + rp(gt.paid) + '</td><td class="num r">' + rp(gt.outstanding) + '</td><td colspan="6" class="muted">' + gt.count + ' rows · biaya transfer ' + rp(gt.fee) + ' · ' + gt.missing + ' tanpa nominal</td></tr>';
  h += '<div class="table-wrap"><table><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  h += '<p class="fin-note">Est. total = kolom Total Price sheet (atau qty × harga). Vendor invoice (Bali Games, BUMI, OJISAN, Doorprize) memegang invoice &amp; pembayaran; line item di bawahnya hanya rincian estimasi. Emergency Fund adalah alokasi; baris di bawahnya adalah pemakaian dana. Paid = DP / nominal transfer tanpa biaya transfer Rp2.500 (dari formula sheet). Status pembayaran tidak mengubah status operasional task.</p>';
  return h;
}

/* ---------- Calendar ---------- */
function renderCalendar() {
  var parts = ui.calMonth.split('-'), y = +parts[0], m = +parts[1] - 1;
  var first = new Date(y, m, 1), startOffset = (first.getDay() + 6) % 7;
  var gridStart = new Date(y, m, 1 - startOffset), today = todayISO();
  var byDate = {};
  db.tasks.forEach(function (t) { if (t.deadline) (byDate[t.deadline] = byDate[t.deadline] || []).push(t); });
  var h = pageHead('Calendar &amp; Deadlines', 'Tugas ditampilkan di tanggal deadline.' + (canEdit() ? ' Klik task untuk ubah deadline.' : ''), '<button class="btn primary" data-act="new-task">+ New task</button>');
  var cells = '';
  for (var i = 0; i < 42; i++) {
    var d = new Date(gridStart); d.setDate(gridStart.getDate() + i);
    if (i >= 35 && d.getMonth() !== m) break;
    var iso = toISO(d), items = (byDate[iso] || []).slice().sort(function (a, b) { return a.category === 'Preparation' ? -1 : 1; });
    var cls = 'cal-cell' + (d.getMonth() !== m ? ' out' : '') + (iso === today ? ' today' : '') + (PREP_DEADLINES.indexOf(iso) > -1 ? ' prep' : '') + (iso === EVENT_DATE ? ' eventday' : '');
    cells += '<div class="' + cls + '"><div class="dn"><b>' + d.getDate() + '</b>' + (PREP_DEADLINES.indexOf(iso) > -1 ? '<span class="tag-prep">PREP</span>' : iso === EVENT_DATE ? '<span class="tag-prep" style="color:var(--fg)">EVENT</span>' : '') + '</div>' +
      items.slice(0, 4).map(chip).join('') + (items.length > 4 ? '<span class="more" data-act="cal-day" data-date="' + iso + '" role="button" tabindex="0">+' + (items.length - 4) + ' more</span>' : '') + '</div>';
  }
  var agenda = Object.keys(byDate).filter(function (k) { return k.slice(0, 7) === ui.calMonth; }).sort().map(function (k) {
    return '<div class="a-day"><h5>' + fmtDate(k) + (PREP_DEADLINES.indexOf(k) > -1 ? ' · PREP' : '') + '</h5>' + byDate[k].map(chip).join('') + '</div>';
  }).join('') || emptyBox('No deadlines this month', 'Use the arrows to see other months.');
  h += '<div class="cal-layout"><div><div class="cal"><div class="cal-head"><button class="btn sm" data-act="cal-prev" aria-label="Previous month">←</button><h2>' + MONTHS_FULL[m] + ' ' + y + '</h2><div style="display:flex;gap:6px"><button class="btn sm" data-act="cal-today">Today</button><button class="btn sm" data-act="cal-next" aria-label="Next month">→</button></div></div>' +
    '<div class="cal-grid cal-dows">' + ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(function (x) { return '<div class="cal-dow">' + x + '</div>'; }).join('') + '</div>' +
    '<div class="cal-grid month">' + cells + '</div><div class="agenda">' + agenda + '</div></div>' +
    '<div class="legend"><span><i style="background:var(--crit-bg);border:1px solid var(--crit)"></i>Overdue</span><span><i style="background:var(--warn-bg);border:1px solid var(--warn)"></i>Due ≤3 days</span><span><i style="background:var(--accent)"></i>Preparation deadline</span><span><i style="background:var(--accent-soft)"></i>Event Day</span><span style="text-decoration:line-through">Done</span></div></div>';
  var overdue = db.tasks.filter(function (t) { return dueState(t).kind === 'overdue'; }).sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; });
  var next7 = db.tasks.filter(function (t) { var s = dueState(t); return s.kind !== 'done' && s.kind !== 'none' && s.days >= 0 && s.days <= 7; }).sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; });
  function sideRow(t) { return '<div class="item"><span class="t" data-act="open-task" data-id="' + t.id + '" role="button" tabindex="0" title="' + esc(t.name) + '">' + esc(t.name) + '<br><span style="font-size:11.5px">' + wsTag(t.workstream) + ' ' + dueLabel(t) + '</span></span><input class="input" type="date" id="dl-' + t.id + '" data-inline="deadline" data-id="' + t.id + '" value="' + esc(t.deadline) + '" aria-label="Deadline for ' + esc(t.name) + '"></div>'; }
  h += '<div style="display:flex;flex-direction:column;gap:16px">' +
    panel('Overdue', overdue.length, overdue.length ? '<div class="side-list">' + overdue.map(sideRow).join('') + '</div>' : emptyBox('Nothing overdue', 'All past deadlines are done.')) +
    panel('Next 7 days', next7.length, next7.length ? '<div class="side-list">' + next7.map(sideRow).join('') + '</div>' : emptyBox('Clear week', 'No deadlines in the next 7 days.')) + '</div></div>';
  return h;
}
function chip(t) {
  var s = dueState(t);
  return '<button class="chip ' + wsClass(t.workstream) + ' ' + (s.kind === 'overdue' || s.kind === 'soon' || s.kind === 'done' ? s.kind : '') + '" data-act="cal-chip" data-id="' + t.id + '" title="' + esc(t.workstream + ' · ' + t.name + ' · ' + t.status) + '">' + esc(t.name) + '</button>';
}

/* ================= Modals ================= */
var modalRoot = document.getElementById('modalRoot'), lastFocus = null;
function openModal(html, size, opts) {
  lastFocus = document.activeElement;
  modalRoot.innerHTML = '<div class="overlay" data-close="1"><div class="modal ' + (size || '') + '" role="dialog" aria-modal="true">' + html + '</div></div>';
  if (!canEdit() && !(opts && opts.allowReadonly)) {
    // visitors get the same form as a read-only detail view
    modalRoot.querySelectorAll('input,select,textarea').forEach(function (el) { el.disabled = true; });
    modalRoot.querySelectorAll('button[type=submit],.btn.danger,#calcPreview,.hint').forEach(function (el) { el.remove(); });
    var h3 = modalRoot.querySelector('.modal-h h3'); if (h3) h3.textContent = h3.textContent.replace(/^(Edit|New) /, '').replace(/^\w/, function (c) { return c.toUpperCase(); }) + ' · details';
    modalRoot.querySelectorAll('[data-act="modal-cancel"]').forEach(function (b) { if (b.textContent === 'Cancel') b.textContent = 'Close'; });
  }
  var f = modalRoot.querySelector('input:not([type=hidden]),select,textarea,button.primary');
  if (f) f.focus();
}
function closeModal() { modalRoot.innerHTML = ''; if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus(); }
function field(name, label, input, opt) {
  opt = opt || {};
  return '<div class="field' + (opt.full ? ' full' : '') + '" data-field="' + name + '"><label for="f-' + name + '">' + label + (opt.req ? ' <span class="req">*</span>' : '') + '</label>' + input + (opt.hint ? '<span class="hint">' + opt.hint + '</span>' : '') + '<span class="msg" hidden></span></div>';
}
function inp(name, val, type, extra) { return '<input class="input" id="f-' + name + '" name="' + name + '" type="' + (type || 'text') + '" value="' + esc(val == null ? '' : val) + '" ' + (extra || '') + '>'; }
function sel(name, list, val, empty) { return '<select class="select" id="f-' + name + '" name="' + name + '">' + opts(list, val, empty) + '</select>'; }
function ta(name, val) { return '<textarea class="input" id="f-' + name + '" name="' + name + '">' + esc(val || '') + '</textarea>'; }
function showErrors(form, errs) {
  form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('err'); var m = f.querySelector('.msg'); if (m) m.hidden = true; });
  Object.keys(errs).forEach(function (k) { var f = form.querySelector('[data-field="' + k + '"]'); if (f) { f.classList.add('err'); var m = f.querySelector('.msg'); m.textContent = errs[k]; m.hidden = false; } });
  var firstErr = form.querySelector('.field.err input,.field.err select,.field.err textarea'); if (firstErr) firstErr.focus();
}
function confirmDialog(title, message, yesLabel, onYes) {
  openModal('<div class="modal-h"><h3>' + esc(title) + '</h3></div><div class="modal-b one"><p style="margin:0">' + message + '</p></div><div class="modal-f"><div class="right"><button class="btn" data-act="modal-cancel">Cancel</button><button class="btn danger solid" id="confirmYes">' + esc(yesLabel) + '</button></div></div>', 'sm');
  document.getElementById('confirmYes').onclick = function () { closeModal(); onYes(); };
  document.getElementById('confirmYes').focus();
}

function taskForm(t, preset) {
  var isNew = !t; t = t || Object.assign({ name: '', workstream: '', category: 'Program Milestone', start: '', deadline: '', pic: '', status: 'Not Started', notes: '', blockers: '', dependencies: '', source: 'confirmed', verifyNote: '' }, preset || {});
  var wsList = '<datalist id="wsList">' + allWorkstreams().map(function (w) { return '<option value="' + esc(w) + '">'; }).join('') + '</datalist>';
  openModal('<form id="taskForm" novalidate><div class="modal-h"><h3>' + (isNew ? 'New task' : 'Edit task') + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b">' +
    field('name', 'Task name', inp('name', t.name, 'text', 'maxlength="160" required'), { req: true, full: true }) +
    field('workstream', 'Workstream', inp('workstream', t.workstream, 'text', 'list="wsList" required') + wsList, { req: true, hint: 'Pilih dari list atau ketik baru' }) +
    field('category', 'Category', sel('category', CATEGORIES, t.category)) +
    field('start', 'Start date', inp('start', t.start, 'date'), { hint: 'Opsional, untuk rentang tanggal' }) +
    field('deadline', 'Deadline', inp('deadline', t.deadline, 'date')) +
    field('pic', 'PIC', inp('pic', t.pic, 'text', 'maxlength="80"')) +
    field('status', 'Operational status', sel('status', TASK_STATUS, t.status)) +
    field('notes', 'Notes', ta('notes', t.notes), { full: true }) +
    field('blockers', 'Blockers', ta('blockers', t.blockers)) +
    field('dependencies', 'Dependencies', ta('dependencies', t.dependencies), { hint: 'Menunggu apa / siapa' }) +
    field('source', 'Data source', sel('source', [{ value: 'confirmed', label: 'Confirmed' }, { value: 'verify', label: 'Needs verification' }], t.source)) +
    field('verifyNote', 'Verification note', inp('verifyNote', t.verifyNote, 'text', 'maxlength="200"'), { hint: 'Apa yang perlu dicek' }) +
    '</div><div class="modal-f">' + (isNew ? '' : '<button type="button" class="btn danger" data-act="delete-task" data-id="' + t.id + '">Delete</button>') +
    '<div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">' + (isNew ? 'Create task' : 'Save changes') + '</button></div></div></form>');
  document.getElementById('taskForm').onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target), v = {};
    fd.forEach(function (val, k) { v[k] = String(val).trim(); });
    var errs = {};
    if (!v.name) errs.name = 'Task name is required.';
    if (!v.workstream) errs.workstream = 'Pick or type a workstream.';
    if (v.start && v.deadline && v.start > v.deadline) errs.start = 'Start date is after the deadline.';
    if (v.status === 'Blocked' && !v.blockers) errs.blockers = 'Describe what is blocking this task.';
    if (Object.keys(errs).length) return showErrors(e.target, errs);
    if (isNew) { var o = Object.assign({ id: nextId('T'), createdAt: Date.now() }, v, { updatedAt: Date.now() }); db.tasks.push(o); ui.expanded = o.id; closeModal(); commit('Task created'); }
    else { Object.assign(t, v, { updatedAt: Date.now() }); closeModal(); commit('Task saved'); }
  };
}

function finForm(f, presetTask) {
  var isNew = !f;
  f = f || { item: '', workstream: presetTask ? (taskById(presetTask) || {}).workstream || '' : '', qty: null, unit: '', unitCost: null, estimated: null, invoice: null, dp: null, fee: null, paidAmount: null,
    paymentDeadline: '', invoiceStatus: 'Unsubmitted', paymentStatus: 'Pending Payment', receipt: '', invoiceRef: '', taskId: presetTask || '', notes: '', kind: '', parentId: null, source: 'confirmed', verifyNote: '' };
  var taskOpts = db.tasks.slice().sort(function (a, b) { return (a.workstream + a.name).localeCompare(b.workstream + b.name); }).map(function (t) { return { value: t.id, label: t.workstream + ' · ' + t.name }; });
  var parentOpts = db.finance.filter(function (x) { return x.kind && x.id !== f.id; }).sort(rowOrder).map(function (x) { return { value: x.id, label: x.workstream + ' · ' + x.item }; });
  var hasKids = !isNew && kidsOf(f).length > 0;
  var wsList = '<datalist id="wsList2">' + finCategories().concat(allWorkstreams()).filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (w) { return '<option value="' + esc(w) + '">'; }).join('') + '</datalist>';
  function amt(v) { return v == null ? '' : rpFmt.format(v); }
  openModal('<form id="finForm" novalidate><div class="modal-h"><h3>' + (isNew ? 'New budget item' : 'Edit budget item') + (f.sheetRow ? ' <span class="muted" style="font:500 13px var(--f-body)">· sheet row ' + f.sheetRow + '</span>' : '') + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b">' +
    field('item', 'Item', inp('item', f.item, 'text', 'maxlength="200"'), { req: true, full: true }) +
    field('workstream', 'Budget category', inp('workstream', f.workstream, 'text', 'list="wsList2"') + wsList, { req: true }) +
    field('taskId', 'Linked operational task', sel('taskId', taskOpts, f.taskId, '— Not linked —'), { hint: 'Status task tidak ikut berubah saat dibayar' }) +
    field('kind', 'Row type', sel('kind', [{ value: '', label: 'Line item' }, { value: 'vendor', label: 'Vendor invoice (punya line item)' }, { value: 'allocation', label: 'Alokasi dana (punya pemakaian)' }], f.kind || '')) +
    field('parentId', 'Part of', sel('parentId', parentOpts, f.parentId || '', '— Standalone —'), { hint: hasKids ? 'Item ini punya baris di bawahnya, jadi tidak bisa jadi anak' : 'Pilih vendor invoice / alokasi kalau item ini rinciannya' }) +
    field('qty', 'Quantity', inp('qty', f.qty == null ? '' : f.qty, 'text', 'inputmode="decimal"')) +
    field('unit', 'Unit', inp('unit', f.unit, 'text', 'maxlength="20" placeholder="Pcs / Pack / Pax"')) +
    field('unitCost', 'Harga satuan (Rp)', inp('unitCost', amt(f.unitCost), 'text', 'inputmode="numeric"')) +
    field('estimated', 'Total / estimasi (Rp)', inp('estimated', amt(f.estimated), 'text', 'inputmode="numeric"'), { hint: 'Kosongkan untuk qty × harga' }) +
    field('invoice', 'Invoice amount (Rp)', inp('invoice', amt(f.invoice), 'text', 'inputmode="numeric"')) +
    field('dp', 'DP amount (Rp)', inp('dp', amt(f.dp), 'text', 'inputmode="numeric"')) +
    field('paidAmount', 'Total transferred (Rp)', inp('paidAmount', amt(f.paidAmount), 'text', 'inputmode="numeric"'), { hint: 'Opsional. Isi kalau nominal transfer beda dari DP/invoice' }) +
    field('fee', 'Biaya transfer (Rp)', inp('fee', amt(f.fee), 'text', 'inputmode="numeric"')) +
    field('paymentDeadline', 'Payment deadline', inp('paymentDeadline', f.paymentDeadline, 'date')) +
    field('invoiceStatus', 'Invoice status', sel('invoiceStatus', INV_STATUS, f.invoiceStatus)) +
    field('paymentStatus', 'Payment status', sel('paymentStatus', PAY_STATUS, f.paymentStatus)) +
    field('invoiceRef', 'Invoice / quotation file', inp('invoiceRef', f.invoiceRef, 'text', 'maxlength="300"')) +
    field('receipt', 'Bukti transfer', inp('receipt', f.receipt, 'text', 'maxlength="300" placeholder="Link Drive / nama file / no. referensi"')) +
    '<div class="calc-preview" id="calcPreview"></div><div class="calc-flags" id="calcFlags"></div>' +
    field('notes', 'Notes', ta('notes', f.notes), { full: true }) +
    field('source', 'Data source', sel('source', [{ value: 'confirmed', label: 'Confirmed' }, { value: 'verify', label: 'Needs verification' }], f.source)) +
    field('verifyNote', 'Verification note', inp('verifyNote', f.verifyNote, 'text', 'maxlength="300"')) +
    '</div><div class="modal-f">' + (isNew ? '' : '<button type="button" class="btn danger" data-act="delete-fin" data-id="' + f.id + '">Delete</button>') +
    '<div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">' + (isNew ? 'Add item' : 'Save changes') + '</button></div></div></form>', 'wide');
  var form = document.getElementById('finForm');
  function read() {
    var fd = new FormData(form), v = {}, errs = {};
    fd.forEach(function (val, k) { v[k] = String(val).trim(); });
    ['unitCost','estimated','invoice','dp','paidAmount','fee'].forEach(function (k) { var p = parseAmount(v[k]); if (!p.ok) errs[k] = p.negative ? 'Nominal tidak boleh negatif.' : 'Isi angka saja, contoh 1.500.000'; else v[k] = p.value; });
    if (v.qty === '') v.qty = null; else { var q = Number(String(v.qty).replace(',', '.')); if (isNaN(q) || q < 0) errs.qty = 'Quantity harus angka ≥ 0.'; else v.qty = q; }
    v.parentId = v.parentId || null; v.kind = v.kind || '';
    v.id = f.id;
    return { v: v, errs: errs };
  }
  function preview() {
    var r = read(), c = calc(r.v);
    var cells = c.inherited ? [['Est. total', rp(c.est)], ['Payment', 'dicatat di vendor invoice']] :
      c.allocation ? [['Alokasi', rp(c.est)], ['Terpakai', rp(c.used)], ['Sisa dana', rp(c.fundLeft)]] :
      [['Est. total', rp(c.est)], ['Paid', rp(c.paid)], ['Biaya transfer', rp(c.fee || null)], ['Remaining', rp(c.outstanding) + (c.basedOnEstimate && c.outstanding ? ' (est.)' : '')]];
    document.getElementById('calcPreview').innerHTML = cells.map(function (x) { return '<div><div class="k">' + x[0] + '</div><div class="v">' + x[1] + '</div></div>'; }).join('');
    document.getElementById('calcFlags').innerHTML = c.flags.map(function (x) { return '<span class="flag' + (x.lvl === 'crit' ? ' crit' : '') + '">⚠ ' + esc(x.msg) + '</span>'; }).join('');
  }
  form.addEventListener('input', preview); form.addEventListener('change', preview); preview();
  form.onsubmit = function (e) {
    e.preventDefault();
    var r = read(), v = r.v, errs = r.errs;
    delete v.id;
    if (!v.item) errs.item = 'Item name is required.';
    if (!v.workstream) errs.workstream = 'Pick or type a category.';
    if (v.taskId && !taskById(v.taskId)) errs.taskId = 'That task no longer exists.';
    if (v.parentId && hasKids) errs.parentId = 'Item ini punya baris di bawahnya. Pindahkan dulu baris-baris itu.';
    if (v.parentId && v.kind) errs.kind = 'Vendor invoice / alokasi tidak bisa jadi bagian item lain.';
    if (!v.kind && hasKids) errs.kind = 'Masih ada baris di bawah item ini, jadi tipe harus vendor invoice atau alokasi.';
    if (Object.keys(errs).length) return showErrors(form, errs);
    v.taskId = v.taskId || null;
    if (isNew) { db.finance.push(Object.assign({ id: nextId('F'), createdAt: Date.now() }, v, { updatedAt: Date.now() })); closeModal(); commit('Budget item added'); }
    else { Object.assign(f, v, { updatedAt: Date.now() }); closeModal(); commit('Budget item saved'); }
  };
}

function deleteTask(id) {
  var t = taskById(id); if (!t) return;
  var linked = finForTask(id);
  confirmDialog('Delete task?', '<b>' + esc(t.name) + '</b> will be removed permanently.' + (linked.length ? '<br><br>' + linked.length + ' linked budget item' + (linked.length > 1 ? 's stay' : ' stays') + ' in Finance, marked as not linked.' : ''), 'Delete task', function () {
    db.tasks = db.tasks.filter(function (x) { return x.id !== id; });
    linked.forEach(function (f) { f.taskId = null; f.updatedAt = Date.now(); });
    if (ui.expanded === id) ui.expanded = null;
    commit('Task deleted');
  });
}
function deleteFin(id) {
  var f = finById(id); if (!f) return;
  var kids = kidsOf(f);
  confirmDialog('Delete budget item?', '<b>' + esc(f.item) + '</b> (' + rp(calc(f).base) + ') will be removed and totals recalculated. The linked task is not changed.' +
    (kids.length ? '<br><br>' + kids.length + ' baris di bawahnya tetap disimpan sebagai item mandiri.' : ''), 'Delete item', function () {
    kids.forEach(function (k) { k.parentId = null; k.updatedAt = Date.now(); });
    db.finance = db.finance.filter(function (x) { return x.id !== id; }); commit('Budget item deleted');
  });
}
function deadlineDialog(id) {
  var t = taskById(id); if (!t) return;
  openModal('<form id="dlForm" novalidate><div class="modal-h"><h3>' + esc(t.name) + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b">' +
    '<div class="field full">' + wsTag(t.workstream) + ' ' + statusBadge(t.status) + (t.notes ? '<span class="muted" style="margin-top:6px">' + esc(t.notes) + '</span>' : '') + '</div>' +
    field('start', 'Start date', inp('start', t.start, 'date')) + field('deadline', 'Deadline', inp('deadline', t.deadline, 'date')) +
    field('status', 'Operational status', sel('status', TASK_STATUS, t.status)) +
    '</div><div class="modal-f"><button type="button" class="btn" data-act="open-task" data-id="' + t.id + '">Open full task</button><div class="right"><button type="button" class="btn" data-act="modal-cancel">Cancel</button><button type="submit" class="btn primary">Save</button></div></div></form>', 'sm');
  document.getElementById('dlForm').onsubmit = function (e) {
    e.preventDefault();
    var s = e.target.start.value, d = e.target.deadline.value, st = e.target.status.value;
    if (s && d && s > d) return showErrors(e.target, { start: 'Start date is after the deadline.' });
    if (st === 'Blocked' && !t.blockers) return showErrors(e.target, { status: 'Add the blocker in the full task form first.' });
    t.start = s; t.deadline = d; t.status = st; t.updatedAt = Date.now(); closeModal(); commit('Deadline updated');
  };
}
function dayDialog(iso) {
  var items = db.tasks.filter(function (t) { return t.deadline === iso; });
  openModal('<div class="modal-h"><h3>' + fmtDate(iso) + '</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="panel-b">' + items.map(listRow).join('') + '</div>', 'sm');
}

/* ---------- Data tools ---------- */
function exportDialog() {
  var json = JSON.stringify(db, null, 2);
  openModal('<div class="modal-h"><h3>Export backup</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one"><p class="muted" style="margin:0">' + db.tasks.length + ' tasks · ' + db.finance.length + ' budget items. Copy this JSON somewhere safe, or download it (download works when the site is self-hosted).</p><textarea class="input code" id="exportText" readonly>' + esc(json) + '</textarea></div><div class="modal-f"><div class="right"><button class="btn" id="dlBtn">Download .json</button><button class="btn primary" id="copyBtn">Copy JSON</button></div></div>', 'wide');
  document.getElementById('copyBtn').onclick = function () {
    var ta2 = document.getElementById('exportText');
    var p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(json) : Promise.reject();
    p.then(function () { toast('Backup copied'); }, function () { ta2.focus(); ta2.select(); toast('Text selected — press Ctrl/Cmd+C to copy'); });
  };
  document.getElementById('dlBtn').onclick = function () {
    try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = 'gx27-backup-' + todayISO() + '.json'; document.body.appendChild(a); a.click(); a.remove(); }
    catch (e) { toast('Download blocked here — use Copy JSON instead', true); }
  };
}
function importJsonDialog() {
  openModal('<div class="modal-h"><h3>Restore backup</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one"><p class="muted" style="margin:0">Paste a backup JSON (from Export) or choose a .json file. This replaces all current data.</p><input type="file" id="jsonFile" accept=".json,application/json"><textarea class="input code" id="importText" placeholder="{ &quot;tasks&quot;: [...], &quot;finance&quot;: [...] }"></textarea><div class="form-err" id="importErr" hidden></div></div><div class="modal-f"><div class="right"><button class="btn" data-act="modal-cancel">Cancel</button><button class="btn primary" id="doImport">Replace data</button></div></div>', 'wide');
  document.getElementById('jsonFile').onchange = function (e) { var file = e.target.files[0]; if (!file) return; var r = new FileReader(); r.onload = function () { document.getElementById('importText').value = r.result; }; r.onerror = function () { showImportErr('Could not read that file.'); }; r.readAsText(file); };
  function showImportErr(m) { var el = document.getElementById('importErr'); el.textContent = m; el.hidden = false; }
  document.getElementById('doImport').onclick = function () {
    var d;
    try { d = JSON.parse(document.getElementById('importText').value); } catch (e) { return showImportErr('This is not valid JSON: ' + e.message); }
    if (!d || !Array.isArray(d.tasks) || !Array.isArray(d.finance)) return showImportErr('Backup must contain "tasks" and "finance" arrays.');
    var bad = d.tasks.filter(function (t) { return !t.id || !t.name; }).length + d.finance.filter(function (f) { return !f.id || !f.item; }).length;
    if (bad) return showImportErr(bad + ' record(s) are missing an id or name. Fix the file and try again.');
    var count = d.tasks.length + ' tasks and ' + d.finance.length + ' budget items';
    confirmDialog('Replace all data?', 'Current data will be replaced with ' + count + '. Export a backup first if you might need it.', 'Replace data', function () {
      db = d; db.seq = db.seq || (d.tasks.length + d.finance.length + 100); ui.expanded = null; commit('Backup restored');
    });
  };
}
var HEADER_MAP = {
  item: ['item','detail','nama item','barang','nama barang','description','deskripsi','uraian','kebutuhan'],
  workstream: ['category','kategori','workstream','pos','pos anggaran','divisi','section'],
  qty: ['qty','quantity','jumlah','jml','volume'],
  unitCost: ['unit cost','harga satuan','unit price','harga','price'],
  unit: ['unit','satuan'],
  estimated: ['total price','estimated','estimated cost','estimasi','estimasi biaya','total','total estimasi','budget','anggaran','total harga'],
  invoice: ['inv total','invoice','invoice amount','nominal invoice','tagihan','nilai invoice'],
  dp: ['dp total','dp','down payment','uang muka','nominal dp'],
  paymentDeadline: ['payment deadline','deadline','deadline pembayaran','jatuh tempo','due date','tenggat'],
  invoiceStatus: ['invoice status','status invoice'],
  paymentStatus: ['payment status','status pembayaran','status bayar','status','pembayaran'],
  receipt: ['bukti tf','receipt','transfer receipt','bukti transfer','bukti','bukti tf'],
  notes: ['notes','note','catatan','keterangan','remarks']
};
function parseDelimited(text) {
  var lines = text.replace(/\r/g, '').split('\n').filter(function (l) { return l.trim(); });
  if (!lines.length) return [];
  var delim = lines[0].indexOf('\t') > -1 ? '\t' : (lines[0].split(';').length > lines[0].split(',').length ? ';' : ',');
  return lines.map(function (line) {
    var out = [], cur = '', q = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === delim) { out.push(cur); cur = ''; } else cur += c;
    }
    out.push(cur); return out.map(function (s) { return s.trim(); });
  });
}
function importCsvDialog() {
  openModal('<div class="modal-h"><h3>Import budget sheet</h3><button type="button" class="btn ghost sm" data-act="modal-cancel" aria-label="Close">✕</button></div><div class="modal-b one">' +
    '<p class="muted" style="margin:0">Copy rows from Excel / Google Sheets (including the header row) and paste here. Recognised headers: Item, Category, Qty, Harga satuan, Estimasi/Total, Invoice, DP, Payment deadline, Status invoice, Status pembayaran, Bukti transfer, Notes. Rows named "Subtotal" / "Total" are skipped automatically to avoid double counting.</p>' +
    '<textarea class="input code" id="csvText" placeholder="Item\tCategory\tQty\tHarga satuan\tTotal\tDP\tStatus pembayaran"></textarea>' +
    '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="csvReplace" checked> Remove empty placeholder items for the categories being imported</label>' +
    '<div id="csvPreview" class="muted" style="font-size:13px"></div><div class="form-err" id="csvErr" hidden></div></div>' +
    '<div class="modal-f"><div class="right"><button class="btn" data-act="modal-cancel">Cancel</button><button class="btn primary" id="doCsv" disabled>Import</button></div></div>', 'wide');
  var parsed = null;
  function analyse() {
    var text = document.getElementById('csvText').value, err = document.getElementById('csvErr'), pv = document.getElementById('csvPreview'), btn = document.getElementById('doCsv');
    err.hidden = true; parsed = null; btn.disabled = true; pv.textContent = '';
    if (!text.trim()) return;
    var rows = parseDelimited(text);
    if (rows.length < 2) { err.textContent = 'Need a header row plus at least one data row.'; err.hidden = false; return; }
    var head = rows[0].map(function (h) { return h.toLowerCase().replace(/\(.*?\)/g, '').replace(/rp\.?/g, '').trim(); }), map = {};
    Object.keys(HEADER_MAP).forEach(function (k) { var idx = -1; HEADER_MAP[k].some(function (alias) { idx = head.indexOf(alias); return idx > -1; }); if (idx > -1 && Object.values(map).indexOf(idx) < 0) map[k] = idx; });
    if (map.item == null) { err.textContent = 'Could not find an "Item" column. Rename the item column header to "Item".'; err.hidden = false; return; }
    var items = [], skipped = 0, problems = [], lastCat = '';
    rows.slice(1).forEach(function (r, i) {
      var name = r[map.item] || '';
      var cat = map.workstream != null ? r[map.workstream] : '';
      if (cat) lastCat = cat; else cat = lastCat;
      if (!name) return;
      if (/^(sub\s*-?\s*total|grand\s*total|total)\b/i.test(name)) { skipped++; return; }
      var rec = { item: name, workstream: matchWs(cat) || 'Uncategorized', qty: null, unitCost: null, estimated: null, invoice: null, dp: null, paymentDeadline: '', invoiceStatus: 'Unsubmitted', paymentStatus: 'Pending Payment', receipt: '', notes: '', source: 'confirmed', verifyNote: '' };
      ['unitCost','estimated','invoice','dp'].forEach(function (k) { if (map[k] == null) return; var p = parseAmount(r[map[k]]); if (p.ok) rec[k] = p.value; else problems.push('Row ' + (i + 2) + ': "' + r[map[k]] + '" in ' + k + ' is not a number'); });
      if (map.qty != null && r[map.qty]) { var q = Number(String(r[map.qty]).replace(/[^\d.,]/g, '').replace(',', '.')); if (!isNaN(q)) rec.qty = q; }
      if (map.paymentDeadline != null && r[map.paymentDeadline]) { var d = parseFlexDate(r[map.paymentDeadline]); if (d) rec.paymentDeadline = d; else problems.push('Row ' + (i + 2) + ': date "' + r[map.paymentDeadline] + '" not recognised'); }
      if (map.paymentStatus != null) { var ps = (r[map.paymentStatus] || '').toLowerCase(); rec.paymentStatus = /full|lunas/.test(ps) ? 'Full Paid' : /dp/.test(ps) ? 'DP Paid' : 'Pending Payment'; }
      if (map.invoiceStatus != null) { var is = (r[map.invoiceStatus] || '').toLowerCase(); rec.invoiceStatus = /unsub|belum|not/.test(is) || !is ? 'Unsubmitted' : 'Submitted'; }
      if (map.receipt != null) rec.receipt = r[map.receipt] || '';
      if (map.notes != null) rec.notes = r[map.notes] || '';
      if (rec.workstream === 'Uncategorized') { rec.source = 'verify'; rec.verifyNote = 'Kategori tidak ditemukan di sheet'; }
      items.push(rec);
    });
    if (!items.length) { err.textContent = 'No item rows found after skipping totals.'; err.hidden = false; return; }
    parsed = items;
    var cols = Object.keys(map).map(function (k) { return k; }).join(', ');
    pv.innerHTML = '<b style="color:var(--fg)">' + items.length + ' items ready</b> · ' + skipped + ' total/subtotal rows skipped · columns found: ' + esc(cols) + ' · sum of estimates ' + rp(totals(items).est) +
      (problems.length ? '<div class="flag crit" style="white-space:normal;margin-top:6px">' + esc(problems.slice(0, 5).join(' · ')) + (problems.length > 5 ? ' …' : '') + ' (those cells are left empty)</div>' : '');
    btn.disabled = false;
  }
  document.getElementById('csvText').addEventListener('input', analyse);
  document.getElementById('doCsv').onclick = function () {
    if (!parsed) return;
    var cats = {}; parsed.forEach(function (r) { cats[r.workstream] = 1; });
    if (document.getElementById('csvReplace').checked) db.finance = db.finance.filter(function (f) { return !(f.placeholder && cats[f.workstream] && calc(f).base == null); });
    parsed.forEach(function (r) {
      var task = db.tasks.filter(function (t) { return t.workstream === r.workstream && t.category === 'Procurement'; })[0];
      db.finance.push(Object.assign({ id: nextId('F'), taskId: task ? task.id : null, createdAt: Date.now(), updatedAt: Date.now() }, r));
    });
    closeModal(); ui.page = 'finance'; commit(parsed.length + ' budget items imported');
  };
}
function matchWs(cat) {
  if (!cat) return '';
  var c = cat.toLowerCase().trim(), list = allWorkstreams();
  for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === c) return list[i];
  var aliases = { 'design':'Design & Production','production':'Design & Production','produksi':'Design & Production','game':'Games & Competition','games':'Games & Competition','connect':'GX Connect','got talent':'GX Got Talent','talent':'GX Got Talent','hyrox':'HYROX','entertainment':'Entertainment','hiburan':'Entertainment','tenant':'Tenants','doorprize':'Doorprize','door prize':'Doorprize','hadiah':"Winners' Prizes",'prize':"Winners' Prizes",'winner':"Winners' Prizes",'pengadaan':'Procurement','procurement':'Procurement','emergency':'Emergency Fund','dana darurat':'Emergency Fund','mobile legends':'Mobile Legends','mlbb':'Mobile Legends' };
  for (var k in aliases) if (c.indexOf(k) > -1) return aliases[k];
  return cat.trim();
}

/* ================= Toast ================= */
var toastTimer;
function toast(msg, isErr) {
  var r = document.getElementById('toastRoot');
  r.innerHTML = '<div class="toast' + (isErr ? ' err' : '') + '" role="status">' + esc(msg) + '</div>';
  clearTimeout(toastTimer); toastTimer = setTimeout(function () { r.innerHTML = ''; }, 2600);
}

/* ================= Events ================= */
function go(page) { ui.page = page; try { history.replaceState(null, '', '#' + page); } catch (e) {} render(); main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
document.getElementById('nav').addEventListener('click', function (e) { var b = e.target.closest('button[data-page]'); if (b) go(b.dataset.page); });
document.getElementById('menuBtn').addEventListener('click', function () { var s = document.getElementById('sidebar'); s.classList.toggle('tools-open'); this.setAttribute('aria-expanded', s.classList.contains('tools-open')); });
document.getElementById('sideTools').addEventListener('click', function (e) {
  var b = e.target.closest('[data-tool]'); if (!b) return;
  var tool = b.dataset.tool;
  if (tool === 'export') exportDialog();
  else if (tool === 'import-json') importJsonDialog();
  else if (tool === 'import-csv') importCsvDialog();
  else if (tool === 'reset') confirmDialog('Reset to initial data?', 'All tasks and budget items will be replaced with the original GX27 timeline and empty budget categories. Your edits will be lost unless you exported a backup.', 'Reset data', function () { db = seed(); ui.expanded = null; storageError = ''; commit('Data reset'); });
});
var MUTATING = ['new-task','new-milestone','new-event-item','delete-task','new-fin','delete-fin','import-csv'];
function handleAct(el, e) {
  var act = el.dataset.act, id = el.dataset.id;
  if (MUTATING.indexOf(act) > -1 && !canEdit()) { toast('Hanya admin yang bisa mengubah data.', true); return; }
  switch (act) {
    case 'new-task': taskForm(null); break;
    case 'new-milestone': taskForm(null, { category: 'Program Milestone', workstream: 'GX Connect' }); break;
    case 'new-event-item': taskForm(null, { category: 'Event Day', workstream: 'Event Day', deadline: EVENT_DATE }); break;
    case 'mt-toggle': var w = el.dataset.ws, hd = ui.mtHide || []; ui.mtHide = hd.indexOf(w) > -1 ? hd.filter(function (x) { return x !== w; }) : hd.concat([w]); render(); break;
    case 'edit-task': closeModal(); if (taskById(id)) taskForm(taskById(id)); else toast('That task no longer exists', true); break;
    case 'delete-task': closeModal(); deleteTask(id); break;
    case 'new-fin': closeModal(); finForm(null, el.dataset.task); break;
    case 'edit-fin': e.preventDefault(); closeModal(); if (finById(id)) finForm(finById(id)); break;
    case 'delete-fin': closeModal(); deleteFin(id); break;
    case 'open-task':
      e.preventDefault(); closeModal();
      if (!id || !taskById(id)) { toast('That task no longer exists', true); break; }
      ui.page = 'tasks'; ui.taskView = 'all'; ui.q = ''; ui.fWs = ''; ui.fStatus = ''; ui.fSrc = ''; ui.expanded = id;
      go('tasks');
      setTimeout(function () { var row = main.querySelector('tr[data-id="' + id + '"]'); if (row) row.scrollIntoView({ block: 'center' }); }, 0);
      break;
    case 'go-tasks': ui.taskView = el.dataset.view; go('tasks'); break;
    case 'task-view': ui.taskView = el.dataset.view; ui.expanded = null; render(); break;
    case 'sort': var k = el.dataset.key; ui.sort = { key: k, dir: ui.sort.key === k ? -ui.sort.dir : 1 }; render(); break;
    case 'expand': if (e.target.closest('select,a,button')) return; ui.expanded = ui.expanded === id ? null : id; render(); break;
    case 'clear-filters': ui.q = ui.fWs = ui.fStatus = ui.fSrc = ''; render(); break;
    case 'clear-fin-filters': ui.finQ = ui.finWs = ui.finPay = ui.finInv = ''; render(); break;
    case 'import-csv': importCsvDialog(); break;
    case 'cal-prev': case 'cal-next':
      var p = ui.calMonth.split('-'), d = new Date(+p[0], +p[1] - 1 + (act === 'cal-next' ? 1 : -1), 1); ui.calMonth = toISO(d).slice(0, 7); render(); break;
    case 'cal-today': ui.calMonth = todayISO().slice(0, 7); render(); break;
    case 'cal-chip': if (canEdit()) deadlineDialog(id); else { closeModal(); taskForm(taskById(id)); } break;
    case 'cal-day': dayDialog(el.dataset.date); break;
    case 'modal-cancel': closeModal(); break;
  }
}
document.addEventListener('click', function (e) {
  if (e.target.matches && e.target.matches('.overlay')) { closeModal(); return; }
  var el = e.target.closest('[data-act]'); if (el) handleAct(el, e);
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modalRoot.innerHTML) { closeModal(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); handleAct(e.target, e); }
});
main.addEventListener('input', function (e) {
  var t = e.target;
  if (t.id === 'taskSearch') { ui.q = t.value; render(); }
  else if (t.id === 'finSearch') { ui.finQ = t.value; render(); }
});
main.addEventListener('change', function (e) {
  var t = e.target;
  if (t.dataset.inline && !canEdit()) return;
  var map = { fWs: 'fWs', fStatus: 'fStatus', fSrc: 'fSrc', finWs: 'finWs', finPay: 'finPay', finInv: 'finInv' };
  if (map[t.id]) { ui[map[t.id]] = t.value; render(); return; }
  if (t.dataset.inline === 'status') {
    var task = taskById(t.dataset.id); if (!task) return;
    if (t.value === 'Blocked' && !task.blockers) { t.value = task.status; taskForm(task); setTimeout(function () { var s = document.getElementById('f-status'); if (s) { s.value = 'Blocked'; var b = document.getElementById('f-blockers'); if (b) b.focus(); } }, 0); toast('Add the blocker to mark this task Blocked'); return; }
    task.status = t.value; task.updatedAt = Date.now(); commit('Status → ' + t.value);
  } else if (t.dataset.inline === 'deadline') {
    var task2 = taskById(t.dataset.id); if (!task2) return;
    if (!t.value) { toast('Deadline cannot be empty here — open the task to clear it', true); t.value = task2.deadline; return; }
    if (task2.start && t.value < task2.start) { toast('Deadline is before the start date (' + fmtDate(task2.start, true) + ')', true); t.value = task2.deadline; return; }
    task2.deadline = t.value; task2.updatedAt = Date.now(); commit('Deadline moved to ' + fmtDate(t.value, true));
  }
});
window.addEventListener('hashchange', function () { var h = location.hash.replace('#', ''); if (['timeline','overview','tasks','finance','calendar','admin'].indexOf(h) > -1 && h !== ui.page) { ui.page = h; render(); } });
window.addEventListener('storage', function (e) { if (MODE === 'local' && e.key === STORE_KEY && e.newValue) { try { db = JSON.parse(e.newValue); render(); toast('Updated from another tab'); } catch (x) {} } });

/* ================= Public API (used by admin.js) ================= */
window.GX27App = {
  getDb: function () { return db; },
  setDb: function (d) { db = normalizeDb(d); return db; },
  render: render, commit: commit, toast: toast, go: go,
  openModal: openModal, closeModal: closeModal, confirmDialog: confirmDialog, showErrors: showErrors,
  field: field, inp: inp, sel: sel, ta: ta, esc: esc, rp: rp, fmtDate: fmtDate, todayISO: todayISO, parseFlexDate: parseFlexDate,
  seed: function () { return normalizeDb(seed()); }, normalizeDb: normalizeDb, totals: totals, taskStats: taskStats,
  exportDialog: exportDialog, importJsonDialog: importJsonDialog, importCsvDialog: importCsvDialog,
  STORE_KEY: STORE_KEY, LEGACY_KEYS: [STORE_KEY, 'gx27.dashboard.v2', 'gx27.dashboard.v1'],
  SETTINGS_DEFAULT: SETTINGS_DEFAULT, DEFAULT_LOGO: DEFAULT_LOGO,
  getMode: function () { return MODE; }, canEdit: canEdit,
  setPage: function (p) { ui.page = p; }, getPage: function () { return ui.page; }
};

/* ================= Boot ================= */
var PUBLIC_CACHE = 'gx27.published.cache';
function startPublic(Sync) {
  main.innerHTML = '<div class="empty" style="padding:80px 16px"><b>Memuat data…</b>Mengambil versi terbaru dari server.</div>';
  function fromCache(reason) {
    try {
      var c = JSON.parse(localStorage.getItem(PUBLIC_CACHE) || 'null');
      if (c && c.data) { db = normalizeDb(c.data); storageError = reason + ' Menampilkan versi tersimpan terakhir (' + new Date(c.at).toLocaleString('id-ID') + ').'; return; }
    } catch (e) {}
    db = normalizeDb(seed()); storageError = reason + ' Menampilkan data awal.';
  }
  function load() {
    return Sync.loadPublished().then(function (p) {
      if (p && p.data) {
        db = normalizeDb(p.data); storageError = '';
        try { localStorage.setItem(PUBLIC_CACHE, JSON.stringify({ data: p.data, at: Date.now(), version: p.source_version })); } catch (e) {}
      } else { db = normalizeDb(seed()); storageError = ''; }
    });
  }
  return load().catch(function (err) { fromCache('Tidak bisa terhubung ke database (' + err.message + ').'); }).then(function () {
    render();
    Sync.watch('published', function () { load().then(function () { render(); toast('Konten diperbarui'); }).catch(function () {}); });
  });
}
function boot() {
  var Sync = window.GX27Sync || {}, cfg = window.GX27_CONFIG, wantAdmin = window.GX27_MODE === 'admin';
  var devHost = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(location.hostname);
  if (Sync.ready) {
    MODE = wantAdmin && window.GX27Admin ? 'admin' : 'public';
    if (MODE === 'admin') { window.GX27Admin.start(); return; }
    startPublic(Sync); return;
  }
  if ((cfg && cfg.configured && !Sync.libLoaded) || (!cfg && !devHost)) {
    // config says a database exists but we can't reach it: never fall back to an editable local copy
    MODE = 'public'; db = normalizeDb(seed());
    storageError = cfg ? 'Library database gagal dimuat. Menampilkan data awal (read-only). Coba refresh.' : 'Konfigurasi server tidak bisa dimuat. Menampilkan data awal (read-only).';
    try { var c = JSON.parse(localStorage.getItem(PUBLIC_CACHE) || 'null'); if (c && c.data) { db = normalizeDb(c.data); storageError = 'Server tidak bisa dihubungi. Menampilkan versi tersimpan terakhir.'; } } catch (e) {}
    render(); return;
  }
  // No database configured yet: original local behaviour (edits saved in this browser)
  MODE = 'local'; db = normalizeDb(load());
  if (wantAdmin) storageError = 'Database belum dikonfigurasi. Admin panel aktif setelah SUPABASE_URL dan SUPABASE_ANON_KEY diisi di Vercel (lihat SETUP.md). Sementara ini perubahan hanya tersimpan di browser ini.';
  render();
}
boot();
})();
