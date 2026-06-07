import { lazy } from 'react';

// const CivicTaxLandingPage = lazy(() => import('./screens/CivicTaxLandingPage'));
const ModernHomeLandingPage = lazy(() => import('./shops/marketplace/MarketplaceDealsWithSidebarsContentScrollComponent'));

/**
 * Public (unauthenticated) routes for the Civic Tax module.
 * NOTE: Landing page has NO settings object — same pattern as the home page (ModernLandingPage at "/")
 * so Fuse layout does not inject its own background-color into the content container.
 */
const useMarketPlacePublicPagesConfig = [
  {
    path: '/deals',
    element: <ModernHomeLandingPage />,
    
  },
];

export default useMarketPlacePublicPagesConfig;
