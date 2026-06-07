import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, Chip, Avatar } from '@mui/material';
import { LocationOn, People, CalendarToday, ArrowBack, Share } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useCampaignDetail } from '../hooks/useCivicTaxRepo';
import CivicTaxHeader from './shared-components/CivicTaxHeader';
import CampaignsBrowseSidebarLeft from './shared-components/CampaignsBrowseSidebarLeft';
import CampaignsBrowseSidebarRight from './shared-components/CampaignsBrowseSidebarRight';
import CampaignProgressBar from '../components/CampaignProgressBar';
import ContributionForm from '../components/ContributionForm';
import ProjectMilestoneTimeline from '../components/ProjectMilestoneTimeline';
import { CivicLoadingSkeleton } from '../../civic-shared';
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

function ActiveCampaignDetailPage() {
  const { campaignId } = useParams();
  const navigate       = useNavigate();
  const isMobile       = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useCampaignDetail(campaignId);
  const campaign = useMemo(() => data?.data?.campaign, [data]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CivicTaxHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Campaign Detail" subtitle="Track progress & contribute" showContributeBtn />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => {
    if (isLoading) return <div className="flex-auto p-6 sm:p-8"><CivicLoadingSkeleton message="Loading campaign details..." cardCount={2} variant="list" /></div>;

    if (isError || !campaign) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={{ fontWeight: 700, color: '#dc2626', fontSize: F.body, marginBottom: 16 }}>Campaign not found.</div>
          <Button onClick={() => navigate('/civictax/campaigns')} variant="outlined"
            style={{ fontSize: F.btn }}
            sx={{ borderColor: '#ea580c', color: '#ea580c', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
            Back to Campaigns
          </Button>
        </div>
      );
    }

    const categoryInfo = CAMPAIGN_CATEGORIES.find((c) => c.id === campaign.category);
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg, #fafaf9 0%, #fff7ed 100%)', minHeight: '100%' }}>

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: 'clamp(16px, 2vw, 24px)' }}>
          <Button startIcon={<ArrowBack style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />} onClick={() => navigate(-1)}
            style={{ fontSize: F.body }}
            sx={{ color: '#ea580c', textTransform: 'none', fontWeight: 600, borderRadius: '10px', '&:hover': { backgroundColor: '#fff7ed' } }}>
            Back to Campaigns
          </Button>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: 'clamp(20px, 3vw, 36px)' }}>

          {/* Left: info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.4vw, 24px)' }}>

            {/* Header card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              style={{ background: 'white', borderRadius: 24, padding: 'clamp(18px, 2.8vw, 28px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ffedd5' }}>
              <div style={{ height: 4, width: '100%', borderRadius: 4, marginBottom: 'clamp(14px, 2vw, 22px)', background: 'linear-gradient(90deg, #f97316, #ea580c, #c2410c)' }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'clamp(12px, 1.6vw, 18px)' }}>
                {categoryInfo && (
                  <Chip label={`${categoryInfo.icon} ${categoryInfo.label}`} size="small"
                    style={{ fontSize: F.meta }}
                    sx={{ backgroundColor: categoryInfo.bgColor, color: categoryInfo.color, fontWeight: 700, '& .MuiChip-label': { fontSize: F.meta } }} />
                )}
                <Chip label={campaign.status === 'completed' ? '🏆 Goal Reached' : '🟢 Active'} size="small"
                  style={{ fontSize: F.meta }}
                  sx={{ backgroundColor: campaign.status === 'completed' ? '#dbeafe' : '#dcfce7', color: campaign.status === 'completed' ? '#1e40af' : '#166534', fontWeight: 700, '& .MuiChip-label': { fontSize: F.meta } }} />
                {campaign.organizer?.verified && (
                  <Chip label="✓ Verified Organizer" size="small"
                    style={{ fontSize: F.meta }}
                    sx={{ backgroundColor: '#f0fdf4', color: '#15803d', fontWeight: 700, '& .MuiChip-label': { fontSize: F.meta } }} />
                )}
              </div>
              <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#1f2937', lineHeight: 1.3, marginBottom: 'clamp(12px, 1.6vw, 18px)' }}>
                {campaign.title}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(10px, 1.6vw, 18px)', marginBottom: 'clamp(12px, 1.6vw, 18px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <LocationOn style={{ color: '#ea580c', fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
                  <span style={{ fontSize: F.meta, color: '#374151', fontWeight: 500 }}>{campaign.jurisdiction?.lga}, {campaign.jurisdiction?.state}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <People style={{ color: '#ea580c', fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
                  <span style={{ fontSize: F.meta, color: '#374151', fontWeight: 500 }}>{campaign.contributorsCount.toLocaleString()} contributors</span>
                </div>
                {daysLeft > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CalendarToday style={{ color: daysLeft <= 14 ? '#dc2626' : '#ea580c', fontSize: 'clamp(13px, 1.6vw, 17px)' }} />
                    <span style={{ fontSize: F.meta, color: daysLeft <= 14 ? '#dc2626' : '#374151', fontWeight: daysLeft <= 14 ? 700 : 500 }}>{daysLeft} days left</span>
                  </div>
                )}
              </div>
              <CampaignProgressBar raised={campaign.raisedAmount} target={campaign.targetAmount} />
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
              style={{ background: 'white', borderRadius: 24, padding: 'clamp(18px, 2.8vw, 28px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ffedd5' }}>
              <div style={{ fontWeight: 800, fontSize: F.subH, color: '#1f2937', marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>About This Campaign</div>
              <div style={{ color: '#4b5563', fontSize: F.body, lineHeight: 1.8 }}>{campaign.description}</div>
              {campaign.impactStatement && (
                <div style={{ marginTop: 16, padding: 'clamp(12px, 1.6vw, 18px)', borderRadius: 16, background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fdba74' }}>
                  <div style={{ fontSize: F.body, fontWeight: 700, color: '#ea580c' }}>🎯 Impact: {campaign.impactStatement}</div>
                </div>
              )}
            </motion.div>

            {/* Projects */}
            {campaign.projects?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
                style={{ background: 'white', borderRadius: 24, padding: 'clamp(18px, 2.8vw, 28px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ffedd5' }}>
                <div style={{ fontWeight: 800, fontSize: F.subH, color: '#1f2937', marginBottom: 'clamp(14px, 2vw, 22px)' }}>Project Tracking</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 3vw, 32px)' }}>
                  {campaign.projects.map((project) => (
                    <div key={project.id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: F.body, color: '#1f2937' }}>{project.title}</div>
                        <div style={{ fontSize: F.meta, color: '#ea580c', fontWeight: 700 }}>{project.completionPercentage}% done</div>
                      </div>
                      <ProjectMilestoneTimeline milestones={[]} projectTitle="" compact />
                      <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: F.meta, color: '#6b7280' }}>
                        <span>Budget: ₦{Number(project.budget).toLocaleString()}</span>
                        <span>Spent: ₦{Number(project.spent).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: contribution panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
              style={{ background: 'white', borderRadius: 24, padding: 'clamp(18px, 2.8vw, 28px)', boxShadow: '0 4px 20px rgba(234,88,12,0.1)', border: '1px solid #ffedd5' }}>
              <div style={{ fontWeight: 800, fontSize: F.subH, color: '#1f2937', marginBottom: 'clamp(14px, 2vw, 22px)' }}>Make a Contribution</div>
              <ContributionForm campaignId={campaign.id} campaignTitle={campaign.title} />
            </motion.div>

            {campaign.organizer && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ background: 'white', borderRadius: 18, padding: 'clamp(14px, 2vw, 20px)', border: '1px solid #ffedd5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar sx={{ backgroundColor: '#fff7ed', color: '#ea580c', width: 'clamp(36px, 5vw, 44px)', height: 'clamp(36px, 5vw, 44px)', fontSize: F.body }}>🏛️</Avatar>
                  <div>
                    <div style={{ fontSize: F.meta, color: '#9ca3af' }}>Organised by</div>
                    <div style={{ fontSize: F.body, fontWeight: 700, color: '#1f2937' }}>
                      {campaign.organizer.name}
                      {campaign.organizer.verified && <span style={{ color: '#2563eb', marginLeft: 4 }}>✓</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <Button fullWidth startIcon={<Share style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />} variant="outlined"
              style={{ fontSize: F.btn }}
              sx={{ borderColor: '#fdba74', color: '#ea580c', borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.25, '&:hover': { backgroundColor: '#fff7ed' } }}>
              Share this Campaign
            </Button>
          </div>
        </div>
      </div>
    );
  }, [campaign, isLoading, isError, navigate]);

  const leftSidebar  = useMemo(() => <CampaignsBrowseSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CampaignsBrowseSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveCampaignDetailPage = memo(ActiveCampaignDetailPage);
export default function CampaignDetailPage() { return <MemoizedActiveCampaignDetailPage />; }
