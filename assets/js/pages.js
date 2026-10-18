// Unterseiten: Über uns, Training & Kurse, Kids
import { loadData, now, DAYS, DAYS_LONG, hm, key, addDays, minsOf, matches, cancellation, esc } from './data.js';
import { mountChrome, initChrome, WA, IG } from './chrome.js';

const page = document.body.dataset.page;
mountChrome(page);
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const nn = i => String(i + 1).padStart(2, '0');
const waLink = (d, txt) => `https://wa.me/${d.studio.whatsapp}?text=${encodeURIComponent(txt)}`;
const bookLink = id => `./?d=${encodeURIComponent(id)}#probetraining`;

(async () => {
  const d = await loadData();
  if (!d) return;
  initChrome(d);
  if (page === 'ueber') ueber(d);
  if (page === 'kurse') kurse(d);
  if (page === 'kids') kids(d);
  ctaBand(d);
  reveal();
})();

function reveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.rv').forEach(x => io.observe(x));
}
function ctaBand(d) {
  const el = $('#ctaBand'); if (!el) return;
  el.innerHTML = `<div class="cb-in">
    <h2 class="cb-h">Genug gelesen.<br><span>Komm vorbei.</span></h2>
    <p>Das erste Probetraining ist kostenlos. Buch es online oder schreib uns direkt.</p>
    <div class="cb-btns">
      <a class="btn btn-pink btn-xl" href="./#probetraining">Probetraining buchen <span class="arr">⟶</span></a>
      <a class="soc-chip soc-wa" href="${waLink(d, 'Hi Studio68! Ich würde gern ein Probetraining machen.')}" target="_blank" rel="noopener">${WA}<span>WhatsApp</span></a>
      <a class="soc-chip soc-ig" href="${esc(d.studio.instagram)}" target="_blank" rel="noopener">${IG}<span>Instagram</span></a>
    </div></div>`;
}

// Zeiten einer Disziplin, mit Hinweis wenn der nächste Termin ausfällt
function timesOf(d, disc) {
  const t = now(), today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  if (disc.open) return d.studio.hours.map(h => ({ day: h.days.length > 1 ? `${DAYS[h.days[0]]}–${DAYS[h.days[h.days.length - 1]]}` : DAYS_LONG[h.days[0]], time: `${h.from}–${h.to}`, what: 'Freies Training' }));
  return d.schedule.filter(c => matches(disc, c)).sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7) || hm(a.start) - hm(b.start)).map(c => {
    let k = 0; while ((today.getDay() + k) % 7 !== c.day) k++;
    const dt = addDays(today, k); if (k === 0 && hm(c.end) <= minsOf(t)) dt.setDate(dt.getDate() + 7);
    const x = cancellation(d, c.id, key(dt));
    return { day: DAYS_LONG[c.day], time: `${c.start}–${c.end}`, what: `${c.title}${c.level ? ' · ' + c.level : ''}`, x: x ? `Nächster Termin (${dt.getDate()}.${dt.getMonth() + 1}.) fällt aus` : '' };
  });
}

