import { lazy } from 'react';
import { kycProtect } from '../civic-shared/kyc/kycProtectRoutes';

const YouthSportsDashboardWithSidebarsPage = lazy(() => import('./screens/YouthSportsDashboardWithSidebarsPage'));
const ProgramDetailPage = lazy(() => import('./screens/ProgramDetailPage'));
const TournamentsPage = lazy(() => import('./screens/TournamentsPage'));
const TournamentDetailPage = lazy(() => import('./screens/TournamentDetailPage'));
const TalentsPage = lazy(() => import('./screens/TalentsPage'));
const MentorsPage = lazy(() => import('./screens/MentorsPage'));

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

const youthsportsPagesConfig = {
  settings: LAYOUT,
  routes: kycProtect([
    { path: 'youth/dashboard', element: <YouthSportsDashboardWithSidebarsPage /> },
    { path: 'youth/programs/:programId', element: <ProgramDetailPage /> },
    { path: 'youth/tournaments', element: <TournamentsPage /> },
    { path: 'youth/tournaments/:tournamentId', element: <TournamentDetailPage /> },
    { path: 'youth/talents', element: <TalentsPage /> },
    { path: 'youth/mentors', element: <MentorsPage /> },
  ]),
};

export default youthsportsPagesConfig;
