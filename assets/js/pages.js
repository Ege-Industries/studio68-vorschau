// Unterseiten (Struktur wie die alte Seite): Über uns, Fight, Muskelfabrik, Kids, Kurszeiten, Preise, Partner, News, Presse, Kontakt
import { loadData, now, DAYS, DAYS_LONG, hm, key, addDays, minsOf, matches, cancellation, esc } from './data.js';
import { mountChrome, initChrome, WA, IG } from './chrome.js';
import { $, $$, nn, observeReveal, swiper, teamCards, tiltCards, galleryHTML, lightbox, initPrices, hoursHTML, statusHTML, faqHTML, newsCards, articleModal } from './components.js';
import { initPlan } from './plan.js';

const page = document.body.dataset.page;
mountChrome(page);
const waLink = (d, txt) => `https://wa.me/${d.studio.whatsapp}?text=${encodeURIComponent(txt)}`;
const bookLink = id => `./?d=${encodeURIComponent(id)}#probetraining`;

(async () => {
  const d = await loadData();
  if (!d) return;
  initChrome(d);
  ({ ueber, kurse, muskelfabrik, kids, kurszeiten, preise, partner, news, presse, kontakt })[page]?.(d);
  ctaBand(d);
  observeReveal();
  if (location.hash && !['news', 'presse'].includes(page)) setTimeout(() => { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }, 120);
})();

function ctaBand(d) {
  const el = $('#ctaBand'); if (!el) return;
  el.innerHTML = `<div class="mono sh-k"><span class="ast">✳</span> ERSTES PROBETRAINING KOSTENLOS</div>
    <h2 class="cb-h">Genug gelesen.<br><span>Komm vorbei.</span></h2>
    <p>Buch dein Probetraining online oder schreib uns direkt.</p>
    <div class="cb-btns">
      <a class="btn btn-pink btn-xl" href="./#probetraining">Probetraining buchen <span class="arr">⟶</span></a>
      <a class="soc-chip soc-wa" href="${waLink(d, 'Hi Studio68! Ich würde gern ein Probetraining machen.')}" target="_blank" rel="noopener">${WA}<span>WhatsApp</span></a>
      <a class="soc-chip soc-ig" href="${esc(d.studio.instagram)}" target="_blank" rel="noopener">${IG}<span>Instagram</span></a>
    </div>`;
}
function stack(el, a, b, c) {
  el.innerHTML = `<figure class="st-a rv"><img src="${esc(a.src)}" alt=""><figcaption class="hand">${esc(a.caption || '')}</figcaption></figure>
    <figure class="st-b rv"><img src="${esc(b.src)}" alt=""></figure><figure class="st-c rv"><img src="${esc(c.src)}" alt=""></figure>`;
}
function timesOf(d, disc) {
  const t = now(), today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  if (disc.open) return d.studio.hours.map(h => ({ day: h.days.length > 1 ? `${DAYS[h.days[0]]}–${DAYS[h.days[h.days.length - 1]]}` : DAYS_LONG[h.days[0]], time: `${h.from}–${h.to}`, what: 'Freies Training' }));
  return d.schedule.filter(c => matches(disc, c)).sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7) || hm(a.start) - hm(b.start)).map(c => {
    let k = 0; while ((today.getDay() + k) % 7 !== c.day) k++;
    const dt = addDays(today, k); if (k === 0 && hm(c.end) <= minsOf(t)) dt.setDate(dt.getDate() + 7);
    const x = cancellation(d, c.id, key(dt));
    return { day: DAYS_LONG[c.day], time: `${c.start}–${c.end}`, what: `${c.title}${c.level ? ' · ' + c.level : ''}`, x: x ? `${dt.getDate()}.${dt.getMonth() + 1}. fällt aus` : '' };
  });
}

