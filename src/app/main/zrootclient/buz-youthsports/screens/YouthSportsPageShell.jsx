import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import YouthSportsHeader from './shared-components/YouthSportsHeader';
import YouthSportsSidebarLeft from './shared-components/YouthSportsSidebarLeft';
import YouthSportsSidebarRight from './shared-components/YouthSportsSidebarRight';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

function YouthSportsPageShell({ children, title, subtitle, onFilterChange, stats }) {
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
      <YouthSportsHeader
        leftSidebarToggle={handleLeftToggle}
        rightSidebarToggle={handleRightToggle}
        title={title}
        subtitle={subtitle}
      />
    ),
    [handleLeftToggle, handleRightToggle, title, subtitle]
  );

  const leftSidebar = useMemo(
    () => <YouthSportsSidebarLeft onFilterChange={handleFilterChange} />,
    [handleFilterChange]
  );

  const rightSidebar = useMemo(
    () => <YouthSportsSidebarRight stats={stats} />,
    [stats]
  );

  const contentWrapper = useMemo(
    () => (
      <div
        className="flex-auto p-6 sm:p-8"
        style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #fff7ed 100%)', minHeight: '100%' }}
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

export default memo(YouthSportsPageShell);
