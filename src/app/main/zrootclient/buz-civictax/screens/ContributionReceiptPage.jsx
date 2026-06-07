import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, Divider, Chip } from '@mui/material';
import { CheckCircle, Download, Home, People, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useContributionReceipt } from '../hooks/useCivicTaxRepo';
import CivicTaxHeader from './shared-components/CivicTaxHeader';
import CampaignsBrowseSidebarLeft from './shared-components/CampaignsBrowseSidebarLeft';
import CampaignsBrowseSidebarRight from './shared-components/CampaignsBrowseSidebarRight';
import { CivicLoadingSkeleton } from '../../civic-shared';
import { CAMPAIGN_CATEGORIES } from '../mock';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const Root = styled(FusePageSimpleWithMargin)(() => ({
  '& .FusePageSimple-header': { backgroundColor: 'white', borderBottomWidth: 1, borderStyle: 'solid', borderColor: '#ffedd5' },
}));

function ActiveContributionReceiptPage() {
  const { transactionId } = useParams();
  const navigate          = useNavigate();
  const isMobile          = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading } = useContributionReceipt(transactionId);
  const receipt = useMemo(() => data?.data?.receipt, [data]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CivicTaxHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Contribution Receipt" subtitle="Thank you for building Nigeria together" showContributeBtn />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => {
    if (isLoading) return <div className="flex-auto p-6 sm:p-8"><CivicLoadingSkeleton message="Preparing your receipt..." cardCount={1} variant="list" /></div>;

    if (!receipt) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={{ color: '#dc2626', fontWeight: 700, fontSize: F.body, marginBottom: 16 }}>Receipt not found.</div>
          <Button onClick={() => navigate('/civictax/my-contributions')}
            style={{ fontSize: F.btn }}
            sx={{ color: '#ea580c', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
            View All Contributions
          </Button>
        </div>
      );
    }

    const catInfo = CAMPAIGN_CATEGORIES.find((c) => c.id === receipt.campaignCategory);
    const dateStr = new Date(receipt.createdAt).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef3c7 100%)', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Success animation */}
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'clamp(20px, 3vw, 32px)' }}>
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(234,88,12,0.4)', '0 0 0 20px rgba(234,88,12,0)', '0 0 0 0 rgba(234,88,12,0)'] }}
              transition={{ duration: 1.8, repeat: 3 }}
              style={{ width: 'clamp(72px, 10vw, 96px)', height: 'clamp(72px, 10vw, 96px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 12px 32px rgba(234,88,12,0.4)' }}>
              <CheckCircle style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, 3rem)' }} />
            </motion.div>
            <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#1f2937', marginBottom: 6 }}>Thank You! 🙏</div>
            <div style={{ color: '#6b7280', fontSize: F.body, textAlign: 'center' }}>Your contribution is making a real difference.</div>
          </motion.div>

          {/* Receipt card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            style={{ background: 'white', borderRadius: 24, boxShadow: '0 12px 40px rgba(234,88,12,0.15)', overflow: 'hidden', border: '1px solid #fdba74' }}>
            <div style={{ height: 6, background: 'linear-gradient(90deg, #f97316, #ea580c, #c2410c)' }} />

            <div style={{ padding: 'clamp(18px, 2.8vw, 28px)' }}>
              {/* Transaction ID */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(14px, 2vw, 22px)' }}>
                <div style={{ fontSize: F.meta, color: '#9ca3af', fontWeight: 600 }}>CONTRIBUTION RECEIPT</div>
                <div style={{ fontSize: F.meta, color: '#ea580c', fontWeight: 700, fontFamily: 'monospace' }}>#{receipt.transactionId}</div>
              </div>

              {/* Amount */}
              <div style={{ borderRadius: 16, padding: 'clamp(16px, 2.4vw, 24px)', textAlign: 'center', marginBottom: 'clamp(14px, 2vw, 22px)', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
                <div style={{ fontSize: F.meta, color: '#9ca3af', marginBottom: 6 }}>Amount Contributed</div>
                <div style={{ fontSize: F.sectionH, fontWeight: 900, color: '#ea580c', lineHeight: 1 }}>
                  ₦{Number(receipt.amount).toLocaleString()}
                </div>
              </div>

              <Divider sx={{ borderColor: '#ffedd5', mb: 2.5 }} />

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.4vw, 14px)' }}>
                {[
                  { label: 'Campaign', value: <div style={{ fontSize: F.body, fontWeight: 700, color: '#1f2937', textAlign: 'right', maxWidth: '60%' }}>{receipt.campaignTitle}</div> },
                  { label: 'Category', value: catInfo ? <Chip label={`${catInfo.icon} ${catInfo.label}`} size="small" style={{ fontSize: F.meta }} sx={{ backgroundColor: catInfo.bgColor, color: catInfo.color, fontWeight: 700, '& .MuiChip-label': { fontSize: F.meta } }} /> : null },
                  { label: 'Location', value: <div style={{ fontSize: F.body, fontWeight: 600, color: '#374151' }}>{receipt.jurisdiction?.lga}, {receipt.jurisdiction?.state}</div> },
                  { label: 'Date',     value: <div style={{ fontSize: F.body, fontWeight: 600, color: '#374151' }}>{dateStr}</div> },
                  { label: 'Status',   value: <Chip label="✓ Successful" size="small" style={{ fontSize: F.meta }} sx={{ backgroundColor: '#dcfce7', color: '#166634', fontWeight: 700, '& .MuiChip-label': { fontSize: F.meta } }} /> },
                ].map((row) => row.value && (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: F.body, color: '#6b7280' }}>{row.label}</div>
                    {row.value}
                  </div>
                ))}
              </div>

              {receipt.message && (
                <>
                  <Divider sx={{ borderColor: '#ffedd5', my: 2.5 }} />
                  <div style={{ borderRadius: 12, padding: 'clamp(10px, 1.4vw, 14px)', background: '#fff7ed' }}>
                    <div style={{ fontSize: F.meta, color: '#9ca3af', marginBottom: 4 }}>Your message</div>
                    <div style={{ fontSize: F.body, color: '#374151', fontStyle: 'italic' }}>"{receipt.message}"</div>
                  </div>
                </>
              )}

              <Divider sx={{ borderColor: '#ffedd5', my: 2.5 }} />

              {/* Impact */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'clamp(10px, 1.4vw, 14px)', borderRadius: 12, background: '#fff7ed', marginBottom: 'clamp(14px, 2vw, 22px)' }}>
                <People style={{ color: '#ea580c', fontSize: 'clamp(20px, 2.8vw, 28px)', flexShrink: 0 }} />
                <div style={{ fontSize: F.body, color: '#374151', lineHeight: 1.5 }}>
                  Your contribution joins <strong>{(Math.floor(Math.random() * 1000) + 500).toLocaleString()}</strong> others powering this campaign. Together, you're changing lives.
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button fullWidth startIcon={<Download style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />} variant="outlined"
                  style={{ fontSize: F.btn }}
                  sx={{ borderColor: '#fdba74', color: '#ea580c', borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.25, '&:hover': { backgroundColor: '#fff7ed' } }}>
                  Download Receipt PDF
                </Button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Button component={Link} to="/civictax/campaigns" startIcon={<ArrowForward style={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />} variant="contained"
                    style={{ fontSize: F.btn }}
                    sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', py: 1.25, boxShadow: '0 4px 14px rgba(234,88,12,0.3)', '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' } }}>
                    More Campaigns
                  </Button>
                  <Button component={Link} to="/" startIcon={<Home style={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />} variant="outlined"
                    style={{ fontSize: F.btn }}
                    sx={{ borderColor: '#e5e7eb', color: '#6b7280', borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1.25 }}>
                    Home
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }, [receipt, isLoading, navigate, transactionId]);

  const leftSidebar  = useMemo(() => <CampaignsBrowseSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CampaignsBrowseSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveContributionReceiptPage = memo(ActiveContributionReceiptPage);
export default function ContributionReceiptPage() { return <MemoizedActiveContributionReceiptPage />; }