// ---------------- Über uns ----------------
function ueber(d) {
  const A = d.about || {}, G = d.gallery || [];
  $('#abTitle').innerHTML = esc(A.title || 'Wir sind Studio68.').replace('Studio68.', '<span>Studio68.</span>');
  $('#abIntro').textContent = A.intro || '';
  stack($('#abStack'), G[0] || {}, G[2] || {}, G[10] || {});
  let mh = esc(A.missionHead || A.mission || '');
  mh = mh.replace('dein Leben zu verändern', '<span>dein Leben zu verändern</span>');
  $('#msHead').innerHTML = mh;
  $('#msSub').textContent = A.missionSub || '';
  $('#msTriple').innerHTML = (A.triple || []).map(x => `<span>✓ ${esc(x)}</span>`).join('');
  $('#msPillars').innerHTML = (A.pillars || []).map((p, i) => `<article class="pil rv" style="--d:${i * .08}s"><span class="mono">${nn(i)} //</span><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p></article>`).join('');
  $('#teamIntro').textContent = A.teamIntro || '';
  $('#teamStats').innerHTML = (A.teamStats || []).map(x => `<div><b>${esc(x.v)}</b><span>${esc(x.k)}</span></div>`).join('');
  const tr = $('#teamTrack'); tr.innerHTML = teamCards(d); swiper(tr); tiltCards(tr);
  const gg = $('#galGrid'), N = matchMedia('(max-width: 900px)').matches ? 10 : 13, shown = G.slice(0, N);
  gg.innerHTML = shown.map((p, i) => `<figure data-i="${i}" class="${i === N - 1 && G.length > N ? 'gal-more' : ''}"><img src="${esc(p.src)}" alt="${esc(p.caption || '')}" loading="lazy"><figcaption>${esc(p.caption || '')}</figcaption>${i === N - 1 && G.length > N ? `<span>+${G.length - N + 1} Fotos</span>` : ''}</figure>`).join('');
  lightbox(G, gg);
  const maybe = A.maybe || []; let mi = 0;
  const mEl = $('#galMaybe'); const rot = () => { mEl.textContent = maybe[mi++ % maybe.length] || ''; }; rot(); setInterval(rot, 3200);
  const ar = $('#areas');
  ar.innerHTML = (A.studio || []).map(a => `<article class="area rv"><img src="${esc(a.img)}" alt="${esc(a.t)}" loading="lazy"><div><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p></div></article>`).join('');
  swiper(ar);
  $('#winsList').innerHTML = (A.wins || []).map(w => `<li><b>${esc(w.y)}</b><span>${esc(w.t)} · <em style="font-style:normal;color:var(--hi)">${esc(w.who)}</em></span></li>`).join('');
}

// ---------------- Training & Kurse Fight ----------------
function kurse(d) {
  const D = d.disciplines.filter(x => x.id !== 'muskelfabrik');
  $('#kuCount').textContent = D.length;
  $('#kuTiles').innerHTML = D.map((x, i) => `<a href="#d-${x.id}" style="--c:${x.color}"><small>${nn(i)}</small><b>${esc(x.name)}</b></a>`).join('') + `<a href="muskelfabrik.html" style="--c:#b9b9b9"><small>+</small><b>Muskelfabrik</b></a>`;
  $('#kuList').innerHTML = D.map((x, i) => {
    const T = timesOf(d, x);
    return `<section class="dz scr ${i % 2 ? 'alt' : 'paper'}" id="d-${x.id}" style="--c:${x.color}">
      <div class="dz-a">
        <div class="dz-n">${nn(i)}</div>
        <span class="dz-sub">${esc(x.sub || '')}</span>
        <h2 class="dz-name">${esc(x.name)}</h2>
        <p class="dz-tag">${esc(x.tagline || '')}</p>
        <p class="dz-text">${esc(x.text || '')}</p>
        <ul class="dz-points">${(x.points || []).map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>
      <div class="dz-b">
        ${x.photo ? `<figure class="dz-photo"><img src="${esc(x.photo)}" alt="${esc(x.name)}" loading="lazy"></figure>` : `<div class="dz-type" aria-hidden="true"><span>${esc(x.name)} ${esc(x.name)}</span><span>${esc(x.name)} ${esc(x.name)}</span></div>`}
        <div class="dz-card">
          <div class="dz-row"><span class="mono">INTENSITÄT</span><span class="dz-int">${Array.from({ length: 5 }, (_, k) => `<i class="${k < (x.intensity || 0) ? 'on' : ''}"></i>`).join('')}</span></div>
          <div class="dz-row"><span class="mono">FÜR</span><span class="dz-for">${(x.for || []).map(f => `<b>${esc(f)}</b>`).join('')}</span></div>
          <div class="dz-when"><span class="mono">TRAININGSZEITEN</span>${T.length ? T.map(r => `<div class="dz-t ${r.x ? 'x' : ''}"><b>${esc(r.day)}</b><span>${esc(r.time)}</span><em>${esc(r.x || r.what)}</em></div>`).join('') : '<div class="dz-t"><em>Termine auf Anfrage</em></div>'}</div>
        </div>
        <div class="dz-btns">
          ${x.id === 'kids' ? `<a class="btn btn-ink" href="kids.html">Für Eltern →</a>` : ''}
          <a class="btn dz-cta" href="${bookLink(x.id)}">Probetraining →</a>
          <a class="soc-chip soc-wa" href="${waLink(d, `Hi Studio68! Ich hab eine Frage zu ${x.name}.`)}" target="_blank" rel="noopener">${WA}<span>Frage</span></a>
        </div>
      </div>
    </section>`;
  }).join('');
}

