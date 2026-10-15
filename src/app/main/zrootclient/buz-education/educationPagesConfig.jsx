import { lazy } from 'react';
import { kycProtect } from '../civic-shared/kyc/kycProtectRoutes';

const SchoolsPage = lazy(() => import('./screens/SchoolsPage'));
const SchoolDetailPage = lazy(() => import('./screens/SchoolDetailPage'));
const MyChildrenPage = lazy(() => import('./screens/MyChildrenPage'));
const ChildPage = lazy(() => import('./screens/ChildPage'));
const AnnouncementsPage = lazy(() => import('./screens/AnnouncementsPage'));
const MyApplicationsPage = lazy(() => import('./screens/MyApplicationsPage'));

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
  ],
};

const educationPagesConfig = {
  settings: LAYOUT,
  routes: kycProtect([
    { path: 'education/my-children', element: <MyChildrenPage /> },
    { path: 'education/child/:studentId', element: <ChildPage /> },
    { path: 'education/announcements', element: <AnnouncementsPage /> },
    { path: 'education/applications', element: <MyApplicationsPage /> },
  ]),
};

export default educationPagesConfig;
