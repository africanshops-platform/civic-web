import { lazy } from 'react';
import { kycProtect } from '../civic-shared/kyc/kycProtectRoutes';

const HealthcareDashboardWithSidebarsPage = lazy(() => import('./screens/HealthcareDashboardWithSidebarsPage'));
const FacilityDetailPage = lazy(() => import('./screens/FacilityDetailPage'));
const AppointmentBookingPage = lazy(() => import('./screens/AppointmentBookingPage'));
const MyAppointmentsPage = lazy(() => import('./screens/MyAppointmentsPage'));
const HealthAlertsPage = lazy(() => import('./screens/HealthAlertsPage'));
const MyRecordPage = lazy(() => import('./screens/MyRecordPage'));

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

const healthcarePagesConfig = {
  settings: LAYOUT,
  routes: kycProtect([
    { path: 'healthcare/dashboard', element: <HealthcareDashboardWithSidebarsPage /> },
    { path: 'healthcare/facility/:facilityId', element: <FacilityDetailPage /> },
    { path: 'healthcare/book', element: <AppointmentBookingPage /> },
    { path: 'healthcare/my-appointments', element: <MyAppointmentsPage /> },
    { path: 'healthcare/alerts', element: <HealthAlertsPage /> },
    { path: 'healthcare/my-record', element: <MyRecordPage /> },
  ]),
};

export default healthcarePagesConfig;
