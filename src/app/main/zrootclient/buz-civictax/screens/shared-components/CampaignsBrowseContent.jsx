import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CivicLoadingSkeleton, CivicEmptyState, CivicPaginationBar, ClienttErrorPage } from '../../../civic-shared';
import CampaignCard from '../../components/CampaignCard';
import { CAMPAIGN_CATEGORIES } from '../../mock';

const F = {
  body:    'clamp(1.3rem, 2vw,   1.64rem)',
  meta:    'clamp(1.2rem, 1.8vw, 1.5rem)',
  sectionH:'clamp(2rem,   4vw,   3.4rem)',
  subH:    'clamp(1.4rem, 2.2vw, 1.8rem)',
};

function CampaignsBrowseContent({ campaigns, isLoading, isError, stats, activeCategory, pagination, onPageChange }) {
  const navigate = useNavigate();

  if (isLoading) return <CivicLoadingSkeleton message="Finding campaigns in your area..." cardCount={4} />;

  if (isError) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <ClienttErrorPage message="Error loading campaigns. Please try again." />
      </motion.div>
    );
  }

  const categoryInfo = CAMPAIGN_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #fef3e2 100%)', minHeight: '100vh' }}>

      {/* ── Section header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ marginBottom: 'clamp(16px, 2.4vw, 24px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          {categoryInfo && <span style={{ fontSize: 'clamp(1.4rem, 2.4vw, 2rem)' }}>{categoryInfo.icon}</span>}
          <div style={{ fontWeight: 900, color: '#1f2937', fontSize: F.sectionH }}>
            {categoryInfo ? categoryInfo.label : 'All'} Campaigns
          </div>
        </div>
        <div style={{ color: '#6b7280', fontSize: F.body }}>
          {campaigns?.length
            ? `${campaigns.length} campaign${campaigns.length > 1 ? 's' : ''} — contribute to change your community`
            : 'No campaigns found for current filters'}
        </div>

        {/* Stats bar */}
        {stats && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(12px, 2vw, 20px)', marginTop: 'clamp(12px, 1.6vw, 18px)', padding: 'clamp(12px, 1.8vw, 18px)', borderRadius: 16, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid #ffedd5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {[
              { dot: '#ea580c', text: <><strong style={{ color: '#ea580c' }}>{stats.activeCampaigns}</strong> active campaigns</> },
              { dot: '#16a34a', text: <><strong style={{ color: '#16a34a' }}>₦{(stats.totalRaised / 1000000).toFixed(1)}M</strong> raised total</> },
              { dot: '#2563eb', text: <><strong style={{ color: '#2563eb' }}>{stats.totalContributors.toLocaleString()}</strong> contributors nationwide</> },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.dot, flexShrink: 0 }} />
                <span style={{ fontSize: F.meta, color: '#6b7280' }}>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Campaign grid ── */}
      <AnimatePresence mode="wait">
        {!campaigns?.length ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CivicEmptyState type="campaigns" title="No campaigns found"
              description="No campaigns match your current filters. Try adjusting your category, status, or location."
              ctaLabel="Clear Filters" onCta={() => navigate('/civictax/campaigns')} />
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 'clamp(16px, 2.4vw, 24px)' }}>
            {campaigns.map((campaign, i) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <CivicPaginationBar pagination={pagination} onPageChange={onPageChange} theme="light" />
    </div>
  );
}

export default memo(CampaignsBrowseContent);
