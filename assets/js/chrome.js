// Gemeinsamer Rahmen aller Seiten: Kopf, Menü, Fuß, Social-Dock (WhatsApp/Instagram), Handy-Leiste
import { now, openState, liveInfo, DAYS, esc } from './data.js';

export const WA = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41z"/></svg>';
export const IG = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.1"><rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>';
export const FB = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8.2h2.8l.4-3.3h-3.2V8.4c0-.95.27-1.6 1.63-1.6h1.7V3.86c-.3-.04-1.32-.13-2.5-.13-2.47 0-4.16 1.5-4.16 4.27v2.5H7.4v3.3h2.77V22z"/></svg>';
export const PHONE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>';

const NAV = [
  ['kurse.html', 'Training', 'kurse'],
  ['./#plan', 'Plan', 'plan'],
  ['kids.html', 'Kids', 'kids'],
  ['ueber-uns.html', 'Über uns', 'ueber'],
  ['./#preise', 'Preise', 'preise'],
  ['./#kontakt', 'Kontakt', 'kontakt'],
];

export function mountChrome(page) {
  const home = page === 'home';
  const nav = NAV.map(([h, l, k]) => `<a href="${home && h.startsWith('./#') ? h.slice(2) : h}" data-k="${k}" class="${k === page ? 'on' : ''}">${l}</a>`).join('');
  const top = `
<header class="hdr" id="hdr">
  <a class="hdr-logo" href="./" aria-label="Studio68 Startseite"><span>studio</span><i>.</i><b>68</b></a>
  <span class="hdr-line"></span>
  <nav class="hdr-nav" aria-label="Hauptnavigation">${nav}</nav>
  <div class="hdr-round" aria-hidden="true"><span class="hdr-line"></span>${home ? '<span class="hr-txt mono">R<b id="railNo">01</b>/08 · <span id="railName">KOMM REIN</span> · <span id="railClock">5:00</span></span><i class="hr-bar"><i id="railBar"></i></i>' : ''}</div>
  <span class="hdr-status" id="hdrStatus"><i></i><span>…</span></span>
  <a class="hdr-soc wa js-wa" href="#" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp schreiben">${WA}</a>
  <a class="hdr-soc ig js-ig" href="#" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">${IG}</a>
  <a class="btn btn-pink hdr-cta" href="${home ? '#probetraining' : './#probetraining'}">Probetraining <span class="arr">→</span></a>
  <button class="hdr-burger" id="burger" aria-label="Menü öffnen" aria-expanded="false"><i></i><i></i></button>
</header>
<div class="menu" id="menu" aria-hidden="true">
  <div class="menu-grid"></div>
  <nav class="menu-nav">
    ${NAV.map(([h, l], i) => `<a href="${home && h.startsWith('./#') ? h.slice(2) : h}"><small>${String(i + 1).padStart(2, '0')}</small>${l}</a>`).join('')}
    <a href="${home ? '#probetraining' : './#probetraining'}"><small>07</small>Probetraining</a>
  </nav>
  <div class="menu-foot">
    <span class="menu-live" id="menuLive">…</span>
    <div class="menu-soc">
      <a class="soc soc-wa js-wa" href="#" target="_blank" rel="noopener">${WA}<span>WhatsApp</span></a>
      <a class="soc soc-ig js-ig" href="#" target="_blank" rel="noopener">${IG}<span>Instagram</span></a>
      <a class="soc soc-tel js-tel" href="#">${PHONE}<span>Anrufen</span></a>
    </div>
  </div>
</div>
<div class="rail-l" aria-hidden="true">STUDIO68 HEDDESHEIM © <span class="js-year">2026</span> — ALL FIGHTS RESERVED.</div>`;
  const bottom = `
<footer class="ftr night">
  <canvas class="ftr-canvas" id="ftrCanvas" aria-hidden="true"></canvas>
  <div class="ftr-word" aria-hidden="true">STUDIO<span>68</span></div>
  <div class="ftr-social">
    <a class="ftr-big soc-wa js-wa" href="#" target="_blank" rel="noopener">${WA}<span><small class="mono">WHATSAPP</small>Schreib uns</span></a>
    <a class="ftr-big soc-ig js-ig" href="#" target="_blank" rel="noopener">${IG}<span><small class="mono">INSTAGRAM</small>@studio_sixtyeight</span></a>
  </div>
  <div class="ftr-cols">
    <div><span class="mono">ADRESSE</span><p>Studio68 Heddesheim<br><span class="js-street">Lessingstraße 6</span><br><span class="js-city">68542 Heddesheim</span></p></div>
    <div><span class="mono">KONTAKT</span><p><a class="js-tel js-telt" href="#">01525 405 854 6</a><br><a class="js-mail js-mailt" href="#">info@studio68-heddesheim.de</a></p></div>
    <div><span class="mono">SEITEN</span><p><a href="kurse.html">Training & Kurse</a><br><a href="kids.html">Kids</a><br><a href="ueber-uns.html">Über uns</a></p></div>
    <div><span class="mono">RECHTLICHES</span><p><a href="impressum.html">Impressum</a><br><a href="datenschutz.html">Datenschutz</a><br><a class="js-fb" href="#" target="_blank" rel="noopener">Facebook</a></p></div>
  </div>
  <div class="ftr-bot mono"><span>© <span class="js-year">2026</span> STUDIO68 HEDDESHEIM</span><span>TRAIN HARD. FIGHT HARDER.</span><a href="admin/" class="ftr-admin">STUDIO-LOGIN</a></div>
</footer>
<div class="sdock" id="sdock">
  <a class="sd-b soc-wa js-wa" href="#" target="_blank" rel="noopener" aria-label="WhatsApp schreiben">${WA}<span class="sd-l">WhatsApp schreiben</span></a>
  <a class="sd-b soc-ig js-ig" href="#" target="_blank" rel="noopener" aria-label="Instagram">${IG}<span class="sd-l">@studio_sixtyeight</span></a>
</div>
<div class="mbar" id="mbar"><a class="btn btn-pink" href="${home ? '#probetraining' : './#probetraining'}">Probetraining gratis →</a><a class="mbar-i soc-wa js-wa" href="#" target="_blank" rel="noopener" aria-label="WhatsApp">${WA}</a><a class="mbar-i soc-ig js-ig" href="#" target="_blank" rel="noopener" aria-label="Instagram">${IG}</a></div>
<div class="cursor" id="cursor" aria-hidden="true"><i></i><span>HIT</span></div>`;
  document.body.insertAdjacentHTML('afterbegin', top);
  const main = document.querySelector('main');
  main.insertAdjacentHTML('afterend', bottom);
}

