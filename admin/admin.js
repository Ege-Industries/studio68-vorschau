// Studio68 Admin – Ausfälle, Plan, Fotos, Anfragen, Texte
import { DAYS, DAYS_LONG, now, hm, key, ddmm, addDays, occurrences, esc } from '../assets/js/data.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
let D = null, ORIG = '', csrf = '', bookings = [], DEMO = false;
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const REASONS = ['Trainer krank', 'Feiertag', 'Event im Studio', 'Urlaub', 'Technik'];

// ---------- API ----------
async function api(a, body, isForm) {
  if (DEMO) { if (a === 'booking') return { ok: true }; throw new Error('Vorschau: geht erst auf der fertigen Website.'); }
  const opt = { method: body ? 'POST' : 'GET', credentials: 'same-origin', headers: { 'X-CSRF': csrf } };
  if (body && !isForm) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  if (isForm) opt.body = body;
  const r = await fetch('../api.php?a=' + a, opt);
  let j = {}; try { j = await r.json(); } catch {}
  if (r.status === 401 && a !== 'login') { showLogin(); throw new Error('Bitte neu anmelden'); }
  if (!r.ok || j.ok === false) throw new Error(j.error || `Fehler ${r.status}`);
  return j;
}
function toast(msg, bad) {
  const t = $('#toast'); t.textContent = msg; t.className = 'toast on' + (bad ? ' bad' : '');
  clearTimeout(t._t); t._t = setTimeout(() => t.className = 'toast', bad ? 5000 : 2200);
}

// ---------- Start / Login ----------
function showLogin() { $('#app').hidden = true; $('#login').hidden = false; setTimeout(() => $('#pw').focus(), 50); }
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); $('#loginErr').textContent = '';
  try { const j = await api('login', { password: $('#pw').value }); csrf = j.csrf; $('#pw').value = ''; await start(); }
  catch (x) { $('#loginErr').textContent = x.message; }
});
$('#logout').addEventListener('click', async () => { try { await api('logout', {}); } catch {} location.reload(); });

async function start() {
  const r = await fetch('../data/site.json?v=' + Date.now(), { cache: 'no-store' });
  D = await r.json(); ORIG = JSON.stringify(D);
  $('#login').hidden = true; $('#app').hidden = false;
  if (DEMO) document.querySelector('.main').insertAdjacentHTML('afterbegin', '<div class="demo-note">VORSCHAU-MODUS · Hier kann man sich alles ansehen und ausprobieren. Gespeichert wird erst auf der fertigen Website.</div>');
  renderAll(); loadBookings();
}
(async () => {
  try {
    const r = await fetch('../api.php?a=me', { credentials: 'same-origin' });
    if (r.status === 404 || r.status === 405) { DEMO = true; await start(); return; }   // Vorschau ohne PHP
    const j = await r.json(); if (j.auth) { csrf = j.csrf; await start(); } else showLogin();
  } catch { showLogin(); }
})();

// ---------- Tabs ----------
$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#tabs button').forEach(x => x.classList.toggle('on', x === b));
  $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'p-' + b.dataset.t));
  if (b.dataset.t === 'anfragen') loadBookings();
  scrollTo(0, 0);
});

// ---------- Speichern ----------
function dirty() { $('#savebar').classList.toggle('on', JSON.stringify(D) !== ORIG); }
async function save(msg = 'Live ✓') {
  if (DEMO) { toast('Vorschau: Speichern geht erst auf der fertigen Website.'); return; }
  const t = key(now());
  D.cancellations = (D.cancellations || []).filter(c => c.date >= t);   // alte Ausfälle aufräumen
  try {
    const j = await api('save', { rev: D.rev || 0, data: D });
    D.rev = j.rev; ORIG = JSON.stringify(D); dirty(); toast(msg);
  } catch (x) { toast(x.message, true); }
}
$('#save').addEventListener('click', () => save());
$('#undo').addEventListener('click', () => { D = JSON.parse(ORIG); renderAll(); dirty(); toast('Verworfen'); });
addEventListener('beforeunload', e => { if (D && JSON.stringify(D) !== ORIG) { e.preventDefault(); e.returnValue = ''; } });

