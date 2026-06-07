import { memo, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment, Divider, Button } from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';
import { ISSUE_CATEGORIES } from '../../mock';

const F = {
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

/* MUI components require targeting their inner elements to override typography */
const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '12px' },
  '& .MuiInputBase-input':    { fontSize: F.body },
  '& .MuiInputLabel-root':    { fontSize: F.body },
};

const selectSx = {
  borderRadius: '12px',
  fontSize: F.body,
  '& .MuiSelect-select': { fontSize: F.body },
};

function CommunityFeedSidebarLeft({ onFilterChange }) {
  const [filters, setFilters] = useState({ category: '', status: '', priority: '', search: '' });

  function update(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange?.(next);
  }

  function clearFilters() {
    const empty = { category: '', status: '', priority: '', search: '' };
    setFilters(empty);
    onFilterChange?.(empty);
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div style={{ padding: 'clamp(14px, 2vw, 20px)', display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.4vw, 14px)' }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#111827', fontSize: F.subH }}>
          <FilterList style={{ fontSize: 'clamp(18px, 2.2vw, 22px)', color: '#059669' }} />
          Filters
        </div>
        {hasFilters && (
          <Button
            size="small"
            startIcon={<Clear style={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />}
            onClick={clearFilters}
            style={{ color: '#6b7280', textTransform: 'none', fontSize: F.meta }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* ── Search ── */}
      <TextField
        size="small"
        placeholder="Search issues..."
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#9ca3af' }} />
            </InputAdornment>
          ),
          style: { fontSize: F.body },
        }}
        sx={inputSx}
      />

      <Divider />

      {/* ── Category ── */}
      <FormControl size="small" fullWidth>
        <InputLabel style={{ fontSize: F.body }}>Category</InputLabel>
        <Select
          value={filters.category}
          label="Category"
          onChange={(e) => update('category', e.target.value)}
          sx={selectSx}
        >
          <MenuItem value="" style={{ fontSize: F.body }}>All Categories</MenuItem>
          {ISSUE_CATEGORIES.map((c) => (
            <MenuItem key={c.id} value={c.id} style={{ fontSize: F.body }}>
              <span style={{ marginRight: 8 }}>{c.icon}</span>{c.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ── Status ── */}
      <FormControl size="small" fullWidth>
        <InputLabel style={{ fontSize: F.body }}>Status</InputLabel>
        <Select
          value={filters.status}
          label="Status"
          onChange={(e) => update('status', e.target.value)}
          sx={selectSx}
        >
          <MenuItem value="" style={{ fontSize: F.body }}>All Statuses</MenuItem>
          <MenuItem value="open" style={{ fontSize: F.body }}>Open</MenuItem>
          <MenuItem value="in_progress" style={{ fontSize: F.body }}>In Progress</MenuItem>
          <MenuItem value="resolved" style={{ fontSize: F.body }}>Resolved</MenuItem>
        </Select>
      </FormControl>

      {/* ── Priority ── */}
      <FormControl size="small" fullWidth>
        <InputLabel style={{ fontSize: F.body }}>Priority</InputLabel>
        <Select
          value={filters.priority}
          label="Priority"
          onChange={(e) => update('priority', e.target.value)}
          sx={selectSx}
        >
          <MenuItem value="" style={{ fontSize: F.body }}>All Priorities</MenuItem>
          <MenuItem value="critical" style={{ fontSize: F.body }}>Critical</MenuItem>
          <MenuItem value="high" style={{ fontSize: F.body }}>High</MenuItem>
          <MenuItem value="medium" style={{ fontSize: F.body }}>Medium</MenuItem>
          <MenuItem value="low" style={{ fontSize: F.body }}>Low</MenuItem>
        </Select>
      </FormControl>

      <Divider />

      {/* ── Quick links ── */}
      <div style={{ fontSize: F.meta, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Quick Links
      </div>
      {[
        { label: 'Report an Issue',     path: '/community/create-issue',   icon: '📝' },
        { label: 'Resolved Issues',     path: '/community/resolved',       icon: '✅' },
        { label: 'Local Leaders',       path: '/community/leaders',        icon: '👤' },
        { label: 'Community Projects',  path: '/community/projects',       icon: '🏗️' },
        { label: 'My Engagement',       path: '/community/my-engagement',  icon: '📊' },
      ].map((link) => (
        <a
          key={link.path}
          href={link.path}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 'clamp(8px, 1.2vw, 12px)',
            padding: 'clamp(8px, 1.2vw, 12px) clamp(10px, 1.4vw, 14px)',
            borderRadius: 10,
            background: '#f9fafb',
            color: '#374151',
            textDecoration: 'none',
            fontSize: F.body,
            fontWeight: 600,
            border: '1px solid #e5e7eb',
          }}
        >
          <span style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)', lineHeight: 1 }}>{link.icon}</span>
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default memo(CommunityFeedSidebarLeft);
