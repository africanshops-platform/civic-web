import { lazy } from 'react';

const HubScreen = lazy(() => import('./screens/HubScreen'));
const ProgrammesScreen = lazy(() => import('./screens/ProgrammesScreen'));

// Mirrors youthsportsPublicPagesConfig.jsx's pattern: Hub and the
// Programmes browse list are the public, unauthenticated entry points
// (same access level as v1's /youth and /youth/programs). Program detail
// stays KYC-protected, see youthsportsFloodlightsPagesConfig.
const youthsportsFloodlightsPublicPagesConfig = [
  { path: '/youth-v2', element: <HubScreen /> },
  { path: '/youth-v2/programs', element: <ProgrammesScreen /> },
];

export default youthsportsFloodlightsPublicPagesConfig;
