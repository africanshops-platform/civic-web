import { lazy } from 'react';
import { kycProtect } from '../civic-shared/kyc/kycProtectRoutes';

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
  routes: kycProtect([
    { path: 'youth-v2/tournaments', element: <TournamentsScreen /> },
    { path: 'youth-v2/tournaments/:tournamentId', element: <TournamentDetailScreen /> },
    { path: 'youth-v2/tournaments/:tournamentId/matches/:matchId', element: <MatchCenterScreen /> },
    { path: 'youth-v2/talents', element: <TalentHuntScreen /> },
    { path: 'youth-v2/clubs/:clubMerchantId', element: <ClubScreen /> },
    // No standalone GET /youth/players/:id exists on the backend — only
    // GET /youth/players?clubMerchantId=X — so the detail route carries
    // clubMerchantId too and filters the roster query client-side.
    { path: 'youth-v2/clubs/:clubMerchantId/players/:playerId', element: <PlayerScreen /> },
    { path: 'youth-v2/market', element: <MarketScreen /> },
    { path: 'youth-v2/programs/:programId', element: <ProgramDetailScreen /> },
    { path: 'youth-v2/mentors', element: <MentorsScreen /> },
    { path: 'youth-v2/auditions/:auditionId', element: <AuditionDetailScreen /> },
    { path: 'youth-v2/my-auditions', element: <MyAuditionApplicationsScreen /> },
  ]),
};

export default youthsportsFloodlightsPagesConfig;
