import { memo, useState } from 'react';
import { Button, Chip, IconButton, Tooltip } from '@mui/material';
import { LocationOn, People, CalendarToday, Bookmark, BookmarkBorder, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CampaignProgressBar from './CampaignProgressBar';
import { CAMPAIGN_CATEGORIES } from '../mock/mockCampaigns';

const F = {
  title: 'clamp(1.44rem, 2.4vw, 1.96rem)',
  body:  'clamp(1.3rem,  2vw,   1.64rem)',
  meta:  'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:   'clamp(1.3rem,  2vw,   1.56rem)',
};

const STATUS_CONFIG = {
  active:    { label: 'Active',       bg: '#dcfce7', color: '#166534' },
  completed: { label: 'Goal Reached!',bg: '#dbeafe', color: '#1e40af' },
  paused:    { label: 'Paused',       bg: '#fef3c7', color: '#92400e' },
};

const PRIORITY_DOT = {
  critical: '#dc2626',
  high:     '#ea580c',
  medium:   '#d97706',
  low:      '#6b7280',
};

function CampaignCard({ campaign, index = 0 }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  if (!campaign) return null;

  const categoryInfo = CAMPAIGN_CATEGORIES.find((c) => c.id === campaign.category);
  const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.active;
  const daysLeft     = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -5, boxShadow: '0 24px 48px rgba(234,88,12,0.18)' }}
      data-testid="campaign-card"
      style={{ backgroundColor: 'white', borderRadius: 'clamp(14px, 2vw, 20px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #ffedd5' }}
    >
      <div style={{ height: 5, width: '100%', background: 'linear-gradient(90deg, #f97316 0%, #ea580c 60%, #c2410c 100%)' }} />

      <div style={{ padding: 'clamp(16px,2.5vw,26px)', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Top Row: chips + save */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {categoryInfo && (
              <Chip label={`${categoryInfo.icon} ${categoryInfo.label}`} size="small"
                style={{ fontSize: F.meta }}
                sx={{ backgroundColor: categoryInfo.bgColor, color: categoryInfo.color, fontWeight: 700, height: 'clamp(24px, 3vw, 30px)', '& .MuiChip-label': { fontSize: F.meta } }} />
            )}
            <Chip label={statusConfig.label} size="small"
              style={{ fontSize: F.meta }}
              sx={{ backgroundColor: statusConfig.bg, color: statusConfig.color, fontWeight: 700, height: 'clamp(24px, 3vw, 30px)', '& .MuiChip-label': { fontSize: F.meta } }} />
            {campaign.priority && (
              <Tooltip title={`${campaign.priority} priority`}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', backgroundColor: PRIORITY_DOT[campaign.priority] || '#9ca3af' }} />
              </Tooltip>
            )}
          </div>
          <IconButton size="small" onClick={() => setSaved((v) => !v)} sx={{ color: saved ? '#ea580c' : '#9ca3af', p: 0.5 }}>
            {saved ? <Bookmark style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} /> : <BookmarkBorder style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />}
          </IconButton>
        </div>

        {/* Title */}
        <div style={{ fontWeight: 800, fontSize: F.title, color: '#1f2937', lineHeight: 1.35, marginBottom: 'clamp(8px, 1.2vw, 14px)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {campaign.title}
        </div>

        {/* Description */}
        <div style={{ fontSize: F.body, color: '#6b7280', lineHeight: 1.7, marginBottom: 'clamp(16px, 2.4vw, 28px)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
          {campaign.description}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 'clamp(12px, 1.6vw, 18px)' }}>
          <CampaignProgressBar raised={campaign.raisedAmount} target={campaign.targetAmount} compact />
        </div>

        {/* Meta Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.6vw, 18px)', marginBottom: 'clamp(10px, 1.4vw, 16px)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <LocationOn style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: '#ea580c' }} />
            <span style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 500 }}>
              {campaign.jurisdiction?.lga}, {campaign.jurisdiction?.state}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <People style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: '#ea580c' }} />
            <span style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 500 }}>
              {campaign.contributorsCount.toLocaleString()} contributors
            </span>
          </div>
          {daysLeft > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarToday style={{ fontSize: 'clamp(13px, 1.6vw, 17px)', color: daysLeft <= 14 ? '#dc2626' : '#ea580c' }} />
              <span style={{ fontSize: F.meta, color: daysLeft <= 14 ? '#dc2626' : '#6b7280', fontWeight: daysLeft <= 14 ? 700 : 500 }}>
                {daysLeft}d left
              </span>
            </div>
          )}
        </div>

        {/* Organizer */}
        {campaign.organizer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
            {campaign.organizer.verified && (
              <span style={{ color: '#2563eb', fontSize: F.meta, fontWeight: 700 }}>✓ Verified</span>
            )}
            <span style={{ fontSize: F.meta, color: '#9ca3af' }}>{campaign.organizer.name}</span>
          </div>
        )}

        {/* CTA */}
        <Button fullWidth variant="contained" endIcon={<ArrowForward style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />}
          onClick={() => navigate(`/civictax/campaigns/${campaign.id}/view`)}
          style={{ fontSize: F.btn }}
          sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none', py: { xs: 1.5, sm: 1.75 }, boxShadow: '0 6px 18px rgba(234,88,12,0.32)', '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(234,88,12,0.45)' } }}>
          {campaign.status === 'completed' ? 'View Impact Report' : 'Contribute Now'}
        </Button>
      </div>
    </motion.div>
  );
}

export default memo(CampaignCard);
