import { useParams, Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Avatar, Pill } from './shared/flHelpers';
import { usePlayers, useIsWatchingPlayer, useWatchPlayer, useUnwatchPlayer } from '../hooks/useFloodlightsRepo';

// The artifact's own watchlist was client-only state (state.watchlist, a
// plain Set, never persisted to a backend) — now a real PlayerWatchlist
// record (youthsports-service), scoped to the logged-in platform user.
export default function PlayerScreen() {
  const { clubMerchantId, playerId } = useParams();
  const { data, isLoading } = usePlayers(clubMerchantId);
  const { isWatching } = useIsWatchingPlayer(playerId);
  const watchMutation = useWatchPlayer();
  const unwatchMutation = useUnwatchPlayer();

  const player = data?.data?.players?.find((p) => p.id === playerId);

  return (
    <FloodlightsPage title="Player Profile" subtitle="Youth & Sports · Roster">
      <Button component={Link} to={`/youth-v2/clubs/${clubMerchantId}`} startIcon={<ArrowBack />}
        sx={{ alignSelf: 'flex-start', color: 'var(--ink-muted)', textTransform: 'none', fontWeight: 700, fontSize: '1.4rem' }}>
        Back to club
      </Button>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

      {!isLoading && !player && <div className="fl2-small" style={{ color: 'var(--card-red)' }}>Player not found.</div>}

      {player && (
        <>
          <div className="fl2-card fl2-row fl2-between" style={{ background: 'linear-gradient(135deg, var(--gold-tint), transparent 60%)', flexWrap: 'wrap', gap: 16 }}>
            <div className="fl2-row" style={{ gap: 16 }}>
              <Avatar name={player.fullName} size={72} />
              <div className="fl2-stack" style={{ gap: 4 }}>
                <h1 style={{ fontSize: '2.2rem' }}>{player.fullName}</h1>
                <span className="fl2-small fl2-muted">
                  {player.position || 'Position not set'}{player.jerseyNumber != null ? ` · #${player.jerseyNumber}` : ''}
                </span>
                <div className="fl2-row" style={{ gap: 6, marginTop: 4 }}>
                  {player.isActive ? <Pill variant="pos">Active</Pill> : <Pill variant="muted">Inactive</Pill>}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="fl2-btn fl2-btn-outline fl2-btn-sm"
              disabled={watchMutation.isLoading || unwatchMutation.isLoading}
              onClick={() => (isWatching ? unwatchMutation.mutate(playerId) : watchMutation.mutate(playerId))}
            >
              {isWatching ? '★ On watchlist' : '☆ Watchlist'}
            </button>
          </div>

          <div className="fl2-card fl2-stack">
            <span className="fl2-eyebrow">Player details</span>
            <div className="fl2-stack" style={{ gap: 9 }}>
              <div className="fl2-row fl2-between fl2-small"><span className="fl2-muted">Position</span><span style={{ fontWeight: 700 }}>{player.position || '—'}</span></div>
              <div className="fl2-row fl2-between fl2-small"><span className="fl2-muted">Squad number</span><span style={{ fontWeight: 700 }}>{player.jerseyNumber != null ? `#${player.jerseyNumber}` : '—'}</span></div>
              <div className="fl2-row fl2-between fl2-small"><span className="fl2-muted">Status</span><span style={{ fontWeight: 700 }}>{player.isActive ? 'Active on roster' : 'Inactive'}</span></div>
            </div>
          </div>

          <div className="fl2-card fl2-stack">
            <span className="fl2-eyebrow">Season stats</span>
            <span className="fl2-small fl2-muted">
              Per-match fouls and cards are recorded by match officials but only aggregated for admin coordinators today —
              a public season stat line for this player isn't available yet.
            </span>
          </div>
        </>
      )}
    </FloodlightsPage>
  );
}
