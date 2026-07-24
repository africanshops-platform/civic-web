import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, Chip, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { EmojiEvents } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import YouthSportsHeader from './shared-components/YouthSportsHeader';
import YouthSportsSidebarLeft from './shared-components/YouthSportsSidebarLeft';
import YouthSportsSidebarRight from './shared-components/YouthSportsSidebarRight';
import { useTournaments } from '../hooks/useYouthSportsRepo';
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

const SX_SELECT = { borderRadius: '12px', fontSize: '1.76rem' };
const SX_LABEL = { fontSize: '1.76rem' };
const SX_ITEM = { fontSize: '1.76rem' };

function ActiveTournamentsPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading } = useTournaments({ status: statusFilter || undefined });
  const tournaments = useMemo(() => data?.data?.tournaments ?? [], [data]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <YouthSportsHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Tournaments" subtitle="Youth & Sports · Live · Upcoming · Register" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <YouthSportsSidebarLeft />, []);
  const rightSidebar = useMemo(() => <YouthSportsSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>
              <EmojiEvents sx={{ fontSize: 'inherit', color: '#ea580c', mr: 1, verticalAlign: 'middle' }} />
              Tournaments
            </h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '1.8rem' }}>{tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}</p>
          </div>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel sx={SX_LABEL}>Filter by Status</InputLabel>
            <Select value={statusFilter} label="Filter by Status" onChange={(e) => setStatusFilter(e.target.value)} sx={SX_SELECT}>
              <MenuItem value="" sx={SX_ITEM}>All</MenuItem>
              <MenuItem value="UPCOMING" sx={SX_ITEM}>Upcoming</MenuItem>
              <MenuItem value="ONGOING" sx={SX_ITEM}>Live</MenuItem>
              <MenuItem value="COMPLETED" sx={SX_ITEM}>Completed</MenuItem>
              <MenuItem value="CANCELLED" sx={SX_ITEM}>Cancelled</MenuItem>
            </Select>
          </FormControl>
        </div>

        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#ea580c' }} /></div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {tournaments.map((t, i) => {
            const statusStyle = STATUS_STYLES[t.status] || STATUS_STYLES.upcoming;
            const sportIcon = SPORT_ICONS?.[(t.sport || '').toLowerCase()] || '🏅';
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: 28, borderRadius: 22, background: 'white', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0, border: '1px solid #fed7aa' }}>
                    {sportIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.96rem', color: '#111827' }}>{t.title}</h3>
                      <Chip label={statusStyle.label} sx={{ height: 36, fontSize: '1.4rem', background: statusStyle.bg, color: statusStyle.color, fontWeight: 800 }} />
                    </div>
                    {t.venue && <p style={{ margin: '0 0 12px', fontSize: '1.7rem', color: '#6b7280' }}>📍 {t.venue}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      <Chip label={t.sport} sx={{ height: 34, fontSize: '1.4rem', fontWeight: 700, background: '#fff7ed', color: '#9a3412' }} />
                      <Chip label={t.format} sx={{ height: 34, fontSize: '1.4rem', fontWeight: 700, background: '#dcfce7', color: '#166534' }} />
                      <span style={{ fontSize: '1.64rem', color: '#6b7280' }}>{t.teamsRegistered ?? 0}/{t.maxTeams} teams registered</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <Button component={Link} to={`/youth/tournaments/${t.id}`} size="medium"
                      sx={{ background: 'linear-gradient(135deg,#ea580c 0%,#dc2626 100%)', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.6rem', px: 3, py: 1.25, '&:hover': { filter: 'brightness(0.92)' } }}>
                      View {t.format === 'KNOCKOUT' ? 'Bracket' : 'Standings'}
                    </Button>
                    {/* Team registration is real-data-aware but not yet wired to the real
                        register endpoint — deferred, same reasoning as Programs' Enrol button. */}
                    {t.status === 'upcoming' && (
                      <Button size="medium" disabled
                        sx={{ fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.6rem', px: 3, py: 1.25 }}>
                        Registration Opening Soon
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!isLoading && tournaments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🏆</div>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem' }}>No tournaments found</div>
          </div>
        )}
      </motion.div>
    </div>
  ), [tournaments, isLoading, statusFilter]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveTournamentsPage);
export default function TournamentsPage() { return <MemoizedActivePage />; }
