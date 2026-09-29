import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill } from './shared/flHelpers';
import { useTournaments } from '../hooks/useFloodlightsRepo';
import { SPORT_ICONS } from '../mock';

export default function TournamentsScreen() {
  const { data, isLoading } = useTournaments();
  const tournaments = data?.data?.tournaments ?? [];
  const sportsCount = new Set(tournaments.map((t) => t.sport)).size;

  return (
    <FloodlightsPage title="Tournaments" subtitle="Youth & Sports · Live · Upcoming · Register">
      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Live · Upcoming · Register</span>
        <h1 style={{ fontSize: '2.8rem' }}>Tournaments</h1>
        <span className="fl2-small fl2-muted">
          {tournaments.length} running across {sportsCount} sports — season-long leagues and periodic knockout brackets, side by side.
        </span>
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

      {!isLoading && (
        <div className="fl2-grid-2">
          {tournaments.map((t) => {
            const isKnockout = t.format === 'KNOCKOUT';
            const icon = SPORT_ICONS?.[(t.sport || '').toLowerCase()] || (isKnockout ? '🎮' : '⚽');
            const cta = isKnockout ? 'View Bracket' : 'View Standings';
            return (
              <Link key={t.id} to={`/youth-v2/tournaments/${t.id}`} className="fl2-card fl2-stack fl2-clickable" style={{ textDecoration: 'none', height: '100%' }}>
                <div className="fl2-row fl2-between">
                  <span className="fl2-tiny fl2-muted">{icon} {t.sport}</span>
                  {t.status === 'ongoing'
                    ? <Pill variant="live" live>LIVE</Pill>
                    : <Pill variant="gold">{t.status}</Pill>}
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.6rem', marginTop: 2 }}>{t.title}</span>
                <span className="fl2-small fl2-muted">📍 {t.venue || '—'}</span>
                <div className="fl2-row fl2-between" style={{ marginTop: 6 }}>
                  <Pill variant="muted">{t.format}</Pill>
                  <span className="fl2-tiny fl2-muted">{t.teamsRegistered ?? 0}/{t.maxTeams} {isKnockout ? 'players' : 'teams'} registered</span>
                </div>
                <div className="fl2-stack" style={{ gap: 4, marginTop: 'auto' }}>
                  <span className="fl2-btn fl2-btn-outline fl2-btn-sm" style={{ alignSelf: 'flex-start' }}>{cta}</span>
                  {isKnockout && t.status === 'upcoming' && <span className="fl2-tiny" style={{ color: 'var(--gold)' }}>Registration opening soon</span>}
                </div>
              </Link>
            );
          })}
          {tournaments.length === 0 && <div className="fl2-small fl2-muted">No tournaments right now.</div>}
        </div>
      )}
    </FloodlightsPage>
  );
}
