import { lazy } from 'react';

const CivicTaxLandingPage = lazy(() => import('./screens/CivicTaxLandingPage'));

/**
 * Public (unauthenticated) routes for the Civic Tax module.
 * NOTE: Landing page has NO settings object — same pattern as the home page (ModernLandingPage at "/")
 * so Fuse layout does not inject its own background-color into the content container.
 */
const civicTaxPublicPagesConfig = [
  {
    path: '/civictax',
    element: <CivicTaxLandingPage />,
  },
];

export default civicTaxPublicPagesConfig;
