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

  const progressPct = petition.targetSignatures ? Math.round((petition.currentSignatures / petition.targetSignatures) * 100) : 0;

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
          <Chip label={petition.status.replace('_', ' ').toUpperCase()} size="small"
            sx={{ background: petition.status === 'open' ? '#eff6ff' : '#f0fdf4', color: petition.status === 'open' ? '#1d4ed8' : '#16a34a', fontWeight: 800 }} />
        </div>
        <h1 style={{ margin: '0 0 12px', fontWeight: 900, color: '#1e1b4b', fontSize: 'clamp(1.3rem, 3vw, 2rem)', lineHeight: 1.25 }}>
          {petition.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: '0.85rem', marginBottom: 16 }}>
          <LocationOn sx={{ fontSize: 16 }} />
          {petition.jurisdiction.state}{petition.jurisdiction.lga ? ` · ${petition.jurisdiction.lga}` : ''}
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

        {petition.status === 'open' && !isSuccess && (
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

      <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
        A petition is a community request. When it reaches its signature goal it is marked as having met its threshold and is delivered to the party it is addressed to. This platform is independent and does not act for any government body.
      </p>
    </motion.div>
  );
}
