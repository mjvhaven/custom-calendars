import React, { useState } from 'react';
import { X, CheckSquare, Square, Plus, StickyNote } from 'lucide-react';
import { C, realWindowForDay, formatEarthNote } from './calendar_utils.js';

export default function DayDetailModal({ cal, year, monthIndex, day, monthName, dayData, onSave, onClose, isReadOnly }) {
  const [notes, setNotes] = useState(dayData.notes || '');
  const [tasks, setTasks] = useState(dayData.tasks || []);
  const [newTask, setNewTask] = useState('');

  const commit = (nextNotes, nextTasks) => !isReadOnly && onSave({ notes: nextNotes, tasks: nextTasks });
  const addTask = () => {
    if (!newTask.trim() || isReadOnly) return;
    const next = [...tasks, { id: Math.random().toString(36).slice(2, 10), text: newTask.trim(), done: false }];
    setTasks(next); setNewTask(''); commit(notes, next);
  };
  const toggleTask = (id) => {
    if (isReadOnly) return;
    const next = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(next); commit(notes, next);
  };
  const editTaskText = (id, text) => setTasks(tasks.map(t => t.id === id ? { ...t, text } : t));
  const commitTasks = () => commit(notes, tasks);
  const removeTask = (id) => {
    if (isReadOnly) return;
    const next = tasks.filter(t => t.id !== id);
    setTasks(next); commit(notes, next);
  };

  let earthNote = null;
  if (cal.kind === 'custom' && cal.sync) {
    const w = realWindowForDay(cal, year, monthIndex, day, 0);
    earthNote = formatEarthNote(w.startMs, w.endMs);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: '12px', padding: '1.25rem', width: '100%', maxWidth: '28rem', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <div style={{ color: C.gold, fontFamily: 'serif', fontSize: '0.875rem' }}>{monthName} {day}, Year {year}</div>
          <button onClick={onClose} style={{ color: C.slate, background: 'transparent', border: 'none' }}><X size={16} /></button>
        </div>
        {earthNote && <div style={{ color: C.slate, fontSize: '11px', fontFamily: 'monospace', marginBottom: '1rem' }}>≈ {earthNote}</div>}
        {!earthNote && <div style={{ marginBottom: '1rem' }} />}

        {cal.tasksEnabled && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckSquare size={12} /> Tasks</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.5rem' }}>
              {tasks.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => toggleTask(t.id)} style={{ color: t.done ? C.gold : C.slate, background: 'transparent', border: 'none' }}>{t.done ? <CheckSquare size={16} /> : <Square size={16} />}</button>
                  <input value={t.text} onChange={e => editTaskText(t.id, e.target.value)} onBlur={commitTasks} readOnly={isReadOnly}
                    style={{ flex: 1, background: C.bg, border: `1px solid ${C.line}`, color: t.done ? C.parchmentDim : C.parchment, textDecoration: t.done ? 'line-through' : 'none', padding: '0.375rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem' }} />
                  {!isReadOnly && <button onClick={() => removeTask(t.id)} style={{ color: C.danger, background: 'transparent', border: 'none' }}><X size={14} /></button>}
                </div>
              ))}
            </div>
            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addTask(); }} placeholder="Add a task..."
                  style={{ flex: 1, background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.375rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem' }} />
                <button onClick={addTask} style={{ color: C.gold, border: `1px solid ${C.goldDim}`, background: 'transparent', padding: '0.375rem 0.75rem', borderRadius: '6px' }}><Plus size={14} /></button>
              </div>
            )}
          </div>
        )}

        <div style={{ color: C.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><StickyNote size={12} /> Notes</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => commit(notes, tasks)} rows={8} placeholder="Write as much as you like..."
          readOnly={isReadOnly}
          style={{ width: '100%', background: C.bg, border: `1px solid ${C.line}`, color: C.parchment, padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', resize: 'vertical' }} />
      </div>
    </div>
  );
}
