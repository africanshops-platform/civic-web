import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Button, Chip, Avatar, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { ArrowBack, ThumbUp, Visibility, LocationOn, Business } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useIssueDetail, useUpvoteIssue, usePostComment } from '../hooks/useSocialRepo';
import CommunityHeader from './shared-components/CommunityHeader';
import CommunityFeedSidebarLeft from './shared-components/CommunityFeedSidebarLeft';
import CommunityFeedSidebarRight from './shared-components/CommunityFeedSidebarRight';
import IssueCommentThread from '../components/IssueCommentThread';
import StatusBadge from '../components/StatusBadge';
import { CivicLoadingSkeleton } from '../../civic-shared';
import { ISSUE_CATEGORIES } from '../mock';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
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

function ActiveIssueDetailPage() {
  const { issueId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useIssueDetail(issueId);
  const { mutate: upvote } = useUpvoteIssue();
  const { mutate: postComment, isLoading: isPosting } = usePostComment();
  const issue = useMemo(() => data?.data?.issue, [data]);
  const comments = useMemo(() => data?.data?.comments || [], [data]);
  const catInfo = useMemo(() => issue ? (ISSUE_CATEGORIES.find((c) => c.id === issue.category) || {}) : {}, [issue]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CommunityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Issue Detail" subtitle="View and discuss community issues" />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => {
    if (isLoading) return <div className="flex-auto p-6 sm:p-8"><CivicLoadingSkeleton /></div>;
    if (isError || !issue) return (
      <div className="flex-auto p-6 sm:p-8" style={{ textAlign: 'center', color: '#6b7280', paddingTop: 40, fontSize: F.body }}>
        Issue not found. <Link to="/community/feed">Go back to feed</Link>
      </div>
    );
    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Button component={Link} to="/community/feed" startIcon={<ArrowBack sx={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />}
            sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 2.5, px: 0, fontSize: F.body }}>
            Back to Feed
          </Button>

          {/* Header card */}
          <div style={{ borderRadius: 'clamp(16px, 2.4vw, 24px)', padding: 'clamp(18px, 3.2vw, 32px)', background: catInfo.bgColor || '#f9fafb', border: `2px solid ${catInfo.color || '#e5e7eb'}33`, marginBottom: 'clamp(16px, 2.4vw, 24px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)' }}>{catInfo.icon || '📌'}</span>
                <Chip label={catInfo.label || issue.category} size="small" sx={{ background: (catInfo.color || '#059669') + '20', color: catInfo.color || '#059669', fontWeight: 800, fontSize: F.meta }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <StatusBadge status={issue.status} size="medium" />
                <StatusBadge priority={issue.priority} size="medium" />
              </div>
            </div>
            <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: F.sectionH, lineHeight: 1.25, mb: 1.5 }}>{issue.title}</Typography>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: F.meta, marginBottom: 18 }}>
              <LocationOn sx={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />
              {issue.location?.address || `${issue.jurisdiction.lga}, ${issue.jurisdiction.state}`}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {[{ icon: <ThumbUp sx={{ fontSize: 'clamp(13px, 1.6vw, 17px)' }} />, value: issue.upvotes.toLocaleString(), label: 'upvotes' }, { icon: <Visibility sx={{ fontSize: 'clamp(13px, 1.6vw, 17px)' }} />, value: issue.views.toLocaleString(), label: 'views' }].map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: F.meta, fontWeight: 600 }}>
                  {s.icon}{s.value} {s.label}
                </div>
              ))}
              <button onClick={() => upvote(issue.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: catInfo.color || '#059669', color: 'white', border: 'none', borderRadius: 12, padding: 'clamp(7px, 1vw, 10px) clamp(14px, 2vw, 20px)', fontSize: F.btn, fontWeight: 800, cursor: 'pointer' }}>
                <ThumbUp sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} /> Upvote
              </button>
            </div>
          </div>

          {/* Content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,520px),1fr))', gap: 'clamp(14px, 2.2vw, 24px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 22px)' }}>
              <div style={{ borderRadius: 'clamp(14px, 2vw, 20px)', padding: 'clamp(18px, 2.8vw, 28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: F.subH, mb: 1.5 }}>Description</Typography>
                <Typography sx={{ color: '#374151', lineHeight: 1.9, fontSize: F.body }}>{issue.description}</Typography>
              </div>
              <div style={{ borderRadius: 'clamp(14px, 2vw, 20px)', padding: 'clamp(18px, 2.8vw, 28px)', background: 'white', border: '1px solid #e5e7eb' }}>
                <IssueCommentThread comments={comments} onPostComment={(body) => postComment({ issueId: issue.id, body })} isPosting={isPosting} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.8vw, 18px)' }}>
              <div style={{ borderRadius: 18, padding: 'clamp(14px, 2.2vw, 22px)', background: 'white', border: '1px solid #e5e7eb' }}>
                <Typography sx={{ fontWeight: 800, color: '#111827', mb: 1.5, fontSize: F.subH }}>Reported By</Typography>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar sx={{ width: 'clamp(36px, 4.5vw, 44px)', height: 'clamp(36px, 4.5vw, 44px)', bgcolor: catInfo.color || '#6b7280', fontSize: F.body }}>{issue.reportedBy.name.charAt(0)}</Avatar>
                  <div>
                    <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: F.body }}>{issue.reportedBy.name}</Typography>
                    <Typography sx={{ fontSize: F.meta, color: '#9ca3af' }}>{new Date(issue.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</Typography>
                  </div>
                </div>
              </div>
              {issue.assignedTo && (
                <div style={{ borderRadius: 18, padding: 'clamp(14px, 2.2vw, 22px)', background: 'white', border: '1px solid #e5e7eb' }}>
                  <Typography sx={{ fontWeight: 800, color: '#111827', mb: 1.5, fontSize: F.subH }}>Assigned To</Typography>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Business sx={{ color: '#1d4ed8', fontSize: 'clamp(20px, 2.8vw, 28px)' }} />
                    <div>
                      <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: F.body }}>{issue.assignedTo.name}</Typography>
                      <Typography sx={{ fontSize: F.meta, color: '#9ca3af' }}>{issue.assignedTo.type.replace(/_/g, ' ')}</Typography>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ borderRadius: 18, padding: 'clamp(14px, 2.2vw, 22px)', background: 'white', border: '1px solid #e5e7eb' }}>
                <Typography sx={{ fontWeight: 800, color: '#111827', mb: 1.5, fontSize: F.subH }}>Tags</Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {issue.tags.map((tag) => <Chip key={tag} label={`#${tag}`} size="small" sx={{ background: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: F.meta }} />)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }, [issue, comments, catInfo, isLoading, isError, isPosting, upvote, postComment]);

  const leftSidebar = useMemo(() => <CommunityFeedSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CommunityFeedSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveIssueDetailPage = memo(ActiveIssueDetailPage);
export default function IssueDetailPage() { return <MemoizedActiveIssueDetailPage />; }
