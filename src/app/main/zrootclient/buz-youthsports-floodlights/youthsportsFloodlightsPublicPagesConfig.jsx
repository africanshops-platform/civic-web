import { lazy } from 'react';

const HubScreen = lazy(() => import('./screens/HubScreen'));
const ProgrammesScreen = lazy(() => import('./screens/ProgrammesScreen'));
const AuditionsScreen = lazy(() => import('./screens/AuditionsScreen'));
const TournamentsScreen = lazy(() => import('./screens/TournamentsScreen'));
const TournamentDetailScreen = lazy(() => import('./screens/TournamentDetailScreen'));
const MatchCenterScreen = lazy(() => import('./screens/MatchCenterScreen'));
const TalentHuntScreen = lazy(() => import('./screens/TalentHuntScreen'));
const ClubScreen = lazy(() => import('./screens/ClubScreen'));
const PlayerScreen = lazy(() => import('./screens/PlayerScreen'));
const MarketScreen = lazy(() => import('./screens/MarketScreen'));
const ProgramDetailScreen = lazy(() => import('./screens/ProgramDetailScreen'));
const MentorsScreen = lazy(() => import('./screens/MentorsScreen'));
const AuditionDetailScreen = lazy(() => import('./screens/AuditionDetailScreen'));

// Public to browse, gated to engage (founder rule, 2026-10-13): everyone, signed in or not, can discover programmes,
// tournaments, matches, clubs, players, talents and auditions. Enrolling, registering, applying, requesting a mentor and
// watching a player are gated INSIDE each screen by useInteractGuard (sign in, then identity verification + civic
// activation), and the server enforces the same on every mutation. Only "my applications" stays a protected route
// (see youthsportsFloodlightsPagesConfig).
const youthsportsFloodlightsPublicPagesConfig = [
  { path: '/youth-v2', element: <HubScreen /> },
  { path: '/youth-v2/programs', element: <ProgrammesScreen /> },
  { path: '/youth-v2/programs/:programId', element: <ProgramDetailScreen /> },
  { path: '/youth-v2/auditions', element: <AuditionsScreen /> },
  { path: '/youth-v2/auditions/:auditionId', element: <AuditionDetailScreen /> },
  { path: '/youth-v2/tournaments', element: <TournamentsScreen /> },
  { path: '/youth-v2/tournaments/:tournamentId', element: <TournamentDetailScreen /> },
  { path: '/youth-v2/tournaments/:tournamentId/matches/:matchId', element: <MatchCenterScreen /> },
  { path: '/youth-v2/talents', element: <TalentHuntScreen /> },
  { path: '/youth-v2/clubs/:clubMerchantId', element: <ClubScreen /> },
  // No standalone GET /youth/players/:id exists on the backend, so the detail route carries clubMerchantId too.
  { path: '/youth-v2/clubs/:clubMerchantId/players/:playerId', element: <PlayerScreen /> },
  { path: '/youth-v2/market', element: <MarketScreen /> },
  { path: '/youth-v2/mentors', element: <MentorsScreen /> },
];

export default youthsportsFloodlightsPublicPagesConfig;
