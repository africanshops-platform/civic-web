import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, CircularProgress, TextField } from '@mui/material';
import { useAppSelector } from 'app/store/hooks';
import useAuth from '../../../../auth/useAuth';
import { selectUser } from '../../../../auth/user/store/userSlice';
import { GRADE_COLOR, fmtDate } from '../constants';
import { isStudentSession, mustChangePassword, studentClaims } from './studentSession';
import StudentClaimPage from './StudentClaimPage';
import { useChangeStudentPassword, useMyGate, useMyNotices, useMyRecord, useMyTimetable } from './useStudentApi';

const shell = { minHeight: '100vh', background: '#f5f3ff' };
const wrap = { maxWidth: 880, margin: '0 auto', padding: '0 16px 48px' };
const card = { background: 'white', borderRadius: 22, padding: 24, border: '1px solid #e5e7eb', marginBottom: 18 };
const h3 = { margin: '0 0 12px', fontWeight: 800, color: '#111827', fontSize: '2rem' };
const muted = { color: '#9ca3af', fontSize: '1.6rem' };
const clock = (v) => new Date(v).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
// The platform counts Monday as 1 and Sunday as 7.
const todayNumber = () => (new Date().getDay() === 0 ? 7 : new Date().getDay());

/** The first sign-in: the one-time password must be replaced by one only the child knows. */
function ChoosePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const change = useChangeStudentPassword();
  const ok = current.length >= 6 && next.length >= 8 && next === again && next !== current;

  return (
    <div style={{ ...shell, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <form
        style={{ ...card, maxWidth: 480, width: '100%', padding: 36 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) change.mutate({ currentPassword: current, newPassword: next }, { onSuccess: () => window.location.reload() });
        }}
      >
        <div style={{ fontSize: '4.4rem', lineHeight: 1 }}>🔐</div>
        <h1 style={{ margin: '12px 0 6px', fontWeight: 900, fontSize: '2.8rem', color: '#1e1b4b' }}>Choose your own password</h1>
        <p style={{ margin: '0 0 22px', color: '#6b7280', fontSize: '1.6rem' }}>
          The password your parent gave you was only for the first time. Pick one that only you know, and do not share it, even with friends.
        </p>
        <TextField fullWidth type="password" label="The password you were given" value={current} onChange={(e) => setCurrent(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth type="password" label="Your new password (at least 8 characters)" value={next} onChange={(e) => setNext(e.target.value)} sx={{ mb: 2 }} />
        <TextField
          fullWidth
          type="password"
          label="Type the new password again"
          value={again}
          onChange={(e) => setAgain(e.target.value)}
          error={Boolean(again) && again !== next}
          helperText={again && again !== next ? 'The two passwords are not the same' : ' '}
          sx={{ mb: 1 }}
        />
        <Button type="submit" fullWidth variant="contained" disabled={!ok || change.isLoading} sx={{ background: '#4338ca', color: '#fff', '&:hover': { background: '#3730a3' }, '&.Mui-disabled': { color: '#fff', opacity: 0.45, background: '#4338ca' }, textTransform: 'none', fontWeight: 800, fontSize: '1.8rem', borderRadius: '14px', py: 1.5 }}>
          Save my password
        </Button>
      </form>
    </div>
  );
}

function Today({ timetable }) {
  const items = (timetable?.items ?? []).filter((p) => p.weekday === todayNumber());
  return (
    <div style={card}>
      <h3 style={h3}>Today</h3>
      {items.length === 0 ? (
        <span style={muted}>No classes today. Enjoy your day!</span>
      ) : (
        items.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 14, background: '#eef2ff', marginBottom: 8, fontSize: '1.7rem' }}>
            <span style={{ fontWeight: 800, color: '#312e81' }}>{p.courseName}</span>
            <span style={{ color: '#4338ca' }}>{p.start}–{p.end}{p.room ? ` · ${p.room}` : ''}</span>
          </div>
        ))
      )}
    </div>
  );
}