function renderAll() { renderHeute(); renderPlan(); renderFotos(); renderMehr(); }
const disc = id => D.disciplines.find(d => d.id === id) || { name: id, color: '#888' };

// ======================================================================
// AUSFÄLLE
// ======================================================================
function renderHeute() {
  const t = now(), today = new Date(t.getFullYear(), t.getMonth(), t.getDate()), tk = key(t);
  const occ = occurrences(D, today, 14);
  const byDay = {};
  occ.forEach(o => (byDay[o.key] = byDay[o.key] || []).push(o));
  let html = `<h2>Ausfälle</h2><p class="hint">Fällt ein Kurs aus? Schalter umlegen. Das steht sofort auf der Website: im Plan durchgestrichen, im Laufband und bei der Buchung gesperrt.</p>`;
  for (const k of Object.keys(byDay)) {
    const d = byDay[k][0].date;
    html += `<div class="day"><div class="day-h ${k === tk ? 'today' : ''}">${k === tk ? 'Heute' : k === key(addDays(today, 1)) ? 'Morgen' : DAYS_LONG[d.getDay()]}<span>${ddmm(d)}</span></div>`;
    for (const o of byDay[k]) {
      const x = (D.cancellations || []).find(c => c.classId === o.cls.id && c.date === k);
      html += `<div class="cls ${x ? 'x' : ''}"><span class="c" style="background:${disc(o.cls.disc).color}"></span>
        <div><b>${esc(o.cls.title)}</b><small>${o.cls.start}–${o.cls.end} · ${esc(o.cls.level || '')}</small>${x ? `<span class="why">FÄLLT AUS${x.reason ? ': ' + esc(x.reason) : ''}</span>` : ''}</div>
        <div><button class="sw ${x ? 'on' : ''}" data-c="${o.cls.id}" data-k="${k}" aria-label="Fällt aus"></button><div class="sw-l">${x ? 'fällt aus' : 'findet statt'}</div></div>
        ${x ? `<div class="reason"><div class="chips">${REASONS.map(r => `<button class="chip ${x.reason === r ? 'on' : ''}" data-r="${esc(r)}" data-c="${o.cls.id}" data-k="${k}">${esc(r)}</button>`).join('')}</div>
          <input placeholder="Eigener Grund (optional)" value="${esc(x.reason || '')}" data-reason data-c="${o.cls.id}" data-k="${k}"></div>` : ''}
      </div>`;
    }
    html += '</div>';
  }
  html += `<h3>Info-Laufband</h3><p class="hint">Kurze Meldungen, die oben auf der Website durchlaufen (z. B. „Neu: Kickboxen für Frauen“).</p><div id="tick"></div>
    <button class="b b-ghost" id="addTick">+ Meldung</button>`;
  const p = $('#p-heute'); p.innerHTML = html;
  const tick = $('#tick');
  tick.innerHTML = (D.ticker || []).map((m, i) => `<div class="row" style="margin-bottom:6px"><input value="${esc(m)}" data-ti="${i}" maxlength="90"><button class="b b-red b-sm" data-tdel="${i}">✕</button></div>`).join('');
  p.onclick = async e => {
    const sw = e.target.closest('.sw');
    if (sw) {
      const c = sw.dataset.c, k = sw.dataset.k;
      D.cancellations = D.cancellations || [];
      const i = D.cancellations.findIndex(x => x.classId === c && x.date === k);
      if (i >= 0) D.cancellations.splice(i, 1); else D.cancellations.push({ classId: c, date: k, reason: '' });
      renderHeute(); await save(i >= 0 ? 'Findet wieder statt ✓' : 'Als Ausfall eingetragen ✓'); return;
    }
    const ch = e.target.closest('.chip[data-r]');
    if (ch) { const x = D.cancellations.find(x => x.classId === ch.dataset.c && x.date === ch.dataset.k); if (x) { x.reason = ch.dataset.r; renderHeute(); await save('Grund gespeichert ✓'); } return; }
    if (e.target.id === 'addTick') { (D.ticker = D.ticker || []).push(''); renderHeute(); dirty(); $$('[data-ti]').pop().focus(); return; }
    const del = e.target.closest('[data-tdel]');
    if (del) { D.ticker.splice(+del.dataset.tdel, 1); renderHeute(); dirty(); }
  };
  p.oninput = e => {
    if (e.target.dataset.ti !== undefined) { D.ticker[+e.target.dataset.ti] = e.target.value; dirty(); }
    if (e.target.hasAttribute('data-reason')) { const x = D.cancellations.find(x => x.classId === e.target.dataset.c && x.date === e.target.dataset.k); if (x) { x.reason = e.target.value; dirty(); } }
  };
}

