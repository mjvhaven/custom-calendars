import React, { useState } from 'react';
import { X } from 'lucide-react';
import { C, uid, REAL_MONTHS, monthKeyOf, weekdayLabels, weekLengthOf } from './calendar_utils.js';

export default function EventFormModal({ cal, year, monthIndex, initialDay, onClose, onSave }) {
  const [label, setLabel] = useState('');
  const [recur, setRecur] = useState('once');
  const [evYear, setEvYear] = useState(year);
  const [monthKey, setMonthKey] = useState(monthKeyOf(cal, monthIndex));
  const [day, setDay] = useState(initialDay || 1);
  const [weekdays, setWeekdays] = useState([]);
  const [timeHours, setTimeHours] = useState(0);

  const monthOptions = cal.kind === 'earth' ? REAL_MONTHS.map((n, i) => ({ id: String(i), name: n })) : cal.months;
  const wLabels = weekdayLabels(cal);
  const wLen = weekLengthOf(cal);
  const maxDay = cal.kind === 'earth'
    ? new Date(Date.UTC(evYear, Number(monthKey) + 1, 0)).getUTCDate()
    : (cal.months.find(m => m.id === monthKey)?.length || 31);
  const dayLenHours = cal.sync ? 86400000 / cal.sync.daysPerEarthDay / 3600000 : 24;

  const toggleWeekday = (i) => setWeekdays(weekdays.includes(i) ? weekdays.filter(x => x !== i) : [...weekdays, i].sort((a, b) => a - b));
  const toggleAll = () => setWeekdays(weekdays.length === wLen ? [] : Array.from({ length: wLen }, (_, i) => i));

  const save = () => {
    if (!label.trim()) return;
    if (recur === 'weekly') {
      if (weekdays.length === 0) return;
      onSave({ label: label.trim(), recur: 'weekly', weekdays });
    } else if (recur === 'daily') {
      onSave({ label: label.trim(), recur: 'daily', timeHours: Number(timeHours) || 0 });
    } else if (recur === 'annual') {
      onSave({ label: label.trim(), recur: 'annual', monthKey, day: Number(day), timeHours: Number(timeHours) || 0 });
    } else {
      onSave({ label: label.trim(), recur: 'once', year: Number(evYear), monthKey, day: Number(day), timeHours: Number(timeHours) || 0 });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: '12px', padding: '1.25rem', width: '100%', maxWidth: '24rem', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ color: C.gold, fontFamily: 'serif', fontSize: '0.875rem' }}>New event</div>
          <button onClick={onClose} style={{ color: C.slate, background: 'transparent', border: 'none' }}><X size={16} /></button>
        </div>

        <label style={{ color: C.slate, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Label</label>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Moon festival, brother's birthday"
          style={{ width: '100%', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '0.75rem' }} />

        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
          {['once', 'annual', 'daily', 'weekly'].map(r => (
            <button key={r} onClick={() => setRecur(r)}
              style={{ flex: 1, background: recur === r ? C.gold : C.bg, color: recur === r ? '#1a1f35' : C.parchmentDim, border: `1px solid ${C.line}`, borderRadius: '6px', padding: '0.5rem 0.25rem', fontSize: '11px', cursor: 'pointer' }}>
              {r === 'once' ? 'One time' : r === 'annual' ? 'Yearly' : r === 'daily' ? 'Daily' : 'Weekly'}
            </button>
          ))}
        </div>

        {recur === 'weekly' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase' }}>Which days</span>
              <button onClick={toggleAll} style={{ color: C.gold, background: 'transparent', border: 'none', fontSize: '11px' }}>{weekdays.length === wLen ? 'Clear' : 'Every day'}</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {wLabels.map((w, i) => (
                <button key={i} onClick={() => toggleWeekday(i)}
                  style={{ background: weekdays.includes(i) ? C.gold : C.bg, color: weekdays.includes(i) ? '#1a1f35' : C.parchmentDim, border: `1px solid ${C.line}`, borderRadius: '6px', padding: '0.375rem 0.5rem', fontSize: '11px', cursor: 'pointer' }}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {recur === 'once' && (
                <input type="number" value={evYear} onChange={e => setEvYear(e.target.value)}
                  style={{ width: '4rem', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'monospace' }} title="Year" />
              )}
              <select value={monthKey} onChange={e => setMonthKey(e.target.value)} style={{ flex: 1, background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                {monthOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input type="number" min="1" max={maxDay} value={day} onChange={e => setDay(e.target.value)}
                style={{ width: '4rem', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'monospace' }} />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ color: C.slate, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Time within day (0–{dayLenHours.toFixed(1)}h)</label>
              <input type="number" min="0" max={dayLenHours} step="0.5" value={timeHours} onChange={e => setTimeHours(e.target.value)}
                style={{ width: '6rem', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'monospace' }} />
            </div>
          </>
        )}

        <button onClick={save} disabled={!label.trim() || (recur === 'weekly' && weekdays.length === 0)}
          style={{ width: '100%', background: label.trim() ? C.gold : C.line, color: label.trim() ? '#1a1f35' : C.parchmentDim, border: 'none', borderRadius: '6px', padding: '0.625rem', fontSize: '0.875rem', fontWeight: 500, marginTop: '1rem', cursor: label.trim() ? 'pointer' : 'not-allowed' }}>
          Save
        </button>
      </div>
    </div>
  );
}
