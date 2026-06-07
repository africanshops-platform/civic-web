import { memo } from 'react';
import { Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { AddCircleOutline } from '@mui/icons-material';
import IssueFeed from '../../components/IssueFeed';
import { useUpvoteIssue } from '../../hooks/useSocialRepo';

const F = {
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
  btn:  'clamp(1.3rem, 2vw,   1.56rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

function CommunityFeedContent({ issues, isLoading, isError }) {
  const { mutate: upvote } = useUpvoteIssue();

  return (
    <div
      className="flex-auto p-6 sm:p-8"
      style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #f0fdf4 100%)', minHeight: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 'clamp(16px, 2vw, 24px)' }}>
        <div>
          <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: F.subH, lineHeight: 1.2, mb: 0.3 }}>
            Community Issues
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: F.body }}>
            {issues?.length
              ? `${issues.length} issue${issues.length !== 1 ? 's' : ''} in your area`
              : 'No issues match current filters'}
          </Typography>
        </div>
        <Button
          component={Link}
          to="/community/create-issue"
          variant="contained"
          startIcon={<AddCircleOutline sx={{ fontSize: 'clamp(18px, 2.2vw, 22px)' }} />}
          sx={{
            background: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)',
            color: 'white', fontWeight: 700, borderRadius: '12px',
            textTransform: 'none', fontSize: F.btn,
            px: 'clamp(12px, 2vw, 20px)', py: 'clamp(8px, 1.2vw, 12px)',
            boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
            '&:hover': { filter: 'brightness(0.92)', transform: 'translateY(-1px)' },
          }}
        >
          Report Issue
        </Button>
      </div>

      <IssueFeed issues={issues} isLoading={isLoading} isError={isError} onUpvote={upvote} />
    </div>
  );
}

export default memo(CommunityFeedContent);
