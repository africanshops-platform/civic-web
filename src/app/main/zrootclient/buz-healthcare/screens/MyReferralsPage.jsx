import { useState } from 'react';
import { Alert, Button, Checkbox, Chip, CircularProgress, FormControlLabel, MenuItem, TextField } from '@mui/material';
import HealthcarePageShell from './shared-components/HealthcarePageShell';
import { useApproveReferral, useChildrenIActFor, useDeclineReferral, useMyReferrals } from '../hooks/useHealthcareRepo';

const SECTION_LABEL = { ALLERGIES: 'Allergies', DIAGNOSES: 'Diagnoses', MEDICATIONS: 'Medications', LAB_RESULTS: 'Lab results' };
const STATUS = {
  REQUESTED: { label: 'Waiting for you', bg: '#fef3c7', color: '#92400e' },
  APPROVED: { label: 'You approved it', bg: '#dcfce7', color: '#166534' },
  ACCEPTED: { label: 'Accepted by the facility', bg: '#dcfce7', color: '#166534' },
  COMPLETED: { label: 'Completed', bg: '#f3f4f6', color: '#374151' },
  DECLINED: { label: 'You declined', bg: '#f3f4f6', color: '#374151' },
  REJECTED: { label: 'Turned down by the facility', bg: '#fee2e2', color: '#991b1b' },
  CANCELLED: { label: 'Cancelled by the facility', bg: '#f3f4f6', color: '#374151' },
  EXPIRED: { label: 'Lapsed', bg: '#f3f4f6', color: '#374151' },
};
const day = (v) => (v ? new Date(v).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const card = { background: 'white', borderRadius: 18, padding: 22, border: '1px solid #e5e7eb', marginBottom: 14 };

function ReferralCard({ r, forDependant }) {
  const approve = useApproveReferral(forDependant);
  const decline = useDeclineReferral(forDependant);
  const [chosen, setChosen] = useState(r.proposedSections);
  const s = STATUS[r.status] ?? STATUS.REQUESTED;
  const toggle = (sec) => setChosen((c) => (c.includes(sec) ? c.filter((x) => x !== sec) : [...c, sec]));

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.9rem', color: '#111827' }}>{r.from?.name} to {r.to?.name}{r.toDepartment ? ` (${r.toDepartment})` : ''}</div>
          <div style={{ color: '#6b7280', fontSize: '1.5rem' }}>Sent {day(r.createdAt)}</div>
        </div>
        <Chip label={s.label} sx={{ fontWeight: 800, background: s.bg, color: s.color }} />
      </div>
      <p style={{ fontSize: '1.7rem', color: '#374151', margin: '12px 0' }}>Why: {r.reason}</p>

      {r.status === 'REQUESTED' && (
        <>
          <div style={{ fontSize: '1.6rem', color: '#374151', fontWeight: 700 }}>Choose what {r.to?.name} may read for a limited time:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {r.proposedSections.map((sec) => (
              <FormControlLabel key={sec} control={<Checkbox checked={chosen.includes(sec)} onChange={() => toggle(sec)} />} label={<span style={{ fontSize: '1.6rem' }}>{SECTION_LABEL[sec] ?? sec}</span>} />
            ))}
          </div>
          <div style={{ fontSize: '1.4rem', color: '#6b7280', margin: '6px 0 12px' }}>You can take the access back at any time in My health record. Answer by {day(r.expiresAt)}.</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="contained" disabled={!chosen.length || approve.isLoading} onClick={() => approve.mutate({ id: r.id, sections: chosen })} sx={{ background: '#16a34a', textTransform: 'none', fontWeight: 800, fontSize: '1.6rem' }}>Approve and share</Button>
            <Button disabled={decline.isLoading} onClick={() => decline.mutate(r.id)} sx={{ textTransform: 'none', fontSize: '1.6rem', color: '#b91c1c' }}>Decline</Button>
          </div>
        </>
      )}
      {['APPROVED', 'ACCEPTED', 'COMPLETED'].includes(r.status) && r.approvedSections?.length > 0 && (
        <div style={{ fontSize: '1.5rem', color: '#374151' }}>
          Shared: {r.approvedSections.map((x) => SECTION_LABEL[x] ?? x).join(', ')}{r.accessEndsAt ? `, until ${day(r.accessEndsAt)}` : ''}.
        </div>
      )}
    </div>
  );
}

/** Referrals sent to me, or to a child I look after, and the choice of what to share. */
export default function MyReferralsPage() {
  const [forDependant, setForDependant] = useState('');
  const { data: children = [] } = useChildrenIActFor();
  const { data, isLoading, isError, error } = useMyReferrals(forDependant || undefined);
  const items = data?.items ?? [];
  const off = isError && error?.response?.status === 404;

  return (
    <HealthcarePageShell title="Referrals" subtitle="Healthcare · Referrals">
      <div style={{ padding: 28, maxWidth: 900 }}>
        <h2 style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 'clamp(2.6rem, 4vw, 3.4rem)', color: '#111827' }}>My referrals</h2>
        <p style={{ margin: '0 0 18px', color: '#6b7280', fontSize: '1.7rem' }}>
          When a facility sends you to another, nothing is shared until you approve it, and only what you choose, for a limited time.
        </p>
        {children.length > 0 && (
          <TextField select size="small" label="Acting for" value={forDependant} onChange={(e) => setForDependant(e.target.value)} sx={{ mb: 2, minWidth: 260 }}>
            <MenuItem value="">Myself</MenuItem>
            {children.map((c) => <MenuItem key={c.id} value={c.id}>{c.fullName} ({c.age})</MenuItem>)}
          </TextField>
        )}
        {isLoading && <CircularProgress sx={{ color: '#16a34a' }} />}
        {off && <Alert severity="info">Referrals are not available yet. They are coming soon.</Alert>}
        {isError && !off && <Alert severity="error">Could not load your referrals. Please try again.</Alert>}
        {!isLoading && !isError && items.length === 0 && <div style={{ color: '#6b7280', fontSize: '1.7rem' }}>No referrals.</div>}
        {items.map((r) => <ReferralCard key={`${r.id}-${forDependant}`} r={r} forDependant={forDependant || undefined} />)}
      </div>
    </HealthcarePageShell>
  );
}
