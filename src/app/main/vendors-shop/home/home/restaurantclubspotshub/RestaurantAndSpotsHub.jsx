import React, { useEffect, useState, useMemo } from "react";
import { Button, Skeleton, Typography } from "@mui/material";

import RecommendedHead from "./rcshubcomponents/RecommendedHead";
import useGetAllFoodMarts from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import FoodMartCard from "./rcshubcomponents/FoodMartCard";


function RestaurantAndSpotsHub() {
  const { data: AllFoodMarts, isLoading, isError } = useGetAllFoodMarts();

  // Filter for first 12 promoted restaurants
  const promotedRestaurants = useMemo(() => {
    const foodmarts = AllFoodMarts?.data?.foodmarts || [];
    // Get first 12 food marts (assuming they are promoted/featured)
    return foodmarts.slice(0, 12);
  }, [AllFoodMarts]);

  return (
    <div className="pt-5 w-full">
      <RecommendedHead title="Restaurants, Clubs and Spots" color="bg-orange-800" />

      <div className="flex-auto mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={300} className="rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {promotedRestaurants?.map((foodmart) => (
              <FoodMartCard
                key={foodmart?._id}
                id={foodmart?._id}
                slug={foodmart?.slug}
                images={foodmart?.imageSrcs || []}
                title={foodmart?.title}
                location={foodmart?.location || foodmart?.address || "Location not specified"}
                category={foodmart?.category || "Restaurant"}
                rating={foodmart?.rating || 4.5}
                reviewCount={foodmart?.reviewCount || 10}
                priceRange={foodmart?.priceRange || "$$"}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        {promotedRestaurants.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="contained"
              size="large"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              href="/foodmarts/listings"
            >
              View All Restaurants
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantAndSpotsHub;
