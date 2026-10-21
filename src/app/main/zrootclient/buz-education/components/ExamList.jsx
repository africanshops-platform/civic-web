import { Button } from '@mui/material';

const h3 = { margin: '0 0 14px', fontWeight: 800, color: '#111827', fontSize: '2rem' };
const when = (v) => new Date(v).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** What an exam row says about its state for this child. */
function badge(x) {
  const a = x.attempt;
  if (a.status === 'SUBMITTED') return { text: `${a.score} / ${a.total}`, bg: '#dcfce7', fg: '#166534' };
  if (a.status === 'IN_PROGRESS') return { text: 'In progress', bg: '#e0e7ff', fg: '#3730a3' };
  if (a.status === 'TIME_UP') return { text: 'Time is up', bg: '#fee2e2', fg: '#991b1b' };
  if (x.state === 'OPEN') return { text: 'Open now', bg: '#fef9c3', fg: '#854d0e' };
  if (x.state === 'UPCOMING') return { text: 'Opens later', bg: '#f3f4f6', fg: '#4b5563' };
  return { text: 'Missed', bg: '#f3f4f6', fg: '#4b5563' };
}

/**
 * The exams of one child's class. A guardian only looks (state and score); the student also gets a Start or Continue button while
 * the exam can still be taken. A 404 means the school has not switched exams on, so the section hides.
 */
export default function ExamList({ exams, off, onStart, card }) {
  if (off || !exams || exams.length === 0) return null;
  return (
    <div style={card}>
      <h3 style={h3}>Exams</h3>
      {exams.map((x) => {
        const b = badge(x);
        const canTake = onStart && x.attempt.status !== 'SUBMITTED' && x.attempt.status !== 'TIME_UP' && (x.state === 'OPEN' || x.attempt.status === 'IN_PROGRESS');
        return (
          <div key={x.id} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '14px 16px', borderRadius: 14, background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 800, fontSize: '1.8rem' }}>{x.title}</div>
              <div style={{ fontSize: '1.4rem', color: '#6b7280' }}>
                {[x.courseName, `${x.questionCount} questions`, `${x.durationMinutes} min`].filter(Boolean).join(' · ')} · {when(x.opensAt)} to {when(x.closesAt)}
              </div>
            </div>
            <span style={{ padding: '6px 14px', borderRadius: 999, fontWeight: 800, fontSize: '1.5rem', background: b.bg, color: b.fg }}>{b.text}</span>
            {canTake && (
              <Button variant="contained" onClick={() => onStart(x)} sx={{ background: '#4338ca', color: '#fff', '&:hover': { background: '#3730a3' }, textTransform: 'none', fontWeight: 800, fontSize: '1.5rem', borderRadius: '12px' }}>
                {x.attempt.status === 'IN_PROGRESS' ? 'Continue' : 'Start'}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
