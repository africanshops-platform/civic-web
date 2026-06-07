import { lazy } from 'react';

const YouthSportsLandingPage = lazy(() => import('./screens/YouthSportsLandingPage'));
const YouthSportsDashboardWithSidebarsPage = lazy(() => import('./screens/YouthSportsDashboardWithSidebarsPage'));

const youthsportsPublicPagesConfig = [
  {
    path: '/youth',
    element: <YouthSportsLandingPage />,
  },
  {
    path: '/youth/programs',
    element: <YouthSportsDashboardWithSidebarsPage />,
  },
];

export default youthsportsPublicPagesConfig;
