import FuseNavigation from "@fuse/core/FuseNavigation";
import BookingsMap from "../../components/maps/BookingsMap";
import DetailsRight from "../../realestate-components/DetailsRight";
import { Box, Typography } from "@mui/material";
import GlobalChat from "../../realestate-components/GlobalChat";
import { useState } from "react";
/**
 * Navigation data
 */

/**
 * The DemoSidebarRight component.
 */
function DemoSidebarRight(props) {
  const {
    isLoading,

    listing,
    realtor,
    // locationValue,
    // coordinates,
    // price,
    // totalPrice,
    // onChangeDate,
    // dateRange,
    // onSubmit,
    // disabled,
    // disabledDates,
  } = props;

  // const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="px-12 py-24 h-screen">
      <div>
        <div className="bg-white p-4 shadow-md">
          <div className="mt-4">
            {isLoading ? (
              <>
                <Box xs={24} lg={14}>
                  <p>loading...</p>
                </Box>
              </>
            ) : listing ? (
              <>
                <Box>
                  <DetailsRight
                    listing={listing}
                    realtor={realtor}
                    // locationValue={locationValue}
                    // coordinates={coordinates}
                    // price={price}
                    // totalPrice={totalPrice}
                    // onChangeDate={onChangeDate}
                    // dateRange={dateRange}
                    // onSubmit={onSubmit}
                    // disabled={disabled}
                    // disabledDates={disabledDates}
                  />
                </Box>
              </>
            ) : (
              <Box>
                <Typography>Data Not Found</Typography>
              </Box>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoSidebarRight;
