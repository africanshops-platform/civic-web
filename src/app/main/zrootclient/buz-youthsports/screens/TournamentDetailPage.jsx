import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Chip, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowBack } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import YouthSportsHeader from './shared-components/YouthSportsHeader';
import YouthSportsSidebarLeft from './shared-components/YouthSportsSidebarLeft';
import YouthSportsSidebarRight from './shared-components/YouthSportsSidebarRight';
import BracketTree from './shared-components/BracketTree';
import StandingsTable from './shared-components/StandingsTable';
import { useTournamentDetail } from '../hooks/useYouthSportsRepo';
import { SPORT_ICONS } from '../mock';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const STATUS_STYLES = {
  upcoming: { bg: '#eff6ff', color: '#1d4ed8', label: 'Upcoming' },
  ongoing: { bg: '#fff7ed', color: '#9a3412', label: 'Live' },
  completed: { bg: '#f3f4f6', color: '#6b7280', label: 'Completed' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

function teamName(teams, id) {
  return teams.find((t) => t.id === id)?.teamName ?? 'TBD';
}

function ActiveTournamentDetailPage() {
  const { tournamentId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useTournamentDetail(tournamentId);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <YouthSportsHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Tournament Details" subtitle="Youth & Sports · Bracket · Standings" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <YouthSportsSidebarLeft />, []);
  const rightSidebar = useMemo(() => <YouthSportsSidebarRight />, []);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={56} sx={{ color: '#ea580c' }} />
        </div>
      );
    }
    if (isError || !data?.data?.tournament) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%', textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 14 }}>⚠️</div>
          <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.8rem' }}>Tournament not found.</div>
          <Button component={Link} to="/youth/tournaments" sx={{ mt: 2, fontSize: '1.76rem' }} startIcon={<ArrowBack />}>Back to Tournaments</Button>
        </div>
      );
    }

    const { tournament } = data.data;
    const { teams = [], matches = [] } = tournament;
    const statusStyle = STATUS_STYLES[tournament.status] || STATUS_STYLES.upcoming;
    const sportIcon = SPORT_ICONS?.[(tournament.sport || '').toLowerCase()] || '🏅';

    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Button component={Link} to="/youth/tournaments" startIcon={<ArrowBack sx={{ fontSize: 28 }} />}
            sx={{ mb: 3, color: '#6b7280', textTransform: 'none', fontWeight: 600, fontSize: '1.76rem', px: 0 }}>
            Back to Tournaments
          </Button>

          <div style={{ background: 'linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%)', borderRadius: 24, padding: 'clamp(28px,4vw,40px)', border: '1px solid #fed7aa', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ width: 76, height: 76, borderRadius: 18, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', flexShrink: 0, border: '1px solid #fed7aa' }}>
                {sportIcon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                  <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.6rem,4vw,3.8rem)', color: '#111827' }}>{tournament.title}</h1>
                  <Chip label={statusStyle.label} sx={{ height: 40, fontSize: '1.6rem', background: statusStyle.bg, color: statusStyle.color, fontWeight: 800 }} />
                </div>
                {tournament.venue && <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: '1.8rem' }}>{tournament.venue}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                  <span style={{ fontSize: '1.8rem', color: '#374151' }}>{tournament.sport}</span>
                  <span style={{ fontSize: '1.8rem', color: '#374151' }}>{tournament.format}</span>
                  <span style={{ fontSize: '1.8rem', color: '#374151' }}>{tournament.teamsRegistered ?? 0}/{tournament.maxTeams} teams</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration is real-data-aware but not yet wired to the real
              register endpoint — deferred, same reasoning as Programs' Enrol
              button and Tournaments' list-page Register button. */}
          {tournament.status === 'upcoming' && (
            <Button disabled variant="contained" sx={{ mb: 3, fontWeight: 800, borderRadius: '14px', textTransform: 'none', py: 2, fontSize: '1.8rem' }}>
              Registration Opening Soon
            </Button>
          )}

          <div style={{ background: 'white', borderRadius: 22, padding: 'clamp(16px,2.5vw,28px)', border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>
              {tournament.format === 'KNOCKOUT' ? 'Bracket' : 'Standings'}
            </h3>
            {teams.length === 0 && <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: '1.7rem' }}>No teams registered yet.</div>}
            {teams.length > 0 && tournament.format === 'KNOCKOUT' && <BracketTree matches={matches} teams={teams} />}
            {teams.length > 0 && tournament.format !== 'KNOCKOUT' && <StandingsTable teams={teams} />}
          </div>

          {tournament.format === 'KNOCKOUT' && matches.length > 0 && (
            <div style={{ background: 'white', borderRadius: 22, padding: 'clamp(16px,2.5vw,28px)', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Matches</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matches.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: '1.64rem', color: '#374151', fontWeight: 600 }}>
                      Round {m.round}: {teamName(teams, m.homeTeamId)} vs {teamName(teams, m.awayTeamId)}
                    </span>
                    <span style={{ fontSize: '1.64rem', color: '#6b7280' }}>
                      {m.isCompleted ? `${m.homeScore}–${m.awayScore}` : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }, [data, isLoading, isError]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveTournamentDetailPage);
export default function TournamentDetailPage() { return <MemoizedActivePage />; }
