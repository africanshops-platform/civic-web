import FuseLoading from "@fuse/core/FuseLoading";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  Rating,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import ClienttErrorPage from "src/app/main/zrootclient/components/ClienttErrorPage";
import siteStyle from "@fuse/sitestaticdata/siteStyle";
import { Link } from "react-router-dom";
import ImageGalleryView from "./ImageGalleryView";
import {
  Reply,
  Send,
  ThumbUp,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Wifi,
  LocalParking,
  Pool,
  FitnessCenter,
  AcUnit,
  Kitchen,
  Tv,
  LocalLaundryService,
  Security,
  Balcony,
  Pets,
  Elevator,
  CheckCircle,
} from "@mui/icons-material";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

/**
 * Demo Content
 */
function DemoContent(props) {
  const { isLoading, isError, estatePropertyData } = props;
  const [galleryOpen, setGalleryOpen] = useState(false);

  console.log("Etate Property Data in DemoContent:", estatePropertyData);

  if (isLoading) {
    return <FuseLoading />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message={"Error occurred while retriving products"} />
      </motion.div>
    );
  }

  if (!estatePropertyData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          No listing with this id
        </Typography>
      </motion.div>
    );
  }

  return (
    <div className="flex-auto p-8 sm:p-12 ">
      <div className="h-7xl min-h-7xl max-h-7xl ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 px-0">
          {/* Put Booking Data Here */}
          <div className="col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <img
                src={
                  estatePropertyData?.listingImages?.[0]
                    ? estatePropertyData.listingImages[0]?.url
                    : "https://placehold.co/600x400"
                }
                alt="Indoor pool area"
                className="w-full h-[230px] rounded-8 object-cover"
              />
              <img
                src={
                  estatePropertyData?.listingImages?.[1]
                    ? estatePropertyData.listingImages[1]?.url
                    : "https://placehold.co/600x400"
                }
                alt="Luxurious lobby area"
                className="w-full h-[230px] rounded-8 object-cover"
              />
            </div>
            <div className="bg-white px-6 py-4 mt-4 shadow-md">
              <div className="flex items-center justify-between px-2"></div>
              <h1 className="text-2xl font-bold mt-2 px-2">{estatePropertyData?.title}</h1>
              <p className="text-gray-600 mt-2 px-2">{estatePropertyData?.shortDescription}</p>
              <div className="flex items-center mt-2 px-2 gap-2">
                <span className="text-gray-600">Share:</span>
                <IconButton size="small" className="text-blue-600 hover:bg-blue-50">
                  <Facebook />
                </IconButton>
                <IconButton size="small" className="text-blue-400 hover:bg-blue-50">
                  <Twitter />
                </IconButton>
                <IconButton size="small" className="text-pink-600 hover:bg-pink-50">
                  <Instagram />
                </IconButton>
                <IconButton size="small" className="text-blue-700 hover:bg-blue-50">
                  <LinkedIn />
                </IconButton>
              </div>
              {/* Property Pricing & Use Case Card */}
              <div className="mt-4 bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 rounded-xl p-6 border-2 border-orange-200 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Typography
                      variant="caption"
                      className="text-orange-800 font-semibold uppercase tracking-wide"
                    >
                      Price
                    </Typography>
                    <Typography variant="h4" className="font-black text-gray-900 mt-1">
                      ₦{formatCurrency(estatePropertyData?.price)}
                    </Typography>
                    {estatePropertyData?.propertyUseCase === "RENT" && (
                      <>
                        <Typography variant="caption" className="text-gray-600 mt-1">
                          {estatePropertyData?.leaseTerm || "Per Annum"}
                        </Typography>
                      </>
                    )}
                  </div>

                  {estatePropertyData?.propertyUseCase && (
                    <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-orange-200">
                      <Typography
                        variant="caption"
                        className="text-orange-700 font-semibold block text-center"
                      >
                        Use Case
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-gray-800 font-bold text-center capitalize mt-1"
                      >
                        {estatePropertyData?.propertyUseCase}
                      </Typography>
                    </div>
                  )}
                </div>

                <Divider sx={{ marginY: 2, borderColor: "rgba(234, 88, 12, 0.2)" }} />

                {/* <div className="flex gap-3">
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: '#ea580c',
                      color: 'white',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      '&:hover': {
                        backgroundColor: '#c2410c',
                      }
                    }}
                  >
                    Place a Bid
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: '#ea580c',
                      color: '#ea580c',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      borderWidth: '2px',
                      '&:hover': {
                        borderColor: '#c2410c',
                        backgroundColor: 'rgba(234, 88, 12, 0.05)',
                        borderWidth: '2px',
                      }
                    }}
                  >
                    Contact Owner
                  </Button>
                </div> */}
              </div>
            </div>

            <div className="bg-white px-6 py-6 mt-4 shadow-md rounded-lg">
              <Typography variant="h5" className="font-bold mb-4 px-2">
                Amenities & Features
              </Typography>

              {/* Amenities Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
                {/* Use actual amenities from database or fallback to placeholder */}
                {(
                  estatePropertyData?.amenities || [
                    { id: 1, name: "WiFi", icon: "wifi", available: true },
                    { id: 2, name: "Parking", icon: "parking", available: true },
                    { id: 3, name: "Swimming Pool", icon: "pool", available: true },
                    { id: 4, name: "Gym/Fitness Center", icon: "fitness", available: true },
                    { id: 5, name: "Air Conditioning", icon: "ac", available: true },
                    { id: 6, name: "Modern Kitchen", icon: "kitchen", available: true },
                    { id: 7, name: "Cable TV", icon: "tv", available: true },
                    { id: 8, name: "Laundry Service", icon: "laundry", available: true },
                    { id: 9, name: "24/7 Security", icon: "security", available: true },
                    { id: 10, name: "Balcony/Terrace", icon: "balcony", available: true },
                    { id: 11, name: "Pet Friendly", icon: "pets", available: false },
                    { id: 12, name: "Elevator Access", icon: "elevator", available: true },
                  ]
                ).map((amenity) => {
                  // Icon mapping
                  const getAmenityIcon = (iconName) => {
                    const iconMap = {
                      wifi: Wifi,
                      parking: LocalParking,
                      pool: Pool,
                      fitness: FitnessCenter,
                      ac: AcUnit,
                      kitchen: Kitchen,
                      tv: Tv,
                      laundry: LocalLaundryService,
                      security: Security,
                      balcony: Balcony,
                      pets: Pets,
                      elevator: Elevator,
                    };
                    return iconMap[iconName] || CheckCircle;
                  };

                  const IconComponent = getAmenityIcon(amenity.icon);

                  return (
                    <div
                      key={amenity.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        amenity.available
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "bg-gray-50 border-gray-200 opacity-50"
                      }`}
                    >
                      <IconComponent
                        sx={{
                          fontSize: "1.5rem",
                          color: amenity.available ? "#16a34a" : "#9ca3af",
                        }}
                      />
                      <div className="flex-1">
                        <Typography
                          variant="body2"
                          className={`font-semibold ${
                            amenity.available ? "text-gray-800" : "text-gray-500"
                          }`}
                        >
                          {amenity.name}
                        </Typography>
                      </div>
                      {amenity.available && (
                        <CheckCircle sx={{ fontSize: "1rem", color: "#16a34a" }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Additional Features */}
              {estatePropertyData?.additionalFeatures && (
                <div className="mt-6 px-2">
                  <Typography variant="h6" className="font-semibold mb-3">
                    Additional Features
                  </Typography>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Typography variant="body2" className="text-gray-700 leading-relaxed">
                      {estatePropertyData.additionalFeatures}
                    </Typography>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white px-6 py-4 mt-4 shadow-md">
              <h2 className="text-xl font-bold px-2">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 px-2">
                {estatePropertyData?.listingImages?.map((img, index) => (
                  <div
                    key={img?.public_id}
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setGalleryOpen(true)}
                  >
                    <img
                      src={img?.url}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-[130px] rounded-8 gap-4 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Image Gallery Modal */}
            <ImageGalleryView
              open={galleryOpen}
              onClose={() => setGalleryOpen(false)}
              images={estatePropertyData?.listingImages || []}
              propertyData={{
                title: estatePropertyData?.title,
                shortDescription: estatePropertyData?.shortDescription,
                rating: 4.3,
                reviewCount: 24,
              }}
            />
            <div className="bg-white px-6 py-4 mt-4 shadow-md">
              <ProductDetailsInfo
                // data={estatePropertyData}
                propertyData={{
                  title: estatePropertyData?.title,
                  description: estatePropertyData?.description,
                  shortDescription: estatePropertyData?.shortDescription,
                  rating: 4.3,
                  reviewCount: 24,
                }}
              />
            </div>

            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoContent;

const ProductDetailsInfo = ({
  // data,
  propertyData,
  // totalReviewsLength,
  // averageRating,
}) => {
  const user = useAppSelector(selectUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const [active, setActive] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  // Mock reviews data - Replace with actual data from props or API
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: "Authentiano Emmasan",
      authorImage: "https://placehold.co/40x40",
      timeAgo: "3d",
      content: "What's the best source for learning next js",
      likes: 0,
      isAuthor: false,
      replies: [
        {
          id: 1,
          author: "Abdullah Abimbola",
          authorImage: "https://placehold.co/40x40",
          timeAgo: "5h",
          content:
            "you can use YouTube. It's not a big deal if your JavaScript foundation is solid",
          isAuthor: true,
        },
      ],
    },
  ]);

  const handleSubmitComment = () => {
    if (comment.trim() || rating > 0) {
      // Here you would typically call an API to submit the review
      const newReview = {
        id: reviews.length + 1,
        author: "Current User", // Replace with actual user data
        authorImage: "https://placehold.co/40x40",
        timeAgo: "Just now",
        content: comment,
        rating: rating,
        likes: 0,
        replies: [],
        isAuthor: false,
      };
      setReviews([newReview, ...reviews]);
      setComment("");
      setRating(0);
    }
  };

  return (
    <div className="px-2 py-2 rounded mb-10">
      <div className="w-full flex justify-between border-b pt-10 pb-2 space-x-4 px-2">
        <div className="relative ">
          <h5
            className={
              "text-[#000] text-[14px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"
            }
            onClick={() => setActive(1)}
          >
            Description
          </h5>
          {active === 1 ? <div className={`${siteStyle.active_indicator}`} /> : null}
        </div>
        <div className="relative">
          <h5
            className={
              "text-[#000] text-[14px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"
            }
            onClick={() => setActive(2)}
          >
            Apartment Reviews
          </h5>
          {active === 2 ? <div className={`${siteStyle.active_indicator}`} /> : null}
        </div>
      </div>
      {active === 1 ? (
        <>
          <div
            className={`${isMobile ? "w-full" : "w-1/1"} bg-white flex flex-col ${isMobile ? "h-[60vh]" : ""}`}
          >
            <div className={`${isMobile ? "p-3" : "p-6"} border-b`}>
              <Typography variant={isMobile ? "caption" : "body2"} className="text-gray-600 mb-2">
                {propertyData?.description}
              </Typography>
            </div>
          </div>
        </>
      ) : null}

      {active === 2 ? (
        <div
          className={`${isMobile ? "w-full" : "w-1/1"} bg-white flex flex-col ${isMobile ? "h-[60vh]" : ""}`}
        >
          {user?.email && (
            <>
              {/* Add Comment Section */}
              <div className={`${isMobile ? "p-3" : "p-6"} border-b bg-gray-50`}>
                <Typography
                  variant={isMobile ? "caption" : "subtitle2"}
                  className="font-semibold mb-2"
                >
                  Add a comment
                </Typography>
                <div className={`${isMobile ? "mb-2" : "mb-3"}`}>
                  <Typography
                    variant={isMobile ? "caption" : "body2"}
                    className="text-gray-700 mb-1"
                  >
                    Your Rating
                  </Typography>
                  <Rating
                    value={rating}
                    onChange={(_, newValue) => setRating(newValue)}
                    size={isMobile ? "small" : "large"}
                  />
                </div>
                <div className={`flex ${isMobile ? "gap-1" : "gap-2"}`}>
                  <Avatar
                    sx={{
                      width: isMobile ? 28 : 32,
                      height: isMobile ? 28 : 32,
                      fontSize: isMobile ? "0.875rem" : "1rem",
                    }}
                  >
                    U
                  </Avatar>
                  <div className="flex-1">
                    <TextField
                      fullWidth
                      multiline
                      rows={isMobile ? 1 : 2}
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                      }}
                    />
                    <div
                      className={`flex items-center justify-between ${isMobile ? "mt-1" : "mt-2"}`}
                    >
                      {!isMobile && (
                        <div className="flex gap-2">
                          <IconButton size="small">😊</IconButton>
                          <IconButton size="small">📷</IconButton>
                        </div>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<Send fontSize="small" />}
                        onClick={handleSubmitComment}
                        disabled={!comment.trim() && rating === 0}
                        sx={{
                          backgroundColor: "#ea580c",
                          "&:hover": {
                            backgroundColor: "#c2410c",
                          },
                          textTransform: "none",
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          marginLeft: isMobile ? "auto" : 0,
                        }}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews/Comments List */}
              <div className={`flex-1 overflow-y-auto ${isMobile ? "p-3" : "p-6"}`}>
                <div
                  className={`flex items-center justify-between ${isMobile ? "mb-2" : "mb-4"} px-2`}
                >
                  <Typography
                    variant={isMobile ? "caption" : "subtitle2"}
                    className="font-semibold"
                  >
                    Comments ({reviews.length})
                  </Typography>
                  <select
                    className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 border-none outline-none cursor-pointer`}
                  >
                    <option>Most relevant</option>
                    <option>Newest first</option>
                    <option>Oldest first</option>
                  </select>
                </div>

                <div className={`${isMobile ? "space-y-2" : "space-y-4"}`}>
                  {reviews.map((review) => (
                    <div key={review.id} className={`${isMobile ? "space-y-1" : "space-y-2"}`}>
                      <div className={`flex ${isMobile ? "gap-2" : "gap-3"}`}>
                        <Avatar
                          src={review.authorImage}
                          alt={review.author}
                          sx={{
                            width: isMobile ? 32 : 40,
                            height: isMobile ? 32 : 40,
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Typography
                              variant={isMobile ? "caption" : "body2"}
                              className="font-semibold"
                            >
                              {review.author}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="text-gray-500"
                              sx={{
                                fontSize: isMobile ? "0.65rem" : "0.75rem",
                              }}
                            >
                              • {review.timeAgo}
                            </Typography>
                            {review.isAuthor && (
                              <span
                                className={`${isMobile ? "text-[10px]" : "text-xs"} bg-orange-100 text-orange-600 px-2 py-0.5 rounded`}
                              >
                                Author
                              </span>
                            )}
                          </div>
                          {review.rating && (
                            <Rating value={review.rating} readOnly size="small" className="mb-1" />
                          )}
                          <Typography
                            variant={isMobile ? "caption" : "body2"}
                            className="text-gray-700"
                          >
                            {review.content}
                          </Typography>
                          <div
                            className={`flex items-center ${isMobile ? "gap-2 mt-1" : "gap-4 mt-2"}`}
                          >
                            <button
                              className={`flex items-center gap-1 text-gray-600 hover:text-orange-600 ${isMobile ? "text-xs" : "text-sm"}`}
                            >
                              <ThumbUp fontSize="small" sx={{ fontSize: isMobile ? 14 : 16 }} />
                              <span>{review.likes > 0 ? review.likes : "Like"}</span>
                            </button>
                            <button
                              className={`flex items-center gap-1 text-gray-600 hover:text-orange-600 ${isMobile ? "text-xs" : "text-sm"}`}
                            >
                              <Reply fontSize="small" sx={{ fontSize: isMobile ? 14 : 16 }} />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Nested Replies */}
                      {review.replies && review.replies.length > 0 && (
                        <div
                          className={`${isMobile ? "ml-8 space-y-2 mt-2" : "ml-12 space-y-3 mt-3"}`}
                        >
                          {review.replies.map((reply) => (
                            <div key={reply.id} className={`flex ${isMobile ? "gap-2" : "gap-3"}`}>
                              <Avatar
                                src={reply.authorImage}
                                alt={reply.author}
                                sx={{
                                  width: isMobile ? 28 : 32,
                                  height: isMobile ? 28 : 32,
                                }}
                              />
                              <div className="flex-1">
                                <div
                                  className={`flex items-center ${isMobile ? "gap-1" : "gap-2"} mb-1`}
                                >
                                  <Typography
                                    variant={isMobile ? "caption" : "body2"}
                                    className="font-semibold"
                                    sx={{
                                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                                    }}
                                  >
                                    {reply.author}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    className="text-gray-500"
                                    sx={{
                                      fontSize: isMobile ? "0.65rem" : "0.75rem",
                                    }}
                                  >
                                    • {reply.timeAgo}
                                  </Typography>
                                  {reply.isAuthor && (
                                    <span
                                      className={`${isMobile ? "text-[10px]" : "text-xs"} bg-orange-100 text-orange-600 px-2 py-0.5 rounded`}
                                    >
                                      Author
                                    </span>
                                  )}
                                </div>
                                <Typography
                                  variant={isMobile ? "caption" : "body2"}
                                  className="text-gray-700"
                                  sx={{
                                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                                  }}
                                >
                                  {reply.content}
                                </Typography>
                                <div
                                  className={`flex items-center ${isMobile ? "gap-2" : "gap-4"} mt-1`}
                                >
                                  <button
                                    className={`text-gray-600 hover:text-orange-600 ${isMobile ? "text-[10px]" : "text-xs"}`}
                                  >
                                    Like
                                  </button>
                                  <button
                                    className={`text-gray-600 hover:text-orange-600 ${isMobile ? "text-[10px]" : "text-xs"}`}
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Divider />
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full flex justify-center">
                {propertyData && propertyData?.reviews?.length === 0 && (
                  <h5>No Reviews have for this product!</h5>
                )}
              </div>
            </>
          )}

          {!user?.email && (
            <>
              <div className={`${isMobile ? "p-3" : "p-6"} border-b`}>
                <div className="mb-2 px-2">
                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    className="font-bold text-gray-900"
                  >
                    {propertyData?.title || "Property Details"}
                  </Typography>
                </div>
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  className="text-gray-600 mb-2 px-2"
                >
                  {propertyData?.shortDescription || "Share your thoughts about this property"}
                </Typography>
                {propertyData?.rating && (
                  <div className="flex items-center gap-2 px-2">
                    <Rating value={propertyData.rating} readOnly size="small" />
                    <Typography variant={isMobile ? "caption" : "body2"} className="text-gray-600">
                      {propertyData.rating} ({propertyData.reviewCount || 0} reviews)
                    </Typography>
                  </div>
                )}

                <Typography variant="body2" className="text-gray-600 px-2">
                  Please sign in to leave a review.
                </Typography>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};
