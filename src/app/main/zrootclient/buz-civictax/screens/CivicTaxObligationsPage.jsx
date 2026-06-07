import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, Chip, LinearProgress, Slider } from '@mui/material';
import {
  AccountBalance, CheckCircle, Warning, Schedule, Download,
  HowToVote, Forum, Build, Assessment, Edit, Lock, LockOpen,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import CivicTaxHeader from './shared-components/CivicTaxHeader';
import CampaignsBrowseSidebarLeft from './shared-components/CampaignsBrowseSidebarLeft';
import CampaignsBrowseSidebarRight from './shared-components/CampaignsBrowseSidebarRight';

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

/* ── Mock data (replace with API hook when backend is ready) ── */
const MOCK_PROFILE = {
  homeOrigin:    { lga: 'Ijebu-Ode',   state: 'Ogun State'   },
  dwelling:      { lga: 'Eti-Osa',     state: 'Lagos State'  },
  splitRatio:    { homeOrigin: 40, dwelling: 60 },
  complianceScore: 88,
  totalPaidThisYear: 36_500,
  lastPaymentDate: '2026-03-12',
};

const MOCK_OBLIGATIONS = [
  {
    id: 'obl-001', name: 'Annual Civic Development Levy', category: 'infrastructure',
    icon: '🏗️', amount: 18_000, dueDate: '2026-06-20', status: 'overdue',
    description: 'Funds road maintenance, drainage, and utility infrastructure across both your LGAs.',
    splitBreakdown: { homeOrigin: 7_200, dwelling: 10_800 },
  },
  {
    id: 'obl-002', name: 'Community Security Contribution', category: 'security',
    icon: '🛡️', amount: 9_500, dueDate: '2026-07-05', status: 'due_soon',
    description: 'Funds local security patrols, CCTV infrastructure, and emergency response units.',
    splitBreakdown: { homeOrigin: 3_800, dwelling: 5_700 },
  },
  {
    id: 'obl-003', name: 'Primary Healthcare Fund', category: 'health',
    icon: '🏥', amount: 6_000, dueDate: '2026-08-01', status: 'upcoming',
    description: 'Supports PHC centres, mobile clinics, and medicine procurement in your registered LGAs.',
    splitBreakdown: { homeOrigin: 2_400, dwelling: 3_600 },
  },
  {
    id: 'obl-004', name: 'Education Infrastructure Levy', category: 'education',
    icon: '📚', amount: 7_500, dueDate: '2026-09-15', status: 'upcoming',
    description: 'Builds and renovates public schools, libraries, and skill acquisition centres.',
    splitBreakdown: { homeOrigin: 3_000, dwelling: 4_500 },
  },
];

const MOCK_HISTORY = [
  { id: 'h-001', name: 'Annual Civic Development Levy',   amount: 18_000, paidDate: '2025-06-10', txId: 'CTAX-250610-A1B2', status: 'successful' },
  { id: 'h-002', name: 'Community Security Contribution', amount: 9_500,  paidDate: '2025-07-02', txId: 'CTAX-250702-C3D4', status: 'successful' },
  { id: 'h-003', name: 'Primary Healthcare Fund',         amount: 6_000,  paidDate: '2025-08-08', txId: 'CTAX-250808-E5F6', status: 'successful' },
  { id: 'h-004', name: 'Education Infrastructure Levy',   amount: 7_500,  paidDate: '2025-09-20', txId: 'CTAX-250920-G7H8', status: 'successful' },
  { id: 'h-005', name: 'Annual Civic Development Levy',   amount: 16_500, paidDate: '2024-06-14', txId: 'CTAX-240614-I9J0', status: 'successful' },
];

const GOVERNANCE_RIGHTS = [
  { icon: HowToVote, label: 'Vote in LGA Elections',   desc: 'Cast ballots in local government elections for both registered LGAs.' },
  { icon: Forum,     label: 'Community Issue Reports', desc: 'Submit, upvote, and comment on infrastructure issues in your LGAs.' },
  { icon: Build,     label: 'Project Proposals',       desc: 'Propose and vote on community development projects.' },
  { icon: Assessment,label: 'Budget Review Access',    desc: 'Review and comment on LGA budget allocations and expenditure reports.' },
];

const STATUS_CONFIG = {
  overdue:   { label: 'Overdue',   bg: '#fee2e2', color: '#991b1b', icon: Warning,   pulse: true  },
  due_soon:  { label: 'Due Soon',  bg: '#fff7ed', color: '#c2410c', icon: Schedule,  pulse: false },
  upcoming:  { label: 'Upcoming',  bg: '#f0fdf4', color: '#15803d', icon: Schedule,  pulse: false },
  successful:{ label: 'Paid',      bg: '#dcfce7', color: '#166534', icon: CheckCircle,pulse: false },
};

const ORANGE_GRADIENT = 'linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)';

/* ── Sub-components ── */
function ComplianceRing({ score }) {
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

function TaxObligationCard({ obligation, homeOriginLga, dwellingLga }) {
  const [paying, setPaying] = useState(false);
  const cfg = STATUS_CONFIG[obligation.status];
  const StatusIcon = cfg.icon;
  const totalDue = MOCK_OBLIGATIONS
    .filter((o) => o.status === 'overdue' || o.status === 'due_soon')
    .reduce((s, o) => s + o.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ borderRadius: 20, overflow: 'hidden', background: 'white', border: `1.5px solid ${obligation.status === 'overdue' ? '#fca5a5' : '#ffedd5'}`, boxShadow: obligation.status === 'overdue' ? '0 4px 20px rgba(239,68,68,0.12)' : '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      <div style={{ height: 4, background: obligation.status === 'overdue' ? 'linear-gradient(90deg,#dc2626,#ef4444)' : obligation.status === 'due_soon' ? ORANGE_GRADIENT : 'linear-gradient(90deg,#16a34a,#22c55e)' }} />
      <div style={{ padding: 'clamp(16px, 2.4vw, 22px)' }}>

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 14px)' }}>
            <div style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', lineHeight: 1 }}>{obligation.icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: F.title, color: '#1f2937', lineHeight: 1.3 }}>{obligation.name}</div>
              <div style={{ fontSize: F.meta, color: '#6b7280', marginTop: 2 }}>
                Due: <strong style={{ color: obligation.status === 'overdue' ? '#dc2626' : '#ea580c' }}>
                  {new Date(obligation.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
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
        <div style={{ fontSize: F.body, color: '#4b5563', lineHeight: 1.7, marginBottom: 'clamp(12px, 1.8vw, 18px)' }}>
          {obligation.description}
        </div>

        {/* Split breakdown */}
        <div style={{ borderRadius: 14, padding: 'clamp(12px, 1.6vw, 16px)', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', marginBottom: 'clamp(12px, 1.8vw, 18px)', border: '1px solid #fdba74' }}>
          <div style={{ fontSize: F.meta, fontWeight: 700, color: '#92400e', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tax Split Allocation</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 'clamp(10px, 1.4vw, 14px)', textAlign: 'center', border: '1px solid #fdba74' }}>
              <div style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>🏡 {homeOriginLga}</div>
              <div style={{ fontWeight: 900, fontSize: F.subH, color: '#ea580c' }}>₦{obligation.splitBreakdown.homeOrigin.toLocaleString()}</div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 'clamp(10px, 1.4vw, 14px)', textAlign: 'center', border: '1px solid #fdba74' }}>
              <div style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>🏙️ {dwellingLga}</div>
              <div style={{ fontWeight: 900, fontSize: F.subH, color: '#ea580c' }}>₦{obligation.splitBreakdown.dwelling.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Total + pay */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: F.meta, color: '#6b7280' }}>Total Due</div>
            <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#1f2937', lineHeight: 1 }}>₦{obligation.amount.toLocaleString()}</div>
          </div>
          {(obligation.status === 'overdue' || obligation.status === 'due_soon') && (
            <Button variant="contained" onClick={() => setPaying(true)}
              style={{ fontSize: F.btn }}
              sx={{ background: obligation.status === 'overdue' ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : ORANGE_GRADIENT, color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none', px: 'clamp(14px, 2.2vw, 24px)', py: 'clamp(10px, 1.4vw, 14px)', boxShadow: obligation.status === 'overdue' ? '0 6px 18px rgba(220,38,38,0.4)' : '0 6px 18px rgba(234,88,12,0.4)', '&:hover': { filter: 'brightness(0.92)', transform: 'translateY(-2px)' } }}>
              {obligation.status === 'overdue' ? '⚠️ Pay Now' : 'Pay Now'}
            </Button>
          )}
          {obligation.status === 'upcoming' && (
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
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.successful;
  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}
      style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.6vw, 18px)', padding: 'clamp(12px, 1.8vw, 16px)', borderRadius: 14, background: index % 2 === 0 ? '#fafaf9' : 'white', border: '1px solid transparent' }}
      className="hover:bg-orange-50/60 transition-colors group"
    >
      <CheckCircle style={{ color: '#16a34a', fontSize: 'clamp(18px, 2.4vw, 24px)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: F.body, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        <div style={{ fontSize: F.meta, color: '#9ca3af', marginTop: 2 }}>
          {new Date(item.paidDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' · '}
          <span style={{ fontFamily: 'monospace' }}>{item.txId}</span>
        </div>
      </div>
      <div style={{ fontWeight: 900, fontSize: F.title, color: '#ea580c', flexShrink: 0 }}>
        ₦{item.amount.toLocaleString()}
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
  const navigate  = useNavigate();
  const isMobile  = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [splitRatio, setSplitRatio] = useState(MOCK_PROFILE.splitRatio.dwelling);
  const [editingSplit, setEditingSplit] = useState(false);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const profile = MOCK_PROFILE;
  const overdueCount = MOCK_OBLIGATIONS.filter((o) => o.status === 'overdue').length;
  const totalOwed    = MOCK_OBLIGATIONS.filter((o) => o.status !== 'upcoming').reduce((s, o) => s + o.amount, 0);

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
                    ⚠️ Changes take effect from the next tax cycle. A request will be sent to both LGA authorities.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Compliance stats row */}
        <div style={{ background: 'white', padding: 'clamp(14px, 2vw, 20px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'clamp(10px, 1.6vw, 16px)', borderTop: '1px solid #ffedd5' }}>
          {[
            { label: 'Compliance Score',    value: `${profile.complianceScore}%`,                               color: '#16a34a' },
            { label: 'Paid This Year',      value: `₦${(profile.totalPaidThisYear / 1000).toFixed(0)}K`,         color: '#ea580c' },
            { label: 'Last Payment',        value: new Date(profile.lastPaymentDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }), color: '#2563eb' },
            { label: 'Active Obligations',  value: MOCK_OBLIGATIONS.length,                                    color: '#7c3aed' },
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
                  <div style={{ marginTop: 6, fontSize: F.meta, color: '#6b7280' }}>
                    Applies to: <strong style={{ color: '#ea580c' }}>{profile.homeOrigin.lga}</strong> & <strong style={{ color: '#ea580c' }}>{profile.dwelling.lga}</strong>
                  </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}>
          {MOCK_OBLIGATIONS.map((obl, i) => (
            <TaxObligationCard key={obl.id} obligation={obl}
              homeOriginLga={profile.homeOrigin.lga}
              dwellingLga={profile.dwelling.lga} />
          ))}
        </div>
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
        <div style={{ borderRadius: 20, overflow: 'hidden', background: 'white', border: '1px solid #ffedd5', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {MOCK_HISTORY.map((item, i) => <HistoryRow key={item.id} item={item} index={i} />)}
        </div>
        <div style={{ marginTop: 'clamp(14px, 2vw, 20px)', padding: 'clamp(14px, 2vw, 20px)', borderRadius: 16, background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fdba74', textAlign: 'center' }}>
          <div style={{ fontSize: F.body, color: '#374151', lineHeight: 1.7 }}>
            Total Civic Tax Paid (All Time):{' '}
            <strong style={{ color: '#ea580c', fontSize: F.subH }}>
              ₦{MOCK_HISTORY.reduce((s, h) => s + h.amount, 0).toLocaleString()}
            </strong>
            {' '}— Thank you for building Nigeria. 🇳🇬
          </div>
        </div>
      </div>

    </div>
  ), [splitRatio, editingSplit, overdueCount, totalOwed]);

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
