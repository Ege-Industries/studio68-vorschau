// R3: Live-Trainingsplan (Woche als Raster am Desktop, Tagesliste am Handy)
import { DAYS, DAYS_LONG, now, hm, fmtHM, key, ddmm, addDays, startOfWeek, minsOf, cancellation, liveInfo, discById, esc, dur } from './data.js';

const START = 9 * 60 + 30, END = 22 * 60;

export function initPlan(data, { onBook }) {
  const grid = document.getElementById('planGrid'), daysEl = document.getElementById('planDays');
  const filt = document.getElementById('planFilter'), nowEl = document.getElementById('plNow'), clock = document.getElementById('plClock');
  const mq = matchMedia('(max-width: 900px)');
  let week = 0, solo = null, selDay = null;
  const color = id => (discById(data, id) || {}).color || '#ff6b1a';

  const used = data.disciplines.filter(d => data.schedule.some(c => c.disc === d.id));
  filt.innerHTML = used.map(d => `<button class="pf" data-id="${d.id}" style="--c:${d.color}"><i></i>${esc(d.name)}</button>`).join('');
  filt.addEventListener('click', e => {
    const b = e.target.closest('.pf'); if (!b) return;
    solo = solo === b.dataset.id ? null : b.dataset.id;
    filt.querySelectorAll('.pf').forEach(x => x.classList.toggle('off', !!solo && x.dataset.id !== solo));
    render();
  });
  document.querySelectorAll('.pw').forEach(b => b.addEventListener('click', () => {
    week = +b.dataset.week; selDay = null;
    document.querySelectorAll('.pw').forEach(x => x.classList.toggle('on', x === b));
    render();
  }));

  function evState(c, date, t) {
    const k = key(date), tk = key(t), nm = minsOf(t), s = hm(c.start), e = hm(c.end);
    const x = cancellation(data, c.id, k);
    const past = date < new Date(t.getFullYear(), t.getMonth(), t.getDate()) || (k === tk && e <= nm);
    const live = !x && k === tk && s <= nm && e > nm;
    return { k, x, past, live, s, e };
  }
  function evHTML(c, date, t, style = '', narrow = false) {
    const st = evState(c, date, t);
    const cls = ['pg-ev', narrow ? 'narrow' : '', st.x ? 'x' : '', st.past && !st.x ? 'past' : '', st.live ? 'live' : '', solo && c.disc !== solo ? 'dim' : ''].join(' ');
    return `<button class="${cls}" style="--c:${color(c.disc)};${style}" data-id="${c.id}" data-k="${st.k}" ${st.x || st.past ? 'tabindex="-1"' : ''}
      aria-label="${esc(c.title)} ${DAYS_LONG[date.getDay()]} ${c.start} bis ${c.end}${st.x ? ', fällt aus' : ''}">
      <span class="t">${narrow ? c.start : `${c.start}–${c.end}`}</span><span class="n">${esc(c.title)}</span><span class="l">${esc(c.level || '')}</span>
      ${st.x ? `<span class="why">${esc(st.x.reason || 'Fällt aus')}</span>` : `<span class="b">${st.past ? '' : 'Probetraining →'}</span>`}
    </button>`;
  }

  function renderDesktop(t) {
    const ws = addDays(new Date(t.getFullYear(), t.getMonth(), t.getDate()), week * 7), tk = key(t), nm = minsOf(t);
    // Stunden mit Kursen groß, leere Stunden schmal
    const used = new Set(); data.schedule.forEach(c => { for (let m = Math.floor(hm(c.start) / 60) * 60; m < hm(c.end); m += 60) used.add(m / 60); });
    const h0 = Math.floor(START / 60), h1 = Math.ceil(END / 60), HB = 64, HS = 20, ys = [0];
    for (let h = h0; h < h1; h++) ys.push(ys[ys.length - 1] + (used.has(h) ? HB : HS));
    const Y = min => { const h = Math.floor(min / 60), i = Math.max(0, Math.min(h1 - h0, h - h0)); const hh = (ys[i + 1] ?? ys[i]) - ys[i]; return ys[i] + (min % 60) / 60 * hh - (START - h0 * 60) / 60 * ((ys[1] - ys[0])); };
    const hours = []; for (let m = Math.ceil(START / 60) * 60; m <= END; m += 60) hours.push(m);
    const bodyH = Y(END);
    const lines = hours.map(m => `<i class="pg-hl" style="top:${Y(m)}px"></i>`).join('');
    let html = `<div class="pg-axis"><div class="pg-head"></div><div style="position:relative;height:${bodyH}px">${hours.map(m => `<span class="${used.has(m / 60) ? '' : 'sm'}" style="top:${Y(m)}px">${fmtHM(m)}</span>`).join('')}</div></div>`;
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i), dow = d.getDay(), k = key(d);
      const cl = data.schedule.filter(c => c.day === dow).sort((a, b) => hm(a.start) - hm(b.start));
      // Überschneidungen nebeneinander
      const lanes = [];
      cl.forEach(c => { let l = 0; while (lanes[l] && lanes[l].some(o => hm(o.start) < hm(c.end) && hm(c.start) < hm(o.end))) l++; (lanes[l] = lanes[l] || []).push(c); c._lane = l; });
      const nl = Math.max(1, lanes.length);
      const evs = cl.map(c => {
        const top = Y(hm(c.start)), h = Y(hm(c.end)) - top - 3;
        const w = 100 / nl, left = c._lane * w;
        const st = nl > 1 ? `top:${top}px;height:${h}px;left:calc(${left}% + 3px);right:auto;width:calc(${w}% - 6px)` : `top:${top}px;height:${h}px`;
        return evHTML(c, d, t, st, nl > 1);
      }).join('');
      const nowLine = k === tk && nm >= START && nm <= END ? `<div class="pg-now" style="top:${Y(nm)}px" data-t="JETZT ${fmtHM(nm)}"></div>` : '';
      html += `<div class="pg-col ${k === tk ? 'today' : ''}"><div class="pg-head">${DAYS[dow]}<small>${ddmm(d)}${k === tk ? ' · HEUTE' : ''}</small></div>
        <div class="pg-body" style="height:${bodyH}px">${lines}${evs}${nowLine}</div></div>`;
    }
    grid.innerHTML = html;
  }

  function renderMobile(t) {
    const ws = addDays(new Date(t.getFullYear(), t.getMonth(), t.getDate()), week * 7), tk = key(t);
    if (selDay == null) selDay = 0;
    daysEl.innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(ws, i), has = data.schedule.some(c => c.day === d.getDay() && (!solo || c.disc === solo));
      return `<button class="pd ${i === selDay ? 'on' : ''} ${key(d) === tk ? 'today' : ''}" data-i="${i}" role="tab" aria-selected="${i === selDay}">${DAYS[d.getDay()]}<small>${ddmm(d)}</small><i class="${has ? '' : 'none'}"></i></button>`;
    }).join('');
    const d = addDays(ws, selDay), dow = d.getDay();
    const cl = data.schedule.filter(c => c.day === dow && (!solo || c.disc === solo)).sort((a, b) => hm(a.start) - hm(b.start));
    grid.innerHTML = cl.length ? `<div class="pg-list">${cl.map(c => evHTML(c, d, t)).join('')}</div>`
      : `<div class="plan-empty">${DAYS_LONG[dow]}: kein Kurs. ${data.disciplines.some(x => x.open) ? 'Die Muskelfabrik hat trotzdem offen.' : ''}</div>`;
    const on = daysEl.querySelector('.on'); if (on) daysEl.scrollLeft = on.offsetLeft - daysEl.clientWidth / 2 + on.offsetWidth / 2;
  }
  daysEl.addEventListener('click', e => { const b = e.target.closest('.pd'); if (!b) return; selDay = +b.dataset.i; render(); });
  let sx = 0;
  grid.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  grid.addEventListener('touchend', e => {
    if (!mq.matches) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 60) { selDay = Math.max(0, Math.min(6, selDay + (dx < 0 ? 1 : -1))); render(); }
  }, { passive: true });

  grid.addEventListener('click', e => {
    const b = e.target.closest('.pg-ev'); if (!b || b.classList.contains('x') || b.classList.contains('past')) return;
    const c = data.schedule.find(x => x.id === b.dataset.id);
    onBook && onBook({ disc: c.disc, classId: c.id, key: b.dataset.k });
  });

  function status(t) {
    const li = liveInfo(data, t), parts = [];
    if (li.running.length) parts.push(`<span class="live">LIVE</span> ${li.running.map(o => `<b>${esc(o.cls.title)}</b> · noch ${dur(o.end - minsOf(t))}`).join(' + ')}`);
    if (li.next) parts.push(`Nächstes: <b>${esc(li.next.cls.title)}</b> · ${DAYS[li.next.date.getDay()]} ${li.next.cls.start} · in ${dur(li.inMin)}`);
    const tk = key(t), todayX = (data.cancellations || []).filter(c => c.date === tk);
    if (todayX.length) parts.push(`<span style="color:var(--red)">Heute fällt aus: ${todayX.map(x => { const c = data.schedule.find(s => s.id === x.classId); return c ? `${esc(c.title)} ${c.start}` : ''; }).join(', ')}</span>`);
    nowEl.innerHTML = parts.join('<br>') || 'Diese Woche keine Kurse eingetragen.';
  }

  let lastMin = -1;
  function render() {
    const t = now();
    mq.matches ? renderMobile(t) : (daysEl.innerHTML = '', renderDesktop(t));
    status(t); lastMin = minsOf(t);
  }
  mq.addEventListener('change', render);
  setInterval(() => {
    const t = now();
    clock.textContent = `${DAYS[t.getDay()].toUpperCase()} ${fmtHM(minsOf(t))}:${String(t.getSeconds()).padStart(2, '0')}`;
    if (minsOf(t) !== lastMin) render();
  }, 1000);
  render();
  return { render };
}
