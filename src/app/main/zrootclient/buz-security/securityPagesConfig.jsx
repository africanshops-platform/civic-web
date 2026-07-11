import { lazy } from 'react';
import { kycProtect } from '../civic-shared/kyc/kycProtectRoutes';

const SocDashboardWithSidebarsPage = lazy(() => import('./screens/SocDashboardWithSidebarsPage'));
const ReportIncidentPage = lazy(() => import('./screens/ReportIncidentPage'));
const MyReportsPage = lazy(() => import('./screens/MyReportsPage'));

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

const securityPagesConfig = {
  settings: LAYOUT,
  routes: kycProtect([
    { path: 'security/soc/dashboard', element: <SocDashboardWithSidebarsPage /> },
    { path: 'security/report-incident', element: <ReportIncidentPage /> },
    { path: 'security/my-reports', element: <MyReportsPage /> },
  ]),
};


export default securityPagesConfig;
