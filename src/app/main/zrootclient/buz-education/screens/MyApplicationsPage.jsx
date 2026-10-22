import { Link } from 'react-router-dom';
import { Button, Chip, CircularProgress } from '@mui/material';
import EducationPageShell from './EducationPageShell';
import { useMyApplications } from '../hooks/useEducationRepo';
import { ACCENT, APPLICATION_STATUS, fmtDate } from '../constants';

export default function MyApplicationsPage() {
  const { data, isLoading, isError } = useMyApplications();
  const rows = data?.data?.applications ?? [];

  return (
    <EducationPageShell title="My applications" subtitle="Education · Where each one stands">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 24px', fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>My applications</h1>
        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#4f46e5' }} /></div>}
        {isError && <div style={{ padding: 32, textAlign: 'center', borderRadius: 18, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 700, fontSize: '1.8rem' }}>We could not load your applications. Please try again.</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '70px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📝</div>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem', marginBottom: 16 }}>No applications yet</div>
            <Button component={Link} to="/education/schools" sx={{ background: ACCENT, color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.7rem', px: 4, py: 1.25 }}>Find a school</Button>
          </div>
        )}
        {rows.map((a) => {
          const st = APPLICATION_STATUS[a.status] ?? APPLICATION_STATUS.PENDING;
          return (
            <div key={a.id} style={{ background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                <div style={{ fontWeight: 800, color: '#111827', fontSize: '2rem' }}>{a.school?.name ?? 'School'}</div>
                <Chip label={st.label} sx={{ background: st.bg, color: st.color, fontWeight: 800, fontSize: '1.4rem' }} />
              </div>
              <div style={{ color: '#6b7280', fontSize: '1.7rem' }}>{a.programId} · applied {fmtDate(a.createdAt)} · start {fmtDate(a.intendedStartDate)}</div>
              {a.decisionNote && <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, background: '#f9fafb', color: '#374151', fontSize: '1.6rem' }}>From the school: {a.decisionNote}</div>}
            </div>
          );
        })}
      </div>
    </EducationPageShell>
  );
}
