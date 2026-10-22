import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Chip } from '@mui/material';
import { ArrowBack, VerifiedUser, CheckCircle } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import GovernanceHeader from './shared-components/GovernanceHeader';
import GovernanceSidebarLeft from './shared-components/GovernanceSidebarLeft';
import GovernanceSidebarRight from './shared-components/GovernanceSidebarRight';
import { useElectionAudit } from '../hooks/useGovernanceRepo';
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
  pageTitle:    'clamp(2.8rem, 4.5vw, 4rem)',
  subTitle:     'clamp(1.5rem, 2.2vw, 1.9rem)',
  cardTitle:    'clamp(1.76rem, 2.4vw, 2.2rem)',
  body:         'clamp(1.3rem,  1.8vw, 1.64rem)',
  small:        'clamp(1.2rem,  1.6vw, 1.44rem)',
  actor:        'clamp(1.3rem,  1.8vw, 1.64rem)',
  detail:       'clamp(1.3rem,  1.8vw, 1.6rem)',
  timestamp:    'clamp(1.1rem,  1.5vw, 1.36rem)',
  verified:     'clamp(1.1rem,  1.5vw, 1.3rem)',
  timelineIcon: 'clamp(1.4rem,  2vw,   2rem)',
  chipH:        36,
  icon:         'clamp(22px, 2.8vw, 30px)',
};

const ACTION_LABEL = {
  ELECTION_CREATED: 'Election created', NOMINATIONS_OPENED: 'Nominations opened', VOTING_OPENED: 'Voting opened', ELECTION_CLOSED: 'Election closed',
  CANDIDATE_ADDED: 'Candidate added', CANDIDATE_APPROVED: 'Candidate approved', WARD_RESULT_SUBMITTED: 'Ward result submitted',
  ONLINE_VOTING_TOGGLED: 'Online voting changed', VOTE_CAST: 'Vote cast',
};
const label = (action) => ACTION_LABEL[action] || String(action).replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());

function ActiveCollationAuditPage() {
  const { electionId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen]   = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data: audit, isLoading } = useElectionAudit(electionId);
  const entries = useMemo(() => [...(audit?.entries ?? [])].reverse(), [audit]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <GovernanceHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Audit Trail" subtitle="Community vote · Tamper-evident event log" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar  = useMemo(() => <GovernanceSidebarLeft />, []);
  const rightSidebar = useMemo(() => <GovernanceSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg, #f9fafb 0%, #eff6ff 100%)', overflowX: 'hidden' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 'clamp(20px, 3vw, 40px)', maxWidth: 900, margin: '0 auto' }}>
        <Button component={Link} to={`/governance/elections/${electionId}/live`} startIcon={<ArrowBack sx={{ fontSize: F.icon }} />}
          sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 2, px: 0, fontSize: F.body }}>
          Back to the community vote
        </Button>
        <h1 style={{ margin: '0 0 8px', fontWeight: 900, color: '#111827', fontSize: F.pageTitle }}>Audit Trail</h1>
        <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: F.subTitle }}>
          Every important event in this vote is recorded in a chain. If any entry were changed afterwards the chain would no longer check out. Votes and voters are never recorded here.
        </p>

        {isLoading && <CivicLoadingSkeleton />}
        {!isLoading && audit && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Chip icon={audit.chainValid ? <VerifiedUser /> : undefined} label={audit.chainValid ? 'Chain intact' : 'Chain broken: please report this'}
                sx={{ height: F.chipH, fontSize: F.small, fontWeight: 800, background: audit.chainValid ? '#f0fdf4' : '#fef2f2', color: audit.chainValid ? '#16a34a' : '#dc2626' }} />
              <span style={{ color: '#6b7280', fontSize: F.body }}>{audit.total} event{audit.total === 1 ? '' : 's'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entries.map((e) => (
                <div key={e.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 'clamp(12px, 1.8vw, 18px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <strong style={{ color: '#111827', fontSize: F.actor }}>{label(e.action)}</strong>
                    <span style={{ color: '#9ca3af', fontSize: F.timestamp }}>{new Date(e.createdAt).toLocaleString('en-NG')}</span>
                  </div>
                  {e.details && <div style={{ color: '#4b5563', fontSize: F.detail, marginTop: 4 }}>{e.details}</div>}
                  <div style={{ color: '#9ca3af', fontSize: F.verified, marginTop: 6, fontFamily: 'monospace', wordBreak: 'break-all' }}>{e.checksum}</div>
                </div>
              ))}
              {!entries.length && <div style={{ color: '#6b7280' }}>No events recorded yet.</div>}
            </div>
          </>
        )}
      </motion.div>
    </div>
  ), [audit, entries, isLoading, electionId]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}  leftSidebarOnClose={handleLeftClose}  leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveCollationAuditPage);
export default function CollationAuditPage() { return <MemoizedActivePage />; }
