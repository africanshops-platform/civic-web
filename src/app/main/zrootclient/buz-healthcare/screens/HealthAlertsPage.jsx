import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Chip, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Warning } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import HealthcareHeader from './shared-components/HealthcareHeader';
import HealthcareSidebarLeft from './shared-components/HealthcareSidebarLeft';
import HealthcareSidebarRight from './shared-components/HealthcareSidebarRight';
import { useHealthAlerts } from '../hooks/useHealthcareRepo';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const SEVERITY_STYLES = {
  critical: { bg: '#fff1f2', border: '#fecdd3', color: '#be123c', chipBg: '#dc2626', chipColor: 'white' },
  high: { bg: '#fff7ed', border: '#fed7aa', color: '#9a3412', chipBg: '#ea580c', chipColor: 'white' },
  medium: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', chipBg: '#d97706', chipColor: 'white' },
  low: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', chipBg: '#16a34a', chipColor: 'white' },
};

function ActiveHealthAlertsPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useHealthAlerts();
  const alerts = useMemo(() => data?.data?.alerts ?? [], [data]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <HealthcareHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Health Alerts" subtitle="NCDC · Lagos State Ministry of Health · Active Advisories" hasAlerts />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <HealthcareSidebarLeft />, []);
  const rightSidebar = useMemo(() => <HealthcareSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <Warning sx={{ color: '#dc2626', fontSize: '3rem' }} />
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>Active Health Alerts</h1>
        </div>
        <p style={{ margin: '0 0 32px', color: '#6b7280', fontSize: '1.9rem', lineHeight: 1.6 }}>
          Real-time public health advisories from the NCDC and Lagos State Ministry of Health.
        </p>

        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#16a34a' }} /></div>}
        {isError && <div style={{ padding: 32, textAlign: 'center', borderRadius: 18, background: '#fef2f2', border: '1px solid #fecaca' }}><div style={{ color: '#dc2626', fontWeight: 700, fontSize: '1.8rem' }}>Failed to load alerts.</div></div>}

        {!isLoading && !isError && alerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f0fdf4', borderRadius: 22, border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>✅</div>
            <div style={{ fontWeight: 800, color: '#166534', fontSize: '2.2rem' }}>No active health alerts</div>
            <div style={{ color: '#6b7280', fontSize: '1.8rem', marginTop: 10 }}>Your area is currently clear of any active health advisories.</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {alerts.map((alert, i) => {
            const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.medium;
            return (
              <motion.div key={alert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: 28, borderRadius: 22, background: style.bg, border: `1px solid ${style.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '2rem', color: style.color }}>{alert.title}</h3>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Chip label={alert.severity.toUpperCase()} sx={{ height: 36, fontSize: '1.36rem', fontWeight: 800, background: style.chipBg, color: style.chipColor }} />
                    <Chip label={alert.category} sx={{ height: 36, fontSize: '1.36rem', fontWeight: 700, background: 'rgba(0,0,0,0.06)', color: style.color, textTransform: 'capitalize' }} />
                  </div>
                </div>
                <p style={{ margin: '0 0 14px', fontSize: '1.8rem', color: style.color, lineHeight: 1.7, opacity: 0.9 }}>{alert.description}</p>
                <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(0,0,0,0.05)', marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.64rem', color: style.color, marginBottom: 6 }}>⚡ Action Required</div>
                  <p style={{ margin: 0, fontSize: '1.7rem', color: style.color, opacity: 0.85, lineHeight: 1.6 }}>{alert.actionRequired}</p>
                </div>
                {alert.affectedAreas?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, color: style.color, opacity: 0.7 }}>Affected areas:</span>
                    {alert.affectedAreas.map((area) => (
                      <Chip key={area} label={area} sx={{ height: 32, fontSize: '1.3rem', fontWeight: 600, background: 'rgba(0,0,0,0.06)', color: style.color }} />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  ), [alerts, isLoading, isError]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveHealthAlertsPage);
export default function HealthAlertsPage() { return <MemoizedActivePage />; }
