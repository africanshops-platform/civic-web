import { lazy } from 'react';

const KycManagePage = lazy(() => import('./KycManagePage'));

const kycManagePagesConfig = {
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
  routes: [
    {
      path: 'account/kyc',
      element: <KycManagePage />,
    },
  ],
};

export default kycManagePagesConfig;
