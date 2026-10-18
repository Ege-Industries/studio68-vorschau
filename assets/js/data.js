// Daten laden + Zeit-/Plan-Helfer (alles in Berliner Ortszeit)
export const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export const DAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export async function loadData() {
  try {
    const r = await fetch('data/site.json?v=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.warn('site.json nicht geladen', e);
    return null;
  }
}

// "Jetzt" als Date, dessen lokale Felder der Berliner Uhrzeit entsprechen
export function now() {
  const d = new Date();
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(d).map(x => [x.type, x.value]));
    return new Date(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  } catch { return d; }
}
export const hm = s => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
export const fmtHM = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
export const pad = n => String(n).padStart(2, '0');
export const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const ddmm = d => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.`;
export const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; };
export const startOfWeek = d => addDays(d, -((d.getDay() + 6) % 7));
export const minsOf = d => d.getHours() * 60 + d.getMinutes();

export function discById(data, id) { return data.disciplines.find(d => d.id === id); }
export function matches(disc, cls) {
  if (disc.match && disc.match.length) return (cls.tags || []).some(t => disc.match.includes(t));
  return cls.disc === disc.id;
}
export function cancellation(data, clsId, dateKey) {
  return (data.cancellations || []).find(c => c.classId === clsId && c.date === dateKey);
}

// alle Termine ab Datum für n Tage
export function occurrences(data, from, days, filter) {
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i), k = key(d), dow = d.getDay();
    for (const c of data.schedule) {
      if (c.day !== dow) continue;
      if (filter && !filter(c)) continue;
      const x = cancellation(data, c.id, k);
      out.push({ cls: c, date: d, key: k, start: hm(c.start), end: hm(c.end), cancelled: !!x, reason: x ? x.reason : '' });
    }
  }
  return out.sort((a, b) => a.date - b.date || a.start - b.start);
}

export function openState(data, t = now()) {
  const dow = t.getDay(), m = minsOf(t);
  const today = data.studio.hours.find(h => h.days.includes(dow));
  if (today && m >= hm(today.from) && m < hm(today.to)) return { open: true, label: `Geöffnet bis ${today.to}`, short: `Offen bis ${today.to}` };
  for (let i = 0; i < 8; i++) {
    const d = addDays(t, i), h = data.studio.hours.find(x => x.days.includes(d.getDay()));
    if (!h) continue;
    if (i === 0 && m >= hm(h.from)) continue;
    const when = i === 0 ? 'heute' : i === 1 ? 'morgen' : DAYS[d.getDay()];
    return { open: false, label: `Geschlossen · öffnet ${when} ${h.from}`, short: `Zu · ${when} ${h.from}` };
  }
  return { open: false, label: 'Geschlossen', short: 'Geschlossen' };
}

// läuft gerade / als nächstes (Ausfälle übersprungen)
export function liveInfo(data, t = now()) {
  const m = minsOf(t), today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const occ = occurrences(data, today, 8).filter(o => !o.cancelled);
  const running = occ.filter(o => o.key === key(t) && o.start <= m && o.end > m);
  const next = occ.find(o => (o.date > today) || (o.key === key(t) && o.start > m));
  let inMin = null;
  if (next) inMin = Math.round(((next.date - today) / 60000) + next.start - m);
  return { running, next, inMin };
}

export function dur(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), r = min % 60;
  if (h < 24) return r ? `${h} h ${r} min` : `${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? '1 Tag' : `${d} Tagen`;
}
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
