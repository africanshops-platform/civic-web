import { styled } from '@mui/material/styles';
import { useMemo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import FloodlightsBanner from './FloodlightsBanner';
import '../../floodlights-v2.css';

const Root = styled(FusePageSimpleWithMargin)({
  '& .FusePageSimple-header': {
    display: 'flex',
    flexDirection: 'column',
  },
});

// Real app shell: the outer ToolbarLayout1 (white top bar, real, untouched)
// wraps this page; FloodlightsBanner (the orange section banner + white
// Hub/Tournaments/Talent Hunt/Transfer Market quicknav, ported verbatim
// from the artifact's civicChrome()) is the `header` prop, which Fuse keeps
// outside the scrollable content region — so it stays visible while
// scrolling without any extra sticky CSS. No left/right sidebars — this
// vertical's own artifact never had them.
export default function FloodlightsPage({ children }) {
  const content = useMemo(() => (
    <div className="fl2-root" style={{ flex: '1 1 auto', minWidth: 0, width: '100%' }}>
      <div className="fl2-screen">{children}</div>
    </div>
  ), [children]);

  return <Root header={<FloodlightsBanner />} content={content} scroll="content" />;
}