// ======================================================================
function ueber(d) {
  const A = d.about || {};
  $('#abTitle').textContent = A.title || 'Wir sind Studio68.';
  $('#abIntro').textContent = A.intro || '';
  const g = d.gallery || [];
  const pic = (i, f) => (g[i] && g[i].src) || f;
  $('#abStack').innerHTML = `
    <figure class="st-a rv"><img src="${esc(pic(0, 'assets/img/reception.jpg'))}" alt="Empfang im Studio68"><figcaption class="hand">die Lobby</figcaption></figure>
    <figure class="st-b rv"><img src="${esc((d.photos || {}).heroSmall || 'assets/img/trophies.jpg')}" alt="Gürtel-Vitrine"></figure>
    <figure class="st-c rv"><img src="${esc(pic(4, 'assets/img/kids-group.jpg'))}" alt="Kids-Team"><span class="tp"></span></figure>`;
  let m = esc(A.mission || '');
  if (A.missionMark) m = m.replace(esc(A.missionMark), `<mark>${esc(A.missionMark)}</mark>`);
  $('#abMission').innerHTML = `„${m}“`;
  $('#abPillars').innerHTML = (A.pillars || []).map((p, i) => `<article class="pil rv" style="transition-delay:${i * .08}s"><span class="mono">${nn(i)} //</span><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p></article>`).join('');
  $('#abValues').innerHTML = (A.values || []).map((v, i) => `<div class="val rv"><span class="val-n">${nn(i)}</span><h3>${esc(v.t)}</h3><p>${esc(v.d)}</p></div>`).join('');
  $('#abMiles').innerHTML = (A.milestones || []).map(v => `<li><b>${esc(v.t)}</b><span>${esc(v.d)}</span></li>`).join('');
  $('#abTrophy').src = (d.photos || {}).heroSmall || 'assets/img/trophies.jpg';
  const C = d.coaches || [];
  $('#abTeam').innerHTML = C.length ? C.map(c => `<article class="coach rv">${c.photo ? `<img src="${esc(c.photo)}" alt="${esc(c.name)}" loading="lazy">` : ''}<span class="coach-holo"></span>
      <div class="coach-b"><span class="mono">${esc(c.role || '')}</span><h3>${esc(c.name)}</h3>${c.text ? `<p>${esc(c.text)}</p>` : ''}
      <div class="coach-stats">${(c.stats || []).map(s => `<div><span>${esc(s.k)}</span><br>${esc(s.v)}</div>`).join('')}</div></div></article>`).join('')
    : `<div class="team-empty rv"><p class="hand">Das Team lernst du am besten persönlich kennen.</p><p>Komm zum kostenlosen Probetraining. Die Coaches nehmen sich Zeit für dich, egal ob du zum ersten Mal Handschuhe anziehst oder Wettkämpfe bestreitest.</p><a class="btn btn-orange" href="./#probetraining">Coaches kennenlernen →</a></div>`;
  $('#abGallery').innerHTML = g.map((p, i) => `<figure class="ag rv" style="--r:${((i * 37) % 7 - 3) * .5}deg"><img src="${esc(p.src)}" alt="${esc(p.caption || '')}" loading="lazy"><figcaption class="hand">${esc(p.caption || '')}</figcaption></figure>`).join('');
  $('#abReviews').innerHTML = (d.reviews || []).slice(0, 3).map(r => {
    let t = esc(r.text); if (r.mark) t = t.replace(esc(r.mark), `<mark>${esc(r.mark)}</mark>`);
    return `<blockquote class="rq rv"><p>${t}</p><cite class="mono">${esc(r.name)} · Google</cite></blockquote>`;
  }).join('');
  $('#abRevCount').textContent = d.reviewCount || '';
}

// ======================================================================
function kurse(d) {
  const D = d.disciplines;
  $('#kuCount').textContent = d.schedule.length;
  $('#kuNav').innerHTML = D.map((x, i) => `<a href="#d-${x.id}" style="--c:${x.color}"><i></i>${nn(i)} ${esc(x.name)}</a>`).join('');
  $('#kuList').innerHTML = D.map((x, i) => {
    const T = timesOf(d, x);
    return `<section class="dz ${i % 2 ? 'flip' : ''}" id="d-${x.id}" style="--c:${x.color}">
      <div class="dz-a rv">
        <div class="dz-n">${nn(i)}</div>
        <span class="mono dz-sub">${esc(x.sub || '')}</span>
        <h2 class="dz-name">${esc(x.name)}</h2>
        <p class="dz-tag hand">${esc(x.tagline || '')}</p>
        <p class="dz-text">${esc(x.text || '')}</p>
        <ul class="dz-points">${(x.points || []).map(p => `<li>${esc(p)}</li>`).join('')}</ul>
        <div class="dz-btns">
          ${x.id === 'kids' ? `<a class="btn btn-ink" href="kids.html">Alles für Eltern →</a>` : ''}
          <a class="btn dz-cta" href="${bookLink(x.id)}">Probetraining ${esc(x.name)} →</a>
          <a class="soc-chip soc-wa" href="${waLink(d, `Hi Studio68! Ich hab eine Frage zu ${x.name}.`)}" target="_blank" rel="noopener">${WA}<span>Frage stellen</span></a>
        </div>
      </div>
      <div class="dz-b rv">
        ${x.photo ? `<figure class="dz-photo"><img src="${esc(x.photo)}" alt="${esc(x.name)}" loading="lazy"></figure>` : `<div class="dz-type" aria-hidden="true"><span>${esc(x.name)}</span><span>${esc(x.name)}</span><span>${esc(x.name)}</span></div>`}
        <div class="dz-card">
          <div class="dz-row"><span class="mono">INTENSITÄT</span><span class="dz-int">${Array.from({ length: 5 }, (_, k) => `<i class="${k < (x.intensity || 0) ? 'on' : ''}"></i>`).join('')}</span></div>
          <div class="dz-row"><span class="mono">FÜR</span><span class="dz-for">${(x.for || []).map(f => `<b>${esc(f)}</b>`).join('')}</span></div>
          <div class="dz-when"><span class="mono">${x.open ? 'GEÖFFNET' : 'TRAININGSZEITEN'}</span>
            ${T.length ? T.map(r => `<div class="dz-t ${r.x ? 'x' : ''}"><b>${esc(r.day)}</b><span>${esc(r.time)}</span><em>${esc(r.x || r.what)}</em></div>`).join('') : '<div class="dz-t"><em>Termine auf Anfrage</em></div>'}
          </div>
        </div>
      </div>
    </section>`;
  }).join('');
  // aktive Disziplin in der Leiste markieren
  const links = $$('#kuNav a');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    const on = $('#kuNav a.on'); if (on) $('#kuNav').scrollLeft = on.offsetLeft - 20;
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('.dz').forEach(s => io.observe(s));
}

