import { lazy } from 'react';

const GovernanceLandingPage = lazy(() => import('./screens/GovernanceLandingPage'));
const ElectionListPublicPage = lazy(() => import('./screens/ElectionListPublicPage'));
const ElectionDetailPublicPage = lazy(() => import('./screens/ElectionDetailPublicPage'));

const governancePublicPagesConfig = [
  {
    path: '/governance',
    element: <GovernanceLandingPage />,
  },
  {
    path: '/governance/elections',
    element: <ElectionListPublicPage />,
  },
  {
    path: '/governance/elections/:electionId/live',
    element: <ElectionDetailPublicPage />,
  },
];

export default governancePublicPagesConfig;
