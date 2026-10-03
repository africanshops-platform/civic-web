import { memo } from 'react';
import { LinearProgress, Typography } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const F = {
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  btn:  'clamp(1.3rem, 2vw,   1.56rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

/**
 * How a community issue becomes a funded project (civic-19/20): citizens of the LGA vote; once at least 60% of the votes
 * cast support it (with a minimum number of votes) voting closes and the LGA coordinator decides whether to make it a
 * campaign + project people can fund. A declined issue is closed for good — raise it again to restart the process.
 */
function IssueVotePanel({ issue, myVote, onVote, isVoting, accent = '#059669' }) {
  const policy = issue.votePolicy || { supportThreshold: 0.6, minVotes: 20 };
  const needPct = Math.round(policy.supportThreshold * 100);
  const enough = issue.votesCast >= policy.minVotes;
  const box = { borderRadius: 18, padding: 'clamp(14px, 2.2vw, 22px)', background: 'white', border: '1px solid #e5e7eb' };

  if (issue.status === 'declined') {
    return (
      <div style={{ ...box, background: '#fff1f2', borderColor: '#fecdd3' }}>
        <Typography sx={{ fontWeight: 800, color: '#9f1239', fontSize: F.subH, mb: 1 }}>Declined by your LGA coordinator</Typography>
        <Typography sx={{ color: '#374151', fontSize: F.body, lineHeight: 1.7 }}>{issue.declineReason || 'No reason was recorded.'}</Typography>
        <Typography sx={{ color: '#6b7280', fontSize: F.meta, mt: 1.5 }}>
          This issue is closed. If it is still important, raise it again as a new issue — it will need to win the community vote again.
        </Typography>
      </div>
    );
  }
  if (issue.status === 'converted') {
    return (
      <div style={{ ...box, background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <Typography sx={{ fontWeight: 800, color: '#166534', fontSize: F.subH, mb: 1 }}>This issue became a funded project</Typography>
        <Typography sx={{ color: '#374151', fontSize: F.body, lineHeight: 1.7 }}>
          The community voted for it and your LGA coordinator approved it. You can now contribute towards it.
        </Typography>
        {issue.campaignId && (
          <Link to={`/civic-subscriptions/campaigns/${issue.campaignId}`} style={{ color: '#166534', fontWeight: 800, fontSize: F.body }}>
            See the campaign →
          </Link>
        )}
      </div>
    );
  }
  if (issue.status === 'pending_review' || issue.status === 'converting') {
    return (
      <div style={{ ...box, background: '#fffbeb', borderColor: '#fde68a' }}>
        <Typography sx={{ fontWeight: 800, color: '#92400e', fontSize: F.subH, mb: 1 }}>The community has spoken</Typography>
        <Typography sx={{ color: '#374151', fontSize: F.body, lineHeight: 1.7 }}>
          {issue.upvotes} of {issue.votesCast} votes ({issue.supportPercent}%) supported this. Voting is closed and your LGA coordinator is
          deciding whether to make it a funded project.
        </Typography>
      </div>
    );
  }

  return (
    <div style={box}>
      <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: F.subH, mb: 0.5 }}>Should this become a funded project?</Typography>
      <Typography sx={{ color: '#6b7280', fontSize: F.meta, mb: 1.5 }}>
        Only verified citizens whose home or dwelling LGA is {issue.jurisdiction.lga} can vote — one vote each.
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: F.meta, color: '#374151', fontWeight: 700, marginBottom: 6 }}>
        <span>{issue.supportPercent}% support</span>
        <span>needs {needPct}% of at least {policy.minVotes} votes</span>
      </div>
      <LinearProgress variant="determinate" value={Math.min(100, issue.supportPercent)}
        sx={{ height: 10, borderRadius: 5, backgroundColor: '#e5e7eb', '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: issue.supportPercent >= needPct && enough ? '#16a34a' : accent } }} />
      <div style={{ fontSize: F.meta, color: '#6b7280', margin: '6px 0 14px' }}>
        {issue.votesCast} vote{issue.votesCast === 1 ? '' : 's'} cast{enough ? '' : ` · ${policy.minVotes - issue.votesCast} more needed before it can be presented`}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[{ type: 'UP', label: 'Support', Icon: ThumbUp, color: accent }, { type: 'DOWN', label: 'Not now', Icon: ThumbDown, color: '#6b7280' }].map(({ type, label, Icon, color }) => (
          <button key={type} disabled={isVoting} onClick={() => onVote(type)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: myVote === type ? color : 'white', color: myVote === type ? 'white' : color, border: `2px solid ${color}`, borderRadius: 12, padding: 'clamp(7px, 1vw, 10px) clamp(14px, 2vw, 20px)', fontSize: F.btn, fontWeight: 800, cursor: 'pointer' }}>
            <Icon sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} /> {label}{myVote === type ? ' ✓' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(IssueVotePanel);
