import { Link } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FloodlightsPage from './shared/FloodlightsPage';
import { FormDots, Pill, TeamName, TeamIdentity, computeForm } from './shared/flHelpers';
import { useYouthStats, useTournaments, useTournamentDetail, usePrograms, useTalents } from '../hooks/useFloodlightsRepo';
import { PROGRAM_CATEGORIES } from '../mock';

export default function HubScreen() {
  const { data: statsData } = useYouthStats();
  const { data: tournamentsData } = useTournaments();
  const { data: talentsData } = useTalents({ limit: 1 });
  const { data: programsData } = usePrograms({ limit: 1 });

  const tournaments = tournamentsData?.data?.tournaments ?? [];
  const stats = statsData?.data?.stats;
  // Prefer the LEAGUE tournament with the most teams actually registered —
  // list order alone (e.g. the first "ongoing" match) can land on a league
  // with zero teams and nothing to show, even when a richer one exists.
  const leagueTournaments = tournaments.filter((t) => t.format === 'LEAGUE');
  const liveLeague = [...leagueTournaments].sort((a, b) => (b.teamsRegistered ?? 0) - (a.teamsRegistered ?? 0))[0];
  const fifaKnockout = tournaments.find((t) => t.format === 'KNOCKOUT');

  const { data: leagueDetail } = useTournamentDetail(liveLeague?.id);
  const tournament = leagueDetail?.data?.tournament;
  const teams = tournament?.teams ?? [];
  const matches = tournament?.matches ?? [];
  const standings = [...teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));

  const recentFT = matches.filter((m) => m.isCompleted).slice(-3);
  const liveMatch = matches.find((m) => !m.isCompleted);
  const featuredProgramme = programsData?.data?.programs?.[0];

  const teamById = (id) => teams.find((t) => t.id === id);

  const PATHWAYS = [
    {
      icon: EmojiEventsIcon, title: 'Leagues & Tournaments',
      desc: 'Season-long league tables and periodic knockout brackets — football today, more sports opening up.',
      stat: tournaments.length ? `${tournaments.length} running · ${new Set(tournaments.map((t) => t.sport)).size} sports` : 'Loading…',
      to: '/youth-v2/tournaments',
    },
    {
      icon: StarIcon, title: 'Talent Hunt',
      desc: 'Discover verified young athletes, scouted and profiled by coordinators across every LGA.',
      stat: talentsData?.data?.total != null ? `${talentsData.data.total} talents scouted so far` : 'Loading…',
      to: '/youth-v2/talents',
    },
    {
      icon: SwapHorizIcon, title: 'Transfer Market',
      desc: 'The mid-season window where clubs move listed players via club-to-club development-fee offers.',
      stat: 'Preview — not live yet',
      to: '/youth-v2/market',
    },
    {
      icon: MenuBookIcon, title: 'Programmes',
      desc: 'Government-backed youth programmes beyond sport — tech, agriculture, arts, entrepreneurship, health, vocational.',
      stat: stats ? `${stats.totalPrograms} programmes · ${stats.openPrograms} open now` : 'Loading…',
      to: '/youth-v2/programs',
    },
  ];

  return (
    <FloodlightsPage title="Youth Sports" subtitle="Hub · Tournaments · Talent Hunt · Transfer Market">
      <div className="fl2-hero">
        <span className="fl2-eyebrow">Youth &amp; Sports · Empowering Nigerian Youth</span>
        <h1 style={{ marginTop: 8 }}>Your talent.<br />Every pitch, court &amp; console.</h1>
        <p className="fl2-lede">
          Leagues, periodic tournaments and a scouted Talent Hunt sit alongside government-backed programmes in
          tech, agriculture, arts and more — from Lagos to Abuja, from the pitch to the boardroom.
        </p>
        <div className="fl2-row" style={{ marginTop: 16, gap: 8, flexWrap: 'wrap' }}>
          <Pill variant="muted">🏛️ Government Backed</Pill>
          <Pill variant="muted">⚽ NFF Partnered</Pill>
          <Pill variant="muted">🆓 Free Programmes Available</Pill>
          <Pill variant="muted">🎖️ NYSC Accredited</Pill>
        </div>
        <div className="fl2-row" style={{ marginTop: 22, gap: 12, flexWrap: 'wrap' }}>
          <Link to="/youth-v2/tournaments" className="fl2-btn fl2-btn-gold">Explore Tournaments</Link>
          <Link to="/youth-v2/talents" className="fl2-btn fl2-btn-ghost">Browse Talent Hunt</Link>
        </div>

        {(recentFT.length > 0 || liveMatch || fifaKnockout) && (
          <div className="fl2-ticker-wrap">
            <div className="fl2-ticker-track">
              {[...recentFT.map((f) => (
                <span key={f.id} className="fl2-ticker-item">
                  <span className="mono fl2-tiny fl2-muted">R{f.round}</span>
                  <b><TeamName team={teamById(f.homeTeamId)} /></b> {f.homeScore}–{f.awayScore} <b><TeamName team={teamById(f.awayTeamId)} /></b>
                  <span className="fl2-ticker-sep">•</span>
                </span>
              )),
              liveMatch && (
                <span key={liveMatch.id} className="fl2-ticker-item">
                  <Pill variant="live" live>LIVE</Pill>
                  <b><TeamName team={teamById(liveMatch.homeTeamId)} /></b> vs <b><TeamName team={teamById(liveMatch.awayTeamId)} /></b>
                  <span className="fl2-ticker-sep">•</span>
                </span>
              ),
              fifaKnockout && (
                <span key="fifa" className="fl2-ticker-item">
                  <Pill variant="gold">FIFA</Pill>
                  {fifaKnockout.teamsRegistered ?? 0}/{fifaKnockout.maxTeams} registered for {fifaKnockout.title}
                  <span className="fl2-ticker-sep">•</span>
                </span>
              )].filter(Boolean)}
            </div>
          </div>
        )}
      </div>

      <div className="fl2-grid-4">
        <div className="fl2-card fl2-stack"><span className="fl2-eyebrow">Total programmes</span><h2 style={{ fontSize: '2.8rem' }}>{stats?.totalPrograms ?? '—'}</h2></div>
        <div className="fl2-card fl2-stack"><span className="fl2-eyebrow">Open for enrolment</span><h2 style={{ fontSize: '2.8rem', color: 'var(--pitch)' }}>{stats?.openPrograms ?? '—'}</h2></div>
        <div className="fl2-card fl2-stack"><span className="fl2-eyebrow">Youth enrolled</span><h2 style={{ fontSize: '2.8rem' }}>{stats?.totalYouthEnrolled?.toLocaleString() ?? '—'}</h2></div>
        <div className="fl2-card fl2-stack"><span className="fl2-eyebrow">Graduates this year</span><h2 style={{ fontSize: '2.8rem' }}>{stats?.graduatesThisYear?.toLocaleString() ?? '—'}</h2></div>
      </div>

      <div className="fl2-stack">
        <div className="fl2-section-title"><h2>Choose your path</h2></div>
        <div className="fl2-grid-4">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.title} to={p.to} className="fl2-card fl2-stack fl2-clickable" style={{ textDecoration: 'none', height: '100%' }}>
                <div className="fl2-row fl2-between">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gold-tint)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ fontSize: 22 }} />
                  </div>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.6rem', marginTop: 2 }}>{p.title}</span>
                <span className="fl2-small fl2-muted">{p.desc}</span>
                <span className="fl2-tiny" style={{ color: 'var(--gold)', fontWeight: 700, marginTop: 'auto' }}>{p.stat} →</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="fl2-stack">
        <div className="fl2-section-title">
          <h2>Browse by category</h2>
          <span className="fl2-small fl2-muted">Sports is the deep end of this vertical — the rest live in Programmes</span>
        </div>
        <div className="fl2-row" style={{ gap: 10, flexWrap: 'wrap' }}>
          {PROGRAM_CATEGORIES.map((c) =>
            c.label === 'Sports' ? (
              <Link key={c.id} to="/youth-v2/tournaments" className="fl2-pill fl2-pill-gold" style={{ padding: '9px 16px' }}>{c.icon} {c.label}</Link>
            ) : (
              <Link key={c.id} to={`/youth-v2/programs?category=${c.id}`} className="fl2-pill fl2-pill-muted" style={{ padding: '9px 16px' }}>{c.icon} {c.label}</Link>
            )
          )}
        </div>
      </div>

      <div className="fl2-split">
        <div className="fl2-stack">
          <div className="fl2-section-title">
            <h2>{tournament ? tournament.title : 'Table — top of the league'}</h2>
            {liveLeague && <Link to={`/youth-v2/tournaments/${liveLeague.id}`} className="fl2-btn fl2-btn-outline fl2-btn-sm">Full standings</Link>}
          </div>
          <div className="fl2-card-flush">
            <div className="fl2-scrollx">
              <table>
                <thead><tr><th className="fl2-num">#</th><th>Club</th><th className="fl2-num">P</th><th>Form</th><th className="fl2-num">GD</th><th className="fl2-num">Pts</th></tr></thead>
                <tbody>
                  {standings.length === 0 && <tr><td colSpan={6} className="fl2-small fl2-muted" style={{ padding: 16 }}>No live league standings yet.</td></tr>}
                  {standings.slice(0, 5).map((t, i) => {
                    const played = t.wins + t.draws + t.losses;
                    const gd = t.goalsFor - t.goalsAgainst;
                    return (
                      <tr key={t.id}>
                        <td className="fl2-num">{i + 1}</td>
                        <td>
                          {t.managerId ? (
                            <Link to={`/youth-v2/clubs/${t.managerId}?tournamentId=${liveLeague.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <TeamIdentity team={t} />
                            </Link>
                          ) : (
                            <TeamIdentity team={t} />
                          )}
                        </td>
                        <td className="fl2-num">{played}</td>
                        <td aria-label="Form"><FormDots form={computeForm(t.id, matches)} /></td>
                        <td className="fl2-num mono">{gd > 0 ? `+${gd}` : gd}</td>
                        <td className="fl2-num mono" style={{ fontWeight: 800 }}>{t.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="fl2-stack">
          <div className="fl2-section-title"><h2>Featured programme</h2></div>
          {featuredProgramme ? (
            <div className="fl2-card fl2-stack">
              <div className="fl2-row fl2-between"><Pill variant="pos">{featuredProgramme.status}</Pill><span className="fl2-tiny fl2-muted">📚 Programme</span></div>
              <span style={{ fontWeight: 800, fontSize: '1.6rem', marginTop: 4 }}>{featuredProgramme.title}</span>
              <span className="fl2-small fl2-muted">{featuredProgramme.location?.address} · {featuredProgramme.ageGroup}</span>
              <div className="fl2-statbar" style={{ marginTop: 6 }}><i style={{ width: `${Math.min(100, ((featuredProgramme.enrolledCount ?? 0) / (featuredProgramme.slots || 1)) * 100)}%`, background: 'var(--pitch)' }} /></div>
              <span className="fl2-tiny fl2-muted">{featuredProgramme.enrolledCount ?? 0}/{featuredProgramme.slots} enrolled</span>
              <Link to={`/youth-v2/programs/${featuredProgramme.id}`} className="fl2-btn fl2-btn-outline fl2-btn-sm" style={{ alignSelf: 'flex-start', marginTop: 6 }}>View Programme</Link>
            </div>
          ) : (
            <div className="fl2-card fl2-small fl2-muted">No open programmes right now.</div>
          )}
        </div>
      </div>
    </FloodlightsPage>
  );
}
