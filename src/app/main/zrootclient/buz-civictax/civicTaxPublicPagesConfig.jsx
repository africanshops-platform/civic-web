import { lazy } from 'react';

const CivicTaxLandingPage = lazy(() => import('./screens/CivicTaxLandingPage'));
const DevelopmentGoalsPage = lazy(() => import('./screens/DevelopmentGoalsPage'));

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
  // civic-29: browsing is public, giving needs sign-in.
  {
    path: '/civictax/goals',
    element: <DevelopmentGoalsPage />,
  },
];

export default civicTaxPublicPagesConfig;
