import { lazy } from 'react';

const HealthcareDashboardWithSidebarsPage = lazy(() => import('./screens/HealthcareDashboardWithSidebarsPage'));
const FacilityDetailPage = lazy(() => import('./screens/FacilityDetailPage'));
const AppointmentBookingPage = lazy(() => import('./screens/AppointmentBookingPage'));
const MyAppointmentsPage = lazy(() => import('./screens/MyAppointmentsPage'));
const HealthAlertsPage = lazy(() => import('./screens/HealthAlertsPage'));

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
  routes: [
    { path: 'healthcare/dashboard', element: <HealthcareDashboardWithSidebarsPage /> },
    { path: 'healthcare/facility/:facilityId', element: <FacilityDetailPage /> },
    { path: 'healthcare/book', element: <AppointmentBookingPage /> },
    { path: 'healthcare/my-appointments', element: <MyAppointmentsPage /> },
    { path: 'healthcare/alerts', element: <HealthAlertsPage /> },
  ],
};

export default healthcarePagesConfig;
