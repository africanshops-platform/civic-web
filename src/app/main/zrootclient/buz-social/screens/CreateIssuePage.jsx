import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Send } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useReportIssue } from '../hooks/useSocialRepo';
import CommunityHeader from './shared-components/CommunityHeader';
import CommunityFeedSidebarLeft from './shared-components/CommunityFeedSidebarLeft';
import CommunityFeedSidebarRight from './shared-components/CommunityFeedSidebarRight';
import { JurisdictionSelector } from '../../civic-shared';
import { ISSUE_CATEGORIES } from '../mock';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low — Minor inconvenience' },
  { value: 'medium', label: 'Medium — Affecting daily life' },
  { value: 'high', label: 'High — Serious community impact' },
  { value: 'critical', label: 'Critical — Urgent health/safety risk' },
];

function ActiveCreateIssuePage() {
  const navigate = useNavigate();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [form, setForm] = useState({ title: '', category: '', priority: 'medium', description: '', address: '' });
  const [jurisdiction, setJurisdiction] = useState({});

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { mutate: reportIssue, isLoading, isSuccess } = useReportIssue();

  function update(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }
  function handleSubmit(e) {
    e.preventDefault();
    reportIssue({ ...form, jurisdiction }, { onSuccess: () => setTimeout(() => navigate('/community/feed'), 2200) });
  }

  const isValid = form.title.trim() && form.category && form.description.trim().length > 20;

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CommunityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Report an Issue" subtitle="Help your community by flagging problems directly to authorities" />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => {
    if (isSuccess) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: 'clamp(40px, 6vw, 72px) 24px' }}>
            <CheckCircle sx={{ fontSize: 'clamp(64px, 9vw, 100px)', color: '#059669', mb: 2 }} />
            <Typography sx={{ fontWeight: 900, color: '#111827', mb: 1.5, fontSize: F.sectionH }}>Issue Reported!</Typography>
            <Typography sx={{ color: '#4b5563', lineHeight: 1.8, mb: 3, fontSize: F.body, maxWidth: 480, mx: 'auto' }}>
              Your issue has been submitted. Relevant authorities have been notified and the community can now see it.
            </Typography>
            <Button component={Link} to="/community/feed" variant="contained"
              sx={{ background: 'linear-gradient(135deg,#059669 0%,#0f766e 100%)', color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none', fontSize: F.btn, px: 'clamp(14px, 2.2vw, 24px)', py: 'clamp(10px, 1.4vw, 16px)' }}>
              Back to Community Feed
            </Button>
          </motion.div>
        </div>
      );
    }
    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
            <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: F.sectionH, mb: 1 }}>Report a Community Issue</Typography>
            <Typography sx={{ color: '#4b5563', fontSize: F.body, lineHeight: 1.7 }}>Be specific. Your report goes directly to the responsible local authority and is publicly visible.</Typography>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.4vw, 24px)' }}>
            <div style={{ borderRadius: 'clamp(14px, 2vw, 20px)', padding: 'clamp(18px, 2.8vw, 28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <Typography sx={{ fontWeight: 800, color: '#111827', mb: 2, fontSize: F.subH }}>Issue Details</Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TextField label="Issue Title *" fullWidth placeholder="e.g. Collapsed drainage causing flooding on Admiralty Way"
                  value={form.title} onChange={(e) => update('title', e.target.value)} inputProps={{ maxLength: 120 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: F.body }, '& .MuiInputLabel-root': { fontSize: F.body } }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                  <FormControl required>
                    <InputLabel sx={{ fontSize: F.body }}>Category</InputLabel>
                    <Select value={form.category} label="Category" onChange={(e) => update('category', e.target.value)} sx={{ borderRadius: '12px', fontSize: F.body }}>
                      {ISSUE_CATEGORIES.map((c) => <MenuItem key={c.id} value={c.id} sx={{ fontSize: F.body }}><span style={{ marginRight: 8, fontSize: F.body }}>{c.icon}</span>{c.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel sx={{ fontSize: F.body }}>Priority Level</InputLabel>
                    <Select value={form.priority} label="Priority Level" onChange={(e) => update('priority', e.target.value)} sx={{ borderRadius: '12px', fontSize: F.body }}>
                      {PRIORITY_OPTIONS.map((p) => <MenuItem key={p.value} value={p.value} sx={{ fontSize: F.body }}>{p.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
                <TextField label="Description *" fullWidth multiline minRows={5}
                  placeholder="Describe the issue in detail. When did it start? How many people are affected?"
                  value={form.description} onChange={(e) => update('description', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: F.body }, '& .MuiInputLabel-root': { fontSize: F.body } }} />
                <TextField label="Location / Address" fullWidth placeholder="e.g. Admiralty Way, Lekki Phase 1, Lagos"
                  value={form.address} onChange={(e) => update('address', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: F.body }, '& .MuiInputLabel-root': { fontSize: F.body } }} />
              </div>
            </div>
            <div style={{ borderRadius: 'clamp(14px, 2vw, 20px)', padding: 'clamp(18px, 2.8vw, 28px)', background: 'white', border: '1px solid #e5e7eb' }}>
              <Typography sx={{ fontWeight: 800, color: '#111827', mb: 2, fontSize: F.subH }}>Jurisdiction</Typography>
              <JurisdictionSelector value={jurisdiction} onChange={setJurisdiction} />
            </div>
            <Button type="submit" variant="contained" size="large" fullWidth disabled={!isValid || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Send sx={{ fontSize: 'clamp(18px, 2.2vw, 22px)' }} />}
              sx={{ background: 'linear-gradient(135deg,#059669 0%,#0f766e 100%)', color: 'white', fontWeight: 800, borderRadius: '16px', textTransform: 'none', fontSize: F.btn, py: 'clamp(10px, 1.6vw, 18px)', '&:hover': { filter: 'brightness(0.92)' }, '&:disabled': { opacity: 0.55 } }}>
              {isLoading ? 'Submitting...' : 'Submit Issue Report'}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, jurisdiction, isLoading, isSuccess]);

  const leftSidebar = useMemo(() => <CommunityFeedSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CommunityFeedSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveCreateIssuePage = memo(ActiveCreateIssuePage);
export default function CreateIssuePage() { return <MemoizedActiveCreateIssuePage />; }
