import { memo, useState } from 'react';
import { Typography, Button, TextField, InputAdornment, CircularProgress, Alert } from '@mui/material';
import { Favorite, Send } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useContributeToCampaign } from '../hooks/useCivicTaxRepo';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': { borderColor: '#fdba74' },
    '&:hover fieldset': { borderColor: '#ea580c' },
    '&.Mui-focused fieldset': { borderColor: '#ea580c' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#ea580c' },
};

function ContributionForm({ campaignId, campaignTitle }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { mutate: contribute, isLoading, isSuccess, data } = useContributeToCampaign();

  const handlePreset = (val) => { setAmount(String(val)); setError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(amount, 10);
    if (!parsed || parsed < 100) { setError('Minimum contribution is ₦100.'); return; }
    setError('');
    contribute(
      { campaignId, amount: parsed, message },
      {
        onSuccess: (res) => {
          if (res?.data?.success) {
            setTimeout(() => navigate(`/civictax/${res.data.transactionId}/receipt`), 1200);
          }
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 24px rgba(234,88,12,0.4)' }}
        >
          <Favorite sx={{ color: 'white', fontSize: '2rem' }} />
        </motion.div>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#1f2937', mb: 1 }}>
          Contribution Received!
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: '#6b7280' }}>
          Redirecting to your receipt...
        </Typography>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      <div>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151', mb: 1.5 }}>
          Select or enter an amount
        </Typography>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PRESET_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handlePreset(val)}
              className="py-2 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: String(amount) === String(val)
                  ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                  : '#fff7ed',
                color: String(amount) === String(val) ? 'white' : '#ea580c',
                border: `1.5px solid ${String(amount) === String(val) ? '#ea580c' : '#fdba74'}`,
                boxShadow: String(amount) === String(val) ? '0 4px 12px rgba(234,88,12,0.25)' : 'none',
              }}
            >
              ₦{val.toLocaleString()}
            </button>
          ))}
        </div>

        <TextField
          fullWidth
          label="Custom Amount (₦)"
          value={amount}
          onChange={(e) => { setAmount(e.target.value.replace(/\D/g, '')); setError(''); }}
          InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
          sx={INPUT_SX}
          size="small"
        />
      </div>

      <TextField
        fullWidth
        label="Message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        multiline
        rows={2}
        placeholder="Share why you're contributing..."
        sx={INPUT_SX}
        size="small"
        inputProps={{ maxLength: 200 }}
      />

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.82rem' }}>{error}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        endIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <Send />}
        sx={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: 'white',
          fontWeight: 800,
          borderRadius: '14px',
          py: 1.75,
          fontSize: '1rem',
          textTransform: 'none',
          boxShadow: '0 6px 20px rgba(234,88,12,0.35)',
          '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', transform: 'translateY(-1px)' },
          '&:disabled': { background: '#e5e7eb', color: '#9ca3af', transform: 'none', boxShadow: 'none' },
        }}
      >
        {isLoading ? 'Processing...' : `Contribute ₦${parseInt(amount || 0).toLocaleString()}`}
      </Button>

      <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center' }}>
        🔒 Secured by Paystack. Funds go directly to verified project accounts.
      </Typography>
    </motion.form>
  );
}

export default memo(ContributionForm);
