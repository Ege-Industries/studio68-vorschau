// Studio68 – Startpunkt
import { loadData, now, DAYS, hm, key, minsOf, openState, liveInfo, matches, cancellation, addDays, esc, dur } from './data.js';
import { initPlan } from './plan.js';
import { initBooking } from './booking.js';
import { initGenx } from './genx.js';
import { mountChrome, initChrome } from './chrome.js';

mountChrome('home');

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const bootBar = $('#bootBar'), bootPct = $('#bootPct');
let shownPct = 0;
const progress = p => { shownPct = Math.max(shownPct, p); bootBar.style.width = shownPct + '%'; bootPct.textContent = String(Math.round(shownPct)).padStart(3, '0') + '%'; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const tStart = performance.now();

// ---------- Ton (nur nach Klick) ----------
const snd = { on: true, ac: null };
function ac() { if (!snd.ac) snd.ac = new (window.AudioContext || window.webkitAudioContext)(); if (snd.ac.state === 'suspended') snd.ac.resume(); return snd.ac; }
function thud(s) {
  if (!snd.on) return;
  try {
    const a = ac(), t = a.currentTime, len = Math.floor(.22 * a.sampleRate), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 5);
    const src = a.createBufferSource(); src.buffer = buf;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700 + s * 600;
    const g = a.createGain(); g.gain.value = .5 * s; src.connect(lp).connect(g).connect(a.destination); src.start(t);
    const o = a.createOscillator(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + .2);
    const og = a.createGain(); og.gain.setValueAtTime(.8 * Math.min(1, s), t); og.gain.exponentialRampToValueAtTime(.001, t + .3);
    o.connect(og).connect(a.destination); o.start(t); o.stop(t + .32);
    for (let k = 0; k < 4; k++) {
      const o2 = a.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 2600 + Math.random() * 2600;
      const g2 = a.createGain(), tt = t + .06 + k * .045 + Math.random() * .03;
      g2.gain.setValueAtTime(0, tt); g2.gain.linearRampToValueAtTime(.02 * s, tt + .004); g2.gain.exponentialRampToValueAtTime(.0001, tt + .13);
      o2.connect(g2).connect(a.destination); o2.start(tt); o2.stop(tt + .15);
    }
  } catch {}
}
function bell() {
  if (!snd.on) return;
  try {
    const a = ac();
    [0, .32].forEach(off => {
      const t = a.currentTime + off;
      [1, 2.76, 5.4].forEach((m, i) => {
        const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 1180 * m;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime([.18, .07, .03][i], t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4 - i * .3);
        o.connect(g).connect(a.destination); o.start(t); o.stop(t + 1.5);
      });
    });
  } catch {}
}

// ---------- Start ----------
(async function boot() {
  progress(8);
  const fonts = Promise.all(['400 40px Anton', '900 40px Tektur', '500 12px "JetBrains Mono"', '400 20px "Permanent Marker"', '600 20px Caveat', '400 20px Michroma', '600 16px "Inter Tight"']
    .map(f => document.fonts.load(f))).catch(() => {});
  const data = await loadData();
  progress(35);
  await Promise.race([fonts, sleep(2500)]);
  progress(55);
  if (!data) { $('#boot').classList.add('out'); document.body.classList.remove('is-loading'); return; }
  window.__S68 = data;

  applyPhotos(data);
  initChrome(data, { home: true });
  initInsta(data);
  const booking = initBooking(data, { bell });
  initPlan(data, { onBook: o => booking.prefill(o) });
  initTapes(data);
  initOctaCard(data, booking);
  initStudio(data);
  initVoices(data);
  initPrices(data);
  initMatchup();
  initContact(data);
  initCoaches(data);
  initGenx(data);
  initLive(data);
  progress(72);

  // Hero-Boxsack
  try {
    const { initBag } = await import('./bag.js');
    progress(88);
    initBag({ canvas: $('#bagCanvas'), hero: $('#top'), anchor: $('#heroPhoto'), onHit: hitFx, onHover: h => $('#cursor').classList.toggle('hit', h) });
  } catch (e) { console.warn('3D aus', e); }
  placeScribbles(); addEventListener('resize', placeScribbles);
  progress(100);
  const wait = 900 - (performance.now() - tStart);
  if (wait > 0) await sleep(wait);
  $('#boot').classList.add('out');
  document.body.classList.remove('is-loading');
  document.body.classList.add('ready');
  $('#top').classList.add('ready');
  setTimeout(() => $('#boot').remove(), 1200);

  lazy($('#disziplinen'), async () => {
    const { initOctagon } = await import('./octagon.js');
    const o = initOctagon({ canvas: $('#octaCanvas'), section: $('#disziplinen'), discs: data.disciplines, onActive: i => octaCard(i) });
    octaGo = o.goTo;
  });
  const dq = new URLSearchParams(location.search).get('d');
  if (dq) setTimeout(() => booking.prefill({ disc: dq }), 300);
})();

