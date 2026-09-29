import { memo, useState } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem,
  TextField, InputAdornment, Divider, Button,
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';
import { ELECTION_TYPES } from '../../mock';

/* ── Civic responsive font tokens ── */
const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  icon:        'clamp(22px,    2.6vw, 32px)',
};

function GovernanceSidebarLeft({ onFilterChange }) {
  const [filters, setFilters] = useState({ type: '', status: '', search: '' });

  function update(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange?.(next);
  }

  function clearFilters() {
    const empty = { type: '', status: '', search: '' };
    setFilters(empty);
    onFilterChange?.(empty);
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div style={{ padding: 'clamp(16px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 1.8vw, 20px)' }}>

      {/* ── Section header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: '#111827', fontSize: F.sectionHead }}>
          <FilterList sx={{ fontSize: F.icon, color: '#1d4ed8' }} />
          Filters
        </div>
        {hasFilters && (
          <Button
            size="small"
            startIcon={<Clear sx={{ fontSize: F.icon }} />}
            onClick={clearFilters}
            sx={{ color: '#6b7280', textTransform: 'none', fontSize: F.small, px: 1.5 }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* ── Search field ── */}
      <TextField
        size="small"
        placeholder="Search elections..."
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: F.icon, color: '#9ca3af' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': { borderRadius: '12px' },
          '& .MuiInputBase-input': { fontSize: F.label },
          '& .MuiInputBase-input::placeholder': { fontSize: F.label },
        }}
      />

      <Divider />

      {/* ── Election type ── */}
      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontSize: F.label }}>Election Type</InputLabel>
        <Select
          value={filters.type}
          label="Election Type"
          onChange={(e) => update('type', e.target.value)}
          sx={{ borderRadius: '12px', fontSize: F.label, '& .MuiSelect-select': { fontSize: F.label } }}
        >
          <MenuItem value="" sx={{ fontSize: F.label }}>All Types</MenuItem>
          {ELECTION_TYPES.map((t) => (
            <MenuItem key={t.id} value={t.id} sx={{ fontSize: F.label }}>
              <span style={{ marginRight: 10, fontSize: F.body }}>{t.icon}</span>
              {t.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ── Status ── */}
      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontSize: F.label }}>Status</InputLabel>
        <Select
          value={filters.status}
          label="Status"
          onChange={(e) => update('status', e.target.value)}
          sx={{ borderRadius: '12px', fontSize: F.label, '& .MuiSelect-select': { fontSize: F.label } }}
        >
          <MenuItem value=""           sx={{ fontSize: F.label }}>All Statuses</MenuItem>
          <MenuItem value="upcoming"   sx={{ fontSize: F.label }}>Upcoming</MenuItem>
          <MenuItem value="ongoing"    sx={{ fontSize: F.label }}>Ongoing / Live</MenuItem>
          <MenuItem value="completed"  sx={{ fontSize: F.label }}>Completed</MenuItem>
        </Select>
      </FormControl>

      <Divider />

      {/* ── Quick links ── */}
      <div style={{ fontSize: F.small, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Quick Links
      </div>
      {[
        { label: 'My Voting History', path: '/governance/my-votes',               icon: '🗳️' },
        { label: 'Sign a Petition',   path: '/governance/participate',             icon: '✍️' },
        { label: 'Live Results',      path: '/governance/elections/elec_001/live/manage', icon: '📊' },
        { label: 'All Elections',     path: '/governance/elections',               icon: '🏛️' },
        { label: 'Dashboard',         path: '/governance/dashboard',               icon: '📋' },
      ].map((link) => (
        <a
          key={link.path}
          href={link.path}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(8px, 1.2vw, 14px)',
            padding: 'clamp(10px, 1.2vw, 14px) clamp(10px, 1.4vw, 16px)',
            borderRadius: 12,
            background: '#f9fafb',
            color: '#374151',
            textDecoration: 'none',
            fontSize: F.body,
            fontWeight: 600,
            border: '1px solid #e5e7eb',
          }}
        >
          <span style={{ fontSize: F.body }}>{link.icon}</span>
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default memo(GovernanceSidebarLeft);
