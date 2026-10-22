import { styled } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import GovernanceHeader from './GovernanceHeader';
import GovernanceSidebarLeft from './GovernanceSidebarLeft';
import GovernanceSidebarRight from './GovernanceSidebarRight';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1, borderStyle: 'solid', borderColor: theme.palette.divider,
  },
  '& .FusePageSimple-sidebarLeft':  { width: 300, minWidth: 300, [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 } },
  '& .FusePageSimple-sidebarRight': { width: 300, minWidth: 300, [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 } },
  '& .FusePageSimple-content':      { display: 'flex', flexDirection: 'column', flex: '1 1 0%', overflowX: 'hidden' },
}));

/** The standard three-section governance page: left menu, content, right panel. Every governance page uses it unless it is a landing page. */
export default function GovernanceShell({ title, subtitle, children }) {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftOpen, setLeftOpen] = useState(!isMobile);
  const [rightOpen, setRightOpen] = useState(!isMobile);
  useEffect(() => { setLeftOpen(!isMobile); setRightOpen(!isMobile); }, [isMobile]);

  const toggleLeft = useCallback(() => setLeftOpen((v) => !v), []);
  const toggleRight = useCallback(() => setRightOpen((v) => !v), []);
  const closeLeft = useCallback(() => setLeftOpen(false), []);
  const closeRight = useCallback(() => setRightOpen(false), []);
  const leftSidebar = useMemo(() => <GovernanceSidebarLeft />, []);
  const rightSidebar = useMemo(() => <GovernanceSidebarRight />, []);

  return (
    <Root
      header={<GovernanceHeader leftSidebarToggle={toggleLeft} rightSidebarToggle={toggleRight} title={title} subtitle={subtitle} />}
      content={<div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg, #f9fafb 0%, #eff6ff 100%)', overflowX: 'hidden' }}>{children}</div>}
      leftSidebarOpen={leftOpen} leftSidebarOnClose={closeLeft} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightOpen} rightSidebarOnClose={closeRight} rightSidebarContent={rightSidebar}
      scroll="content"
    />
  );
}
