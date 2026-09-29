import { lazy } from 'react';
import { kycProtect } from '../civic-shared/kyc/kycProtectRoutes';

const GovernanceDashboardWithSidebarsPage = lazy(() => import('./screens/GovernanceDashboardWithSidebarsPage'));
const VotingPortalPage = lazy(() => import('./screens/VotingPortalPage'));
const CitizenParticipationPage = lazy(() => import('./screens/CitizenParticipationPage'));
const PetitionDetailPage = lazy(() => import('./screens/PetitionDetailPage'));
const MyVotingHistoryPage = lazy(() => import('./screens/MyVotingHistoryPage'));
const CollationCenterPage = lazy(() => import('./screens/CollationCenterPage'));
const ElectionOversightPage = lazy(() => import('./screens/ElectionOversightPage'));
const CollationAuditPage = lazy(() => import('./screens/CollationAuditPage'));
const ElectionLiveResultsPage = lazy(() => import('./screens/ElectionLiveResultsPage'));

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

const governancePagesConfig = {
  settings: LAYOUT,
  routes: kycProtect([
    { path: 'governance/dashboard', element: <GovernanceDashboardWithSidebarsPage /> },
    { path: 'governance/elections/:electionId/vote', element: <VotingPortalPage /> },
    { path: 'governance/participate', element: <CitizenParticipationPage /> },
    { path: 'governance/petitions/:petitionId', element: <PetitionDetailPage /> },
    { path: 'governance/my-votes', element: <MyVotingHistoryPage /> },
    { path: 'governance/elections/:electionId/live/manage', element: <ElectionLiveResultsPage /> },
    { path: 'governance/elections/:electionId/collation', element: <CollationCenterPage /> },
    { path: 'governance/elections/:electionId/oversight', element: <ElectionOversightPage /> },
    { path: 'governance/elections/:electionId/audit', element: <CollationAuditPage /> },
  ]),
};

export default governancePagesConfig;
