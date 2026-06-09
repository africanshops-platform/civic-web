import { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import { KYC_STATUS_KEY } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import { useQueryClient } from 'react-query';

const F = {
  heading: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  sub:     'clamp(1.3rem,  1.8vw, 1.56rem)',
  body:    'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:   'clamp(1.44rem, 2vw,   1.76rem)',
  small:   'clamp(1.3rem,  1.8vw, 1.56rem)',
  btn:     'clamp(1.3rem,  2vw,   1.76rem)',
  badge:   'clamp(1.3rem,  1.8vw, 1.5rem)',
};

// Built dynamically from props — see below


// TIMELINE is built inside the component so isVerified can mark all steps done

export default function KycPendingStep({
  docsComplete        = false,
  bioComplete         = false,
  faceVerified        = false,
  biometricRegistered = false,
  isVerified          = false,
}) {
  const COMPLETED = [
    docsComplete && { icon: BadgeIcon,       label: 'Identity document submitted',    color: '#a78bfa' },
    (faceVerified || biometricRegistered) && {
      icon: FingerprintIcon,
      label: faceVerified && biometricRegistered
        ? 'Face scan + fingerprint enrolled (bimodal)'
        : faceVerified
          ? 'Face scan verified'
          : 'Fingerprint / Face ID enrolled',
      color: '#f9a8d4',
    },
  ].filter(Boolean);
  const TIMELINE = [
    { day: 'Day 1',    text: 'Automated document validation',    done: true },
    { day: 'Day 1–2',  text: 'Manual review by compliance team', done: isVerified },
    { day: 'Day 2',    text: 'Approval notification via email',   done: isVerified },
  ];

  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await qc.invalidateQueries(KYC_STATUS_KEY);
    setTimeout(() => setRefreshing(false), 900);
  }

  return (
    <Box sx={{ color: '#fff' }}>
      {/* Hero */}
      <Box sx={{
        px: 3.5, pt: 4.5, pb: 3.5,
        background: isVerified
          ? 'linear-gradient(180deg, rgba(22,163,74,0.2) 0%, transparent 100%)'
          : 'linear-gradient(180deg, rgba(22,163,74,0.12) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <Box sx={{ position: 'relative', mb: 2.5 }}>
          {[1, 2].map((r) => (
            <Box key={r} sx={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 88 + r * 26, height: 88 + r * 26, borderRadius: '50%',
              border: `1px solid ${isVerified ? 'rgba(74,222,128,0.25)' : 'rgba(74,222,128,0.15)'}`,
              animation: `pendingGlow ${2 + r * 0.6}s ease-in-out infinite`,
              animationDelay: `${r * 0.4}s`,
              '@keyframes pendingGlow': {
                '0%,100%': { opacity: 0.4, transform: 'translate(-50%,-50%) scale(1)' },
                '50%':     { opacity: 0.8, transform: 'translate(-50%,-50%) scale(1.05)' },
              },
            }} />
          ))}
          <Box sx={{
            width: 88, height: 88, borderRadius: '50%', position: 'relative', zIndex: 1,
            background: isVerified
              ? 'linear-gradient(135deg, rgba(22,163,74,0.4), rgba(74,222,128,0.2))'
              : 'linear-gradient(135deg, rgba(22,163,74,0.25), rgba(74,222,128,0.12))',
            border: `1.5px solid ${isVerified ? 'rgba(74,222,128,0.6)' : 'rgba(74,222,128,0.35)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isVerified ? '0 0 60px rgba(74,222,128,0.35)' : '0 0 48px rgba(74,222,128,0.2)',
          }}>
            {isVerified
              ? <CheckCircleIcon sx={{ fontSize: 46, color: '#4ade80' }} />
              : <ShieldIcon sx={{
                  fontSize: 46, color: '#4ade80',
                  animation: 'shieldFloat 3s ease-in-out infinite',
                  '@keyframes shieldFloat': {
                    '0%,100%': { transform: 'translateY(0)' },
                    '50%':     { transform: 'translateY(-5px)' },
                  },
                }} />
            }
          </Box>
        </Box>

        <Typography sx={{ fontWeight: 800, fontSize: F.heading, mb: 1 }}>
          {isVerified ? 'Identity Verified' : 'Application Under Review'}
        </Typography>

        {isVerified ? (
          <Box sx={{
            px: 2.5, py: 0.75, borderRadius: 20, mb: 2,
            background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)',
            display: 'inline-flex', alignItems: 'center', gap: 1,
          }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#4ade80' }} />
            <Typography sx={{ fontSize: F.badge, color: '#4ade80', fontWeight: 700, letterSpacing: 0.5 }}>
              APPROVED
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            px: 2.5, py: 0.75, borderRadius: 20, mb: 2,
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            display: 'inline-flex', alignItems: 'center', gap: 1,
          }}>
            <HourglassTopIcon sx={{ fontSize: 16, color: '#f59e0b',
              animation: 'spin 2s linear infinite',
              '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } },
            }} />
            <Typography sx={{ fontSize: F.badge, color: '#fcd34d', fontWeight: 700, letterSpacing: 0.5 }}>
              AWAITING APPROVAL
            </Typography>
          </Box>
        )}

        <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 380 }}>
          {isVerified
            ? 'Your identity has been verified and approved. You now have full access to all civic platform features.'
            : <>All verification steps are complete. Our compliance team typically approves within{' '}<strong style={{ color: '#fff' }}>1–2 business days</strong>.</>
          }
        </Typography>
      </Box>

      <Box sx={{ px: 3.5, py: 3.5 }}>
        {/* Completed steps */}
        <Typography sx={{ fontSize: F.label, letterSpacing: 0.6, color: 'rgba(255,255,255,0.35)', mb: 2, fontWeight: 600 }}>
          COMPLETED STEPS
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 3.5 }}>
          {COMPLETED.map(({ icon: Icon, label, color }) => (
            <Box key={label} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              p: 1.75, borderRadius: 2.5,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                background: `${color}1a`, border: `1px solid ${color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon sx={{ fontSize: 18, color }} />
              </Box>
              <Typography sx={{ flex: 1, fontSize: F.body, color: 'rgba(255,255,255,0.75)' }}>
                {label}
              </Typography>
              <CheckCircleIcon sx={{ fontSize: 18, color: '#4ade80' }} />
            </Box>
          ))}
        </Box>

        {/* Timeline */}
        <Typography sx={{ fontSize: F.label, letterSpacing: 0.6, color: 'rgba(255,255,255,0.35)', mb: 2, fontWeight: 600 }}>
          REVIEW TIMELINE
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', mb: 3.5 }}>
          {TIMELINE.map(({ day, text, done }, i) => (
            <Box key={day} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              {i < TIMELINE.length - 1 && (
                <Box sx={{
                  position: 'absolute', left: 15, top: 30, bottom: -6,
                  width: 1, background: done ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.07)',
                }} />
              )}
              <Box sx={{ flexShrink: 0, mt: 1.4 }}>
                <Box sx={{
                  width: 11, height: 11, borderRadius: '50%', ml: '10px',
                  background: done ? '#4ade80' : 'rgba(255,255,255,0.15)',
                  border: done ? 'none' : '1px solid rgba(255,255,255,0.2)',
                }} />
              </Box>
              <Box sx={{ pb: 3 }}>
                <Typography sx={{ fontSize: F.sub, color: done ? '#4ade80' : 'rgba(255,255,255,0.35)', fontWeight: 700, mb: 0.3 }}>
                  {day}
                </Typography>
                <Typography sx={{ fontSize: F.body, color: done ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)' }}>
                  {text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {isVerified ? (
          /* Verified confirmation note */
          <Box sx={{
            p: 2.5, borderRadius: 2.5, mb: 1,
            background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)',
            display: 'flex', gap: 1.5, alignItems: 'flex-start',
          }}>
            <CheckCircleIcon sx={{ fontSize: 20, color: '#4ade80', flexShrink: 0, mt: 0.25 }} />
            <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              A confirmation email was sent to your registered address. Your civic profile is fully active.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Email note */}
            <Box sx={{
              p: 2.5, borderRadius: 2.5, mb: 3.5,
              background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)',
              display: 'flex', gap: 1.5, alignItems: 'flex-start',
            }}>
              <EmailIcon sx={{ fontSize: 20, color: '#60a5fa', flexShrink: 0, mt: 0.25 }} />
              <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                You will receive an email once your identity is approved. Check your inbox and spam folder.
              </Typography>
            </Box>

            {/* Refresh */}
            <Button fullWidth variant="outlined" onClick={handleRefresh} disabled={refreshing}
              startIcon={refreshing
                ? <CircularProgress size={18} sx={{ color: '#60a5fa' }} />
                : <RefreshIcon />}
              sx={{
                py: 1.6, borderRadius: 2.5, fontWeight: 700, fontSize: F.btn,
                borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa',
                '&:hover': { borderColor: 'rgba(96,165,250,0.6)', background: 'rgba(59,130,246,0.08)' },
              }}>
              {refreshing ? 'Checking status…' : 'Check Approval Status'}
            </Button>

            <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.2)', mt: 2.5, textAlign: 'center' }}>
              If review exceeds 3 business days, contact support@africanshops.org
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
