// R5: Gen-X-Soft-Club "Fight Night" – Bewegungsunschärfe-Foto, Reflex-Test, Video
import { esc } from './data.js';

export function initGenx(data) {
  const sec = document.getElementById('fightnight');
  const cv = document.getElementById('genxBg');
  const img = new Image();
  img.src = (data.photos && data.photos.night) || 'assets/img/gym-functional.jpg';

  function paint() {
    if (!img.complete || !img.naturalWidth) return;
    const dpr = Math.min(devicePixelRatio, 1.5), w = sec.clientWidth, h = sec.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d'), W = cv.width, H = cv.height;
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight) * 1.12;
    const iw = img.naturalWidth * s, ih = img.naturalHeight * s, x0 = (W - iw) / 2, y0 = (H - ih) / 2;
    g.fillStyle = '#062a2e'; g.fillRect(0, 0, W, H);
    // Bewegungsunschärfe: viele versetzte Kopien mitteln
    const N = 26, span = W * .045;
    for (let i = 0; i < N; i++) {
      g.globalAlpha = 1 / (i + 1);
      const o = (i / (N - 1) - .5) * span;
      g.drawImage(img, x0 + o, y0 + o * .18, iw, ih);
    }
    g.globalAlpha = 1;
    g.filter = 'blur(2px)'; g.drawImage(cv, 0, 0); g.filter = 'none';
    // Farbstimmung: Teal + Pink-Licht
    g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(30,150,150,.62)'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = '#5fb3b3'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'screen';
    let gr = g.createRadialGradient(W * .25, H * .1, 0, W * .25, H * .1, W * .5);
    gr.addColorStop(0, 'rgba(255,140,190,.55)'); gr.addColorStop(1, 'rgba(255,140,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    gr = g.createRadialGradient(W * .85, H * .72, 0, W * .85, H * .72, W * .35);
    gr.addColorStop(0, 'rgba(255,190,60,.35)'); gr.addColorStop(1, 'rgba(255,190,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
    gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .2, W / 2, H / 2, Math.max(W, H) * .75);
    gr.addColorStop(0, 'rgba(0,10,12,0)'); gr.addColorStop(1, 'rgba(0,10,12,.7)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(0,12,14,.28)'; g.fillRect(0, 0, W, H);
  }
  img.onload = paint;
  let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(paint, 120); }).observe(sec);
  // leichte Parallaxe
  addEventListener('scroll', () => {
    const r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    cv.style.transform = `scale(1.08) translate3d(${(r.top / innerHeight) * -2}%, ${(r.top / innerHeight) * 4}%, 0)`;
  }, { passive: true });

  // Event-Texte
  const ev = data.event || {};
  document.getElementById('evKicker').textContent = ev.kicker || '';
  document.getElementById('evTitle').textContent = ev.title || 'Fight Night';
  document.getElementById('evText').textContent = ev.text || '';
  const dEl = document.getElementById('evDate');
  if (ev.date) {
    const d = new Date(ev.date + 'T12:00:00');
    dEl.textContent = isNaN(d) ? ev.date : d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  } else dEl.textContent = 'TERMIN FOLGT';

  // Video
  const modal = document.getElementById('gxVideo'), inner = document.getElementById('gxVideoIn');
  document.getElementById('gxPlay').onclick = () => {
    const src = ev.video || data.video;
    inner.innerHTML = src ? `<video src="${esc(src)}" controls autoplay playsinline></video>` : '<div class="gx-msg">Video kommt bald.<br><small style="font-size:14px;letter-spacing:.2em">Bis dahin: Instagram</small></div>';
    modal.hidden = false;
  };
  const close = () => { modal.hidden = true; inner.innerHTML = ''; };
  document.getElementById('gxClose').onclick = close;
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });

  // Reflex-Test
  const pad = document.getElementById('rxPad'), big = document.getElementById('rxBig'), small = document.getElementById('rxSmall');
  const tryEl = document.getElementById('rxTry'), res = document.getElementById('rxRes');
  let state = 'idle', timer = 0, t0 = 0, times = [];
  const set = (cls, b, s) => { pad.className = 'rx-pad ' + cls; big.textContent = b; small.innerHTML = s; };
  function arm() {
    state = 'wait'; set('wait', 'WARTEN …', 'Noch nicht. Gleich.');
    timer = setTimeout(() => { state = 'go'; t0 = performance.now(); set('go', 'JETZT!', '&nbsp;'); }, 1100 + Math.random() * 2400);
  }
  function verdict(ms) {
    if (ms < 210) return 'Champion-Reflexe. Wir müssen reden.';
    if (ms < 260) return 'Wettkampf-Niveau. Respekt.';
    if (ms < 320) return 'Solide. Mit Training wird das schneller.';
    return 'Da geht noch was. Genau dafür gibt es uns.';
  }
  pad.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (state === 'idle' || state === 'done') { times = []; tryEl.textContent = '0/5'; res.textContent = ''; arm(); return; }
    if (state === 'wait') { clearTimeout(timer); state = 'early'; set('early', 'FEHLSTART', 'Zu früh. Tippen zum Wiederholen.'); return; }
    if (state === 'early') { arm(); return; }
    if (state === 'go') {
      const ms = Math.round(performance.now() - t0);
      times.push(ms); tryEl.textContent = `${times.length}/5`;
      if (times.length >= 5) {
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length), best = Math.min(...times);
        state = 'done'; set('res', `${avg} MS`, `Schnitt aus 5 · Bestwert ${best} ms · Tippen für neue Runde`);
        res.innerHTML = `${esc(verdict(avg))} <a href="#probetraining">Probetraining buchen →</a>`;
      } else { state = 'between'; set('res', `${ms} MS`, 'Tippen für den nächsten Versuch'); }
      return;
    }
    if (state === 'between') arm();
  });
}
