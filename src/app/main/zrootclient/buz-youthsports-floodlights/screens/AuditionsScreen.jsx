import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill, TeamName } from './shared/flHelpers';
import { useAuditions } from '../hooks/useFloodlightsRepo';

const SPORT_ICONS = { football: '⚽', basketball: '🏀', athletics: '🏃', volleyball: '🏐' };

export default function AuditionsScreen() {
  const { data, isLoading } = useAuditions();
  const auditions = data?.data?.auditions ?? [];
  const sportsCount = new Set(auditions.map((a) => a.sport)).size;

  return (
    <FloodlightsPage>
      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Club Auditions</span>
        <h1 style={{ fontSize: '2.8rem' }}>Auditions</h1>
        <span className="fl2-small fl2-muted">
          {auditions.length} club{auditions.length === 1 ? '' : 's'} scouting right now across {sportsCount} sport{sportsCount === 1 ? '' : 's'} — apply to the one nearest you.
        </span>
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

      {!isLoading && (
        <div className="fl2-grid-2">
          {auditions.map((a) => {
            const icon = SPORT_ICONS[(a.sport || '').toLowerCase()] || '🏆';
            return (
              <Link key={a.id} to={`/youth-v2/auditions/${a.id}`} className="fl2-card fl2-stack fl2-clickable" style={{ textDecoration: 'none', height: '100%' }}>
                <div className="fl2-row fl2-between">
                  <span className="fl2-tiny fl2-muted">{icon} {a.sport}</span>
                  <Pill variant="pos">Open</Pill>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.6rem', marginTop: 2 }}>
                  <TeamName team={{ managerId: a.clubMerchantId, teamName: `Club ${a.clubMerchantId?.slice(-6)}` }} />
                </span>
                <span className="fl2-small fl2-muted">📍 {[a.country, a.state, a.lga, a.ward].filter(Boolean).join(' / ')}</span>
                <span className="fl2-small fl2-muted">📅 {new Date(a.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <div className="fl2-stack" style={{ gap: 4, marginTop: 'auto' }}>
                  <span className="fl2-btn fl2-btn-outline fl2-btn-sm" style={{ alignSelf: 'flex-start' }}>View &amp; Apply</span>
                </div>
              </Link>
            );
          })}
          {auditions.length === 0 && <div className="fl2-small fl2-muted">No auditions open right now — check back soon.</div>}
        </div>
      )}
    </FloodlightsPage>
  );
}