function lazy(el, fn) {
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); fn().catch(e => console.warn(e)); } }, { rootMargin: '120% 0px' });
  io.observe(el);
}

function applyPhotos(d) {
  $$('[data-photo]').forEach(img => { const src = d.photos && d.photos[img.dataset.photo]; if (src) img.src = src; });
}

// ---------- Kritzeleien am Foto ausrichten ----------
function placeScribbles() {
  const hero = $('#top'), svg = $('#heroScribbles'), hr = hero.getBoundingClientRect();
  const ph = $('#heroPhoto').getBoundingClientRect(), note = $('#heroNote').getBoundingClientRect(), film = $('.hero-film').getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${hr.width} ${hr.height}`);
  const L = x => x - hr.left, T = y => y - hr.top;
  // Pfeil: Notiz → rechter Rand des Sacks
  const nx = L(note.left) - 10, ny = T(note.top) + note.height * .55;
  const bx = L(ph.left) + ph.width * (matchMedia('(max-width: 900px)').matches ? .36 : .5) + ph.height * .172 + 12, by = ny - 14;
  const a = Math.atan2(by - (ny - 34), bx - (nx + bx) / 2), hx = (r, k) => bx + Math.cos(a + r) * k, hy = (r, k) => by + Math.sin(a + r) * k;
  $('#scrArrow').setAttribute('d', `M${nx} ${ny} Q ${(nx + bx) / 2} ${ny - 34}, ${bx} ${by} M${bx} ${by} L ${hx(Math.PI - .5, 18)} ${hy(Math.PI - .5, 18)} M${bx} ${by} L ${hx(Math.PI + .5, 18)} ${hy(Math.PI + .5, 18)}`);
  // Flamme links neben dem Filmstreifen
  if (film.width) {
    const fx = L(film.left) - 46, fy = T(film.top) + film.height * .75;
    $('#scrFlame').setAttribute('d', `M${fx} ${fy} c -26 -36 18 -66 6 -104 c 20 26 38 38 26 76 c 18 -18 18 -38 12 -58 c 26 32 26 70 -6 96 c -12 10 -26 6 -38 -10`);
  }
}

// ---------- Treffer-Effekte ----------
let hits = 0, maxN = 0, combo = 0, comboT = 0, popShown = false;
function hitFx({ x, y, newton, s }) {
  thud(s);
  hits++; maxN = Math.max(maxN, newton);
  const now = performance.now();
  combo = now - comboT < 700 ? combo + 1 : 1; comboT = now;
  $('#hudN').textContent = String(newton).padStart(3, '0');
  $('#hudHits').textContent = String(hits).padStart(2, '0');
  $('#hudMax').textContent = String(maxN).padStart(3, '0');
  $('#hudMeter').style.width = Math.min(100, newton / 13) + '%';
  const box = $('#bagDmg');
  const ring = document.createElement('span'); ring.className = 'impact'; ring.style.left = x + 'px'; ring.style.top = y + 'px'; box.appendChild(ring);
  const n = document.createElement('span'); n.className = 'dmg'; n.style.left = x + 'px'; n.style.top = y + 'px';
  n.innerHTML = `${newton}<small>N</small>`; box.appendChild(n);
  setTimeout(() => { ring.remove(); n.remove(); }, 1100);
  if (s > 1.15) { const h = $('#top'); h.classList.remove('hit-shake'); void h.offsetWidth; h.classList.add('hit-shake'); }
  if (navigator.vibrate) try { navigator.vibrate(s > 1.1 ? 28 : 14); } catch {}
  const cEl = $('#bagCombo');
  if (combo >= 2) { cEl.textContent = `COMBO ×${combo}`; cEl.classList.add('on'); clearTimeout(cEl._t); cEl._t = setTimeout(() => cEl.classList.remove('on'), 900); }
  $('#heroNote').style.opacity = 0; $('#scrArrow').style.opacity = 0;
  if (hits >= 7 && !popShown) { popShown = true; setTimeout(() => $('#bagPop').classList.add('on'), 500); }
}
$('#sndBtn').addEventListener('click', e => {
  snd.on = !snd.on; e.currentTarget.setAttribute('aria-pressed', snd.on); e.currentTarget.textContent = snd.on ? '♪ AN' : '♪ AUS';
});

// ---------- Laufbänder ----------
function initTapes(d) {
  const a = $('#tapeA'), b = $('#tapeB');
  const A = [...d.disciplines.map(x => x.name), '1. Probetraining gratis'];
  const fill = (el, items) => {
    const one = items.map(t => `<span class="${t.alert ? 'alert' : ''}">${esc(t.text || t)}</span>`).join('');
    el.innerHTML = one; let n = 1;
    while (el.scrollWidth < innerWidth * 2.2 && n < 12) { el.insertAdjacentHTML('beforeend', one); n++; }
    el.insertAdjacentHTML('beforeend', el.innerHTML);
  };
  const bItems = () => {
    const t = now(), li = liveInfo(d, t), tk = key(t), out = [];
    (d.cancellations || []).filter(c => c.date >= tk).slice(0, 4).forEach(c => {
      const cl = d.schedule.find(s => s.id === c.classId); if (!cl) return;
      const dt = new Date(c.date + 'T12:00:00');
      out.push({ text: `Fällt aus: ${cl.title} ${c.date === tk ? 'heute' : DAYS[dt.getDay()] + ' ' + dt.getDate() + '.' + (dt.getMonth() + 1) + '.'} ${cl.start}${c.reason ? ' (' + c.reason + ')' : ''}`, alert: true });
    });
    if (li.running.length) out.push(`Live: ${li.running.map(o => o.cls.title).join(' + ')}`);
    if (li.next) out.push(`Nächstes Training: ${li.next.cls.title} ${DAYS[li.next.date.getDay()]} ${li.next.cls.start}`);
    (d.ticker || []).forEach(x => out.push(x));
    out.push(openState(d, t).label);
    return out;
  };
  fill(a, A); fill(b, bItems());
  setInterval(() => fill(b, bItems()), 60000);
  let xa = 0, xb = 0, last = performance.now(), lastY = scrollY, boost = 0;
  (function loop(n) {
    requestAnimationFrame(loop);
    const dt = Math.min(.05, ((n || performance.now()) - last) / 1000); last = n || performance.now();
    const v = scrollY - lastY; lastY = scrollY; boost = boost * .9 + Math.abs(v) * .6;
    const sp = 70 + Math.min(900, boost * 20);
    xa -= sp * dt; xb += sp * .8 * dt;
    const wa = a.scrollWidth / 2, wb = b.scrollWidth / 2;
    if (-xa > wa) xa += wa; if (xb > 0) xb -= wb;
    a.style.transform = `translate3d(${xa}px,0,0)`; b.style.transform = `translate3d(${xb}px,0,0)`;
  })();
}

// ---------- Octagon-Karte ----------
let octaGo = null, octaData = null, octaBooking = null, octaCur = -1;
function initOctaCard(d, booking) {
  octaData = d; octaBooking = booking;
  const nav = $('#octaNav');
  nav.innerHTML = d.disciplines.map((x, i) => `<li><button data-i="${i}" data-n="${String(i + 1).padStart(2, '0')}" style="--c:${x.color}"><i></i>${String(i + 1).padStart(2, '0')} ${esc(x.name)}</button></li>`).join('');
  nav.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (octaGo) octaGo(+b.dataset.i); else octaCard(+b.dataset.i); });
  $('#ocCta').addEventListener('click', e => { e.preventDefault(); const x = d.disciplines[octaCur]; booking.prefill({ disc: x.id }); });
  octaCard(0);
}
function octaCard(i) {
  const d = octaData, x = d.disciplines[i]; if (!x || i === octaCur) return;
  octaCur = i;
  const card = $('#octaCard');
  card.style.setProperty('--dc', x.color);
  $('#ocIdx').textContent = `${String(i + 1).padStart(2, '0')}/${String(d.disciplines.length).padStart(2, '0')}`;
  $('#ocSub').textContent = x.sub || '';
  $('#ocName').textContent = x.name;
  $('#ocTag').textContent = x.tagline || '';
  $('#ocText').textContent = x.text || '';
  $('#ocPoints').innerHTML = (x.points || []).map(p => `<li>${esc(p)}</li>`).join('');
  $('#ocInt').innerHTML = Array.from({ length: 5 }, (_, k) => `<i class="${k < (x.intensity || 0) ? 'on' : ''}"></i>`).join('');
  $('#ocFor').innerHTML = (x.for || []).map(f => `<span>${esc(f)}</span>`).join('');
  const t = now(), today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  let times;
  if (x.open) times = d.studio.hours.map(h => `<span class="open">${h.days.length > 1 ? DAYS[h.days[0]] + '–' + DAYS[h.days[h.days.length - 1]] : DAYS[h.days[0]]} ${h.from}–${h.to}</span>`).join('');
  else {
    const cls = d.schedule.filter(c => matches(x, c)).sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7) || hm(a.start) - hm(b.start));
    times = cls.map(c => {
      let k = 0; while ((today.getDay() + k) % 7 !== c.day) k++;
      const dt = addDays(today, k);
      if (k === 0 && hm(c.end) <= minsOf(t)) dt.setDate(dt.getDate() + 7);
      const xx = cancellation(d, c.id, key(dt));
      return `<span class="${xx ? 'x' : ''}" title="${xx ? 'Fällt aus' : esc(c.level || '')}">${DAYS[c.day]} ${c.start}${c.level && c.level !== 'Alle Level' ? ' · ' + esc(c.level) : ''}</span>`;
    }).join('') || '<span>Termine auf Anfrage</span>';
  }
  $('#ocTimes').innerHTML = times;
  $('#ocPhoto').innerHTML = x.photo ? `<img src="${esc(x.photo)}" alt="">` : '';
  $('#ocCtaName').textContent = x.name;
  $$('#octaNav button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
  card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
}

// ---------- Studio-Collage + Fakten ----------
function initStudio(d) {
  const el = $('#collage'), mq = matchMedia('(max-width: 900px)');
  const D = [[1, 6, 1, 6], [6, 9, 1, 5], [9, 13, 1, 7], [1, 4, 6, 10], [4, 9, 5, 10], [9, 13, 7, 11], [1, 5, 10, 13], [5, 9, 10, 14], [9, 13, 11, 14]];
  const M = [[1, 7, 1, 6], [1, 4, 6, 10], [4, 7, 6, 10], [1, 7, 10, 15], [1, 4, 15, 19], [4, 7, 15, 19], [1, 7, 19, 24], [1, 4, 24, 28], [4, 7, 24, 28]];
  function render() {
    const L = mq.matches ? M : D, g = (d.gallery || []).slice(0, 8);
    let html = g.map((p, i) => {
      const [c1, c2, r1, r2] = L[i] || [1, 7, 1, 5], rot = ((i * 37) % 7 - 3) * .6, film = i === 1;
      return `<figure class="tile ${film ? 'film' : ''} rv" style="grid-column:${c1}/${c2};grid-row:${r1}/${r2};--r:${rot}deg;--src:url('${esc(new URL(p.src, location.href).href)}')">
        ${i % 3 === 0 ? `<span class="tp" style="--tr:${rot * 2}deg"></span>` : ''}
        <div class="ph"><img src="${esc(p.src)}" alt="${esc(p.caption || 'Studio68')}" loading="lazy"></div>
        <figcaption>${esc(p.caption || '')}</figcaption></figure>`;
    }).join('');
    const n = L[g.length] || L[L.length - 1];
    html += `<div class="note-card rv" style="grid-column:${n[0]}/${n[1]};grid-row:${n[2]}/${n[3]}">Hier zählt nicht, wie du aussiehst. Hier zählt, dass du wiederkommst.<small>— Studio68</small></div>`;
    el.innerHTML = html;
    observeReveal(el);
  }
  render(); mq.addEventListener('change', render);
  if (d.video) {
    const v = $('#videoSlot'); v.hidden = false;
    v.innerHTML = `<video src="${esc(d.video)}" muted loop playsinline autoplay preload="metadata"></video>`;
  }
  if (d.reviewCount) { const f = $$('.fact b')[3]; if (f) f.dataset.count = d.reviewCount; $('#revCount').textContent = d.reviewCount; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const b = e.target, to = +b.dataset.count, pre = b.dataset.prefix || '', t0 = performance.now();
    (function tick(n) { const p = Math.min(1, (n - t0) / 1600), v = Math.round(to * (1 - Math.pow(1 - p, 4))); b.textContent = pre + v.toLocaleString('de-DE'); if (p < 1) requestAnimationFrame(tick); })(t0);
  }), { threshold: .6 });
  $$('.fact b').forEach(b => io.observe(b));
}
function observeReveal(root) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  root.querySelectorAll('.rv').forEach(x => io.observe(x));
}

// ---------- Stimmen ----------
function initVoices(d) {
  const st = $('#voices'), dots = $('#voicesDots'), R = d.reviews || [];
  if (!R.length) { $('#stimmen').hidden = true; return; }
  st.innerHTML = R.map((r, i) => {
    let t = esc(r.text); if (r.mark) t = t.replace(esc(r.mark), `<mark>${esc(r.mark)}</mark>`);
    return `<div class="vq ${i ? '' : 'on'}"><blockquote>${t}“</blockquote><cite>${esc(r.name)} · via Google</cite></div>`;
  }).join('');
  dots.innerHTML = R.map((_, i) => `<button class="${i ? '' : 'on'}" aria-label="Bewertung ${i + 1}"></button>`).join('');
  let i = 0, tm;
  const show = n => { i = (n + R.length) % R.length; $$('.vq').forEach((q, k) => q.classList.toggle('on', k === i)); $$('#voicesDots button').forEach((b, k) => b.classList.toggle('on', k === i)); clearTimeout(tm); tm = setTimeout(() => show(i + 1), 7000); };
  dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show([...dots.children].indexOf(b)); });
  show(0);
}

// ---------- Preise ----------
function initPrices(d) {
  const P = d.prices; if (!P) return;
  const sw = $('#durSw'), ind = $('#durInd');
  let cur = P.durations[P.durations.length - 1];
  sw.insertAdjacentHTML('beforeend', P.durations.map(m => `<button data-m="${m}" role="tab">${m} MONATE</button>`).join(''));
  const tk = $('#tickets');
  tk.innerHTML = P.plans.map((p, i) => `<article class="ticket ${p.featured ? 'featured' : ''} rv">
    ${p.featured ? '<span class="tk-holo"></span><span class="tk-badge">beliebtester Deal</span>' : ''}
    <div class="tk-main"><span class="tk-k">TICKET № ${String(i + 1).padStart(2, '0')} ${p.featured ? '· FLATRATE' : ''}</span>
      <h3 class="tk-name">${esc(p.name)}</h3><p class="tk-desc">${esc(p.desc || '')}</p>
      ${p.features && p.features.length ? `<ul class="tk-feat">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      <div class="tk-price"><b data-plan="${i}">0</b><span>€<br>/ Monat</span></div>
      <a class="btn tk-cta ${p.featured ? '' : 'btn-line'}" href="#probetraining">Erst gratis testen →</a></div>
    <div class="tk-stub"><span>ADMIT ONE</span><i class="tk-bar"></i><span>RUNDE 1</span></div></article>`).join('');
  $('#extras').innerHTML = (P.extras || []).map(x => `<li class="${/kostenlos|gratis/i.test(x.value) ? 'free' : ''}"><span>${esc(x.label)}</span><i></i><b>${esc(x.value)}</b></li>`).join('');
  const vals = P.plans.map(() => 0);
  function set(m, anim = true) {
    cur = m;
    $$('#durSw button').forEach(b => b.classList.toggle('on', +b.dataset.m === m));
    const b = sw.querySelector(`[data-m="${m}"]`);
    ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`;
    P.plans.forEach((p, i) => {
      const el = tk.querySelector(`[data-plan="${i}"]`), from = vals[i], to = +p.prices[m] || 0, t0 = performance.now();
      vals[i] = to;
      if (!anim) { el.textContent = to; return; }
      (function tick(n) { const q = Math.min(1, (n - t0) / 700), v = Math.round(from + (to - from) * (1 - Math.pow(1 - q, 3))); el.textContent = v; if (q < 1) requestAnimationFrame(tick); })(t0);
    });
  }
  sw.addEventListener('click', e => { const b = e.target.closest('button'); if (b) set(+b.dataset.m); });
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); set(cur); } }, { threshold: .2 });
  io.observe(tk);
  addEventListener('resize', () => { const b = sw.querySelector('.on'); if (b) { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`; } });
  observeReveal(tk);
}

