import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent } from '@mui/material';

const h3 = { margin: '0 0 14px', fontWeight: 800, color: '#111827', fontSize: '2rem' };

/** One slide as a student or guardian sees it. The teacher's answers never reach this page. */
function Slide({ s }) {
  if (s.kind === 'TITLE')
    return (
      <div style={{ borderRadius: 20, padding: '48px 32px', background: 'linear-gradient(135deg,#312e81,#6d28d9)', color: 'white', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: '3.2rem', lineHeight: 1.15 }}>{s.title}</div>
        {s.text && <div style={{ marginTop: 14, fontSize: '1.9rem', opacity: 0.92 }}>{s.text}</div>}
      </div>
    );
  if (s.kind === 'BULLETS')
    return (
      <div style={{ borderRadius: 20, padding: 32, background: '#eef2ff', minHeight: 220 }}>
        {s.title && <div style={{ fontWeight: 900, fontSize: '2.6rem', color: '#312e81', marginBottom: 14 }}>{s.title}</div>}
        <ul style={{ margin: 0, paddingLeft: 26, fontSize: '2rem', lineHeight: 1.7, color: '#1f2937' }}>
          {(s.bullets ?? []).map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>
    );
  if (s.kind === 'IMAGE')
    return (
      <div style={{ borderRadius: 20, padding: 24, background: '#f9fafb', border: '1px solid #e5e7eb', textAlign: 'center' }}>
        {s.title && <div style={{ fontWeight: 900, fontSize: '2.4rem', marginBottom: 12 }}>{s.title}</div>}
        <img src={s.imageUrl} alt={s.caption || ''} style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 12 }} />
        {s.caption && <div style={{ marginTop: 10, color: '#6b7280', fontSize: '1.6rem' }}>{s.caption}</div>}
      </div>
    );
  return (
    <div style={{ borderRadius: 20, padding: 32, background: '#fffbeb', border: '1px solid #fde68a', minHeight: 220 }}>
      <div style={{ fontWeight: 900, color: '#92400e', fontSize: '1.7rem', letterSpacing: 1.5 }}>QUESTION FOR THE CLASS</div>
      <div style={{ marginTop: 12, fontSize: '2.4rem', fontWeight: 800, color: '#78350f' }}>{s.question}</div>
    </div>
  );
}

function Viewer({ note, onClose }) {
  const [i, setI] = useState(0);
  const slides = note.slides ?? [];
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogContent>
        <div style={{ fontWeight: 800, fontSize: '1.7rem', color: '#6b7280', marginBottom: 10 }}>{[note.courseName, note.topicTitle].filter(Boolean).join(' · ')} · {note.title}</div>
        {slides[i] && <Slide s={slides[i]} />}
        <div style={{ marginTop: 12, textAlign: 'center', color: '#9ca3af', fontSize: '1.5rem' }}>Slide {i + 1} of {slides.length}</div>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button disabled={i === 0} onClick={() => setI(i - 1)} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.6rem' }}>‹ Back</Button>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontSize: '1.6rem' }}>Close</Button>
        <Button variant="contained" disabled={i >= slides.length - 1} onClick={() => setI(i + 1)} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '1.6rem', background: '#4338ca' }}>Next ›</Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * The published notes of a class (civic-63 E4-a), for a guardian or the student. Hidden while the school has not switched notes on (`off`)
 * or has published none, so the page carries no empty box. `loadNote(id)` fetches one deck when it is opened.
 */
export default function ClassNotes({ notes, off, loadNote, card }) {
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  if (off || !notes || notes.length === 0) return null;
  const show = async (id) => {
    setBusy(id);
    try {
      setOpen(await loadNote(id));
    } finally {
      setBusy(null);
    }
  };
  return (
    <div style={card}>
      <h3 style={h3}>Class notes</h3>
      {notes.map((n) => (
        <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 16px', borderRadius: 14, background: '#eef2ff', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 800, fontSize: '1.8rem', color: '#312e81' }}>{n.title}</div>
            <div style={{ fontSize: '1.4rem', color: '#6b7280' }}>{[n.courseName, n.topicTitle].filter(Boolean).join(' · ')} · {n.slideCount} slides</div>
          </div>
          <Button variant="contained" disabled={busy === n.id} onClick={() => show(n.id)} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '1.5rem', background: '#4338ca', borderRadius: '12px' }}>
            {busy === n.id ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Read'}
          </Button>
        </div>
      ))}
      {open && <Viewer note={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
