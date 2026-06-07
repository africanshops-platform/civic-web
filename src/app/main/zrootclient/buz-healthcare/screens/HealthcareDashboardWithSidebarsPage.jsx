import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import HealthcareHeader from './shared-components/HealthcareHeader';
import HealthcareDashboardContent from './shared-components/HealthcareDashboardContent';
import HealthcareSidebarLeft from './shared-components/HealthcareSidebarLeft';
import HealthcareSidebarRight from './shared-components/HealthcareSidebarRight';
import { useFacilities, useHealthAlerts } from '../hooks/useHealthcareRepo';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

function ActiveHealthcareDashboardPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const { data, isLoading, isError } = useFacilities(filters);
  const { data: alertsData } = useHealthAlerts();

  const handleFilterChange = useCallback((newFilters) => setFilters(newFilters), []);
  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const facilities = useMemo(() => data?.data?.facilities, [data?.data?.facilities]);
  const stats = useMemo(() => data?.data?.stats, [data?.data?.stats]);
  const hasAlerts = useMemo(() => (alertsData?.data?.alerts?.length ?? 0) > 0, [alertsData?.data?.alerts]);

  const header = useMemo(() => (
    <HealthcareHeader
      leftSidebarToggle={handleLeftToggle}
      rightSidebarToggle={handleRightToggle}
      title="Primary Healthcare"
      subtitle="Facilities · Appointments · Health Alerts"
      hasAlerts={hasAlerts}
    />
  ), [handleLeftToggle, handleRightToggle, hasAlerts]);

  const content = useMemo(() => (
    <HealthcareDashboardContent facilities={facilities} isLoading={isLoading} isError={isError} />
  ), [facilities, isLoading, isError]);

  const leftSidebar = useMemo(() => (
    <HealthcareSidebarLeft onFilterChange={handleFilterChange} />
  ), [handleFilterChange]);

  const rightSidebar = useMemo(() => (
    <HealthcareSidebarRight stats={stats} />
  ), [stats]);

  return (
    <Root
      header={header}
      content={content}
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={handleLeftClose}
      leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={handleRightClose}
      rightSidebarContent={rightSidebar}
      scroll="content"
    />
  );
}

const MemoizedActivePage = memo(ActiveHealthcareDashboardPage);

function HealthcareDashboardWithSidebarsPage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  const serviceStatus = useMemo(
    () => appSettings?.data?.payload?.healthcareServiceStatus,
    [appSettings?.data?.payload?.healthcareServiceStatus]
  );

  return (
    <ServiceStatusLandingPage
      serviceStatus={serviceStatus}
      ActiveComponent={MemoizedActivePage}
      isLoading={isLoading}
      isError={isError}
      serviceName="Primary Healthcare"
    />
  );
}

export default HealthcareDashboardWithSidebarsPage;
