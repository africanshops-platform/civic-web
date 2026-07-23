import { Box, Paper, Avatar, Typography, Chip } from "@mui/material";
import { Verified, Email, Phone } from "@mui/icons-material";

/**
 * RealtorProfile — shows the real listing shop (merchant) fetched via the
 * public merchant-preview route. property.shop is a merchant id, not a
 * "realtor" — there's no separate realtor/agent entity in this schema, and
 * no network-stats concept (connections/followers/views) for a shop, so
 * those are shown only when real, never invented.
 */
const RealtorProfile = ({ realtor }) => {
  if (!realtor) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Paper className="overflow-hidden p-6 text-center">
          <Typography variant="body2" className="text-gray-500">
            Listing agent details unavailable
          </Typography>
        </Paper>
      </Box>
    );
  }

  const name = realtor.shopname || "Listing Agent";

  return (
    <Box className="relative" sx={{ display: "flex", flexDirection: "column" }}>
      <Paper className="overflow-hidden" sx={{ display: "flex", flexDirection: "column" }}>
        {/* Header Banner */}
        <Box
          className="h-24 relative"
          sx={{ background: "linear-gradient(135deg, #ea580c 0%, #fb923c 100%)" }}
        >
          <Avatar
            src={realtor.coverimage || undefined}
            alt={name}
            sx={{
              width: 80,
              height: 80,
              position: "absolute",
              bottom: -40,
              left: "50%",
              transform: "translateX(-50%)",
              border: "4px solid white",
              bgcolor: "#9ca3af",
              fontSize: "2rem",
            }}
          >
            {name.charAt(0)}
          </Avatar>
        </Box>

        {/* Profile Content */}
        <Box className="pb-6 px-4" sx={{ marginTop: "50px", padding: "16px" }}>
          <Box className="flex items-center justify-center gap-1.5">
            <Typography variant="h5" className="text-center font-semibold" sx={{ fontSize: "1.3rem" }}>
              {name}
            </Typography>
            {realtor.verified && <Verified sx={{ fontSize: 20, color: "#2563eb" }} />}
          </Box>

          <Chip
            label={realtor.verified ? "Verified Listing Agent" : "Listing Agent"}
            size="small"
            className="mt-2"
            sx={{
              display: "flex",
              mx: "auto",
              backgroundColor: realtor.verified ? "#dbeafe" : "#f3f4f6",
              color: realtor.verified ? "#1d4ed8" : "#4b5563",
              fontWeight: 600,
            }}
          />

          {realtor.shopbio && (
            <Typography variant="body2" className="text-center text-gray-600 mt-3">
              {realtor.shopbio}
            </Typography>
          )}

          {(realtor.shopemail || realtor.shopphone) && (
            <Box className="mt-4 space-y-2">
              {realtor.shopemail && (
                <Box className="flex items-center justify-center gap-2 text-gray-700">
                  <Email sx={{ fontSize: 18, color: "#ea580c" }} />
                  <Typography variant="body2">{realtor.shopemail}</Typography>
                </Box>
              )}
              {realtor.shopphone && (
                <Box className="flex items-center justify-center gap-2 text-gray-700">
                  <Phone sx={{ fontSize: 18, color: "#ea580c" }} />
                  <Typography variant="body2">{realtor.shopphone}</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RealtorProfile;
