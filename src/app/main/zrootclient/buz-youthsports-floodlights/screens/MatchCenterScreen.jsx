import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBack, Videocam } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill, StatBar, TeamIdentity } from './shared/flHelpers';
import { useTournamentDetail, useMatchStats } from '../hooks/useFloodlightsRepo';
import { roundLabel } from './TournamentDetailScreen';

// Per-team totals from the real per-player rows useMatchStats returns
// (matchPlayerStat: fouls/yellowCards/redCards per player per checkpoint).
// There's no possession/shots/corners field anywhere in the schema — those
// were never real, even in the original design concept, so they're not
// rendered here rather than shown with fabricated numbers.
function teamTotals(rows, teamId) {
  return (rows ?? [])
    .filter((r) => r.teamId === teamId)
    .reduce(
      (acc, r) => ({
        fouls: acc.fouls + (r.fouls ?? 0),
        yellowCards: acc.yellowCards + (r.yellowCards ?? 0),
        redCards: acc.redCards + (r.redCards ?? 0),
      }),
      { fouls: 0, yellowCards: 0, redCards: 0 }
    );
}

function CompareBar({ label, homeVal, awayVal, homeColor, awayColor }) {
  const total = homeVal + awayVal;
  const homePct = total > 0 ? (homeVal / total) * 100 : 50;
  return (
    <div className="fl2-stack" style={{ gap: 6 }}>
      <div className="fl2-row fl2-between fl2-small">
        <span style={{ fontWeight: 700 }}>{homeVal}</span>
        <span className="fl2-muted">{label}</span>
        <span style={{ fontWeight: 700 }}>{awayVal}</span>
      </div>
      <div className="fl2-row" style={{ gap: 2 }}>
        <div className="fl2-statbar" style={{ flex: 1 }}><i style={{ width: `${homePct}%`, background: homeColor, marginLeft: 'auto' }} /></div>
        <div className="fl2-statbar" style={{ flex: 1 }}><i style={{ width: `${100 - homePct}%`, background: awayColor }} /></div>
      </div>
    </div>
  );
}

export default function MatchCenterScreen() {
  const { tournamentId, matchId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('summary');

  const { data: tData, isLoading: tLoading } = useTournamentDetail(tournamentId);
  const { data: sData, isLoading: sLoading } = useMatchStats(matchId);

  const tournament = tData?.data?.tournament;
  const teams = tournament?.teams ?? [];
  const matches = tournament?.matches ?? [];
  const match = matches.find((m) => m.id === matchId);
  const teamById = (id) => teams.find((t) => t.id === id);
  const home = match ? teamById(match.homeTeamId) : null;
  const away = match ? teamById(match.awayTeamId) : null;
  const totalRounds = useMemo(() => Math.max(1, ...matches.map((m) => m.round)), [matches]);

  const statRows = sData?.data ?? [];
  const homeTotals = teamTotals(statRows, match?.homeTeamId);
  const awayTotals = teamTotals(statRows, match?.awayTeamId);

  const loading = tLoading || sLoading;

  return (
    <FloodlightsPage title="Match Center" subtitle="Youth & Sports · Fixture Detail">
      <Button component={Link} to={`/youth-v2/tournaments/${tournamentId}`}
        startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start', color: 'var(--ink-muted)', textTransform: 'none', fontWeight: 700, fontSize: '1.4rem' }}>
        Back
      </Button>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

      {!loading && !match && (
        <div className="fl2-card"><p className="fl2-small fl2-muted">This fixture couldn't be found.</p></div>
      )}

      {!loading && match && (
        <>
          <div className="fl2-card fl2-stack" style={{ gap: 16, background: 'linear-gradient(135deg, var(--gold-tint), transparent 60%)' }}>
            <div className="fl2-row fl2-between">
              <span className="fl2-eyebrow">{roundLabel(match.round, totalRounds)}</span>
              {match.isCompleted ? <Pill variant="muted">Full time</Pill> : <Pill variant="gold">Upcoming</Pill>}
            </div>
            <div className="fl2-row" style={{ gap: 16, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}><TeamIdentity team={home} size={40} /></div>
              <div className="fl2-stack" style={{ alignItems: 'center', flexShrink: 0, minWidth: 80 }}>
                {match.isCompleted ? (
                  <span className="mono" style={{ fontWeight: 800, fontSize: '2.6rem' }}>{match.homeScore}–{match.awayScore}</span>
                ) : (
                  <span className="fl2-tiny fl2-muted" style={{ fontWeight: 800 }}>VS</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}><TeamIdentity team={away} size={40} align="right" /></div>
            </div>
          </div>

          <div className="fl2-tabs">
            {[['summary', 'Summary'], ['stats', 'Stats'], ['video', 'Video']].map(([id, label]) => (
              <button key={id} type="button" className={`fl2-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>

          {tab === 'summary' && (
            <div className="fl2-card fl2-stack" style={{ gap: 10 }}>
              <div className="fl2-row fl2-between fl2-small">
                <span className="fl2-muted">Round</span>
                <span style={{ fontWeight: 700 }}>{roundLabel(match.round, totalRounds)}</span>
              </div>
              <div className="fl2-row fl2-between fl2-small">
                <span className="fl2-muted">Status</span>
                <span style={{ fontWeight: 700 }}>{match.isCompleted ? 'Full time' : 'Not yet played'}</span>
              </div>
              {match.isCompleted && (
                <div className="fl2-row fl2-between fl2-small">
                  <span className="fl2-muted">Goals scored</span>
                  <span style={{ fontWeight: 700 }}>{match.scorerIds?.length ?? 0}</span>
                </div>
              )}
            </div>
          )}

          {tab === 'stats' && (
            statRows.length === 0 ? (
              <div className="fl2-card"><p className="fl2-small fl2-muted">Stats haven't been submitted for this fixture yet.</p></div>
            ) : (
              <div className="fl2-card fl2-stack" style={{ gap: 18 }}>
                <CompareBar label="Fouls" homeVal={homeTotals.fouls} awayVal={awayTotals.fouls} homeColor="var(--gold)" awayColor="var(--ink-muted)" />
                <CompareBar label="Yellow cards" homeVal={homeTotals.yellowCards} awayVal={awayTotals.yellowCards} homeColor="var(--gold)" awayColor="var(--ink-muted)" />
                <CompareBar label="Red cards" homeVal={homeTotals.redCards} awayVal={awayTotals.redCards} homeColor="var(--gold)" awayColor="var(--ink-muted)" />
              </div>
            )
          )}

          {tab === 'video' && (
            <div className="fl2-card fl2-stack" style={{ alignItems: 'center', textAlign: 'center', gap: 10, padding: '40px 20px' }}>
              <Videocam sx={{ fontSize: 40, color: 'var(--ink-muted)' }} />
              <span style={{ fontWeight: 700 }}>Match video coming soon</span>
              <span className="fl2-small fl2-muted" style={{ maxWidth: '32ch' }}>
                Full replays and highlights will appear here once available.
              </span>
            </div>
          )}
        </>
      )}
    </FloodlightsPage>
  );
}
