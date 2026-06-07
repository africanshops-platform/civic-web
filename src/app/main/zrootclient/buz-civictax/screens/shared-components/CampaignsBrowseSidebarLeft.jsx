import { memo, useState } from 'react';
import { Button, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FilterList, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { JurisdictionSelector } from '../../../civic-shared';
import { CAMPAIGN_CATEGORIES } from '../../mock/mockCampaigns';

const F = {
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
  btn:  'clamp(1.3rem, 2vw,   1.56rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

const STATUS_OPTIONS = [
  { value: '',          label: 'All'       },
  { value: 'active',    label: 'Active'    },
  { value: 'completed', label: 'Completed' },
  { value: 'paused',    label: 'Paused'    },
];

const NAV_LINKS = [
  { label: 'Browse Campaigns',  path: '/civictax/campaigns',        icon: '🏛️' },
  { label: 'My Contributions',  path: '/civictax/my-contributions', icon: '💰' },
  { label: 'Project Tracker',   path: '/civictax/projects',         icon: '🏗️' },
  { label: 'Compulsory Tax',    path: '/civictax/compulsory-tax',   icon: '📊' },
];

function CampaignsBrowseSidebarLeft({ onFilterChange }) {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus,   setSelectedStatus]   = useState('');
  const [jurisdiction,     setJurisdiction]     = useState({});

  const handleApply = () => onFilterChange?.({ category: selectedCategory, status: selectedStatus, ...jurisdiction });
  const handleReset = () => { setSelectedCategory(''); setSelectedStatus(''); setJurisdiction({}); onFilterChange?.({}); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 'clamp(14px, 2vw, 20px)', overflowY: 'auto', background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(14px, 2vw, 20px)' }}>
        <div style={{ width: 'clamp(30px, 4vw, 38px)', height: 'clamp(30px, 4vw, 38px)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', flexShrink: 0 }}>
          <FilterList style={{ color: 'white', fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
        </div>
        <div style={{ fontWeight: 800, fontSize: F.subH, color: '#1f2937' }}>Filter Campaigns</div>
      </div>

      <Divider sx={{ borderColor: '#ffedd5', mb: 2.5 }} />

      {/* ── Category ── */}
      <div style={{ marginBottom: 'clamp(14px, 2vw, 20px)' }}>
        <div style={{ fontWeight: 700, fontSize: F.meta, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Category
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <button onClick={() => setSelectedCategory('')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'clamp(8px,1.2vw,12px) clamp(10px,1.4vw,14px)', borderRadius: 10, cursor: 'pointer', width: '100%', textAlign: 'left', backgroundColor: !selectedCategory ? '#fff7ed' : 'transparent', border: `1.5px solid ${!selectedCategory ? '#ea580c' : 'transparent'}` }}>
            <span style={{ fontSize: F.body }}>🌍</span>
            <span style={{ fontSize: F.body, fontWeight: !selectedCategory ? 700 : 500, color: !selectedCategory ? '#ea580c' : '#374151' }}>All Categories</span>
          </button>
          {CAMPAIGN_CATEGORIES.map((cat) => (
            <motion.button key={cat.id} whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'clamp(8px,1.2vw,12px) clamp(10px,1.4vw,14px)', borderRadius: 10, cursor: 'pointer', width: '100%', textAlign: 'left', backgroundColor: selectedCategory === cat.id ? cat.bgColor : 'transparent', border: `1.5px solid ${selectedCategory === cat.id ? cat.color : 'transparent'}` }}>
              <span style={{ fontSize: F.body }}>{cat.icon}</span>
              <span style={{ fontSize: F.body, fontWeight: selectedCategory === cat.id ? 700 : 500, color: selectedCategory === cat.id ? cat.color : '#374151' }}>{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <Divider sx={{ borderColor: '#ffedd5', mb: 2.5 }} />

      {/* ── Status ── */}
      <div style={{ marginBottom: 'clamp(14px, 2vw, 20px)' }}>
        <div style={{ fontWeight: 700, fontSize: F.meta, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Status
        </div>
        <ToggleButtonGroup value={selectedStatus} exclusive onChange={(_, v) => setSelectedStatus(v ?? '')} orientation="vertical" sx={{ width: '100%', gap: 0.5 }}>
          {STATUS_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}
              style={{ fontSize: F.body }}
              sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: '10px !important', border: '1.5px solid #ffedd5 !important', textTransform: 'none', fontWeight: 600, py: 1, color: '#374151', '&.Mui-selected': { backgroundColor: '#fff7ed', color: '#ea580c', borderColor: '#ea580c !important' }, '&:hover': { backgroundColor: '#fff7ed' } }}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <Divider sx={{ borderColor: '#ffedd5', mb: 2.5 }} />

      {/* ── Jurisdiction ── */}
      <div style={{ marginBottom: 'clamp(14px, 2vw, 20px)' }}>
        <JurisdictionSelector onChange={setJurisdiction} />
      </div>

      <Divider sx={{ borderColor: '#ffedd5', mb: 2.5 }} />

      {/* ── Quick Nav ── */}
      <div style={{ marginBottom: 'clamp(14px, 2vw, 20px)' }}>
        <div style={{ fontWeight: 700, fontSize: F.meta, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Quick Nav
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path}
                style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 14px)', padding: 'clamp(9px,1.3vw,13px) clamp(12px,1.6vw,16px)', borderRadius: 10, textDecoration: 'none', fontSize: F.body, fontWeight: isActive ? 700 : 500, backgroundColor: isActive ? '#fff7ed' : 'transparent', border: `1.5px solid ${isActive ? '#ea580c' : 'transparent'}`, color: isActive ? '#ea580c' : '#374151', transition: 'all 0.18s' }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = '#fff7ed88'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
              >
                <span style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)', lineHeight: 1 }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
        <Button fullWidth variant="contained" onClick={handleApply}
          style={{ fontSize: F.btn }}
          sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', py: 1.25, boxShadow: '0 4px 14px rgba(234,88,12,0.3)', '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' } }}>
          Apply Filters
        </Button>
        <Button fullWidth variant="outlined" startIcon={<Refresh style={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />} onClick={handleReset}
          style={{ fontSize: F.btn }}
          sx={{ borderColor: '#fdba74', color: '#ea580c', fontWeight: 600, borderRadius: '12px', textTransform: 'none', py: 1, '&:hover': { borderColor: '#ea580c', backgroundColor: '#fff7ed' } }}>
          Clear All
        </Button>
      </div>
    </div>
  );
}

export default memo(CampaignsBrowseSidebarLeft);
