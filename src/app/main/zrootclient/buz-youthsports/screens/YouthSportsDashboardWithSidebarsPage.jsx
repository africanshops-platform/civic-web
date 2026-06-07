import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import YouthSportsHeader from './shared-components/YouthSportsHeader';
import YouthSportsDashboardContent from './shared-components/YouthSportsDashboardContent';
import YouthSportsSidebarLeft from './shared-components/YouthSportsSidebarLeft';
import YouthSportsSidebarRight from './shared-components/YouthSportsSidebarRight';
import { usePrograms, useYouthStats } from '../hooks/useYouthSportsRepo';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
  /* ── Sidebar widths at each breakpoint ── */
  '& .FusePageSimple-sidebarLeft': {
    width: 300,
    minWidth: 300,
    [theme.breakpoints.down('xl')]: { width: 280, minWidth: 280 },
    [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 },
  },
  '& .FusePageSimple-sidebarRight': {
    width: 300,
    minWidth: 300,
    [theme.breakpoints.down('xl')]: { width: 280, minWidth: 280 },
    [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 },
  },
  /* ── Content area: full width, no overflow ── */
  '& .FusePageSimple-content': {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0%',
    overflowX: 'hidden',
  },
}));

function ActiveYouthSportsDashboardPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const { data, isLoading, isError } = usePrograms(filters);
  const { data: statsData } = useYouthStats();

  const handleFilterChange = useCallback((newFilters) => setFilters(newFilters), []);
  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const programs = useMemo(() => data?.data?.programs,   [data?.data?.programs]);
  const stats    = useMemo(() => statsData?.data?.stats, [statsData?.data?.stats]);

  const header = useMemo(() => (
    <YouthSportsHeader
      leftSidebarToggle={handleLeftToggle}
      rightSidebarToggle={handleRightToggle}
      title="Youth & Sports"
      subtitle="Programmes · Tournaments · Talent · Mentors"
    />
  ), [handleLeftToggle, handleRightToggle]);

  /* Wrap content in a flex-auto div so FusePageSimple fills height correctly
     and the gradient background covers the full scroll area on all screens.    */
  const content = useMemo(() => (
    <div
      className="flex-auto"
      style={{
        minHeight: '100%',
        background: 'linear-gradient(180deg, #f9fafb 0%, #fff7ed 100%)',
        overflowX: 'hidden',
      }}
    >
      <YouthSportsDashboardContent
        programs={programs}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  ), [programs, isLoading, isError]);

  const leftSidebar = useMemo(() => (
    <YouthSportsSidebarLeft onFilterChange={handleFilterChange} />
  ), [handleFilterChange]);

  const rightSidebar = useMemo(() => (
    <YouthSportsSidebarRight stats={stats} />
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

const MemoizedActivePage = memo(ActiveYouthSportsDashboardPage);

function YouthSportsDashboardWithSidebarsPage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  const serviceStatus = useMemo(
    () => appSettings?.data?.payload?.youthSportsServiceStatus,
    [appSettings?.data?.payload?.youthSportsServiceStatus]
  );

  return (
    <ServiceStatusLandingPage
      serviceStatus={serviceStatus}
      ActiveComponent={MemoizedActivePage}
      isLoading={isLoading}
      isError={isError}
      serviceName="Youth & Sports"
    />
  );
}

export default YouthSportsDashboardWithSidebarsPage;
