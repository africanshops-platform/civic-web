import { memo, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment, Divider, Button, Switch, FormControlLabel } from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';
import { FACILITY_TYPES } from '../../mock';

function HealthcareSidebarLeft({ onFilterChange }) {
  const [filters, setFilters] = useState({ type: '', search: '', acceptsNHIS: false });

  function update(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange?.(next);
  }

  function clearFilters() {
    const empty = { type: '', search: '', acceptsNHIS: false };
    setFilters(empty);
    onFilterChange?.(empty);
  }

  const hasFilters = filters.type || filters.search || filters.acceptsNHIS;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: '#111827', fontSize: '1.9rem' }}>
          <FilterList sx={{ fontSize: 32, color: '#16a34a' }} /> Filters
        </div>
        {hasFilters && (
          <Button size="small" startIcon={<Clear sx={{ fontSize: 26 }} />} onClick={clearFilters}
            sx={{ color: '#6b7280', textTransform: 'none', fontSize: '1.56rem', px: 1.5 }}>
            Clear
          </Button>
        )}
      </div>

      <TextField
        size="small" placeholder="Search facilities..."
        value={filters.search} onChange={(e) => update('search', e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 28, color: '#9ca3af' }} /></InputAdornment>,
          style: { fontSize: '1.76rem' },
        }}
        InputLabelProps={{ style: { fontSize: '1.76rem' } }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '1.76rem' } }}
      />

      <Divider />

      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontSize: '1.76rem' }}>Facility Type</InputLabel>
        <Select value={filters.type} label="Facility Type" onChange={(e) => update('type', e.target.value)}
          sx={{ borderRadius: '12px', fontSize: '1.76rem' }}>
          <MenuItem value="" sx={{ fontSize: '1.76rem' }}>All Types</MenuItem>
          {FACILITY_TYPES.map((t) => (
            <MenuItem key={t.id} value={t.id} sx={{ fontSize: '1.76rem' }}>
              <span style={{ marginRight: 10, fontSize: '1.6rem' }}>{t.icon}</span>{t.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            size="medium"
            checked={filters.acceptsNHIS}
            onChange={(e) => update('acceptsNHIS', e.target.checked)}
            sx={{ '& .MuiSwitch-thumb': { backgroundColor: '#16a34a' }, '& .Mui-checked + .MuiSwitch-track': { backgroundColor: '#bbf7d0' } }}
          />
        }
        label={<span style={{ fontSize: '1.76rem', fontWeight: 600, color: '#374151' }}>NHIS Accepted</span>}
      />

      <Divider />
      <div style={{ fontSize: '1.56rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Links</div>
      {[
        { label: 'Find a Facility', path: '/healthcare/dashboard', icon: '🏥' },
        { label: 'Book Appointment', path: '/healthcare/book', icon: '📅' },
        { label: 'My Appointments', path: '/healthcare/my-appointments', icon: '📋' },
        { label: 'Health Alerts', path: '/healthcare/alerts', icon: '⚠️' },
        { label: 'Find Practitioners', path: '/healthcare/practitioners', icon: '👨‍⚕️' },
      ].map((link) => (
        <a key={link.path} href={link.path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#f9fafb', color: '#374151', textDecoration: 'none', fontSize: '1.76rem', fontWeight: 600, border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '1.6rem' }}>{link.icon}</span>{link.label}
        </a>
      ))}
    </div>
  );
}

export default memo(HealthcareSidebarLeft);
