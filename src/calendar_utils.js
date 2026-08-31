import React from 'react';

export const C = {
  bg: '#151a2e',
  panel: '#1c2340',
  panel2: '#242c4d',
  line: '#343c62',
  parchment: '#f1e7d2',
  parchmentDim: '#a9a293',
  gold: '#c9a86a',
  goldDim: '#8a7550',
  rust: '#b06a4c',
  slate: '#8b93b0',
  danger: '#c1584f',
  success: '#6abf6a',
};

export const uid = () => Math.random().toString(36).slice(2, 10);
export const REAL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const REAL_WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const EARTH_CAL = { id: 'earth', kind: 'earth', name: 'Earth', weekLength: 7, tasksEnabled: true };

export function zindarinDefault() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: 'zindarin',
    kind: 'custom',
    name: 'Zindarin',
    weekLength: 10,
    months: [
      { id: uid(), name: 'First Month', length: 50 },
      { id: uid(), name: 'Second Month', length: 50 },
      { id: uid(), name: 'Third Month', length: 50 },
      { id: uid(), name: 'Fourth Month', length: 50 },
    ],
    tasksEnabled: false,
    sync: { daysPerEarthDay: 4, anchorYear: 1, anchorMonthIndex: 0, anchorDay: 1, realDate: today, realTime: '00:00' },
  };
}

export function yearLength(cal) { return cal.months.reduce((s, m) => s + m.length, 0); }
export function monthCountOf(cal) { return cal.kind === 'earth' ? 12 : cal.months.length; }
export function weekLengthOf(cal) { return cal.kind === 'earth' ? 7 : cal.weekLength; }

export function monthStartAbsDay(cal, year, monthIndex) {
  const yLen = yearLength(cal);
  let before = 0;
  for (let i = 0; i < monthIndex; i++) before += cal.months[i].length;
  return (year - 1) * yLen + before;
}

export function absDayFor(cal, year, monthIndex, day) {
  if (cal.kind === 'earth') return Math.floor(Date.UTC(year, monthIndex, day) / 86400000);
  return monthStartAbsDay(cal, year, monthIndex) + (day - 1);
}

export function weekdayIndexOf(cal, year, monthIndex, day) {
  if (cal.kind === 'earth') return new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
  const wLen = cal.weekLength;
  return ((absDayFor(cal, year, monthIndex, day) % wLen) + wLen) % wLen;
}

export function getMonthInfo(cal, year, monthIndex) {
  if (cal.kind === 'earth') {
    return {
      name: REAL_MONTHS[monthIndex],
      numDays: new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate(),
      lead: new Date(Date.UTC(year, monthIndex, 1)).getUTCDay(),
    };
  }
  const m = cal.months[monthIndex];
  return {
    name: m.name,
    numDays: m.length,
    lead: (((monthStartAbsDay(cal, year, monthIndex)) % cal.weekLength) + cal.weekLength) % cal.weekLength,
  };
}

export function absDayToYMD(cal, absDay) {
  const yLen = yearLength(cal);
  const year = Math.floor(absDay / yLen) + 1;
  let rem = absDay - (year - 1) * yLen;
  let monthIndex = 0;
  for (; monthIndex < cal.months.length - 1; monthIndex++) {
    if (rem < cal.months[monthIndex].length) break;
    rem -= cal.months[monthIndex].length;
  }
  return { year, monthIndex, day: rem + 1 };
}

export function dayLengthMs(cal) { return 86400000 / cal.sync.daysPerEarthDay; }
export function epochMsOf(cal) {
  const anchorAbsDay = absDayFor(cal, cal.sync.anchorYear, cal.sync.anchorMonthIndex, cal.sync.anchorDay);
  const anchorRealMs = new Date(`${cal.sync.realDate}T${cal.sync.realTime || '00:00'}`).getTime();
  return anchorRealMs - anchorAbsDay * dayLengthMs(cal);
}
export function realWindowForDay(cal, year, monthIndex, day, timeHours) {
  const dLen = dayLengthMs(cal);
  const epoch = epochMsOf(cal);
  const absDay = absDayFor(cal, year, monthIndex, day);
  const startMs = epoch + absDay * dLen + ((timeHours || 0) * 3600000);
  return { startMs, endMs: startMs + dLen };
}
export function formatEarthNote(startMs, endMsExclusive) {
  const s = new Date(startMs);
  const e = new Date(endMsExclusive - 1);
  const sameDay = s.toDateString() === e.toDateString();
  const sameMonth = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();
  if (sameDay) return `Earth: ${MONTH_ABBR[s.getMonth()]} ${s.getDate()}, ${e.getFullYear()}`;
  if (sameMonth) return `Earth: ${MONTH_ABBR[s.getMonth()]} ${s.getDate()}-${e.getDate()}, ${e.getFullYear()}`;
  return `Earth: ${MONTH_ABBR[s.getMonth()]} ${s.getDate()} - ${MONTH_ABBR[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
}

export function todayPositionFor(cal) {
  if (cal.kind === 'earth') {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth(), day: now.getDate() };
  }
  if (!cal.sync) return null;
  const dLen = dayLengthMs(cal);
  const epoch = epochMsOf(cal);
  const absDay = Math.floor((Date.now() - epoch) / dLen);
  return absDayToYMD(cal, absDay);
}

export function isSameDay(a, b) { return a && b && a.year === b.year && a.monthIndex === b.monthIndex && a.day === b.day; }
export function dayKey(cal, year, monthIndex, day) {
  if (cal.kind === 'earth') return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return `${year}-${monthIndex}-${day}`;
}
export function monthKeyOf(cal, monthIndex) { return cal.kind === 'earth' ? String(monthIndex) : cal.months[monthIndex].id; }

export function eventFallsOn(ev, cal, year, monthIndex, day) {
  const mk = monthKeyOf(cal, monthIndex);
  if (ev.recur === 'once') return ev.year === year && ev.monthKey === mk && ev.day === day;
  if (ev.recur === 'annual') return ev.monthKey === mk && ev.day === day;
  if (ev.recur === 'daily') return true;
  if (ev.recur === 'weekly') return ev.weekdays.includes(weekdayIndexOf(cal, year, monthIndex, day));
  return false;
}

export function weekdayLabels(cal) {
  if (cal.kind === 'earth') return REAL_WEEKDAYS;
  const arr = [];
  for (let i = 0; i < cal.weekLength; i++) arr.push(`Day ${i + 1}`);
  return arr;
}

export async function loadJSON(key, fallback) {
  try {
    const res = await window.storage.get(key, false);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) { }
  return fallback;
}
export async function saveJSON(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), false); } catch (e) { }
}

export function checkContrast(fg, bg, minRatio = 4.5) {
  const lum = (hex) => {
    const rgb = hex.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16) / 255);
    const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(rgb[0]) + 0.7152 * toLinear(rgb[1]) + 0.0722 * toLinear(rgb[2]);
  };
  const L1 = lum(fg);
  const L2 = lum(bg);
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  return { pass: ratio >= minRatio, ratio: ratio.toFixed(2) + ':1' };
}