function Week({ timetable }) {
  const items = timetable?.items ?? [];
  const days = [...new Set(items.map((p) => p.weekday))].sort();
  if (!timetable) return null;
  return (
    <div style={card}>
      <h3 style={h3}>My week{timetable.className ? ` · ${timetable.className}` : ''}</h3>
      {days.length === 0 && <span style={muted}>The school has not set a timetable for your class yet.</span>}
      {days.map((d) => (
        <div key={d} style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1.6rem', marginBottom: 6 }}>{items.find((p) => p.weekday === d).weekdayName}</div>
          {items.filter((p) => p.weekday === d).map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 5, fontSize: '1.6rem' }}>
              <span style={{ fontWeight: 700 }}>{p.courseName}</span>
              <span style={{ color: '#6b7280' }}>{p.start}–{p.end}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * A student's own page: their class today and this week, grades, attendance, arrivals and school notices. Nothing else on the platform.
 * `adult` is the same page for an enrolled adult inside the normal civic app (no student session, no first-password step, a way back
 * instead of "Sign out"); the server decides whose record it is from the signed-in account, never from the address.
 */
export function StudentHome({ adult = false }) {
  const { signOut } = useAuth();
  const me = useAppSelector(selectUser);
  const student = isStudentSession();
  const record = useMyRecord();
  const timetable = useMyTimetable();
  const gate = useMyGate();
  const notices = useMyNotices();

  if (!adult && !student) return <Navigate to="/student/sign-in" replace />;
  if (!adult && mustChangePassword()) return <ChoosePassword />;

  const r = record.data?.data;
  const att = r?.attendance?.summary;
  const first = (r?.enrollment?.studentName ?? (adult ? me?.name : null))?.split(' ')[0];

  return (
    <div style={shell}>
      <div style={{ background: 'linear-gradient(135deg,#312e81,#6d28d9)', color: 'white', padding: '28px 16px 70px' }}>
        <div style={{ ...wrap, padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: '1.5rem', opacity: 0.8, letterSpacing: 2, fontWeight: 700 }}>MY SCHOOL</div>
            <h1 style={{ margin: '4px 0 2px', fontWeight: 900, fontSize: 'clamp(2.8rem,5vw,3.8rem)' }}>{first ? `Hi, ${first}!` : 'Hi!'}</h1>
            {r && <div style={{ fontSize: '1.7rem', opacity: 0.9 }}>{[r.enrollment.school.name, r.enrollment.programId, r.enrollment.admissionNumber].filter(Boolean).join(' · ')}</div>}
          </div>
          {adult ? (
            <Button component={Link} to="/education" sx={{ color: 'white', border: '1px solid rgba(255,255,255,.5)', textTransform: 'none', fontWeight: 700, fontSize: '1.5rem', borderRadius: '12px' }}>Back to Education</Button>
          ) : (
            <Button onClick={signOut} sx={{ color: 'white', border: '1px solid rgba(255,255,255,.5)', textTransform: 'none', fontWeight: 700, fontSize: '1.5rem', borderRadius: '12px' }}>Sign out</Button>
          )}
        </div>
      </div>

      <div style={{ ...wrap, marginTop: -44 }}>
        {record.isLoading && <div style={{ ...card, textAlign: 'center' }}><CircularProgress /></div>}
        {record.isError && (
          <div style={card}>
            <h3 style={h3}>{adult && record.error?.response?.status === 404 ? 'You are not enrolled at a school yet' : 'Your school pages are not ready yet'}</h3>
            <span style={muted}>{record.error?.response?.data?.message ?? 'Please try again in a moment.'}</span>
            {adult && record.error?.response?.status === 404 && (
              <div style={{ marginTop: 14 }}>
                <Button component={Link} to="/education/schools" variant="contained" sx={{ background: '#4338ca', color: '#fff', '&:hover': { background: '#3730a3' }, textTransform: 'none', fontWeight: 800, fontSize: '1.6rem', borderRadius: '14px', px: 3 }}>Find a school</Button>
              </div>
            )}
          </div>
        )}

        {timetable.data && <Today timetable={timetable.data.data} />}

        {notices.data?.data?.data?.length > 0 && (
          <div style={card}>
            <h3 style={h3}>From my school</h3>
            {notices.data.data.data.map((n) => (
              <div key={n.id} style={{ padding: '12px 16px', borderRadius: 14, background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: '1.7rem', color: '#92400e' }}>{n.title}</div>
                <div style={{ fontSize: '1.55rem', color: '#78350f' }}>{n.body}</div>
                <div style={{ fontSize: '1.3rem', color: '#a16207', marginTop: 4 }}>{fmtDate(n.createdAt)}</div>
              </div>
            ))}
          </div>
        )}

        {r && (
          <div style={card}>
            <h3 style={h3}>My grades</h3>
            {r.grades.length === 0 ? (
              <span style={muted}>No grades have been entered yet.</span>
            ) : (
              r.grades.map((g) => (
                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 14, background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.8rem' }}>{g.courseName}</div>
                    <div style={{ fontSize: '1.3rem', color: '#9ca3af' }}>{fmtDate(g.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '2.6rem', color: GRADE_COLOR[g.grade] ?? '#374151', lineHeight: 1 }}>{g.grade}</div>
                    <div style={{ fontSize: '1.3rem', color: '#6b7280' }}>{g.score}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {att && (
          <div style={card}>
            <h3 style={h3}>My attendance</h3>
            {att.total === 0 ? (
              <span style={muted}>No attendance has been marked yet.</span>
            ) : (
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                <div><div style={{ fontWeight: 900, fontSize: '3.4rem', color: '#16a34a', lineHeight: 1 }}>{att.percentage}%</div><div style={{ color: '#6b7280', fontSize: '1.4rem' }}>present</div></div>
                <div><div style={{ fontWeight: 900, fontSize: '3.4rem', color: '#111827', lineHeight: 1 }}>{att.present}</div><div style={{ color: '#6b7280', fontSize: '1.4rem' }}>days in school</div></div>
                <div><div style={{ fontWeight: 900, fontSize: '3.4rem', color: '#dc2626', lineHeight: 1 }}>{att.absent}</div><div style={{ color: '#6b7280', fontSize: '1.4rem' }}>days away</div></div>
              </div>
            )}
          </div>
        )}

        {gate.data?.data && (
          <div style={card}>
            <h3 style={h3}>Arriving and leaving</h3>
            {gate.data.data.days.length === 0 ? (
              <span style={muted}>Nothing has been recorded in the last two weeks.</span>
            ) : (
              gate.data.data.days.map((d) => (
                <div key={d.date} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 4px', borderTop: '1px solid #f1f5f9', fontSize: '1.6rem' }}>
                  <span style={{ fontWeight: 700 }}>{new Date(d.date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span style={{ color: d.late ? '#b45309' : '#6b7280' }}>{d.arrived ? `In ${clock(d.arrived)}` : 'No arrival'}{d.left ? ` · Out ${clock(d.left)}` : ''}{d.late ? ' · Late' : ''}</span>
                </div>
              ))
            )}
          </div>
        )}

        <Week timetable={timetable.data?.data} />
      </div>
    </div>
  );
}

/** Signed in as a student: a student who turned 18 and has not claimed yet sees only the claim page (the server refuses the school pages for that token too, so nothing is even asked for). */
export default function StudentHomePage() {
  if (!isStudentSession()) return <Navigate to="/student/sign-in" replace />;
  if (studentClaims()?.claimRequired) return <StudentClaimPage />;
  return <StudentHome />;
}

