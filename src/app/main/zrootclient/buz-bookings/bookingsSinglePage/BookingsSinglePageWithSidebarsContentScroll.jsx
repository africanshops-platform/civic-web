import { styled } from "@mui/material/styles";
// import FusePageSimple from "@fuse/core/FusePageSimple";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";

import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
// import useGetAllProducts from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
// import { useForm } from "react-hook-form";
// import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
// import { getLgasByStateId, getStateByCountryId } from "app/configs/data/client/RepositoryClient";
import  {
  useGetAllAmenities,
  useGetBookingProperty,
} from "app/configs/data/server-calls/auth/userapp/a_bookings/useBookingPropertiesRepo";
import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "app/store/hooks";
import { selectFuseCurrentLayoutConfig } from "@fuse/core/FuseSettings/fuseSettingsSlice";
import { selectUser } from "src/app/auth/user/store/userSlice";
import {
  useCreateReservation,
  useGetReservations,
} from "app/configs/data/server-calls/auth/userapp/a_bookings/use-reservations";
import { useGetMerchantPreview } from "app/configs/data/server-calls/auth/userapp/a_merchants/useMerchantRepo";
import useCountries from "src/app/hooks/useCountries";
import { differenceInCalendarDays,  eachDayOfInterval } from "date-fns";
import { toDate } from "date-fns-tz";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import ServiceStatusLandingPage from "../../aapp-settings-from-admin/ServiceStatusLandingPage";
import DemoHeader from "./shared-components/DemoHeader";
import DemoContent from "./shared-components/SingleListDemoContent";
import DemoSidebar from "./shared-components/DemoSidebar";
import DemoSidebarRight from "./shared-components/DemoSidebarRight";

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
 * Active Bookings Single Page Component
 * This component renders when the bookings service is ACTIVE
 */
