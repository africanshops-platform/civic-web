import { Link, useParams } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import EducationPageShell from './EducationPageShell';
import { useChildRecord } from '../hooks/useEducationRepo';
import { GRADE_COLOR, fmtDate } from '../constants';

const card = { background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb', marginBottom: 20 };

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
        <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '1.8rem' }}>Student {String(studentId).slice(-6)} · {r.enrollment.programId} · enrolled {fmtDate(r.enrollment.enrolledAt)}</p>

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
      </div>
    );
  }

  return <EducationPageShell title="Child's record" subtitle="Education · Grades and attendance">{body}</EducationPageShell>;
}
