import _ from "@lodash";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PaystackButton } from "react-paystack";
import { toast } from "react-toastify";
import { usePayAndPlaceFoodOrder } from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "../../../../auth/user/store/userSlice";
import {
  calculateCartTotalAmount,
  formatCurrency,
  generateClientUID,
  getFoodVendorSession,
} from "../../../vendors-shop/PosUtils";

// Haversine distance in kilometres
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Distance-based shipping tiers (placeholder — replace with API lookup)
const SHIPPING_RATES = [
  { min: 0,   max: 10,       price: 500,  label: "Within City" },
  { min: 10,  max: 50,       price: 1500, label: "Nearby Areas" },
  { min: 50,  max: 150,      price: 3000, label: "Same Region" },
  { min: 150, max: 300,      price: 5000, label: "Neighbouring States" },
  { min: 300, max: Infinity, price: 8000, label: "Long Distance" },
];

// State-centre coordinates for origin estimate (placeholder — replace with API)
const STATE_COORDS = {
  1: { lat: 6.5244,  lng: 3.3792,  name: "Lagos" },
  2: { lat: 9.082,   lng: 8.6753,  name: "Abuja" },
  3: { lat: 7.3775,  lng: 3.947,   name: "Ibadan" },
  4: { lat: 6.335,   lng: 5.6037,  name: "Benin City" },
  5: { lat: 5.0162,  lng: 7.9333,  name: "Enugu" },
};

// Country VAT rates (placeholder — replace with API)
const VAT_RATES = {
  1: { rate: 0.075, name: "Nigeria",      label: "VAT (7.5%)" },
  2: { rate: 0.05,  name: "Ghana",        label: "VAT (5%)" },
  3: { rate: 0.16,  name: "Kenya",        label: "VAT (16%)" },
  4: { rate: 0.18,  name: "South Africa", label: "VAT (18%)" },
};