function ActiveBookingsSinglePage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  /***
   *
   * BOOKING SINGLE PAGE STARTS
   */

  const navigate = useNavigate();
  const routeParams = useParams();
  const { bookingId } = routeParams;
  const { data: booking, isLoading, isError } = useGetBookingProperty(bookingId);
  const { data: amenities } = useGetAllAmenities();

  // admin/amenities

  // console.log("SINGLE__BOOKING", booking?.data?.listing)

  // Fetch merchant preview data using the shop/merchant ID from booking
  const merchantId = booking?.data?.listing?.shop;
  const {
    data: merchantData,
    isLoading: merchantLoading,
    isError: merchantError,
  } = useGetMerchantPreview(merchantId);

  // console.log("MERCHANT__PREVIEW", merchantData)

  const config = useAppSelector(selectFuseCurrentLayoutConfig);
  const currentUser = useAppSelector(selectUser);
  const { mutate: createReservation, isLoading: reservationLoading } = useCreateReservation();
  const { getByValue } = useCountries();

  const { data: reservatons, isLoading: getReservationLoading } = useGetReservations(
    booking?.data?.listing?.id,
  );

  const coordinates = getByValue(booking?.data?.listing?.locationValue)?.latlng;

  

  const disabledDates = useMemo(() => {
    let dates = [];

    reservatons?.data?.reservations?.forEach((reservation) => {
      const range = eachDayOfInterval({
        start: new Date(reservation?.startDate),
        end: new Date(reservation.endDate),
      });

      dates = [...dates, ...range];
    });

    return dates;
  }, [reservatons?.data?.reservations]);

  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(booking?.data?.listing?.price);
  const [dateRange, setDateRange] = useState(initialDateRange);

  // console.log("Booking Data:", booking?.data?.listing);
  const onCreateReservation = useCallback(() => {
    if (!currentUser?.name) {
      navigate("/sign-in");
      return;
    }

    const formData = {
      totalPrice,
      startDate: parseDateString(dateRange?.startDate),
      endDate: parseDateString(dateRange?.endDate),
      listingId: booking?.data?.listing?.id,
      bookingPropertyName: booking?.data?.listing?.title,
      bookingPropertyAddress: booking?.data?.listing?.propertyAddress,
      merchantId: booking?.data?.listing?.shop,
    };

    return createReservation(formData);
  }, [
    totalPrice,
    dateRange,
    booking?.data?.listing,
    routeParams,
    // currentUser
  ]);

  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      const dayCount = differenceInCalendarDays(dateRange?.endDate, dateRange?.startDate);
      if (dayCount && booking?.data?.listing?.price) {
        setTotalPrice(dayCount * booking?.data?.listing?.price);
        //* -1
      } else {
        setTotalPrice(booking?.data?.listing?.price);
      }
    }
  }, [dateRange, booking?.data?.listing?.price]);

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

  // Memoize derived data to avoid recalculation on every render
  const amenitiesData = useMemo(() => amenities?.data?.amenities, [amenities]);

  console.log("Amenities (Memoized):", amenitiesData);

  const bookingData = useMemo(() => booking?.data?.listing, [booking?.data?.listing]);
  console.log("Booking Data (Memoized):", bookingData);

  const merchantInfo = useMemo(() => merchantData?.data?.merchant, [merchantData?.data?.merchant]);
  const propertyTitle = useMemo(
    () => booking?.data?.listing?.title,
    [booking?.data?.listing?.title],
  );
  const propertyAddress = useMemo(
    () => booking?.data?.listing?.address,
    [booking?.data?.listing?.address],
  );
  const locationValue = useMemo(
    () => booking?.data?.listing?.locationValue,
    [booking?.data?.listing?.locationValue],
  );
  const propertyPrice = useMemo(
    () => booking?.data?.listing?.price,
    [booking?.data?.listing?.price],
  );
  const listingId = useMemo(() => booking?.data?.listing?.id, [booking?.data?.listing?.id]);

  // Memoize date change handler
  const handleDateChange = useCallback((value) => {
    setDateRange(value);
  }, []);

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
      <DemoContent
        amenities={amenitiesData}
        bookingData={bookingData}
        isLoading={isLoading}
        isError={isError}
      />
    ),
    [bookingData, isLoading, isError],
  );

  // Memoize left sidebar content
  const leftSidebarContentComponent = useMemo(
    () => (
      <DemoSidebar
        merchantData={merchantInfo}
        coordinates={coordinates}
        propertyName={propertyTitle}
        propertyAddress={propertyAddress}
      />
    ),
    [merchantInfo, coordinates, propertyTitle, propertyAddress],
  );

  // Memoize right sidebar content
  const rightSidebarContentComponent = useMemo(
    () =>
      listingId ? (
        <DemoSidebarRight
          isLoading={isLoading}
          listing={bookingData}
          locationValue={locationValue}
          coordinates={coordinates}
          price={propertyPrice}
          totalPrice={totalPrice}
          onChangeDate={handleDateChange}
          dateRange={dateRange}
          onSubmit={onCreateReservation}
          disabled={reservationLoading}
          disabledDates={disabledDates}
        />
      ) : null,
    [
      listingId,
      isLoading,
      bookingData,
      locationValue,
      coordinates,
      propertyPrice,
      totalPrice,
      handleDateChange,
      dateRange,
      onCreateReservation,
      reservationLoading,
      disabledDates,
    ],
  );

  return (
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
  );
}

// Memoize ActiveBookingsSinglePage to prevent unnecessary re-renders when parent re-renders
const MemoizedActiveBookingsSinglePage = memo(ActiveBookingsSinglePage);

/**
 * Main Bookings Single Page Component with Service Status Check
 * Wraps the active bookings single page with service status landing pages
 */


function BookingsSinglePageWithSidebarsContentScroll() {
  // Fetch user app settings
  const {
    data: appSettings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
  } = useGetUserAppSetting();

  // Extract the bookings service status - memoized to prevent unnecessary re-renders
  const bookingsServiceStatus = useMemo(
    () => appSettings?.data?.payload?.bookingsServiceStatus,
    [appSettings?.data?.payload?.bookingsServiceStatus],
  );

  // Log service status only when it changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && bookingsServiceStatus !== undefined) {
      console.log("Bookings Service Status (Single Page):", bookingsServiceStatus);
    }
  }, [bookingsServiceStatus]);

  return (
    <ServiceStatusLandingPage
      serviceStatus={bookingsServiceStatus}
      ActiveComponent={MemoizedActiveBookingsSinglePage}
      isLoading={isLoadingSettings}
      isError={isErrorSettings}
      serviceName="Bookings"
    />
  );
}

export default BookingsSinglePageWithSidebarsContentScroll;
