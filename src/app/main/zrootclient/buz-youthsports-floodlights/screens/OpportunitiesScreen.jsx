import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill } from './shared/flHelpers';
import { useAuditions, useStaffPositions, useTeamName, STAFF_ROLES } from '../hooks/useFloodlightsRepo';
import { SPORT_ICONS } from '../mock';

const SPORTS = Object.keys(SPORT_ICONS);

// Every audition/staff position is club-authored -- there is no "platform"
// listing type -- but which club posted it was invisible on the card.
// Resolved the same way team names resolve everywhere else in Floodlights v2
// (see flHelpers.jsx's TeamName / project_floodlights_v2_port memory).
function OpportunityCard({ item, type }) {
  const clubName = useTeamName(item.clubMerchantId, 'a club');
  return (
    <Link
      to={type === 'staff' ? `/youth-v2/opportunities/staff-positions/${item.id}` : `/youth-v2/opportunities/auditions/${item.id}`}
      className="fl2-card fl2-stack fl2-clickable"
      style={{ textDecoration: 'none', height: '100%' }}
    >
      <div className="fl2-row fl2-between">
        <span className="fl2-tiny fl2-muted">
          {type === 'staff' ? '🧑‍💼' : (SPORT_ICONS[item.sport] ?? '⚽')} {type === 'staff' ? STAFF_ROLES.find((r) => r.value === item.role)?.label ?? item.role : item.sport}
        </span>
        <Pill variant="pos">Open</Pill>
      </div>
      <span style={{ fontWeight: 800, fontSize: '1.6rem', marginTop: 2 }}>
        {type === 'staff' ? item.title : `${item.sport} Audition`}
      </span>
      <span className="fl2-tiny fl2-muted">Posted by {clubName}</span>
      <span className="fl2-small fl2-muted">
        📍 {[item.lga, item.state, item.country].filter(Boolean).join(', ') || '—'}
      </span>
      {type === 'auditions' && item.scheduledDate && (
        <span className="fl2-tiny fl2-muted">📅 {new Date(item.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      )}
      {type === 'staff' && item.description && (
        <span className="fl2-tiny fl2-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {item.description}
        </span>
      )}
    </Link>
  );
}

// Auditions and staff positions are two separate club-recruitment pipelines
// with an identical browse/apply shape (see useOpportunitiesRepo.js) — one
// screen with a type switch, rather than two near-duplicate pages, keeps
// them from drifting apart visually as each pipeline evolves.
export default function OpportunitiesScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') === 'staff' ? 'staff' : 'auditions';
  const [locationFilter, setLocationFilter] = useState({ country: 'Nigeria', state: '', lga: '' });
  const [sport, setSport] = useState('');
  const [role, setRole] = useState('');

  const setType = (t) => setSearchParams(t === 'staff' ? { type: 'staff' } : {});

  const auditionsQuery = useAuditions({ sport, ...locationFilter, limit: 20 });
  const positionsQuery = useStaffPositions({ role, ...locationFilter, limit: 20 });

  const { data, isLoading } = type === 'staff' ? positionsQuery : auditionsQuery;
  const items = data?.data ?? [];

  return (
    <FloodlightsPage>
      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Get Recruited · Get Hired</span>
        <h1 style={{ fontSize: '2.8rem' }}>🎯 Opportunities</h1>
        <span className="fl2-small fl2-muted">
          Real club player auditions and staff openings — browse freely, apply once you're signed in and identity-verified.
        </span>
      </div>

      <div className="fl2-row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className={`fl2-pill ${type === 'auditions' ? 'fl2-pill-gold' : 'fl2-pill-muted'}`} style={{ padding: '9px 16px' }} onClick={() => setType('auditions')}>
          ⚽ Player Auditions
        </button>
        <button type="button" className={`fl2-pill ${type === 'staff' ? 'fl2-pill-gold' : 'fl2-pill-muted'}`} style={{ padding: '9px 16px' }} onClick={() => setType('staff')}>
          🧑‍💼 Staff Positions
        </button>
        <Link to="/youth-v2/opportunities/mine" className="fl2-pill fl2-pill-muted" style={{ padding: '9px 16px', textDecoration: 'none', marginLeft: 'auto' }}>
          My Applications →
        </Link>
      </div>

      <div className="fl2-card fl2-row" style={{ gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {type === 'auditions' ? (
          /* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child, satisfying the rule's own nesting assertion. */
          <label className="fl2-field" style={{ minWidth: 200 }}>
            <span>Sport</span>
            <select value={sport} onChange={(e) => setSport(e.target.value)}>
              <option value="">All sports</option>
              {SPORTS.map((s) => <option key={s} value={s}>{SPORT_ICONS[s]} {s}</option>)}
            </select>
          </label>
        ) : (
          /* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child, satisfying the rule's own nesting assertion. */
          <label className="fl2-field" style={{ minWidth: 200 }}>
            <span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              {STAFF_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
        )}
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
            <OpportunityCard key={item.id} item={item} type={type} />
          ))}
          {items.length === 0 && (
            <div className="fl2-small fl2-muted">
              No {type === 'staff' ? 'staff positions' : 'auditions'} open right now — check back soon.
            </div>
          )}
        </div>
      )}
    </FloodlightsPage>
  );
}
