import { lazy } from "react";
// import { Navigate } from "react-router-dom";
// import { authRoles } from "src/app/auth";
// import MarketplaceOrderDetailWithSidebarsContentScrollPage from './shops/marketplaceOrderDetailPage/MarketplaceOrderDetailWithSidebarsContentScrollPage';

const Cart = lazy(() => import("./shops/Cart"));

const CartReview = lazy(() => import("./shops/CartReview"));
const MarketplacePaymenSuccess = lazy(() => import("./shops/MarketplacePaymenSuccess"));

/***Marketplace Orders Listed */
// const MarketplaceOrders = lazy(() => import('./shops/MarketplaceOrders'));
const MarketplaceOrdersWithSidebarsContentScrollPage = lazy(
  () => import("./shops/marketplaceOrdersPage/MarketplaceOrdersWithSidebarsContentScrollPage"),
);

/***Marketplace Single Order Listed starts */
// const MarketplaceOrdersDetail = lazy(() => import('./shops/MarketplaceOrdersDetail'));
const MarketplaceOrderDetailWithSidebarsContentScrollPage = lazy(
  () =>
    import("./shops/marketplaceOrderDetailPage/MarketplaceOrderDetailWithSidebarsContentScrollPage"),
);

/***Marketplace Single Order Listed ends */

/**
 * The reset password pages config.
 */

const userMarketPlacePagesConfig = {
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

  
  routes: [
    {
      path: "marketplace/cart",
      element: <Cart />,
    }, //(Msvs => Done)

    {
      path: "marketplace/review-cart",
      element: <CartReview />,
    }, //(Msvs => Done)

    {
      path: "marketplace/order/:orderId/payment-success",
      element: <MarketplacePaymenSuccess />,
    }, //(Msvs => Done)

    {
      path: "marketplace/user/orders",
      // element: <MarketplaceOrders />
      element: <MarketplaceOrdersWithSidebarsContentScrollPage />,
    }, //(Msvs => Done)

    {
      path: "marketplace/user/orders/:orderId/view-order",
      // element: <MarketplaceOrdersDetail />
      element: <MarketplaceOrderDetailWithSidebarsContentScrollPage />,
    }, //(Msvs => Done)
  ],
};

export default userMarketPlacePagesConfig;
