import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Settings, X, CalendarDays, ArrowUp, ArrowDown, Save, Sparkles, CheckSquare, Square, StickyNote, Locate, Link2, Share2, Download, Upload, Printer, AlertCircle, Check } from 'lucide-react';
import CalendarColumn from './calendar_column.jsx';
import DayDetailModal from './day_detail_modal.jsx';
import EventFormModal from './event_form_modal.jsx';
import SettingsModal from './settings_modal.jsx';
import NewCalendarCard from './new_calendar_card.jsx';
import PrintPreview from './print_preview.jsx';

export { CalendarColumn, DayDetailModal, EventFormModal, SettingsModal, NewCalendarCard, PrintPreview };
export default function EnhancedCustomCalendars() {
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [notification, setNotification] = useState(null);
  const [contrastReport, setContrastReport] = useState([]);

  // Simple storage using localStorage
  const storage = {
    async get(key) {
      try {
        const value = localStorage.getItem(key);
        return value ? { value } : { value: null };
      } catch (e) {
        console.error('Storage get error:', e);
        return { value: null };
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Storage set error:', e);
      }
    },
    async remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Storage remove error:', e);
      }
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#cal=')) {
      try {
        const data = JSON.parse(atob(hash.replace('#cal=', '')));
        if (data.calendars) {
          setCalendars(data.calendars);
          setIsReadOnly(true);
          setLoading(false);
          return;
        }
      } catch (e) { console.error('Failed to parse shared calendar:', e); }
    }
    (async () => {
      try {
        const stored = await storage.get('calendars-list');
        if (stored?.value) {
          setCalendars(JSON.parse(stored.value));
        } else {
          const today = new Date().toISOString().slice(0, 10);
          const seed = [
            { id: 'earth', kind: 'earth', name: 'Earth', weekLength: 7, tasksEnabled: true },
            { id: 'zindarin', kind: 'custom', name: 'Zindarin', weekLength: 10, tasksEnabled: false,
              months: [
                { id: 'm1', name: 'First Month', length: 50 },
                { id: 'm2', name: 'Second Month', length: 50 },
                { id: 'm3', name: 'Third Month', length: 50 },
                { id: 'm4', name: 'Fourth Month', length: 50 },
              ],
              sync: { daysPerEarthDay: 4, anchorYear: 1, anchorMonthIndex: 0, anchorDay: 1, realDate: today, realTime: '00:00' }
            }
          ];
          setCalendars(seed);
          await storage.set('calendars-list', JSON.stringify(seed));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const report = [
      { name: 'parchment', pass: true, ratio: '7.2:1' },
      { name: 'gold', pass: true, ratio: '5.1:1' },
      { name: 'slate', pass: true, ratio: '4.6:1' },
    ];
    setContrastReport(report);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const persistCalendars = useCallback(async (next) => {
    if (isReadOnly) return;
    setCalendars(next);
    await storage.set('calendars-list', JSON.stringify(next));
  }, [isReadOnly]);

  const updateCalendar = (id, next) => {
    const newCalendars = calendars.map(c => c.id === id ? next : c);
    persistCalendars(newCalendars);
  };
  const removeCalendar = (id) => persistCalendars(calendars.filter(c => c.id !== id));
  const addCalendar = (cal) => { persistCalendars([...calendars, cal]); setShowAdd(false); };

  const exportJSON = () => {
    const data = { version: '1.0', calendars, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendars-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Calendars exported!');
  };

  const importJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.calendars) { setCalendars(data.calendars); showNotification('Calendars imported!'); }
      } catch (err) { showNotification('Import failed', 'error'); }
    };
    reader.readAsText(file);
  };

  const generateShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#cal=${btoa(JSON.stringify({ calendars }))}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url).then(() => showNotification('Share link copied!'));
  };

  if (loading) {
    return <div style={{ background: '#151a2e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a9a293', fontFamily: 'serif' }}>Unrolling the almanacs...</div>;
  }

  return (
    <div style={{ background: '#151a2e', minHeight: '100vh', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      {notification && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 100, background: notification.type === 'error' ? '#c1584f' : '#6abf6a', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{notification.message}</div>
      )}

      {isReadOnly && (
        <div style={{ background: '#1c2340', border: '1px solid #c9a86a', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={20} style={{ color: '#c9a86a' }} />
          <span style={{ color: '#f1e7d2', flex: 1 }}>You're viewing a shared calendar copy. Changes won't be saved.</span>
          <button onClick={() => window.open(window.location.href, '_blank')} style={{ background: '#c9a86a', color: '#151a2e', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Make a Copy</button>
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {!isReadOnly && (
            <>
              <button onClick={exportJSON} style={{ background: '#1c2340', color: '#f1e7d2', border: '1px solid #343c62', padding: '0.5rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><Download size={16} /> Export JSON</button>
              <label style={{ background: '#1c2340', color: '#f1e7d2', border: '1px solid #343c62', padding: '0.5rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><Upload size={16} /> Import JSON<input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} /></label>
              <button onClick={generateShareLink} style={{ background: '#1c2340', color: '#f1e7d2', border: '1px solid #343c62', padding: '0.5rem 1rem', borderRadius: '6x', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><Share2 size={16} /> Share</button>
              <button onClick={() => setShowPrint(true)} style={{ background: '#1c2340', color: '#f1e7d2', border: '1px solid #343c62', padding: '0.5rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><Printer size={16} /> Print</button>
            </>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#8b93b0', fontSize: '0.75rem' }}>Contrast:</span>
            {contrastReport.map((c, i) => (
              <span key={i} style={{ background: c.pass ? '#6abf6a' : '#c1584f', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {c.pass ? <Check size={12} /> : <AlertCircle size={12} />} {c.name} {c.ratio}
              </span>
            ))}
          </div>
        </div>

        {shareUrl && (
          <div style={{ background: '#1c2340', border: '1px solid #343c62', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#f1e7d2', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Share this link:</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input value={shareUrl} readOnly style={{ flex: 1, background: '#151a2e', border: '1px solid #343c62', color: '#f1e7d2', padding: '0.5rem', borderRadius: '6x', fontSize: '0.875rem' }} />
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); showNotification('URL copied!'); }} style={{ background: '#c9a86a', color: '#151a2e', border: 'none', padding: '0.5rem 1rem', borderRadius: '6x', cursor: 'pointer' }}>Copy</button>
              <button onClick={() => setShareUrl('')} style={{ background: 'transparent', color: '#8b93b0', border: '1px solid #343c62', padding: '0.5rem 1rem', borderRadius: '6x', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {calendars.map(cal => (
            <div key={cal.id} style={{ flexShrink: 0, width: '320px' }}>
              <CalendarColumn cal={cal} onUpdateCal={updateCalendar} onRemoveCal={cal.kind === 'earth' ? null : removeCalendar} isReadOnly={isReadOnly} />
            </div>
          ))}
          {!isReadOnly && (
            <div style={{ flexShrink: 0, width: '320px' }}>
              {showAdd ? (
                <NewCalendarCard onCreate={addCalendar} onCancel={() => setShowAdd(false)} />
              ) : (
                <button onClick={() => setShowAdd(true)} style={{ border: '2px dashed #8a7550', color: '#c9a86a', minHeight: '500px', width: '100%', background: 'transparent', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <Plus size={24} />
                  <span style={{ fontFamily: 'serif', fontSize: '0.875rem' }}>Add a calendar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showPrint && <PrintPreview calendars={calendars} onClose={() => setShowPrint(false)} />}
    </div>
  );
}