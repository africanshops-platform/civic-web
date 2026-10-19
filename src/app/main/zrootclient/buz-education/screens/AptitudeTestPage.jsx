import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { toast } from 'react-toastify';
import EducationPageShell from './EducationPageShell';
import { useStartAptitude, useWardAction } from '../hooks/useEducationRepo';

const pad = (n) => String(n).padStart(2, '0');

/** The school's short test, taken on the guardian's device. The score is for the school; the family is told it was received. */
export default function AptitudeTestPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const start = useStartAptitude();
  const submit = useWardAction();
  const [answers, setAnswers] = useState({});
  const [now, setNow] = useState(Date.now());
  const test = start.data?.data;

  useEffect(() => {
    start.mutate(applicationId);
    // started once per page visit; the server keeps the first start time
  }, [applicationId]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = useMemo(() => (test ? Math.max(0, Math.floor((new Date(test.endsAt).getTime() - now) / 1000)) : 0), [test, now]);
  const send = () =>
    submit.mutate(
      { id: applicationId, action: 'aptitude/submit', body: { answers } },
      { onSuccess: () => { toast.success('The test was received. The school will look at the application.'); navigate('/education/admissions'); } },
    );

  let body;
  if (start.isLoading || (!test && !start.isError)) body = <CircularProgress sx={{ color: '#4f46e5' }} />;
  else if (start.isError) body = <Alert severity="error">{start.error?.response?.data?.message ?? 'Could not open the test.'} <Link to="/education/admissions">Back</Link></Alert>;
  else {
    body = (
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 'clamp(2.4rem,4vw,3.2rem)', color: '#111827' }}>{test.title}</h1>
        <div style={{ position: 'sticky', top: 0, zIndex: 2, background: left < 120 ? '#fef2f2' : '#eef2ff', borderRadius: 12, padding: '10px 16px', fontWeight: 800, fontSize: '1.8rem', marginBottom: 16 }}>
          Time left: {pad(Math.floor(left / 60))}:{pad(left % 60)}{left === 0 ? ' (time is up: send your answers now)' : ''}
        </div>
        <Alert severity="info" sx={{ mb: 2 }}>One attempt. This test helps the school know your child; it does not decide anything by itself.</Alert>
        {test.questions.map((q, i) => (
          <div key={q.id} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb', marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: '1.8rem', color: '#111827', marginBottom: 8 }}>{i + 1}. {q.text}</div>
            <RadioGroup value={answers[q.id] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: Number(e.target.value) }))}>
              {q.options.map((o, idx) => <FormControlLabel key={idx} value={idx} control={<Radio />} label={<span style={{ fontSize: '1.7rem' }}>{o}</span>} />)}
            </RadioGroup>
          </div>
        ))}
        <Button variant="contained" disabled={submit.isLoading} onClick={send} sx={{ background: '#4f46e5', textTransform: 'none', fontWeight: 800, fontSize: '1.8rem', px: 4 }}>Send my answers</Button>
      </div>
    );
  }
  return <EducationPageShell title="Short test" subtitle="Education · Admissions">{body}</EducationPageShell>;
}
