import { useState } from 'react';
import { Box, Button, Fade, Tooltip, Typography } from '@mui/material';
import CheckIcon        from '@mui/icons-material/Check';
import LockIcon         from '@mui/icons-material/Lock';
import BadgeIcon        from '@mui/icons-material/Badge';
import FingerprintIcon  from '@mui/icons-material/Fingerprint';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KycDocumentStep  from './steps/KycDocumentStep';
import KycBiometricStep from './steps/KycBiometricStep';
import KycPendingStep   from './steps/KycPendingStep';

const LOCAL_PENDING_KEY = 'kyc_submitted_for_review';

const F = {
  brand: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  sub:   'clamp(1.3rem,  1.8vw, 1.56rem)',
  step:  'clamp(1.3rem,  1.8vw, 1.5rem)',
  badge: 'clamp(1.3rem,  1.8vw, 1.56rem)',
  nav:   'clamp(1.3rem,  2vw,   1.56rem)',
};

const STEPS = [
  { label: 'Documents',    icon: BadgeIcon },
  { label: 'Biometrics',  icon: FingerprintIcon },
  { label: 'Under Review', icon: HourglassTopIcon },
];

function StepDot({ index, isActive, isCompleted, isAccessible, onClick }) {
  const Icon = STEPS[index].icon;
  const dot = (
    <Box
      onClick={isAccessible ? onClick : undefined}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
        cursor: isAccessible ? 'pointer' : 'not-allowed',
        userSelect: 'none',
        '&:hover .step-circle': isAccessible && !isActive
          ? { transform: 'scale(1.08)', transition: 'transform 0.2s ease' }
          : {},
      }}
    >
      <Box className="step-circle" sx={{
        width: 52, height: 52, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', transition: 'all 0.4s ease',
        background: isCompleted
          ? 'linear-gradient(135deg, #16a34a, #4ade80)'
          : isActive
            ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
            : 'rgba(255,255,255,0.08)',
        border: isActive
          ? '2px solid rgba(96,165,250,0.6)'
          : isCompleted
            ? '2px solid rgba(74,222,128,0.4)'
            : '2px solid transparent',
        boxShadow: isActive
          ? '0 0 24px rgba(59,130,246,0.5), 0 0 48px rgba(59,130,246,0.2)'
          : isCompleted
            ? '0 0 14px rgba(74,222,128,0.35)'
            : 'none',
        opacity: !isAccessible && !isCompleted ? 0.45 : 1,
        ...(isActive && {
          '&::before': {
            content: '""', position: 'absolute', inset: -6, borderRadius: '50%',
            border: '1.5px solid rgba(96,165,250,0.25)',
            animation: 'ripple 2s ease-out infinite',
          },
        }),
        '@keyframes ripple': {
          '0%':   { transform: 'scale(1)', opacity: 0.7 },
          '100%': { transform: 'scale(1.65)', opacity: 0 },
        },
      }}>
        {isCompleted
          ? <CheckIcon sx={{ fontSize: 24, color: '#fff' }} />
          : !isAccessible
            ? <LockIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }} />
            : <Icon sx={{ fontSize: 24, color: isActive ? '#fff' : 'rgba(255,255,255,0.35)' }} />
        }
      </Box>
      <Typography sx={{
        color: isCompleted
          ? '#4ade80'
          : isActive
            ? '#93c5fd'
            : !isAccessible
              ? 'rgba(255,255,255,0.2)'
              : 'rgba(255,255,255,0.35)',
        fontWeight: isActive || isCompleted ? 700 : 400,
        fontSize: F.step, transition: 'color 0.3s ease', textAlign: 'center',
      }}>
        {STEPS[index].label}
      </Typography>
    </Box>
  );

  if (!isAccessible) {
    return (
      <Tooltip title="Complete documents and a biometric first" placement="top" arrow>
        {dot}
      </Tooltip>
    );
  }
  return dot;
}

