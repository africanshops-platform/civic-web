import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { FormDots, Pill, TeamName, TeamIdentity, computeForm } from './shared/flHelpers';
import { useTournamentDetail, useEnrollInTournament, useMyTournamentEnrollments } from '../hooks/useFloodlightsRepo';
import { SPORT_ICONS } from '../mock';

// Phase 7 of the club-recruitment pipeline (2026-08-30) — direct individual
// enrollment, only for participationMode: SINGLE tournaments (e.g. athletics,
// chess) where "register a team" was never the right shape. TEAM-mode
// tournaments have no citizen-facing registration UI on this screen at all
// yet (that's a separate, not-yet-built slice), so this button only ever
// appears for SINGLE — it doesn't gate/replace anything pre-existing.
function EnrollPanel({ tournament }) {
  const [justEnrolled, setJustEnrolled] = useState(false);
  const enrollMutation = useEnrollInTournament();
  // Multi-account retest finding (2026-08-30): the button must reflect a
  // pre-existing enrollment from a prior visit/session, not just this
  // component's own click history — otherwise a returning, already-enrolled
  // citizen sees a clickable "Enroll" that just 409s.
  const { data: myEnrollments } = useMyTournamentEnrollments();
  const alreadyEnrolled = (myEnrollments?.data?.data ?? []).some((e) => e.tournamentId === tournament.id);
  const enrolled = justEnrolled || alreadyEnrolled;

  if (tournament.participationMode !== 'SINGLE') return null;

  const full = (tournament.currentTeams ?? 0) >= (tournament.maxTeams ?? 0);
  const closed = tournament.status !== 'upcoming';
  let buttonLabel = 'Enroll';
  if (enrolled) buttonLabel = 'Enrolled';
  else if (enrollMutation.isLoading) buttonLabel = 'Enrolling…';

  return (
    <div className="fl2-card fl2-row fl2-between" style={{ alignItems: 'center' }}>
      <div className="fl2-stack" style={{ gap: 2 }}>
        <span className="fl2-eyebrow">Individual enrollment</span>
        <span className="fl2-small fl2-muted">
          {tournament.currentTeams ?? 0} of {tournament.maxTeams} enrolled
          {closed && ' — enrollment closed'}
          {!closed && full && ' — full'}
        </span>
      </div>
      <Button
        variant="contained"
        disabled={enrolled || closed || full || enrollMutation.isLoading}
        onClick={() => enrollMutation.mutate({ tournamentId: tournament.id }, { onSuccess: () => setJustEnrolled(true) })}
        sx={{ textTransform: 'none', fontWeight: 700 }}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export function roundLabel(round, totalRounds) {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinal';
  if (fromEnd === 2) return 'Quarterfinal';
  return `Round ${round}`;
}

function BracketMatchBox({ match, home, away }) {
  const p1 = TeamName({ team: home });
  const p2 = TeamName({ team: away });
  const tbd = p1 === 'TBD' && p2 === 'TBD';
  return (
    <div className="fl2-card fl2-stack" style={{ width: 200, padding: 12, gap: 6, opacity: tbd ? 0.5 : 1 }}>
      <div className="fl2-row fl2-between fl2-small" style={{ padding: '6px 8px', borderRadius: 8, background: 'var(--surface-2)' }}>
        <span style={{ fontWeight: 700 }}>{p1}</span>
        {match?.isCompleted && <span className="mono">{match.homeScore}</span>}
      </div>
      <div className="fl2-row fl2-between fl2-small" style={{ padding: '6px 8px', borderRadius: 8, background: 'var(--surface-2)' }}>
        <span style={{ fontWeight: 700 }}>{p2}</span>
        {match?.isCompleted && <span className="mono">{match.awayScore}</span>}
      </div>
    </div>
  );
}

function BracketView({ tournament }) {
  const teams = tournament.teams ?? [];
  const matches = tournament.matches ?? [];
  const teamById = (id) => teams.find((t) => t.id === id);
  const realRounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  // No fixtures generated yet (e.g. a fresh, still-registering tournament) —
  // still show the shape of the bracket the artifact always shows: a fixed
  // Quarterfinal/Semifinal/Final skeleton, all slots TBD, rather than a
  // blank page or a capacity-derived round count the artifact never had.
  const totalRounds = realRounds.length || 3;
  const rounds = realRounds.length ? realRounds : [1, 2, 3];

  return (
    <>
      <div className="fl2-card fl2-stack">
        <span className="fl2-eyebrow">Registration</span>
        <div className="fl2-statbar"><i style={{ width: `${Math.min(100, ((tournament.teamsRegistered ?? 0) / (tournament.maxTeams || 1)) * 100)}%` }} /></div>
        <span className="fl2-small fl2-muted">
          {tournament.teamsRegistered ?? 0} of {tournament.maxTeams} registered — <span style={{ color: 'var(--gold)', fontWeight: 700 }}>registration opening soon</span>.
        </span>
      </div>

      <div className="fl2-scrollx">
        <div className="fl2-row" style={{ gap: 32, alignItems: 'center', minWidth: 700, padding: '12px 4px' }}>
          {rounds.map((round, roundIdx) => {
            const roundMatches = realRounds.length
              ? matches.filter((m) => m.round === round).sort((a, b) => a.id.localeCompare(b.id))
              : [];
            const slots = roundMatches.length || 2 ** (totalRounds - roundIdx - 1);
            const gap = [20, 64, 0][roundIdx] ?? 0;
            return (
              <div key={round} className="fl2-stack" style={{ gap: 24 }}>
                <span className="fl2-eyebrow" style={{ textAlign: 'center' }}>{roundLabel(round, totalRounds)}</span>
                <div className="fl2-stack" style={{ gap }}>
                  {(roundMatches.length ? roundMatches : Array.from({ length: slots })).map((m, i) => (
                    <BracketMatchBox key={m?.id ?? i} match={m} home={m ? teamById(m.homeTeamId) : null} away={m ? teamById(m.awayTeamId) : null} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function FixtureRow({ match, home, away, tournamentId }) {
  const navigate = useNavigate();
  return (
    <div
      className="fl2-row fl2-between fl2-clickable"
      style={{ padding: '13px 4px', borderTop: '1px solid var(--line)', cursor: 'pointer' }}
      onClick={() => navigate(`/youth-v2/tournaments/${tournamentId}/matches/${match.id}`)}
    >
      <div style={{ minWidth: 0, flex: 1 }}><TeamIdentity team={home} /></div>
      <div className="fl2-row" style={{ gap: 8, flexShrink: 0 }}>
        {match.isCompleted ? <Pill variant="muted">FT</Pill> : <Pill variant="gold">Upcoming</Pill>}
        <span className="mono" style={{ fontWeight: 800, minWidth: 44, textAlign: 'center' }}>{match.isCompleted ? `${match.homeScore} – ${match.awayScore}` : 'vs'}</span>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}><TeamIdentity team={away} align="right" /></div>
    </div>
  );
}

function LeagueView({ tournament }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('standings');
  const teams = tournament.teams ?? [];
  const matches = tournament.matches ?? [];
  const teamById = (id) => teams.find((t) => t.id === id);
  const standings = [...teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);

  return (
    <>
      <div className="fl2-tabs">
        {[['standings', 'Standings'], ['fixtures', 'Fixtures'], ['clubs', 'Clubs']].map(([id, label]) => (
          <button key={id} type="button" className={`fl2-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'standings' && (
        <div className="fl2-card-flush"><div className="fl2-scrollx"><table>
          <thead><tr>
            <th className="fl2-num">#</th><th>Club</th><th className="fl2-num">P</th><th className="fl2-num">W</th><th className="fl2-num">D</th><th className="fl2-num">L</th>
            <th className="fl2-num">GF</th><th className="fl2-num">GA</th><th className="fl2-num">GD</th><th>Form</th><th className="fl2-num">Pts</th>
          </tr></thead>
          <tbody>
            {standings.map((t, i) => {
              const played = t.wins + t.draws + t.losses;
              const gd = t.goalsFor - t.goalsAgainst;
              return (
                <tr
                  key={t.id}
                  className={t.managerId ? 'fl2-clickable' : ''}
                  style={t.managerId ? { cursor: 'pointer' } : undefined}
                  onClick={t.managerId ? () => navigate(`/youth-v2/clubs/${t.managerId}?tournamentId=${tournament.id}`) : undefined}
                  aria-label={t.managerId ? `View ${t.teamName}` : undefined}
                >
                  <td className="fl2-num">{i + 1}{i < 3 && <Pill variant="gold" style={{ padding: '2px 6px', fontSize: '1.1rem', marginLeft: 4 }}>TOP</Pill>}</td>
                  <td aria-label="Club"><TeamIdentity team={t} /></td>
                  <td className="fl2-num">{played}</td><td className="fl2-num">{t.wins}</td><td className="fl2-num">{t.draws}</td><td className="fl2-num">{t.losses}</td>
                  <td className="fl2-num">{t.goalsFor}</td><td className="fl2-num">{t.goalsAgainst}</td>
                  <td className="fl2-num mono">{gd > 0 ? `+${gd}` : gd}</td>
                  <td aria-label="Form"><FormDots form={computeForm(t.id, matches)} /></td>
                  <td className="fl2-num mono" style={{ fontWeight: 800 }}>{t.points}</td>
                </tr>
              );
            })}
            {standings.length === 0 && <tr><td colSpan={11} className="fl2-small fl2-muted" style={{ padding: 16 }}>No teams registered yet.</td></tr>}
          </tbody>
        </table></div></div>
      )}

      {tab === 'fixtures' && (
        rounds.length === 0
          ? <div className="fl2-small fl2-muted" style={{ padding: '16px 4px' }}>No fixtures scheduled yet.</div>
          : rounds.map((r) => (
            <div key={r} className="fl2-stack" style={{ marginBottom: 22 }}>
              <div className="fl2-row" style={{ gap: 10 }}><Pill variant="muted">Round {r}</Pill><hr className="fl2-rule" style={{ flex: 1 }} /></div>
              <div className="fl2-card-flush" style={{ padding: '2px 16px' }}>
                {matches.filter((m) => m.round === r).map((m) => (
                  <FixtureRow key={m.id} match={m} home={teamById(m.homeTeamId)} away={teamById(m.awayTeamId)} tournamentId={tournament.id} />
                ))}
              </div>
            </div>
          ))
      )}

      {tab === 'clubs' && (
        <div className="fl2-grid-3">
          {teams.map((t) => {
            const rank = standings.findIndex((s) => s.id === t.id) + 1;
            const card = (
              <div className="fl2-card fl2-stack" style={{ height: '100%' }}>
                <div className="fl2-row fl2-between"><Pill variant="pos" style={{ marginLeft: 'auto' }}>#{rank}</Pill></div>
                <TeamIdentity team={t} size={40} />
                <div style={{ marginTop: 'auto', minHeight: 22 }}><FormDots form={computeForm(t.id, matches)} /></div>
              </div>
            );
            return t.managerId
              ? <Link key={t.id} to={`/youth-v2/clubs/${t.managerId}?tournamentId=${tournament.id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}>{card}</Link>
              : <div key={t.id} style={{ height: '100%' }}>{card}</div>;
          })}
          {teams.length === 0 && <div className="fl2-small fl2-muted">No teams registered yet.</div>}
        </div>
      )}
    </>
  );
}

export default function TournamentDetailScreen() {
  const { tournamentId } = useParams();
  const { data, isLoading, isError } = useTournamentDetail(tournamentId);
  const tournament = data?.data?.tournament;
  const isKnockout = tournament?.format === 'KNOCKOUT';

  const header = useMemo(() => {
    if (!tournament) return null;
    const icon = SPORT_ICONS?.[(tournament.sport || '').toLowerCase()] || (isKnockout ? '🎮' : '⚽');
    return (
      <div className={isKnockout ? '' : 'fl2-card'} style={isKnockout ? { padding: 26, background: 'linear-gradient(135deg,#1F2937,#0A0F14)', color: '#fff', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow)' } : {}}>
        <div className="fl2-row fl2-between">
          <div className="fl2-stack" style={{ gap: 4 }}>
            <span className="fl2-eyebrow" style={isKnockout ? { color: '#94A3B8' } : {}}>{icon} {tournament.sport} · {tournament.format}</span>
            <h1 style={{ fontSize: '2.4rem', color: isKnockout ? '#fff' : undefined }}>{tournament.title}</h1>
            {tournament.venue && <span className="fl2-small" style={isKnockout ? { color: '#94A3B8' } : { color: 'var(--ink-muted)' }}>📍 {tournament.venue}</span>}
          </div>
          <div className="fl2-stack" style={{ alignItems: 'flex-end', gap: 4 }}>
            <Pill variant={tournament.status === 'ongoing' ? 'live' : 'gold'} live={tournament.status === 'ongoing'}>{tournament.status}</Pill>
            <span className="fl2-small" style={isKnockout ? { color: '#94A3B8' } : { color: 'var(--ink-muted)' }}>{tournament.teamsRegistered ?? 0}/{tournament.maxTeams} registered</span>
          </div>
        </div>
      </div>
    );
  }, [tournament, isKnockout]);

  return (
    <FloodlightsPage title="Tournament Details" subtitle="Youth & Sports · Bracket · Standings">
      <Button component={Link} to="/youth-v2/tournaments" startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start', color: 'var(--ink-muted)', textTransform: 'none', fontWeight: 700, fontSize: '1.4rem' }}>
        Tournaments
      </Button>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}
      {isError && <div className="fl2-small" style={{ color: 'var(--card-red)' }}>Tournament not found.</div>}

      {tournament && (
        <>
          {header}
          <EnrollPanel tournament={tournament} />
          {isKnockout ? <BracketView tournament={tournament} /> : <LeagueView tournament={tournament} />}
        </>
      )}
    </FloodlightsPage>
  );
}
