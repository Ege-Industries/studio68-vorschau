// Gemeinsame Bausteine für Start- und Unterseiten
import { now, DAYS, openState, esc } from './data.js';

export const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
export const nn = i => String(i + 1).padStart(2, '0');

export function observeReveal(root = document) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  root.querySelectorAll('.rv').forEach(x => io.observe(x));
}

export function countUp(root = document) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const b = e.target, to = +b.dataset.count, pre = b.dataset.prefix || '', suf = b.dataset.suffix || '', t0 = performance.now();
    (function tick(n) { const p = Math.min(1, (n - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - p, 4))); b.textContent = pre + v.toLocaleString('de-DE') + suf; if (p < 1) requestAnimationFrame(tick); })(t0);
  }), { threshold: .6 });
  root.querySelectorAll('[data-count]').forEach(b => io.observe(b));
}

// Wisch-Leisten: Punkte unter der Leiste + Pfeile am Desktop
export function swiper(track) {
  if (!track || track._sw) return; track._sw = true;
  const wrap = track.parentElement;
  const dots = document.createElement('div'); dots.className = 'sw-dots';
  const items = [...track.children];
  dots.innerHTML = items.map((_, i) => `<i data-i="${i}"></i>`).join('');
  wrap.appendChild(dots);
  const prev = document.createElement('button'), next = document.createElement('button');
  prev.className = 'sw-btn prev'; next.className = 'sw-btn next'; prev.innerHTML = '←'; next.innerHTML = '→';
  prev.setAttribute('aria-label', 'zurück'); next.setAttribute('aria-label', 'weiter');
  wrap.append(prev, next);
  const step = () => (items[0] ? items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 300);
  prev.onclick = () => track.scrollBy({ left: -step(), behavior: 'smooth' });
  next.onclick = () => track.scrollBy({ left: step(), behavior: 'smooth' });
  dots.onclick = e => { const i = e.target.dataset.i; if (i != null) track.scrollTo({ left: items[+i].offsetLeft - track.offsetLeft, behavior: 'smooth' }); };
  const upd = () => {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bd = 1e9;
    items.forEach((it, i) => { const c = it.offsetLeft - track.offsetLeft + it.offsetWidth / 2, dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = i; } });
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === best));
    prev.disabled = track.scrollLeft < 8; next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    wrap.classList.toggle('sw-off', track.scrollWidth <= track.clientWidth + 4);
  };
  track.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
  addEventListener('resize', upd); setTimeout(upd, 60);
}

