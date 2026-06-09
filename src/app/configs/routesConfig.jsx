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

/***Bookings & Reservations-based-config  starts*/
import userReservationPagesConfig from "../main/zrootclient/buz-bookings/user-reservations/userReservationPagesConfig";
/***#######################################Bookings & Reservations-based-config  ends########################*/
import AfricanshopsFinanceDashboardAppConfig from "../main/africanshops-finance/AfricanshopsFinanceDashboardAppConfig";
import AfricanshopsMessengerAppConfig from "../main/africanshops-messenger/AfricanshopsMessengerAppConfig";

import blogAppConfig from "../main/newsblog/blogAppConfig";
import userMarketPlacePagesConfig from "../main/zrootclient/buz-marketplace/userMarketPlacePagesConfig";
import userFoodMartPagesConfig from "../main/zrootclient/buz-foodmart/userFoodMartPagesConfig";
import UserSettingsAppConfig from "../main/zrootclient/settings/UserSettingsAppConfig";
import userProfileAppConfig from "../main/zrootclient/profile/userProfileAppConfig";
import MarketplaceWithSidebarsContentScrollComponent from "../main/zrootclient/buz-marketplace/shops/marketplace/MarketplaceWithSidebarsContentScrollComponent";
import BookingsPageWithSidebarsContentScrollComponent from "../main/zrootclient/buz-bookings/bookingsPage/BookingsPageWithSidebarsContentScrollComponent";
import FoodMartWithSidebarsContentScrollPage from "../main/zrootclient/buz-foodmart/foodMartPage/FoodMartWithSidebarsContentScrollPage";
import VisitFoodMartWithContentScrollPage from "../main/zrootclient/buz-foodmart/visitFoodMartPage/VisitFoodMartWithContentScrollPage";
import BookingsSinglePageWithSidebarsContentScroll from "../main/zrootclient/buz-bookings/bookingsSinglePage/BookingsSinglePageWithSidebarsContentScroll";
import FoodMartSingleMenuWithContentScrollPage from "../main/zrootclient/buz-foodmart/foodMartSingleMenuPage/FoodMartSingleMenuWithContentScrollPage";
import SingleProductWithContentScrollPage from "../main/zrootclient/buz-marketplace/shops/singleProductPage/SingleProductWithContentScrollPage";
import MarketplaceProductsByCatWithContentScrollPage from "../main/zrootclient/buz-marketplace/shops/marketplaceProductsByCat/MarketplaceProductsByCatWithContentScrollPage";
import MerchantShopPafeWithContentScrollPage from "../main/zrootclient/buz-marketplace/shops/merchanyShopPage/MerchantShopPafeWithContentScrollPage";
import RealestatePageWithSidebarsContentScrollComponent from "../main/zrootclient/buz-realestates/realestatePage/RealestatePageWithSidebarsContentScrollComponent";
import RealestateSinglePageWithSidebarsContentScroll from "../main/zrootclient/buz-realestates/realestateSinglePage/RealestateSinglePageWithSidebarsContentScroll";
import userRealEstatePagesConfig from "../main/zrootclient/buz-realestates/realEstatePagesConfig";
import ModernLandingPage from "../main/vendors-shop/home/home/ModernLandingPage";
import AboutUs from "../main/vendors-shop/home/home/AboutUs";
import ContactUs from "../main/vendors-shop/home/home/ContactUs";
import MarketplaceDealsWithSidebarsContentScrollComponent from "../main/zrootclient/buz-marketplace/shops/marketplace/MarketplaceDealsWithSidebarsContentScrollComponent";

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

// Subdomain routing is DISABLED for Vercel staging deployment
// const onMerchantSubdomain = isSubdomainRoute();

