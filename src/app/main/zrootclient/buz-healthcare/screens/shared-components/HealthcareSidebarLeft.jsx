import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FormControl, InputLabel, Select, MenuItem, Divider, Button } from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { FACILITY_TYPES } from '../../constants';

const LINKS = [
  { label: 'Find a facility', path: '/healthcare/dashboard', icon: '🏥' },
  { label: 'Book an appointment', path: '/healthcare/book', icon: '📅' },
  { label: 'My appointments', path: '/healthcare/my-appointments', icon: '📋' },
  { label: 'My health record', path: '/healthcare/my-record', icon: '🔐' },
  { label: 'Health alerts', path: '/healthcare/alerts', icon: '⚠️' },
];

/** Type filter (only on the facility list, where the page passes one in) and the quick links. */
function HealthcareSidebarLeft({ typeFilter, onTypeChange }) {
  const canFilter = typeof onTypeChange === 'function';
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
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
