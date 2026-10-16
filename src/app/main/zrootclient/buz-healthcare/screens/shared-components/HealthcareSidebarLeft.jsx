import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FormControl, InputLabel, Select, MenuItem, Divider, Button, FormControlLabel, Switch } from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { FACILITY_TYPES } from '../../constants';
import { useMyEnrolment, useLeaveEnrolment } from '../../hooks/useHealthcareRepo';

const LINKS = [
  { label: 'Find a facility', path: '/healthcare/dashboard', icon: '🏥' },
  { label: 'Book an appointment', path: '/healthcare/book', icon: '📅' },
  { label: 'My appointments', path: '/healthcare/my-appointments', icon: '📋' },
  { label: 'My health record', path: '/healthcare/my-record', icon: '🔐' },
  { label: 'My referrals', path: '/healthcare/my-referrals', icon: '➡️' },
  { label: 'Health alerts', path: '/healthcare/alerts', icon: '⚠️' },
];

/** Type filter (only on the facility list, where the page passes one in) and the quick links. */
function MyPrimaryCard() {
  const { data } = useMyEnrolment();
  const leave = useLeaveEnrolment();
  if (!data?.enabled) return null;
  const f = data.enrolment?.facility;
  return (
    <div style={{ padding: 16, borderRadius: 14, background: '#fffbeb', border: '1px solid #fde68a' }}>
      <div style={{ fontSize: '1.4rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>My primary facility</div>
      {f ? (
        <>
          <Link to={`/healthcare/facility/${f.id}`} style={{ display: 'block', marginTop: 6, fontSize: '1.76rem', fontWeight: 800, color: '#111827', textDecoration: 'none' }}>{f.name}</Link>
          <div style={{ fontSize: '1.4rem', color: '#6b7280' }}>{f.address}, {f.lga}</div>
          <Button size="small" disabled={leave.isLoading} onClick={() => leave.mutate()} sx={{ mt: 1, px: 0, textTransform: 'none', fontSize: '1.4rem', color: '#b91c1c' }}>Leave this facility</Button>
        </>
      ) : (
        <div style={{ marginTop: 6, fontSize: '1.5rem', color: '#78350f', lineHeight: 1.5 }}>
          You have not chosen one yet. Pick a primary facility near you from the list or the map and tap Enrol here.
        </div>
      )}
    </div>
  );
}

function HealthcareSidebarLeft({ typeFilter, onTypeChange, primaryOnly, onPrimaryOnlyChange }) {
  const canFilter = typeof onTypeChange === 'function';
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <MyPrimaryCard />
      {canFilter && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: '#111827', fontSize: '1.9rem' }}>
              <FilterList sx={{ fontSize: 32, color: '#16a34a' }} /> Filter
            </div>
            {typeFilter && (
              <Button size="small" startIcon={<Clear sx={{ fontSize: 26 }} />} onClick={() => onTypeChange('')} sx={{ color: '#6b7280', textTransform: 'none', fontSize: '1.56rem', px: 1.5 }}>
                Clear
              </Button>
            )}
          </div>
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ fontSize: '1.76rem' }}>Kind of facility</InputLabel>
            <Select value={typeFilter || ''} label="Kind of facility" onChange={(e) => onTypeChange(e.target.value)} sx={{ borderRadius: '12px', fontSize: '1.76rem' }}>
              <MenuItem value="" sx={{ fontSize: '1.76rem' }}>All kinds</MenuItem>
              {FACILITY_TYPES.map((t) => (
                <MenuItem key={t.id} value={t.id} sx={{ fontSize: '1.76rem' }}>
                  <span style={{ marginRight: 10, fontSize: '1.6rem' }}>{t.icon}</span>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {typeof onPrimaryOnlyChange === 'function' && (
            <FormControlLabel
              control={<Switch checked={Boolean(primaryOnly)} onChange={(e) => onPrimaryOnlyChange(e.target.checked)} />}
              label={<span style={{ fontSize: '1.6rem' }}>Primary facilities for my area</span>}
            />
          )}
          <Divider />
        </>
      )}
      <div style={{ fontSize: '1.56rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick links</div>
      {LINKS.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#f9fafb', color: '#374151', textDecoration: 'none', fontSize: '1.76rem', fontWeight: 600, border: '1px solid #e5e7eb' }}
        >
          <span style={{ fontSize: '1.6rem' }}>{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export default memo(HealthcareSidebarLeft);