const routeConfigs = [
  /***
   * ##########################################################################
   * MERCHANT SUBDOMAIN ROUTES (Conditional - only active on subdomains)
   * ############################################################################
   * */

  /***
   * ##########################################################################
   * Authentication concern routes starts here
   * ############################################################################
   * */
  // SignOutConfig,
  SignInConfig,
  SignUpConfig,
  SignAcceptInviteConfig,
  forgotPasswordConfig,
  resetPasswordConfig,
  // DocumentationConfig,
  /***
   * ##########################################################################
   * Authentication concern routes ends here
   * ############################################################################
   * */

  /***
   * ##########################################################################
   * User management and properties starts here
   * ############################################################################
   * */
  // UsersAppConfig,
  // StaffAppConfig,

  /******Hotels, apartment and suites management */
  // ManagedBookingsListingsAppConfig,

  /***
   * ##############################################################################
   * User management and properties starts
   * #######################################################################################
   * */

  /****
   * #########################################################################################
   * Africanshops Dashboard Configs Starts Here
   * #########################################################################################
   * */
  // SupportHelpCenterAppConfig,
  AfricanshopsFinanceDashboardAppConfig,
  AfricanshopsMessengerAppConfig,

  // SettingsAppConfig,
  UserSettingsAppConfig,
  userProfileAppConfig,

  
  /****
   * ############################################################################################
   * Africanshops Dashboard Configs Ends Here
   * ############################################################################################
   * ----------------------------------------------------------------------------------------------------
   * */
  /****
   * #########################################################################################
   * Africanshops BOOKINGS-ROUTES Configs starts Here
   * #########################################################################################
   * */
  userReservationPagesConfig,

  /****
   * #########################################################################################
   * Africanshops BOOKINGS-ROUTES Configs ends Here
   * #########################################################################################
   * -------------------------------------------------------------------------------------------------------
   * */

  /****
   * #########################################################################################
   * Africanshops MARKET-PLACE_ROUTES Configs starts Here
   * #########################################################################################
   * */
  userMarketPlacePagesConfig,

  /****
   * #########################################################################################
   * Africanshops MARKET-PLACE-ROUTES Configs ends Here
   * #########################################################################################
   * -------------------------------------------------------------------------------------------------------
   * */

  /****
   * #########################################################################################
   * Africanshops RESTAURANTS_CLUBS_&_SPOTS_ROUTES Configs starts Here
   * #########################################################################################
   * */
  userFoodMartPagesConfig,

  /****
   * #########################################################################################
   * Africanshops BOOKINGS-ROUTES Configs ends Here
   * #########################################################################################
   * -------------------------------------------------------------------------------------------------------
   * */

  /****
   * #########################################################################################
   * Africanshops REAL_ESTATE_ROUTES Configs starts Here
   * #########################################################################################
   * */
  userRealEstatePagesConfig,
  /****
   * #########################################################################################
   * Africanshops REAL_ESTATE_ROUTES Configs ENDS Here
   * #########################################################################################
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

  /****
   *#################################################################################################
   * Start of Un-Authenticated pages are listed below here
   * #######################################################################
   */
  blogAppConfig,

  /****
   * #########################################################################################
   * MERCHANT SUBDOMAIN ROUTES (Guest/Unauthenticated)
   * NOTE: Removed from routeConfigs - handled separately in routes array below
   * #########################################################################################
   * */
  // MerchantSubdomainConfig,

  /****
   *################################################################################################
   * End of Un-Authenticated pages are listed below here
   * ###############################################################################################
   */

  /**Routes Below to be disabled */
  // ...PagesConfigs,
  // ...UserInterfaceConfigs,
  // ...DashboardsConfigs,
  // ...AppsConfigs,
  ...authRoleExamplesConfigs,
];
/**
 * The routes of the application.
 */
