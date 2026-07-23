import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import DemoHeader from "./shared-components/DemoHeader";
import DemoContent from "./shared-components/DemoContent";
import DemoSidebar from "./shared-components/DemoSidebar";
import DemoSidebarRight from "./shared-components/DemoSidebarRight";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
// import useGetAllProducts from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
// import { useForm } from 'react-hook-form';
// import useSellerCountries from 'app/configs/data/server-calls/countries/useCountries';
// import {
// 	getLgasByStateId,
// 	getStateByCountryId,
//   } from "app/configs/data/client/RepositoryClient";
// import useGetAllBookingProperties, { useGetBookingProperty } from 'app/configs/data/server-calls/auth/userapp/a_bookings/useBookingPropertiesRepo';
import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "app/store/hooks";
import { selectFuseCurrentLayoutConfig } from "@fuse/core/FuseSettings/fuseSettingsSlice";
import { selectUser } from "src/app/auth/user/store/userSlice";
// import { useCreateReservation, useGetReservations } from 'app/configs/data/server-calls/auth/userapp/a_bookings/use-reservations';
// import useCountries from "src/app/hooks/useCountries";
// import {
//   differenceInCalendarDays,
//   differenceInDays,
//   eachDayOfInterval,

// } from "date-fns";
import { toDate } from "date-fns-tz";
import { useGetEstateProperty } from "app/configs/data/server-calls/auth/userapp/a_estates/useEstatePropertiesRepo";
import { useGetMerchantPreview } from "app/configs/data/server-calls/auth/userapp/a_merchants/useMerchantRepo";
import GlobalChat from "../realestate-components/GlobalChat";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import ServiceStatusLandingPage from "../../aapp-settings-from-admin/ServiceStatusLandingPage";

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  // marginLeft:'100px',
  // marginRight:'100px',

  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-toolbar": {},
  "& .FusePageSimple-content": {
    // marginLeft:'100px',
    // marginRight:'100px',
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

const parseDateString = (dateString) => {
  const dateTimeRegex =
    /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]|60))?(\.[0-9]{1,9})?)?)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)?)?)?$/;

  if (dateTimeRegex.test(dateString)) {
    return toDate(dateString);
  }
  return new Date(dateString);
};
/**
 * Active Real Estate Single Page Component
 * This component renders when the real estate service is ACTIVE
 */
function ActiveRealEstateSinglePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  /***
   *
   * REAL-ESTATE SINGLE PAGE STARTS
   */

  // const navigate = useNavigate();
  const routeParams = useParams();
  const { slug } = routeParams;
  const { data: estateList, isLoading, isError } = useGetEstateProperty(slug);

  const currentUser = useAppSelector(selectUser);

  // Memoize sidebar toggle handlers to prevent re-renders
  const handleLeftSidebarToggle = useCallback(() => {
    setLeftSidebarOpen(!leftSidebarOpen);
  }, [leftSidebarOpen]);

  const handleRightSidebarToggle = useCallback(() => {
    setRightSidebarOpen(!rightSidebarOpen);
  }, [rightSidebarOpen]);

  const handleLeftSidebarClose = useCallback(() => {
    setLeftSidebarOpen(false);
  }, []);

  const handleRightSidebarClose = useCallback(() => {
    setRightSidebarOpen(false);
  }, []);

  const handleChatToggle = useCallback(() => {
    setIsChatOpen(!isChatOpen);
  }, [isChatOpen]);

  // Memoize derived data to avoid recalculation on every render
  const propertyListing = useMemo(
    () => estateList?.data?.propertyListing,
    [estateList?.data?.propertyListing],
  );
  const propertyListingId = useMemo(
    () => estateList?.data?.propertyListing?.id,
    [estateList?.data?.propertyListing?.id],
  );

  // The property record has no `realtor` relation at all — `shop` is the
  // merchant id. Resolve the real listing shop via the same public preview
  // route mobile/bookings already use, instead of showing invented realtor
  // data when `realtor` is always undefined.
  const { data: merchantPreview } = useGetMerchantPreview(propertyListing?.shop);
  const realtor = merchantPreview?.data?.merchant;

  const realtorName = useMemo(() => realtor?.shopname || "Listing Agent", [realtor?.shopname]);

  // Memoize header component
  const headerComponent = useMemo(
    () => (
      <DemoHeader
        leftSidebarToggle={handleLeftSidebarToggle}
        rightSidebarToggle={handleRightSidebarToggle}
      />
    ),
    [handleLeftSidebarToggle, handleRightSidebarToggle],
  );

  // Memoize content component
  const contentComponent = useMemo(
    () => (
      <DemoContent estatePropertyData={propertyListing} isLoading={isLoading} isError={isError} />
    ),
    [propertyListing, isLoading, isError],
  );

  // Memoize left sidebar content
  const leftSidebarContentComponent = useMemo(() => <DemoSidebar />, []);

  // Memoize right sidebar content
  const rightSidebarContentComponent = useMemo(
    () =>
      propertyListingId ? (
        <DemoSidebarRight isLoading={isLoading} listing={propertyListing} realtor={realtor} />
      ) : null,
    [propertyListingId, isLoading, propertyListing, realtor],
  );

  // Memoize chat component
  const chatComponent = useMemo(
    () =>
      currentUser?.id ? (
        <GlobalChat isOpen={isChatOpen} onToggle={handleChatToggle} realtorName={realtorName} />
      ) : null,
    [currentUser?.id, isChatOpen, handleChatToggle, realtorName],
  );

  return (
    <>
      <Root
        header={headerComponent}
        content={contentComponent}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarOnClose={handleLeftSidebarClose}
        leftSidebarContent={leftSidebarContentComponent}
        rightSidebarOpen={rightSidebarOpen}
        rightSidebarOnClose={handleRightSidebarClose}
        rightSidebarContent={rightSidebarContentComponent}
        scroll="content"
      />

      {/* Chat Component - Fixed at the bottom */}
      {chatComponent}
    </>
  );
}

// Memoize ActiveRealEstateSinglePage to prevent unnecessary re-renders when parent re-renders
const MemoizedActiveRealEstateSinglePage = memo(ActiveRealEstateSinglePage);

/**
 * Main Real Estate Single Page Component with Service Status Check
 * Wraps the active real estate single page with service status landing pages
 */
function RealestateSinglePageWithSidebarsContentScroll() {
  // Fetch user app settings
  const {
    data: appSettings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
  } = useGetUserAppSetting();

  // Extract the real estate service status - memoized to prevent unnecessary re-renders
  const realEstateServiceStatus = useMemo(
    () => appSettings?.data?.payload?.realEstateServiceStatus,
    [appSettings?.data?.payload?.realEstateServiceStatus],
  );

  // Log service status only when it changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && realEstateServiceStatus !== undefined) {
      console.log("Real Estate Service Status (Single Page):", realEstateServiceStatus);
    }
  }, [realEstateServiceStatus]);

  return (
    <ServiceStatusLandingPage
      serviceStatus={realEstateServiceStatus}
      ActiveComponent={MemoizedActiveRealEstateSinglePage}
      isLoading={isLoadingSettings}
      isError={isErrorSettings}
      serviceName="Real Estate"
    />
  );
}

export default RealestateSinglePageWithSidebarsContentScroll;
