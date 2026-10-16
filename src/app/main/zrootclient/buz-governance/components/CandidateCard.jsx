import { memo } from 'react';
import { motion } from 'framer-motion';
import { Avatar, Chip } from '@mui/material';
import { HowToVote } from '@mui/icons-material';
import { candidateColor } from '../constants';

/** A candidate as the voter sees them: name, optional party and manifesto. Never an internal user id. */
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

  const { name, party, manifesto, photoUrl } = candidate;
  const color = candidateColor(candidate.index ?? rank ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: (rank || 0) * 0.08 }}
      style={{ borderRadius: 20, padding: compact ? '16px 18px' : '20px 24px', background: 'white', border: '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: manifesto && !compact ? 12 : 0 }}>
        <Avatar src={photoUrl || undefined} sx={{ width: compact ? 44 : 56, height: compact ? 44 : 56, bgcolor: color, fontSize: compact ? '1.1rem' : '1.4rem', fontWeight: 700, flexShrink: 0 }}>
          {name.charAt(0)}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: compact ? '0.95rem' : '1.05rem', color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>{name}</div>
          {party && <Chip label={party} size="small" sx={{ backgroundColor: `${color}14`, color, fontWeight: 700, fontSize: '0.7rem', height: 22, border: `1px solid ${color}44` }} />}
        </div>
      </div>

      {!compact && manifesto && <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.6 }}>{manifesto}</div>}

      {showVoteBtn && (
        <motion.button
          type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onVote?.(candidate)}
          style={{ marginTop: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: color, color: 'white', border: 'none', borderRadius: 12, padding: '10px 16px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}
        >
          <HowToVote sx={{ fontSize: 18 }} />
          Vote for {name.split(' ')[0]}
        </motion.button>
      )}
    </motion.div>
  );
}

export default memo(CandidateCard);
