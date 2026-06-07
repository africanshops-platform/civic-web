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
import { useElectionCollation } from '../hooks/useGovernanceRepo';
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

const AUDIT_EVENTS = [
  { id: 1, type: 'collation_submitted', actor: 'Mrs. Ada Nwosu (RO)',     ward: 'Ikoyi-Obalende', timestamp: '2027-03-15T13:02:00Z', detail: 'Ward result submitted and countersigned',                          verified: true },
  { id: 2, type: 'collation_submitted', actor: 'Mr. James Olusegun (RO)', ward: 'Eti-Osa I',       timestamp: '2027-03-15T12:14:00Z', detail: 'Ward result submitted and countersigned',                          verified: true },
  { id: 3, type: 'system_check',        actor: 'INEC Backend System',     ward: null,              timestamp: '2027-03-15T11:00:00Z', detail: 'Cryptographic hash verification passed for batch #47',            verified: true },
  { id: 4, type: 'observer_note',       actor: 'EU Observer Mission',     ward: 'Agege North',     timestamp: '2027-03-15T10:48:00Z', detail: 'Observed accreditation process — no irregularities noted',       verified: true },
  { id: 5, type: 'collation_pending',   actor: 'System',                  ward: 'Agege North',     timestamp: '2027-03-15T10:00:00Z', detail: 'Collation centre officially opened',                             verified: true },
];

const EVENT_STYLES = {
  collation_submitted: { icon: '📋', color: '#16a34a', bg: '#f0fdf4' },
  system_check:        { icon: '🔒', color: '#1d4ed8', bg: '#eff6ff' },
  observer_note:       { icon: '👁️', color: '#7c3aed', bg: '#f5f3ff' },
  collation_pending:   { icon: '⏳', color: '#d97706', bg: '#fffbeb' },
};

function ActiveCollationAuditPage() {
  const { electionId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen]   = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data: collData, isLoading } = useElectionCollation(electionId);
  const collation = useMemo(() => collData?.data, [collData]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <GovernanceHeader
      leftSidebarToggle={handleLeftToggle}
      rightSidebarToggle={handleRightToggle}
      title="Audit Trail"
      subtitle="Digital Governance · Immutable Collation Log"
    />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar  = useMemo(() => <GovernanceSidebarLeft />, []);
  const rightSidebar = useMemo(() => <GovernanceSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg,#f9fafb 0%,#eff6ff 100%)', overflowX: 'hidden' }}>
      {isLoading ? (
        <div style={{ padding: 'clamp(20px,3vw,40px)' }}><CivicLoadingSkeleton /></div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: 'clamp(20px,3vw,40px)', maxWidth: 960, margin: '0 auto' }}>

          {/* ── Back button ── */}
          <Button
            component={Link} to={`/governance/elections/${electionId}/oversight`}
            startIcon={<ArrowBack sx={{ fontSize: F.icon }} />}
            sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 2.5, px: 0, fontSize: F.body }}
          >
            Back to Oversight
          </Button>

          {/* ── Page title ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,1.6vw,18px)', marginBottom: 'clamp(16px,2vw,24px)', flexWrap: 'wrap' }}>
            <div style={{
              width: 'clamp(52px,6vw,64px)', height: 'clamp(52px,6vw,64px)',
              borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg,#1d4ed8 0%,#7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <VerifiedUser sx={{ color: 'white', fontSize: 'clamp(26px,3.2vw,36px)' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 900, color: '#111827', fontSize: F.pageTitle, lineHeight: 1.2 }}>
                Audit Trail
              </h1>
              <div style={{ fontSize: F.subTitle, color: '#6b7280', marginTop: 4 }}>
                Immutable log of all collation actions for this election
              </div>
            </div>
          </div>

          {/* ── Summary badges ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 'clamp(20px,2.8vw,32px)' }}>
            {[
              { label: `${collation?.summary?.wardsCollated || 0} wards collated`, color: '#16a34a' },
              { label: `${AUDIT_EVENTS.length} audit events`,                      color: '#1d4ed8' },
              { label: 'Cryptographic integrity: VERIFIED',                        color: '#7c3aed' },
            ].map((b) => (
              <Chip
                key={b.label}
                icon={<CheckCircle sx={{ fontSize: F.icon, color: `${b.color} !important` }} />}
                label={b.label}
                sx={{
                  height: F.chipH, fontSize: F.body,
                  background: b.color + '15', color: b.color,
                  fontWeight: 700, border: `1px solid ${b.color}33`,
                }}
              />
            ))}
          </div>

          {/* ── Audit timeline ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {AUDIT_EVENTS.map((event, i) => {
              const style = EVENT_STYLES[event.type] || EVENT_STYLES.observer_note;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{ display: 'flex', gap: 'clamp(14px,1.8vw,20px)', alignItems: 'flex-start' }}
                >
                  {/* Timeline node + connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 'clamp(40px,5vw,52px)', height: 'clamp(40px,5vw,52px)',
                      borderRadius: '50%',
                      background: style.bg, border: `2px solid ${style.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: F.timelineIcon,
                    }}>
                      {style.icon}
                    </div>
                    {i < AUDIT_EVENTS.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: '#e5e7eb', minHeight: 24 }} />
                    )}
                  </div>

                  {/* Event card */}
                  <div style={{
                    flex: 1,
                    borderRadius: 16,
                    padding: 'clamp(14px,1.8vw,20px) clamp(16px,2vw,24px)',
                    background: style.bg,
                    border: `1px solid ${style.color}22`,
                    marginBottom: 'clamp(10px,1.4vw,16px)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: style.color, fontSize: F.actor }}>
                        {event.actor}
                      </span>
                      <span style={{ fontSize: F.timestamp, color: '#9ca3af' }}>
                        {new Date(event.timestamp).toLocaleString('en-NG', {
                          hour: '2-digit', minute: '2-digit',
                          day: 'numeric', month: 'short',
                        })}
                      </span>
                    </div>

                    <div style={{ fontSize: F.detail, color: '#374151', lineHeight: 1.55, marginBottom: event.ward ? 8 : 0 }}>
                      {event.detail}
                    </div>

                    {event.ward && (
                      <div style={{ fontSize: F.body, color: '#6b7280', marginTop: 4 }}>
                        Ward: <strong style={{ color: '#374151' }}>{event.ward}</strong>
                      </div>
                    )}

                    {event.verified && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <CheckCircle sx={{ fontSize: 'clamp(16px,2vw,20px)', color: '#16a34a' }} />
                        <span style={{ fontSize: F.verified, color: '#16a34a', fontWeight: 700 }}>
                          VERIFIED
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  ), [collation, isLoading, electionId]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}  leftSidebarOnClose={handleLeftClose}  leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveCollationAuditPage);
export default function CollationAuditPage() { return <MemoizedActivePage />; }
