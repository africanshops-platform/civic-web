import { memo, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FormControl, InputLabel, Select, MenuItem,
  TextField, InputAdornment, Divider, Button, FormControlLabel, Switch,
} from '@mui/material';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import useElectionFilters, { ELECTIONS_PATH } from '../../hooks/useElectionFilters';
import { Search, FilterList, Clear } from '@mui/icons-material';
import { ELECTION_LEVELS } from '../../constants';

/* ── Civic responsive font tokens ── */
const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  icon:        'clamp(22px,    2.6vw, 32px)',
};

function GovernanceSidebarLeft({ onFilterChange }) {
  const { isAuthenticated } = useCivicWebAuth();
  const { filters, setFilters, clear, dwelling, hasFilters } = useElectionFilters();

  // Pages that keep their own copy of the filters (the dashboard) are told about every change, including the one in the address bar.
  useEffect(() => {
    onFilterChange?.({ type: filters.level, level: filters.level, status: filters.status, search: filters.search, area: filters.area, dwelling });
  }, [filters.level, filters.status, filters.search, filters.area, dwelling, onFilterChange]);

  const update = (key, value) => setFilters({ [key === 'type' ? 'level' : key]: value });

  // Typing is applied as you go on the list itself; from any other page it waits for Enter, because applying it moves you to the list.
  const { pathname } = useLocation();
  const onList = pathname === ELECTIONS_PATH;
  const [searchText, setSearchText] = useState(filters.search);
  useEffect(() => { setSearchText(filters.search); }, [filters.search]);
  useEffect(() => {
    if (!onList || searchText === filters.search) return undefined;
    const t = setTimeout(() => setFilters({ search: searchText }), 350);
    return () => clearTimeout(t);
  }, [onList, searchText, filters.search, setFilters]);
  const clearFilters = clear;

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
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') update('search', searchText); }}
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
          value={filters.level}
          label="Election Type"
          onChange={(e) => update('type', e.target.value)}
          sx={{ borderRadius: '12px', fontSize: F.label, '& .MuiSelect-select': { fontSize: F.label } }}
        >
          <MenuItem value="" sx={{ fontSize: F.label }}>All Types</MenuItem>
          {ELECTION_LEVELS.map((t) => (
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
          <MenuItem value="ongoing"    sx={{ fontSize: F.label }}>Voting open</MenuItem>
          <MenuItem value="completed"  sx={{ fontSize: F.label }}>Closed</MenuItem>
        </Select>
      </FormControl>

      {/* ── My area ── */}
      {isAuthenticated && (
        <div>
          <FormControlLabel
            control={<Switch checked={filters.area} disabled={!dwelling} onChange={(e) => setFilters({ area: e.target.checked })} />}
            label={<span style={{ fontSize: F.label, fontWeight: 600 }}>Only votes I can vote in</span>}
          />
          <div style={{ fontSize: F.small, color: '#6b7280', marginTop: 2 }}>
            {dwelling ? `Your area: ${dwelling.lga}, ${dwelling.state}` : 'Set where you live on your civic profile to use this.'}
          </div>
        </div>
      )}

      <Divider />

      {/* ── Quick links ── */}
      <div style={{ fontSize: F.small, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Quick Links
      </div>
      {[
        { label: 'My Voting History', path: '/governance/my-votes',               icon: '🗳️' },
        { label: 'Sign a Petition',   path: '/governance/participate',             icon: '✍️' },
        { label: 'Open now',          path: '/governance/elections?status=ongoing', icon: '🔴' },
        { label: 'All Elections',     path: '/governance/elections',               icon: '🏛️' },
        { label: 'Dashboard',         path: '/governance/dashboard',               icon: '📋' },
      ].map((link) => (
        <Link
          key={link.path}
          to={link.path}
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
        </Link>
      ))}
    </div>
  );
}

export default memo(GovernanceSidebarLeft);
