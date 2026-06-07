import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import SecurityHeader from './shared-components/SecurityHeader';
import SocDashboardContent from './shared-components/SocDashboardContent';
import SocDashboardSidebarLeft from './shared-components/SocDashboardSidebarLeft';
import SocDashboardSidebarRight from './shared-components/SocDashboardSidebarRight';
import { useIncidents } from '../hooks/useSecurityRepo';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  '& .FusePageSimple-sidebar': { backgroundColor: '#0f172a' },
  '& .FusePageSimple-content': { backgroundColor: '#0f172a' },
}));

function ActiveSocDashboardPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [filters, setFilters] = useState({});

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useIncidents(filters);
  const incidents = useMemo(() => data?.data?.incidents, [data?.data?.incidents]);
  const stats = useMemo(() => data?.data?.stats, [data?.data?.stats]);

  const handleFilterChange = useCallback((f) => setFilters(f), []);
  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <SecurityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Security Operations Center" subtitle="Live incident monitoring — Nigeria" showReportBtn />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => (
    <SocDashboardContent incidents={incidents} isLoading={isLoading} isError={isError} stats={stats} />
  ), [incidents, isLoading, isError, stats]);

  const leftSidebar = useMemo(() => (
    <SocDashboardSidebarLeft onFilterChange={handleFilterChange} />
  ), [handleFilterChange]);

  const rightSidebar = useMemo(() => (
    <SocDashboardSidebarRight incidents={incidents} stats={stats} />
  ), [incidents, stats]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveSocDashboard = memo(ActiveSocDashboardPage);

function SocDashboardWithSidebarsPage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  const serviceStatus = useMemo(() => appSettings?.data?.payload?.securityServiceStatus, [appSettings?.data?.payload?.securityServiceStatus]);
  return <ServiceStatusLandingPage serviceStatus={serviceStatus} ActiveComponent={MemoizedActiveSocDashboard} isLoading={isLoading} isError={isError} serviceName="Security" />;
}

export default SocDashboardWithSidebarsPage;
