import { lazy } from "react";
import { authRoles } from "src/app/auth";

const ModernReversedForgotPasswordPage = lazy(() => import("./ModernReversedForgotPasswordPage"));
/**
 * Route Configuration for Forgot Password Pages.
 */
const forgotPasswordConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: true,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },

  auth: authRoles.onlyGuest,
  routes: [
    {
      path: "forgot-password",
      element: <ModernReversedForgotPasswordPage />,
    },
  ],
};
export default forgotPasswordConfig;
