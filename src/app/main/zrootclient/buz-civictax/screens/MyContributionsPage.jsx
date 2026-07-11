import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, Chip, Divider } from '@mui/material';
import { AccountBalanceWallet, Receipt, EmojiEvents, TrendingUp, Download } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useMyContributions } from '../hooks/useCivicTaxRepo';
import CivicTaxHeader from './shared-components/CivicTaxHeader';
import CampaignsBrowseSidebarLeft from './shared-components/CampaignsBrowseSidebarLeft';
import CampaignsBrowseSidebarRight from './shared-components/CampaignsBrowseSidebarRight';
import { CivicStatCard, CivicEmptyState, CivicLoadingSkeleton, CivicPaginationBar } from '../../civic-shared';
import { CAMPAIGN_CATEGORIES } from '../mock';

const F = {
  title:   'clamp(1.44rem, 2.4vw, 1.96rem)',
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const Root = styled(FusePageSimpleWithMargin)(() => ({
  '& .FusePageSimple-header': { backgroundColor: 'white', borderBottomWidth: 1, borderStyle: 'solid', borderColor: '#ffedd5' },
}));

const STATUS_SX = {
  successful: { bg: '#dcfce7', color: '#166534', label: 'Paid'    },
  pending:    { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  failed:     { bg: '#fee2e2', color: '#991b1b', label: 'Failed'  },
};

function ContributionRow({ contribution, index, navigate }) {
  const catInfo  = CAMPAIGN_CATEGORIES.find((c) => c.id === contribution.campaignCategory);
  const statusSx = STATUS_SX[contribution.status] || STATUS_SX.successful;
  const dateStr  = new Date(contribution.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.07, duration: 0.35 }}
      onClick={() => navigate(`/civictax/${contribution.transactionId}/receipt`)}
      style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.6vw, 18px)', padding: 'clamp(12px, 1.8vw, 18px)', borderRadius: 16, cursor: 'pointer', transition: 'background 0.2s' }}
      className="hover:bg-orange-50/60 group"
    >
      <div style={{ width: 'clamp(40px, 5.5vw, 50px)', height: 'clamp(40px, 5.5vw, 50px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)', flexShrink: 0, backgroundColor: catInfo?.bgColor || '#fff7ed' }}>
        {catInfo?.icon || '💰'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: F.body, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {contribution.campaignTitle}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <span style={{ fontSize: F.meta, color: '#9ca3af' }}>{dateStr}</span>
          <span style={{ fontSize: F.meta, color: '#9ca3af' }}>· {contribution.transactionId}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: F.title, color: '#ea580c' }}>₦{Number(contribution.amount).toLocaleString()}</div>
        <Chip label={statusSx.label} size="small"
          style={{ fontSize: F.meta }}
          sx={{ backgroundColor: statusSx.bg, color: statusSx.color, fontWeight: 700, height: 'clamp(20px, 2.6vw, 26px)', '& .MuiChip-label': { fontSize: F.meta } }} />
      </div>
      <Receipt style={{ color: '#fdba74', fontSize: 'clamp(18px, 2.2vw, 24px)', flexShrink: 0, opacity: 0.6 }} />
    </motion.div>
  );
}

function ActiveMyContributionsPage() {
  const navigate  = useNavigate();
  const isMobile  = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyContributions(page);
  const contributions = useMemo(() => data?.data?.contributions || [], [data]);
  const stats         = useMemo(() => data?.data?.stats, [data]);
  const pagination    = useMemo(() => data?.data?.pagination, [data]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CivicTaxHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="My Contributions" subtitle="Your full contribution history with receipts" showContributeBtn />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => {
    if (isLoading) return <div className="flex-auto p-6 sm:p-8"><CivicLoadingSkeleton message="Loading your contributions..." variant="list" cardCount={3} /></div>;

    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg, #fafaf9 0%, #fff7ed 100%)', minHeight: '100%' }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 'clamp(32px, 4.5vw, 42px)', height: 'clamp(32px, 4.5vw, 42px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', flexShrink: 0 }}>
              <AccountBalanceWallet style={{ color: 'white', fontSize: 'clamp(16px, 2vw, 20px)' }} />
            </div>
            <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#1f2937' }}>My Contributions</div>
          </div>
          <div style={{ color: '#6b7280', fontSize: F.body, marginLeft: 'clamp(44px, 6.5vw, 54px)' }}>Your full contribution history with receipts</div>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,150px), 1fr))', gap: 'clamp(10px, 1.6vw, 16px)', marginBottom: 'clamp(16px, 2.4vw, 24px)' }}>
            <CivicStatCard icon={AccountBalanceWallet} label="Total Given"   value={`₦${(stats.totalContributed/1000).toFixed(0)}K`} accent />
            <CivicStatCard icon={TrendingUp}           label="Campaigns"     value={stats.totalCampaigns}  />
            <CivicStatCard icon={EmojiEvents}          label="LGAs Impacted" value={stats.totalImpacted}   />
            <div style={{ borderRadius: 16, padding: 'clamp(12px, 1.8vw, 18px)', background: 'white', border: '1px solid #ffedd5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Badges</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {stats.badges?.map((b) => (
                  <Chip key={b} label={b} size="small"
                    style={{ fontSize: F.meta }}
                    sx={{ backgroundColor: '#fff7ed', color: '#ea580c', fontWeight: 700, height: 'clamp(20px, 2.6vw, 26px)', border: '1px solid #fdba74', '& .MuiChip-label': { fontSize: F.meta } }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'white', borderRadius: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ffedd5', overflow: 'hidden' }}>
          {contributions.length === 0 ? (
            <CivicEmptyState type="contributions" title="No contributions yet"
              description="Start contributing to civic campaigns in your LGA and watch your impact grow."
              ctaLabel="Browse Campaigns" onCta={() => navigate('/civictax/campaigns')} />
          ) : (
            <div style={{ padding: 8 }}>
              {contributions.map((contribution, i) => (
                <div key={contribution.id}>
                  <ContributionRow contribution={contribution} index={i} navigate={navigate} />
                  {i < contributions.length - 1 && <Divider sx={{ borderColor: '#fff7ed', mx: 2 }} />}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <CivicPaginationBar pagination={pagination} onPageChange={setPage} theme="light" />

        {contributions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(14px, 2vw, 22px)' }}>
            <Button startIcon={<Download style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />} variant="outlined"
              style={{ fontSize: F.btn }}
              sx={{ borderColor: '#fdba74', color: '#ea580c', borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&:hover': { backgroundColor: '#fff7ed' } }}>
              Download All Receipts
            </Button>
          </motion.div>
        )}
      </div>
    );
  }, [contributions, stats, isLoading, navigate, pagination]);

  const leftSidebar  = useMemo(() => <CampaignsBrowseSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CampaignsBrowseSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveMyContributionsPage = memo(ActiveMyContributionsPage);
export default function MyContributionsPage() { return <MemoizedActiveMyContributionsPage />; }
