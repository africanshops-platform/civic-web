import { lazy } from 'react';

const HubScreen = lazy(() => import('./screens/HubScreen'));
const ProgrammesScreen = lazy(() => import('./screens/ProgrammesScreen'));
const OpportunitiesScreen = lazy(() => import('./screens/OpportunitiesScreen'));
const OpportunityDetailScreen = lazy(() => import('./screens/OpportunityDetailScreen'));
const MyOpportunityApplicationsScreen = lazy(() => import('./screens/MyOpportunityApplicationsScreen'));

// Mirrors youthsportsPublicPagesConfig.jsx's pattern: Hub and the
// Programmes browse list are the public, unauthenticated entry points
// (same access level as v1's /youth and /youth/programs). Program detail
// stays KYC-protected, see youthsportsFloodlightsPagesConfig.
//
// Opportunities (auditions + staff positions, added 2026-09-12) are public
// all the way through browse/detail/mine — per feedback_civic_public_
// browse_gated_interact: browse is always public, only the actual apply
// action is gated (in-page, inside OpportunityDetailScreen), not the route.
// 'mine' is public-routed too and shows an in-page sign-in prompt rather
// than a route-level wall, for the same reason.
const youthsportsFloodlightsPublicPagesConfig = [
  { path: '/youth-v2', element: <HubScreen /> },
  { path: '/youth-v2/programs', element: <ProgrammesScreen /> },
  { path: '/youth-v2/opportunities', element: <OpportunitiesScreen /> },
  { path: '/youth-v2/opportunities/mine', element: <MyOpportunityApplicationsScreen /> },
  { path: '/youth-v2/opportunities/auditions/:id', element: <OpportunityDetailScreen type="audition" /> },
  { path: '/youth-v2/opportunities/staff-positions/:id', element: <OpportunityDetailScreen type="staffPosition" /> },
];

export default youthsportsFloodlightsPublicPagesConfig;
