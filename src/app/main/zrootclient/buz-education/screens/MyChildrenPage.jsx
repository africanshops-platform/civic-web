import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Chip, CircularProgress, TextField } from '@mui/material';
import EducationPageShell from './EducationPageShell';
import { useMyChildren, useRedeemCode } from '../hooks/useEducationRepo';
import { ACCENT, levelInfo } from '../constants';

const card = { background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb', marginBottom: 20 };

/** Link your child with the code the school gave you, then follow their grades and attendance. */
export default function MyChildrenPage() {
  const { data, isLoading, isError } = useMyChildren();
  const redeem = useRedeemCode();
  const [code, setCode] = useState('');
  const children = data?.data?.children ?? [];

  return (
    <EducationPageShell title="My children" subtitle="Education · Grades, attendance and notices">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 24px', fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>My children</h1>

        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#4f46e5' }} /></div>}
        {isError && <div style={{ padding: 32, textAlign: 'center', borderRadius: 18, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 700, fontSize: '1.8rem' }}>We could not load your children. Please try again.</div>}

        {children.map((c) => (
          <div key={c.enrollmentId} style={{ ...card, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 800, color: '#111827', fontSize: '2rem' }}>{c.studentName ?? c.school.name}</div>
              <div style={{ color: '#6b7280', fontSize: '1.7rem', margin: '4px 0 10px' }}>
                {[c.studentName ? c.school.name : `Student ${String(c.studentId).slice(-6)}`, c.className ?? c.programId, levelInfo(c.school.level).label].join(' · ')}
              </div>
              <Chip
                label={c.attendance.percentage == null ? 'No attendance marked yet' : `${c.attendance.percentage}% present in the last 30 days (${c.attendance.present} of ${c.attendance.days} days)`}
                sx={{ background: c.attendance.percentage == null ? '#f3f4f6' : '#dcfce7', color: c.attendance.percentage == null ? '#4b5563' : '#166534', fontWeight: 700, fontSize: '1.4rem' }}
              />
            </div>
            <Button component={Link} to={`/education/child/${c.studentId}`} sx={{ background: ACCENT, color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.56rem', px: 3, py: 1.25 }}>
              Grades and attendance
            </Button>
          </div>
        ))}

        {!isLoading && !isError && children.length === 0 && (
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: '3.4rem' }}>👨‍👩‍👧</div>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.1rem', margin: '8px 0' }}>No child linked yet</div>
            <div style={{ color: '#6b7280', fontSize: '1.7rem' }}>Ask your child's school for a link code, then enter it below.</div>
          </div>
        )}

        <div style={card}>
          <h3 style={{ margin: '0 0 8px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Link a child</h3>
          <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '1.7rem', lineHeight: 1.6 }}>Entering the school's code is your agreement to see this child's grades and attendance. The school can end the link, and so can you by asking them.</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <TextField value={code} onChange={(e) => setCode(e.target.value.trim().toUpperCase().slice(0, 16))} placeholder="Code from the school" inputProps={{ style: { fontSize: '1.9rem', letterSpacing: '0.12em', fontWeight: 800 } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            <Button variant="contained" disabled={code.length < 4 || redeem.isLoading} onClick={() => redeem.mutate(code, { onSuccess: () => setCode('') })} sx={{ background: ACCENT, color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.7rem', px: 4 }}>
              Link my child
            </Button>
          </div>
        </div>
      </div>
    </EducationPageShell>
  );
}
