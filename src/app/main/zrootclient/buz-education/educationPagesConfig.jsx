import { lazy } from 'react';
import { kycProtect } from '../civic-shared/kyc/kycProtectRoutes';

const SchoolsPage = lazy(() => import('./screens/SchoolsPage'));
const SchoolDetailPage = lazy(() => import('./screens/SchoolDetailPage'));
const MyChildrenPage = lazy(() => import('./screens/MyChildrenPage'));
const ChildPage = lazy(() => import('./screens/ChildPage'));
const AnnouncementsPage = lazy(() => import('./screens/AnnouncementsPage'));
const MyApplicationsPage = lazy(() => import('./screens/MyApplicationsPage'));
const WardApplicationsPage = lazy(() => import('./screens/WardApplicationsPage'));
const AptitudeTestPage = lazy(() => import('./screens/AptitudeTestPage'));
const MySchoolPage = lazy(() => import('./MySchoolPage'));
const TertiaryProgrammesPage = lazy(() => import('./screens/TertiaryProgrammesPage'));
const TertiaryApplicationsPage = lazy(() => import('./screens/TertiaryApplicationsPage'));

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

/** Browsing schools is open to everyone; anything about a child or an application needs a verified account. */
export const educationBrowseConfig = {
  settings: LAYOUT,
  auth: null,
  routes: [
    { path: 'education/schools', element: <SchoolsPage /> },
    { path: 'education/school/:schoolId', element: <SchoolDetailPage /> },
    { path: 'education/school/:schoolId/programmes', element: <TertiaryProgrammesPage /> },
  ],
};

/** Needs a signed-in account but not a verified one: a young adult who has just claimed their account can see their own school pages straight away. */
export const educationMySchoolConfig = {
  settings: {
    layout: { config: { navbar: { display: false }, toolbar: { display: false }, footer: { display: false }, leftSidePanel: { display: false }, rightSidePanel: { display: false } } },
  },
  routes: [{ path: 'education/my-school', element: <MySchoolPage /> }],
};

const educationPagesConfig = {
  settings: LAYOUT,
  routes: kycProtect([
    { path: 'education/my-children', element: <MyChildrenPage /> },
    { path: 'education/child/:studentId', element: <ChildPage /> },
    { path: 'education/announcements', element: <AnnouncementsPage /> },
    { path: 'education/applications', element: <MyApplicationsPage /> },
    { path: 'education/tertiary-applications', element: <TertiaryApplicationsPage /> },
    { path: 'education/admissions', element: <WardApplicationsPage /> },
    { path: 'education/admissions/:applicationId/test', element: <AptitudeTestPage /> },
  ]),
};

export default educationPagesConfig;
