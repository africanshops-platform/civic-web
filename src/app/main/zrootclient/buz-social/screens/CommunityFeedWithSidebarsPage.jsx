import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import CommunityHeader from './shared-components/CommunityHeader';
import CommunityFeedContent from './shared-components/CommunityFeedContent';
import CommunityFeedSidebarLeft from './shared-components/CommunityFeedSidebarLeft';
import CommunityFeedSidebarRight from './shared-components/CommunityFeedSidebarRight';
import { useIssues } from '../hooks/useSocialRepo';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

function ActiveCommunityFeedPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const { data, isLoading, isError } = useIssues(filters);

  const handleFilterChange = useCallback((f) => setFilters(f), []);
  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const issues = useMemo(() => data?.data?.issues, [data?.data?.issues]);
  const stats = useMemo(() => data?.data?.stats, [data?.data?.stats]);

  const header = useMemo(() => (
    <CommunityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle} title="Community Feed" subtitle="Report · Discuss · Hold Leaders Accountable" />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => (
    <CommunityFeedContent issues={issues} isLoading={isLoading} isError={isError} />
  ), [issues, isLoading, isError]);

  const leftSidebar = useMemo(() => (
    <CommunityFeedSidebarLeft onFilterChange={handleFilterChange} />
  ), [handleFilterChange]);

  const rightSidebar = useMemo(() => (
    <CommunityFeedSidebarRight stats={stats} />
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

const MemoizedActiveCommunityFeedPage = memo(ActiveCommunityFeedPage);

function CommunityFeedWithSidebarsPage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  const serviceStatus = useMemo(
    () => appSettings?.data?.payload?.communityServiceStatus,
    [appSettings?.data?.payload?.communityServiceStatus]
  );
  return (
    <ServiceStatusLandingPage
      serviceStatus={serviceStatus}
      ActiveComponent={MemoizedActiveCommunityFeedPage}
      isLoading={isLoading}
      isError={isError}
      serviceName="Community"
    />
  );
}

export default CommunityFeedWithSidebarsPage;
