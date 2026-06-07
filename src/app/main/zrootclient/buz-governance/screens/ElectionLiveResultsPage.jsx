import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Chip, Divider } from '@mui/material';
import { ArrowBack, Save, BarChart } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import GovernanceHeader from './shared-components/GovernanceHeader';
import GovernanceSidebarLeft from './shared-components/GovernanceSidebarLeft';
import GovernanceSidebarRight from './shared-components/GovernanceSidebarRight';
import { useElectionDetail, useElectionCollation, useSubmitCollationEntry } from '../hooks/useGovernanceRepo';
import LiveCollationBoard from '../components/LiveCollationBoard';
import CollationEntryForm from '../components/CollationEntryForm';
import { CivicLoadingSkeleton } from '../../civic-shared';

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
  cardTitle:  'clamp(1.76rem, 2.4vw, 2.2rem)',
  body:       'clamp(1.3rem, 1.8vw, 1.64rem)',
  small:      'clamp(1.2rem, 1.6vw, 1.44rem)',
  th:         'clamp(1.3rem, 1.8vw, 1.6rem)',
  td:         'clamp(1.3rem, 1.8vw, 1.56rem)',
  chipH:      32,
};

function ActiveElectionLiveResultsPage() {
  const { electionId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen]   = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data: elecData, isLoading: elecLoading } = useElectionDetail(electionId);
  const { data: collData, isLoading: collLoading } = useElectionCollation(electionId);
  const { mutate: submitEntry, isLoading: isSaving } = useSubmitCollationEntry();

  const election   = useMemo(() => elecData?.data?.election,        [elecData]);
  const candidates = useMemo(() => elecData?.data?.candidates || [], [elecData]);
  const collation  = useMemo(() => collData?.data,                  [collData]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <GovernanceHeader
      leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Live Results" subtitle="Digital Governance · Real-Time Collation" activeElection />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar  = useMemo(() => <GovernanceSidebarLeft />, []);
  const rightSidebar = useMemo(() => <GovernanceSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg, #f9fafb 0%, #eff6ff 100%)', overflowX: 'hidden' }}>
      {elecLoading ? (
        <div style={{ padding: 32 }}><CivicLoadingSkeleton /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: 'clamp(20px, 3vw, 40px)' }}>

          {/* ── Page header ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 'clamp(20px, 2.8vw, 32px)' }}>
            <div>
              <Button component={Link} to="/governance/dashboard" startIcon={<ArrowBack />}
                sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 1, px: 0, fontSize: F.body }}>
                Back to Dashboard
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ margin: 0, fontWeight: 900, color: '#111827', fontSize: F.pageTitle, lineHeight: 1.2 }}>
                  Live Collation Results
                </h1>
                <Chip label="LIVE" sx={{ background: '#ef4444', color: 'white', fontWeight: 800, fontSize: F.body, height: 36, animation: 'pulse 2s infinite' }} />
              </div>
              {election && (
                <div style={{ fontSize: F.subTitle, color: '#6b7280', marginTop: 6 }}>{election.title}</div>
              )}
            </div>
            <Button component={Link} to={`/governance/elections/${electionId}/oversight`}
              variant="outlined" startIcon={<Save />}
              sx={{ borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: F.body }}>
              Oversight View
            </Button>
          </div>

          {/* ── Two-column grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 'clamp(16px, 2vw, 28px)', marginBottom: 'clamp(16px, 2vw, 24px)' }}>
            <div style={{ borderRadius: 22, padding: 'clamp(18px, 2.5vw, 28px)', background: 'white', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 18px', fontWeight: 800, color: '#111827', fontSize: F.cardTitle, display: 'flex', alignItems: 'center', gap: 10 }}>
                <BarChart sx={{ color: '#1d4ed8', fontSize: 'clamp(24px, 3vw, 30px)' }} />Live Results Board
              </h3>
              <LiveCollationBoard collation={collation} isLoading={collLoading} />
            </div>
            <div style={{ borderRadius: 22, padding: 'clamp(18px, 2.5vw, 28px)', background: 'white', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 18px', fontWeight: 800, color: '#111827', fontSize: F.cardTitle }}>
                Enter Ward Results
              </h3>
              <CollationEntryForm election={election} candidates={candidates} onSubmit={submitEntry} isSubmitting={isSaving} />
            </div>
          </div>

          {/* ── Ward table ── */}
          {collation?.wardResults?.length > 0 && (
            <div style={{ borderRadius: 22, padding: 'clamp(18px, 2.5vw, 28px)', background: 'white', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 18px', fontWeight: 800, color: '#111827', fontSize: F.cardTitle }}>Ward Collation Status</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: F.td }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      {['Ward', 'LGA', 'Collation Centre', 'Total Votes', 'Status', 'Officer'].map((h) => (
                        <th key={h} style={{ padding: 'clamp(10px, 1.4vw, 16px)', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: F.th }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {collation.wardResults.map((ward, i) => (
                      <tr key={ward.wardId} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: 'clamp(10px, 1.4vw, 14px)', fontWeight: 700, color: '#111827', fontSize: F.td }}>{ward.wardName}</td>
                        <td style={{ padding: 'clamp(10px, 1.4vw, 14px)', color: '#374151', fontSize: F.td }}>{ward.lgaName}</td>
                        <td style={{ padding: 'clamp(10px, 1.4vw, 14px)', color: '#6b7280', fontSize: F.td }}>{ward.collationCenterName}</td>
                        <td style={{ padding: 'clamp(10px, 1.4vw, 14px)', fontWeight: 600, fontSize: F.td }}>{ward.totalVotes.toLocaleString()}</td>
                        <td style={{ padding: 'clamp(10px, 1.4vw, 14px)' }}>
                          <Chip label={ward.status === 'collated' ? 'Collated' : 'Pending'}
                            sx={{ height: F.chipH, fontSize: F.small, fontWeight: 700, background: ward.status === 'collated' ? '#f0fdf4' : '#fffbeb', color: ward.status === 'collated' ? '#16a34a' : '#d97706' }} />
                        </td>
                        <td style={{ padding: 'clamp(10px, 1.4vw, 14px)', color: '#6b7280', fontSize: F.td }}>{ward.collationOfficer || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  ), [election, candidates, collation, elecLoading, collLoading, isSaving, submitEntry, electionId]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}  leftSidebarOnClose={handleLeftClose}  leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveElectionLiveResultsPage);
export default function ElectionLiveResultsPage() { return <MemoizedActivePage />; }
