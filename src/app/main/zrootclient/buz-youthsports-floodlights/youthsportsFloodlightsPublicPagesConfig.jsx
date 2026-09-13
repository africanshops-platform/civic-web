import { lazy } from 'react';

const HubScreen = lazy(() => import('./screens/HubScreen'));
const ProgrammesScreen = lazy(() => import('./screens/ProgrammesScreen'));
const AuditionsScreen = lazy(() => import('./screens/AuditionsScreen'));
const StaffPositionsScreen = lazy(() => import('./screens/StaffPositionsScreen'));
const StaffPositionDetailScreen = lazy(() => import('./screens/StaffPositionDetailScreen'));
const MyStaffPositionApplicationsScreen = lazy(() => import('./screens/MyStaffPositionApplicationsScreen'));

// Mirrors youthsportsPublicPagesConfig.jsx's pattern: Hub and the
// Programmes browse list are the public, unauthenticated entry points
// (same access level as v1's /youth and /youth/programs). Program detail
// stays KYC-protected, see youthsportsFloodlightsPagesConfig — same for
// audition detail/mine (AuditionDetailScreen/MyAuditionApplicationsScreen
// live there, route-level KYC-walled; only the audition browse list here
// is public).
//
// Staff positions (Feature A, added 2026-09-12) take a finer-grained
// approach instead of that route-level wall: public all the way through
// browse/detail/mine, per feedback_civic_public_browse_gated_interact —
// only the actual apply action is gated, in-page inside
// StaffPositionDetailScreen, not the route. 'mine' is public-routed too
// and shows an in-page sign-in prompt rather than a route-level wall, for
// the same reason. This is a deliberate, confirmed divergence from the
// audition pages' coarser route-level gate, not an inconsistency to fix.
const youthsportsFloodlightsPublicPagesConfig = [
  { path: '/youth-v2', element: <HubScreen /> },
  { path: '/youth-v2/programs', element: <ProgrammesScreen /> },
  { path: '/youth-v2/auditions', element: <AuditionsScreen /> },
  { path: '/youth-v2/staff-positions', element: <StaffPositionsScreen /> },
  { path: '/youth-v2/staff-positions/mine', element: <MyStaffPositionApplicationsScreen /> },
  { path: '/youth-v2/staff-positions/:id', element: <StaffPositionDetailScreen /> },
];

export default youthsportsFloodlightsPublicPagesConfig;