// ======================================================================
function kids(d) {
  const k = d.disciplines.find(x => x.id === 'kids') || {};
  $('#kiText').textContent = k.text || '';
  $('#kiPhoto').src = k.photo || 'assets/img/kids-group.jpg';
  const groups = [['Minis', '4–7 Jahre', /mini/i], ['Kids', '8–12 Jahre', /kids|8/i]];
  const cls = d.schedule.filter(c => c.disc === 'kids');
  $('#kiGroups').innerHTML = groups.map(([n, age, rx], i) => {
    const mine = cls.filter(c => i === 0 ? /mini/i.test(c.level) : !/mini/i.test(c.level)).sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7));
    return `<article class="kg rv ${i ? 'b' : 'a'}"><span class="mono">GRUPPE ${nn(i)}</span><h3>${n}</h3><b class="kg-age">${age}</b>
      <div class="kg-t">${mine.map(c => `<div><b>${DAYS_LONG[c.day]}</b><span>${c.start}–${c.end}</span><em>${esc(c.title.replace(/^Kids\s*/, ''))}</em></div>`).join('') || '<div><em>Zeiten auf Anfrage</em></div>'}</div>
      <a class="btn btn-ink" href="${bookLink('kids')}">Probetraining ${n} →</a></article>`;
  }).join('');

  const ben = [['Selbstverteidigung', 'Altersgerecht lernen, sich zu schützen und Grenzen zu setzen.'], ['Selbstvertrauen', 'Wer weiß, was er kann, tritt anders auf. In der Schule und überall.'], ['Konzentration', 'Kombinationen merken, zuhören, umsetzen. Fördert Koordination und Fokus.'], ['Teamgeist', 'Zusammen trainieren, sich gegenseitig helfen, gemeinsam besser werden.'], ['Disziplin & Respekt', 'Regeln, Begrüßung, Fairness. Werte, die im Kampfsport dazugehören.'], ['Spaß an Bewegung', 'Spielerisch und motivierend statt Drill. Weg vom Bildschirm, rein ins Training.']];
  $('#kiBen').innerHTML = ben.map(([t, x], i) => `<div class="kb rv" style="transition-delay:${i * .06}s"><span class="kb-i">${nn(i)}</span><h3>${t}</h3><p>${x}</p></div>`).join('');
  const plan = (d.prices.plans || []).find(p => p.id === 'kids');
  $('#kiPrice').innerHTML = plan ? `<span class="mono">KINDERTRAINING · DI + DO</span><div class="kp">${d.prices.durations.map(m => `<div><b>${plan.prices[m]}</b><span>€ / Monat<br>${m} Monate</span></div>`).join('')}</div><p class="mono">Erstes Probetraining kostenlos</p>` : '';
  $('#kiFaq').innerHTML = (d.kidsFaq || []).map(f => `<details><summary>${esc(f.q)}<i></i></summary><p>${esc(f.a)}</p></details>`).join('');
  const kw = $('#kiWa'); kw.href = waLink(d, 'Hi Studio68! Ich habe eine Frage zum Kindertraining.'); kw.innerHTML = WA + '<span>Frage per WhatsApp</span>';
}
