import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, CircularProgress, Dialog, TextField } from '@mui/material';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

const say = (e, fallback) => e?.response?.data?.message || fallback;
const clock = (secs) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

/**
 * A student sits an exam. The server owns the clock: it says how long is left, the page only counts down from that (using the gap between
 * the server's clock and this device's, so a wrong phone clock changes nothing). Answers autosave a moment after each change; when time
 * runs out the page hands in by itself. Leaving the page is only recorded for the teacher, never punished.
 */
export default function ExamTaker({ examId, onClose }) {
  const [paper, setPaper] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [left, setLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const deadline = useRef(0);
  const offset = useRef(0);
  const dirty = useRef(false);
  const answersRef = useRef({});
  const done = useRef(false);

  useEffect(() => {
    let live = true;
    AuthApi()
      .post(`/education/me/exams/${examId}/start`)
      .then((r) => {
        if (!live) return;
        const p = r.data;
        offset.current = new Date(p.serverNow).getTime() - Date.now();
        deadline.current = new Date(p.deadlineAt).getTime();
        answersRef.current = p.answers ?? {};
        setAnswers(p.answers ?? {});
        setPaper(p);
      })
      .catch((e) => live && setError(say(e, 'Could not open the exam. Please try again.')));
    return () => { live = false; };
  }, [examId]);

  const submit = useCallback(async () => {
    if (done.current) return;
    done.current = true;
    setBusy(true);
    try {
      const r = await AuthApi().post(`/education/me/exams/${examId}/submit`, { answers: answersRef.current });
      setResult(r.data);
    } catch (e) {
      done.current = false;
      setError(say(e, 'Could not hand in. Check your connection and try again.'));
    } finally {
      setBusy(false);
    }
  }, [examId]);

  // The countdown, and the automatic hand-in at zero.
  useEffect(() => {
    if (!paper || result) return undefined;
    const tick = () => {
      const s = Math.max(0, Math.ceil((deadline.current - (Date.now() + offset.current)) / 1000));
      setLeft(s);
      if (s === 0) submit();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [paper, result, submit]);

  // Autosave every few seconds while there is something new.
  useEffect(() => {
    if (!paper || result) return undefined;
    const t = setInterval(() => {
      if (!dirty.current || done.current) return;
      dirty.current = false;
      AuthApi().put(`/education/me/exams/${examId}/answers`, { answers: answersRef.current }).catch(() => { dirty.current = true; });
    }, 4000);
    return () => clearInterval(t);
  }, [paper, result, examId]);

  // Leaving the page is noted for the teacher.
  useEffect(() => {
    if (!paper || result) return undefined;
    const note = (kind) => () => { if (!done.current) AuthApi().post(`/education/me/exams/${examId}/events`, { kind }).catch(() => {}); };
    const hidden = () => { if (document.hidden) note('HIDDEN')(); };
    const blur = note('BLUR');
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('blur', blur);
    return () => { document.removeEventListener('visibilitychange', hidden); window.removeEventListener('blur', blur); };
  }, [paper, result, examId]);

  const answer = (id, v) => {
    answersRef.current = { ...answersRef.current, [id]: v };
    dirty.current = true;
    setAnswers(answersRef.current);
  };
  const answered = paper ? paper.questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length : 0;

  let body;
  if (error && !paper) {
    body = (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', color: '#991b1b', marginBottom: 16 }}>{error}</div>
        <Button onClick={() => onClose(false)}>Close</Button>
      </div>
    );
  } else if (!paper) {
    body = <div style={{ padding: 48, textAlign: 'center' }}><CircularProgress /></div>;
  } else if (result) {
    body = (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: '4.4rem' }}>{result.late ? '⏱️' : '🎉'}</div>
        <div style={{ fontWeight: 900, fontSize: '3rem', color: '#1e1b4b', margin: '8px 0' }}>{result.score} out of {result.total}</div>
        <div style={{ color: '#6b7280', fontSize: '1.6rem', marginBottom: 22 }}>{result.late ? 'Your time had already ended, so the answers saved before then were marked.' : 'Your exam is handed in and marked.'}</div>
        <Button variant="contained" onClick={() => onClose(true)} sx={{ background: '#4338ca', color: '#fff', textTransform: 'none', fontWeight: 800, fontSize: '1.6rem', borderRadius: '12px', px: 4 }}>Done</Button>
      </div>
    );
  } else {
    body = (
      <>
        <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#312e81', color: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '2rem' }}>{paper.exam.title}</div>
            <div style={{ fontSize: '1.3rem', opacity: 0.85 }}>{answered} of {paper.questions.length} answered</div>
          </div>
          <div style={{ fontWeight: 900, fontSize: '2.8rem', fontVariantNumeric: 'tabular-nums', color: left !== null && left <= 60 ? '#fca5a5' : 'white' }}>{left === null ? '' : clock(left)}</div>
        </div>
        <div style={{ padding: 20 }}>
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 12, marginBottom: 14, fontSize: '1.5rem' }}>{error}</div>}
          {paper.questions.map((q, i) => (
            <div key={q.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, marginBottom: 14 }}>
              <div style={{ fontSize: '1.3rem', color: '#6b7280', fontWeight: 700 }}>Question {i + 1} · {q.marks} {q.marks === 1 ? 'mark' : 'marks'}</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, margin: '6px 0 12px', color: '#111827' }}>{q.text}</div>
              {q.kind === 'MCQ' ? (
                (q.options ?? []).map((o, j) => (
                  <label key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', marginBottom: 8, borderRadius: 12, cursor: 'pointer', fontSize: '1.7rem', border: `2px solid ${answers[q.id] === j ? '#4338ca' : '#e5e7eb'}`, background: answers[q.id] === j ? '#eef2ff' : 'white' }}>
                    <input type="radio" name={q.id} checked={answers[q.id] === j} onChange={() => answer(q.id, j)} style={{ width: 20, height: 20 }} />
                    {o}
                  </label>
                ))
              ) : (
                <TextField
                  size="small"
                  type="number"
                  label="Your answer"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => answer(q.id, e.target.value === '' ? '' : Number(e.target.value))}
                  inputProps={{ step: 'any' }}
                  sx={{ maxWidth: 240 }}
                />
              )}
            </div>
          ))}
          <Button
            fullWidth
            variant="contained"
            disabled={busy}
            onClick={() => window.confirm(`Hand in now? You have answered ${answered} of ${paper.questions.length}.`) && submit()}
            sx={{ background: '#16a34a', color: '#fff', '&:hover': { background: '#15803d' }, textTransform: 'none', fontWeight: 800, fontSize: '1.8rem', borderRadius: '14px', py: 1.5 }}
          >
            {busy ? 'Handing in...' : 'Hand in my exam'}
          </Button>
        </div>
      </>
    );
  }

  return (
    <Dialog open fullScreen disableEscapeKeyDown PaperProps={{ style: { background: '#f5f3ff' } }}>
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>{body}</div>
    </Dialog>
  );
}
