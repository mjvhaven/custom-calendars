import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Settings, X, Locate, Link2 } from 'lucide-react';
import {
  C, uid, REAL_MONTHS, getMonthInfo, todayPositionFor, isSameDay, dayKey,
  monthKeyOf, eventFallsOn, weekdayLabels, loadJSON, saveJSON, monthCountOf,
  weekLengthOf, realWindowForDay, formatEarthNote
} from './calendar_utils.js';
import DayDetailModal from './day_detail_modal.jsx';
import EventFormModal from './event_form_modal.jsx';
import SettingsModal from './settings_modal.jsx';

export default function CalendarColumn({ cal, onUpdateCal, onRemoveCal, isReadOnly }) {
  const [ready, setReady] = useState(false);
  const [year, setYear] = useState(1);
  const [monthIndex, setMonthIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [dayData, setDayData] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const pos = todayPositionFor(cal);
      const cursor = await loadJSON(`calendar-cursor:${cal.id}`, null);
      if (cursor) { setYear(cursor.year); setMonthIndex(cursor.monthIndex); }
      else if (pos) { setYear(pos.year); setMonthIndex(pos.monthIndex); }
      else { setYear(1); setMonthIndex(0); }
      setEvents(await loadJSON(`calendar-events:${cal.id}`, []));
      setDayData(await loadJSON(`calendar-daydata:${cal.id}`, {}));
      setReady(true);
    })();
  }, [cal.id]);

  const persistCursor = (y, m) => saveJSON(`calendar-cursor:${cal.id}`, { year: y, monthIndex: m });
  const persistEvents = (next) => { setEvents(next); saveJSON(`calendar-events:${cal.id}`, next); };
  const persistDayData = (next) => { setDayData(next); saveJSON(`calendar-daydata:${cal.id}`, next); };

  function goMonth(delta) {
    const count = monthCountOf(cal);
    let m = monthIndex + delta, y = year;
    while (m < 0) { m += count; y -= 1; }
    while (m >= count) { m -= count; y += 1; }
    setMonthIndex(m); setYear(y); persistCursor(y, m);
  }
  function jumpToday() {
    const pos = todayPositionFor(cal);
    if (!pos) return;
    setYear(pos.year); setMonthIndex(pos.monthIndex); persistCursor(pos.year, pos.monthIndex);
  }

  if (!ready) return <div style={{ background: C.panel, minHeight: '500px', borderRadius: '12px' }} />;

  const info = getMonthInfo(cal, year, monthIndex);
  const wLen = weekLengthOf(cal);
  const cells = [];
  for (let i = 0; i < info.lead; i++) cells.push(null);
  for (let d = 1; d <= info.numDays; d++) cells.push(d);
  const today = todayPositionFor(cal);
  const wLabels = weekdayLabels(cal);

  const dayEvents = (d) => events.filter(ev => eventFallsOn(ev, cal, year, monthIndex, d));
  const dayHasContent = (d) => {
    const dd = dayData[dayKey(cal, year, monthIndex, d)];
    return dd && ((dd.notes && dd.notes.trim()) || (dd.tasks && dd.tasks.length > 0));
  };

  let monthEarthNote = null;
  if (cal.kind === 'custom' && cal.sync) {
    const startW = realWindowForDay(cal, year, monthIndex, 1, 0);
    const endW = realWindowForDay(cal, year, monthIndex, info.numDays, 0);
    monthEarthNote = formatEarthNote(startW.startMs, endW.endMs);
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: '12px', padding: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
        <div>
          <div style={{ color: C.gold }} className="font-serif text-xs tracking-[0.2em] uppercase mb-0.5">{cal.name}</div>
          <h2 style={{ color: C.parchment }} className="font-serif text-lg leading-tight">{info.name} <span style={{ color: C.parchmentDim }} className="font-mono text-sm">— Y{year}</span></h2>
        </div>
        {!isReadOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {today && <button onClick={jumpToday} style={{ color: C.slate, background: 'transparent', border: 'none', padding: '0.375rem', borderRadius: '4px' }} aria-label="Jump to today"><Locate size={15} /></button>}
            <button onClick={() => setShowSettings(true)} style={{ color: C.slate, background: 'transparent', border: 'none', padding: '0.375rem', borderRadius: '4px' }} aria-label="Settings"><Settings size={15} /></button>
          </div>
        )}
      </div>
      {monthEarthNote && (
        <div style={{ color: C.slate, fontSize: '10px', fontFamily: 'monospace', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Link2 size={10} /> ≈ {monthEarthNote}</div>
      )}

      {cal.kind === 'custom' && (
        <div style={{ display: 'flex', borderRadius: '6px', overflowX: 'auto', marginBottom: '0.75rem', border: `1px solid ${C.line}` }}>
          {cal.months.map((m, i) => (
            <button
              key={m.id}
              onClick={() => { setMonthIndex(i); persistCursor(year, i); }}
              style={{
                flexGrow: m.length, flexBasis: 0, minWidth: '40px',
                background: i === monthIndex ? C.gold : C.panel2,
                color: i === monthIndex ? '#1a1f35' : C.parchmentDim,
                borderRight: i < cal.months.length - 1 ? `1px solid ${C.line}` : 'none',
                border: 'none', padding: '0.5rem 0.25rem', fontSize: '9px', fontFamily: 'serif', cursor: 'pointer'
              }}
              title={`${m.name} — ${m.length} days`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <button onClick={() => goMonth(-1)} style={{ color: C.parchment, background: 'transparent', border: 'none', padding: '0.25rem', borderRadius: '4px' }} aria-label="Previous month"><ChevronLeft size={16} /></button>
        <div style={{ color: C.slate, fontFamily: 'monospace', fontSize: '11px' }}>{info.numDays}d/mo · {wLen}d/wk</div>
        <button onClick={() => goMonth(1)} style={{ color: C.parchment, background: 'transparent', border: 'none', padding: '0.25rem', borderRadius: '4px' }} aria-label="Next month"><ChevronRight size={16} /></button>
      </div>

      <div style={{ display: 'grid', gap: '4px', marginBottom: '4px', gridTemplateColumns: `repeat(${wLen}, minmax(0, 1fr))` }}>
        {wLabels.map((w, i) => <div key={i} style={{ color: C.slate, textAlign: 'center', fontSize: '9px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w}</div>)}
      </div>

      <div style={{ display: 'grid', gap: '4px', marginBottom: '0.75rem', gridTemplateColumns: `repeat(${wLen}, minmax(0, 1fr))` }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const evs = dayEvents(d);
          const hasContent = dayHasContent(d);
          const isToday = isSameDay(today, { year, monthIndex, day: d });
          return (
            <button
              key={d}
              onClick={() => { setSelectedDay(d); setDayModalOpen(true); }}
              style={{
                background: isToday ? C.rust : (evs.length || hasContent ? C.panel2 : C.bg),
                border: `1px solid ${isToday ? C.gold : (evs.length ? C.goldDim : C.line)}`,
                color: C.parchment, minHeight: '38px',
                borderRadius: '6px', padding: '0.25rem', fontFamily: 'monospace', fontSize: '11px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', cursor: 'pointer'
              }}
            >
              <span>{d}</span>
              <span style={{ display: 'flex', gap: '2px' }}>
                {evs.length > 0 && <span style={{ background: C.gold, width: '4px', height: '4px', borderRadius: '50%' }} />}
                {hasContent && <span style={{ background: C.slate, width: '4px', height: '4px', borderRadius: '50%' }} />}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ color: C.gold, fontFamily: 'serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Events</div>
        {!isReadOnly && (
          <button onClick={() => { setSelectedDay(null); setShowEventForm(true); }} style={{ color: C.gold, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '11px' }}>
            <Plus size={12} /> Add
          </button>
        )}
      </div>
      <div style={{ maxHeight: '128px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {events.length === 0 && <div style={{ color: C.parchmentDim, fontSize: '11px', fontStyle: 'italic' }}>None yet.</div>}
        {events.map(ev => {
          const monthName = cal.kind === 'earth' ? REAL_MONTHS[Number(ev.monthKey)] : (cal.months.find(m => m.id === ev.monthKey)?.name || '?');
          let sub;
          if (ev.recur === 'once') sub = `Once — ${monthName} ${ev.day}, Y${ev.year}`;
          else if (ev.recur === 'annual') sub = `Every year — ${monthName} ${ev.day}`;
          else if (ev.recur === 'daily') sub = 'Daily';
          else sub = ev.weekdays.length === wLen ? 'Every day' : `Weekly — ${ev.weekdays.map(i => wLabels[i]).join(', ')}`;
          let earthNote = null;
          if (cal.kind === 'custom' && cal.sync && (ev.recur === 'once' || ev.recur === 'annual')) {
            const y = ev.recur === 'once' ? ev.year : year;
            const mi = cal.months.findIndex(m => m.id === ev.monthKey);
            if (mi >= 0) {
              const w = realWindowForDay(cal, y, mi, ev.day, ev.timeHours || 0);
              earthNote = formatEarthNote(w.startMs, w.endMs);
            }
          }
          return (
            <div key={ev.id} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: '6px', padding: '0.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div style={{ color: C.parchment, fontSize: '12px' }}>{ev.label}</div>
                <div style={{ color: C.slate, fontSize: '10px', fontFamily: 'monospace' }}>{sub}</div>
                {earthNote && <div style={{ color: C.slate, fontSize: '10px', fontFamily: 'monospace', fontStyle: 'italic' }}>≈ {earthNote}</div>}
              </div>
              {!isReadOnly && (
                <button onClick={() => persistEvents(events.filter(e => e.id !== ev.id))} style={{ color: C.danger, background: 'transparent', border: 'none', padding: '0.25rem' }} aria-label="Delete"><Trash2 size={12} /></button>
              )}
            </div>
          );
        })}
      </div>

      {dayModalOpen && (
        <DayDetailModal
          cal={cal} year={year} monthIndex={monthIndex} day={selectedDay} monthName={info.name}
          dayData={dayData[dayKey(cal, year, monthIndex, selectedDay)] || { notes: '', tasks: [] }}
          onSave={(dd) => persistDayData({ ...dayData, [dayKey(cal, year, monthIndex, selectedDay)]: dd })}
          onClose={() => setDayModalOpen(false)}
          isReadOnly={isReadOnly}
        />
      )}

      {showEventForm && (
        <EventFormModal
          cal={cal} year={year} monthIndex={monthIndex} initialDay={selectedDay}
          onClose={() => setShowEventForm(false)}
          onSave={(ev) => { persistEvents([...events, { ...ev, id: uid() }]); setShowEventForm(false); }}
        />
      )}

      {showSettings && (
        <SettingsModal
          cal={cal}
          onClose={() => setShowSettings(false)}
          onSave={(next) => {
            onUpdateCal(next.id, next);
            if (next.kind === 'custom' && monthIndex >= next.months.length) setMonthIndex(0);
            const pos = todayPositionFor(next);
            if (pos) { setYear(pos.year); setMonthIndex(pos.monthIndex); persistCursor(pos.year, pos.monthIndex); }
            setShowSettings(false);
          }}
          onRemove={onRemoveCal ? () => { onRemoveCal(); setShowSettings(false); } : null}
        />
      )}
    </div>
  );
}
