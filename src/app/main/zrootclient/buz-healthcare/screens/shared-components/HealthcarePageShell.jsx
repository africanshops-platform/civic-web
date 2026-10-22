import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import HealthcareHeader from './HealthcareHeader';
import HealthcareSidebarLeft from './HealthcareSidebarLeft';
import HealthcareSidebarRight from './HealthcareSidebarRight';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

export const PAGE_BG = 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)';

/** The frame every healthcare page shares: header, the filter/links sidebar on the left and alerts on the right. */
export default function HealthcarePageShell({ title, subtitle, hasAlerts, typeFilter, onTypeChange, primaryOnly, onPrimaryOnlyChange, mapFacilities, children }) {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [left, setLeft] = useState(!isMobile);
  const [right, setRight] = useState(!isMobile);

  useEffect(() => {
    setLeft(!isMobile);
    setRight(!isMobile);
  }, [isMobile]);

  const toggleLeft = useCallback(() => setLeft((v) => !v), []);
  const toggleRight = useCallback(() => setRight((v) => !v), []);

  const header = useMemo(
    () => <HealthcareHeader leftSidebarToggle={toggleLeft} rightSidebarToggle={toggleRight} title={title} subtitle={subtitle} hasAlerts={hasAlerts} />,
    [toggleLeft, toggleRight, title, subtitle, hasAlerts]
  );

  return (
    <Root
      header={header}
      content={<div className="flex-auto p-6 sm:p-8" style={{ background: PAGE_BG, minHeight: '100%' }}>{children}</div>}
      leftSidebarOpen={left}
      leftSidebarOnClose={() => setLeft(false)}
      leftSidebarContent={<HealthcareSidebarLeft typeFilter={typeFilter} onTypeChange={onTypeChange} primaryOnly={primaryOnly} onPrimaryOnlyChange={onPrimaryOnlyChange} />}
      rightSidebarOpen={right}
      rightSidebarOnClose={() => setRight(false)}
      rightSidebarContent={<HealthcareSidebarRight mapFacilities={mapFacilities} />}
      scroll="content"
    />
  );
}