// ---------------- Muskelfabrik ----------------
function muskelfabrik(d) {
  const M = d.muskelfabrik || {}, disc = d.disciplines.find(x => x.id === 'muskelfabrik') || {};
  $('#mfDict').innerHTML = (M.defs || []).map(x => `<div class="dict-e"><b>${esc(x.w)}</b><i>${esc(x.ipa)}</i><p>${esc(x.d)}</p></div>`).join('');
  stack($('#mfStack'), { src: 'assets/img/gym-machines-1.jpg', caption: 'Back to the roots' }, { src: 'assets/img/galerie/g20.jpg' }, { src: 'assets/img/gym-cardio.jpg' });
  $('#mfText').textContent = M.text || disc.text || '';
  const pics = [['assets/img/gym-machines-wide.jpg', 'Kraftgeräte'], ['assets/img/gym-cardio.jpg', 'Cardio'], ['assets/img/gym-functional.jpg', 'Functional-Fläche'], ['assets/img/gym-tire.jpg', 'Tire & Air Bike'], ['assets/img/galerie/g21.jpg', 'Geräte'], ['assets/img/galerie/g20.jpg', 'Muskelfabrik']].map(([src, caption]) => ({ src, caption }));
  const g = $('#mfGal'); g.innerHTML = galleryHTML(pics); swiper(g); lightbox(pics, g);
  const plan = (d.prices.plans || []).find(p => p.id === 'fitness');
  $('#mfPrice').innerHTML = plan ? d.prices.durations.map(m => `<div><b>${plan.prices[m]} €</b><span>pro Monat · ${m} Monate</span></div>`).join('') + `<div><b>+5,99</b><span>€ für 24-h-Zugang</span></div>` : '';
  $('#mfHours').innerHTML = hoursHTML(d);
}

// ---------------- Kids ----------------
function kids(d) {
  const k = d.disciplines.find(x => x.id === 'kids') || {}, G = d.gallery || [];
  $('#kiText').textContent = k.text || '';
  const pick = n => G.find(g => g.src.includes(n)) || G[0];
  stack($('#kiStack'), { src: k.photo || 'assets/img/kids-group.jpg', caption: 'unser Kids-Team' }, pick('g19'), pick('g08'));
  const cls = d.schedule.filter(c => c.disc === 'kids');
  $('#kiGroups').innerHTML = [['Minis', '4–7 Jahre', true], ['Kids', '8–12 Jahre', false]].map(([n, age, mini], i) => {
    const mine = cls.filter(c => mini === /mini/i.test(c.level)).sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7));
    return `<article class="kg ${i ? 'b' : 'a'}"><span class="mono">GRUPPE ${nn(i)}</span><h3>${n}</h3><b class="kg-age">${age}</b>
      <div class="kg-t">${mine.map(c => `<div><b>${DAYS_LONG[c.day]}</b><span>${c.start}–${c.end}</span><em>${esc(c.title.replace(/^Kids\s*/, ''))}</em></div>`).join('') || '<div><em>Zeiten auf Anfrage</em></div>'}</div>
      <a class="btn" href="${bookLink('kids')}">Probetraining ${n} →</a></article>`;
  }).join('');
  const ben = [['Selbstverteidigung', 'Altersgerecht lernen, sich zu schützen und Grenzen zu setzen.'], ['Selbstvertrauen', 'Wer weiß, was er kann, tritt anders auf.'], ['Konzentration', 'Kombinationen merken, zuhören, umsetzen.'], ['Teamgeist', 'Zusammen trainieren, sich gegenseitig helfen.'], ['Disziplin & Respekt', 'Regeln, Begrüßung, Fairness gehören dazu.'], ['Spaß an Bewegung', 'Spielerisch und motivierend statt Drill.']];
  $('#kiBen').innerHTML = ben.map(([t, x], i) => `<div class="kb rv" style="--d:${i * .05}s"><span class="kb-i">${nn(i)}</span><h3>${t}</h3><p>${x}</p></div>`).join('');
  const plan = (d.prices.plans || []).find(p => p.id === 'kids');
  $('#kiPrice').innerHTML = plan ? `<span class="mono">KINDERTRAINING · DI + DO</span><div class="kp">${d.prices.durations.map(m => `<div><b>${plan.prices[m]}</b><span>€ / Monat<br>${m} Monate</span></div>`).join('')}</div><p class="mono">Erstes Probetraining kostenlos</p>` : '';
  $('#kiFaq').innerHTML = faqHTML(d.kidsFaq);
  $('#kiWa').href = waLink(d, 'Hi Studio68! Ich habe eine Frage zum Kindertraining.');
}

