import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import GovernanceHeader from './shared-components/GovernanceHeader';
import GovernanceDashboardContent from './shared-components/GovernanceDashboardContent';
import GovernanceSidebarLeft from './shared-components/GovernanceSidebarLeft';
import GovernanceSidebarRight from './shared-components/GovernanceSidebarRight';
import { useElections } from '../hooks/useGovernanceRepo';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
  /* ── Responsive sidebar widths ── */
  '& .FusePageSimple-sidebarLeft': {
    width: 300, minWidth: 300,
    [theme.breakpoints.down('xl')]: { width: 280, minWidth: 280 },
    [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 },
  },
  '& .FusePageSimple-sidebarRight': {
    width: 300, minWidth: 300,
    [theme.breakpoints.down('xl')]: { width: 280, minWidth: 280 },
    [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 },
  },
  /* ── Content fills remaining width, no horizontal overflow ── */
  '& .FusePageSimple-content': {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0%',
    overflowX: 'hidden',
  },
}));

function ActiveGovernanceDashboardPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen]   = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const { data, isLoading, isError } = useElections(filters);

  const handleFilterChange = useCallback((newFilters) => setFilters(newFilters), []);
  const handleLeftToggle   = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle  = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose    = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose   = useCallback(() => setRightSidebarOpen(false), []);

  const elections      = useMemo(() => data?.data?.elections,                          [data?.data?.elections]);
  const stats          = useMemo(() => data?.data?.stats,                              [data?.data?.stats]);
  const hasLiveElection = useMemo(() => elections?.some((e) => e.status === 'ongoing'), [elections]);

  const header = useMemo(() => (
    <GovernanceHeader
      leftSidebarToggle={handleLeftToggle}
      rightSidebarToggle={handleRightToggle}
      title="Digital Governance"
      subtitle="Elections · Petitions · Citizen Participation"
      activeElection={hasLiveElection}
    />
  ), [handleLeftToggle, handleRightToggle, hasLiveElection]);

  /* Wrap in flex-auto so FusePageSimple fills height and the gradient
     covers the full scroll area — cards use the entire available width. */
  const content = useMemo(() => (
    <div
      className="flex-auto"
      style={{
        minHeight: '100%',
        width: '100%',
        background: 'linear-gradient(180deg, #f9fafb 0%, #eff6ff 100%)',
        overflowX: 'hidden',
      }}
    >
      <GovernanceDashboardContent
        elections={elections}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  ), [elections, isLoading, isError]);

  const leftSidebar = useMemo(() => (
    <GovernanceSidebarLeft onFilterChange={handleFilterChange} />
  ), [handleFilterChange]);

  const rightSidebar = useMemo(() => (
    <GovernanceSidebarRight stats={stats} elections={elections} />
  ), [stats, elections]);

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

const MemoizedActiveGovernanceDashboardPage = memo(ActiveGovernanceDashboardPage);

function GovernanceDashboardWithSidebarsPage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  const serviceStatus = useMemo(
    () => appSettings?.data?.payload?.governanceServiceStatus,
    [appSettings?.data?.payload?.governanceServiceStatus]
  );

  return (
    <ServiceStatusLandingPage
      serviceStatus={serviceStatus}
      ActiveComponent={MemoizedActiveGovernanceDashboardPage}
      isLoading={isLoading}
      isError={isError}
      serviceName="Digital Governance"
    />
  );
}

export default GovernanceDashboardWithSidebarsPage;
