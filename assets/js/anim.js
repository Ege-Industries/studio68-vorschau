// Scroll-Animationen für alle Seiten: Wort-Einflug, Cyber-Labels, gestaffelte Karten, Parallax, Tempo-Verzerrung
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const HEADS = '.sh-h, .pg-h, .studio-h, .book-h, .cb-h, .ms-head, .dz-name, .plan-h, .faq-h, .ctc-h, .octa-h, .kg h3, .genx-title, .wa-cta';
// Container → Kinder gestaffelt
const GROUPS = [
  ['.team-track', 'flip'], ['.tickets', 'print'], ['.gs-track', 'drop'], ['.pillars', 'up'], ['.kb-grid', 'pop'], ['.areas', 'up'],
  ['.news-track', 'up'], ['.partner-grid', 'pop'], ['.ku-tiles', 'up'], ['.facts', 'up'], ['.extras', 'up'], ['.ct-chips', 'pop'],
  ['.wins-list', 'left'], ['.dz-points', 'left'], ['.dz-when', 'left'], ['.kg-t', 'left'], ['.hours tbody', 'left'], ['#faqList', 'left'],
  ['#kiFaq', 'left'], ['.pg-list', 'left'], ['.tot-table', 'left'], ['.wi-grid', 'pop'], ['.gal-grid', 'pop'], ['.ftr-cols', 'up'],
  ['.team-stats', 'up'], ['.ms-triple', 'left'], ['.pg-chips', 'up'], ['.cb-btns', 'up'], ['.ctc-btns', 'up'], ['.genx-btns', 'pop'],
  ['.wa-chat', 'chat'], ['.mf-price', 'pop'], ['.kp', 'up'], ['.dict', 'left'], ['.kg-row', 'up'], ['.plan-grid', 'up'], ['.ftr-social', 'up'],
  ['.book-alt', 'up'], ['.wire-grid', 'up'], ['.dz-btns', 'up'], ['.plan-days', 'right'], ['.dur-sw', 'pop']
];
const SINGLES = [
  ['.stack figure', 'drop'], ['.dz-photo', 'pop'], ['.dz-type', 'right'], ['.dz-card', 'up'], ['.wins-photo', 'pop'], ['.ctc-photo', 'drop'],
  ['.radar', 'pop'], ['.contract', 'contract'], ['.reflex', 'up'], ['.ki-pr', 'up'], ['.kf', 'up'], ['.plan-live', 'right'], ['.voices-badge', 'pop'],
  ['.dur', 'right'], ['.tot-a', 'left'], ['.tot-b', 'right'], ['.tot-vs', 'pop'], ['.genx-date', 'up'], ['.genx-text', 'up'], ['.genx-k', 'up'],
  ['.team-intro', 'up'], ['.ms-sub', 'up'], ['.pg-lede', 'up'], ['.studio-lede', 'up'], ['.book-sub', 'up'], ['.ctc-status', 'left'],
  ['.studio-cta', 'up'], ['.team-more', 'up'], ['.plan-foot', 'up'], ['.gal-maybe', 'right'], ['.tot-foot', 'up'], ['.plan-ctrl', 'up'],
  ['.dz-n', 'pop'], ['.dz-sub', 'left'], ['.dz-tag', 'left'], ['.dz-text', 'up'], ['.kg-age', 'left'], ['.pl-now', 'right'], ['.faq details', 'left'],
  ['.voices-stage', 'up'], ['.wi-head', 'up'], ['.wi-foot', 'up'], ['.wa-logo', 'pop']
];
const PAR = [
  ['.stack .st-a', 30], ['.stack .st-b', -55], ['.stack .st-c', 42], ['.gs-i:nth-child(odd)', 26], ['.gs-i:nth-child(even)', -26],
  ['.tc:nth-child(odd)', 16], ['.tc:nth-child(even)', -16], ['.wins-photo', -46], ['.ctc-photo', 34], ['.radar', -30], ['.dz-photo', -34],
  ['.dz-type', 30], ['.contract', -22], ['.ki-pr', -24], ['.tot-a .tot-du', 30], ['.tot-b .tot-du', -30], ['.ticket.featured', -18],
  ['.area:nth-child(odd)', 20], ['.area:nth-child(even)', -20], ['.nc:nth-child(odd)', 18], ['.nc:nth-child(even)', -18],
  ['.kb:nth-child(3n+1)', 14], ['.kb:nth-child(3n)', -14], ['.wire-ig', -16], ['.wire-wa', 22]
];
const PARX = [['.cb-h', 60], ['.pg-h', -40], ['.ftr-word', 140], ['.octa-h', 0], ['.partner-big', 40], ['.studio-h', -30], ['.book-h', 30]];

