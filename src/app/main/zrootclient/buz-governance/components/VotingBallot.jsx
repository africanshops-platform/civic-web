import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, CircularProgress } from '@mui/material';
import { CheckCircle, HowToVote, Warning } from '@mui/icons-material';
import CandidateCard from './CandidateCard';

function VotingBallot({ election, candidates = [], onSubmit, isSubmitting }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [step, setStep] = useState('select'); // select | confirm | done

  function handleSelect(candidate) {
    if (step !== 'select') return;
    setSelected(candidate);
  }

  function handleConfirm() {
    setStep('confirm');
  }

  function handleSubmit() {
    onSubmit?.({ electionId: election?.id, candidateId: selected?.id });
    setStep('done');
    setConfirmed(true);
  }

  function handleBack() {
    setStep('select');
  }

  if (step === 'done' || confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '48px 24px' }}
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, delay: 0.1 }}
        >
          <CheckCircle sx={{ fontSize: 80, color: '#16a34a', mb: 2 }} />
        </motion.div>
        <h2 style={{ fontWeight: 900, color: '#111827', margin: '0 0 12px', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
          Vote Recorded!
        </h2>
        <p style={{ color: '#6b7280', fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)', lineHeight: 1.75, maxWidth: 420, margin: '0 auto' }}>
          Your vote for <strong style={{ color: selected?.party?.color }}>{selected?.name}</strong> has been securely recorded.
          Your participation strengthens democracy.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 800, color: '#111827', margin: '0 0 6px', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}>
          {step === 'confirm' ? 'Confirm Your Vote' : 'Cast Your Vote'}
        </h3>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
          {step === 'confirm'
            ? 'Please review your selection carefully. Your vote cannot be changed once submitted.'
            : 'Select one candidate below. Your vote is secret and encrypted.'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {candidates.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  style={{
                    cursor: 'pointer',
                    outline: selected?.id === c.id ? `3px solid ${c.party.color}` : '3px solid transparent',
                    borderRadius: 20,
                    transition: 'outline 0.15s',
                  }}
                >
                  <CandidateCard candidate={c} rank={i} />
                </div>
              ))}
            </div>

            {selected && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Button
                  fullWidth variant="contained" size="large"
                  onClick={handleConfirm}
                  startIcon={<HowToVote />}
                  sx={{
                    background: `linear-gradient(135deg, ${selected.party.color} 0%, ${selected.party.color}cc 100%)`,
                    color: 'white', fontWeight: 800, borderRadius: '14px',
                    textTransform: 'none', fontSize: 'clamp(1rem, 1.7vw, 1.15rem)', py: 1.75,
                    '&:hover': { filter: 'brightness(0.92)', transform: 'translateY(-2px)' },
                  }}
                >
                  Continue with {selected.name.split(' ')[0]}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{
              padding: '20px 22px', borderRadius: 16,
              background: `${selected.party.bgColor}`,
              border: `2px solid ${selected.party.color}`,
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Warning sx={{ color: '#d97706', fontSize: 22 }} />
                <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>
                  This action cannot be undone
                </span>
              </div>
              <div style={{ fontSize: '0.92rem', color: '#374151', marginBottom: 8 }}>
                You are voting for:
              </div>
              <div style={{ fontWeight: 900, color: selected.party.color, fontSize: 'clamp(1.15rem, 2vw, 1.4rem)', marginBottom: 4 }}>
                {selected.name}
              </div>
              <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem' }}>
                {selected.party.name} ({selected.party.abbreviation})
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                variant="outlined" size="large" onClick={handleBack} fullWidth
                sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700, py: 1.5, color: '#374151', borderColor: '#d1d5db', '&:hover': { borderColor: '#9ca3af' } }}
              >
                Go Back
              </Button>
              <Button
                variant="contained" size="large" onClick={handleSubmit} fullWidth
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                sx={{
                  background: selected.party.color, color: 'white',
                  fontWeight: 800, borderRadius: '14px', textTransform: 'none',
                  fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)', py: 1.5,
                  '&:hover': { filter: 'brightness(0.9)' },
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit My Vote'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(VotingBallot);