// ---------------- Kurszeiten ----------------
function kurszeiten(d) { initPlan(d, { onBook: o => { location.href = `./?d=${encodeURIComponent(o.disc)}#probetraining`; } }); }

// ---------------- Preise ----------------
function preise(d) {
  initPrices(d, $('#preise'));
  const P = d.prices, ex = P.extras || [];
  const find = r => (ex.find(x => r.test(x.label)) || {}).value;
  const faq = [
    { q: 'Wie lange läuft ein Vertrag?', a: `Du wählst ${P.durations.join(', ').replace(/, (\d+)$/, ' oder $1')} Monate. Je länger, desto günstiger im Monat.` },
    { q: 'Gibt es eine Anmeldegebühr?', a: `Ja, einmalig ${find(/Anmelde/i) || '30 €'} bei Vertragsabschluss.` },
    { q: 'Kann ich rund um die Uhr trainieren?', a: `Mit dem 24-Stunden-Zugang für ${find(/24/) || '5,99 €'}.` },
    { q: 'Kann ich vorher testen?', a: 'Ja. Das erste Probetraining ist kostenlos und unverbindlich.' },
    { q: 'Gibt es Personal Training?', a: `Personal Training gibt es ${find(/Personal/i) || 'auf Anfrage'}. Sprich uns einfach an.` },
  ];
  $('#faqList').innerHTML = faqHTML(faq);
}

// ---------------- Partner ----------------
function partner(d) {
  $('#partnerGrid').innerHTML = (d.partners || []).map(p => p.url
    ? `<a href="${esc(p.url)}" target="_blank" rel="noopener" title="${esc(p.name)}"><img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy"></a>`
    : `<div title="${esc(p.name)}"><img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy"></div>`).join('');
}

// ---------------- News + Presse ----------------
function news(d) {
  const list = (d.news || []).filter(n => n.cat !== 'presse').sort((a, b) => b.date.localeCompare(a.date));
  const t = $('#newsTrack'); t.innerHTML = newsCards(list); swiper(t); articleModal(list, t);
}
function presse(d) {
  const list = (d.news || []).filter(n => n.cat === 'presse' || n.cat === 'beides').sort((a, b) => b.date.localeCompare(a.date));
  const g = $('#pressGrid'); g.innerHTML = newsCards(list); swiper(g); articleModal(list, g);
}

// ---------------- Kontakt ----------------
function kontakt(d) {
  $('#hours').innerHTML = hoursHTML(d);
  const st = statusHTML(d), cs = $('#ctcStatus'); cs.classList.toggle('open', st.open); cs.innerHTML = st.html;
  $('#routeBtn').href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${d.studio.street} ${d.studio.zip} ${d.studio.city}`)}`;
  const f = $('#kf'), m = $('#kfMsg');
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(f));
    m.className = 'kf-msg bad';
    if (!fd.name || fd.name.trim().length < 2) return m.textContent = 'Bitte deinen Namen angeben.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fd.email || '')) return m.textContent = 'Bitte eine gültige E-Mail angeben.';
    if (!fd.msg || fd.msg.trim().length < 5) return m.textContent = 'Bitte eine Nachricht schreiben.';
    if (!fd.consent) return m.textContent = 'Bitte die Einwilligung ankreuzen.';
    m.className = 'kf-msg'; m.textContent = 'Wird gesendet …';
    try {
      const r = await fetch('api.php?a=msg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fd, consent: true }) });
      if (r.status === 404 || r.status === 405) { m.className = 'kf-msg bad'; m.innerHTML = `Vorschau-Version: Nachricht wurde nicht gesendet. <a href="${waLink(d, fd.msg)}" target="_blank" rel="noopener">Per WhatsApp schicken →</a>`; return; }
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Fehler');
      m.className = 'kf-msg ok'; m.textContent = 'Danke! Wir melden uns umgehend.'; f.reset();
    } catch (x) { m.className = 'kf-msg bad'; m.innerHTML = `${esc(x.message || 'Senden fehlgeschlagen')}. <a href="${waLink(d, fd.msg)}" target="_blank" rel="noopener">Per WhatsApp →</a>`; }
  });
}