function splitWords(el) {
  if (el.dataset.split) return; el.dataset.split = '1';
  let i = 0;
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        if (!n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          const w = document.createElement('span'), inner = document.createElement('span');
          w.className = 'sw-w'; inner.className = 'sw-i'; inner.textContent = p; inner.style.setProperty('--wi', i++);
          w.appendChild(inner); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.matches('svg, br, .sw-w')) walk(n);
    });
  };
  walk(el);
}

function scramble(el) {
  const tn = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).pop(); if (!tn) return;
  const final = tn.textContent, chars = '!<>-_/[]{}=+*^?#01ABCDEFXZ';
  let f = 0; const total = 20;
  (function tick() {
    f++;
    tn.textContent = [...final].map((c, i) => (c === ' ' || i < final.length * f / total) ? c : chars[Math.random() * chars.length | 0]).join('');
    if (f < total) requestAnimationFrame(tick); else tn.textContent = final;
  })();
}

function countUp(b) {
  const m = b.textContent.trim().match(/^(\d+)(.*)$/); if (!m) return;
  const to = +m[1], suf = m[2], t0 = performance.now();
  (function tick(n) { const p = Math.min(1, (n - t0) / 1300); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))) + suf; if (p < 1) requestAnimationFrame(tick); })(t0);
}

let started = false;
export function initAnim(root = document) {
  if (reduce) return;
  const html = document.documentElement;
  html.classList.add('anim-on');

  const io = new IntersectionObserver(entries => {
    let k = 0;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el);
      el.style.setProperty('--i', Math.min(k++, 9));
      el.classList.add('in');
      if (el._onIn) el._onIn();
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  const tag = (el, type) => { if (el._a || el.closest('.octa-card, .hero, .menu, .lb, .art')) return; el._a = 1; el.classList.add('a', 'a-' + type); io.observe(el); };

  root.querySelectorAll(HEADS).forEach(h => { if (h.closest('.hero')) return; splitWords(h); h.classList.add('a-words'); io.observe(h); });
  root.querySelectorAll('.sh-k, .octa-k').forEach(k => { if (k._a) return; tag(k, 'left'); k._onIn = () => scramble(k); });
  GROUPS.forEach(([sel, type]) => root.querySelectorAll(sel).forEach(g => [...g.children].forEach(c => { if (!c.matches('.sw-dots, .sw-btn, .dur-ind, i.dur-ind')) tag(c, type); })));
  SINGLES.forEach(([sel, type]) => root.querySelectorAll(sel).forEach(el => tag(el, type)));
  root.querySelectorAll('.rv').forEach(el => { el.classList.remove('rv'); tag(el, 'up'); });
  root.querySelectorAll('.team-stats b, .kp b').forEach(b => { b._onIn = () => countUp(b); io.observe(b); });

  // Scan-Strich pro Abschnitt
  const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); sio.unobserve(e.target); } }), { threshold: .35 });
  root.querySelectorAll('.scr').forEach(s => sio.observe(s));

  // Parallax + Tempo-Verzerrung + Fortschritt
  const par = [];
  PAR.forEach(([sel, f]) => root.querySelectorAll(sel).forEach(el => { el.classList.add('a'); par.push([el, f, 'y']); }));
  PARX.forEach(([sel, f]) => root.querySelectorAll(sel).forEach(el => { if (f) { el.classList.add('a'); par.push([el, f, 'x']); } }));
  if (started) return; started = true;
  let lastY = scrollY, vel = 0, ticking = false;
  function frame() {
    ticking = false;
    const y = scrollY, vh = innerHeight; vel = vel * .82 + (y - lastY) * .18; lastY = y;
    html.style.setProperty('--skew', Math.max(-3, Math.min(3, -vel * .07)).toFixed(2) + 'deg');
    html.style.setProperty('--prog', (y / Math.max(1, document.documentElement.scrollHeight - vh)).toFixed(4));
    for (const [el, f, ax] of par) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.setProperty(ax === 'y' ? '--py' : '--px', (p * f).toFixed(1) + 'px');
    }
    if (Math.abs(vel) > .05) { ticking = true; requestAnimationFrame(frame); }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();
}
