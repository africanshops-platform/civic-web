import { Button } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowForward } from "@mui/icons-material";
import useCivicWebAuth from "src/app/hooks/useCivicWebAuth";

/**
 * CivicLandingPage — the real "/" front door for civic-web.
 *
 * Was previously a placeholder `<Navigate to="sign-in" />` (see the TODO this
 * replaced in routesConfig.jsx) — the old "/" belonged to the marketplace's
 * ModernLandingPage, removed in the customer/civic split, and civic-web never
 * got its own. This is that page: a real entry point introducing the civic
 * platform before asking anyone to sign in.
 *
 * Visual language matches the app's existing public landing pages
 * (CivicTaxLandingPage, YouthSportsLandingPage, GovernanceLandingPage, etc.):
 * framer-motion fade/slide-in, the orange brand gradient, clamp()-based fluid
 * type, rounded-24 warm cards.
 */

const ORANGE_GRADIENT = "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)";
const WARM_BG = "linear-gradient(180deg, #fafaf9 0%, #fff7ed 100%)";

const F = {
  body: "clamp(1.05rem, 1.6vw, 1.25rem)",
  cardTitle: "clamp(1.15rem, 1.8vw, 1.4rem)",
  cardBody: "clamp(0.95rem, 1.3vw, 1.05rem)",
  sectionH: "clamp(1.8rem, 3.4vw, 2.6rem)",
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const inViewUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

// The 3 civic verticals that are real, tested, and live in production.
const LIVE_VERTICALS = [
  {
    emoji: "🧾",
    title: "Civic Tax",
    to: "/civictax",
    desc: "Fund verified local campaigns directly — roads, clinics, skills centres. Every naira tracked from contribution to contractor payout.",
  },
  {
    emoji: "🛡️",
    title: "Security Map",
    to: "/security/map",
    desc: "See what's being reported in your area in real time, and report an incident yourself in under two minutes.",
  },
  {
    emoji: "🏅",
    title: "Youth Programmes",
    to: "/youth",
    desc: "Government-backed programmes, national tournaments, and mentorship — from first sign-up to the pitch or the boardroom.",
  },
];

// Newer verticals — public marketing pages are real, deeper dashboards are
// still being finished. Shown honestly, not hidden and not oversold.
const MORE_VERTICALS = [
  {
    emoji: "📣",
    title: "Community",
    to: "/community",
    desc: "Report a broken road or service gap; the most critical issues rise to the top, visible to the officials responsible.",
  },
  {
    emoji: "🩺",
    title: "Healthcare",
    to: "/healthcare",
    desc: "Find a nearby facility, book an appointment, and get real-time public-health alerts for your area.",
  },
  {
    emoji: "🗳️",
    title: "Governance",
    to: "/governance",
    desc: "Register, verify with your NIN, and vote — with ward-by-ward results tracked live as counting happens.",
  },
];

function VerticalCard({ emoji, title, to, desc, delay, muted }) {
  return (
    <motion.div {...inViewUp(delay)}>
      <Link to={to} style={{ textDecoration: "none" }}>
        <div
          style={{
            height: "100%",
            padding: "clamp(22px, 3vw, 30px)",
            borderRadius: 24,
            background: muted ? "rgba(255,255,255,0.75)" : "white",
            border: muted ? "1px solid #fdecdc" : "1px solid #fed7aa",
            boxShadow: muted ? "0 6px 18px rgba(0,0,0,0.04)" : "0 12px 32px rgba(234,88,12,0.1)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 16px 36px rgba(234,88,12,0.16)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = muted
              ? "0 6px 18px rgba(0,0,0,0.04)"
              : "0 12px 32px rgba(234,88,12,0.1)";
          }}
        >
          <div style={{ fontSize: "clamp(1.8rem, 3vw, 2.2rem)", marginBottom: 12 }}>{emoji}</div>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: F.cardTitle,
              fontWeight: 800,
              color: "#1f2937",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: "0 0 14px",
              fontSize: F.cardBody,
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            {desc}
          </p>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: F.cardBody,
              fontWeight: 700,
              color: "#ea580c",
            }}
          >
            Explore <ArrowForward sx={{ fontSize: "1.05rem" }} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function CivicLandingPage() {
  const { isAuthenticated } = useCivicWebAuth();

  return (
    <div style={{ width: "100%", background: WARM_BG }}>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <div
        style={{
          background: ORANGE_GRADIENT,
          padding: "clamp(56px, 8vw, 96px) clamp(20px, 5vw, 64px) clamp(72px, 10vw, 120px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0 opacity-10"
          viewBox="0 0 960 540"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" stroke="white" strokeWidth="2">
            <circle r="280" cx="120" cy="80" opacity="0.25" />
            <circle r="220" cx="820" cy="460" opacity="0.25" />
            <circle r="150" cx="480" cy="250" opacity="0.15" />
          </g>
        </svg>

        <div style={{ maxWidth: 880, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div {...fadeUp(0)} className="flex items-center gap-12 mb-40">
            <div
              className="w-56 h-56 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}
            >
              <img className="w-32" src="assets/images/afslogo/afslogo.png" alt="AfricanShops" />
            </div>
            <span
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: "1.15rem",
                letterSpacing: "0.01em",
              }}
            >
              AfricanShops Civic
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            style={{
              color: "white",
              fontWeight: 900,
              lineHeight: 1.08,
              margin: "0 0 20px",
              fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
              textWrap: "balance",
            }}
          >
            Where citizens fund, watch,
            <br />
            and hold their community to account.
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            style={{
              color: "rgba(255,255,255,0.92)",
              fontSize: F.body,
              lineHeight: 1.65,
              maxWidth: 640,
              margin: "0 0 36px",
            }}
          >
            The civic side of AfricanShops — voluntary local funding, real-time incident
            reporting, and youth development, built on the same trusted infrastructure as the
            marketplace, on the same identity you already verified there.
          </motion.p>

          <motion.div {...fadeUp(0.24)} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Button
              component={Link}
              to="/civictax"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                background: "white",
                color: "#ea580c",
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                "&:hover": { background: "#fff7ed" },
              }}
            >
              Browse civic campaigns
            </Button>
            {!isAuthenticated && (
              <Button
                component={Link}
                to="/sign-in"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "rgba(255,255,255,0.6)",
                  color: "white",
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: "12px",
                  "&:hover": { borderColor: "white", background: "rgba(255,255,255,0.08)" },
                }}
              >
                Sign in
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ───────────────────── Live verticals ───────────────────── */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "clamp(48px, 6vw, 72px) clamp(20px, 5vw, 64px) 0",
        }}
      >
        <motion.div {...inViewUp(0)} style={{ marginBottom: 32 }}>
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: F.sectionH,
              fontWeight: 800,
              color: "#1f2937",
              textWrap: "balance",
            }}
          >
            Live today
          </h2>
          <p style={{ margin: 0, fontSize: F.body, color: "#6b7280", maxWidth: 640 }}>
            The three civic pillars AfricanShops has fully built and tested — real data, real
            payments, real people using them.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {LIVE_VERTICALS.map((v, i) => (
            <VerticalCard key={v.title} {...v} delay={i * 0.08} />
          ))}
        </div>
      </div>

      {/* ───────────────────── More verticals ───────────────────── */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "clamp(56px, 7vw, 88px) clamp(20px, 5vw, 64px) clamp(64px, 8vw, 96px)",
        }}
      >
        <motion.div {...inViewUp(0)} style={{ marginBottom: 32 }}>
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: F.sectionH,
              fontWeight: 800,
              color: "#1f2937",
              textWrap: "balance",
            }}
          >
            Also on the platform
          </h2>
          <p style={{ margin: 0, fontSize: F.body, color: "#6b7280", maxWidth: 640 }}>
            Newer and still growing — worth a look, with more landing here as each one matures.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {MORE_VERTICALS.map((v, i) => (
            <VerticalCard key={v.title} {...v} delay={i * 0.08} muted />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CivicLandingPage;
