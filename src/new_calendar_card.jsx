import React, { useState } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';
import { C, uid } from './calendar_utils.js';

export default function NewCalendarCard({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [weekLength, setWeekLength] = useState(7);
  const [months, setMonths] = useState([{ id: uid(), name: '', length: 30 }]);
  const [tasksEnabled, setTasksEnabled] = useState(false);

  const updateMonth = (id, field, value) => setMonths(months.map(m => m.id === id ? { ...m, [field]: value } : m));
  const removeMonth = (id) => setMonths(months.filter(m => m.id !== id));
  const addMonth = () => setMonths([...months, { id: uid(), name: '', length: 30 }]);
  const canCreate = name.trim() && months.length > 0 && months.every(m => m.name.trim() && Number(m.length) > 0) && Number(weekLength) > 0;

  const create = () => {
    onCreate({
      id: uid(), kind: 'custom', name: name.trim(), weekLength: Number(weekLength),
      months: months.map(m => ({ id: m.id, name: m.name.trim(), length: Number(m.length) })),
      tasksEnabled,
    });
  };

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: '12px', padding: '1rem', height: '100%', maxHeight: '600px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ color: C.gold, fontFamily: 'serif', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={14} /> New calendar</div>
        <button onClick={onCancel} style={{ color: C.slate, background: 'transparent', border: 'none' }}><X size={16} /></button>
      </div>

      <label style={{ color: C.slate, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Calendar name" style={{ width: '100%', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '0.75rem' }} />

      <label style={{ color: C.slate, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Days per week</label>
      <input type="number" min="1" value={weekLength} onChange={e => setWeekLength(e.target.value)} style={{ width: '7rem', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem', fontFamily: 'monospace' }} />

      <div style={{ color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Months</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {months.map((m, i) => (
          <div key={m.id} style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <span style={{ color: C.parchmentDim, fontFamily: 'monospace', fontSize: '0.75rem', width: '1rem' }}>{i + 1}</span>
            <input value={m.name} onChange={e => updateMonth(m.id, 'name', e.target.value)} placeholder="Month name" style={{ flex: 1, background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem' }} />
            <input type="number" min="1" value={m.length} onChange={e => updateMonth(m.id, 'length', e.target.value)} style={{ width: '3.5rem', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'monospace' }} />
            <button onClick={() => removeMonth(m.id)} disabled={months.length <= 1} style={{ color: months.length <= 1 ? C.line : C.danger, background: 'transparent', border: 'none' }}><X size={14} /></button>
          </div>
        ))}
      </div>
      <button onClick={addMonth} style={{ width: '100%', color: C.gold, border: `1px dashed ${C.goldDim}`, background: 'transparent', borderRadius: '6px', padding: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}><Plus size={14} /> Add month</button>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={tasksEnabled} onChange={e => setTasksEnabled(e.target.checked)} />
        <span style={{ color: C.parchment, fontSize: '0.875rem' }}>Enable daily task lists</span>
      </label>

      <button onClick={create} disabled={!canCreate} style={{ width: '100%', background: canCreate ? C.gold : C.line, color: canCreate ? '#1a1f35' : C.parchmentDim, border: 'none', borderRadius: '6px', padding: '0.625rem', fontSize: '0.875rem', fontWeight: 500, cursor: canCreate ? 'pointer' : 'not-allowed' }}>
        Create calendar
      </button>
    </div>
  );
}
