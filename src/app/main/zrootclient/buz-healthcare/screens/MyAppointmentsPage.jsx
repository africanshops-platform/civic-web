import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Chip, CircularProgress, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import { CalendarToday } from '@mui/icons-material';
import HealthcarePageShell from './shared-components/HealthcarePageShell';
import { useChildrenIActFor, useMyAppointments, useCancelAppointment } from '../hooks/useHealthcareRepo';
import { APPT_STATUS, formatWhen } from '../constants';

const LIMIT = 10;
const CAN_CANCEL = ['PENDING', 'CONFIRMED'];

export default function MyAppointmentsPage() {
  const [sp, setSp] = useSearchParams();
  const page = Math.max(Number(sp.get('page')) || 1, 1);
  const forDependant = sp.get('for') || '';
  const { data: children = [] } = useChildrenIActFor();
  const { data, isLoading, isError } = useMyAppointments({ page, limit: LIMIT, forDependant: forDependant || undefined });
  const cancel = useCancelAppointment();
  const [target, setTarget] = useState(null);
  const [reason, setReason] = useState('');
  const rows = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <HealthcarePageShell title="My appointments" subtitle="Healthcare · Your visits">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>
              <CalendarToday sx={{ fontSize: 'inherit', color: '#16a34a', mr: 1, verticalAlign: 'middle' }} />
              My appointments
            </h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '1.8rem' }}>{total} in all</p>
          </div>
          <Button component={Link} to="/healthcare/book" variant="contained" sx={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: '1.76rem', px: 3, py: 1.5 }}>
            Book a new one
          </Button>
        </div>

        {children.length > 0 && (
          <TextField select size="small" label="Acting for" value={forDependant} onChange={(e) => setSp(e.target.value ? { for: e.target.value } : {})} sx={{ mb: 2, minWidth: 260 }}>
            <MenuItem value="">Myself</MenuItem>
            {children.map((c) => <MenuItem key={c.id} value={c.id}>{c.fullName} ({c.age})</MenuItem>)}
          </TextField>
        )}
        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#16a34a' }} /></div>}
        {isError && <div style={{ padding: 32, textAlign: 'center', borderRadius: 18, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 700, fontSize: '1.8rem' }}>We could not load your appointments. Please try again.</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>📋</div>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem', marginBottom: 10 }}>No appointments yet</div>
            <div style={{ color: '#9ca3af', fontSize: '1.8rem' }}>Book your first visit with a facility near you.</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {rows.map((a) => {
            const st = APPT_STATUS[a.status] ?? APPT_STATUS.PENDING;
            return (
              <div key={a.id} style={{ padding: 28, borderRadius: 22, background: 'white', border: '1px solid #e5e7eb', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: '2rem' }}>{a.facility?.name ?? 'Facility'}</div>
                    <Chip label={st.label} sx={{ height: 36, fontSize: '1.4rem', background: st.bg, color: st.color, fontWeight: 800 }} />
                  </div>
                  <div style={{ color: '#374151', fontSize: '1.8rem', fontWeight: 700 }}>{formatWhen(a.slotStart ?? a.preferredDate)}</div>
                  <div style={{ color: '#6b7280', fontSize: '1.7rem', margin: '4px 0' }}>
                    {a.departmentId}
                    {a.practitioner?.name ? ` · ${a.practitioner.name}` : ''}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '1.6rem' }}>For: {a.reason}</div>
                  {a.facilityNote && <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 12, background: '#f0fdf4', color: '#166534', fontSize: '1.6rem' }}>From the facility: {a.facilityNote}</div>}
                  {a.cancellationNote && a.status === 'CANCELLED' && <div style={{ marginTop: 8, color: '#991b1b', fontSize: '1.6rem' }}>Reason: {a.cancellationNote}</div>}
                  {a.facility?.address && <div style={{ marginTop: 8, color: '#9ca3af', fontSize: '1.5rem' }}>{a.facility.address}{a.facility.phone ? ` · ${a.facility.phone}` : ''}</div>}
                </div>
                {CAN_CANCEL.includes(a.status) && (
                  <Button onClick={() => { setTarget(a); setReason(''); }} sx={{ color: '#dc2626', border: '1px solid #fecaca', borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '1.6rem', px: 2.5, flexShrink: 0 }}>
                    Cancel
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setSp({ ...(forDependant ? { for: forDependant } : {}), ...(p > 1 ? { page: String(p) } : {}) }, { replace: true })} size="large" />
          </div>
        )}
      </motion.div>

      <Dialog open={Boolean(target)} onClose={() => setTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Cancel this appointment?</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline rows={2} label="Why? (optional)" value={reason} onChange={(e) => setReason(e.target.value.slice(0, 280))} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTarget(null)}>Keep it</Button>
          <Button color="error" variant="contained" disabled={cancel.isLoading} onClick={() => cancel.mutate({ appointmentId: target.id, reason: reason.trim() || undefined, forDependant: forDependant || undefined }, { onSuccess: () => setTarget(null) })}>
            Cancel appointment
          </Button>
        </DialogActions>
      </Dialog>
    </HealthcarePageShell>
  );
}
