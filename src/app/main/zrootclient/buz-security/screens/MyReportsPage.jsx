import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button } from '@mui/material';
import { Shield, Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useMyReports } from '../hooks/useSecurityRepo';
import SecurityHeader from './shared-components/SecurityHeader';
import SocDashboardSidebarLeft from './shared-components/SocDashboardSidebarLeft';
import SocDashboardSidebarRight from './shared-components/SocDashboardSidebarRight';
import IncidentCard from '../components/IncidentCard';
import { CivicLoadingSkeleton, CivicEmptyState } from '../../civic-shared';
import { SECURITY_STATS } from '../mock';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const Root = styled(FusePageSimpleWithMargin)(() => ({
  '& .FusePageSimple-header':  { backgroundColor: '#0f172a', borderBottomWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)' },
  '& .FusePageSimple-sidebar': { backgroundColor: '#0f172a' },
  '& .FusePageSimple-content': { backgroundColor: '#0f172a' },
}));

function ActiveMyReportsPage() {
  const navigate  = useNavigate();
  const isMobile  = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading } = useMyReports();
  const reports = useMemo(() => data?.data?.reports || [], [data]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <SecurityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="My Reports" subtitle="Incidents you have reported" showReportBtn />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => {
    if (isLoading) return (
      <div style={{ background: '#0f172a', flex: 1 }}>
        <CivicLoadingSkeleton message="Loading your reports..." variant="list" cardCount={3} />
      </div>
    );

    return (
      <div className="flex-auto" style={{ background: '#0f172a', minHeight: '100%', padding: 'clamp(20px,4vw,48px)', overflowY: 'auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* ── Page header ── */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'clamp(12px,2vw,20px)', marginBottom: 'clamp(24px,3.5vw,40px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,2vw,18px)' }}>
              <div style={{ width: 'clamp(48px,7vw,66px)', height: 'clamp(48px,7vw,66px)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 10px 28px rgba(220,38,38,0.44)', flexShrink: 0 }}>
                <Shield style={{ color: 'white', fontSize: 'clamp(1.5rem,3vw,2.2rem)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: F.sectionH, color: 'white', lineHeight: 1.1 }}>My Reports</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: F.body, marginTop: 4 }}>Incidents you have reported</div>
              </div>
            </div>
            <Button startIcon={<Add style={{ fontSize: 'clamp(16px,2vw,20px)' }} />} variant="contained"
              onClick={() => navigate('/security/report-incident')}
              style={{ fontSize: F.btn }}
              sx={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', color: 'white', fontWeight: 700, borderRadius: 'clamp(12px,1.5vw,16px)', textTransform: 'none', px: { xs: 2.5, sm: 3.5 }, py: { xs: 1.4, sm: 1.6 }, boxShadow: '0 6px 20px rgba(220,38,38,0.4)', '&:hover': { background: 'linear-gradient(135deg,#b91c1c,#7f1d1d)', transform: 'translateY(-1px)' } }}>
              New Report
            </Button>
          </motion.div>

          {/* ── Quick stats ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px,18vw,210px), 1fr))', gap: 'clamp(12px,2vw,20px)', marginBottom: 'clamp(24px,3.5vw,40px)' }}>
            {[
              { label: 'Total Reported', value: reports.length },
              { label: 'Avg Response',   value: SECURITY_STATS.avgResponseTime },
              { label: 'Resolved',       value: reports.filter((r) => r.status === 'resolved').length },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                style={{ padding: 'clamp(16px,2.5vw,26px) clamp(18px,3vw,30px)', borderRadius: 'clamp(14px,2vw,20px)', background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.09)', textAlign: 'center', boxShadow: '0 4px 18px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: F.sectionH, fontWeight: 900, color: '#ea580c', lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.48)', marginTop: 'clamp(6px,1vw,10px)', fontWeight: 600 }}>{item.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Section header ── */}
          {reports.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
              style={{ marginBottom: 'clamp(14px,2vw,22px)' }}>
              <div style={{ fontWeight: 800, fontSize: F.subH, color: 'rgba(255,255,255,0.75)' }}>
                {reports.length} Report{reports.length > 1 ? 's' : ''} Submitted
              </div>
            </motion.div>
          )}

          {/* ── Reports list / empty ── */}
          {reports.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
              style={{ background: 'rgba(255,255,255,0.035)', borderRadius: 'clamp(14px,2vw,22px)', overflow: 'hidden' }}>
              <CivicEmptyState
                title="No reports yet"
                description="You haven't submitted any incident reports yet. Help keep your community safer by reporting what you see."
                ctaLabel="Report an Incident"
                onCta={() => navigate('/security/report-incident')}
              />
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,2.5vw,22px)' }}>
              {reports.map((report, i) => (
                <IncidentCard key={report.id} incident={report} index={i} />
              ))}
            </div>
          )}

          {/* ── Emergency footer ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            style={{ marginTop: 'clamp(28px,4.5vw,52px)', padding: 'clamp(14px,2.5vw,22px)', borderRadius: 'clamp(12px,2vw,18px)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: F.body, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              🚨 For emergencies, call{' '}
              <strong style={{ color: '#f87171' }}>112</strong>{' '}or{' '}
              <strong style={{ color: '#f87171' }}>199</strong>{' '}immediately. Do not wait to file a report.
            </div>
          </motion.div>

        </div>
      </div>
    );
  }, [reports, isLoading, navigate]);

  const leftSidebar  = useMemo(() => <SocDashboardSidebarLeft />, []);
  const rightSidebar = useMemo(() => <SocDashboardSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveMyReportsPage = memo(ActiveMyReportsPage);
export default function MyReportsPage() { return <MemoizedActiveMyReportsPage />; }
