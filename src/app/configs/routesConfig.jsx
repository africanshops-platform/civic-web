import FuseUtils from "@fuse/utils";
import FuseLoading from "@fuse/core/FuseLoading";
import { Navigate } from "react-router-dom";
import settingsConfig from "app/configs/settingsConfig";
import SignInConfig from "../main/sign-in/SignInConfig";
import SignUpConfig from "../main/sign-up/SignUpConfig";
import Error404Page from "../main/404/Error404Page";
import authRoleExamplesConfigs from "../main/auth/authRoleExamplesConfigs";

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
import youthsportsPagesConfig from "../main/zrootclient/buz-youthsports/youthsportsPagesConfig";
import youthsportsPublicPagesConfig from "../main/zrootclient/buz-youthsports/youthsportsPublicPagesConfig";

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
  youthsportsPagesConfig,
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
  ...youthsportsPublicPagesConfig,
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

  // TODO: no dedicated civic-web landing page exists yet (the old "/" was the
  // marketplace's ModernLandingPage, which lived in vendors-shop and was removed
  // as part of the customer/civic split). Redirecting to sign-in as a safe
  // placeholder until a real civic landing page is built.
  {
    path: "/",
    element: <Navigate to="sign-in" />,
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
