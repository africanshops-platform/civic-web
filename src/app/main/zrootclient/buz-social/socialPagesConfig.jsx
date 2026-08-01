import { lazy } from 'react';
import { kycProtect } from '../civic-shared/kyc/kycProtectRoutes';

const CommunityFeedWithSidebarsPage = lazy(() => import('./screens/CommunityFeedWithSidebarsPage'));
const CreateIssuePage = lazy(() => import('./screens/CreateIssuePage'));
const IssueDetailPage = lazy(() => import('./screens/IssueDetailPage'));
const ResolvedIssuesPage = lazy(() => import('./screens/ResolvedIssuesPage'));
const LocalLeadersPage = lazy(() => import('./screens/LocalLeadersPage'));
const CommunityProjectsPage = lazy(() => import('./screens/CommunityProjectsPage'));
const ProjectDetailPage = lazy(() => import('./screens/ProjectDetailPage'));
const MyEngagementPage = lazy(() => import('./screens/MyEngagementPage'));

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

const socialPagesConfig = {
  settings: LAYOUT,
  routes: kycProtect([
    { path: 'community/my-feed', element: <CommunityFeedWithSidebarsPage /> },
    { path: 'community/create-issue', element: <CreateIssuePage /> },
    { path: 'community/issues/:issueId', element: <IssueDetailPage /> },
    { path: 'community/resolved', element: <ResolvedIssuesPage /> },
    { path: 'community/leaders', element: <LocalLeadersPage /> },
    { path: 'community/projects', element: <CommunityProjectsPage /> },
    { path: 'community/projects/:projectId', element: <ProjectDetailPage /> },
    { path: 'community/my-engagement', element: <MyEngagementPage /> },
  ]),
};

export default socialPagesConfig;
