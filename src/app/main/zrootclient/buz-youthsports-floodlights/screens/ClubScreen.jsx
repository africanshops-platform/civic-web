import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Avatar, FormDots, Ring, Pill, computeForm } from './shared/flHelpers';
import { useTournamentDetail, usePlayers, useTeamName } from '../hooks/useFloodlightsRepo';

// A single "side" in a fixture card — avatar + name, with the viewed
// club's own side visually called out (gold chip + HOME/AWAY tag) so it
// reads at a glance without comparing text against the page header.
function FixtureSide({ team, isMe, tag, align = 'left' }) {
  const name = useTeamName(team?.managerId, team?.teamName);
  return (
    <div
      className="fl2-stack"
      style={{
        gap: 6, alignItems: align === 'right' ? 'flex-end' : 'flex-start',
        minWidth: 0, flex: 1,
      }}
    >
      <div
        className="fl2-row"
        style={{
          gap: 8, minWidth: 0, flexDirection: align === 'right' ? 'row-reverse' : 'row',
          background: isMe ? 'var(--gold-tint)' : 'transparent',
          border: isMe ? '1px solid var(--gold)' : '1px solid transparent',
          borderRadius: 999, padding: isMe ? '4px 12px 4px 4px' : '4px 0',
        }}
      >
        <Avatar name={name} size={30} />
        <span
          className="fl2-small"
          style={{ fontWeight: isMe ? 800 : 600, color: isMe ? 'var(--gold-ink)' : 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {name}
        </span>
      </div>
      {isMe && <span className="fl2-tiny" style={{ fontWeight: 800, letterSpacing: '0.06em', color: 'var(--gold)' }}>{tag}</span>}
    </div>
  );
}

export function resultForClub(match, myTeamId) {
  if (!match.isCompleted) return null;
  const isHome = match.homeTeamId === myTeamId;
  const own = isHome ? match.homeScore : match.awayScore;
  const opp = isHome ? match.awayScore : match.homeScore;
  if (own > opp) return 'W';
  if (own < opp) return 'L';
  return 'D';
}

const RESULT_COLOR = { W: 'var(--pitch)', L: 'var(--card-red)', D: 'var(--ink-muted)' };
const RESULT_LABEL = { W: 'WIN', L: 'LOSS', D: 'DRAW' };
const RESULT_PILL_VARIANT = { W: 'pos', L: 'live', D: 'muted' };

function ClubFixtureCard({ match, home, away, myTeamId }) {
  const isHome = match.homeTeamId === myTeamId;
  const result = resultForClub(match, myTeamId);

  return (
    <div className="fl2-card fl2-stack" style={{ gap: 12 }}>
      <div className="fl2-row fl2-between">
        <span className="fl2-eyebrow">Round {match.round}</span>
        {match.isCompleted
          ? <Pill variant={RESULT_PILL_VARIANT[result]}>{RESULT_LABEL[result]}</Pill>
          : <Pill variant="gold">Upcoming</Pill>}
      </div>
      <div className="fl2-row" style={{ gap: 14, alignItems: 'center' }}>
        <FixtureSide team={home} isMe={isHome} tag="HOME" align="left" />
        <div className="fl2-stack" style={{ alignItems: 'center', flexShrink: 0, minWidth: 64 }}>
          {match.isCompleted ? (
            <span className="mono" style={{ fontWeight: 800, fontSize: '2rem', color: result ? RESULT_COLOR[result] : 'var(--ink)' }}>
              {match.homeScore}–{match.awayScore}
            </span>
          ) : (
            <span className="fl2-tiny fl2-muted" style={{ fontWeight: 800 }}>VS</span>
          )}
        </div>
        <FixtureSide team={away} isMe={!isHome} tag="AWAY" align="right" />
      </div>
    </div>
  );
}

export default function ClubScreen() {
  const { clubMerchantId } = useParams();
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');
  const [tab, setTab] = useState('overview');

  const { data: tData, isLoading: tLoading } = useTournamentDetail(tournamentId);
  const { data: pData, isLoading: pLoading } = usePlayers(clubMerchantId);

  const tournament = tData?.data?.tournament;
  const teams = tournament?.teams ?? [];
  const matches = tournament?.matches ?? [];
  const team = teams.find((t) => t.managerId === clubMerchantId);
  const standings = [...teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  const rank = team ? standings.findIndex((t) => t.id === team.id) + 1 : null;
  const players = pData?.data?.players ?? [];
  const clubName = useTeamName(clubMerchantId, team?.teamName || `Club ${clubMerchantId.slice(-6)}`);

  const clubMatches = team ? matches.filter((m) => m.homeTeamId === team.id || m.awayTeamId === team.id) : [];
  const teamById = (id) => teams.find((t) => t.id === id);

  return (
    <FloodlightsPage title="Club Profile" subtitle="Youth & Sports · Roster · Record">
      <Button component={Link} to={tournamentId ? `/youth-v2/tournaments/${tournamentId}` : '/youth-v2/tournaments'}
        startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start', color: 'var(--ink-muted)', textTransform: 'none', fontWeight: 700, fontSize: '1.4rem' }}>
        Back
      </Button>

      {(tLoading || pLoading) && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

      <div className="fl2-card fl2-row fl2-between" style={{ background: 'linear-gradient(135deg, var(--gold-tint), transparent 60%)' }}>
        <div className="fl2-row" style={{ gap: 16 }}>
          <Avatar name={clubName} size={64} />
          <div className="fl2-stack" style={{ gap: 4 }}>
            <h1 style={{ fontSize: '2.2rem' }}>{clubName}</h1>
            <span className="fl2-small fl2-muted">{players.length} players on roster</span>
          </div>
        </div>
        {rank && <Pill variant="pos">#{rank} in league</Pill>}
      </div>

      <div className="fl2-tabs">
        {[['overview', 'Overview'], ['squad', 'Squad'], ['fixtures', 'Fixtures']].map(([id, label]) => (
          <button key={id} type="button" className={`fl2-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        team ? (
          <>
            <div className="fl2-grid-3">
              <div className="fl2-card fl2-row" style={{ justifyContent: 'center' }}>
                <Ring pct={rank <= 3 ? 0.85 : 0.4} big={`#${rank}`} small={`of ${teams.length}`} />
              </div>
              <div className="fl2-card fl2-stack">
                <span className="fl2-eyebrow">Record</span>
                <span style={{ fontFamily: "'Anton'", fontSize: '2.4rem' }}>{team.wins}W {team.draws}D {team.losses}L</span>
                <span className="fl2-small fl2-muted">{team.wins + team.draws + team.losses} matches played</span>
              </div>
              <div className="fl2-card fl2-stack">
                <span className="fl2-eyebrow">Goal difference</span>
                <span className="mono" style={{ fontFamily: "'Anton'", fontSize: '2.4rem' }}>{team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}</span>
                <span className="fl2-small fl2-muted">{team.goalsFor} for · {team.goalsAgainst} against</span>
              </div>
            </div>
            <div className="fl2-card fl2-stack">
              <span className="fl2-eyebrow">Recent form</span>
              <FormDots form={computeForm(team.id, matches)} />
            </div>
            <div className="fl2-stack">
              <div className="fl2-section-title"><h2 style={{ fontSize: '1.7rem' }}>Next up</h2></div>
              <div className="fl2-stack" style={{ gap: 10 }}>
                {clubMatches.filter((m) => !m.isCompleted).slice(0, 2).map((m) => (
                  <ClubFixtureCard key={m.id} match={m} home={teamById(m.homeTeamId)} away={teamById(m.awayTeamId)} myTeamId={team?.id} />
                ))}
                {clubMatches.filter((m) => !m.isCompleted).length === 0 && <p className="fl2-small fl2-muted">No fixtures scheduled yet.</p>}
              </div>
            </div>
          </>
        ) : (
          <div className="fl2-card fl2-small fl2-muted">
            No tournament context for this club yet — open it from a league's standings/clubs tab to see its record.
          </div>
        )
      )}

      {tab === 'squad' && (
        <div className="fl2-grid-3">
          {players.map((p) => (
            <Link key={p.id} to={`/youth-v2/clubs/${clubMerchantId}/players/${p.id}`} className="fl2-card fl2-stack fl2-clickable" style={{ textDecoration: 'none', height: '100%' }}>
              <div className="fl2-row fl2-between">
                <Avatar name={p.fullName} size={44} />
                <span className="mono" style={{ fontWeight: 800 }}>{p.jerseyNumber != null ? `#${p.jerseyNumber}` : ''}</span>
              </div>
              <span style={{ fontWeight: 800 }}>{p.fullName}</span>
              <span className="fl2-small fl2-muted">{p.position || 'Position not set'}</span>
              <div style={{ marginTop: 'auto' }}>{!p.isActive && <Pill variant="muted">Inactive</Pill>}</div>
            </Link>
          ))}
          {players.length === 0 && !pLoading && <div className="fl2-small fl2-muted">Squad not published yet.</div>}
        </div>
      )}

      {tab === 'fixtures' && (
        <div className="fl2-stack" style={{ gap: 10 }}>
          {[...clubMatches].sort((a, b) => a.round - b.round).map((m) => (
            <ClubFixtureCard key={m.id} match={m} home={teamById(m.homeTeamId)} away={teamById(m.awayTeamId)} myTeamId={team?.id} />
          ))}
          {clubMatches.length === 0 && <p className="fl2-small fl2-muted">No fixtures for this club yet.</p>}
        </div>
      )}
    </FloodlightsPage>
  );
}
