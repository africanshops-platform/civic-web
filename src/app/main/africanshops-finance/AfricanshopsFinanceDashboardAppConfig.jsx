import { lazy } from "react";
import { kycProtect } from "../zrootclient/civic-shared/kyc/kycProtectRoutes";

const FinanceDashboardApp = lazy(() => import("./FinanceDashboardApp"));
const FinanceDashboardAppWithdarwals = lazy(() => import("./FinanceDashboardAppWithdarwals"));

const 
AfricanshopsFinanceDashboardAppConfig = {
  settings: {
    layout: {
      config: {},
    },
  },

  routes: kycProtect([
    {
      path: "africanshops/finance",
      element: <FinanceDashboardApp />,
    },
    {
      path: "africanshops/withdrawals",
      element: <FinanceDashboardAppWithdarwals />,
    },
  ]),
};
export default AfricanshopsFinanceDashboardAppConfig;
