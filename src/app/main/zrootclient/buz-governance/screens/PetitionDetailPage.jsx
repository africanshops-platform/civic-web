import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, LinearProgress, Chip } from '@mui/material';
import { ArrowBack, CheckCircle, LocationOn } from '@mui/icons-material';
import { usePetitionDetail, useSignPetition } from '../hooks/useGovernanceRepo';
import { CivicLoadingSkeleton } from '../../civic-shared';

export default function PetitionDetailPage() {
  const { petitionId } = useParams();
  const { data, isLoading, isError } = usePetitionDetail(petitionId);
  const { mutate: signPetition, isLoading: isSigning, isSuccess } = useSignPetition();

  const petition = useMemo(() => data?.data?.petition, [data]);

  if (isLoading) return <div style={{ padding: 32 }}><CivicLoadingSkeleton /></div>;
  if (isError || !petition) return <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Could not load petition. <Link to="/governance/participate">Go back</Link></div>;

  const progressPct = Math.round((petition.currentSignatures / petition.targetSignatures) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(20px, 4vw, 40px)' }}
    >
      <Button component={Link} to="/governance/participate" startIcon={<ArrowBack />}
        sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 2, px: 0 }}>
        Back to Petitions
      </Button>

      {/* Header card */}
      <div style={{
        borderRadius: 24, padding: 'clamp(20px, 4vw, 32px)',
        background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
        border: '1px solid #c7d2fe', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <Chip label={petition.category.toUpperCase()} size="small"
            sx={{ background: '#1d4ed815', color: '#1d4ed8', fontWeight: 800 }} />
          <Chip label={petition.status.toUpperCase()} size="small"
            sx={{ background: petition.status === 'active' ? '#eff6ff' : '#f0fdf4', color: petition.status === 'active' ? '#1d4ed8' : '#16a34a', fontWeight: 800 }} />
        </div>
        <h1 style={{ margin: '0 0 12px', fontWeight: 900, color: '#1e1b4b', fontSize: 'clamp(1.3rem, 3vw, 2rem)', lineHeight: 1.25 }}>
          {petition.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: '0.85rem', marginBottom: 16 }}>
          <LocationOn sx={{ fontSize: 16 }} />
          {petition.jurisdiction.state}{petition.jurisdiction.lga ? ` · ${petition.jurisdiction.lga}` : ' (Lagos State)'}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{petition.currentSignatures.toLocaleString()} / {petition.targetSignatures.toLocaleString()} signatures</span>
            <span style={{ fontWeight: 900, color: '#1d4ed8', fontSize: '1.05rem' }}>{progressPct}%</span>
          </div>
          <LinearProgress
            variant="determinate" value={Math.min(progressPct, 100)}
            sx={{ height: 12, borderRadius: 6, backgroundColor: '#c7d2fe44', '& .MuiLinearProgress-bar': { backgroundColor: '#1d4ed8', borderRadius: 6 } }}
          />
        </div>

        <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 16 }}>
          Addressed to: <strong style={{ color: '#374151' }}>{petition.targetAuthority}</strong>
        </div>

        {petition.status === 'active' && !isSuccess && (
          <Button
            variant="contained" size="large"
            onClick={() => signPetition({ petitionId: petition.id })}
            disabled={isSigning}
            startIcon={<CheckCircle />}
            sx={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none',
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', px: 4, py: 1.5,
              '&:hover': { filter: 'brightness(0.92)', transform: 'translateY(-2px)' },
            }}
          >
            {isSigning ? 'Signing...' : 'Add My Signature'}
          </Button>
        )}
        {isSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 700 }}>
            <CheckCircle />
            Your signature has been recorded. Thank you!
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ borderRadius: 20, padding: '20px 24px', background: 'white', border: '1px solid #e5e7eb', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontWeight: 800, color: '#111827' }}>About This Petition</h3>
        <p style={{ margin: 0, color: '#374151', lineHeight: 1.85, fontSize: 'clamp(0.92rem, 1.5vw, 1.05rem)' }}>
          {petition.description}
        </p>
      </div>

      {/* Milestones */}
      <div style={{ borderRadius: 20, padding: '20px 24px', background: 'white', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#111827' }}>Progress Milestones</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {petition.milestones.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                padding: '12px 16px', borderRadius: 12,
                background: m.reached ? '#f0fdf4' : '#f9fafb',
                border: `1px solid ${m.reached ? '#bbf7d0' : '#e5e7eb'}`,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: m.reached ? '#16a34a' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: m.reached ? 'white' : '#9ca3af', fontWeight: 800, fontSize: '0.8rem',
              }}>
                {m.reached ? <CheckCircle sx={{ fontSize: 18 }} /> : (i + 1)}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', marginBottom: 2 }}>
                  {m.target.toLocaleString()} signatures
                </div>
                <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{m.note}</div>
                {m.reachedAt && (
                  <div style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: 3 }}>
                    Reached: {new Date(m.reachedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