// ---------- Team ----------
export function teamCards(d, limit) {
  const C = (d.coaches || []).slice(0, limit || 99);
  return C.map((c, i) => `<article class="tc rv" style="--d:${i * .05}s">
    <div class="tc-ph">${c.photo ? `<img src="${esc(c.photo)}" alt="${esc(c.name)}" loading="lazy">` : ''}<span class="tc-holo"></span><span class="tc-n mono">${nn(i)}</span></div>
    <div class="tc-b"><span class="mono tc-r">${esc(c.role || '')}</span><h3>${esc(c.name)}</h3>
      ${(c.stats || []).length ? `<ul class="tc-s">${c.stats.map(s => `<li>${esc(s.v)}</li>`).join('')}</ul>` : ''}</div></article>`).join('');
}
export function tiltCards(root) {
  if (!matchMedia('(hover: hover)').matches) return;
  root.querySelectorAll('.tc').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`; c.style.setProperty('--hx', `${50 + x * 120}%`); });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });
}

// ---------- Galerie mit Vollbild ----------
export function galleryHTML(items, cls = 'gs') {
  return items.map((p, i) => `<figure class="${cls}-i rv" data-i="${i}" style="--r:${((i * 37) % 7 - 3) * .5}deg"><img src="${esc(p.src)}" alt="${esc(p.caption || 'Studio68')}" loading="lazy"><figcaption class="hand">${esc(p.caption || '')}</figcaption></figure>`).join('');
}
export function lightbox(items, root) {
  let lb = $('#lb');
  if (!lb) {
    document.body.insertAdjacentHTML('beforeend', `<div class="lb" id="lb" hidden><button class="lb-x" aria-label="Schließen">✕</button><button class="lb-p" aria-label="zurück">←</button><figure><img alt=""><figcaption class="hand"></figcaption></figure><button class="lb-n" aria-label="weiter">→</button><span class="lb-c mono"></span></div>`);
    lb = $('#lb');
  }
  let cur = 0, list = items;
  const show = i => { cur = (i + list.length) % list.length; lb.querySelector('img').src = list[cur].src; lb.querySelector('figcaption').textContent = list[cur].caption || ''; lb.querySelector('.lb-c').textContent = `${cur + 1} / ${list.length}`; };
  const open = i => { list = items; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  lb.querySelector('.lb-x').onclick = close; lb.querySelector('.lb-p').onclick = () => show(cur - 1); lb.querySelector('.lb-n').onclick = () => show(cur + 1);
  lb.onclick = e => { if (e.target === lb) close(); };
  let sx = 0; lb.ontouchstart = e => { sx = e.touches[0].clientX; }; lb.ontouchend = e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); };
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
  root.addEventListener('click', e => { const f = e.target.closest('[data-i]'); if (f) open(+f.dataset.i); });
}

// ---------- Preise ----------
export function initPrices(d, root) {
  const P = d.prices; if (!P || !root) return;
  const sw = root.querySelector('.dur-sw'), ind = root.querySelector('.dur-ind'), tk = root.querySelector('.tickets'), ex = root.querySelector('.extras');
  let cur = P.durations[P.durations.length - 1];
  sw.insertAdjacentHTML('beforeend', P.durations.map(m => `<button data-m="${m}" role="tab">${m} <span>Monate</span></button>`).join(''));
  tk.innerHTML = P.plans.map((p, i) => `<article class="ticket ${p.featured ? 'featured' : ''}">
    ${p.featured ? '<span class="tk-holo"></span><span class="tk-badge">beliebtester Deal</span>' : ''}
    <div class="tk-main"><span class="tk-k">TICKET № ${nn(i)} ${p.featured ? '· FLATRATE' : ''}</span>
      <h3 class="tk-name">${esc(p.name)}</h3><p class="tk-desc">${esc(p.desc || '')}</p>
      ${p.features && p.features.length ? `<ul class="tk-feat">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      <div class="tk-price"><b data-plan="${i}">0</b><span>€<br>/ Monat</span></div>
      <a class="btn tk-cta ${p.featured ? '' : 'btn-line'}" href="./#probetraining">Erst gratis testen →</a></div>
    <div class="tk-stub"><span>ADMIT ONE</span><i class="tk-bar"></i><span>RUNDE 1</span></div></article>`).join('');
  if (ex) ex.innerHTML = (P.extras || []).map(x => `<li class="${/kostenlos|gratis/i.test(x.value) ? 'free' : ''}"><span>${esc(x.label)}</span><b>${esc(x.value)}</b></li>`).join('');
  const vals = P.plans.map(() => 0);
  function set(m, anim = true) {
    cur = m;
    sw.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.m === m));
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
  swiper(tk);
}

// ---------- Stimmen ----------
export function initVoices(d, stage, dotsEl) {
  const R = d.reviews || []; if (!R.length || !stage) return;
  stage.innerHTML = R.map((r, i) => {
    let t = esc(r.text); if (r.mark) t = t.replace(esc(r.mark), `<mark>${esc(r.mark)}</mark>`);
    return `<div class="vq ${i ? '' : 'on'}"><blockquote>${t}</blockquote><cite>${esc(r.name)} · via ${esc(r.src || 'Google')}</cite></div>`;
  }).join('');
  dotsEl.innerHTML = R.map((_, i) => `<button class="${i ? '' : 'on'}" aria-label="Bewertung ${i + 1}"></button>`).join('');
  let i = 0, tm;
  const show = n => { i = (n + R.length) % R.length; stage.querySelectorAll('.vq').forEach((q, k) => q.classList.toggle('on', k === i)); dotsEl.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i)); clearTimeout(tm); tm = setTimeout(() => show(i + 1), 7000); };
  dotsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show([...dotsEl.children].indexOf(b)); });
  let sx = 0; stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); }, { passive: true });
  show(0);
}

