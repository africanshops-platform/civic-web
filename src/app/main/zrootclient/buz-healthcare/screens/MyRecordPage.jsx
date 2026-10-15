import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Pagination, Select, TextField, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import HealthcarePageShell from './shared-components/HealthcarePageShell';
import {
  useCreateConsentCode,
  useFacilities,
  useGrantFacility,
  useRecordAccessLog,
  useRecordGrants,
  useRevokeFacility,
} from '../hooks/useHealthcareRepo';
import { LOG_ACTION, RECORD_SECTIONS, SECTION_LABEL } from '../constants';

const card = { background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb', marginBottom: 20 };
const h = { margin: '0 0 10px', fontWeight: 800, color: '#111827', fontSize: '2.1rem' };
const p = { margin: '0 0 16px', color: '#6b7280', fontSize: '1.7rem', lineHeight: 1.6 };
const SX = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };
const LOG_LIMIT = 10;

/** Your health record is yours: who may add to it, who may read it, and every time someone did. */
export default function MyRecordPage() {
  const [sp, setSp] = useSearchParams();
  const logPage = Math.max(Number(sp.get('page')) || 1, 1);
  const code = useCreateConsentCode();
  const { data: grantData, isLoading: grantsLoading } = useRecordGrants();
  const { data: logData, isLoading: logLoading } = useRecordAccessLog({ page: logPage, limit: LOG_LIMIT });
  const { data: facData } = useFacilities({ limit: 50 });
  const grant = useGrantFacility();
  const revoke = useRevokeFacility();
  const [facilityId, setFacilityId] = useState('');
  const [sections, setSections] = useState(['ALLERGIES']);
  const [until, setUntil] = useState('');
  const [purpose, setPurpose] = useState('');

  const grants = grantData?.data?.grants ?? [];
  const log = logData?.data?.data ?? [];
  const logPages = logData?.data?.totalPages ?? 1;
  const facilities = facData?.data?.data ?? [];
  const toggle = (id) => setSections((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <HealthcarePageShell title="My health record" subtitle="Healthcare · Your record, your say">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>My health record</h1>
        <p style={{ ...p, fontSize: '1.9rem', marginBottom: 28 }}>Nobody can add to it or read it unless you allow it, and you can see everyone who has.</p>

        <div style={card}>
          <h3 style={h}>Let a facility add to your record</h3>
          <p style={p}>When you are with a facility and want them to start or update your record, make a one-time code and read it to them. It works once and stops working after 10 minutes.</p>
          <Button variant="contained" disabled={code.isLoading} onClick={() => code.mutate()} sx={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: '1.7rem', px: 3, py: 1.25 }}>
            {code.isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Make a one-time code'}
          </Button>
          {code.data?.data?.code && (
            <div style={{ marginTop: 18, padding: '18px 24px', borderRadius: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'inline-block' }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '3.4rem', letterSpacing: '0.2em', color: '#16a34a' }}>{code.data.data.code}</div>
              <div style={{ color: '#6b7280', fontSize: '1.5rem' }}>Read this to the facility now. Do not send it to anyone.</div>
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={h}>Who can read your record</h3>
          {grantsLoading && <CircularProgress size={28} sx={{ color: '#16a34a' }} />}
          {!grantsLoading && grants.length === 0 && <p style={p}>No facility can read your record right now.</p>}
          {!grantsLoading && grants.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {grants.map((g) => (
                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', padding: '14px 18px', borderRadius: 14, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.8rem', color: '#111827' }}>{g.facility?.name ?? 'A facility'}</div>
                    <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>
                      {g.allowedSections.map((s) => SECTION_LABEL[s] ?? s).join(', ')}
                      {g.expiresAt ? ` · until ${new Date(g.expiresAt).toLocaleDateString('en-NG')}` : ' · until you remove it'}
                      {g.purpose ? ` · ${g.purpose}` : ''}
                    </div>
                  </div>
                  <Button color="error" disabled={revoke.isLoading} onClick={() => revoke.mutate(g.facilityId)} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.6rem' }}>
                    Remove access
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
            <div style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: 12, color: '#111827' }}>Give a facility access</div>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ fontSize: '1.7rem' }}>Facility</InputLabel>
              <Select value={facilityId} label="Facility" onChange={(e) => setFacilityId(e.target.value)} sx={{ borderRadius: '12px', fontSize: '1.7rem' }}>
                {facilities.map((f) => (
                  <MenuItem key={f.id} value={f.id} sx={{ fontSize: '1.7rem' }}>{f.name} · {f.lga}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {RECORD_SECTIONS.map((s) => (
                <FormControlLabel key={s.id} control={<Checkbox checked={sections.includes(s.id)} onChange={() => toggle(s.id)} />} label={<span style={{ fontSize: '1.6rem' }}>{s.label}</span>} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 16, marginBottom: 16 }}>
              <TextField type="date" label="Until (optional)" value={until} onChange={(e) => setUntil(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toLocaleDateString('en-CA') }} sx={SX} />
              <TextField label="Why (optional)" value={purpose} onChange={(e) => setPurpose(e.target.value.slice(0, 200))} sx={SX} />
            </div>
            <Button
              variant="contained"
              disabled={!facilityId || sections.length === 0 || grant.isLoading}
              onClick={() =>
                grant.mutate(
                  { facilityId, allowedSections: sections, expiresAt: until ? new Date(`${until}T23:59:59`).toISOString() : undefined, purpose: purpose.trim() || undefined },
                  { onSuccess: () => { setFacilityId(''); setUntil(''); setPurpose(''); } }
                )
              }
              sx={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: '1.7rem', px: 3, py: 1.25 }}
            >
              Give access
            </Button>
          </div>
        </div>

        <div style={card}>
          <h3 style={h}>Everyone who has been in your record</h3>
          {logLoading && <CircularProgress size={28} sx={{ color: '#16a34a' }} />}
          {!logLoading && log.length === 0 && <Alert severity="info" sx={{ fontSize: '1.6rem' }}>Nothing yet. Every time your record is opened or changed it is listed here.</Alert>}
          {!logLoading && log.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {log.map((l) => (
                <div key={l.id} style={{ padding: '12px 16px', borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: '1.65rem', color: '#374151' }}>
                  <strong>{LOG_ACTION[l.action] ?? l.action}</strong> {l.facilityName ?? 'a facility'}
                  {l.sections?.length ? ` · ${l.sections.map((s) => SECTION_LABEL[s] ?? s).join(', ')}` : ''}
                  <div style={{ fontSize: '1.4rem', color: '#9ca3af' }}>{new Date(l.at).toLocaleString('en-NG')}</div>
                </div>
              ))}
            </div>
          )}
          {logPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Pagination count={logPages} page={logPage} onChange={(_, pg) => setSp(pg > 1 ? { page: String(pg) } : {}, { replace: true })} />
            </div>
          )}
        </div>
      </motion.div>
    </HealthcarePageShell>
  );
}
