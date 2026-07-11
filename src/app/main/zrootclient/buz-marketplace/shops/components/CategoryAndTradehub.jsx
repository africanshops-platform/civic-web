// import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Typography } from "@mui/material";
import useProductCats from "app/configs/data/server-calls/product-categories/useProductCategories";
import  { useEffect, useState, useRef } from "react";
// import { useRef } from "react";
import { useParams } from "react-router";

const CategoryAndTradehub = ({ onFilterChange, initialFilters = {}, resetRef }) => {
  const onFilterChangeRef = useRef(onFilterChange);

  // Update ref when onFilterChange changes
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Filter state
  const [category, setCategory] = useState(initialFilters.category || "");

  // Expose reset function through ref
  useEffect(() => {
    if (resetRef) {
      resetRef.current = () => {
        setCategory("");
        // Notify parent about the category reset
        if (onFilterChangeRef.current) {
          onFilterChangeRef.current({ category: "" });
        }
      };
    }
  }, [resetRef]);

  console.log("Product by cat-filter CAT", category);

  const routeParams = useParams();
  const { id } = routeParams;

  const { data: categoriesData, isLoading } = useProductCats();

  let categoriesView;
  if (!isLoading) {
    if (categoriesData?.data?.categories && categoriesData?.data?.categories.length > 0) {
      const items = categoriesData?.data?.categories.map((item) => (
        <li
          key={item.id}
          className={
            item.id === id
              ? "relative bg-orange-100 rounded-lg hover:bg-orange-200 py-3 px-4 cursor-pointer mb-2 shadow-sm transition-all duration-200 border-l-4 border-orange-600"
              : "relative bg-white rounded-lg hover:bg-orange-50 py-3 px-4 cursor-pointer mb-2 shadow-sm transition-all duration-200 border-l-4 border-transparent hover:border-orange-400"
          }
        >
          <Typography
            // component={NavLinkAdapter}
            // to={`/marketplace/products/${item?.id}/by-category`}
            onClick={() => {
              setCategory(item.id);
              if (onFilterChangeRef.current) {
                onFilterChangeRef.current({ category: item.id });
              }
            }}
            sx={{
              fontSize: "1.125rem",
              fontWeight: item.id === category ? 700 : 500,
              color: item.id === category ? "#ea580c" : "#374151",
              textDecoration: "none",
              display: "block",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              "&:hover": {
                color: "#ea580c",
              },
            }}
          >
            {item.name}
          </Typography>
        </li>
      ));
      categoriesView = <ul className="p-2">{items}</ul>;
    } else {
    }
  } else {
    categoriesView = <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-600 to-red-600 sticky top-0 z-10">
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "white",
          }}
        >
          Product Categories
        </Typography>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">{categoriesView}</div>
    </div>
  );
};

export default CategoryAndTradehub;
