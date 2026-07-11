import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, Chip, CircularProgress, Slider } from '@mui/material';
import {
  AccountBalance, CheckCircle, Warning, Schedule, Download,
  HowToVote, Forum, Build, Assessment, Edit, Lock, LockOpen,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import CivicTaxHeader from './shared-components/CivicTaxHeader';
import CampaignsBrowseSidebarLeft from './shared-components/CampaignsBrowseSidebarLeft';
import CampaignsBrowseSidebarRight from './shared-components/CampaignsBrowseSidebarRight';
import { useMyObligations, usePayObligation, useObligationHistory } from '../hooks/useCivicTaxRepo';
import { CivicLoadingSkeleton, CivicPaginationBar } from '../../civic-shared';

/* ── Font tokens ── */
const F = {
  title:   'clamp(1.44rem, 2.4vw, 1.96rem)',
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const Root = styled(FusePageSimpleWithMargin)(() => ({
  '& .FusePageSimple-header': {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ffedd5',
  },
}));

/* ── Governance rights data (static — comes from civic profile, not obligations API) ── */
const MOCK_PROFILE = {
  homeOrigin:    { lga: 'Ijebu-Ode',   state: 'Ogun State'   },
  dwelling:      { lga: 'Eti-Osa',     state: 'Lagos State'  },
  splitRatio:    { homeOrigin: 40, dwelling: 60 },
  complianceScore: 88,
  totalPaidThisYear: 0,
  lastPaymentDate: null,
};

const GOVERNANCE_RIGHTS = [
  { icon: HowToVote, label: 'Vote in LGA Elections',   desc: 'Cast ballots in local government elections for both registered LGAs.' },
  { icon: Forum,     label: 'Community Issue Reports', desc: 'Submit, upvote, and comment on infrastructure issues in your LGAs.' },
  { icon: Build,     label: 'Project Proposals',       desc: 'Propose and vote on community development projects.' },
  { icon: Assessment,label: 'Budget Review Access',    desc: 'Review and comment on LGA budget allocations and expenditure reports.' },
];

const STATUS_CONFIG = {
  overdue:   { label: 'Overdue',   bg: '#fee2e2', color: '#991b1b', icon: Warning,    pulse: true  },
  due_soon:  { label: 'Due Soon',  bg: '#fff7ed', color: '#c2410c', icon: Schedule,   pulse: false },
  upcoming:  { label: 'Upcoming',  bg: '#f0fdf4', color: '#15803d', icon: Schedule,   pulse: false },
  paid:      { label: 'Paid',      bg: '#dcfce7', color: '#166534', icon: CheckCircle,pulse: false },
};

const ORANGE_GRADIENT = 'linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)';

/* ── Utility: derive a category icon from obligation type string ── */
function getObligationIcon(type) {
  const t = (type ?? '').toLowerCase();
  if (t.includes('security') || t.includes('guard'))              return '🛡️';
  if (t.includes('health') || t.includes('medical') || t.includes('hc')) return '🏥';
  if (t.includes('education') || t.includes('school'))            return '📚';
  if (t.includes('road') || t.includes('infrastructure') || t.includes('development')) return '🏗️';
  if (t.includes('agric') || t.includes('farm'))                  return '🌾';
  if (t.includes('water') || t.includes('sanitation'))            return '💧';
  return '💼';
}

/* ── sub-components ── */
function ComplianceRing({ score }) {
  // eslint-disable-next-line no-nested-ternary
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#ea580c' : '#dc2626';
  const circumference = 2 * Math.PI * 28;
  const dash = (score / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
      <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="38" cy="38" r="28" fill="none" stroke="#ffedd5" strokeWidth="8" />
        <circle cx="38" cy="38" r="28" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 'clamp(1rem, 1.6vw, 1.3rem)', color, lineHeight: 1 }}>{score}%</div>
        <div style={{ fontSize: 'clamp(0.65rem, 1vw, 0.8rem)', color: '#6b7280', fontWeight: 600 }}>score</div>
      </div>
    </div>
  );
}

