import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useFinanceTheme } from '../FinanceThemeContext';
import { F } from '../financeUiTokens';

const container = { show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

// Retail-8 (2026-07-12): the previous virtual-card mockup had no real card
// issuance behind it (just the account number formatted to look like a card
// number) — pulled in favor of an honest "Coming soon" until real card
// issuance is built, matching the Markets screen's pattern.
export default function FinanceCardsContent() {
  const { tokens } = useFinanceTheme();
  const card = {
    background: tokens.cardBg,
    border: `1px solid ${tokens.cardBorder}`,
    boxShadow: tokens.cardShadow,
  };

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-20">
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
                sx={{ background: 'rgba(255,255,255,0.14)', color: tokens.heroText, fontWeight: 700, fontSize: F.small, mb: 1.5 }}
              />
              <Typography style={{ fontSize: F.sectionHead, fontWeight: 800, color: tokens.heroText, lineHeight: 1.2 }}>
                Cards
              </Typography>
              <Typography style={{ fontSize: F.body, color: tokens.heroTextMuted, marginTop: 8, maxWidth: 480 }}>
                Virtual and physical cards for everyday spending, tied directly to your wallet.
              </Typography>
            </div>
            <div
              className="w-64 h-64 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}
            >
              <FuseSvgIcon size={32} className="text-white">heroicons-outline:credit-card</FuseSvgIcon>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-2xl p-20 flex items-center gap-14" style={card}>
          <div className="w-40 h-40 rounded-full flex items-center justify-center shrink-0" style={{ background: tokens.infoBg }}>
            <FuseSvgIcon size={20} style={{ color: tokens.info }}>heroicons-outline:information-circle</FuseSvgIcon>
          </div>
          <Typography style={{ fontSize: F.body, color: tokens.textSecondary, lineHeight: 1.5 }}>
            In the meantime, use Fund Account or Receive Money to move money in, and Send to Bank or Transfer to move it out.
          </Typography>
        </motion.div>
      </motion.div>
    </div>
  );
}
