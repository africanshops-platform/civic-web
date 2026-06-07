import { lazy } from 'react';

const CommunityLandingPage = lazy(() => import('./screens/CommunityLandingPage'));
const CommunityFeedPublicPage = lazy(() => import('./screens/CommunityFeedPublicPage'));

const socialPublicPagesConfig = [
  {
    path: '/community',
    element: <CommunityLandingPage />,
  },
  {
    path: '/community/feed',
    element: <CommunityFeedPublicPage />,
  },
];

export default socialPublicPagesConfig;
