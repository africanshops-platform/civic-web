import { lazy } from 'react';

const EducationLandingPage = lazy(() => import('./screens/EducationLandingPage'));

const educationPublicPagesConfig = [{ path: '/education', element: <EducationLandingPage /> }];

export default educationPublicPagesConfig;
