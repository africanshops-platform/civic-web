import { lazy } from 'react';

const SecurityMapPublicPage = lazy(() => import('./screens/SecurityMapPublicPage'));

/**
 * Public routes — NO settings so Fuse layout doesn't inject gray background.
 * Same pattern as CivicTaxLandingPage and ModernLandingPage (home /).
 */
const securityPublicPagesConfig = [
  {
    path: '/security/map',
    element: <SecurityMapPublicPage />,
  },
];

export default securityPublicPagesConfig;
