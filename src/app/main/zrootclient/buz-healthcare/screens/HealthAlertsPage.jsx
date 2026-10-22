import { useSearchParams } from 'react-router-dom';
import { Chip, CircularProgress, Pagination } from '@mui/material';
import { motion } from 'framer-motion';
import { Warning } from '@mui/icons-material';
import HealthcarePageShell from './shared-components/HealthcarePageShell';
import { useHealthAlerts } from '../hooks/useHealthcareRepo';
import { ALERT_SEVERITY } from '../constants';

const LIMIT = 10;

export default function HealthAlertsPage() {
  const [sp, setSp] = useSearchParams();
  const page = Math.max(Number(sp.get('page')) || 1, 1);
  const { data, isLoading, isError } = useHealthAlerts({ page, limit: LIMIT });
  const alerts = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <HealthcarePageShell title="Health alerts" subtitle="Notices from the facilities in your area" hasAlerts={alerts.length > 0}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <Warning sx={{ color: '#dc2626', fontSize: '3rem' }} />
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>Health alerts</h1>
        </div>
        <p style={{ margin: '0 0 32px', color: '#6b7280', fontSize: '1.9rem', lineHeight: 1.6 }}>
          Screening days, outbreaks and other notices that approved facilities have published. Newest first.
        </p>

        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#16a34a' }} /></div>}
        {isError && <div style={{ padding: 32, textAlign: 'center', borderRadius: 18, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 700, fontSize: '1.8rem' }}>We could not load the alerts. Please try again.</div>}
        {!isLoading && !isError && alerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f0fdf4', borderRadius: 22, border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>✅</div>
            <div style={{ fontWeight: 800, color: '#166534', fontSize: '2.2rem' }}>No alerts right now</div>
            <div style={{ color: '#6b7280', fontSize: '1.8rem', marginTop: 10 }}>Nothing has been published for your area.</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {alerts.map((a) => {
            const s = ALERT_SEVERITY[a.severity] ?? ALERT_SEVERITY.INFO;
            return (
              <div key={a.id} style={{ padding: 28, borderRadius: 22, background: s.bg, border: `1px solid ${s.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '2rem', color: s.color }}>{a.title}</h3>
                  <Chip label={s.label} sx={{ height: 36, fontSize: '1.36rem', fontWeight: 800, background: s.chipBg, color: 'white' }} />
                </div>
                <p style={{ margin: '0 0 12px', fontSize: '1.8rem', color: s.color, lineHeight: 1.7 }}>{a.message}</p>
                <div style={{ fontSize: '1.5rem', color: s.color, opacity: 0.7 }}>
                  {a.lga}, {a.state} · {new Date(a.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setSp(p > 1 ? { page: String(p) } : {}, { replace: true })} size="large" />
          </div>
        )}
      </motion.div>
    </HealthcarePageShell>
  );
}
