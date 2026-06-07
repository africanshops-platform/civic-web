import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button, Chip, TextField, InputAdornment } from '@mui/material';
import { Link } from 'react-router-dom';
import { Search, Forum, AddCircleOutline, ArrowForward } from '@mui/icons-material';
import { useIssues } from '../hooks/useSocialRepo';
import IssueCard from '../components/IssueCard';
import { CivicLoadingSkeleton, CivicEmptyState, CivicStatCard } from '../../civic-shared';
import { ISSUE_CATEGORIES, ISSUE_STATS } from '../mock';
import { CheckCircle, TrendingUp } from '@mui/icons-material';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
};

export default function CommunityFeedPublicPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const { data, isLoading, isError } = useIssues({ category: activeCategory });

  const issues = useMemo(() => {
    const all = data?.data?.issues || [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((i) => i.title.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px, 4vw, 48px)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
        <h1 style={{ margin: '0 0 8px', fontWeight: 900, color: '#111827', fontSize: F.sectionH }}>
          Community Issues Feed
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: F.body }}>
          See what your neighbours are reporting. Sign in to upvote, comment, or report your own issue.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 'clamp(16px, 2vw, 24px)' }}>
        <CivicStatCard icon={Forum} value={ISSUE_STATS.openIssues} label="Open Issues" />
        <CivicStatCard icon={TrendingUp} value={ISSUE_STATS.inProgressIssues} label="In Progress" />
        <CivicStatCard icon={CheckCircle} value={ISSUE_STATS.resolvedIssues} label="Resolved" />
        <CivicStatCard icon={ArrowForward} value={`${ISSUE_STATS.resolutionRate}%`} label="Resolution Rate" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 'clamp(14px, 2vw, 22px)' }}>
        <TextField
          size="small" placeholder="Search issues..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#9ca3af' }} /></InputAdornment> }}
          sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: F.body } }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Chip label="All" onClick={() => setActiveCategory('')} clickable
            sx={{ fontWeight: 700, fontSize: F.meta, background: !activeCategory ? '#059669' : '#f3f4f6', color: !activeCategory ? 'white' : '#374151' }} />
          {ISSUE_CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.label} onClick={() => setActiveCategory(c.id)} clickable
              icon={<span style={{ fontSize: F.meta }}>{c.icon}</span>}
              sx={{ fontWeight: 700, fontSize: F.meta, background: activeCategory === c.id ? c.color : c.bgColor, color: activeCategory === c.id ? 'white' : c.color }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'clamp(12px, 1.8vw, 18px)' }}>
        <Button component={Link} to="/sign-in" variant="contained" startIcon={<AddCircleOutline sx={{ fontSize: 'clamp(18px, 2.2vw, 22px)' }} />}
          sx={{ background: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.btn, px: 'clamp(12px, 2vw, 20px)', py: 'clamp(8px, 1.2vw, 12px)' }}>
          Sign In to Report Issue
        </Button>
      </div>

      {isLoading && <CivicLoadingSkeleton />}
      {isError && <CivicEmptyState title="Could not load issues" description="Please try again." />}
      {!isLoading && !isError && !issues.length && (
        <CivicEmptyState icon={<Forum sx={{ fontSize: 'clamp(48px, 7vw, 72px)', color: '#d1d5db' }} />} title="No issues found" description="Try a different filter." />
      )}
      {!isLoading && !isError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {issues.map((issue, i) => <IssueCard key={issue.id} issue={issue} index={i} />)}
        </div>
      )}
    </div>
  );
}
