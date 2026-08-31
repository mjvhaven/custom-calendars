import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';
import { C, REAL_MONTHS, REAL_WEEKDAYS } from './calendar_utils.js';

export default function PrintPreview({ calendars, onClose }) {
  const [selectedCalendars, setSelectedCalendars] = useState(calendars.map(c => c.id));
  const [viewType, setViewType] = useState('month');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [layout, setLayout] = useState('horizontal');

  const handlePrint = () => { window.print(); };

  const visibleCals = calendars.filter(c => selectedCalendars.includes(c.id));

  return (
    <div className="fixed inset-0" style={{ background: C.bg, zIndex: 50, overflow: 'auto' }}>
      <div className="no-print" style={{ padding: '1rem', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ color: C.parchment, fontFamily: 'serif', fontSize: '1.25rem' }}>Print Preview</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select value={viewType} onChange={e => setViewType(e.target.value)} style={{ background: C.panel, color: C.parchment, border: `1px solid ${C.line}`, padding: '0.5rem', borderRadius: '6px' }}>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
            <option value="range">Date Range</option>
          </select>
          <select value={layout} onChange={e => setLayout(e.target.value)} style={{ background: C.panel, color: C.parchment, border: `1px solid ${C.line}`, padding: '0.5rem', borderRadius: '6px' }}>
            <option value="horizontal">Side by Side</option>
            <option value="stacked">Stacked</option>
            <option value="aligned">Aligned (line up days)</option>
          </select>
          {(viewType === 'range') && (
            <>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ background: C.panel, color: C.parchment, border: `1px solid ${C.line}`, padding: '0.5rem', borderRadius: '6px' }} />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ background: C.panel, color: C.parchment, border: `1px solid ${C.line}`, padding: '0.5rem', borderRadius: '6px' }} />
            </>
          )}
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {calendars.map(c => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: C.parchment, fontSize: '0.75rem' }}>
                <input type="checkbox" checked={selectedCalendars.includes(c.id)} onChange={e => setSelectedCalendars(e.target.checked ? [...selectedCalendars, c.id] : selectedCalendars.filter(x => x !== c.id))} />
                {c.name}
              </label>
            ))}
          </div>
          <button onClick={handlePrint} style={{ background: C.gold, color: C.bg, border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Printer size={14} /> Print
          </button>
          <button onClick={onClose} style={{ background: 'transparent', color: C.slate, border: `1px solid ${C.line}`, padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>

      <div style={{ padding: '1.5rem', background: '#f5f1e8', color: '#1a1a1a', minHeight: 'calc(100vh - 80px)' }}>
        {visibleCals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Select at least one calendar to preview.</div>
        ) : (
          <div style={layout === 'stacked' ? { display: 'flex', flexDirection: 'column', gap: '1rem' } : { display: 'grid', gridTemplateColumns: `repeat(${visibleCals.length}, 1fr)`, gap: '1rem' }}>
            {visibleCals.map(cal => (
              <div key={cal.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontFamily: 'serif', fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>{cal.name}</h3>
                <PrintCalendarView cal={cal} viewType={viewType} startDate={startDate} endDate={endDate} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PrintCalendarView({ cal, viewType, startDate, endDate }) {
  if (cal.kind === 'earth') {
    const start = new Date(startDate);
    if (viewType === 'month') {
      return <PrintMonth year={start.getFullYear()} month={start.getMonth()} />;
    }
    if (viewType === 'year') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {Array.from({ length: 12 }, (_, i) => <PrintMonth key={i} year={start.getFullYear()} month={i} compact />)}
        </div>
      );
    }
    return <PrintRange start={start} endDate={endDate} />;
  }
  return <div style={{ fontSize: '0.75rem' }}>Custom calendar (use main view for now)</div>;
}

function PrintMonth({ year, month, compact }) {
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const numDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= numDays; d++) days.push(d);
  return (
    <div>
      <h4 style={{ textAlign: 'center', fontFamily: 'serif', fontSize: compact ? '0.8rem' : '1rem', marginBottom: '0.25rem' }}>{REAL_MONTHS[month]} {year}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', fontSize: '0.65rem' }}>
        {REAL_WEEKDAYS.map(d => <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', color: '#666' }}>{d}</div>)}
        {days.map((d, i) => (
          <div key={i} style={{ minHeight: compact ? '20px' : '40px', padding: '2px', border: '1px solid #ddd', fontSize: compact ? '0.6rem' : '0.8rem' }}>{d || ''}</div>
        ))}
      </div>
    </div>
  );
}

function PrintRange({ start, endDate }) {
  const end = new Date(endDate);
  const days = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(new Date(d));
  }
  return (
    <div>
      <h4 style={{ textAlign: 'center', fontFamily: 'serif', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{start.toDateString()} - {end.toDateString()}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {days.map((d, i) => (
          <div key={i} style={{ border: '1px solid #ddd', padding: '0.5rem', minHeight: '40px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{REAL_WEEKDAYS[d.getUTCDay()]} - {REAL_MONTHS[d.getUTCMonth()]} {d.getUTCDate()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
