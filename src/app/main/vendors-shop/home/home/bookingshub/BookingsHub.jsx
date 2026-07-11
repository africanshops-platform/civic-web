import React, { useEffect, useState, useMemo } from "react";
import { Button, Skeleton, Typography } from "@mui/material";

import RecommendedHead from "./bookingshubcomponents/RecommendedHead";
import useGetAllBookingProperties from "app/configs/data/server-calls/auth/userapp/a_bookings/useBookingPropertiesRepo";
import BookinghubBookingCard from "./bookingshubcomponents/BookinghubBookingCard";
// import BookingCard from "app/main/zrootclient/buz-bookings/bookingsPage/shared-components/BookingCard";


function BookingsHub() {
  const { data: bookingprops, isLoading, isError } = useGetAllBookingProperties();

  // Filter for first 12 promoted/featured apartments
  const promotedApartments = useMemo(() => {
    const properties = bookingprops?.data?.bookingLists || [];
    // Get first 12 properties (assuming they are promoted/featured)
    return properties.slice(0, 12);
  }, [bookingprops]);
  console.log("Promoted Apartments:", promotedApartments);

  return (
    <div className="pt-5 w-full">
      <RecommendedHead title="Hotels And Apartments" color="bg-orange-800" />

      <div className="flex-auto mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={300} className="rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {promotedApartments?.map((property) => (
              <BookinghubBookingCard
                // key={property?.id}
                // property={property}
                key={property?.id || property?._id}
                id={property?.id || property?._id}
                slug={property?.slug}
                images={property?.listingImages || []}
                title={property?.title}
                address={property?.address}
                price={property?.price}
                roomCount={property?.roomCount}
                rating={property?.rating || 4.5}
                reviewCount={property?.reviewCount || 9}
                duration={property?.duration || "3 - 8 hours"}
                host={property?.host || "Captain"}
              />
            ))}

            {/* /* Debugging: Log each property: LIST APARTMENNTS */}
          </div>
        )}

        {/* View All Button */}
        {promotedApartments.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="contained"
              size="large"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              href="/bookings/listings"
            >
              View All Properties
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsHub;