function TaxObligationCard({ obligation, onPay, isPaying }) {
  const [confirming, setConfirming] = useState(false);
  const cfg = STATUS_CONFIG[obligation.uiStatus] || STATUS_CONFIG.upcoming;
  const StatusIcon = cfg.icon;
  const canPay = obligation.uiStatus === 'overdue' || obligation.uiStatus === 'due_soon';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ borderRadius: 20, overflow: 'hidden', background: 'white', border: `1.5px solid ${obligation.uiStatus === 'overdue' ? '#fca5a5' : '#ffedd5'}`, boxShadow: obligation.uiStatus === 'overdue' ? '0 4px 20px rgba(239,68,68,0.12)' : '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      <div style={{ height: 4, background: obligation.uiStatus === 'overdue' ? 'linear-gradient(90deg,#dc2626,#ef4444)' : obligation.uiStatus === 'due_soon' ? ORANGE_GRADIENT : 'linear-gradient(90deg,#16a34a,#22c55e)' }} />
      <div style={{ padding: 'clamp(16px, 2.4vw, 22px)' }}>

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 14px)' }}>
            <div style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', lineHeight: 1 }}>{getObligationIcon(obligation.obligationType)}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: F.title, color: '#1f2937', lineHeight: 1.3 }}>
                {(obligation.obligationType ?? '').replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: F.meta, color: '#6b7280', marginTop: 2 }}>
                {obligation.lga && <span>{obligation.lga}, {obligation.state} · </span>}
                Due: <strong style={{ color: obligation.uiStatus === 'overdue' ? '#dc2626' : '#ea580c' }}>
                  {obligation.dueDate
                    ? new Date(obligation.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </strong>
              </div>
            </div>
          </div>
          <motion.div animate={cfg.pulse ? { opacity: [1, 0.5, 1] } : {}} transition={{ duration: 1.4, repeat: Infinity }}>
            <Chip label={cfg.label} size="small"
              icon={<StatusIcon style={{ fontSize: 'clamp(13px, 1.6vw, 17px)', color: cfg.color }} />}
              style={{ fontSize: F.meta }}
              sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 800, border: `1px solid ${cfg.color}44`, '& .MuiChip-label': { fontSize: F.meta } }} />
          </motion.div>
        </div>

        {/* Description */}
        {obligation.description && (
          <div style={{ fontSize: F.body, color: '#4b5563', lineHeight: 1.7, marginBottom: 'clamp(12px, 1.8vw, 18px)' }}>
            {obligation.description}
          </div>
        )}

        {/* Partially paid indicator */}
        {obligation.paidNaira > 0 && obligation.uiStatus !== 'paid' && (
          <div style={{ borderRadius: 14, padding: 'clamp(10px, 1.4vw, 14px)', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', marginBottom: 'clamp(12px, 1.8vw, 18px)', border: '1px solid #fdba74' }}>
            <div style={{ fontSize: F.meta, fontWeight: 700, color: '#92400e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Partial Payment</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 'clamp(10px, 1.4vw, 14px)', textAlign: 'center', border: '1px solid #fdba74' }}>
                <div style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>Paid</div>
                <div style={{ fontWeight: 900, fontSize: F.subH, color: '#16a34a' }}>₦{obligation.paidNaira.toLocaleString()}</div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 'clamp(10px, 1.4vw, 14px)', textAlign: 'center', border: '1px solid #fdba74' }}>
                <div style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>Remaining</div>
                <div style={{ fontWeight: 900, fontSize: F.subH, color: '#ea580c' }}>₦{obligation.remainingNaira.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Total + pay */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: F.meta, color: '#6b7280' }}>{canPay ? 'Amount Due' : 'Total'}</div>
            <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#1f2937', lineHeight: 1 }}>
              ₦{(canPay ? obligation.remainingNaira : obligation.amountNaira).toLocaleString()}
            </div>
          </div>
          {canPay && !confirming && (
            <Button variant="contained" onClick={() => setConfirming(true)}
              style={{ fontSize: F.btn }}
              sx={{ background: obligation.uiStatus === 'overdue' ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : ORANGE_GRADIENT, color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none', px: 'clamp(14px, 2.2vw, 24px)', py: 'clamp(10px, 1.4vw, 14px)', boxShadow: obligation.uiStatus === 'overdue' ? '0 6px 18px rgba(220,38,38,0.4)' : '0 6px 18px rgba(234,88,12,0.4)', '&:hover': { filter: 'brightness(0.92)', transform: 'translateY(-2px)' } }}>
              {obligation.uiStatus === 'overdue' ? '⚠️ Pay Now' : 'Pay Now'}
            </Button>
          )}
          {canPay && confirming && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: F.meta, color: '#4b5563', fontWeight: 600 }}>
                Confirm ₦{obligation.remainingNaira.toLocaleString()} payment?
              </span>
              <Button variant="contained" size="small" disabled={isPaying}
                onClick={() => { onPay({ obligationId: obligation.id, remainingKobo: obligation.remainingKobo }); setConfirming(false); }}
                sx={{ background: ORANGE_GRADIENT, color: 'white', fontWeight: 800, borderRadius: '10px', textTransform: 'none', minWidth: 80 }}>
                {isPaying ? <CircularProgress size={16} color="inherit" /> : 'Confirm'}
              </Button>
              <Button variant="outlined" size="small" onClick={() => setConfirming(false)}
                sx={{ borderColor: '#fdba74', color: '#ea580c', borderRadius: '10px', textTransform: 'none' }}>
                Cancel
              </Button>
            </div>
          )}
          {obligation.uiStatus === 'upcoming' && (
            <Button variant="outlined"
              style={{ fontSize: F.btn }}
              sx={{ borderColor: '#fdba74', color: '#ea580c', fontWeight: 700, borderRadius: '14px', textTransform: 'none', px: 'clamp(14px, 2.2vw, 24px)', py: 'clamp(8px, 1.2vw, 12px)', '&:hover': { backgroundColor: '#fff7ed' } }}>
              Schedule Payment
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function HistoryRow({ item, index }) {
  const amountNaira = item.amountNaira ?? (item.amountKobo ? Number(item.amountKobo) / 100 : 0);
  const date = item.createdAt || item.paidDate || item.updatedAt || '';
  const name = item.obligationType ?? item.name ?? 'Obligation Payment';

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}
      style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.6vw, 18px)', padding: 'clamp(12px, 1.8vw, 16px)', borderRadius: 14, background: index % 2 === 0 ? '#fafaf9' : 'white', border: '1px solid transparent' }}
      className="hover:bg-orange-50/60 transition-colors group"
    >
      <CheckCircle style={{ color: '#16a34a', fontSize: 'clamp(18px, 2.4vw, 24px)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: F.body, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name.replace(/_/g, ' ')}
        </div>
        {date && (
          <div style={{ fontSize: F.meta, color: '#9ca3af', marginTop: 2 }}>
            {new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
            {item.id && <span style={{ fontFamily: 'monospace' }}> · {item.id.slice(0, 8).toUpperCase()}</span>}
          </div>
        )}
      </div>
      <div style={{ fontWeight: 900, fontSize: F.title, color: '#ea580c', flexShrink: 0 }}>
        ₦{amountNaira.toLocaleString()}
      </div>
      <Button size="small" startIcon={<Download style={{ fontSize: 'clamp(13px, 1.6vw, 17px)' }} />}
        style={{ fontSize: F.meta }}
        sx={{ color: '#ea580c', textTransform: 'none', fontWeight: 700, borderRadius: '10px', border: '1px solid #fdba74', px: 1.5, '&:hover': { backgroundColor: '#fff7ed' } }}>
        Receipt
      </Button>
    </motion.div>
  );
}

/* ── Main inner page ── */
function ActiveCivicTaxObligationsPage() {
  const isMobile  = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [splitRatio, setSplitRatio] = useState(MOCK_PROFILE.splitRatio.dwelling);
  const [editingSplit, setEditingSplit] = useState(false);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const [oblPage,  setOblPage]  = useState(1);
  const [histPage, setHistPage] = useState(1);

  const { data: oblData,  isLoading: oblLoading  } = useMyObligations(oblPage);
  const { data: histData, isLoading: histLoading } = useObligationHistory(histPage);
  const { mutate: payObligation, isLoading: isPaying } = usePayObligation();

  const obligations    = useMemo(() => oblData?.data?.obligations   ?? [], [oblData]);
  const history        = useMemo(() => histData?.data?.history      ?? [], [histData]);
  const oblPagination  = useMemo(() => oblData?.data?.pagination,          [oblData]);
  const histPagination = useMemo(() => histData?.data?.pagination,         [histData]);

  const overdueCount = useMemo(() => obligations.filter((o) => o.uiStatus === 'overdue').length, [obligations]);
  const totalOwed    = useMemo(
    () => obligations
      .filter((o) => o.uiStatus === 'overdue' || o.uiStatus === 'due_soon')
      .reduce((s, o) => s + o.remainingNaira, 0),
    [obligations]
  );

  const profile = MOCK_PROFILE;

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CivicTaxHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Civic Tax Obligations" subtitle="Pay taxes. Unlock governance. Shape your LGA." showContributeBtn={false} />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg, #fafaf9 0%, #fff7ed 100%)', minHeight: '100%' }}>

      {/* ── Overdue alert ── */}
      <AnimatePresence>
        {overdueCount > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 'clamp(16px, 2.4vw, 24px)', padding: 'clamp(12px, 1.8vw, 18px)', borderRadius: 16, background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '1.5px solid #fca5a5', display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <Warning style={{ color: '#dc2626', fontSize: 'clamp(22px, 3vw, 30px)', flexShrink: 0 }} />
            </motion.div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: F.subH, color: '#991b1b' }}>{overdueCount} Overdue Tax Obligation{overdueCount > 1 ? 's' : ''}</div>
              <div style={{ fontSize: F.body, color: '#b91c1c', marginTop: 2 }}>Unpaid taxes may restrict your governance participation. Pay now to remain eligible.</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#dc2626', flexShrink: 0 }}>₦{totalOwed.toLocaleString()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tax Identity Profile ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 'clamp(20px, 3vw, 32px)', boxShadow: '0 8px 32px rgba(234,88,12,0.18)' }}>
        <div style={{ background: ORANGE_GRADIENT, padding: 'clamp(18px, 2.8vw, 28px)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 'clamp(16px, 2.4vw, 24px)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: 'clamp(5px,0.8vw,8px) clamp(14px,2vw,20px)', marginBottom: 12, border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(10px)' }}>
                <AccountBalance style={{ color: '#fde047', fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
                <span style={{ color: 'white', fontWeight: 700, fontSize: F.meta }}>Compulsory Civic Tax Profile</span>
              </div>
              <div style={{ fontWeight: 900, fontSize: F.sectionH, color: 'white', lineHeight: 1.1 }}>Your Tax Identity</div>
              <div style={{ fontSize: F.body, color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>
                Taxes split between your home origin and dwelling. Governance access follows your tax allocation.
              </div>
            </div>
            <ComplianceRing score={profile.complianceScore} />
          </div>

          {/* LGA cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(10px, 1.6vw, 16px)', marginBottom: 'clamp(14px, 2vw, 20px)' }}>
            {[
              { label: 'Home Origin', emoji: '🏡', lga: profile.homeOrigin.lga, state: profile.homeOrigin.state, pct: 100 - splitRatio },
              { label: 'Dwelling',    emoji: '🏙️', lga: profile.dwelling.lga,   state: profile.dwelling.state,   pct: splitRatio },
            ].map((loc) => (
              <div key={loc.label} style={{ borderRadius: 16, padding: 'clamp(12px, 1.8vw, 18px)', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <div style={{ fontSize: 'clamp(1.3rem, 2vw, 1.6rem)', marginBottom: 6 }}>{loc.emoji}</div>
                <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{loc.label}</div>
                <div style={{ fontWeight: 900, fontSize: F.title, color: 'white', marginTop: 2 }}>{loc.lga}</div>
                <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.7)' }}>{loc.state}</div>
                <div style={{ marginTop: 10, padding: 'clamp(4px,0.6vw,6px) clamp(10px,1.4vw,14px)', background: 'rgba(255,255,255,0.25)', borderRadius: 999, display: 'inline-block', fontWeight: 800, fontSize: F.meta, color: 'white' }}>
                  {loc.pct}% allocation
                </div>
              </div>
            ))}
          </div>

          {/* Split bar + edit */}
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 'clamp(12px, 1.8vw, 18px)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>Tax Split Ratio</div>
              <Button size="small" startIcon={<Edit style={{ fontSize: 'clamp(12px, 1.6vw, 16px)' }} />}
                onClick={() => setEditingSplit((v) => !v)}
                style={{ fontSize: F.meta }}
                sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.45)', borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 1.5, '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}>
                {editingSplit ? 'Save' : 'Adjust'}
              </Button>
            </div>
            <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
              <motion.div animate={{ width: `${100 - splitRatio}%` }} transition={{ duration: 0.4 }}
                style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '999px 0 0 999px' }} />
              <motion.div animate={{ width: `${splitRatio}%` }} transition={{ duration: 0.4 }}
                style={{ background: 'rgba(253,224,71,0.8)', borderRadius: '0 999px 999px 0' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: F.meta, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              <span>🏡 {profile.homeOrigin.lga}: {100 - splitRatio}%</span>
              <span>🏙️ {profile.dwelling.lga}: {splitRatio}%</span>
            </div>
            <AnimatePresence>
              {editingSplit && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 14 }}>
                  <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                    Drag to adjust how your tax is split between your two LGAs:
                  </div>
                  <Slider value={splitRatio} onChange={(_, v) => setSplitRatio(v)} min={10} max={90} step={5}
                    sx={{ color: 'white', '& .MuiSlider-thumb': { backgroundColor: '#fde047', width: 20, height: 20, border: '3px solid #ea580c' }, '& .MuiSlider-track': { backgroundColor: '#fde047' }, '& .MuiSlider-rail': { backgroundColor: 'rgba(255,255,255,0.35)' }, '& .MuiSlider-valueLabel': { backgroundColor: '#ea580c', fontSize: F.meta } }}
                    valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}% ${profile.dwelling.lga}`} />
                  <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                    ⚠️ Changes take effect from the next tax cycle.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Compliance stats row */}
        <div style={{ background: 'white', padding: 'clamp(14px, 2vw, 20px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'clamp(10px, 1.6vw, 16px)', borderTop: '1px solid #ffedd5' }}>
          {[
            { label: 'Compliance Score',   value: `${profile.complianceScore}%`,      color: '#16a34a' },
            { label: 'Active Obligations', value: obligations.length,                  color: '#7c3aed' },
            { label: 'Overdue',            value: overdueCount,                        color: overdueCount > 0 ? '#dc2626' : '#16a34a' },
            { label: 'Amount Due',         value: `₦${Math.round(totalOwed / 1000)}K`, color: '#ea580c' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: F.subH, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Governance Rights ── */}
      <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(12px, 1.8vw, 18px)' }}>
          <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#1f2937' }}>Governance Rights</div>
          <Chip label={profile.complianceScore >= 80 ? '✓ Fully Eligible' : 'Partial Access'} size="small"
            style={{ fontSize: F.meta }}
            sx={{ backgroundColor: profile.complianceScore >= 80 ? '#dcfce7' : '#fff7ed', color: profile.complianceScore >= 80 ? '#166534' : '#c2410c', fontWeight: 800, '& .MuiChip-label': { fontSize: F.meta } }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(10px, 1.6vw, 16px)' }}>
          {GOVERNANCE_RIGHTS.map((right, i) => {
            const GovIcon = right.icon;
            const unlocked = profile.complianceScore >= 80;
            return (
              <motion.div key={right.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                style={{ display: 'flex', gap: 'clamp(10px, 1.4vw, 14px)', padding: 'clamp(12px, 1.8vw, 18px)', borderRadius: 16, background: unlocked ? 'white' : '#fafaf9', border: `1.5px solid ${unlocked ? '#fdba74' : '#e5e7eb'}`, opacity: unlocked ? 1 : 0.6 }}>
                <div style={{ width: 'clamp(36px, 4.8vw, 44px)', height: 'clamp(36px, 4.8vw, 44px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: unlocked ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' : '#f3f4f6', border: unlocked ? '1px solid #fdba74' : '1px solid #e5e7eb' }}>
                  {unlocked
                    ? <GovIcon style={{ color: '#ea580c', fontSize: 'clamp(18px, 2.4vw, 24px)' }} />
                    : <Lock style={{ color: '#9ca3af', fontSize: 'clamp(16px, 2vw, 20px)' }} />
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: F.body, color: unlocked ? '#1f2937' : '#9ca3af', marginBottom: 3 }}>
                    {right.label}
                    {unlocked && <LockOpen style={{ fontSize: 'clamp(12px, 1.4vw, 15px)', color: '#16a34a', marginLeft: 6, verticalAlign: 'middle' }} />}
                  </div>
                  <div style={{ fontSize: F.meta, color: '#6b7280', lineHeight: 1.5 }}>{right.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Obligations ── */}
      <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
        <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#1f2937', marginBottom: 'clamp(12px, 1.8vw, 18px)' }}>
          Tax Obligations
        </div>
        {oblLoading ? (
          <CivicLoadingSkeleton message="Loading your obligations..." cardCount={3} variant="list" />
        ) : obligations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'clamp(32px,5vw,56px)', borderRadius: 20, background: 'white', border: '1px solid #ffedd5' }}>
            <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 16 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: F.subH, color: '#1f2937', marginBottom: 8 }}>No outstanding obligations</div>
            <div style={{ fontSize: F.body, color: '#6b7280' }}>You're all caught up! New obligations will appear here when issued.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}>
            {obligations.map((obl) => (
              <TaxObligationCard key={obl.id} obligation={obl} onPay={payObligation} isPaying={isPaying} />
            ))}
          </div>
        )}
        <CivicPaginationBar pagination={oblPagination} onPageChange={setOblPage} theme="light" />
      </div>

      {/* ── Payment History ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 'clamp(12px, 1.8vw, 18px)' }}>
          <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#1f2937' }}>Payment History</div>
          <Button startIcon={<Download style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />} variant="outlined"
            style={{ fontSize: F.btn }}
            sx={{ borderColor: '#fdba74', color: '#ea580c', borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&:hover': { backgroundColor: '#fff7ed' } }}>
            Download All Receipts
          </Button>
        </div>
        {histLoading ? (
          <CivicLoadingSkeleton message="Loading payment history..." cardCount={3} variant="list" />
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'clamp(24px,4vw,40px)', borderRadius: 20, background: 'white', border: '1px solid #ffedd5' }}>
            <div style={{ fontSize: F.body, color: '#6b7280' }}>No payment history yet.</div>
          </div>
        ) : (
          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'white', border: '1px solid #ffedd5', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {history.map((item, i) => <HistoryRow key={item.id ?? i} item={item} index={i} />)}
          </div>
        )}
        <CivicPaginationBar pagination={histPagination} onPageChange={setHistPage} theme="light" />
      </div>

    </div>
  ), [splitRatio, editingSplit, overdueCount, totalOwed, obligations, history, oblLoading, histLoading, isPaying, payObligation, oblPagination, histPagination]);

  const leftSidebar  = useMemo(() => <CampaignsBrowseSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CampaignsBrowseSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveCivicTaxObligationsPage = memo(ActiveCivicTaxObligationsPage);
export default function CivicTaxObligationsPage() { return <MemoizedActiveCivicTaxObligationsPage />; }
