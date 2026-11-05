/* Management Report deck renderer — dipakai spv.html (Management Report) dan report-view.html (link viewer).
   Input: snapshot { key, title, period, by, role, division, generatedAt, months:[{ ym, name, sections:[{ key, name, tasks:[{ title, cat, status, priority, links }] }] }], team:{ HD:{n,done,people:{}}, AM:{…} } }
   Status: DONE / IN PROGRESS / PLAN / NOT STARTED. Tidak ada remarks di snapshot (aman untuk link viewer). */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => /^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '';
  const SEC = { DAILY: 'Daily Task', WEEKLY: 'Weekly Task', MONTHLY: 'Monthly Task', FERRE: "Pak Ferre's Task", ONEOFF: 'One-off Task' };
  const ST = { 'DONE': ['Done', 'd'], 'IN PROGRESS': ['In progress', 'p'], 'PLAN': ['Plan', 'l'], 'NOT STARTED': ['Not started', 'n'] };
  const ORDER = ['DAILY', 'WEEKLY', 'MONTHLY', 'FERRE', 'ONEOFF'];
  const LINK = '<svg viewBox="0 0 24 24"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';
  const ymName = ym => { const [y, m] = ym.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); };

  const CSS = `
.mr{--mr-bg:#FFFFFF;--mr-card:#F7F7F8;--mr-ink:#1D1D1F;--mr-mut:#6E6E73;--mr-line:#E5E5EA;--mr-y:#D9A400;--mr-track:#EDEDF0;--mr-d:#22C55E;--mr-p:#F59E0B;--mr-l:#A1A1AA;--mr-n:#EF4444;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--mr-ink)}
.mr *{box-sizing:border-box}
.mr-stage{position:relative;background:var(--mr-bg);border-radius:18px;overflow:hidden;width:100%;border:1px solid var(--mr-line);box-shadow:0 18px 50px rgba(0,0,0,.08);outline:none}
.mr-slide{position:relative;padding:44px 52px 56px;display:none;flex-direction:column;min-height:min(74vh,56.25vw)}
.mr-slide.on{display:flex;animation:mrIn .25s ease}
@keyframes mrIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.mr-kick{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--mr-y)}
.mr-h{font-size:clamp(20px,2.6vw,34px);font-weight:800;letter-spacing:-.01em;margin:6px 0 4px;line-height:1.15}
.mr-sub{color:var(--mr-mut);font-size:clamp(12px,1.1vw,15px);margin:0 0 18px}
.mr-cover{justify-content:space-between;background:radial-gradient(circle at 88% 18%,rgba(245,197,24,.30),transparent 42%),radial-gradient(circle at 8% 95%,rgba(245,197,24,.14),transparent 38%),var(--mr-bg)}
.mr-cover .t1{font-family:Montserrat,Inter,sans-serif;font-size:clamp(30px,5.4vw,72px);font-weight:900;line-height:1;letter-spacing:-.02em;margin:14px 0 0}
.mr-cover .t2{font-family:Montserrat,Inter,sans-serif;font-size:clamp(30px,5.4vw,72px);font-weight:900;line-height:1.05;color:var(--mr-y)}
.mr-cover .per{margin-top:14px;font-size:clamp(13px,1.4vw,18px);color:var(--mr-mut)}
.mr-by small{display:block;font-size:11px;letter-spacing:.14em;color:var(--mr-mut);font-weight:700}.mr-by b{display:block;font-size:clamp(14px,1.5vw,19px);margin-top:4px}.mr-by span{color:var(--mr-mut);font-size:13px}
.mr-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.mr-kpi{background:var(--mr-card);border:1px solid var(--mr-line);border-radius:14px;padding:12px 14px}.mr-kpi span{display:block;font-size:11.5px;color:var(--mr-mut);font-weight:700;letter-spacing:.04em}.mr-kpi b{display:block;font-size:clamp(20px,2.4vw,32px);margin-top:4px}
.mr-bars{display:flex;flex-direction:column;gap:9px}
.mr-bar{display:grid;grid-template-columns:120px 1fr 60px;gap:12px;align-items:center;font-size:13px}
.mr-bar .tr{height:14px;border-radius:999px;background:var(--mr-track);overflow:hidden;display:flex}.mr-bar .tr i{display:block;height:100%}
.mr-bar .pc{text-align:right;font-weight:800}
.mr-bar.fut{color:var(--mr-mut)}
.mr-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:11.5px;color:var(--mr-mut);margin-top:12px}.mr-leg i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.mr-mh{display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:14px}
.mr-no{font-family:Montserrat,Inter,sans-serif;font-size:clamp(34px,4.6vw,60px);font-weight:900;color:var(--mr-y);line-height:.9}
.mr-ms{display:flex;gap:16px;margin-left:auto;flex-wrap:wrap}.mr-ms div{text-align:center}.mr-ms b{display:block;font-size:clamp(16px,1.8vw,24px)}.mr-ms span{font-size:11px;color:var(--mr-mut)}
.mr-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;align-items:start}
.mr-sc{background:var(--mr-card);border:1px solid var(--mr-line);border-radius:14px;padding:12px 14px}
.mr-sc h4{margin:0 0 8px;font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;display:flex;justify-content:space-between;gap:8px}.mr-sc h4 span{color:var(--mr-mut);font-weight:700}
.mr-tk{display:flex;gap:9px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--mr-line);font-size:13px;line-height:1.35}.mr-tk:first-of-type{border-top:0}
.mr-dot{flex:none;width:9px;height:9px;border-radius:50%;margin-top:4px}
.mr-dot.d{background:var(--mr-d)}.mr-dot.p{background:var(--mr-p)}.mr-dot.l{background:var(--mr-l)}.mr-dot.n{background:var(--mr-n)}
.mr-tk .tt{flex:1}.mr-tk .cat{font-size:10.5px;font-weight:800;color:var(--mr-mut);margin-left:4px}
.mr-tk a{color:var(--mr-y);display:inline-flex;vertical-align:-2px;margin-left:5px}.mr-tk a svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.2}
.mr-hi{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mr-team{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mr-ppl{display:flex;flex-direction:column;gap:6px;margin-top:8px}.mr-ppl div{display:flex;justify-content:space-between;font-size:13px;border-top:1px solid var(--mr-line);padding-top:6px}
.mr-empty{color:var(--mr-mut);font-size:13.5px;padding:8px 0}
.mr-ctl{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px}
.mr-ctl button,.mr-ctl a{font:600 13px Inter,sans-serif;border:1px solid var(--line,#E5E5EA);background:var(--card,#fff);color:var(--ink,#1D1D1F);border-radius:9px;padding:7px 12px;cursor:pointer;text-decoration:none}
.mr-ctl button[aria-pressed="true"]{background:var(--ink,#1D1D1F);color:var(--bg,#fff)}
.mr-ctl .pg{font-size:12.5px;color:var(--muted,#6E6E73);margin:0 4px}
.mr-ctl .sp{flex:1}
.mr-dots{display:flex;gap:5px;flex-wrap:wrap}
.mr-stage:fullscreen{border-radius:0;width:100vw;height:100vh;overflow:auto}.mr-stage:fullscreen .mr-slide{min-height:100vh}
.mr-foot{position:absolute;left:52px;right:52px;bottom:18px;display:flex;justify-content:space-between;font-size:11px;color:var(--mr-mut);pointer-events:none}
@media (max-width:760px){.mr-slide{padding:22px 18px 44px;min-height:0}
.mr-kpis{grid-template-columns:1fr 1fr}.mr-bar{grid-template-columns:84px 1fr 44px;font-size:12px}.mr-hi,.mr-team{grid-template-columns:1fr}.mr-ms{margin-left:0}.mr-foot{bottom:14px;left:18px;right:18px}}
`;
  function injectCss() { if (document.getElementById('mr-css')) return; const s = document.createElement('style'); s.id = 'mr-css'; s.textContent = CSS; document.head.appendChild(s); }

  function stats(tasks) {
    const c = k => tasks.filter(t => t.status === k).length;
    const n = tasks.length, d = c('DONE');
    return { n, d, p: c('IN PROGRESS'), l: c('PLAN'), ns: c('NOT STARTED'), pct: n ? Math.round(d / n * 100) : 0 };
  }
  const allTasks = m => m.sections.flatMap(s => s.tasks);
  function bar(label, s, fut) {
    if (fut || !s.n) return `<div class="mr-bar fut"><span>${esc(label)}</span><div class="tr"></div><span class="pc">${fut ? 'nanti' : '—'}</span></div>`;
    const w = k => (s[k] / s.n * 100).toFixed(2) + '%';
    return `<div class="mr-bar"><span>${esc(label)}</span><div class="tr"><i style="width:${w('d')};background:var(--mr-d)"></i><i style="width:${w('p')};background:var(--mr-p)"></i><i style="width:${w('l')};background:var(--mr-l)"></i><i style="width:${w('ns')};background:var(--mr-n)"></i></div><span class="pc">${s.pct}%</span></div>`;
  }
  function tk(t) {
    const [, k] = ST[t.status] || ST['NOT STARTED'];
    const links = (t.links || []).map(l => safeUrl(l.url)).filter(Boolean).slice(0, 2);
    return `<div class="mr-tk"><i class="mr-dot ${k}" title="${esc((ST[t.status] || ST['NOT STARTED'])[0])}"></i><div class="tt">${esc(t.title)}${t.cat && t.cat !== 'General' ? `<span class="cat">${esc(t.cat)}</span>` : ''}${links.map(u => `<a href="${esc(u)}" target="_blank" rel="noopener" title="Buka link">${LINK}</a>`).join('')}</div></div>`;
  }
  const LEG = `<div class="mr-leg"><span><i style="background:var(--mr-d)"></i>Done</span><span><i style="background:var(--mr-p)"></i>In progress</span><span><i style="background:var(--mr-l)"></i>Plan</span><span><i style="background:var(--mr-n)"></i>Not started</span></div>`;

  function slides(S) {
    const out = [], now = new Date(), curYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const months = S.months || [], withTasks = months.filter(m => allTasks(m).length);
    const tot = stats(months.flatMap(allTasks));
    out.push(['Cover', `<div class="mr-slide mr-cover"><div><div class="mr-kick">${esc(S.kicker || 'Management Report')}</div>
      <div class="t1">${esc(S.title1 || 'Report')}</div><div class="t2">${esc(S.title2 || S.title || '')}</div><div class="per">${esc(S.period || '')}${S.division ? ' · ' + esc(S.division) : ''}</div></div>
      <div class="mr-by"><small>PREPARED BY</small><b>${esc(S.by || '')}</b><span>${esc(S.role || '')}</span></div></div>`]);
    const monthAvg = withTasks.length ? Math.round(withTasks.reduce((a, m) => a + stats(allTasks(m)).pct, 0) / withTasks.length) : 0;
    out.push(['Overview', `<div class="mr-slide"><div class="mr-kick">Overview</div><div class="mr-h">${esc(S.period || '')}</div><p class="mr-sub">Ringkasan task per bulan${S.auto ? ' — diambil otomatis dari Personal To-Do List' : ''}.</p>
      <div class="mr-kpis"><div class="mr-kpi"><span>TOTAL TASK</span><b>${tot.n}</b></div><div class="mr-kpi"><span>DONE</span><b style="color:var(--mr-d)">${tot.d}</b></div><div class="mr-kpi"><span>IN PROGRESS</span><b style="color:var(--mr-p)">${tot.p}</b></div><div class="mr-kpi"><span>AVG COMPLETION</span><b style="color:var(--mr-y)">${monthAvg}%</b></div></div>
      <div class="mr-bars">${months.map(m => bar(m.name.replace(/ \d{4}$/, ''), stats(allTasks(m)), m.ym > curYm)).join('')}</div>${LEG}</div>`]);
    withTasks.forEach(m => {
      const s = stats(allTasks(m)), no = months.indexOf(m) + 1;
      const secs = ORDER.map(k => m.sections.find(x => x.key === k)).filter(Boolean).concat(m.sections.filter(x => !ORDER.includes(x.key))).filter(x => x.tasks.length);
      out.push([m.name.replace(/ \d{4}$/, ''), `<div class="mr-slide"><div class="mr-mh"><div class="mr-no">${String(no).padStart(2, '0')}</div><div><div class="mr-kick">${s.pct}% selesai</div><div class="mr-h" style="margin:2px 0 0">${esc(m.name)}</div></div>
        <div class="mr-ms"><div><b>${s.n}</b><span>Task</span></div><div><b style="color:var(--mr-d)">${s.d}</b><span>Done</span></div><div><b style="color:var(--mr-p)">${s.p}</b><span>Progress</span></div><div><b style="color:var(--mr-l)">${s.l}</b><span>Plan</span></div><div><b style="color:var(--mr-n)">${s.ns}</b><span>Not started</span></div></div></div>
        <div class="mr-cols">${secs.map(sec => `<div class="mr-sc"><h4>${esc(sec.name || SEC[sec.key] || sec.key)}<span>${sec.tasks.filter(t => t.status === 'DONE').length}/${sec.tasks.length}</span></h4>${sec.tasks.map(tk).join('')}</div>`).join('')}</div></div>`]);
    });
    if (withTasks.length) {
      const flat = withTasks.flatMap(m => allTasks(m).map(t => ({ ...t, m: m.name.replace(/ \d{4}$/, '') })));
      const hiDone = flat.filter(t => t.status === 'DONE' && t.priority === 'High');
      const seen = new Set(), uniq = a => a.filter(t => !seen.has(t.title) && seen.add(t.title));
      const last = withTasks[withTasks.length - 1], open = allTasks(last).filter(t => t.status !== 'DONE');
      out.push(['Highlights', `<div class="mr-slide"><div class="mr-kick">Highlights</div><div class="mr-h">Pencapaian & carry-over</div><p class="mr-sub">Task prioritas tinggi yang selesai, dan task yang masih berjalan di ${esc(last.name)}.</p>
        <div class="mr-hi"><div class="mr-sc"><h4>High priority — done<span>${hiDone.length}</span></h4>${uniq(hiDone).slice(0, 14).map(t => tk({ ...t, title: t.title + ' · ' + t.m })).join('') || '<div class="mr-empty">—</div>'}</div>
        <div class="mr-sc"><h4>Masih berjalan<span>${open.length}</span></h4>${open.slice(0, 14).map(tk).join('') || '<div class="mr-empty">Semua task bulan ini selesai.</div>'}</div></div></div>`]);
    }
    if (S.team && (S.team.HD || S.team.AM)) {
      const blk = (k, name) => { const t = S.team[k] || { n: 0, done: 0, people: {} }; const p = Object.entries(t.people || {}).sort((a, b) => b[1].n - a[1].n);
        return `<div class="mr-sc"><h4>${name}<span>${t.done}/${t.n} done</span></h4>${t.n ? `<div class="mr-bars">${bar('Progress', { n: t.n, d: t.done, p: t.prog || 0, l: 0, ns: t.n - t.done - (t.prog || 0), pct: t.n ? Math.round(t.done / t.n * 100) : 0 })}</div>` : '<div class="mr-empty">Belum ada task tim.</div>'}
          ${p.length ? `<div class="mr-ppl">${p.map(([nm, v]) => `<div><span>${esc(nm)}</span><b>${v.done}/${v.n}</b></div>`).join('')}</div>` : ''}</div>`; };
      out.push(['Tim', `<div class="mr-slide"><div class="mr-kick">Team To-Do List</div><div class="mr-h">Task yang di-assign ke tim</div><p class="mr-sub">Helpdesk Customer Support & Account Manager VIP · ${esc(S.period || '')}</p>
        <div class="mr-team">${blk('HD', 'Helpdesk Customer Support')}${blk('AM', 'Account Manager VIP')}</div></div>`]);
    }
    out.push(['Summary', `<div class="mr-slide"><div class="mr-kick">Summary</div><div class="mr-h">${esc(S.title || '')}</div><p class="mr-sub">${tot.n} task · ${tot.d} done · rata-rata penyelesaian per bulan ${monthAvg}%.</p>
      <div class="mr-cols">${withTasks.map(m => { const s = stats(allTasks(m)); return `<div class="mr-sc"><h4>${esc(m.name.replace(/ \d{4}$/, ''))}<span>${s.pct}%</span></h4><div class="mr-bars">${bar('', s)}</div><div class="mr-ppl"><div><span>Done</span><b>${s.d}</b></div><div><span>In progress</span><b>${s.p}</b></div><div><span>Plan / Not started</span><b>${s.l + s.ns}</b></div></div></div>`; }).join('') || '<div class="mr-empty">Belum ada data.</div>'}</div>
      ${S.generatedAt ? `<p class="mr-sub" style="margin-top:14px">Data per ${esc(new Date(S.generatedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }))}</p>` : ''}</div>`]);
    return out;
  }

  function render(el, S, opt = {}) {
    injectCss();
    const sl = slides(S); let i = Math.min(opt.start || 0, sl.length - 1);
    el.innerHTML = `<div class="mr"><div class="mr-stage" tabindex="0">${sl.map(s => s[1]).join('')}<div class="mr-foot"><span>GlobalXtreme · Customer Service</span><span class="mr-pgn"></span></div></div>
      <div class="mr-ctl"><button data-mr="prev" aria-label="Sebelumnya">←</button><div class="mr-dots">${sl.map((s, k) => `<button data-mr-go="${k}">${esc(s[0])}</button>`).join('')}</div><button data-mr="next" aria-label="Berikutnya">→</button><span class="pg"></span><span class="sp"></span>${opt.extra || ''}<button data-mr="fs">⛶ Present</button></div></div>`;
    const stage = el.querySelector('.mr-stage'), S2 = [...el.querySelectorAll('.mr-slide')];
    const go = k => { i = Math.max(0, Math.min(sl.length - 1, k)); S2.forEach((s, j) => s.classList.toggle('on', j === i)); el.querySelectorAll('[data-mr-go]').forEach((b, j) => b.setAttribute('aria-pressed', j === i)); el.querySelector('.pg').textContent = `${i + 1} / ${sl.length}`; el.querySelector('.mr-pgn').textContent = `${i + 1} / ${sl.length}`; if (opt.onPage) opt.onPage(i); };
    el.querySelector('.mr-ctl').addEventListener('click', e => {
      const b = e.target.closest('[data-mr],[data-mr-go]'); if (!b) return;
      if (b.dataset.mrGo != null) return go(+b.dataset.mrGo);
      if (b.dataset.mr === 'prev') go(i - 1); else if (b.dataset.mr === 'next') go(i + 1);
      else if (b.dataset.mr === 'fs') { try { stage.requestFullscreen ? stage.requestFullscreen() : null; } catch (er) {} stage.focus(); }
    });
    const key = e => { if (!el.isConnected || el.offsetParent === null && !document.fullscreenElement) return; if (/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(i + 1); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(i - 1); } else if (e.key === 'Home') go(0); else if (e.key === 'End') go(sl.length - 1); };
    if (el._mrKey) document.removeEventListener('keydown', el._mrKey);
    el._mrKey = key; document.addEventListener('keydown', key);
    let tx = null; stage.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); tx = null; });
    go(i);
  }

  /* ---------- builder dari task to-do (H2) ---------- */
  function fromTasks(tasks, o) {
    const months = [];
    for (let ym = o.from; ym <= o.to;) {
      const mt = tasks.filter(t => t.month === ym && !t.team && t.category !== 'Pribadi');
      const sections = ORDER.map(k => ({ key: k, name: SEC[k], tasks: mt.filter(t => t.section === k).sort((a, b) => (a.sort || 0) - (b.sort || 0)).map(t => ({ title: t.title, cat: t.category, status: t.status, priority: t.priority, links: (t.links || []).filter(l => safeUrl(l.url)).map(l => ({ label: l.label, url: l.url })) })) })).filter(s => s.tasks.length);
      months.push({ ym, name: ymName(ym), sections });
      let [y, m] = ym.split('-').map(Number); m++; if (m > 12) { m = 1; y++; } ym = `${y}-${String(m).padStart(2, '0')}`;
    }
    const team = {};
    tasks.filter(t => t.team && t.month >= o.from && t.month <= o.to).forEach(t => {
      const T = team[t.team] = team[t.team] || { n: 0, done: 0, prog: 0, people: {} };
      T.n++; if (t.status === 'DONE') T.done++; if (t.status === 'IN PROGRESS') T.prog++;
      const who = t.assignee || 'Semua tim', P = T.people[who] = T.people[who] || { n: 0, done: 0 }; P.n++; if (t.status === 'DONE') P.done++;
    });
    return { auto: true, team, months, generatedAt: new Date().toISOString(), ...o.meta };
  }
  /* ---------- builder dari report H1 (format lama: status 'Done' dsb) ---------- */
  function fromH1(D, meta) {
    const map = { 'Done': 'DONE', 'Solved': 'DONE', 'In Progress': 'IN PROGRESS', 'Plan': 'PLAN', 'Not Started': 'NOT STARTED' };
    const months = (D.months || []).map((m, k) => ({ ym: `2026-${String(k + 1).padStart(2, '0')}`, name: m.name, sections: (m.sections || []).map((s, j) => ({ key: 'S' + j, name: s.name, tasks: (s.tasks || []).map(t => ({ title: t.title, status: map[t.status] || 'PLAN', priority: '', links: safeUrl(t.link) ? [{ label: 'Link', url: t.link }] : [] })) })) }));
    return { months, generatedAt: new Date().toISOString(), ...meta };
  }
  window.MReport = { render, fromTasks, fromH1, stats, ymName };
})();
