import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Button, Chip, LinearProgress, TextField, InputAdornment } from '@mui/material';
import { Link } from 'react-router-dom';
import { Search, Campaign, ArrowForward, CheckCircle, Edit } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import GovernanceHeader from './shared-components/GovernanceHeader';
import GovernanceSidebarLeft from './shared-components/GovernanceSidebarLeft';
import GovernanceSidebarRight from './shared-components/GovernanceSidebarRight';
import { usePetitions, useSignPetition } from '../hooks/useGovernanceRepo';
import { PETITION_CATEGORIES, PETITION_STATS } from '../mock';
import { CivicLoadingSkeleton, CivicEmptyState } from '../../civic-shared';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1, borderStyle: 'solid', borderColor: theme.palette.divider,
  },
  '& .FusePageSimple-sidebarLeft':  { width: 300, minWidth: 300, [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 } },
  '& .FusePageSimple-sidebarRight': { width: 300, minWidth: 300, [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 } },
  '& .FusePageSimple-content':      { display: 'flex', flexDirection: 'column', flex: '1 1 0%', overflowX: 'hidden' },
}));

const F = {
  pageTitle:  'clamp(2.8rem, 4.5vw, 4rem)',
  subTitle:   'clamp(1.5rem, 2.2vw, 1.9rem)',
  cardTitle:  'clamp(1.44rem, 2.2vw, 1.96rem)',
  body:       'clamp(1.3rem, 1.8vw, 1.64rem)',
  small:      'clamp(1.2rem, 1.6vw, 1.44rem)',
  input:      'clamp(1.3rem, 1.8vw, 1.64rem)',
  chipH:      36,
};

function PetitionCard({ petition, onSign, isSigning }) {
  const progressPct = Math.round((petition.currentSignatures / petition.targetSignatures) * 100);
  const statusColors = { active: '#1d4ed8', completed: '#16a34a' };
  const accent = statusColors[petition.status] || '#1d4ed8';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ borderRadius: 22, padding: 'clamp(16px, 2.2vw, 24px)', background: 'white', border: '1px solid #e5e7eb' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: F.cardTitle, lineHeight: 1.35 }}>
          {petition.title}
        </h3>
        <Chip label={petition.status.toUpperCase()} size="small"
          sx={{ height: F.chipH, fontSize: F.small, background: accent + '15', color: accent, fontWeight: 800, flexShrink: 0 }} />
      </div>

      <div style={{ fontSize: F.body, color: '#6b7280', marginBottom: 16, lineHeight: 1.7 }}>
        {petition.description.slice(0, 160)}...
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: F.body, color: '#374151', fontWeight: 600 }}>
            {petition.currentSignatures.toLocaleString()} signatures
          </span>
          <span style={{ fontSize: F.body, fontWeight: 800, color: accent }}>{progressPct}%</span>
        </div>
        <LinearProgress variant="determinate" value={Math.min(progressPct, 100)}
          sx={{ height: 10, borderRadius: 5, backgroundColor: '#e5e7eb', '& .MuiLinearProgress-bar': { backgroundColor: accent, borderRadius: 5 } }} />
        <div style={{ fontSize: F.small, color: '#9ca3af', marginTop: 6 }}>
          Goal: {petition.targetSignatures.toLocaleString()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {petition.status === 'active' && (
          <Button size="medium" variant="contained" onClick={() => onSign?.(petition.id)} disabled={isSigning}
            startIcon={<CheckCircle />}
            sx={{ background: '#1d4ed8', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.body }}>
            Sign Petition
          </Button>
        )}
        <Button component={Link} to={`/governance/petitions/${petition.id}`}
          size="medium" variant="outlined" endIcon={<ArrowForward />}
          sx={{ borderColor: '#d1d5db', color: '#374151', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.body }}>
          Read More
        </Button>
      </div>
    </motion.div>
  );
}

function ActiveCitizenParticipationPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen]   = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = usePetitions({ category: activeCategory });
  const { mutate: signPetition, isLoading: isSigning } = useSignPetition();

  const petitions = useMemo(() => {
    const all = data?.data?.petitions || [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [data, search]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <GovernanceHeader
      leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Citizen Participation" subtitle="Digital Governance · Petitions · Accountability"
    />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar  = useMemo(() => <GovernanceSidebarLeft />, []);
  const rightSidebar = useMemo(() => <GovernanceSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg, #f9fafb 0%, #eff6ff 100%)', overflowX: 'hidden' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: 'clamp(20px, 3vw, 40px)' }}>

        <div style={{ marginBottom: 'clamp(20px, 2.8vw, 28px)' }}>
          <h1 style={{ margin: '0 0 8px', fontWeight: 900, color: '#111827', fontSize: F.pageTitle }}>
            Citizen Participation
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: F.subTitle }}>
            Sign petitions. Demand accountability. Shape your community.
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 'clamp(10px, 1.4vw, 16px)', marginBottom: 'clamp(20px, 2.8vw, 28px)' }}>
          {[
            { Icon: Campaign,    value: PETITION_STATS.activePetitions,   label: 'Active Petitions',  accent: '#1d4ed8' },
            { Icon: CheckCircle, value: PETITION_STATS.petitionsActedOn,  label: 'Acted On',          accent: '#16a34a' },
            { Icon: Edit,        value: (PETITION_STATS.totalSignatures / 1_000_000).toFixed(1) + 'M', label: 'Total Signatures', accent: '#7c3aed' },
          ].map(({ Icon, value, label, accent }) => (
            <div key={label} style={{ padding: 'clamp(14px, 1.8vw, 20px)', borderRadius: 16, background: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon sx={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: accent }} />
              <div>
                <div style={{ fontWeight: 900, fontSize: F.cardTitle, color: accent, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: F.body, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + categories */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(8px, 1.2vw, 14px)', marginBottom: 'clamp(16px, 2vw, 24px)' }}>
          <TextField size="small" placeholder="Search petitions..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 'clamp(20px, 2.4vw, 26px)', color: '#9ca3af' }} /></InputAdornment>, style: { fontSize: F.input } }}
            sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: F.input } }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Chip label="All" onClick={() => setActiveCategory('')} clickable
              sx={{ height: F.chipH, fontSize: F.small, fontWeight: 700, background: !activeCategory ? '#1d4ed8' : '#f3f4f6', color: !activeCategory ? 'white' : '#374151' }} />
            {PETITION_CATEGORIES.map((cat) => (
              <Chip key={cat.id} label={cat.label} onClick={() => setActiveCategory(cat.id)} clickable
                icon={<span style={{ fontSize: F.small }}>{cat.icon}</span>}
                sx={{ height: F.chipH, fontSize: F.small, fontWeight: 700, background: activeCategory === cat.id ? cat.color : cat.bgColor, color: activeCategory === cat.id ? 'white' : cat.color }} />
            ))}
          </div>
        </div>

        {isLoading && <CivicLoadingSkeleton />}
        {isError   && <CivicEmptyState title="Could not load petitions" description="Please try again." />}
        {!isLoading && !isError && !petitions.length && (
          <CivicEmptyState icon={<Campaign sx={{ fontSize: 64, color: '#d1d5db' }} />}
            title="No petitions found" description="No petitions match your search." />
        )}
        {!isLoading && !isError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.6vw, 18px)' }}>
            {petitions.map((p) => (
              <PetitionCard key={p.id} petition={p}
                onSign={(id) => signPetition({ petitionId: id })} isSigning={isSigning} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  ), [petitions, isLoading, isError, search, activeCategory, isSigning, signPetition]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}  leftSidebarOnClose={handleLeftClose}  leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveCitizenParticipationPage);
export default function CitizenParticipationPage() { return <MemoizedActivePage />; }
