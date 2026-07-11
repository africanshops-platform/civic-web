import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import CivicTaxHeader from './shared-components/CivicTaxHeader';
import CampaignsBrowseContent from './shared-components/CampaignsBrowseContent';
import CampaignsBrowseSidebarLeft from './shared-components/CampaignsBrowseSidebarLeft';
import CampaignsBrowseSidebarRight from './shared-components/CampaignsBrowseSidebarRight';
import { useCampaigns } from '../hooks/useCivicTaxRepo';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

function ActiveCampaignsBrowsePage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const { data, isLoading, isError } = useCampaigns({ ...filters, page });
  const pagination = useMemo(() => data?.data?.pagination, [data]);

  const handleFilterChange = useCallback((newFilters) => { setFilters(newFilters); setPage(1); }, []);
  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const campaigns = useMemo(() => data?.data?.campaigns, [data?.data?.campaigns]);
  const stats = useMemo(() => data?.data?.stats, [data?.data?.stats]);

  const header = useMemo(() => (
    <CivicTaxHeader
      leftSidebarToggle={handleLeftToggle}
      rightSidebarToggle={handleRightToggle}
      title="Civic Tax Campaigns"
      subtitle="Choose a campaign. Make an impact."
      showContributeBtn
    />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => (
    <CampaignsBrowseContent
      campaigns={campaigns}
      isLoading={isLoading}
      isError={isError}
      stats={stats}
      activeCategory={filters.category}
      pagination={pagination}
      onPageChange={setPage}
    />
  ), [campaigns, isLoading, isError, stats, filters.category, pagination]);

  const leftSidebar = useMemo(() => (
    <CampaignsBrowseSidebarLeft onFilterChange={handleFilterChange} />
  ), [handleFilterChange]);

  const rightSidebar = useMemo(() => (
    <CampaignsBrowseSidebarRight stats={stats} campaigns={campaigns} />
  ), [stats, campaigns]);

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

const MemoizedActiveCampaignsBrowsePage = memo(ActiveCampaignsBrowsePage);

function CampaignsBrowseWithSidebarsPage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  const serviceStatus = useMemo(
    () => appSettings?.data?.payload?.civicTaxServiceStatus,
    [appSettings?.data?.payload?.civicTaxServiceStatus]
  );

  return (
    <ServiceStatusLandingPage
      serviceStatus={serviceStatus}
      ActiveComponent={MemoizedActiveCampaignsBrowsePage}
      isLoading={isLoading}
      isError={isError}
      serviceName="Civic Tax"
    />
  );
}

export default CampaignsBrowseWithSidebarsPage;