// ---------- Öffnungszeiten (kompakt) ----------
export function hoursHTML(d) {
  const t = now();
  return d.studio.hours.map(h => {
    const label = h.days.length > 1 ? `${DAYS[h.days[0]]}–${DAYS[h.days[h.days.length - 1]]}` : DAYS[h.days[0]];
    return `<tr class="${h.days.includes(t.getDay()) ? 'today' : ''}"><td>${label}</td><td>${h.from} – ${h.to}</td></tr>`;
  }).join('');
}
export function statusHTML(d) { const o = openState(d); return { open: o.open, html: `<i></i>${esc(o.label)}` }; }

export function faqHTML(list) { return (list || []).map(f => `<details><summary>${esc(f.q)}<i></i></summary><p>${esc(f.a)}</p></details>`).join(''); }

// ---------- News ----------
export function fmtDate(s) { const d = new Date(s + 'T12:00:00'); return isNaN(d) ? s : d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }); }
export function newsCards(list) {
  return list.map((n, i) => `<article class="nc rv" data-n="${esc(n.id)}" tabindex="0">
    <div class="nc-ph ${n.img ? '' : 'type'}">${n.img ? `<img src="${esc(n.img)}" alt="" loading="lazy">` : `<span>${esc(n.title)}</span>`}</div>
    <div class="nc-b"><span class="mono">${fmtDate(n.date)}${n.cat === 'presse' || n.cat === 'beides' ? ' · PRESSE' : ''}</span><h3>${esc(n.title)}</h3><p>${esc((n.text || []).find(t => t.trim().toLowerCase() !== n.title.trim().toLowerCase() && t.length > 20) || '')}</p><b class="nc-more mono">Lesen →</b></div></article>`).join('');
}
export function articleModal(list, root) {
  if (!$('#art')) document.body.insertAdjacentHTML('beforeend', '<div class="art" id="art" hidden><div class="art-in"><button class="art-x" aria-label="Schließen">✕</button><div class="art-c"></div></div></div>');
  const m = $('#art'), c = m.querySelector('.art-c');
  const close = () => { m.hidden = true; document.body.style.overflow = ''; history.replaceState(null, '', location.pathname); };
  const open = id => {
    const n = list.find(x => x.id === id); if (!n) return;
    c.innerHTML = `${n.img ? `<img class="art-img" src="${esc(n.img)}" alt="">` : ''}<span class="mono">${fmtDate(n.date)}</span><h2>${esc(n.title)}</h2>${(n.text || []).map(p => `<p>${esc(p)}</p>`).join('')}
      ${n.link ? `<a class="btn btn-ink" href="${esc(n.link)}" target="_blank" rel="noopener">Originalbeitrag lesen →</a>` : ''}`;
    m.hidden = false; m.scrollTop = 0; document.body.style.overflow = 'hidden'; history.replaceState(null, '', '#' + id);
  };
  m.querySelector('.art-x').onclick = close; m.onclick = e => { if (e.target === m) close(); };
  addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) close(); });
  root.addEventListener('click', e => { const a = e.target.closest('[data-n]'); if (a) open(a.dataset.n); });
  root.addEventListener('keydown', e => { if (e.key === 'Enter') { const a = e.target.closest('[data-n]'); if (a) open(a.dataset.n); } });
  if (location.hash.length > 1) open(decodeURIComponent(location.hash.slice(1)));
}
