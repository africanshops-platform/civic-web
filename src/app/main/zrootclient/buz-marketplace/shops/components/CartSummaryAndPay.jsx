import _ from "@lodash";
import { Button, Typography, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { usePayAndPlaceOrder } from "app/configs/data/server-calls/auth/userapp/a_marketplace/useProductsRepo";
import { useAppSelector } from "app/store/hooks";
import { PaystackButton } from "react-paystack";
import { toast } from "react-toastify";
import { selectUser } from "src/app/auth/user/store/userSlice";
import {
  calculateCartTotalAmount,
  formatCurrency,
  generateClientUID,
  getShoppingSession,
} from "src/app/main/vendors-shop/PosUtils";
import { useState, useEffect } from "react";

/**
 * Placeholder function to calculate distance between two coordinates
 * This will be replaced with actual distance calculation using Haversine formula or API
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  // Haversine formula for calculating distance between two coordinates
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

/**
 * Placeholder shipping rates table
 * This will be replaced with API call to fetch shipping rates from database
 * Structure: { minDistance: number, maxDistance: number, price: number }
 */
const PLACEHOLDER_SHIPPING_RATES = [
  { minDistance: 0, maxDistance: 10, price: 500, label: "Within City" },
  { minDistance: 10, maxDistance: 50, price: 1500, label: "Nearby Cities" },
  { minDistance: 50, maxDistance: 150, price: 3000, label: "Same Region" },
  { minDistance: 150, maxDistance: 300, price: 5000, label: "Neighboring States" },
  { minDistance: 300, maxDistance: Infinity, price: 8000, label: "Far Distance" },
];

/**
 * Placeholder state coordinates
 * This will be replaced with API call to fetch state coordinates by ID
 */
const PLACEHOLDER_STATE_COORDINATES = {
  1: { lat: 6.5244, lng: 3.3792, name: "Lagos" }, // Lagos
  2: { lat: 9.082, lng: 8.6753, name: "Abuja" }, // Abuja
  3: { lat: 7.3775, lng: 3.947, name: "Ibadan" }, // Oyo
  4: { lat: 6.335, lng: 5.6037, name: "Benin City" }, // Edo
  5: { lat: 5.0162, lng: 7.9333, name: "Enugu" }, // Enugu
  // Add more states as needed
};

/**
 * Placeholder country tax rates
 * This will be replaced with API call to fetch tax rates by country
 */
const PLACEHOLDER_TAX_RATES = {
  1: { rate: 0.075, name: "Nigeria", label: "VAT (7.5%)" }, // Nigeria - 7.5% VAT
  2: { rate: 0.05, name: "Ghana", label: "VAT (5%)" }, // Ghana - 5% VAT
  3: { rate: 0.16, name: "Kenya", label: "VAT (16%)" }, // Kenya - 16% VAT
  4: { rate: 0.18, name: "South Africa", label: "VAT (18%)" }, // South Africa - 18% VAT
  // Add more countries as needed
};

const CartSummaryAndPay = ({
  cartSessionPayload,
  methodOfPay,
  name,
  phone,
  address,
  orderCountryDestination,
  orderStateProvinceDestination,
  orderLgaDestination,
  orderMarketPickupDestination,
  selectedMarketData, // Add this prop to receive selected market data
  dirtyFields,
  isValid,
  setIsProcessingPayment,
}) => {
  console.log("CartSummaryAndPay render with cartSessionPayload:", cartSessionPayload);
  const user = useAppSelector(selectUser);

  // State for calculated delivery fee
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [deliveryLabel, setDeliveryLabel] = useState("");

  // Calculate cart subtotal
  let checkItemsArrayForTotal = [];
  cartSessionPayload?.cartProducts?.forEach((element) => {
    // Check if this is a bulk order and use the bulk price tier
    let itemPrice = element?.product?.price;

    if (element?.isBulkOrder && element?.bulkPriceTierId) {
      // Find the matching price tier from product's priceTiers array
      const matchingTier = element?.product?.priceTiers?.find(
        (tier) => (tier?.id || tier?._id) === element?.bulkPriceTierId,
      );

      if (matchingTier) {
        itemPrice = matchingTier?.price;
      }
    }

    checkItemsArrayForTotal?.push({
      quantity: element?.quantity,
      price: itemPrice,
    });
  });

  const subtotal = calculateCartTotalAmount(checkItemsArrayForTotal);

  // Calculate delivery fee based on distance
  useEffect(() => {
    if (selectedMarketData && cartSessionPayload?.stateId) {
      // Get shopping state coordinates (placeholder - will be from API)
      const shoppingStateCoords =
        PLACEHOLDER_STATE_COORDINATES[cartSessionPayload.stateId] ||
        PLACEHOLDER_STATE_COORDINATES[1]; // Default to Lagos

      // Get selected market coordinates
      const marketLat = parseFloat(selectedMarketData.lat);
      const marketLng = parseFloat(selectedMarketData.lng);
      const stateLat = shoppingStateCoords.lat;
      const stateLng = shoppingStateCoords.lng;

      // Calculate distance between shopping state and delivery market
      const distance = calculateDistance(stateLat, stateLng, marketLat, marketLng);

      // Find appropriate shipping rate based on distance
      const shippingRate = PLACEHOLDER_SHIPPING_RATES.find(
        (rate) => distance >= rate.minDistance && distance < rate.maxDistance,
      );

      if (shippingRate) {
        setDeliveryFee(shippingRate.price);
        setDeliveryDistance(Math.round(distance));
        setDeliveryLabel(shippingRate.label);
      }
    } else {
      // No market selected, use default delivery fee
      setDeliveryFee(1000);
      setDeliveryDistance(0);
      setDeliveryLabel("Standard Delivery");
    }
  }, [selectedMarketData, cartSessionPayload?.stateId]);

  // Calculate VAT based on country (placeholder - will be from API)
  const getTaxRate = () => {
    if (orderCountryDestination) {
      return PLACEHOLDER_TAX_RATES[orderCountryDestination] || PLACEHOLDER_TAX_RATES[1]; // Default to Nigeria
    }
    return PLACEHOLDER_TAX_RATES[1]; // Default to Nigeria
  };

  const taxInfo = getTaxRate();
  const vatAmount = Math.round(subtotal * taxInfo.rate);

  // Calculate grand total
  const grandTotal = parseInt(subtotal) + parseInt(deliveryFee) + parseInt(vatAmount);

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  const { mutate: verifyPaymentAndCreateOrder, isLoading: loadingWhilePaying } =
    usePayAndPlaceOrder();

  // Update the processing payment state when mutation is loading
  useEffect(() => {
    if (setIsProcessingPayment) {
      setIsProcessingPayment(loadingWhilePaying);
    }
  }, [loadingWhilePaying, setIsProcessingPayment]);

  const onSuccess = async (paystackResponse) => {
    try {
      const oderData = {
        refOrderId: "AFSH" + cartSessionPayload?.id + "MKT",
        cartItems: cartSessionPayload?.cartProducts,

        itemsPrice: parseInt(subtotal),
        shippingPrice: deliveryFee,
        taxPrice: vatAmount,
        totalPrice: grandTotal,

        orderCountryDestination: orderCountryDestination,
        orderStateProvinceDestination: orderStateProvinceDestination,
        orderLgaDestination: orderLgaDestination,
        orderMarketPickupDestination: orderMarketPickupDestination,

        paymentMethod: methodOfPay,
        shoppingCountrySession: cartSessionPayload?.countryId,
        shoppingStateSession: cartSessionPayload?.stateId,
        shoppingLgaSession: cartSessionPayload?.lgaId,
        shoppingDistrictSession: cartSessionPayload?.districtId,
        paymentResult: paystackResponse,
        shippingAddress: {
          fullName: name,
          phone: phone,
          address: address,
        },
        reference: paystackResponse?.reference,
      };

      verifyPaymentAndCreateOrder(oderData);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  const onClose = () => {
    // This will be handled by the payment close dialog in CartReview
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col"
      style={{
        border: "2px solid rgba(234, 88, 12, 0.15)",
      }}
    >
      {/* Header with Gradient */}
      <div
        className="p-4 sm:p-6"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Order Summary</h2>
            <p className="text-xs sm:text-sm text-white/80">Review your cart before payment</p>
          </div>
        </div>
      </div>

      {/* Summary Details - Scrollable */}
      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
        {/* Items Count */}
        <div
          className="p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 88, 12, 0.02) 100%)",
            border: "1px solid rgba(234, 88, 12, 0.15)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Items in Cart</span>
            </div>
            <span className="text-base font-bold text-orange-600">
              {cartSessionPayload?.cartProducts?.length || 0}
            </span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-800">₦{formatCurrency(subtotal)}</span>
          </div>

          {/* Delivery Fees with Distance Info */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Delivery Fee</span>
              {deliveryDistance > 0 && (
                <div className="group relative">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    {deliveryLabel} (~{deliveryDistance}km)
                  </div>
                </div>
              )}
            </div>
            <span className="font-semibold text-gray-800">₦{formatCurrency(deliveryFee)}</span>
          </div>

          {/* VAT with Country Info */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{taxInfo.label}</span>
              <div className="group relative">
                <svg
                  className="w-4 h-4 text-gray-400 cursor-help"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                  Applied based on {taxInfo.name}
                </div>
              </div>
            </div>
            <span className="font-semibold text-gray-800">₦{formatCurrency(vatAmount)}</span>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

          {/* Grand Total */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <div className="text-right">
              <span
                className="text-2xl font-extrabold"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ₦{formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Promo code"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-sm"
          />
          <button
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)",
              color: "#ea580c",
              border: "2px solid rgba(234, 88, 12, 0.2)",
            }}
          >
            APPLY
          </button>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-3">
          {/* Paystack Payment */}
          {methodOfPay === "PAYSTACK" && (
            <div className="relative">
              <style>
                {`
                  .paystack-button-enabled:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(234, 88, 12, 0.5) !important;
                  }
                  .paystack-button-enabled:active {
                    transform: translateY(0px);
                  }
                `}
              </style>
              <PaystackButton
                text={`🔒 Pay ₦${formatCurrency(grandTotal)}`}
                className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 ${
                  _.isEmpty(dirtyFields) ||
                  !isValid ||
                  !name ||
                  !phone ||
                  !address ||
                  !orderCountryDestination ||
                  !orderStateProvinceDestination ||
                  !orderLgaDestination ||
                  !orderMarketPickupDestination
                    ? ""
                    : "paystack-button-enabled"
                }`}
                style={{
                  background:
                    _.isEmpty(dirtyFields) ||
                    !isValid ||
                    !name ||
                    !phone ||
                    !address ||
                    !orderCountryDestination ||
                    !orderStateProvinceDestination ||
                    !orderLgaDestination ||
                    !orderMarketPickupDestination
                      ? "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)"
                      : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color:
                    _.isEmpty(dirtyFields) ||
                    !isValid ||
                    !name ||
                    !phone ||
                    !address ||
                    !orderCountryDestination ||
                    !orderStateProvinceDestination ||
                    !orderLgaDestination ||
                    !orderMarketPickupDestination
                      ? "#9ca3af"
                      : "white",
                  border: "none",
                  cursor:
                    _.isEmpty(dirtyFields) ||
                    !isValid ||
                    !name ||
                    !phone ||
                    !address ||
                    !orderCountryDestination ||
                    !orderStateProvinceDestination ||
                    !orderLgaDestination ||
                    !orderMarketPickupDestination
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    _.isEmpty(dirtyFields) ||
                    !isValid ||
                    !name ||
                    !phone ||
                    !address ||
                    !orderCountryDestination ||
                    !orderStateProvinceDestination ||
                    !orderLgaDestination ||
                    !orderMarketPickupDestination
                      ? "none"
                      : "0 4px 15px rgba(234, 88, 12, 0.4)",
                  filter:
                    _.isEmpty(dirtyFields) ||
                    !isValid ||
                    !name ||
                    !phone ||
                    !address ||
                    !orderCountryDestination ||
                    !orderStateProvinceDestination ||
                    !orderLgaDestination ||
                    !orderMarketPickupDestination
                      ? "grayscale(20%)"
                      : "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                reference={"AFSH" + cartSessionPayload?.id + "REF"}
                email={user?.email}
                amount={grandTotal * 100}
                publicKey={publicKey}
                onSuccess={(reference) => onSuccess(reference)}
                onClose={() => onClose()}
                disabled={
                  _.isEmpty(dirtyFields) ||
                  !isValid ||
                  !name ||
                  !phone ||
                  !address ||
                  !orderCountryDestination ||
                  !orderStateProvinceDestination ||
                  !orderLgaDestination ||
                  !orderMarketPickupDestination ||
                  loadingWhilePaying
                }
              />
              {(_.isEmpty(dirtyFields) ||
                !isValid ||
                !name ||
                !phone ||
                !address ||
                !orderCountryDestination ||
                !orderStateProvinceDestination ||
                !orderLgaDestination ||
                !orderMarketPickupDestination) && (
                <div className="mt-3 text-center">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    <svg
                      className="w-4 h-4 text-red-600 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-xs text-red-700 font-semibold">
                      Please complete all required fields to proceed
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flutterwave Payment */}
          {methodOfPay === "FLUTTERWAVE" && (
            <button
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
              }}
            >
              🔒 Pay with Flutterwave ₦{formatCurrency(grandTotal)}
            </button>
          )}

          {/* Pay on Delivery */}
          {methodOfPay === "PAYONDELIVERY" && (
            <button
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
              }}
            >
              Pay on Delivery ₦{formatCurrency(grandTotal)}
            </button>
          )}
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-xs text-gray-600 font-medium">Protected</span>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          By proceeding, you agree to our{" "}
          <span className="text-orange-600 hover:underline cursor-pointer font-medium">
            Terms & Conditions
          </span>{" "}
          and{" "}
          <span className="text-orange-600 hover:underline cursor-pointer font-medium">
            Privacy Policy
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default CartSummaryAndPay;
