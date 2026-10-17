import { Link, useParams } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import EducationPageShell from './EducationPageShell';
import { useChildGate, useChildRecord, useChildTimetable } from '../hooks/useEducationRepo';
import { GRADE_COLOR, fmtDate } from '../constants';

const card = { background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb', marginBottom: 20 };

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 7];
const clock = (v) => new Date(v).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

/** This week's timetable for the child's class. Hidden when the school has not switched timetables on. */
function TimetableSection({ studentId }) {
  const { data, isError } = useChildTimetable(studentId);
  const items = data?.data?.items ?? [];
  if (isError || !data) return null;

  return (
    <div style={card}>
      <h3 style={{ margin: '0 0 14px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Timetable{data.data.className ? ` · ${data.data.className}` : ''}</h3>
      {items.length === 0 ? (
        <span style={{ color: '#9ca3af', fontSize: '1.7rem' }}>The school has not set a timetable for this class yet.</span>
      ) : (
        DAY_ORDER.filter((d) => items.some((p) => p.weekday === d)).map((d) => (
          <div key={d} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1.6rem', marginBottom: 6 }}>{items.find((p) => p.weekday === d).weekdayName}</div>
            {items.filter((p) => p.weekday === d).map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 6, fontSize: '1.6rem' }}>
                <span style={{ fontWeight: 700, color: '#111827' }}>{p.courseName}</span>
                <span style={{ color: '#6b7280' }}>{p.start}–{p.end}{p.room ? ` · ${p.room}` : ''}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

/** When the child arrived at and left the school gate over the last two weeks. Hidden when the gate roll is off. */
function GateSection({ studentId }) {
  const { data, isError } = useChildGate(studentId);
  if (isError || !data) return null;
  const days = data.data?.days ?? [];

  return (
    <div style={card}>
      <h3 style={{ margin: '0 0 14px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>At the gate</h3>
      {days.length === 0 ? (
        <span style={{ color: '#9ca3af', fontSize: '1.7rem' }}>No arrivals have been recorded in the last two weeks.</span>
      ) : (
        days.map((d) => (
          <div key={d.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 6, fontSize: '1.6rem' }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{new Date(d.date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <span style={{ color: '#6b7280' }}>
              {d.arrived ? `In ${clock(d.arrived)}` : 'No arrival'}{d.left ? ` · Out ${clock(d.left)}` : ''}
              {d.late && <span style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '1.3rem' }}>Late</span>}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

/** One child's school record: grades and attendance. Fees are not shown, nothing is charged through the platform yet. */
export default function ChildPage() {
  const { studentId } = useParams();
  const { data, isLoading, isError } = useChildRecord(studentId);
  const r = data?.data;

  let body;
  if (isLoading) body = <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><CircularProgress size={56} sx={{ color: '#4f46e5' }} /></div>;
  else if (isError || !r) {
    body = <div style={{ textAlign: 'center', paddingTop: 60, color: '#dc2626', fontWeight: 700, fontSize: '1.8rem' }}>You are not linked to this student, or the record is not available.</div>;
  } else {
    const att = r.attendance.summary;
    body = (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Button component={Link} to="/education/my-children" startIcon={<ArrowBack sx={{ fontSize: 28 }} />} sx={{ mb: 2, color: '#6b7280', textTransform: 'none', fontWeight: 600, fontSize: '1.7rem', px: 0 }}>My children</Button>
        <h1 style={{ margin: '0 0 4px', fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>{r.enrollment.school.name}</h1>
        <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '1.8rem' }}>{r.enrollment.admissionNumber ? `Adm. no. ${r.enrollment.admissionNumber}` : `Student ${String(studentId).slice(-6)}`} · {r.enrollment.programId} · enrolled {fmtDate(r.enrollment.enrolledAt)}</p>

        <div style={card}>
          <h3 style={{ margin: '0 0 14px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Grades</h3>
          {r.grades.length === 0 ? (
            <span style={{ color: '#9ca3af', fontSize: '1.7rem' }}>No grades have been entered yet.</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {r.grades.map((g) => (
                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: 14, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.8rem', color: '#111827' }}>{g.courseName}</div>
                    <div style={{ fontSize: '1.4rem', color: '#9ca3af' }}>{fmtDate(g.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '2.6rem', color: GRADE_COLOR[g.grade] ?? '#374151', lineHeight: 1 }}>{g.grade}</div>
                    <div style={{ fontSize: '1.4rem', color: '#6b7280' }}>{g.score}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ margin: '0 0 14px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Attendance</h3>
          {att.total === 0 ? (
            <span style={{ color: '#9ca3af', fontSize: '1.7rem' }}>No attendance has been marked yet.</span>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 14 }}>
                <div><div style={{ fontWeight: 900, fontSize: '3.4rem', color: '#16a34a', lineHeight: 1 }}>{att.percentage}%</div><div style={{ color: '#6b7280', fontSize: '1.5rem' }}>present</div></div>
                <div><div style={{ fontWeight: 900, fontSize: '3.4rem', color: '#111827', lineHeight: 1 }}>{att.present}</div><div style={{ color: '#6b7280', fontSize: '1.5rem' }}>days present</div></div>
                <div><div style={{ fontWeight: 900, fontSize: '3.4rem', color: '#dc2626', lineHeight: 1 }}>{att.absent}</div><div style={{ color: '#6b7280', fontSize: '1.5rem' }}>days absent</div></div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {r.attendance.records.map((a) => (
                  <span key={a.id} style={{ padding: '6px 12px', borderRadius: 999, fontSize: '1.4rem', fontWeight: 700, background: a.isPresent ? '#dcfce7' : '#fee2e2', color: a.isPresent ? '#166534' : '#991b1b' }}>
                    {new Date(a.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <TimetableSection studentId={studentId} />
        <GateSection studentId={studentId} />
      </div>
    );
  }

  return <EducationPageShell title="Child's record" subtitle="Education · Grades and attendance">{body}</EducationPageShell>;
}
