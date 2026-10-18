// R8: Probetraining als "Kampfvertrag" (Lückentext-Formular)
import { DAYS, now, hm, key, ddmm, addDays, minsOf, occurrences, matches, discById, esc } from './data.js';

export function initBooking(data, { bell }) {
  const form = document.getElementById('contract');
  const discChips = document.getElementById('discChips'), slotChips = document.getElementById('slotChips');
  const pickDisc = document.getElementById('pickDisc'), pickSlot = document.getElementById('pickSlot');
  const sig = document.getElementById('ctSig'), err = document.getElementById('ctErr'), go = document.getElementById('ctGo');
  const kid = document.getElementById('kidAge');
  const st = { disc: null, slot: null, level: 'keine' };
  const t0 = now();
  document.getElementById('ctDate').textContent = `HEDDESHEIM, ${ddmm(t0)}${t0.getFullYear()}`;
  document.getElementById('ctNo').textContent = `068-${String(Math.floor(1000 + Math.random() * 8999))}`;

  discChips.innerHTML = data.disciplines.map(d => `<button type="button" class="ct-chip" role="option" data-id="${d.id}" style="--c:${d.color}"><i></i>${esc(d.name)}</button>`).join('');
  discChips.addEventListener('click', e => { const b = e.target.closest('.ct-chip'); if (b) setDisc(b.dataset.id); });
  pickDisc.addEventListener('click', () => discChips.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  pickSlot.addEventListener('click', () => slotChips.scrollIntoView({ block: 'center', behavior: 'smooth' }));

  function slotsFor(d) {
    const t = now(), today = new Date(t.getFullYear(), t.getMonth(), t.getDate()), nm = minsOf(t), tk = key(t);
    if (d.open) {
      const out = [];
      for (let i = 0; out.length < 8 && i < 14; i++) {
        const day = addDays(today, i), h = data.studio.hours.find(x => x.days.includes(day.getDay()));
        if (!h || (i === 0 && nm > hm(h.to) - 60)) continue;
        out.push({ id: 'open', key: key(day), label: `${DAYS[day.getDay()]} ${ddmm(day)}`, sub: `${h.from}–${h.to} · freies Training`, time: h.from, date: day });
      }
      return out;
    }
    return occurrences(data, today, 22, c => matches(d, c))
      .filter(o => !(o.key === tk && o.start <= nm + 20))
      .slice(0, 10)
      .map(o => ({ id: o.cls.id, key: o.key, label: `${DAYS[o.date.getDay()]} ${ddmm(o.date)} · ${o.cls.start}`, sub: `${o.cls.title} · ${o.cls.level || ''}`, time: o.cls.start, end: o.cls.end, date: o.date, x: o.cancelled, reason: o.reason }));
  }

  function setDisc(id, pre) {
    const d = discById(data, id); if (!d) return;
    st.disc = d; st.slot = null;
    discChips.querySelectorAll('.ct-chip').forEach(b => b.classList.toggle('on', b.dataset.id === id));
    pickDisc.textContent = d.name; pickDisc.classList.add('set');
    kid.hidden = id !== 'kids';
    const sl = slotsFor(d);
    slotChips.innerHTML = sl.length ? sl.map((s, i) => `<button type="button" class="ct-slot ${s.x ? 'x' : ''}" data-i="${i}" ${s.x ? `disabled title="Fällt aus: ${esc(s.reason || '')}"` : ''}><b>${esc(s.label)}</b><span>${s.x ? 'Fällt aus' + (s.reason ? ': ' + esc(s.reason) : '') : esc(s.sub)}</span></button>`).join('')
      : '<div class="ct-slots-empty">Gerade keine Termine eingetragen. Schick trotzdem ab, wir melden uns mit einem Termin.</div>';
    slotChips._slots = sl;
    pickSlot.disabled = false; pickSlot.textContent = 'Termin wählen'; pickSlot.classList.remove('set');
    if (pre) {
      const i = sl.findIndex(s => s.id === pre.classId && s.key === pre.key);
      if (i >= 0) setSlot(i);
    }
  }
  function setSlot(i) {
    const s = slotChips._slots[i]; if (!s || s.x) return;
    st.slot = s;
    slotChips.querySelectorAll('.ct-slot').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    pickSlot.textContent = s.label; pickSlot.classList.add('set');
  }
  slotChips.addEventListener('click', e => { const b = e.target.closest('.ct-slot'); if (b) setSlot(+b.dataset.i); });

  document.getElementById('lvlSeg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    st.level = b.dataset.v;
    b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  });
  const nameIn = document.getElementById('fName');
  nameIn.addEventListener('input', () => { sig.textContent = nameIn.value.trim(); });

  function ics(s, d) {
    const p = n => String(n).padStart(2, '0');
    const dt = (date, t) => `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}T${t.replace(':', '')}00`;
    const end = s.end || (() => { const m = hm(s.time) + 60; return `${p(Math.floor(m / 60))}:${p(m % 60)}`; })();
    const loc = `${data.studio.street}\\, ${data.studio.zip} ${data.studio.city}`;
    const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Studio68//Probetraining//DE', 'BEGIN:VEVENT',
      `UID:${Date.now()}@studio68-heddesheim.de`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART:${dt(s.date, s.time)}`, `DTEND:${dt(s.date, end)}`,
      `SUMMARY:Probetraining ${d.name} · Studio68`, `LOCATION:${loc}`,
      'DESCRIPTION:Sportkleidung\\, Getränk und Handtuch mitbringen. Bis dann!', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return URL.createObjectURL(new Blob([txt], { type: 'text/calendar' }));
  }
  function waText(f) {
    const s = st.slot;
    return `Hi Studio68! Ich möchte ein Probetraining machen: ${st.disc ? st.disc.name : ''}${s ? `, ${s.label}` : ''}. Name: ${f.name}${f.phone ? `, Tel. ${f.phone}` : ''}.`;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.classList.contains('signed')) return;
    const fd = new FormData(form);
    const f = Object.fromEntries(['name', 'phone', 'email', 'msg', 'age', 'website'].map(k => [k, String(fd.get(k) || '').trim()]));
    const fail = m => { err.textContent = m; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
    if (f.name.length < 2) return fail('Wie heißt du? Ohne Namen kein Vertrag.');
    if (!st.disc) return fail('Wähle eine Disziplin.');
    if (!st.slot && slotChips._slots && slotChips._slots.some(s => !s.x)) return fail('Wähle einen Termin.');
    if (!f.phone && !f.email) return fail('Telefon oder E-Mail, damit wir dich erreichen.');
    if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return fail('Die E-Mail sieht nicht richtig aus.');
    if (!document.getElementById('fConsent').checked) return fail('Bitte die Einwilligung ankreuzen.');
    err.textContent = '';
    go.disabled = true; go.firstChild.textContent = 'Wird unterschrieben … ';
    const s = st.slot;
    const payload = { ...f, disc: st.disc.id, discName: st.disc.name, classId: s ? s.id : '', date: s ? s.key : '', time: s ? s.time : '', slotLabel: s ? `${s.label} · ${s.sub}` : 'Termin nach Absprache', level: st.level, consent: true };
    let ok = false, msg = '', demo = false;
    try {
      const r = await fetch('api.php?a=book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      ok = r.ok && j.ok; msg = j.error || '';
      demo = r.status === 404 || r.status === 405;      // Vorschau ohne PHP
    } catch (x) { msg = ''; }
    if (demo) ok = true;
    go.disabled = false; go.firstChild.textContent = 'Kampfvertrag unterschreiben ';
    const wa = `https://wa.me/${data.studio.whatsapp}?text=${encodeURIComponent(waText(f))}`;
    if (!ok) {
      err.innerHTML = `${esc(msg || 'Das Senden hat nicht geklappt.')} <a href="${wa}" target="_blank" rel="noopener">Per WhatsApp schicken →</a>`;
      return;
    }
    form.classList.add('signed');
    bell && bell();
    const done = document.getElementById('ctDone');
    document.getElementById('ctDoneTxt').textContent = demo
      ? 'Vorschau-Version: Diese Anfrage wurde NICHT gesendet. Auf der fertigen Website landet sie beim Studio (Mail + Admin). Bis dahin bitte per WhatsApp.'
      : s ? `${st.disc.name}, ${s.label}. Wir bestätigen dir den Termin${f.phone ? ' per Telefon/WhatsApp' : ' per E-Mail'}. Bring Sportkleidung, Wasser und ein Handtuch mit.`
      : `${st.disc.name}. Wir melden uns mit einem Termin.`;
    const icsBtn = document.getElementById('icsBtn');
    if (s) icsBtn.href = ics(s, st.disc); else icsBtn.hidden = true;
    document.getElementById('waConfirm').href = wa;
    done.hidden = false;
    form.querySelectorAll('input,textarea,.ct-chip,.ct-slot,.ct-seg button,.ct-pick').forEach(x => x.disabled = true);
    go.hidden = true;
  });

  return {
    prefill(o) {
      if (o.disc) setDisc(o.disc, o);
      document.getElementById('probetraining').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => { if (!nameIn.value) nameIn.focus({ preventScroll: true }); }, 900);
    }
  };
}
