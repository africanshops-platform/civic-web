import { styled } from "@mui/material/styles";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import useGetAllBookingProperties from "app/configs/data/server-calls/auth/userapp/a_bookings/useBookingPropertiesRepo";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import DemoHeader from "./shared-components/DemoHeader";
import DemoContent from "./shared-components/DemoContent";
import DemoSidebar from "./shared-components/DemoSidebar";
import DemoSidebarRight from "./shared-components/DemoSidebarRight";
import ServiceStatusLandingPage from "../../aapp-settings-from-admin/ServiceStatusLandingPage";

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-toolbar": {},
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

/**
 * The SimpleWithSidebarsContentScroll page - Active Component
 * This component renders when the bookings service is ACTIVE
 */
function ActiveBookingsPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  // Filter state management
  const [filters, setFilters] = useState({});

  // Pagination state management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  // Fetch booking properties with filters
  const { data: bookingprops, isLoading, isError } = useGetAllBookingProperties(filters);

  // Handle filter changes from FilterList component
  const handleFilterChange = useCallback(
    (newFilters) => {
      // Map FilterList filter names to API parameter names
      const apiFilters = {};

      // Pagination parameters
      apiFilters.limit = itemsPerPage;
      apiFilters.offset = (currentPage - 1) * itemsPerPage;

      // Keyword search (maps to title or slug)
      if (newFilters.keyword) {
        apiFilters.title = newFilters.keyword;
      }

      // Property type (category)
      if (newFilters.propertyType) {
        apiFilters.category = newFilters.propertyType;
      }

      // Location filters
      if (newFilters.country) {
        apiFilters.propertyCountry = newFilters.country;
      }
      if (newFilters.state) {
        apiFilters.propertyState = newFilters.state;
      }
      if (newFilters.lga) {
        apiFilters.propertyLga = newFilters.lga;
      }

      // Price range
      if (newFilters.priceRange && Array.isArray(newFilters.priceRange)) {
        apiFilters.minPrice = newFilters?.priceRange[0];
        apiFilters.maxPrice = newFilters?.priceRange[1];
      }

      // Room count 
      if (newFilters.roomCount) {
        apiFilters.roomCount = newFilters.roomCount;
      }

      // Bathroom count
      if (newFilters.bathroomCount) {
        apiFilters.bathroomCount = newFilters.bathroomCount;
      }

      // Amenities (join array into comma-separated string)
      if (newFilters.amenities && newFilters.amenities.length > 0) {
        apiFilters.checkedAmenities = newFilters.amenities.join(",");
      }

      // Update filters state (this will trigger useGetAllBookingProperties to refetch)
      setFilters(apiFilters);
    },
    [itemsPerPage, currentPage],
  );

  // Sync pagination changes with filters
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      }));
    }
  }, [currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

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
  const bookingLists = useMemo(
    () => bookingprops?.data?.bookingLists,
    [bookingprops?.data?.bookingLists],
  );
  const totalItems = useMemo(
    () => bookingprops?.data?.pagination?.total || 0,
    [bookingprops?.data?.pagination?.total],
  );

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
        listings={bookingLists}
        isLoading={isLoading}
        isError={isError}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    ),
    [
      bookingLists,
      isLoading,
      isError,
      totalItems,
      currentPage,
      itemsPerPage,
      handlePageChange,
      handleItemsPerPageChange,
    ],
  );

  // Memoize left sidebar content
  const leftSidebarContentComponent = useMemo(
    () => <DemoSidebar onFilterChange={handleFilterChange} />,
    [handleFilterChange],
  );

  // Memoize right sidebar content
  const rightSidebarContentComponent = useMemo(
    () => <DemoSidebarRight bookingsData={bookingLists} />,
    [bookingLists],
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

// Memoize ActiveBookingsPage to prevent unnecessary re-renders when parent re-renders
const MemoizedActiveBookingsPage = memo(ActiveBookingsPage);

/**
 * Main Bookings Page Component with Service Status Check
 * Wraps the active bookings page with service status landing pages
 */
function BookingsPageWithSidebarsContentScrollComponent() {
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


  return (
    <ServiceStatusLandingPage
      serviceStatus={bookingsServiceStatus}
      ActiveComponent={MemoizedActiveBookingsPage}
      isLoading={isLoadingSettings}
      isError={isErrorSettings}
      serviceName="Bookings"
    />
  );
}

export default BookingsPageWithSidebarsContentScrollComponent;
