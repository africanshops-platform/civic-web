import React from "react";
import { Typography, Divider } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * Civic footer. Deliberately minimal: our own brand, the legal links that exist, and the standing
 * "not a government service" disclosure (Play policy, 2026-10). No template columns, no social icons
 * until real AfricanShops accounts exist, and no third-party hotlinked images.
 */
const NOT_GOVERNMENT_DISCLAIMER =
  "AfricanShops Civic is an independent community platform operated by SCANAFRIQUE LTD. It is not a government " +
  "entity, is not affiliated with, endorsed by, or acting for any government or government agency, and does not " +
  "provide or facilitate government services.";

const FooterAfricanshops = () => {
  return (
    <footer
      className="text-white"
      style={{
        background: "linear-gradient(to bottom right, #111827, #1f2937, #000000)",
      }}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <Link
              to="/"
              className="inline-flex items-center space-x-3 group"
              style={{ textDecoration: "none" }}
            >
              <img
                src="assets/images/afslogo/civic-logo.png"
                width={48}
                height={48}
                alt="AfricanShops Civic logo"
                className="transition-transform group-hover:scale-110 duration-300"
              />
              <Typography className="text-xl font-bold text-white hover:text-orange-500 transition-colors duration-300">
                AfricanShops Civic
              </Typography>
            </Link>

            <Typography className="text-gray-400 leading-relaxed">
              A community platform for local participation: subscriptions, community projects, safety
              reports and youth sports.
            </Typography>

            <Typography className="text-gray-500 text-sm leading-relaxed">
              {NOT_GOVERNMENT_DISCLAIMER}
            </Typography>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/terms"
              className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-300"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            {/* Careers lives on the marketplace app (civic-web has no admin dashboard behind it to
                review applications against), same real login/apply flow as every other AfricanShops
                account. */}
            <a
              href={`${import.meta.env.VITE_AFSHO_USERSPORTAL_URL}/careers`}
              className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-300"
            >
              Careers
            </a>
          </div>
        </div>
      </div>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-6">
        <Typography className="text-gray-400 text-sm text-center md:text-left">
          © {new Date().getFullYear()} SCANAFRIQUE LTD. All rights reserved.
        </Typography>
      </div>
    </footer>
  );
};

export default FooterAfricanshops;