function StepConnector({ leftCompleted }) {
  return (
    <Box sx={{
      flex: 1, height: 2, mx: 0.5, mt: '-30px',
      position: 'relative', overflow: 'hidden',
      background: 'rgba(255,255,255,0.08)', borderRadius: 1,
    }}>
      <Box sx={{
        position: 'absolute', inset: 0, borderRadius: 1,
        background: 'linear-gradient(90deg, #4ade80, #22c55e)',
        transformOrigin: 'left',
        transform: leftCompleted ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.6s ease',
      }} />
    </Box>
  );
}

export default function KycWizardPage({ kycData, onBack }) {
  const docsComplete    = kycData?.documentSubmitted   === true;
  const faceVerified    = kycData?.faceVerified        === true;
  const biometricReg    = kycData?.biometricRegistered === true;
  const bioComplete     = faceVerified || biometricReg;
  const readyForReview  = docsComplete && bioComplete;
  const isVerified      = kycData?.kycStatus === 'FULLY_VERIFIED';
  const documentType    = kycData?.documentType   ?? null;
  const enrolledDevices = kycData?.enrolledDevices ?? [];

  const [localPending, setLocalPending] = useState(
    () => !!localStorage.getItem(LOCAL_PENDING_KEY),
  );
  const effectiveReady = readyForReview || localPending;

  // In manage mode (onBack provided) always open at Biometrics so user can add fingerprint
  const [activeStep, setActiveStep] = useState(() => {
    if (onBack)        return 1;
    if (!docsComplete) return 0;
    if (!bioComplete)  return 1;
    return 2;
  });

  function navigateTo(i) {
    if (i < 0 || i > 2) return;
    if (i === 2 && !effectiveReady) return;
    setActiveStep(i);
  }

  const canGoPrev = activeStep > 0;
  // From step 0: always can go next (step 1 is always accessible)
  // From step 1: can go next only if at least one biometric is done
  const canGoNext = activeStep === 0 || (activeStep === 1 && effectiveReady);

  function handleNext() {
    if (activeStep === 0) {
      setActiveStep(1);
      return;
    }
    if (activeStep === 1 && effectiveReady) {
      localStorage.setItem(LOCAL_PENDING_KEY, '1');
      setLocalPending(true);
      setActiveStep(2);
    }
  }

  // Progress: based on actual completion, not active step
  const progress = readyForReview ? 100 : docsComplete ? 50 : 0;

  const stepCompleted  = [docsComplete, bioComplete, isVerified];
  const stepAccessible = [true, true, effectiveReady];

  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 1300,
      background: 'linear-gradient(135deg, #050d18 0%, #0a1929 40%, #0b2416 100%)',
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      pt: { xs: 8, md: 10 }, pb: { xs: 3, md: 5 }, px: 2,
      '&::before': {
        content: '""', position: 'fixed', inset: 0, zIndex: -1,
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(30,80,180,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(22,163,74,0.12) 0%, transparent 60%)',
      },
    }}>

      {/* Back to civic activation (manage mode only) */}
      {onBack && (
        <Box sx={{ width: '100%', maxWidth: 600, mb: 1 }}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: 'rgba(255,255,255,0.5)', fontSize: F.sub, fontWeight: 600,
              textTransform: 'none', pl: 0,
              '&:hover': { color: '#93c5fd', background: 'transparent' },
            }}
          >
            Back to Civic Activation
          </Button>
        </Box>
      )}

      {/* Branding */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, mt: 1 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: '12px',
          background: 'linear-gradient(135deg, #1d4ed8, #4ade80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(29,78,216,0.4)',
        }}>
          <FingerprintIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: F.brand, lineHeight: 1.2 }}>
            Civic Identity Verification
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: F.sub }}>
            AfricanShops · Secure KYC System
          </Typography>
        </Box>
      </Box>

      {/* Progress badge */}
      <Box sx={{
        px: 2.5, py: 0.5, borderRadius: 20, mb: 3,
        background: isVerified
          ? 'rgba(74,222,128,0.18)'
          : progress === 100
            ? 'rgba(74,222,128,0.1)'
            : 'rgba(255,255,255,0.06)',
        border: `1px solid ${isVerified ? 'rgba(74,222,128,0.55)' : progress === 100 ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.1)'}`,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        {(isVerified || progress === 100) && <CheckIcon sx={{ fontSize: 14, color: '#4ade80' }} />}
        <Typography sx={{
          color: isVerified || progress === 100 ? '#4ade80' : 'rgba(255,255,255,0.5)',
          fontSize: F.badge, letterSpacing: 1, fontWeight: isVerified || progress === 100 ? 700 : 400,
        }}>
          {isVerified ? 'KYC VERIFIED' : progress === 100 ? 'READY FOR REVIEW' : `COMPLETION ${progress}%`}
        </Typography>
      </Box>

      {/* Step indicator — clickable dots */}
      <Box sx={{ width: '100%', maxWidth: 480, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          {STEPS.map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <StepDot
                index={i}
                isActive={activeStep === i}
                isCompleted={stepCompleted[i]}
                isAccessible={stepAccessible[i]}
                onClick={() => navigateTo(i)}
              />
              {i < STEPS.length - 1 && (
                <StepConnector leftCompleted={stepCompleted[i]} />
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Content card */}
      <Fade in key={activeStep} timeout={350}>
        <Box sx={{
          width: '100%', maxWidth: 600,
          flexShrink: 0,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 4, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
          {activeStep === 0 && (
            <KycDocumentStep
              completed={docsComplete}
              documentType={documentType}
            />
          )}
          {activeStep === 1 && (
            <KycBiometricStep
              faceVerified={faceVerified}
              biometricRegistered={biometricReg}
              enrolledDevices={enrolledDevices}
            />
          )}
          {activeStep === 2 && (
            <KycPendingStep
              docsComplete={docsComplete}
              bioComplete={bioComplete}
              faceVerified={faceVerified}
              biometricRegistered={biometricReg}
              isVerified={isVerified}
            />
          )}
        </Box>
      </Fade>

      {/* Previous / Next navigation */}
      <Box sx={{ display: 'flex', width: '100%', maxWidth: 600, gap: 2, mt: 2, mb: 3, flexShrink: 0 }}>
        <Button
          onClick={() => navigateTo(activeStep - 1)}
          disabled={!canGoPrev}
          startIcon={<ArrowBackIcon />}
          sx={{
            px: 3, py: 1.3, borderRadius: 2.5, fontWeight: 600, fontSize: F.nav,
            border: '1.5px solid rgba(255,255,255,0.15)',
            color: canGoPrev ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
            '&:hover': { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.3)' },
            '&:disabled': { borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' },
          }}
        >
          Previous
        </Button>

        <Box sx={{ flex: 1 }} />

        {/* Manage mode: always show Done button instead of Submit/Next */}
        {onBack ? (
          <Button
            onClick={onBack}
            endIcon={<ArrowForwardIcon />}
            variant="contained"
            sx={{
              px: 3, py: 1.3, borderRadius: 2.5, fontWeight: 700, fontSize: F.nav,
              background: 'linear-gradient(135deg, #1d4ed8, #4ade80)',
              color: '#fff', textTransform: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #1e40af, #22c55e)' },
            }}
          >
            Done — Return to Activation
          </Button>
        ) : activeStep < 2 && (
          <Tooltip
            title={activeStep === 1 && !effectiveReady ? 'Complete at least one biometric to proceed' : ''}
            placement="top"
            arrow
          >
            <span>
              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                endIcon={<ArrowForwardIcon />}
                variant="contained"
                sx={{
                  px: 3, py: 1.3, borderRadius: 2.5, fontWeight: 700, fontSize: F.nav,
                  background: canGoNext
                    ? activeStep === 1
                      ? 'linear-gradient(135deg, #16a34a, #4ade80)'
                      : 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
                    : 'rgba(255,255,255,0.07)',
                  color: canGoNext ? '#fff' : 'rgba(255,255,255,0.2)',
                  '&:hover': canGoNext
                    ? { background: activeStep === 1 ? 'linear-gradient(135deg, #15803d, #22c55e)' : 'linear-gradient(135deg, #1e40af, #2563eb)' }
                    : {},
                  '&:disabled': { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' },
                }}
              >
                {activeStep === 1 && effectiveReady ? 'Submit for Review' : 'Next'}
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>

      <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: F.sub, textAlign: 'center', pb: 2 }}>
        256-bit encrypted · Data never sold · ISO 27001 compliant
      </Typography>
    </Box>
  );
}