// ======================================================================
// PLAN
// ======================================================================
function renderPlan() {
  const opts = id => D.disciplines.map(d => `<option value="${d.id}" ${d.id === id ? 'selected' : ''}>${esc(d.name)}</option>`).join('');
  let html = `<h2>Trainingsplan</h2><p class="hint">Der feste Wochenplan. Für einzelne Ausfälle bitte den Reiter „Ausfälle“ nehmen. Änderungen hier erst mit „Live schalten“ übernehmen.</p>`;
  for (const dow of ORDER) {
    const list = D.schedule.map((c, i) => ({ c, i })).filter(x => x.c.day === dow).sort((a, b) => hm(a.c.start) - hm(b.c.start));
    html += `<div class="pl-day"><h3>${DAYS_LONG[dow]}</h3>${list.map(({ c, i }) => `
      <div class="pl-row" data-i="${i}">
        <input type="time" value="${c.start}" data-f="start" aria-label="Start">
        <input type="time" value="${c.end}" data-f="end" aria-label="Ende">
        <select data-f="disc" aria-label="Disziplin">${opts(c.disc)}</select>
        <input class="pl-title" value="${esc(c.title)}" data-f="title" placeholder="Kursname" aria-label="Kursname">
        <input value="${esc(c.level || '')}" data-f="level" placeholder="Level / Alter" aria-label="Level">
        <button class="pl-del" data-del="${i}" aria-label="Kurs löschen">✕</button>
      </div>`).join('') || '<p class="hint">Kein Kurs.</p>'}
      <button class="b b-ghost b-sm" data-add="${dow}">+ Kurs am ${DAYS_LONG[dow]}</button></div>`;
  }
  const p = $('#p-plan'); p.innerHTML = html;
  p.oninput = p.onchange = e => {
    const row = e.target.closest('.pl-row'), f = e.target.dataset.f; if (!row || !f) return;
    const c = D.schedule[+row.dataset.i]; c[f] = e.target.value;
    if (f === 'disc' && !c.title) c.title = disc(c.disc).name;
    dirty();
  };
  p.onclick = e => {
    const del = e.target.closest('[data-del]');
    if (del) { const c = D.schedule[+del.dataset.del]; if (!confirm(`„${c.title}“ am ${DAYS_LONG[c.day]} ${c.start} löschen?`)) return; D.schedule.splice(+del.dataset.del, 1); renderPlan(); dirty(); return; }
    const add = e.target.closest('[data-add]');
    if (add) { D.schedule.push({ id: 's' + Math.random().toString(36).slice(2, 8), day: +add.dataset.add, start: '18:00', end: '19:00', disc: D.disciplines[0].id, title: D.disciplines[0].name, level: 'Alle Level' }); renderPlan(); dirty(); }
  };
}

