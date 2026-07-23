import { CircularProgress, Skeleton, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { MapOutlined, LocationOnOutlined } from "@mui/icons-material";

/**
 * MapLoadingPlaceholder Component
 * Beautiful loading state for the map sidebar
 */
function MapLoadingPlaceholder() {
  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{
        background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)",
      }}
    >
      {/* Header */}
      <div
        className="mb-6 p-4 rounded-xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
        }}
      >
        <MapOutlined sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "white",
          }}
        >
          Property Locations
        </Typography>
      </div>

      {/* Map Loading Container */}
      <div
        className="flex-1 rounded-2xl overflow-hidden shadow-2xl relative"
        style={{
          background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #bfdbfe 100%)",
        }}
      >
        {/* Animated Map Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(0deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Location Pins Animation */}
        {[1, 2, 3, 4, 5].map((pin, index) => (
          <motion.div
            key={pin}
            className="absolute"
            style={{
              top: `${20 + index * 15}%`,
              left: `${15 + index * 20}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3,
            }}
          >
            <LocationOnOutlined
              sx={{
                fontSize: "2.5rem",
                color: "#3b82f6",
                filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))",
              }}
            />
          </motion.div>
        ))}

        {/* Center Loading Indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 0.5,
            }}
            className="flex flex-col items-center gap-6"
          >
            {/* Circular Progress with Map Icon */}
            <div className="relative">
              <CircularProgress
                size={100}
                thickness={3}
                sx={{
                  color: "#3b82f6",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapOutlined
                  sx={{
                    fontSize: "2.5rem",
                    color: "#2563eb",
                  }}
                />
              </div>
            </div>

            {/* Loading Text */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#2563eb",
                  textAlign: "center",
                }}
              >
                Loading Map...
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  color: "#6b7280",
                  textAlign: "center",
                  marginTop: "8px",
                }}
              >
                Pinpointing property locations
              </Typography>
            </motion.div>
          </motion.div>
        </div>

        {/* Map Legend Skeleton */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton
                variant="circular"
                width={12}
                height={12}
                sx={{ backgroundColor: "rgba(59, 130, 246, 0.3)" }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={20}
                sx={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton
                variant="circular"
                width={12}
                height={12}
                sx={{ backgroundColor: "rgba(59, 130, 246, 0.3)" }}
              />
              <Skeleton
                variant="text"
                width="50%"
                height={20}
                sx={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
        <Skeleton
          variant="text"
          width="80%"
          height={20}
          sx={{
            backgroundColor: "rgba(107, 114, 128, 0.2)",
            margin: "0 auto",
          }}
        />
      </div>
    </div>
  );
}

export default MapLoadingPlaceholder;
