import { lazy } from "react";
// import { Navigate } from "react-router-dom";
// import { authRoles } from "src/app/auth";
// import BlankSample from "../../user-interface/page-layouts/blank";
// import FoodmartOrderDetailWithSidebarsContentScrollPage from './foodmartOrderDetailPage/FoodmartOrderDetailWithSidebarsContentScrollPage';
// import FoodmartOrdersWithSidebarsContentScrollPage from './foodmartOrdersPage/FoodmartOrdersWithSidebarsContentScrollPage';

const FoodCartReview = lazy(() => import("./FoodCartReview"));
const FoodmartOrderPaymenSucces = lazy(() => import("./FoodmartOrderPaymenSucces"));

/***Food Orders Starts */
// const FoodmartOrders = lazy(() => import("./FoodmartOrders"));
const FoodmartOrdersWithSidebarsContentScrollPage = lazy(
  () => import("./foodmartOrdersPage/FoodmartOrdersWithSidebarsContentScrollPage"),
);

/***Food Orders Ends */

/***Food single order starts */
// const FoodMartOrdersDetail = lazy(() => import("./FoodMartOrdersDetail"));
const FoodmartOrderDetailWithSidebarsContentScrollPage = lazy(
  () => import("./foodmartOrderDetailPage/FoodmartOrderDetailWithSidebarsContentScrollPage"),
);


/**
 * The reset password pages config.
 */
const userFoodMartPagesConfig = {
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
      path: "foodmarts/review-food-cart",
      element: <FoodCartReview />,
    }, //(Mcsvs => Done)

    {
      path: "foodmarts/:orderId/payment-success",
      element: <FoodmartOrderPaymenSucces />,
    }, //(Mcsvs => Done)

    {
      path: "foodmarts/user/food-orders",
      // element: <FoodmartOrders />
      element: <FoodmartOrdersWithSidebarsContentScrollPage />,
    }, //(Mcsvs => Done)

    {
      path: "foodmarts/user/food-orders/:foodOrderId/view",
      // element: <FoodMartOrdersDetail />
      element: <FoodmartOrderDetailWithSidebarsContentScrollPage />,
    }, //(Mcsvs => Done)
  ],
};

export default userFoodMartPagesConfig;
