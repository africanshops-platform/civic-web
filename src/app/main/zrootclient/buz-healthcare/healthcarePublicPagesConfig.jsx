import { lazy } from 'react';

const HealthcareLandingPage = lazy(() => import('./screens/HealthcareLandingPage'));

const healthcarePublicPagesConfig = [
  {
    path: '/healthcare',
    element: <HealthcareLandingPage />,
  },
];

export default healthcarePublicPagesConfig;
