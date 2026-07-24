import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Chip, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { Star } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import YouthSportsHeader from './shared-components/YouthSportsHeader';
import YouthSportsSidebarLeft from './shared-components/YouthSportsSidebarLeft';
import YouthSportsSidebarRight from './shared-components/YouthSportsSidebarRight';
import { useTalents } from '../hooks/useYouthSportsRepo';
import { SPORT_ICONS } from '../mock';

const SPORTS = Object.keys(SPORT_ICONS);

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const SX_SELECT = { borderRadius: '12px', fontSize: '1.76rem' };
const SX_LABEL = { fontSize: '1.76rem' };
const SX_ITEM = { fontSize: '1.76rem' };

function ActiveTalentsPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [sportFilter, setSportFilter] = useState('');

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading } = useTalents({ sport: sportFilter || undefined });
  const talents = useMemo(() => data?.data?.talents ?? [], [data]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <YouthSportsHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Talent Directory" subtitle="Youth & Sports · Discover · Scout · Connect" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <YouthSportsSidebarLeft />, []);
  const rightSidebar = useMemo(() => <YouthSportsSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>🌟 Talent Directory</h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '1.8rem' }}>Discover Nigeria's brightest young talents</p>
          </div>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel sx={SX_LABEL}>Sport</InputLabel>
            <Select value={sportFilter} label="Sport" onChange={(e) => setSportFilter(e.target.value)} sx={SX_SELECT}>
              <MenuItem value="" sx={SX_ITEM}>All</MenuItem>
              {SPORTS.map((s) => <MenuItem key={s} value={s} sx={SX_ITEM}><span style={{ marginRight: 8 }}>{SPORT_ICONS[s]}</span>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </div>

        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#ea580c' }} /></div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: 18 }}>
          {talents.map((talent, i) => {
            const sportIcon = SPORT_ICONS[(talent.discipline || '').toLowerCase()] || '🌟';
            return (
              <motion.div key={talent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: 24, borderRadius: 22, background: 'white', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#ea580c 0%,#dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.6rem', flexShrink: 0 }}>
                    {talent.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.9rem' }}>{talent.name}</div>
                    <div style={{ fontSize: '1.56rem', color: '#6b7280' }}>{talent.jurisdiction.lga}, {talent.jurisdiction.state}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Chip label={`${sportIcon} ${talent.discipline}`} sx={{ height: 36, fontSize: '1.4rem', background: '#fff7ed', color: '#9a3412', fontWeight: 700, mb: 1 }} />
                </div>
                {talent.achievements?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    {talent.achievements.slice(0, 2).map((a) => (
                      <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.6rem', color: '#374151', marginBottom: 6 }}>
                        <Star sx={{ fontSize: 22, color: '#f59e0b' }} />{a}
                      </div>
                    ))}
                  </div>
                )}
                {talent.verified && (
                  <Chip label="✓ Verified" sx={{ height: 34, fontSize: '1.44rem', fontWeight: 700, background: '#dcfce7', color: '#166534', width: '100%' }} />
                )}
              </motion.div>
            );
          })}
        </div>

        {!isLoading && talents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🌟</div>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem' }}>No talents found{sportFilter ? ` for ${sportFilter}` : ''}</div>
          </div>
        )}
      </motion.div>
    </div>
  ), [talents, isLoading, sportFilter]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveTalentsPage);
export default function TalentsPage() { return <MemoizedActivePage />; }
