import { Box, Paper, Typography } from "@mui/material";
import React, { lazy, useMemo, useState } from "react";
import { ListingReservation } from "./reservationreview";
import { ListingRooms } from "./property-rooms/ListingRooms";
import RealtorProfile from "./RealtorProfile";
import GlobalChat from "./GlobalChat";
import PropertyInteractionCard from "./PropertyInteractionCard";

const DetailsRight = React.memo(({ listing, realtor }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Realtor Profile Component — real shop data (listing.shop merchant id),
          the property record itself has no `realtor` field at all */}
      <RealtorProfile realtor={realtor} />

      {/* Property Interaction Card */}
      <PropertyInteractionCard propertyData={listing} realtorInfo={realtor} />

      {/* {coordinates && <Map center={coordinates} />} */}
    </div>
  );
});

export default DetailsRight;
