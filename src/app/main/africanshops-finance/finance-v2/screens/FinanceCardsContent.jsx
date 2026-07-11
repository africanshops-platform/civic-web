import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { useFinanceTheme } from '../FinanceThemeContext';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  cardNumber:  'clamp(1.4rem,  2.8vw, 1.9rem)',
};

function CardChip() {
  return (
    <div className="w-40 h-30 rounded-md" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', width: 40, height: 30 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', height: '100%' }}>
        {[0,1,2,3].map(i => <div key={i} style={{ border: '0.5px solid rgba(0,0,0,0.15)' }} />)}
      </div>
    </div>
  );
}

function ContactlessIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(255,255,255,0.7)' }}>
      <path d="M12 3C7.3 7 7.3 17 12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 7C9.2 9.8 9.2 14.2 12 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 11C11 12 11 13 12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Retail-3 (2026-07-11, revised): the physical-card metaphor stays a dark
// premium surface regardless of page theme (same logic as the reference
// design's own dark green card on a light page) — recolored from purple to
// our brand's warm near-black + orange accent instead of theme tokens.
function VirtualCard({ account, user, revealed, flipped, onFlip }) {
  const num = account?.accountNumber ?? '';
  const cardNumber = num
    ? `${num.slice(0, 4)} •••• •••• ${num.slice(-4)}`
    : '•••• •••• •••• ••••';
  const revealedNumber = num
    ? `${num.slice(0, 4)} ${num.slice(4, 6)}•• •••• ${num.slice(-4)}`
    : null;
  const name   = account?.accountName ?? user?.data?.displayName ?? 'CARDHOLDER';
  const expiry = '12/28';

  return (
    <div className="relative w-full cursor-pointer" style={{ perspective: 1000, maxWidth: 380, aspectRatio: '1.586 / 1' }} onClick={onFlip}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
      >
        {/* FRONT */}
        <div className="absolute inset-0 rounded-3xl p-24 flex flex-col justify-between overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #201a14 0%, #2a1c12 50%, #120d09 100%)' }}>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-8">
              <div className="w-36 h-36 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                <FuseSvgIcon size={20} className="text-white">heroicons-solid:banknotes</FuseSvgIcon>
              </div>
              <Typography style={{ fontSize: F.small, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AfriShops</Typography>
            </div>
            <ContactlessIcon />
          </div>

          <div className="relative z-10"><CardChip /></div>

          <div className="relative z-10">
            <Typography style={{ fontSize: F.cardNumber, fontWeight: 700, color: 'white', letterSpacing: '0.15em', marginBottom: 16 }}>
              {revealed ? (revealedNumber ?? cardNumber) : cardNumber}
            </Typography>
            <div className="flex items-end justify-between">
              <div>
                <Typography className="uppercase tracking-widest" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Card Holder</Typography>
                <Typography className="uppercase tracking-wider" style={{ fontSize: F.label, fontWeight: 700, color: 'white' }}>{name}</Typography>
              </div>
              <div>
                <Typography className="uppercase tracking-widest" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Expires</Typography>
                <Typography style={{ fontSize: F.label, fontWeight: 700, color: 'white' }}>{revealed ? expiry : '••/••'}</Typography>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-0">
                  <div className="w-28 h-28 rounded-full" style={{ background: '#ef4444', opacity: 0.9, marginRight: -12 }} />
                  <div className="w-28 h-28 rounded-full" style={{ background: '#f97316', opacity: 0.9 }} />
                </div>
                <Typography className="uppercase tracking-widest" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>VIRTUAL</Typography>
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #120d09 0%, #2a1c12 50%, #201a14 100%)' }}>
          <div className="w-full h-44 mt-24" style={{ background: 'rgba(0,0,0,0.8)' }} />
          <div className="px-24 pb-24 flex-1 flex flex-col justify-end gap-16">
            <div className="flex items-center gap-12">
              <div className="flex-1 h-36 rounded-lg flex items-center px-12"
                style={{ background: 'repeating-linear-gradient(90deg, #e5e7eb 0px, #e5e7eb 4px, #f9fafb 4px, #f9fafb 8px)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div className="rounded-lg px-16 py-8 text-center" style={{ background: 'white' }}>
                <Typography className="uppercase tracking-widest" style={{ fontSize: F.small, color: '#9ca3af', marginBottom: 2 }}>CVV</Typography>
                <Typography style={{ fontSize: F.label, fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>{revealed ? '***' : '•••'}</Typography>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Typography className="uppercase tracking-widest" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Valid Thru</Typography>
                <Typography style={{ fontSize: F.label, fontWeight: 700, color: 'white' }}>{revealed ? expiry : '••/••'}</Typography>
              </div>
              <div className="text-right">
                <Typography className="uppercase tracking-widest" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Account</Typography>
                <Typography style={{ fontSize: F.label, color: 'white', fontFamily: 'monospace' }}>{revealed ? account?.accountNumber : '•••••••••••'}</Typography>
              </div>
            </div>
            <Typography className="text-center uppercase tracking-wider" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.25)' }}>
              Virtual card · Digital transactions only
            </Typography>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-10 right-12 rounded-full px-10 py-4 pointer-events-none" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <Typography style={{ fontSize: F.small, color: 'rgba(255,255,255,0.4)' }}>Tap to flip</Typography>
      </div>
    </div>
  );
}

export default function FinanceCardsContent() {
  const { account } = useOutletContext();
  const user = useSelector(selectUser);
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };

  const [revealed, setRevealed] = useState(false);
  const [flipped,  setFlipped]  = useState(false);
  const [confirmReveal, setConfirmReveal] = useState(false);

  function handleRevealToggle() {
    if (!revealed && !confirmReveal) { setConfirmReveal(true); return; }
    setRevealed(r => !r);
    setConfirmReveal(false);
  }

  const cardDetails = [
    { label: 'Card Type',      value: 'Virtual Debit Card' },
    { label: 'Currency',       value: 'NGN (Nigerian Naira)' },
    { label: 'Status',         value: 'Active', color: tokens.success },
    { label: 'Network',        value: 'AfriShops Network' },
    { label: 'Account Name',   value: account?.accountName ?? '—' },
    { label: 'Account Number', value: revealed ? account?.accountNumber : '•••••••••••', mono: true },
  ];

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Virtual Card</Typography>
      <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 28 }}>Your secure digital payment card</Typography>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-28 max-w-3xl">
        {/* Card + controls */}
        <div>
          <VirtualCard account={account} user={user} revealed={revealed} flipped={flipped} onFlip={() => setFlipped(f => !f)} />

          {/* Confirm reveal */}
          <AnimatePresence>
            {confirmReveal && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="mt-16 rounded-2xl p-16" style={{ background: tokens.warningBg }}>
                <div className="flex items-start gap-12">
                  <FuseSvgIcon size={20} style={{ color: tokens.warning }} className="shrink-0 mt-2">heroicons-outline:exclamation-triangle</FuseSvgIcon>
                  <div className="flex-1">
                    <Typography style={{ fontSize: F.label, fontWeight: 600, color: tokens.warning, marginBottom: 4 }}>Reveal card details?</Typography>
                    <Typography style={{ fontSize: F.body, color: tokens.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>
                      Card details will be visible on screen. Make sure you are in a private space.
                    </Typography>
                    <div className="flex gap-10">
                      <Button size="small" onClick={() => { setRevealed(true); setConfirmReveal(false); }}
                        sx={{ background: tokens.accentSolid, color: 'white', borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: F.small }}>
                        Yes, reveal
                      </Button>
                      <Button size="small" onClick={() => setConfirmReveal(false)} sx={{ color: tokens.textMuted, textTransform: 'none', fontSize: F.small }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex gap-10 mt-16">
            <Button onClick={handleRevealToggle}
              startIcon={<FuseSvgIcon size={18}>{revealed ? 'heroicons-outline:eye-slash' : 'heroicons-outline:eye'}</FuseSvgIcon>}
              sx={{ flex: 1, borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1.2, fontSize: F.label, color: revealed ? tokens.danger : tokens.accentSolid, border: `1px solid ${revealed ? tokens.danger : tokens.accentSolid}55`, background: revealed ? tokens.dangerBg : tokens.accentSoft }}>
              {revealed ? 'Hide Details' : 'Reveal Details'}
            </Button>
            <Button onClick={() => setFlipped(f => !f)}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-path</FuseSvgIcon>}
              sx={{ flex: 1, borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1.2, fontSize: F.label, color: tokens.textSecondary, border: `1px solid ${tokens.borderColor}`, background: tokens.cardBg }}>
              Flip Card
            </Button>
          </div>
        </div>

        {/* Card info panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Typography className="uppercase tracking-widest font-semibold mb-14" style={{ fontSize: F.small, color: tokens.textMuted }}>
            Card Information
          </Typography>
          <div className="rounded-2xl overflow-hidden" style={card}>
            {cardDetails.map((detail, i) => (
              <div key={detail.label} className="flex items-center justify-between px-20 py-16"
                style={{ borderBottom: i < cardDetails.length - 1 ? `1px solid ${tokens.borderColor}` : 'none' }}>
                <Typography style={{ fontSize: F.body, color: tokens.textMuted }}>{detail.label}</Typography>
                <Typography style={{ fontSize: F.body, fontWeight: 600, color: detail.color ?? tokens.textPrimary, fontFamily: detail.mono ? 'monospace' : 'inherit' }}>
                  {detail.value}
                </Typography>
              </div>
            ))}
          </div>

          <div className="mt-20 rounded-2xl p-20" style={{ background: tokens.successBg }}>
            <div className="flex items-center gap-10 mb-14">
              <FuseSvgIcon size={20} style={{ color: tokens.success }}>heroicons-solid:shield-check</FuseSvgIcon>
              <Typography style={{ fontSize: F.label, fontWeight: 600, color: tokens.success }}>Card Security</Typography>
            </div>
            <ul className="space-y-8">
              {[
                'Transactions require PIN authentication',
                'Card details are hidden by default',
                'All payments are end-to-end encrypted',
                'Instant freeze available via support',
              ].map(tip => (
                <li key={tip} className="flex items-start gap-10">
                  <div className="w-5 h-5 rounded-full shrink-0 mt-4" style={{ background: tokens.success }} />
                  <Typography style={{ fontSize: F.body, color: tokens.textSecondary, lineHeight: 1.5 }}>{tip}</Typography>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
