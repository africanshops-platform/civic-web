import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { TextField, Button, CircularProgress, Autocomplete, Chip } from '@mui/material';
import { Save, CheckCircle } from '@mui/icons-material';

function CollationEntryForm({ election, candidates = [], wards = [], onSubmit, isSubmitting }) {
  const [selectedWard, setSelectedWard] = useState(null);
  const [votes, setVotes] = useState({});
  const [saved, setSaved] = useState(false);

  function handleVoteChange(candidateId, value) {
    setVotes((prev) => ({ ...prev, [candidateId]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      electionId: election?.id,
      wardId: selectedWard?.wardId,
      wardName: selectedWard?.wardName,
      results: candidates.map((c) => ({
        candidateId: c.id,
        party: c.party.abbreviation,
        votes: parseInt(votes[c.id] || 0, 10),
      })),
    };
    onSubmit?.(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
  const wardOptions = wards.length > 0 ? wards : [
    { wardId: 'ward_001', wardName: 'Eti-Osa I', lgaName: 'Eti-Osa' },
    { wardId: 'ward_002', wardName: 'Ikoyi-Obalende', lgaName: 'Lagos Island' },
    { wardId: 'ward_003', wardName: 'Agege North', lgaName: 'Agege' },
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      <div>
        <div style={{ fontWeight: 700, color: '#374151', marginBottom: 8, fontSize: '0.9rem' }}>Select Ward / Polling Unit</div>
        <Autocomplete
          options={wardOptions}
          getOptionLabel={(o) => `${o.wardName} — ${o.lgaName}`}
          value={selectedWard}
          onChange={(_, val) => setSelectedWard(val)}
          renderInput={(params) => (
            <TextField {...params} placeholder="Search ward..." size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          )}
        />
      </div>

      {selectedWard && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div style={{ fontWeight: 700, color: '#374151', marginBottom: 12, fontSize: '0.9rem' }}>Enter Votes Per Candidate</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {candidates.map((c) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12,
                background: c.party.bgColor, border: `1px solid ${c.party.color}44`,
              }}>
                <Chip
                  label={c.party.abbreviation}
                  size="small"
                  sx={{ backgroundColor: c.party.color, color: 'white', fontWeight: 700, minWidth: 48 }}
                />
                <span style={{ flex: 1, fontWeight: 700, fontSize: '0.88rem', color: '#111827' }}>{c.name}</span>
                <TextField
                  type="number"
                  size="small"
                  value={votes[c.id] || ''}
                  onChange={(e) => handleVoteChange(c.id, e.target.value)}
                  placeholder="0"
                  inputProps={{ min: 0 }}
                  sx={{ width: 110, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontWeight: 700 } }}
                />
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', borderRadius: 12, background: '#f3f4f6',
            marginTop: 12, fontWeight: 700,
          }}>
            <span style={{ color: '#374151', fontSize: '0.9rem' }}>Total Votes Entered</span>
            <span style={{ color: '#1d4ed8', fontSize: '1.05rem' }}>{totalVotes.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={!selectedWard || isSubmitting || totalVotes === 0}
        startIcon={saved ? <CheckCircle /> : isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Save />}
        sx={{
          background: saved ? '#16a34a' : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
          color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none',
          fontSize: '0.95rem', py: 1.5,
          '&:hover': { filter: 'brightness(0.92)' },
          '&:disabled': { opacity: 0.55 },
        }}
      >
        {saved ? 'Saved!' : isSubmitting ? 'Saving...' : 'Save Collation Entry'}
      </Button>
    </motion.form>
  );
}

export default memo(CollationEntryForm);