// Links, Live-Status, Menü, dunkler Kopf über dunklen Bereichen, Cursor, Footer-3D
export function initChrome(d, { home = false } = {}) {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const s = d.studio;
  const waText = encodeURIComponent('Hi Studio68! Ich hätte eine Frage zum Training.');
  $$('.js-tel').forEach(a => a.href = 'tel:' + s.phone);
  $$('.js-telt').forEach(a => a.textContent = s.phoneDisplay);
  $$('.js-wa').forEach(a => { if (!a.id) a.href = `https://wa.me/${s.whatsapp}?text=${waText}`; });
  $$('.js-mail').forEach(a => a.href = 'mailto:' + s.email);
  $$('.js-mailt').forEach(a => a.textContent = s.email);
  $$('.js-ig').forEach(a => a.href = s.instagram);
  $$('.js-fb').forEach(a => a.href = s.facebook);
  $$('.js-street').forEach(e => e.textContent = s.street);
  $$('.js-city').forEach(e => e.textContent = `${s.zip} ${s.city}`);
  $$('.js-year').forEach(e => e.textContent = now().getFullYear());

  function live() {
    const t = now(), o = openState(d, t), li = liveInfo(d, t);
    const hs = $('#hdrStatus'); hs.classList.toggle('open', o.open); hs.querySelector('span').textContent = o.short;
    $('#menuLive').textContent = o.label + (li.next ? ` · nächstes Training ${li.next.cls.title} ${DAYS[li.next.date.getDay()]} ${li.next.cls.start}` : '');
  }
  live(); setInterval(live, 30000);

  const hdr = $('#hdr'), burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
  });
  menu.addEventListener('click', e => { if (e.target.closest('a')) { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); } });

  const darks = $$('.night, .genx, .tapes, .dark-sec'), rounds = $$('[data-round]'), navA = $$('.hdr-nav a');
  const railNo = $('#railNo'), railName = $('#railName'), railClock = $('#railClock'), railBar = $('#railBar');
  const mbar = $('#mbar'), first = document.querySelector('main > section'), book = $('#probetraining');
  const map = { disziplinen: 'kurse', plan: 'plan', preise: 'preise', kontakt: 'kontakt', probetraining: 'preise' };
  let ticking = false;
  function onScroll() {
    ticking = false;
    hdr.classList.toggle('dark', darks.some(x => { const r = x.getBoundingClientRect(); return r.top <= 30 && r.bottom > 30; }));
    if (home && rounds.length) {
      const mid = innerHeight / 2;
      const cur = rounds.find(x => { const r = x.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
      if (cur && railNo) {
        const r = cur.getBoundingClientRect(), p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
        railNo.textContent = String(cur.dataset.round).padStart(2, '0'); railName.textContent = cur.dataset.rname;
        const sec = Math.round((1 - p) * 300); railClock.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
        railBar.style.width = (p * 100) + '%';
      }
      const k = cur ? map[cur.id] : null;
      navA.forEach(a => a.classList.toggle('on', !!k && a.dataset.k === k));
    }
    const fr = first ? first.getBoundingClientRect() : { bottom: 0 };
    const br = book ? book.getBoundingClientRect() : { top: 1e9, bottom: -1 };
    mbar.classList.toggle('on', fr.bottom < innerHeight * .4 && !(br.top < innerHeight && br.bottom > 0));
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  const cur = $('#cursor');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() { cx += (tx - cx) * .3; cy += (ty - cy) * .3; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
  }

  const ftr = $('.ftr');
  const io = new IntersectionObserver(es => {
    if (!es[0].isIntersecting) return; io.disconnect();
    import('./logo68.js').then(m => m.initLogo68({ canvas: $('#ftrCanvas') })).catch(e => console.warn(e));
  }, { rootMargin: '120% 0px' });
  io.observe(ftr);
}