// ======================================================================
// FOTOS
// ======================================================================
async function shrink(file) {
  if (!/^image\/(jpeg|png|webp|heic|heif)/.test(file.type) || file.type === 'image/png' && file.size < 1.5e6) return file;
  try {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .86));
    return blob ? new File([blob], 'foto.jpg', { type: 'image/jpeg' }) : file;
  } catch { return file; }
}
async function upload(file) {
  if (DEMO) return URL.createObjectURL(file);
  const f = await shrink(file);
  const fd = new FormData(); fd.append('file', f, f.name || 'foto.jpg');
  const j = await api('upload', fd, true);
  return j.url;
}
const abs = u => u ? (/^(https?:|\/)/.test(u) ? u : '../' + u) : '';
function slot(title, sub, val, path, opts = {}) {
  const isVid = /\.(mp4|webm|mov)$/i.test(val || '');
  return `<div class="slot" data-path="${path}">
    <div class="im ${val ? '' : 'empty'}" style="${val && !isVid ? `background-image:url('${esc(abs(val))}')` : ''}">${isVid ? `<video src="${esc(abs(val))}" muted playsinline></video>` : ''}</div>
    <div class="bd"><div class="t">${esc(title)}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}
      ${opts.caption !== undefined ? `<input value="${esc(opts.caption)}" placeholder="Bildunterschrift" data-cap="${path}">` : ''}
      <div class="row"><label class="b b-orange b-sm up">${val ? 'Ersetzen' : 'Hochladen'}<input type="file" accept="${opts.video ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}" data-up="${path}"></label>
      ${val && opts.removable !== false ? `<button class="b b-ghost b-sm" data-rm="${path}">Entfernen</button>` : ''}
      ${opts.move ? `<button class="b b-ghost b-sm" data-mv="${path}" data-d="-1" aria-label="nach vorne">↑</button><button class="b b-ghost b-sm" data-mv="${path}" data-d="1" aria-label="nach hinten">↓</button>` : ''}</div>
    </div></div>`;
}
const getP = p => p.split('.').reduce((o, k) => o == null ? o : o[k], D);
function setP(p, v) { const ks = p.split('.'), last = ks.pop(); const o = ks.reduce((o, k) => (o[k] = o[k] ?? {}), D); o[last] = v; }

function renderFotos() {
  D.photos = D.photos || {}; D.gallery = D.gallery || [];
  let html = `<h2>Fotos & Video</h2><p class="hint">Foto antippen → „Ersetzen“ → Bild aus der Galerie wählen. Große Handyfotos werden automatisch verkleinert. Danach „Live schalten“.</p>
    <h3>Startseite & Bereiche</h3><div class="slots">
      ${slot('Startseite: Achteck-Foto', 'Großes Bild hinter dem Boxsack', D.photos.hero, 'photos.hero', { removable: false })}
      ${slot('Startseite: Filmstreifen', 'Kleines Foto oben rechts', D.photos.heroSmall, 'photos.heroSmall', { removable: false })}
      ${slot('Fight Night: Hintergrund', 'Wird verwischt und eingefärbt', D.photos.night, 'photos.night', { removable: false })}
      ${slot('Kontakt: Foto', 'Bei der Anfahrt', D.photos.contact, 'photos.contact', { removable: false })}
    </div>
    <h3>Galerie „Das Studio“</h3><p class="hint">Die ersten 8 Fotos erscheinen in der Collage.</p><div class="slots">
      ${D.gallery.map((g, i) => slot(`Foto ${i + 1}`, '', g.src, `gallery.${i}.src`, { caption: g.caption || '', move: true })).join('')}
      <div class="slot"><div class="im empty"></div><div class="bd"><div class="t">Neues Foto</div><label class="b b-orange b-sm up">+ Hinzufügen<input type="file" accept="image/*" data-newgal></label></div></div>
    </div>
    <h3>Disziplinen</h3><p class="hint">Kleines Foto in der Karte beim 3D-Käfig (optional).</p><div class="slots">
      ${D.disciplines.map((d, i) => slot(d.name, '', d.photo, `disciplines.${i}.photo`)).join('')}
    </div>
    <h3>Video</h3><p class="hint">MP4 vom Handy. Erscheint unter der Collage und hinter dem Play-Knopf bei „Fight Night“. Tipp: kurze Clips (unter 100 MB).</p><div class="slots">
      ${slot('Studio-Video', 'Unter der Galerie, läuft stumm in Schleife', D.video, 'video', { video: true })}
      ${slot('Fight-Night-Video', 'Öffnet sich beim Play-Knopf', (D.event || {}).video, 'event.video', { video: true })}
    </div>`;
  const p = $('#p-fotos'); p.innerHTML = html;
  p.onchange = async e => {
    const inp = e.target; if (inp.type !== 'file' || !inp.files[0]) return;
    const box = inp.closest('.slot'); box.classList.add('busy');
    try {
      const url = await upload(inp.files[0]);
      if (inp.hasAttribute('data-newgal')) D.gallery.push({ src: url, caption: '' });
      else setP(inp.dataset.up, url);
      renderFotos(); dirty(); toast('Hochgeladen. Jetzt „Live schalten“.');
    } catch (x) { box.classList.remove('busy'); toast(x.message, true); }
  };
  p.oninput = e => { const c = e.target.dataset.cap; if (c) { const i = +c.split('.')[1]; D.gallery[i].caption = e.target.value; dirty(); } };
  p.onclick = e => {
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      const path = rm.dataset.rm;
      if (path.startsWith('gallery.')) D.gallery.splice(+path.split('.')[1], 1); else setP(path, '');
      renderFotos(); dirty(); return;
    }
    const mv = e.target.closest('[data-mv]');
    if (mv) { const i = +mv.dataset.mv.split('.')[1], j = i + +mv.dataset.d; if (j < 0 || j >= D.gallery.length) return; [D.gallery[i], D.gallery[j]] = [D.gallery[j], D.gallery[i]]; renderFotos(); dirty(); }
  };
}

