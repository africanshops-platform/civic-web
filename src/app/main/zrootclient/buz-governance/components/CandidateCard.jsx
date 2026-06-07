import { memo } from 'react';
import { motion } from 'framer-motion';
import { Avatar, Chip, LinearProgress } from '@mui/material';
import { EmojiEvents, HowToVote } from '@mui/icons-material';

function CandidateCard({ candidate, rank, showVoteBtn, onVote, isLoading, compact = false }) {
  if (isLoading) {
    return (
      <div data-testid="candidate-card-skeleton" style={{ borderRadius: 16, padding: 20, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
        {[80, 60, 40].map((w) => (
          <div key={w} style={{ height: 14, width: `${w}%`, background: '#e5e7eb', borderRadius: 7, marginBottom: 10 }} />
        ))}
      </div>
    );
  }

  if (!candidate) return null;

  const { name, party, voteCount, percentage, status, runningMate, occupation } = candidate;
  const isLeading = status === 'leading';
  const isWinner = status === 'winner';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (rank || 0) * 0.08 }}
      style={{
        borderRadius: 20,
        padding: compact ? '16px 18px' : '20px 24px',
        background: isLeading || isWinner ? `${party.bgColor}` : 'white',
        border: `2px solid ${isLeading || isWinner ? party.color : '#e5e7eb'}`,
        boxShadow: isLeading || isWinner ? `0 8px 28px ${party.color}22` : '0 2px 8px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {(isLeading || isWinner) && (
        <div style={{
          position: 'absolute', top: 12, right: 14,
          display: 'flex', alignItems: 'center', gap: 4,
          background: party.color, color: 'white',
          borderRadius: 999, padding: '3px 10px',
          fontSize: '0.72rem', fontWeight: 700,
        }}>
          {isWinner ? <EmojiEvents sx={{ fontSize: 14 }} /> : null}
          {isWinner ? 'WINNER' : 'LEADING'}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <Avatar
          sx={{ width: compact ? 44 : 56, height: compact ? 44 : 56, bgcolor: party.color, fontSize: compact ? '1.1rem' : '1.4rem', fontWeight: 700, flexShrink: 0 }}
        >
          {name.charAt(0)}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: compact ? '0.95rem' : '1.05rem', color: '#111827', marginBottom: 3, lineHeight: 1.3 }}>
            {name}
          </div>
          {runningMate && !compact && (
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 4 }}>
              Running mate: {runningMate}
            </div>
          )}
          <Chip
            label={party.abbreviation}
            size="small"
            sx={{ backgroundColor: party.bgColor, color: party.color, fontWeight: 700, fontSize: '0.7rem', height: 22, border: `1px solid ${party.color}44` }}
          />
        </div>
      </div>

      {!compact && occupation && (
        <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 12 }}>{occupation}</div>
      )}

      {voteCount !== undefined && (
        <div style={{ marginBottom: compact ? 0 : 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>
              {voteCount.toLocaleString()} votes
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: party.color }}>{percentage}%</span>
          </div>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentage, 100)}
            sx={{
              height: 8, borderRadius: 4,
              backgroundColor: `${party.color}22`,
              '& .MuiLinearProgress-bar': { backgroundColor: party.color, borderRadius: 4 },
            }}
          />
        </div>
      )}

      {showVoteBtn && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onVote?.(candidate)}
          style={{
            marginTop: 14, width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: party.color, color: 'white',
            border: 'none', borderRadius: 12, padding: '10px 16px',
            fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <HowToVote sx={{ fontSize: 18 }} />
          Vote for {name.split(' ')[0]}
        </motion.button>
      )}
    </motion.div>
  );
}

export default memo(CandidateCard);
