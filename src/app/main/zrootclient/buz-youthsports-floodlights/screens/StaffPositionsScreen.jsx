import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill, TeamName } from './shared/flHelpers';
import { useStaffPositions, STAFF_ROLES } from '../hooks/useFloodlightsRepo';

// Every staff position is club-authored -- there is no "platform" listing
// type -- resolved the same way team names resolve everywhere else in
// Floodlights v2 (see flHelpers.jsx's TeamName).
function StaffPositionCard({ item }) {
  return (
    <Link to={`/youth-v2/staff-positions/${item.id}`} className="fl2-card fl2-stack fl2-clickable" style={{ textDecoration: 'none', height: '100%' }}>
      <div className="fl2-row fl2-between">
        <span className="fl2-tiny fl2-muted">🧑‍💼 {STAFF_ROLES.find((r) => r.value === item.role)?.label ?? item.role}</span>
        <Pill variant="pos">Open</Pill>
      </div>
      <span style={{ fontWeight: 800, fontSize: '1.6rem', marginTop: 2 }}>{item.title}</span>
      <span className="fl2-tiny fl2-muted">
        Posted by <TeamName team={{ managerId: item.clubMerchantId, teamName: `Club ${item.clubMerchantId?.slice(-6)}` }} />
      </span>
      <span className="fl2-small fl2-muted">
        📍 {[item.lga, item.state, item.country].filter(Boolean).join(', ') || '—'}
      </span>
      {item.description && (
        <span className="fl2-tiny fl2-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {item.description}
        </span>
      )}
    </Link>
  );
}

// Staff-position browse — Feature A (2026-09-12), mirrors AuditionsScreen.jsx's
// layout/structure (sibling pipeline, same lifecycle, different fields).
export default function StaffPositionsScreen() {
  const [locationFilter, setLocationFilter] = useState({ country: 'Nigeria', state: '', lga: '' });
  const [role, setRole] = useState('');

  const { data, isLoading } = useStaffPositions({ role, ...locationFilter, limit: 20 });
  const items = data?.data ?? [];

  return (
    <FloodlightsPage>
      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Club Staff Openings</span>
        <h1 style={{ fontSize: '2.8rem' }}>Staff Positions</h1>
        <span className="fl2-small fl2-muted">
          Coach, Assistant Coach, Team Manager, and Physio roles open at real clubs — browse freely, apply once you're signed in and identity-verified.
        </span>
      </div>

      <div className="fl2-row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <Link to="/youth-v2/staff-positions/mine" className="fl2-pill fl2-pill-muted" style={{ padding: '9px 16px', textDecoration: 'none', marginLeft: 'auto' }}>
          My Applications →
        </Link>
      </div>

      <div className="fl2-card fl2-row" style={{ gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child, satisfying the rule's own nesting assertion. */}
        <label className="fl2-field" style={{ minWidth: 200 }}>
          <span>Role</span>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            {STAFF_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child, satisfying the rule's own nesting assertion. */}
        <label className="fl2-field" style={{ minWidth: 160 }}>
          <span>State</span>
          <input value={locationFilter.state} placeholder="e.g. Lagos"
            onChange={(e) => setLocationFilter((p) => ({ ...p, state: e.target.value }))} />
        </label>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child, satisfying the rule's own nesting assertion. */}
        <label className="fl2-field" style={{ minWidth: 160 }}>
          <span>LGA</span>
          <input value={locationFilter.lga} placeholder="e.g. Ikeja"
            onChange={(e) => setLocationFilter((p) => ({ ...p, lga: e.target.value }))} />
        </label>
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

      {!isLoading && (
        <div className="fl2-grid-3">
          {items.map((item) => (
            <StaffPositionCard key={item.id} item={item} />
          ))}
          {items.length === 0 && (
            <div className="fl2-small fl2-muted">No staff positions open right now — check back soon.</div>
          )}
        </div>
      )}
    </FloodlightsPage>
  );
}