// ======================================================================
// ANFRAGEN
// ======================================================================
const STATI = [['neu', 'Neu'], ['bestaetigt', 'Bestätigt'], ['da', 'War da'], ['mitglied', 'Mitglied'], ['abgesagt', 'Abgesagt']];
async function loadBookings() {
  if (DEMO) { bookings = [{ id: 'demo', created: new Date().toISOString(), status: 'neu', name: 'Max Beispiel', phone: '0151 0000000', email: '', discName: 'MMA', slot: 'Mo · 20:00 · MMA · Alle Level', level: 'keine', msg: 'Beispiel-Anfrage (Vorschau)' }]; renderAnfragen(); return; }
  try { const j = await api('bookings'); bookings = j.items || []; } catch (x) { bookings = []; }
  renderAnfragen();
}
function renderAnfragen() {
  const n = bookings.filter(b => b.status === 'neu').length;
  $('#newCount').textContent = n || '';
  const p = $('#p-anfragen');
  p.innerHTML = `<h2>Probetrainings</h2><p class="hint">Alle Anfragen von der Website. Eine Mail geht zusätzlich an ${esc((D && D.studio.email) || 'das Studio')}. Anfragen werden nach 180 Tagen automatisch gelöscht.</p>` +
    (bookings.length ? bookings.map(b => {
      const tel = (b.phone || '').replace(/[^\d+]/g, ''), wa = tel.replace(/^\+/, '').replace(/^0/, '49');
      const waTxt = encodeURIComponent(`Hi ${b.name.split(' ')[0]}, hier ist das Studio68 Heddesheim. Dein Probetraining (${b.discName}${b.slot ? ', ' + b.slot.split(' · ').slice(0, 2).join(' · ') : ''}) ist bestätigt. Bring Sportkleidung, Wasser und ein Handtuch mit. Bis dann!`);
      const created = new Date(b.created);
      return `<div class="bk ${b.status === 'neu' ? 'neu' : ''}" data-id="${b.id}">
        <div class="bk-h"><b>${esc(b.name)}</b><span class="bk-meta">${isNaN(created) ? '' : created.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="bk-what"><strong>${esc(b.discName || b.disc)}</strong> · ${esc(b.slot || 'Termin nach Absprache')}</div>
        <div class="bk-meta">Erfahrung: ${esc(b.level || '–')}${b.age ? ' · Kind ' + esc(b.age) + ' J.' : ''}${b.phone ? ' · ' + esc(b.phone) : ''}${b.email ? ' · ' + esc(b.email) : ''}</div>
        ${b.msg ? `<div class="bk-meta" style="color:var(--tx)">„${esc(b.msg)}“</div>` : ''}
        <div class="st">${STATI.map(([v, l]) => `<button class="${b.status === v ? 'on' : ''}" data-st="${v}">${l}</button>`).join('')}</div>
        <div class="row">${tel ? `<a class="b b-sm" href="tel:${esc(tel)}">Anrufen</a><a class="b b-sm" target="_blank" rel="noopener" href="https://wa.me/${esc(wa)}?text=${waTxt}">WhatsApp</a>` : ''}
          ${b.email ? `<a class="b b-sm" href="mailto:${esc(b.email)}?subject=${encodeURIComponent('Dein Probetraining im Studio68')}">E-Mail</a>` : ''}<span class="sp"></span>
          <button class="b b-red b-sm" data-delb>Löschen</button></div>
      </div>`;
    }).join('') : '<div class="empty">Noch keine Anfragen.</div>');
  p.onclick = async e => {
    const card = e.target.closest('.bk'); if (!card) return;
    const id = card.dataset.id, b = bookings.find(x => x.id === id);
    const st = e.target.closest('[data-st]');
    if (st) { try { await api('booking', { id, status: st.dataset.st }); b.status = st.dataset.st; renderAnfragen(); toast('Gespeichert ✓'); } catch (x) { toast(x.message, true); } return; }
    if (e.target.closest('[data-delb]')) {
      if (!confirm(`Anfrage von ${b.name} endgültig löschen?`)) return;
      try { await api('booking', { id, delete: true }); bookings = bookings.filter(x => x.id !== id); renderAnfragen(); toast('Gelöscht'); } catch (x) { toast(x.message, true); }
    }
  };
}
setInterval(() => { if (!$('#app').hidden) loadBookings(); }, 120000);

