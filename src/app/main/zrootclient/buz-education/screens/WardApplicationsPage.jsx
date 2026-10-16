import { Link } from 'react-router-dom';
import { Alert, Button, Chip, CircularProgress } from '@mui/material';
import EducationPageShell from './EducationPageShell';
import { useWardAction, useWardApplications } from '../hooks/useEducationRepo';
import { fmtDate } from '../constants';

const STATUS = {
  PENDING: { label: 'With the school', bg: '#fffbeb', color: '#b45309' },
  APTITUDE_REQUIRED: { label: 'Test to take', bg: '#e0e7ff', color: '#3730a3' },
  APTITUDE_DONE: { label: 'Test received, with the school', bg: '#fffbeb', color: '#b45309' },
  WAITLISTED: { label: 'On the waiting list', bg: '#e0e7ff', color: '#3730a3' },
  OFFERED: { label: 'A place was offered', bg: '#dcfce7', color: '#166534' },
  APPROVED: { label: 'Enrolled', bg: '#dcfce7', color: '#166534' },
  REJECTED: { label: 'Not accepted', bg: '#fee2e2', color: '#991b1b' },
  OFFER_DECLINED: { label: 'Offer declined or lapsed', bg: '#f3f4f6', color: '#374151' },
  WITHDRAWN: { label: 'Withdrawn', bg: '#f3f4f6', color: '#374151' },
};
const card = { background: 'white', borderRadius: 18, padding: 22, border: '1px solid #e5e7eb', marginBottom: 14 };

function Row({ a }) {
  const act = useWardAction();
  const s = STATUS[a.status] ?? STATUS.PENDING;
  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.9rem', color: '#111827' }}>{a.childName} to {a.school?.name}</div>
          <div style={{ color: '#6b7280', fontSize: '1.5rem' }}>{a.programId} · sent {fmtDate(a.createdAt)}</div>
        </div>
        <Chip label={s.label} sx={{ fontWeight: 800, background: s.bg, color: s.color }} />
      </div>
      {a.decisionNote && <p style={{ fontSize: '1.6rem', color: '#374151', margin: '10px 0 0' }}>{a.decisionNote}</p>}
      {a.status === 'APTITUDE_REQUIRED' && (
        <Button component={Link} to={`/education/admissions/${a.id}/test`} variant="contained" sx={{ mt: 1.5, background: '#4f46e5', textTransform: 'none', fontWeight: 800, fontSize: '1.6rem' }}>Take the school's short test</Button>
      )}
      {a.status === 'OFFERED' && (
        <>
          <p style={{ fontSize: '1.6rem', color: '#374151', margin: '10px 0' }}>Answer by {fmtDate(a.offerExpiresAt)}. Accepting enrols {a.childName} and links you to their attendance, grades and notices.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="contained" disabled={act.isLoading} onClick={() => act.mutate({ id: a.id, action: 'offer', body: { accept: true } })} sx={{ background: '#16a34a', textTransform: 'none', fontWeight: 800, fontSize: '1.6rem' }}>Accept the place</Button>
            <Button disabled={act.isLoading} onClick={() => act.mutate({ id: a.id, action: 'offer', body: { accept: false } })} sx={{ textTransform: 'none', fontSize: '1.6rem', color: '#b91c1c' }}>Decline</Button>
          </div>
        </>
      )}
      {['PENDING', 'APTITUDE_REQUIRED', 'APTITUDE_DONE', 'WAITLISTED'].includes(a.status) && (
        <Button size="small" disabled={act.isLoading} onClick={() => act.mutate({ id: a.id, action: 'withdraw' })} sx={{ mt: 1, textTransform: 'none', color: '#6b7280', fontSize: '1.4rem' }}>Withdraw this application</Button>
      )}
    </div>
  );
}

/** Applications a guardian has made for children in their household. */
export default function WardApplicationsPage() {
  const { data, isLoading, isError, error } = useWardApplications();
  const items = data?.applications ?? [];
  const off = isError && error?.response?.status === 404;
  return (
    <EducationPageShell title="Applications for my child" subtitle="Education · Admissions">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 'clamp(2.6rem,4vw,3.6rem)', color: '#111827' }}>Applications for my child</h1>
        <p style={{ margin: '0 0 18px', color: '#6b7280', fontSize: '1.7rem' }}>Apply from a school's page. The school decides; a test, if it asks for one, only informs its decision.</p>
        {isLoading && <CircularProgress sx={{ color: '#4f46e5' }} />}
        {off && <Alert severity="info">Applications for a child are not available yet. They are coming soon.</Alert>}
        {isError && !off && <Alert severity="error">Could not load your applications.</Alert>}
        {!isLoading && !isError && items.length === 0 && <div style={{ color: '#6b7280', fontSize: '1.7rem' }}>No applications yet. Add your child under My household, then apply from a school's page.</div>}
        {items.map((a) => <Row key={a.id} a={a} />)}
      </div>
    </EducationPageShell>
  );
}