// ---------- Matchup-Balken ----------
function initMatchup() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const r = e.target; r.querySelector('.a').style.width = (+r.dataset.a / 2) + '%'; r.querySelector('.b').style.width = (+r.dataset.b / 2) + '%';
  }), { threshold: .6 });
  $$('.tt-row').forEach((r, i) => { r.querySelectorAll('i').forEach(x => x.style.transitionDelay = (i * .12) + 's'); io.observe(r); });
}

// ---------- Kontakt / Öffnungszeiten / FAQ ----------
function initContact(d) {
  const t = now(), order = [1, 2, 3, 4, 5, 6, 0], LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  $('#hours').innerHTML = order.map(dow => { const h = d.studio.hours.find(x => x.days.includes(dow)); return `<tr class="${dow === t.getDay() ? 'today' : ''}"><td>${LONG[dow]}</td><td>${h ? `${h.from} – ${h.to}` : 'geschlossen'}</td></tr>`; }).join('');
  $('#faqList').innerHTML = (d.faq || []).map(f => `<details><summary>${esc(f.q)}<i></i></summary><p>${esc(f.a)}</p></details>`).join('');
  const addr = encodeURIComponent(`${d.studio.street} ${d.studio.zip} ${d.studio.city}`);
  $('#routeBtn').href = `https://www.google.com/maps/dir/?api=1&destination=${addr}`;
}