// ======================================================================
// MEHR: Event, Preise, Disziplinen, Coaches, Zeiten, Kontakt, FAQ, Zugang
// ======================================================================
const fld = (label, path, val, type = 'text', extra = '') => `<label class="fld"><span>${label}</span>${type === 'area'
  ? `<textarea data-p="${path}" ${extra}>${esc(val ?? '')}</textarea>` : `<input type="${type}" data-p="${path}" value="${esc(val ?? '')}" ${extra}>`}</label>`;
function renderMehr() {
  const ev = D.event = D.event || {};
  const P = D.prices;
  let html = `<h2>Mehr</h2><p class="hint">Texte, Preise und Einstellungen. Nach dem Ändern unten „Live schalten“.</p>
  <details class="sec" open><summary>Fight Night / Event</summary><div class="sec-b">
    <div class="grid2">${fld('Überschrift', 'event.title', ev.title)}${fld('Zeile darüber', 'event.kicker', ev.kicker)}</div>
    ${fld('Datum (leer = „Termin folgt“)', 'event.date', ev.date, 'date')}
    ${fld('Text', 'event.text', ev.text, 'area')}
  </div></details>
  <details class="sec"><summary>Preise</summary><div class="sec-b">
    ${P.plans.map((pl, i) => `<div class="list-it"><div class="pr-row">${fld('Tarif', `prices.plans.${i}.name`, pl.name)}${P.durations.map(m => fld(`${m} Mon. €`, `prices.plans.${i}.prices.${m}`, pl.prices[m], 'number', 'inputmode="decimal" data-num')).join('')}</div>
      ${fld('Beschreibung', `prices.plans.${i}.desc`, pl.desc)}</div>`).join('')}
    <h3>Zusatzkosten</h3>
    ${(P.extras || []).map((x, i) => `<div class="grid2">${fld('Bezeichnung', `prices.extras.${i}.label`, x.label)}${fld('Preis', `prices.extras.${i}.value`, x.value)}</div>`).join('')}
  </div></details>
  <details class="sec"><summary>Disziplinen-Texte</summary><div class="sec-b">
    ${D.disciplines.map((d, i) => `<div class="list-it"><div class="row"><span style="width:14px;height:14px;background:${d.color}"></span><b style="font:400 22px var(--disp);text-transform:uppercase">${esc(d.name)}</b></div>
      <div class="grid2">${fld('Name', `disciplines.${i}.name`, d.name)}${fld('Unterzeile', `disciplines.${i}.sub`, d.sub)}</div>
      ${fld('Handschrift-Satz', `disciplines.${i}.tagline`, d.tagline)}
      ${fld('Text', `disciplines.${i}.text`, d.text, 'area')}
      ${fld('Punkte (eine Zeile = ein Punkt)', `disciplines.${i}.points`, (d.points || []).join('\n'), 'area', 'data-lines')}
      ${fld('Für (mit Komma getrennt)', `disciplines.${i}.for`, (d.for || []).join(', '), 'text', 'data-csv')}
      ${fld('Intensität 1–5', `disciplines.${i}.intensity`, d.intensity, 'number', 'min="1" max="5" data-num')}</div>`).join('')}
  </div></details>
  <details class="sec"><summary>Coaches</summary><div class="sec-b">
    <p class="hint">Sobald hier jemand eingetragen ist, erscheint auf der Website der Bereich „In deiner Ecke“.</p>
    ${(D.coaches || []).map((c, i) => `<div class="list-it">
      <div class="slots" style="grid-template-columns:160px 1fr">${slot('Foto', '', c.photo, `coaches.${i}.photo`)}<div style="display:grid;gap:8px">
      ${fld('Name', `coaches.${i}.name`, c.name)}${fld('Rolle / Disziplin', `coaches.${i}.role`, c.role)}</div></div>
      ${fld('Kurztext', `coaches.${i}.text`, c.text, 'area')}
      ${fld('Werte (eine Zeile: Titel: Wert)', `coaches.${i}.stats`, (c.stats || []).map(s => `${s.k}: ${s.v}`).join('\n'), 'area', 'data-stats')}
      <div class="row"><span class="sp"></span><button class="b b-red b-sm" data-delcoach="${i}">Coach entfernen</button></div></div>`).join('')}
    <button class="b b-ghost" id="addCoach">+ Coach</button>
  </div></details>
  <details class="sec"><summary>Öffnungszeiten & Kontakt</summary><div class="sec-b">
    ${D.studio.hours.map((h, i) => `<div class="list-it"><div class="chips">${ORDER.map(dw => `<button class="chip ${h.days.includes(dw) ? 'on' : ''}" data-hd="${i}" data-dw="${dw}">${DAYS[dw]}</button>`).join('')}</div>
      <div class="grid2">${fld('Von', `studio.hours.${i}.from`, h.from, 'time')}${fld('Bis', `studio.hours.${i}.to`, h.to, 'time')}</div></div>`).join('')}
    <div class="grid2">${fld('Telefon (Anzeige)', 'studio.phoneDisplay', D.studio.phoneDisplay)}${fld('Telefon (Wählnummer, +49…)', 'studio.phone', D.studio.phone)}</div>
    <div class="grid2">${fld('WhatsApp (49…)', 'studio.whatsapp', D.studio.whatsapp)}${fld('E-Mail', 'studio.email', D.studio.email, 'email')}</div>
    <div class="grid2">${fld('Instagram-Link', 'studio.instagram', D.studio.instagram, 'url')}${fld('Facebook-Link', 'studio.facebook', D.studio.facebook, 'url')}</div>
  </div></details>
  <details class="sec"><summary>Über uns</summary><div class="sec-b">
    ${fld('Überschrift', 'about.title', (D.about || {}).title)}
    ${fld('Einleitung', 'about.intro', (D.about || {}).intro, 'area')}
    ${fld('Mission (Zitat)', 'about.mission', (D.about || {}).mission, 'area')}
    ${fld('Orange markierter Teil der Mission', 'about.missionMark', (D.about || {}).missionMark)}
    ${fld('Säulen (eine Zeile: Titel: Text)', 'about.pillars', ((D.about || {}).pillars || []).map(x => `${x.t}: ${x.d}`).join('\n'), 'area', 'data-td')}
    ${fld('Was uns ausmacht (eine Zeile: Titel: Text)', 'about.values', ((D.about || {}).values || []).map(x => `${x.t}: ${x.d}`).join('\n'), 'area', 'data-td')}
    ${fld('Im Ring / Erfolge (eine Zeile: Titel: Text)', 'about.milestones', ((D.about || {}).milestones || []).map(x => `${x.t}: ${x.d}`).join('\n'), 'area', 'data-td')}
  </div></details>
  <details class="sec"><summary>Kids-Fragen (Eltern)</summary><div class="sec-b">
    ${(D.kidsFaq || []).map((f, i) => `<div class="list-it">${fld('Frage', `kidsFaq.${i}.q`, f.q)}${fld('Antwort', `kidsFaq.${i}.a`, f.a, 'area')}<div class="row"><span class="sp"></span><button class="b b-red b-sm" data-delkfaq="${i}">Entfernen</button></div></div>`).join('')}
    <button class="b b-ghost" id="addKFaq">+ Frage</button>
  </div></details>
  <details class="sec"><summary>Fragen & Antworten</summary><div class="sec-b">
    ${(D.faq || []).map((f, i) => `<div class="list-it">${fld('Frage', `faq.${i}.q`, f.q)}${fld('Antwort', `faq.${i}.a`, f.a, 'area')}<div class="row"><span class="sp"></span><button class="b b-red b-sm" data-delfaq="${i}">Entfernen</button></div></div>`).join('')}
    <button class="b b-ghost" id="addFaq">+ Frage</button>
  </div></details>
  <details class="sec"><summary>Zugang</summary><div class="sec-b">
    <form id="pwForm" class="grid2">${'<label class="fld"><span>Altes Passwort</span><input type="password" id="pwOld" autocomplete="current-password"></label><label class="fld"><span>Neues Passwort (mind. 10 Zeichen)</span><input type="password" id="pwNew" autocomplete="new-password" minlength="10"></label>'}
      <button class="b b-orange" type="submit">Passwort ändern</button></form>
    <a class="b b-ghost" id="backup" download="studio68-sicherung.json" href="#">Sicherung herunterladen</a>
  </div></details>`;
  const p = $('#p-mehr');
  const open = $$('#p-mehr details').map(d => d.open);
  p.innerHTML = html;
  if (open.length) $$('#p-mehr details').forEach((d, i) => d.open = !!open[i]);
  p.oninput = e => {
    const el = e.target, path = el.dataset.p; if (!path) return;
    let v = el.value;
    if (el.hasAttribute('data-num')) v = v === '' ? '' : Number(v);
    if (el.hasAttribute('data-lines')) v = v.split('\n').map(s => s.trim()).filter(Boolean);
    if (el.hasAttribute('data-csv')) v = v.split(',').map(s => s.trim()).filter(Boolean);
    if (el.hasAttribute('data-td')) v = v.split('\n').map(l => { const [t, ...r] = l.split(':'); return { t: t.trim(), d: r.join(':').trim() }; }).filter(x => x.t);
    if (el.hasAttribute('data-stats')) v = v.split('\n').map(l => { const [k, ...r] = l.split(':'); return { k: k.trim(), v: r.join(':').trim() }; }).filter(s => s.k);
    setP(path, v); dirty();
  };
  p.onchange = async e => {
    const inp = e.target; if (inp.type !== 'file' || !inp.files[0]) return;
    const box = inp.closest('.slot'); box.classList.add('busy');
    try { setP(inp.dataset.up, await upload(inp.files[0])); renderMehr(); dirty(); } catch (x) { box.classList.remove('busy'); toast(x.message, true); }
  };
  p.onclick = async e => {
    const t = e.target;
    const hd = t.closest('[data-hd]');
    if (hd) { const h = D.studio.hours[+hd.dataset.hd], dw = +hd.dataset.dw; h.days = h.days.includes(dw) ? h.days.filter(x => x !== dw) : [...h.days, dw].sort(); renderMehr(); dirty(); return; }
    if (t.id === 'addCoach') { (D.coaches = D.coaches || []).push({ name: '', role: '', text: '', photo: '', stats: [] }); renderMehr(); dirty(); return; }
    if (t.dataset.delcoach !== undefined) { if (confirm('Coach entfernen?')) { D.coaches.splice(+t.dataset.delcoach, 1); renderMehr(); dirty(); } return; }
    if (t.id === 'addKFaq') { (D.kidsFaq = D.kidsFaq || []).push({ q: '', a: '' }); renderMehr(); dirty(); return; }
    if (t.dataset.delkfaq !== undefined) { D.kidsFaq.splice(+t.dataset.delkfaq, 1); renderMehr(); dirty(); return; }
    if (t.id === 'addFaq') { (D.faq = D.faq || []).push({ q: '', a: '' }); renderMehr(); dirty(); return; }
    if (t.dataset.delfaq !== undefined) { D.faq.splice(+t.dataset.delfaq, 1); renderMehr(); dirty(); return; }
    const rm = t.closest('[data-rm]'); if (rm) { setP(rm.dataset.rm, ''); renderMehr(); dirty(); return; }
    if (t.id === 'backup') { t.href = URL.createObjectURL(new Blob([JSON.stringify(D, null, 2)], { type: 'application/json' })); }
  };
  $('#pwForm').addEventListener('submit', async e => {
    e.preventDefault();
    try { await api('password', { old: $('#pwOld').value, new: $('#pwNew').value }); $('#pwOld').value = $('#pwNew').value = ''; toast('Passwort geändert ✓'); }
    catch (x) { toast(x.message, true); }
  });
}
