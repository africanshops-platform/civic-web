import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import HealthcareHeader from './shared-components/HealthcareHeader';
import HealthcareSidebarLeft from './shared-components/HealthcareSidebarLeft';
import HealthcareSidebarRight from './shared-components/HealthcareSidebarRight';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

function HealthcarePageShell({ children, title, subtitle, onFilterChange, stats, hasAlerts }) {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleFilterChange = useCallback((f) => onFilterChange?.(f), [onFilterChange]);
  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(
    () => (
      <HealthcareHeader
        leftSidebarToggle={handleLeftToggle}
        rightSidebarToggle={handleRightToggle}
        title={title}
        subtitle={subtitle}
        hasAlerts={hasAlerts}
      />
    ),
    [handleLeftToggle, handleRightToggle, title, subtitle, hasAlerts]
  );

  const leftSidebar = useMemo(
    () => <HealthcareSidebarLeft onFilterChange={handleFilterChange} />,
    [handleFilterChange]
  );

  const rightSidebar = useMemo(
    () => <HealthcareSidebarRight stats={stats} />,
    [stats]
  );

  const contentWrapper = useMemo(
    () => (
      <div
        className="flex-auto p-6 sm:p-8"
        style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #f0fdf4 100%)', minHeight: '100%' }}
      >
        {children}
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [children]
  );

  return (
    <Root
      header={header}
      content={contentWrapper}
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

export default memo(HealthcarePageShell);
