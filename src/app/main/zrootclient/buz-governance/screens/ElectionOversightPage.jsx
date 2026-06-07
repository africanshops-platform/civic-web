import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Chip } from '@mui/material';
import { ArrowBack, Gavel } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import GovernanceHeader from './shared-components/GovernanceHeader';
import GovernanceSidebarLeft from './shared-components/GovernanceSidebarLeft';
import GovernanceSidebarRight from './shared-components/GovernanceSidebarRight';
import { useElectionDetail, useElectionCollation } from '../hooks/useGovernanceRepo';
import LiveCollationBoard from '../components/LiveCollationBoard';
import JurisdictionResultsMap from '../components/JurisdictionResultsMap';
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
  body:       'clamp(1.3rem,  1.8vw, 1.64rem)',
  small:      'clamp(1.2rem,  1.6vw, 1.44rem)',
  statValue:  'clamp(1.6rem,  2.6vw, 2.4rem)',
  statLabel:  'clamp(1.1rem,  1.5vw, 1.36rem)',
  btn:        'clamp(1.3rem,  1.8vw, 1.6rem)',
  chipH:      36,
  icon:       'clamp(22px, 2.8vw, 30px)',
};

function ActiveElectionOversightPage() {
  const { electionId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen]   = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data: elecData, isLoading: elecLoading } = useElectionDetail(electionId);
  const { data: collData, isLoading: collLoading } = useElectionCollation(electionId);

  const election  = useMemo(() => elecData?.data?.election, [elecData]);
  const collation = useMemo(() => collData?.data,           [collData]);

  const collationPct = useMemo(() =>
    collation ? Math.round((collation.summary.wardsCollated / collation.summary.totalWards) * 100) : 0,
    [collation]
  );

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <GovernanceHeader
      leftSidebarToggle={handleLeftToggle}
      rightSidebarToggle={handleRightToggle}
      title="Election Oversight"
      subtitle="Digital Governance · Observer Mode · Audit"
    />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar  = useMemo(() => <GovernanceSidebarLeft />, []);
  const rightSidebar = useMemo(() => <GovernanceSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg,#f9fafb 0%,#eff6ff 100%)', overflowX: 'hidden' }}>
      {elecLoading ? (
        <div style={{ padding: 'clamp(20px,3vw,40px)' }}><CivicLoadingSkeleton /></div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: 'clamp(20px,3vw,40px)', width: '100%', boxSizing: 'border-box' }}>

          {/* ── Page header ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 'clamp(20px,2.8vw,32px)' }}>
            <div>
              <Button
                component={Link} to={`/governance/elections/${electionId}/live`}
                startIcon={<ArrowBack sx={{ fontSize: F.icon }} />}
                sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 1, px: 0, fontSize: F.body }}
              >
                Live Results
              </Button>
              <h1 style={{ margin: 0, fontWeight: 900, color: '#111827', fontSize: F.pageTitle, lineHeight: 1.2 }}>
                Election Oversight
              </h1>
              {election && (
                <div style={{ fontSize: F.subTitle, color: '#6b7280', marginTop: 6 }}>{election.title}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                icon={<Gavel sx={{ fontSize: F.icon }} />}
                label="Observer Mode"
                sx={{ height: F.chipH, fontSize: F.body, background: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}
              />
              <Button
                component={Link} to={`/governance/elections/${electionId}/audit`}
                variant="outlined"
                sx={{ borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: F.btn }}
              >
                Audit Trail
              </Button>
            </div>
          </div>

          {/* ── Collation progress banner ── */}
          {collation && (
            <div style={{
              borderRadius: 20,
              padding: 'clamp(16px,2.2vw,24px)',
              background: 'linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%)',
              border: '1px solid #c7d2fe',
              marginBottom: 'clamp(18px,2.4vw,28px)',
              display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20,
            }}>
              <div>
                <div style={{ fontWeight: 800, color: '#1e1b4b', fontSize: F.cardTitle, lineHeight: 1.2 }}>
                  Collation Progress: {collationPct}%
                </div>
                <div style={{ fontSize: F.body, color: '#6b7280', marginTop: 6 }}>
                  {collation.summary.wardsCollated} of {collation.summary.totalWards} wards collated
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'clamp(16px,2.5vw,32px)', flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Votes Cast', value: collation.summary.totalVotesCast.toLocaleString() },
                  { label: 'Rejected Votes',   value: collation.summary.rejectedVotes.toLocaleString()  },
                  { label: 'Valid Votes',       value: collation.summary.validVotes.toLocaleString()     },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 900, color: '#1e1b4b', fontSize: F.statValue }}>{s.value}</div>
                    <div style={{ fontSize: F.statLabel, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Two-column grid: live board + map ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,460px),1fr))', gap: 'clamp(16px,2vw,28px)' }}>

            {/* Live tally */}
            <div style={{ borderRadius: 22, padding: 'clamp(18px,2.5vw,28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 clamp(14px,1.8vw,20px)', fontWeight: 800, color: '#111827', fontSize: F.cardTitle }}>
                Live Vote Tally
              </h3>
              <LiveCollationBoard collation={collation} isLoading={collLoading} />
            </div>

            {/* LGA map */}
            <div style={{ borderRadius: 22, padding: 'clamp(18px,2.5vw,28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 clamp(14px,1.8vw,20px)', fontWeight: 800, color: '#111827', fontSize: F.cardTitle }}>
                LGA Results Map
              </h3>
              <JurisdictionResultsMap lgaBreakdown={collation?.lgaBreakdown || []} isLoading={collLoading} />

              {collation?.lgaBreakdown && (
                <div style={{ marginTop: 'clamp(12px,1.6vw,20px)', display: 'flex', flexDirection: 'column', gap: 'clamp(6px,1vw,10px)' }}>
                  {collation.lgaBreakdown.map((lga) => (
                    <div key={lga.lgaId} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: 'clamp(10px,1.4vw,14px) clamp(12px,1.6vw,18px)',
                      borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb',
                    }}>
                      <span style={{ fontWeight: 700, color: '#374151', fontSize: F.body }}>{lga.lgaName}</span>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: F.small, color: '#6b7280' }}>
                          {lga.wardsCollated}/{lga.wardsTotal} wards
                        </span>
                        <Chip
                          label={lga.leadingParty}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: F.small, height: F.chipH }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  ), [election, collation, elecLoading, collLoading, collationPct, electionId]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}  leftSidebarOnClose={handleLeftClose}  leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveElectionOversightPage);
export default function ElectionOversightPage() { return <MemoizedActivePage />; }