function initCoaches(d) {
  const C = d.coaches || []; if (!C.length) return;
  $('#coaches').hidden = false;
  $('#coachRow').innerHTML = C.map(c => `<article class="coach">${c.photo ? `<img src="${esc(c.photo)}" alt="${esc(c.name)}" loading="lazy">` : ''}<span class="coach-holo"></span>
    <div class="coach-b"><span class="mono">${esc(c.role || '')}</span><h3>${esc(c.name)}</h3>${c.text ? `<p>${esc(c.text)}</p>` : ''}
    <div class="coach-stats">${(c.stats || []).map(s => `<div><span>${esc(s.k)}</span><br>${esc(s.v)}</div>`).join('')}</div></div></article>`).join('');
  $$('.coach').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`; c.querySelector('.coach-holo').style.backgroundPosition = `${50 + x * 100}% ${50 + y * 100}%`; });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });
}

// ---------- Live-Status überall ----------
function initLive(d) {
  function tick() {
    const t = now(), o = openState(d, t), li = liveInfo(d, t);
    const cs = $('#ctcStatus'); cs.classList.toggle('open', o.open); cs.innerHTML = `<i></i>${esc(o.label)}`;
    const hn = $('#heroNext');
    if (li.running.length) hn.textContent = `jetzt live: ${li.running[0].cls.title.toLowerCase()}`;
    else if (li.next) hn.textContent = `nächstes training: ${DAYS[li.next.date.getDay()].toLowerCase()} ${li.next.cls.start}`;
  }
  tick(); setInterval(tick, 30000);
}

// ---------- Instagram-Kachel ----------
function initInsta(d) {
  const g = $('#igGrid'); if (!g) return;
  const pics = (d.gallery || []).slice(0, 6);
  g.innerHTML = pics.map(p => `<span class="wi-p"><img src="${esc(p.src)}" alt="" loading="lazy"><i>♥</i></span>`).join('');
}
