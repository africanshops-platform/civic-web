import { lazy } from 'react';

const StudentSignInPage = lazy(() => import('./student/StudentSignInPage'));
const StudentHomePage = lazy(() => import('./student/StudentHomePage'));

const BARE = {
  layout: { config: { navbar: { display: false }, toolbar: { display: false }, footer: { display: false }, leftSidePanel: { display: false }, rightSidePanel: { display: false } } },
};

/** A child's own school login (civic-61 E3-d3): a sign-in and one home page, with no menu to the rest of the platform. Public routes; the home page checks the session itself. */
const studentPagesConfig = {
  settings: BARE,
  auth: null,
  routes: [
    { path: 'student/sign-in', element: <StudentSignInPage /> },
    { path: 'student', element: <StudentHomePage /> },
  ],
};

export default studentPagesConfig;
