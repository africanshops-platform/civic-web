import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, Chip, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { Star } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import YouthSportsHeader from './shared-components/YouthSportsHeader';
import YouthSportsSidebarLeft from './shared-components/YouthSportsSidebarLeft';
import YouthSportsSidebarRight from './shared-components/YouthSportsSidebarRight';
import { useMentors } from '../hooks/useYouthSportsRepo';
import { PROGRAM_CATEGORIES } from '../mock';

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

function ActiveMentorsPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading } = useMentors({ category: categoryFilter || undefined });
  const mentors = useMemo(() => data?.data?.mentors ?? [], [data]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <YouthSportsHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Mentors" subtitle="Youth & Sports · Learn · Grow · Get Discovered" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <YouthSportsSidebarLeft />, []);
  const rightSidebar = useMemo(() => <YouthSportsSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>🤝 Find a Mentor</h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '1.8rem' }}>Connect with experienced professionals who can guide your journey</p>
          </div>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel sx={SX_LABEL}>Category</InputLabel>
            <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)} sx={SX_SELECT}>
              <MenuItem value="" sx={SX_ITEM}>All</MenuItem>
              {PROGRAM_CATEGORIES.map((c) => <MenuItem key={c.id} value={c.id} sx={SX_ITEM}><span style={{ marginRight: 8 }}>{c.icon}</span>{c.label}</MenuItem>)}
            </Select>
          </FormControl>
        </div>

        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#ea580c' }} /></div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: 18 }}>
          {mentors.map((mentor, i) => {
            const catInfo = PROGRAM_CATEGORIES.find((c) => c.id === mentor.category) || PROGRAM_CATEGORIES[0];
            return (
              <motion.div key={mentor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: 26, borderRadius: 22, background: 'white', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#ea580c 0%,#dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.5rem', flexShrink: 0 }}>
                    {mentor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.9rem', lineHeight: 1.2 }}>{mentor.name}</div>
                    <div style={{ fontSize: '1.56rem', color: '#6b7280', marginTop: 4, lineHeight: 1.3 }}>{mentor.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <Star sx={{ fontSize: 22, color: '#f59e0b' }} />
                      <span style={{ fontSize: '1.64rem', fontWeight: 700, color: '#374151' }}>{mentor.rating}</span>
                      <span style={{ fontSize: '1.52rem', color: '#9ca3af' }}>· {mentor.yearsExperience}yrs exp</span>
                    </div>
                  </div>
                </div>
                <Chip label={catInfo.icon + ' ' + catInfo.label} sx={{ height: 36, fontSize: '1.4rem', background: catInfo.bgColor, color: catInfo.color, fontWeight: 700, width: 'fit-content' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {mentor.expertise.slice(0, 3).map((e) => (
                    <Chip key={e} label={e} sx={{ height: 32, fontSize: '1.4rem', fontWeight: 600, background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb' }} />
                  ))}
                  {mentor.expertise.length > 3 && <Chip label={`+${mentor.expertise.length - 3}`} sx={{ height: 32, fontSize: '1.4rem', fontWeight: 600, background: '#f3f4f6', color: '#6b7280' }} />}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Chip label={mentor.availability === 'available' ? '✅ Available' : '⏸ Limited'}
                    sx={{ height: 32, fontSize: '1.4rem', fontWeight: 700, background: mentor.availability === 'available' ? '#dcfce7' : '#fffbeb', color: mentor.availability === 'available' ? '#166534' : '#92400e' }} />
                  <span style={{ fontSize: '1.52rem', color: '#9ca3af' }}>{mentor.sessionType}</span>
                </div>
                <Button size="medium" disabled={mentor.availability !== 'available'}
                  sx={{ background: mentor.availability === 'available' ? 'linear-gradient(135deg,#ea580c 0%,#dc2626 100%)' : '#f3f4f6', color: mentor.availability === 'available' ? 'white' : '#9ca3af', fontWeight: 700, borderRadius: '12px', textTransform: 'none', py: 1.25, fontSize: '1.76rem', '&:hover': { filter: 'brightness(0.92)' } }}>
                  Request Mentorship
                </Button>
              </motion.div>
            );
          })}
        </div>

        {!isLoading && mentors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🤝</div>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem' }}>No mentors found for this category</div>
          </div>
        )}
      </motion.div>
    </div>
  ), [mentors, isLoading, categoryFilter]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveMentorsPage);
export default function MentorsPage() { return <MemoizedActivePage />; }
