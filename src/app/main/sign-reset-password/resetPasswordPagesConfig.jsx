import { lazy } from "react";
// import { Navigate } from "react-router-dom";
import { authRoles } from "src/app/auth";

const ModernReversedResetPasswordPage = lazy(() => import("./ModernReversedResetPasswordPage"));
/**
 * The reset password pages config.
 */
const resetPasswordConfig = {
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
      path: "reset-password",
      element: <ModernReversedResetPasswordPage />,
    },
  ],
};
export default resetPasswordConfig;
