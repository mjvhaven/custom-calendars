import React, { useState } from 'react';
import { X, CalendarDays, ArrowUp, ArrowDown, Save, Link2, Plus } from 'lucide-react';
import { C, uid } from './calendar_utils.js';

export default function SettingsModal({ cal, onClose, onSave, onRemove }) {
  const isEarth = cal.kind === 'earth';
  const [name, setName] = useState(cal.name);
  const [tasksEnabled, setTasksEnabled] = useState(!!cal.tasksEnabled);
  const [weekLength, setWeekLength] = useState(cal.weekLength || 7);
  const [months, setMonths] = useState(isEarth ? [] : cal.months.map(m => ({ ...m })));
  const [syncOn, setSyncOn] = useState(!!cal.sync);
  const [daysPerEarthDay, setDaysPerEarthDay] = useState(cal.sync?.daysPerEarthDay || 1);
  const [anchorYear, setAnchorYear] = useState(cal.sync?.anchorYear || 1);
  const [anchorMonthId, setAnchorMonthId] = useState(cal.sync ? cal.months[cal.sync.anchorMonthIndex]?.id : (cal.months?.[0]?.id));
  const [anchorDay, setAnchorDay] = useState(cal.sync?.anchorDay || 1);
  const [realDate, setRealDate] = useState(cal.sync?.realDate || new Date().toISOString().slice(0, 10));
  const [realTime, setRealTime] = useState(cal.sync?.realTime || '00:00');

  const updateMonth = (id, field, value) => setMonths(months.map(m => m.id === id ? { ...m, [field]: value } : m));
  const removeMonth = (id) => setMonths(months.filter(m => m.id !== id));
  const addMonth = () => setMonths([...months, { id: uid(), name: '', length: 30 }]);
  const move = (index, dir) => {
    const next = [...months]; const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    setMonths(next);
  };

  const canSave = isEarth ? name.trim() : (name.trim() && months.length > 0 && months.every(m => m.name.trim() && Number(m.length) > 0) && Number(weekLength) > 0);

  const save = () => {
    console.log('SAVE BUTTON CLICKED');
    if (isEarth) { 
      console.log('Saving Earth calendar');
      onSave({ ...cal, name: name.trim(), tasksEnabled }); 
      return; 
    }
    const next = {
      ...cal, name: name.trim(), weekLength: Number(weekLength),
      months: months.map(m => ({ id: m.id, name: m.name.trim(), length: Number(m.length) })),
      tasksEnabled,
    };
    console.log('Calendar to save:', next);
    if (syncOn) {
      const anchorMonthIndex = Math.max(0, next.months.findIndex(m => m.id === anchorMonthId));
      next.sync = { daysPerEarthDay: Number(daysPerEarthDay), anchorYear: Number(anchorYear), anchorMonthIndex, anchorDay: Number(anchorDay), realDate, realTime };
    } else {
      delete next.sync;
    }
    console.log('Calling onSave');
    onSave(next);
    console.log('onSave called');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: '12px', padding: '1.25rem', width: '100%', maxWidth: '28rem', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ color: C.gold, fontFamily: 'serif', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarDays size={14} /> Edit {cal.name}</div>
          <button onClick={onClose} style={{ color: C.slate, background: 'transparent', border: 'none' }}><X size={16} /></button>
        </div>

        <label style={{ color: C.slate, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '0.75rem' }} />

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={tasksEnabled} onChange={e => setTasksEnabled(e.target.checked)} />
          <span style={{ color: C.parchment, fontSize: '0.875rem' }}>Enable daily task lists on this calendar</span>
        </label>

        {!isEarth && (
          <>
            <label style={{ color: C.slate, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Days per week</label>
            <input type="number" min="1" value={weekLength} onChange={e => setWeekLength(e.target.value)} style={{ width: '7rem', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem', fontFamily: 'monospace' }} />

            <div style={{ color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Months</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {months.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button onClick={() => move(i, -1)} disabled={i === 0} style={{ color: i === 0 ? C.line : C.slate, background: 'transparent', border: 'none' }}><ArrowUp size={12} /></button>
                    <button onClick={() => move(i, 1)} disabled={i === months.length - 1} style={{ color: i === months.length - 1 ? C.line : C.slate, background: 'transparent', border: 'none' }}><ArrowDown size={12} /></button>
                  </div>
                  <input value={m.name} onChange={e => updateMonth(m.id, 'name', e.target.value)} style={{ flex: 1, background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem' }} />
                  <input type="number" min="1" value={m.length} onChange={e => updateMonth(m.id, 'length', e.target.value)} style={{ width: '4rem', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'monospace' }} />
                  <button onClick={() => removeMonth(m.id)} disabled={months.length <= 1} style={{ color: months.length <= 1 ? C.line : C.danger, background: 'transparent', border: 'none' }}><X size={16} /></button>
                </div>
              ))}
            </div>
            <button onClick={addMonth} style={{ width: '100%', color: C.gold, border: `1px dashed ${C.goldDim}`, background: 'transparent', borderRadius: '6px', padding: '0.5rem', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}><Plus size={14} /> Add month</button>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={syncOn} onChange={e => setSyncOn(e.target.checked)} />
              <span style={{ color: C.parchment, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Link2 size={13} /> Link this calendar to Earth time</span>
            </label>

            {syncOn && (
              <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem' }}>
                <label style={{ color: C.slate, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Days of this calendar per 1 Earth day</label>
                <input type="number" min="0.01" step="any" value={daysPerEarthDay} onChange={e => setDaysPerEarthDay(e.target.value)}
                  style={{ width: '6rem', background: C.panel, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.375rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '0.75rem', fontFamily: 'monospace' }} />

                <div style={{ color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>This date on {cal.name || name}</div>
                <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
                  <input type="number" value={anchorYear} onChange={e => setAnchorYear(e.target.value)} style={{ width: '3.5rem', background: C.panel, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.375rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace' }} title="Year" />
                  <select value={anchorMonthId} onChange={e => setAnchorMonthId(e.target.value)} style={{ flex: 1, background: C.panel, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.375rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                    {months.map(m => <option key={m.id} value={m.id}>{m.name || '(unnamed)'}</option>)}
                  </select>
                  <input type="number" min="1" value={anchorDay} onChange={e => setAnchorDay(e.target.value)} style={{ width: '3.5rem', background: C.panel, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.375rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace' }} title="Day" />
                </div>

                <div style={{ color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>= this Earth date &amp; time</div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <input type="date" value={realDate} onChange={e => setRealDate(e.target.value)} style={{ flex: 1, background: C.panel, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.375rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }} />
                  <input type="time" value={realTime} onChange={e => setRealTime(e.target.value)} style={{ width: '6rem', background: C.panel, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.375rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }} />
                </div>
                <p style={{ color: C.parchmentDim, fontSize: '11px', marginTop: '0.5rem' }}>You can come back and adjust this anchor point anytime.</p>
              </div>
            )}
          </>
        )}

        <button onClick={save} disabled={!canSave} style={{ width: '100%', background: canSave ? C.gold : C.line, color: canSave ? '#1a1f35' : C.parchmentDim, border: 'none', borderRadius: '6px', padding: '0.625rem', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: canSave ? 'pointer' : 'not-allowed' }}>
          <Save size={14} /> Save changes
        </button>
        {onRemove && <button onClick={onRemove} style={{ width: '100%', color: C.danger, border: `1px solid ${C.danger}`, background: 'transparent', borderRadius: '6px', padding: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>Delete this calendar</button>}
      </div>
    </div>
  );
}
