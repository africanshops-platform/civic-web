import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FusePageSimple from "@fuse/core/FusePageSimple";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import FuseLoading from "@fuse/core/FuseLoading";
import { motion } from "framer-motion";
import { useGetAuthUserFoodOrders } from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo.js";
import FoodOrderCard from "./components/FoodOrderCard.jsx";
import ClienttErrorPage from "../components/ClienttErrorPage.jsx";
import UserAccountLeads from "../components/UserAccountLeads.jsx";

function FoodmartOrders() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const {
    data: userFoodOrders,
    isLoading: foodLoading,
    isError: foodIsError,
  } = useGetAuthUserFoodOrders();

  if (foodLoading) {
    return <FuseLoading />;
  }

  if (foodIsError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message=" Error occurred while retriving your reservations" />
      </motion.div>
    );
  }

  if (!userFoodOrders?.data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          No reservations found!
        </Typography>
      </motion.div>
    );
  }

  return (
    <FusePageSimple
      content={
        <div className="flex h-screen flex-col md:mx-auto mt-20">
          <div className="flex  flex-col md:flex-row gap-8">
            {/* Map */}
            <Box className="w-full md:w-1/4  bg-gray-100 relative  mt-4 md:mt-0 md:sticky top-16 md:h-[250px] gap-8">
              <UserAccountLeads />
            </Box>

            {/* Main Content */}
            <div className="flex-1 w-full md:w-9/12  p-4 bg-white rounded-md overflow-scroll">
              <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 gap-8 ">
                <main className="w-full p-4 overflow-y-scroll">
                  <h1 className="text-xl font-bold mb-4">Foodmart Orders</h1>
                  <div className="flex space-x-4 mb-4">
                    <button type="button" className="border-b-2 border-orange-500 pb-2">
                      ONGOING/FULLFILED ORDERS {userFoodOrders?.data?.length}
                    </button>
                    <button type="button" className="pb-2">CANCELED ORDERS (0)</button>
                  </div>
                  <div className="space-y-4">
                    {userFoodOrders?.data?.map((order) => (
                      <div className="bg-white p-4 rounded shadow mb-8" key={order?._id}>
                        <FoodOrderCard orderData={order} />
                      </div>
                    ))}
                  </div>
                  <br />
                  <br />
                  <br />
                  <br />
                </main>

                <button type="button" className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                  <i className="fas fa-comment-dots" />
                  <span>Chat with us</span>
                </button>
              </div>
            </div>

            {/* Map */}
            <Box className="w-full md:w-1/4  bg-gray-100 relative  mt-4 md:mt-0 md:sticky top-16 md:h-screen gap-8">
              <aside className="w-full bg-white p-4 rounded-8 mb-8">
                <ul className="space-y-4">
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-user" />
                    <span>My Jumia Account</span>
                  </li>
                  <li className="flex items-center space-x-2 bg-gray-200 p-2 rounded">
                    <i className="fas fa-box" />
                    <span>Orders</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-envelope" />
                    <span>Inbox</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-star" />
                    <span>Pending Reviews</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-ticket-alt" />
                    <span>Voucher</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-heart" />
                    <span>Saved Items</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-store" />
                    <span>Followed Sellers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-clock" />
                    <span>Recently Viewed</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <p>Account Management</p>
                  <p>Address Book</p>
                </div>
                <button type="button" className="mt-8 text-red-500">LOGOUT</button>
              </aside>
            </Box>
          </div>
        </div>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default FoodmartOrders;
