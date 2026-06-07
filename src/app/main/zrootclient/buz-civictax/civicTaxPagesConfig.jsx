import { lazy } from 'react';

const CampaignsBrowseWithSidebarsPage = lazy(() => import('./screens/CampaignsBrowseWithSidebarsPage'));
const CampaignDetailPage = lazy(() => import('./screens/CampaignDetailPage'));
const MyContributionsPage = lazy(() => import('./screens/MyContributionsPage'));
const LgaProjectTrackerPage = lazy(() => import('./screens/LgaProjectTrackerPage'));
const ContributionReceiptPage = lazy(() => import('./screens/ContributionReceiptPage'));
const CivicTaxObligationsPage = lazy(() => import('./screens/CivicTaxObligationsPage'));

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

const civicTaxPagesConfig = {
  settings: LAYOUT,
  routes: [
    { path: 'civictax/campaigns', element: <CampaignsBrowseWithSidebarsPage /> },
    { path: 'civictax/campaigns/:campaignId/view', element: <CampaignDetailPage /> },
    { path: 'civictax/my-contributions', element: <MyContributionsPage /> },
    { path: 'civictax/projects', element: <LgaProjectTrackerPage /> },
    { path: 'civictax/:transactionId/receipt', element: <ContributionReceiptPage /> },
    { path: 'civictax/compulsory-tax',         element: <CivicTaxObligationsPage /> },
  ],
};

export default civicTaxPagesConfig;
