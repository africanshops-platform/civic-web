import { useSearchParams } from 'react-router-dom';
import { Chip, CircularProgress, Pagination } from '@mui/material';
import EducationPageShell from './EducationPageShell';
import { useParentAnnouncements } from '../hooks/useEducationRepo';
import { fmtDate } from '../constants';

const LIMIT = 10;

export default function AnnouncementsPage() {
  const [sp, setSp] = useSearchParams();
  const page = Math.max(Number(sp.get('page')) || 1, 1);
  const { data, isLoading, isError } = useParentAnnouncements({ page, limit: LIMIT });
  const rows = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <EducationPageShell title="School notices" subtitle="Education · From your children's schools">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 24px', fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>School notices</h1>
        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#4f46e5' }} /></div>}
        {isError && <div style={{ padding: 32, textAlign: 'center', borderRadius: 18, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 700, fontSize: '1.8rem' }}>We could not load the notices. Please try again.</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '70px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📣</div>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem' }}>No notices yet</div>
            <div style={{ color: '#9ca3af', fontSize: '1.8rem', marginTop: 8 }}>Notices from your children's schools appear here once you have linked a child.</div>
          </div>
        )}
        {rows.map((a) => (
          <div key={a.id} style={{ background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: '2rem' }}>{a.title}</h3>
              <Chip label={a.school?.name} size="small" sx={{ background: '#eef2ff', color: '#4338ca', fontWeight: 700, fontSize: '1.3rem' }} />
            </div>
            <p style={{ margin: '0 0 8px', color: '#374151', fontSize: '1.8rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{a.body}</p>
            <div style={{ color: '#9ca3af', fontSize: '1.4rem' }}>{fmtDate(a.createdAt)}</div>
          </div>
        ))}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setSp(p > 1 ? { page: String(p) } : {}, { replace: true })} size="large" />
          </div>
        )}
      </div>
    </EducationPageShell>
  );
}