function FoodCartSummaryAndPay({
  cartSession,
  intemsInCart,
  methodOfPay,
  name,
  phone,
  address,
  orderCountryDestination,
  orderStateProvinceDestination,
  orderLgaDestination,
  orderMarketPickupDestination,
  district,
  selectedMarketData,
  dirtyFields,
  isValid,
  setIsProcessingPayment,
}) {
  const user = useAppSelector(selectUser);

  const [deliveryFee, setDeliveryFee] = useState(1000);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [deliveryLabel, setDeliveryLabel] = useState("Standard Delivery");

  // Build subtotal from cart items
  const checkItemsArray = (intemsInCart || []).map((el) => ({
    quantity: el?.quantity,
    price: el?.martMenu?.price ?? el?.price ?? 0,
  }));
  const subtotal = calculateCartTotalAmount(checkItemsArray);

  // Distance-based delivery fee
  useEffect(() => {
    if (selectedMarketData?.lat && selectedMarketData?.lng) {
      const origin =
        STATE_COORDS[cartSession?.stateId] ||
        STATE_COORDS[orderStateProvinceDestination] ||
        STATE_COORDS[1]; // default Lagos
      const km = haversineKm(
        origin.lat, origin.lng,
        parseFloat(selectedMarketData.lat),
        parseFloat(selectedMarketData.lng),
      );
      const tier = SHIPPING_RATES.find((r) => km >= r.min && km < r.max);
      if (tier) {
        setDeliveryFee(tier.price);
        setDeliveryDistance(Math.round(km));
        setDeliveryLabel(tier.label);
      }
    } else {
      setDeliveryFee(1000);
      setDeliveryDistance(0);
      setDeliveryLabel("Standard Delivery");
    }
  }, [selectedMarketData, cartSession?.stateId, orderStateProvinceDestination]);

  // VAT
  const taxInfo =
    VAT_RATES[orderCountryDestination] || VAT_RATES[1];
  const vatAmount = Math.round(subtotal * taxInfo.rate);

  const grandTotal = parseInt(subtotal || 0, 10) + parseInt(deliveryFee, 10) + parseInt(vatAmount, 10);

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const { mutate: verifyPaymentAndCreateOrder, isLoading: payFoodLoading } =
    usePayAndPlaceFoodOrder();

  useEffect(() => {
    if (setIsProcessingPayment) setIsProcessingPayment(payFoodLoading);
  }, [payFoodLoading, setIsProcessingPayment]);

  const onSuccess = async (paystackResponse) => {
    try {
      const payloadData = getFoodVendorSession();
      const orderData = {
        //|| generateClientUID()
        refOrderId: `AFSHFMKT${cartSession?.id}`,
        foodCartItems: intemsInCart,
        itemsPrice: parseInt(subtotal, 10),
        shippingPrice: deliveryFee,
        taxPrice: vatAmount,
        totalPrice: grandTotal,
        orderCountryDestination,
        orderStateProvinceDestination,
        orderLgaDestination,
        orderMarketPickupDestination,
        district,
        paymentMethod: methodOfPay,
        shoppingLgaSession: payloadData?.shopLgaProvinceOrigin,
        paymentResult: paystackResponse,
        shippingAddress: { fullName: name, phone, address },
        foodMart: payloadData?.foodMartId,
        reference: paystackResponse?.reference,
      };
      verifyPaymentAndCreateOrder(orderData);
    } catch (err) {
      console.error("Food payment error:", err);
      toast.error("Payment failed. Please try again.");
    }
  };

  const onClose = () => {
    // Handled by parent dialog — no action needed here
  };

  const isFormIncomplete =
    _.isEmpty(dirtyFields) ||
    !isValid ||
    !name ||
    !phone ||
    !address ||
    !orderCountryDestination ||
    !orderStateProvinceDestination ||
    !orderLgaDestination ||
    !district ||
    !orderMarketPickupDestination;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col"
      style={{ border: "2px solid rgba(234,88,12,0.15)" }}
    >
      {/* Header */}
      <div
        className="p-4 sm:p-6 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <span style={{ fontSize: "1.5rem" }}>🍽️</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Food Order Summary</h2>
            <p className="text-xs sm:text-sm text-white/80">Review before placing your order</p>
          </div>
        </div>
      </div>

      {/* Body — scrollable */}
      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">

        {/* Items count badge */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, rgba(234,88,12,0.02) 100%)",
            border: "1px solid rgba(234,88,12,0.15)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Items in Cart</span>
            </div>
            <span className="text-base font-bold text-orange-600">
              {intemsInCart?.length || 0}
            </span>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-800">₦{formatCurrency(subtotal)}</span>
          </div>

          {/* Delivery fee with distance tooltip */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Delivery Fee</span>
              {deliveryDistance > 0 && (
                <div className="group relative">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    {deliveryLabel} (~{deliveryDistance} km)
                  </div>
                </div>
              )}
            </div>
            <span className="font-semibold text-gray-800">₦{formatCurrency(deliveryFee)}</span>
          </div>

          {/* VAT with country tooltip */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{taxInfo.label}</span>
              <div className="group relative">
                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                  Applied based on {taxInfo.name}
                </div>
              </div>
            </div>
            <span className="font-semibold text-gray-800">₦{formatCurrency(vatAmount)}</span>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

          {/* Grand total */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-gray-800">Total</span>
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

        {/* Promo code */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Promo code"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-sm"
          />
          <button
            type="button"
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.1) 100%)",
              color: "#ea580c",
              border: "2px solid rgba(234,88,12,0.2)",
            }}
          >
            APPLY
          </button>
        </div>

        {/* Payment buttons */}
        <div className="space-y-3">

          {/* Paystack */}
          {methodOfPay === "PAYSTACK" && (
            <div className="relative">
              <style>{`
                .food-paystack-enabled:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(234,88,12,0.5) !important;
                }
                .food-paystack-enabled:active { transform: translateY(0); }
              `}</style>
              <PaystackButton
                text={`🔒 Pay ₦${formatCurrency(grandTotal)}`}
                className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${isFormIncomplete ? "" : "food-paystack-enabled"}`}
                style={{
                  background: isFormIncomplete
                    ? "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)"
                    : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: isFormIncomplete ? "#9ca3af" : "white",
                  border: "none",
                  cursor: isFormIncomplete ? "not-allowed" : "pointer",
                  boxShadow: isFormIncomplete ? "none" : "0 4px 15px rgba(234,88,12,0.4)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                reference={`AFSHFMKT${cartSession?.id || generateClientUID()}`}
                email={user?.email}
                amount={grandTotal * 100}
                publicKey={publicKey}
                onSuccess={(ref) => onSuccess(ref)}
                onClose={() => onClose()}
                disabled={isFormIncomplete || payFoodLoading}
              />
              {isFormIncomplete && (
                <div className="mt-3 text-center">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs text-red-700 font-semibold">
                      Please complete all required fields
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flutterwave */}
          {methodOfPay === "FLUTTERWAVE" && (
            <button
              type="button"
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(234,88,12,0.4)",
              }}
            >
              🔒 Pay with Flutterwave ₦{formatCurrency(grandTotal)}
            </button>
          )}

          {/* Pay on Delivery */}
          {methodOfPay === "PAYONDELIVERY" && (
            <button
              type="button"
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(234,88,12,0.4)",
              }}
            >
              Pay on Delivery ₦{formatCurrency(grandTotal)}
            </button>
          )}
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
}

export default FoodCartSummaryAndPay;
