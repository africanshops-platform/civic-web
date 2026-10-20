import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, CircularProgress, MenuItem, TextField } from '@mui/material';
import EducationPageShell from './EducationPageShell';
import { useDropCourse, useRegisterCourse, useTertiaryCatalogue, useTertiaryTranscript } from '../hooks/useEducationRepo';
import { creditStanding, GRADE_COLOR } from '../tertiary';

function Courses() {
  const [termId, setTermId] = useState('');
  const { data, isLoading, isError, error } = useTertiaryCatalogue(termId || undefined);
  const register = useRegisterCourse();
  const drop = useDropCourse();
  const cat = data?.data;

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="info">{error?.response?.data?.message ?? 'You are not enrolled in a university or college programme yet.'}</Alert>;
  if (!cat.term) return <p data-testid="no-semester">Your school has not opened a semester yet.</p>;
  const standing = creditStanding(cat.credits, cat.limits);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TextField select size="small" label="Semester" value={termId || cat.term.id} onChange={(e) => setTermId(e.target.value)} style={{ maxWidth: 280 }}>
        {cat.terms.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
      </TextField>
      <b data-testid="standing" style={{ color: { ok: '#15803d', warn: '#b45309', bad: '#dc2626' }[standing.tone] }}>{standing.text}</b>
      {!cat.term.open && <Alert severity="info">Registration for this semester has closed.</Alert>}
      {cat.courses.length === 0 && <p>No courses have been listed for your programme yet.</p>}
      {cat.courses.map((c) => (
        <div key={c.id} data-testid={`course-${c.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
          <span>{c.code} · {c.title} · {c.credits} credit{c.credits === 1 ? '' : 's'} · year {c.year}</span>
          {cat.term.open && (
            c.registered
              ? <Button size="small" disabled={drop.isLoading} onClick={() => drop.mutate({ termId: cat.term.id, courseId: c.id })}>Drop</Button>
              : <Button size="small" variant="outlined" disabled={register.isLoading} onClick={() => register.mutate({ termId: cat.term.id, courseId: c.id })}>Register</Button>
          )}
        </div>
      ))}
    </div>
  );
}

function Transcript() {
  const { data, isLoading, isError } = useTertiaryTranscript();
  const t = data?.data;

  if (isLoading) return <CircularProgress />;
  if (isError || !t) return <p>Your results will appear here once your school publishes them.</p>;
  if (!t.semesters.length) return <p data-testid="no-results">No results have been published yet.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div data-testid="summary">
        <b>{t.programme.name}</b>{t.matricNo ? ` · ${t.matricNo}` : ''}<br />
        Cumulative GPA <b data-testid="cgpa">{t.cgpa.toFixed(2)}</b> · {t.totalCredits} credits · {t.classOfDegree}
      </div>
      {t.semesters.map((s) => (
        <div key={s.term.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14 }}>
          <b>{s.term.name}</b> · GPA {s.gpa.toFixed(2)} · {s.credits} credits
          {s.courses.map((c) => (
            <div key={c.code} style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', padding: '6px 0' }}>
              <span>{c.code} · {c.title} ({c.credits})</span>
              <b style={{ color: GRADE_COLOR[c.grade] }}>{c.score} · {c.grade}</b>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A university student's portal: register for the semester's courses and read published results (civic-65, E5-b). */
export default function TertiaryPortalPage() {
  const [tab, setTab] = useState('courses');

  return (
    <EducationPageShell title="My courses" subtitle="Education · University">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Button variant={tab === 'courses' ? 'contained' : 'outlined'} onClick={() => setTab('courses')}>Courses</Button>
          <Button variant={tab === 'results' ? 'contained' : 'outlined'} onClick={() => setTab('results')}>Results</Button>
          <Button component={Link} to="/education/tertiary-applications">My applications</Button>
        </div>
        {tab === 'courses' ? <Courses /> : <Transcript />}
      </div>
    </EducationPageShell>
  );
}
