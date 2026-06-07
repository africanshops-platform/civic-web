import { lazy } from 'react';

const YouthSportsDashboardWithSidebarsPage = lazy(() => import('./screens/YouthSportsDashboardWithSidebarsPage'));
const ProgramDetailPage = lazy(() => import('./screens/ProgramDetailPage'));
const TournamentsPage = lazy(() => import('./screens/TournamentsPage'));
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
  routes: [
    { path: 'youth/dashboard', element: <YouthSportsDashboardWithSidebarsPage /> },
    { path: 'youth/programs/:programId', element: <ProgramDetailPage /> },
    { path: 'youth/tournaments', element: <TournamentsPage /> },
    { path: 'youth/talents', element: <TalentsPage /> },
    { path: 'youth/mentors', element: <MentorsPage /> },
  ],
};

export default youthsportsPagesConfig;
