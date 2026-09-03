import FuseUtils from "@fuse/utils";
import FuseLoading from "@fuse/core/FuseLoading";
import { Navigate } from "react-router-dom";
import settingsConfig from "app/configs/settingsConfig";
import { LEGAL_DOCUMENT_KEYS } from "../constants/legalDocumentKeys";
import SignInConfig from "../main/sign-in/SignInConfig";
import SignUpConfig from "../main/sign-up/SignUpConfig";
import Error404Page from "../main/404/Error404Page";
import CivicLandingPage from "../main/landing/CivicLandingPage";
import authRoleExamplesConfigs from "../main/auth/authRoleExamplesConfigs";
import LegalDocumentPage from "../main/zrootclient/civic-shared/legal/LegalDocumentPage";

/***Authentication-based-config starts*/
import SignAcceptInviteConfig from "../main/sign-accept-invite/SignAcceptInviteConfig";
import forgotPasswordConfig from "../main/sign-forgot-password/forgotPasswordPagesConfig";
import resetPasswordConfig from "../main/sign-reset-password/resetPasswordPagesConfig";
/***##########################Authentication-based-config ends#########################*/

import AfricanshopsFinanceDashboardAppConfig from "../main/africanshops-finance/AfricanshopsFinanceDashboardAppConfig";
import financePagesConfig from "../main/africanshops-finance/finance-v2/financePagesConfig";
import AfricanshopsMessengerAppConfig from "../main/africanshops-messenger/AfricanshopsMessengerAppConfig";

import UserSettingsAppConfig from "../main/zrootclient/settings/UserSettingsAppConfig";
import userProfileAppConfig from "../main/zrootclient/profile/userProfileAppConfig";

/***Civic Platform Module Configs */
import KycManagePage from "../main/zrootclient/civic-shared/kyc/KycManagePage";
import civicTaxPagesConfig from "../main/zrootclient/buz-civictax/civicTaxPagesConfig";
import civicTaxPublicPagesConfig from "../main/zrootclient/buz-civictax/civicTaxPublicPagesConfig";
import securityPagesConfig from "../main/zrootclient/buz-security/securityPagesConfig";
import securityPublicPagesConfig from "../main/zrootclient/buz-security/securityPublicPagesConfig";
import governancePagesConfig from "../main/zrootclient/buz-governance/governancePagesConfig";
import governancePublicPagesConfig from "../main/zrootclient/buz-governance/governancePublicPagesConfig";
import socialPagesConfig from "../main/zrootclient/buz-social/socialPagesConfig";
import socialPublicPagesConfig from "../main/zrootclient/buz-social/socialPublicPagesConfig";
import healthcarePagesConfig from "../main/zrootclient/buz-healthcare/healthcarePagesConfig";
import healthcarePublicPagesConfig from "../main/zrootclient/buz-healthcare/healthcarePublicPagesConfig";
import youthsportsFloodlightsPagesConfig from "../main/zrootclient/buz-youthsports-floodlights/youthsportsFloodlightsPagesConfig";
import youthsportsFloodlightsPublicPagesConfig from "../main/zrootclient/buz-youthsports-floodlights/youthsportsFloodlightsPublicPagesConfig";

const routeConfigs = [
  /***
   * ##########################################################################
   * Authentication concern routes starts here
   * ############################################################################
   * */
  SignInConfig,
  SignUpConfig,
  SignAcceptInviteConfig,
  forgotPasswordConfig,
  resetPasswordConfig,
  /***
   * ##########################################################################
   * Authentication concern routes ends here
   * ############################################################################
   * */

  /****
   * #########################################################################################
   * Africanshops Dashboard Configs Starts Here
   * #########################################################################################
   * */
  AfricanshopsFinanceDashboardAppConfig,
  financePagesConfig,
  AfricanshopsMessengerAppConfig,

  UserSettingsAppConfig,
  userProfileAppConfig,
  /****
   * ############################################################################################
   * Africanshops Dashboard Configs Ends Here
   * ############################################################################################
   * */

  /****
   * #########################################################################################
   * Africanshops CIVIC-PLATFORM Authenticated Routes start Here
   * #########################################################################################
   * */
  civicTaxPagesConfig,
  securityPagesConfig,
  governancePagesConfig,
  socialPagesConfig,
  healthcarePagesConfig,
  youthsportsFloodlightsPagesConfig,
  /****
   * #########################################################################################
   * Africanshops CIVIC-PLATFORM Authenticated Routes end Here
   * #########################################################################################
   * */

  ...authRoleExamplesConfigs,
];
/**
 * The routes of the application.
 */
const routes = [
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),

  /****
   * ##############################################################
   * CIVIC PLATFORM — Public (unauthenticated) routes
   * ##############################################################
   */
  ...civicTaxPublicPagesConfig,
  ...securityPublicPagesConfig,
  ...governancePublicPagesConfig,
  ...socialPublicPagesConfig,
  ...healthcarePublicPagesConfig,
  ...youthsportsFloodlightsPublicPagesConfig,
  /****
   * ##############################################################
   * CIVIC PLATFORM — Public routes end
   * ##############################################################
   */

  {
    path: "/account/kyc",
    settings: {
      layout: {
        config: {
          navbar: { display: false },
          toolbar: { display: true },
          footer: { display: false },
          leftSidePanel: { display: false },
          rightSidePanel: { display: false },
        },
      },
    },
    element: <KycManagePage />,
  },

  // Real civic-web front door (built 2026-08-01 — see Platform-Delivery-Tracker.md's
  // "Web Platform — Next 5" item 1). Was `<Navigate to="sign-in" />` as a placeholder
  // since the customer/civic split, since the old "/" belonged to the marketplace's
  // ModernLandingPage and was removed along with it.
  {
    path: "/",
    element: <CivicLandingPage />,
  },

  // Legal/Advocacy — both pages render through the same shared
  // LegalDocumentPage, fetching by the canonical key backed by
  // corporate-cms-service (africanshops-microservices PR #149/#150). Public,
  // no auth. The footer (FooterAfricanshops.jsx) has linked to /privacy and
  // /terms for a while with no route behind either — this closes that gap.
  {
    path: "/privacy",
    element: <LegalDocumentPage documentKey={LEGAL_DOCUMENT_KEYS.PRIVACY_POLICY} eyebrow="Privacy" />,
  },
  {
    path: "/terms",
    element: <LegalDocumentPage documentKey={LEGAL_DOCUMENT_KEYS.TERMS_AND_CONDITIONS} eyebrow="Legal" />,
  },

  {
    path: "loading",
    element: <FuseLoading />,
  },
  {
    path: "404",
    element: <Error404Page />,
  },
  {
    path: "*",
    element: <Navigate to="404" />,
  },
];
export default routes;