const routes = [
  // MERCHANT SUBDOMAIN ROUTES (must come first to match before main domain)
  // DISABLED FOR VERCEL STAGING DEPLOYMENT
  // Uncomment the block below to re-enable subdomain routing
  // ...(onMerchantSubdomain
  //   ? FuseUtils.generateRoutesFromConfigs(
  //       [MerchantSubdomainConfig],
  //       null // No auth required for merchant subdomain
  //     )
  //   : []),

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

  // Main domain homepage (ALWAYS ACTIVE - subdomain routing disabled)
  // ...(!onMerchantSubdomain
  //   ? [
  {
    path: "/",
    element: <ModernLandingPage />,
  },
  //     ]
  //   : []),
  {
    path: "/about",
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
    element: <AboutUs />,
  },
  {
    path: "/contact",
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
    element: <ContactUs />,
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

  /***Check Pages starts */

  /***Check Pages ends */

  /**############################################################### */
  /****
   * ##############################################################
   * BOOKINGS activities starts
   * ##############################################################
   */

  {
    path: "/bookings/listings",
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
    element: <BookingsPageWithSidebarsContentScrollComponent />,
  }, // (Msvs => Done)

  {
    path: "/bookings/listings/:bookingId/view",
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
    element: <BookingsSinglePageWithSidebarsContentScroll />,
  }, // (Msvs => Done)

  /****
   * ##############################################################
   * BOOKINGS activities ends
   * ##############################################################
   */
  /**############################################################### */
  /**############################################################### */
  /****
   * ##############################################################
   * REAL-ESTATE activities starts
   * ##############################################################
   */
  {
    path: "/realestate/listings",
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
    // element: <RealEstatesPage />,
    element: <RealestatePageWithSidebarsContentScrollComponent />,
  },

  {
    path: "/realestate/listings/:slug/view",
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
    // element: <RealEstateSinglePage />,
    element: <RealestateSinglePageWithSidebarsContentScroll />,
  },

  /****
   * ##############################################################
   * REALE-STATE activities ends
   * ##############################################################
   */
  /**############################################################### */

  /****
   * ##############################################################
   * Marketplace activiies starts
   * ##############################################################
   */
  // {
  //   path: "/marketplace/shop",
  //   settings: {
  //     layout: {
  //       config: {
  //         navbar: {
  //           display: false,
  //         },
  //         toolbar: {
  //           display: true,
  //         },
  //         footer: {
  //           display: false,
  //         },
  //         leftSidePanel: {
  //           display: false,
  //         },
  //         rightSidePanel: {
  //           display: false,
  //         },
  //       },
  //     },
  //   },
  //   element: <MarketplaceShops />,
  // },

  {
    path: "/marketplace/shop",
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
    element: <MarketplaceWithSidebarsContentScrollComponent />,
  }, // (Msvs => Done)

  {
    path: "/marketplace/product/:productSlug/view",
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
    // element: <SingleProduct />,
    element: <SingleProductWithContentScrollPage />,
  }, // (Msvs => Done)

  {
    path: "/marketplace/products/:id/by-category",
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
    // element: <MarketplaceProductsByCat />,

    element: <MarketplaceProductsByCatWithContentScrollPage />,
  },

  {
    path: "/deals",
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
    element: <MarketplaceDealsWithSidebarsContentScrollComponent />,
  },

  {
    path: "/marketplace/merchant/:shopId/portal",
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
    // element: <MerchantShopPage />,
    element: <MerchantShopPafeWithContentScrollPage />,
  },

  //
  /****
   * ##############################################################
   * Marketplace activiies ends
   * ##############################################################
   */

  //
  /**############################################################### */
  /****
   * ##############################################################
   * FOOD_MARTS activities starts
   * ##############################################################
   */
  {
    path: "/foodmarts/listings",
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
    // element: <FoodMartsPage />,
    element: <FoodMartWithSidebarsContentScrollPage />, // (Msvs => Done)
  },

  {
    path: "/foodmarts/:martId/visit-mart/:id",
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
    // element: <VisitFoodMartPage />,
    element: <VisitFoodMartWithContentScrollPage />,
  }, // (Mcsvs => Done)

  {
    path: "/foodmarts/:rcsId/menu/:menuSlug/view",
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
    // element: <FoodMartSingleMenu />,
    element: <FoodMartSingleMenuWithContentScrollPage />,
  }, // (Mcsvs => Done)

  /****
   * ##############################################################
   * FOOD_MARTS activities ends
   * ##############################################################
   */
  /**############################################################### */
];
export default routes;
