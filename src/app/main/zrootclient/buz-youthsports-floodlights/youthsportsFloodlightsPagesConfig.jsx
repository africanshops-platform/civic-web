import { lazy } from 'react';
import { kycProtect } from '../civic-shared/kyc/kycProtectRoutes';

const MyAuditionApplicationsScreen = lazy(() => import('./screens/MyAuditionApplicationsScreen'));

const LAYOUT = {
  layout: {
    config: {
      navbar: { display: false },
      toolbar: { display: true },
      footer: { display: false },
      leftSidePanel: { display: false },
      rightSidePanel: { display: false },
    },
  },
};

// New parallel route set — pixel-for-pixel port of the Floodlights design
// artifact into real screens, sitting alongside (not replacing) the v1
// /youth/* routes so both remain comparable. See youthsportsPagesConfig.jsx
// for the v1 equivalent this mirrors.
const youthsportsFloodlightsPagesConfig = {
  settings: LAYOUT,
  // Everything else under /youth-v2 is public (see youthsportsFloodlightsPublicPagesConfig); only the citizen's own
  // applications need a verified civic account.
  routes: kycProtect([
    { path: 'youth-v2/my-auditions', element: <MyAuditionApplicationsScreen /> },
  ]),
};

export default youthsportsFloodlightsPagesConfig;
