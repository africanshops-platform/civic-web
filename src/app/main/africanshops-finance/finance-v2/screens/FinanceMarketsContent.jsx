import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useFinanceTheme } from '../FinanceThemeContext';
import { F } from '../financeUiTokens';

const container = { show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const PRODUCTS = [
  {
    key: 'treasury-bills',
    title: 'Treasury Bills',
    blurb: 'Lend to the government short-term and earn a fixed, guaranteed return — 91 to 364 days.',
    icon: 'heroicons-solid:building-library',
    stat: 'Fixed return',
  },
  {
    key: 'stocks',
    title: 'Stocks',
    blurb: 'Buy shares in companies listed on the Nigerian Exchange, fractional or full unit.',
    icon: 'heroicons-solid:chart-bar',
    stat: 'Market-linked',
  },
];

export default function FinanceMarketsContent() {
  const { tokens } = useFinanceTheme();
  const card = {
    background: tokens.cardBg,
    border: `1px solid ${tokens.cardBorder}`,
    boxShadow: tokens.cardShadow,
  };

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-20">
        {/* Hero */}
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-2xl p-24 md:p-32"
          style={{ background: tokens.heroBg }}
        >
          <div className="relative z-10 flex items-start justify-between gap-16 flex-wrap">
            <div>
              <Chip
                label="Coming soon"
                size="small"
                sx={{
                  background: 'rgba(255,255,255,0.14)',
                  color: tokens.heroText,
                  fontWeight: 700,
                  fontSize: F.small,
                  mb: 1.5,
                }}
              />
              <Typography style={{ fontSize: F.sectionHead, fontWeight: 800, color: tokens.heroText, lineHeight: 1.2 }}>
                Markets
              </Typography>
              <Typography style={{ fontSize: F.body, color: tokens.heroTextMuted, marginTop: 8, maxWidth: 480 }}>
                Grow your money beyond savings — treasury bills and stocks, coming to your wallet.
              </Typography>
            </div>
            <div
              className="w-64 h-64 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}
            >
              <FuseSvgIcon size={32} className="text-white">heroicons-solid:presentation-chart-line</FuseSvgIcon>
            </div>
          </div>
        </motion.div>

        {/* Product cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {PRODUCTS.map((p) => (
            <div key={p.key} className="rounded-2xl p-20 flex flex-col gap-14" style={card}>
              <div className="flex items-center justify-between">
                <div
                  className="w-44 h-44 rounded-xl flex items-center justify-center"
                  style={{ background: tokens.accentSoft }}
                >
                  <FuseSvgIcon size={22} style={{ color: tokens.accentSolid }}>{p.icon}</FuseSvgIcon>
                </div>
                <Chip
                  label={p.stat}
                  size="small"
                  sx={{ background: tokens.tertiaryBg, color: tokens.tertiary, fontWeight: 700, fontSize: F.small }}
                />
              </div>
              <div>
                <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>
                  {p.title}
                </Typography>
                <Typography style={{ fontSize: F.body, color: tokens.textMuted, lineHeight: 1.5 }}>
                  {p.blurb}
                </Typography>
              </div>
              <button
                disabled
                className="mt-auto rounded-xl py-10 font-semibold cursor-not-allowed"
                style={{
                  fontSize: F.label,
                  background: tokens.pageBg,
                  border: `1px solid ${tokens.borderColor}`,
                  color: tokens.textMuted,
                }}
              >
                Notify me at launch
              </button>
            </div>
          ))}
        </motion.div>

        {/* Waitlist note */}
        <motion.div
          variants={item}
          className="rounded-2xl p-20 flex items-center gap-14"
          style={card}
        >
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center shrink-0"
            style={{ background: tokens.infoBg }}
          >
            <FuseSvgIcon size={20} style={{ color: tokens.info }}>heroicons-outline:information-circle</FuseSvgIcon>
          </div>
          <Typography style={{ fontSize: F.body, color: tokens.textSecondary, lineHeight: 1.5 }}>
            We're building Markets alongside our regulatory partners. Your Savings and Wallets balances are unaffected
            and remain fully available in the meantime.
          </Typography>
        </motion.div>
      </motion.div>
    </div>
  );
}
