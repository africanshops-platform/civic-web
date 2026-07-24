import { memo, useState } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem,
  TextField, InputAdornment, Divider, Button,
} from '@mui/material';
import { FilterList, Clear, LocationOn } from '@mui/icons-material';

const AGE_GROUPS = ['U15', 'U18', '18-25', 'OPEN'];

/* ── Shared responsive font tokens matching YouthSportsDashboardContent ── */
const F = {
  sectionHead:   'clamp(1.76rem, 2.6vw, 2.2rem)',   /* "Filters", section titles  */
  body:          'clamp(1.56rem, 2.2vw, 1.9rem)',    /* input placeholder, link text */
  label:         'clamp(1.44rem, 2vw, 1.76rem)',     /* InputLabel, MenuItem         */
  small:         'clamp(1.3rem,  1.8vw, 1.56rem)',   /* section divider label, clear */
  icon:          'clamp(22px,    2.6vw, 32px)',
};

const SX_INPUT  = { fontSize: F.label };
const SX_SELECT = { borderRadius: '12px', fontSize: F.label };
const SX_ITEM   = { fontSize: F.label };

function YouthSportsSidebarLeft({ onFilterChange }) {
  const [filters, setFilters] = useState({ sport: '', ageGroup: '', lga: '' });

  function update(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange?.(next);
  }

  function clearFilters() {
    const empty = { sport: '', ageGroup: '', lga: '' };
    setFilters(empty);
    onFilterChange?.(empty);
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div style={{ padding: 'clamp(16px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 1.8vw, 20px)' }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: '#111827', fontSize: F.sectionHead }}>
          <FilterList sx={{ fontSize: F.icon, color: '#ea580c' }} />
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

      {/* ── LGA ── */}
      <TextField
        size="small"
        placeholder="Filter by LGA..."
        value={filters.lga}
        onChange={(e) => update('lga', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOn sx={{ fontSize: F.icon, color: '#9ca3af' }} />
            </InputAdornment>
          ),
          style: SX_INPUT,
        }}
        InputLabelProps={{ style: SX_INPUT }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: F.label } }}
      />

      <Divider />

      {/* ── Sport ── */}
      <TextField
        size="small"
        placeholder="Filter by sport..."
        value={filters.sport}
        onChange={(e) => update('sport', e.target.value)}
        InputProps={{ style: SX_INPUT }}
        InputLabelProps={{ style: SX_INPUT }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: F.label } }}
      />

      {/* ── Age group select ── */}
      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontSize: F.label }}>Age Group</InputLabel>
        <Select
          value={filters.ageGroup}
          label="Age Group"
          onChange={(e) => update('ageGroup', e.target.value)}
          sx={SX_SELECT}
        >
          <MenuItem value="" sx={SX_ITEM}>All Ages</MenuItem>
          {AGE_GROUPS.map((a) => <MenuItem key={a} value={a} sx={SX_ITEM}>{a}</MenuItem>)}
        </Select>
      </FormControl>

      <Divider />

      {/* ── Quick links ── */}
      <div style={{ fontSize: F.small, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Quick Links
      </div>
      {[
        { label: 'All Programmes',  path: '/youth/programs',   icon: '📚' },
        { label: 'Tournaments',     path: '/youth/tournaments', icon: '🏆' },
        { label: 'Talent Directory',path: '/youth/talents',     icon: '🌟' },
        { label: 'Find a Mentor',   path: '/youth/mentors',     icon: '🤝' },
        { label: 'My Programmes',   path: '/youth/dashboard',   icon: '📊' },
      ].map((link) => (
        <a
          key={link.path}
          href={link.path}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 'clamp(8px, 1.2vw, 14px)',
            padding: 'clamp(10px, 1.2vw, 14px) clamp(10px, 1.4vw, 16px)',
            borderRadius: 12,
            background: '#f9fafb', color: '#374151',
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

export default memo(YouthSportsSidebarLeft);
