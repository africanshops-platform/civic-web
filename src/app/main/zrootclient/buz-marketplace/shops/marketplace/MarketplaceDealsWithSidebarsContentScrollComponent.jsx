import { styled } from "@mui/material/styles";
// import FusePageSimple from "@fuse/core/FusePageSimple";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useGetAllProducts from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
// import { useForm } from "react-hook-form";
// import useSellerCountries from "app/configs/data/server-calls/countries/useCountries";
// import { getLgasByStateId, getStateByCountryId } from "app/configs/data/client/RepositoryClient";
import useGetUserAppSetting from "app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain";
import DemoHeader from "./shared-components/DemoHeaderProduct";
import DemoContentProduct from "./shared-components/DemoContentProduct";
import DemoSidebar from "./shared-components/DemoSidebarProduct";
import DemoSidebarRight from "./shared-components/MarketplaceDemoSidebarRight";
import ServiceStatusLandingPage from "../../../aapp-settings-from-admin/ServiceStatusLandingPage";

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

/**
 * Active Marketplace Component
 * This component renders when the marketplace service is ACTIVE
 */
function ActiveMarketplacePage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  // Filter state management
  const [filters, setFilters] = useState({});

  // Pagination state management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  // const [products, setProducts] = useState([]);
  const { data: allProducts, isLoading, isError } = useGetAllProducts(filters);

  //   console.log("All PRODUCTS", allProducts?.data?.products)

  // Handle filter changes from ProductFilter component
  const handleFilterChange = useCallback(
    (newFilters) => {
      // Map ProductFilter filter names to API parameter names
      const apiFilters = {};

      // Pagination parameters
      apiFilters.limit = itemsPerPage;
      apiFilters.offset = (currentPage - 1) * itemsPerPage;

      // Keyword search (maps to name or slug)
      if (newFilters.keyword) {
        apiFilters.name = newFilters.keyword;
        // Optionally also search by slug
        // apiFilters.slug = newFilters.keyword;
      }

      // Location filters
      if (newFilters.category) {
        apiFilters.productCategory = newFilters.category;
      }

      // Location filters
      if (newFilters.country) {
        apiFilters.productCountry = newFilters.country;
      }
      if (newFilters.state) {
        apiFilters.productState = newFilters.state;
      }
      if (newFilters.lga) {
        apiFilters.productLga = newFilters.lga;
      }

      // Shop plan filter
      if (newFilters.shopPlan) {
        apiFilters.productShopplan = newFilters.shopPlan;
      }

      // Market category filter
      if (newFilters.market) {
        apiFilters.market = newFilters.market;
      }

      // Price range
      if (newFilters.priceRange && Array.isArray(newFilters.priceRange)) {
        apiFilters.minPrice = newFilters.priceRange[0];
        apiFilters.maxPrice = newFilters.priceRange[1];
      }

      // Advanced features
      if (newFilters.features && newFilters.features.length > 0) {
        // Check if ECOWAS interest is selected
        if (newFilters.features.includes("ecowas-interest")) {
          apiFilters.isOfEcowasInterest = true;
        }
        // You can add more feature mappings here as needed
      }

      // Update filters state (this will trigger useGetAllProducts to refetch)
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
  const products = useMemo(() => allProducts?.data?.products, [allProducts?.data?.products]);
  const totalItems = useMemo(
    () => allProducts?.data?.pagination?.total || 0,
    [allProducts?.data?.pagination?.total],
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
      <DemoContentProduct
        products={products}
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
      products,
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
  const rightSidebarContentComponent = useMemo(() => <DemoSidebarRight />, []);

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

// Memoize ActiveMarketplacePage to prevent unnecessary re-renders when parent re-renders
const MemoizedActiveMarketplacePage = memo(ActiveMarketplacePage);

/**
 * Main Marketplace Component with Service Status Check
 * Wraps the active marketplace page with service status landing pages
 */
function MarketplaceDealsWithSidebarsContentScrollComponent() {
  // Fetch user app settings
  const {
    data: appSettings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
  } = useGetUserAppSetting();

  // Extract the marketplace service status - memoized to prevent unnecessary re-renders
  const marketplaceServiceStatus = useMemo(
    () => appSettings?.data?.payload?.marketplaceServiceStatus,
    [appSettings?.data?.payload?.marketplaceServiceStatus],
  );

  // Log service status only when it changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && marketplaceServiceStatus !== undefined) {
      console.log("Marketplace Service Status:", marketplaceServiceStatus);
    }
  }, [marketplaceServiceStatus]);

  return (
    <ServiceStatusLandingPage
      serviceStatus={marketplaceServiceStatus}
      ActiveComponent={MemoizedActiveMarketplacePage}
      isLoading={isLoadingSettings}
      isError={isErrorSettings}
      serviceName="Marketplace"
    />
  );
}

export default MarketplaceDealsWithSidebarsContentScrollComponent;
