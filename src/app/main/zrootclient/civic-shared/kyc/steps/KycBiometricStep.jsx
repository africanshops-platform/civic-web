import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { startRegistration } from '@simplewebauthn/browser';
import {
  Alert, Box, Button, CircularProgress, Divider,
  LinearProgress, TextField, Typography,
} from '@mui/material';
import CameraAltIcon         from '@mui/icons-material/CameraAlt';
import FingerprintIcon       from '@mui/icons-material/Fingerprint';
import CheckCircleIcon       from '@mui/icons-material/CheckCircle';
import ReplayIcon            from '@mui/icons-material/Replay';
import DevicesIcon           from '@mui/icons-material/Devices';
import ErrorOutlineIcon      from '@mui/icons-material/ErrorOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackIcon         from '@mui/icons-material/ArrowBack';
import SecurityIcon          from '@mui/icons-material/Security';
import { toast } from 'react-toastify';
import {
  useSubmitFace,
  useGetWebAuthnRegOptions,
  useVerifyWebAuthnReg,
} from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';

const F = {
  heading: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  sub:     'clamp(1.3rem,  1.8vw, 1.56rem)',
  body:    'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:   'clamp(1.44rem, 2vw,   1.76rem)',
  small:   'clamp(1.3rem,  1.8vw, 1.56rem)',
  btn:     'clamp(1.3rem,  2vw,   1.76rem)',
};

let _modelsReady = false;
let _modelsPromise = null;
function ensureModels() {
  if (_modelsReady) return Promise.resolve();
  if (_modelsPromise) return _modelsPromise;
  _modelsPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  ]).then(() => { _modelsReady = true; });
  return _modelsPromise;
}

const TIPS = [
  'Look directly at the camera',
  'Ensure your face is well-lit',
  'Remove glasses if possible',
  'Keep a neutral expression',
];

const webAuthnSupported = () => typeof window !== 'undefined' && !!window.PublicKeyCredential;

// ─── Completion banner ────────────────────────────────────────────────────────
function BiometricCompletedBanner({ faceVerified, biometricRegistered }) {
  const both = faceVerified && biometricRegistered;
  return (
    <Box sx={{ px: 3.5, py: 3.5 }}>
      {/* Header row */}
      <Box sx={{
        p: 2.5, borderRadius: 3, mb: 3,
        background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(74,222,128,0.05))',
        border: '1.5px solid rgba(74,222,128,0.3)',
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #16a34a, #4ade80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 28px rgba(74,222,128,0.3)',
        }}>
          <SecurityIcon sx={{ fontSize: 30, color: '#fff' }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: F.label, color: '#4ade80', mb: 0.25 }}>
            {both ? 'Full Biometric Verification ✓' : 'Biometric Verification Active ✓'}
          </Typography>
          <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.55)' }}>
            {both
              ? 'Maximum security — face and fingerprint registered'
              : 'You qualify for review. Optionally add the second method below.'}
          </Typography>
        </Box>
      </Box>

      {/* What's done */}
      <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.35)', mb: 1.5, fontWeight: 600, letterSpacing: 0.5 }}>
        COMPLETED METHODS
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 3 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: 2.5,
          background: faceVerified ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${faceVerified ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.07)'}`,
        }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '9px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: faceVerified ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${faceVerified ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
            <Typography sx={{ fontSize: '1.3rem' }}>{faceVerified ? '📷' : '○'}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: F.body, color: faceVerified ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontWeight: faceVerified ? 600 : 400 }}>
              Face Scan
            </Typography>
            <Typography sx={{ fontSize: F.small, color: faceVerified ? 'rgba(74,222,128,0.7)' : 'rgba(255,255,255,0.3)' }}>
              {faceVerified ? 'Verified and on file' : 'Not yet completed'}
            </Typography>
          </Box>
          {faceVerified
            ? <CheckCircleIcon sx={{ fontSize: 20, color: '#4ade80', flexShrink: 0 }} />
            : <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
          }
        </Box>

        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: 2.5,
          background: biometricRegistered ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${biometricRegistered ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.07)'}`,
        }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '9px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: biometricRegistered ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${biometricRegistered ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
            <Typography sx={{ fontSize: '1.3rem' }}>{biometricRegistered ? '👆' : '○'}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: F.body, color: biometricRegistered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontWeight: biometricRegistered ? 600 : 400 }}>
              Fingerprint / Face ID
            </Typography>
            <Typography sx={{ fontSize: F.small, color: biometricRegistered ? 'rgba(74,222,128,0.7)' : 'rgba(255,255,255,0.3)' }}>
              {biometricRegistered ? 'Device enrolled' : 'Not yet completed'}
            </Typography>
          </Box>
          {biometricRegistered
            ? <CheckCircleIcon sx={{ fontSize: 20, color: '#4ade80', flexShrink: 0 }} />
            : <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
          }
        </Box>
      </Box>

      {!both && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2.5 }} />
          <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', mb: 2 }}>
            <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
              You already qualify for review. Adding the second biometric method below gives you <strong style={{ color: 'rgba(255,255,255,0.8)' }}>bimodal verification</strong> — the strongest security level.
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function KycBiometricStep({
  faceVerified      = false,
  biometricRegistered = false,
  enrolledDevices   = [],
}) {
  const bioComplete = faceVerified || biometricRegistered;

  // activeSection: 'none' | 'face' | 'fingerprint'
  const [activeSection, setActiveSection] = useState('none');

  // Face state
  const [localFaceDone,  setLocalFaceDone]  = useState(faceVerified);
  const [modelState,     setModelState]     = useState('idle');
  const [cameraState,    setCameraState]    = useState('idle');
  const [detection,      setDetection]      = useState('idle');
  const [captured,       setCaptured]       = useState(false);
  const [preview,        setPreview]        = useState(null);
  const [descriptor,     setDescriptor]     = useState(null);
  const [tipIndex,       setTipIndex]       = useState(0);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const submitFace = useSubmitFace();

  // Fingerprint state
  const [localFingerDone, setLocalFingerDone] = useState(biometricRegistered);
  const [deviceName,      setDeviceName]      = useState('');
  const [nameError,       setNameError]       = useState('');
  const [fpState,         setFpState]         = useState('idle');
  const getOptions = useGetWebAuthnRegOptions();
  const verifyReg  = useVerifyWebAuthnReg();

  // Sync prop changes (e.g., after KYC status refetch)
  useEffect(() => { if (faceVerified)        setLocalFaceDone(true);   }, [faceVerified]);
  useEffect(() => { if (biometricRegistered) setLocalFingerDone(true); }, [biometricRegistered]);

  // ── Tips carousel ────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeSection !== 'face') return;
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 3500);
    return () => clearInterval(t);
  }, [activeSection]);

  // ── Load face-api models ─────────────────────────────────────────────────
  useEffect(() => {
    if (activeSection !== 'face' || modelState !== 'idle') return;
    setModelState('loading');
    ensureModels()
      .then(() => setModelState('ready'))
      .catch(() => setModelState('error'));
  }, [activeSection, modelState]);

  // ── Open camera when models ready ────────────────────────────────────────
  useEffect(() => {
    if (modelState !== 'ready' || activeSection !== 'face') return;
    setCameraState('starting');
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then((s) => { stream = s; streamRef.current = s; setCameraState('active'); })
      .catch((err) => setCameraState(err.name === 'NotAllowedError' ? 'denied' : 'unavailable'));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [modelState, activeSection]);

  useEffect(() => {
    if (cameraState !== 'active' || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => {});
  }, [cameraState]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function openFaceSection() {
    stopCamera();
    setActiveSection('face');
    setModelState('idle'); setCameraState('idle'); setDetection('idle');
    setCaptured(false); setPreview(null); setDescriptor(null);
  }

  function openFingerprintSection() {
    stopCamera();
    setActiveSection('fingerprint');
    setFpState('idle');
  }

  function closeSection() {
    stopCamera();
    setActiveSection('none');
  }

  // ── Face capture ─────────────────────────────────────────────────────────
  async function handleCapture() {
    if (!videoRef.current || !_modelsReady) return;
    setDetection('scanning');
    try {
      const result = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!result) { setDetection('missed'); return; }
      const canvas = canvasRef.current;
      if (canvas && videoRef.current) {
        canvas.width  = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        setPreview(canvas.toDataURL('image/jpeg', 0.85));
      }
      setDescriptor(Array.from(result.descriptor));
      setDetection('found');
      stopCamera();
      setCaptured(true);
    } catch {
      setDetection('idle');
      toast.error('Detection error. Please try again.');
    }
  }

  function handleFaceRetry() {
    setCaptured(false); setPreview(null); setDescriptor(null); setDetection('idle');
    _modelsReady = false; _modelsPromise = null;
    setModelState('idle'); setCameraState('idle');
  }

  async function handleFaceSubmit() {
    try {
      await submitFace.mutateAsync({ faceDescriptor: descriptor });
      setLocalFaceDone(true);
      closeSection();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Face submission failed. Please retry.');
    }
  }

  // ── Fingerprint / WebAuthn ────────────────────────────────────────────────
  async function handleEnroll() {
    if (!deviceName.trim()) { setNameError('Name this device first'); return; }
    setNameError('');
    setFpState('prompt');
    try {
      const optResp = await getOptions.mutateAsync();
      const options = optResp?.data;
      if (!options) throw new Error('No registration options from server');
      const attestation = await startRegistration(options);
      await verifyReg.mutateAsync({ attestationResponse: attestation, deviceName: deviceName.trim() });
      setFpState('success');
      setLocalFingerDone(true);
      closeSection();
    } catch (err) {
      setFpState('error');
      if (err.name === 'NotAllowedError') toast.error('Biometric authentication was cancelled.');
      else if (err.name === 'InvalidStateError') toast.warning('This device may already be enrolled.');
      else toast.error(err?.response?.data?.message || err.message || 'Enrolment failed. Please retry.');
    }
  }

  const detectionColor = { idle: '#60a5fa', scanning: '#f59e0b', found: '#4ade80', missed: '#ef4444' };
  const detectionLabel = { idle: 'Ready to scan', scanning: 'Scanning…', found: 'Face detected ✓', missed: 'No face found — try again' };

  const effectiveBioComplete = localFaceDone || localFingerDone;

  return (
    <Box sx={{ color: '#fff' }}>
      {/* ── Step header ──────────────────────────────────────────────────── */}
      <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
            background: effectiveBioComplete
              ? 'linear-gradient(135deg, rgba(22,163,74,0.3), rgba(74,222,128,0.15))'
              : 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(249,168,212,0.15))',
            border: `1px solid ${effectiveBioComplete ? 'rgba(74,222,128,0.35)' : 'rgba(249,168,212,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {effectiveBioComplete
              ? <CheckCircleIcon sx={{ fontSize: 20, color: '#4ade80' }} />
              : <FingerprintIcon sx={{ fontSize: 20, color: '#f9a8d4' }} />
            }
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: F.heading }}>Biometric Verification</Typography>
            <Typography sx={{ fontSize: F.sub, color: effectiveBioComplete ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
              {effectiveBioComplete
                ? `Step 2 of 3 · ${localFaceDone && localFingerDone ? 'Bimodal verified ✓' : 'Completed ✓'}`
                : 'Step 2 of 3 · Complete face scan, fingerprint, or both'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Completion summary (shown when at least one biometric done) ─── */}
      {effectiveBioComplete && activeSection === 'none' && (
        <BiometricCompletedBanner
          faceVerified={localFaceDone}
          biometricRegistered={localFingerDone}
        />
      )}

      {/* ── Option cards (always shown when no section is active) ────────── */}
      {activeSection === 'none' && (
        <Box sx={{ px: 3.5, pb: 3.5 }}>
          {!effectiveBioComplete && (
            <Typography sx={{ fontSize: F.label, color: 'rgba(255,255,255,0.5)', mb: 1.5, fontWeight: 600, letterSpacing: 0.5 }}>
              CHOOSE VERIFICATION METHOD — COMPLETE AT LEAST ONE
            </Typography>
          )}
          {effectiveBioComplete && !localFaceDone || effectiveBioComplete && !localFingerDone ? (
            <Typography sx={{ fontSize: F.label, color: 'rgba(255,255,255,0.5)', mb: 1.5, fontWeight: 600, letterSpacing: 0.5 }}>
              ADD SECOND METHOD (OPTIONAL)
            </Typography>
          ) : null}

          <Box sx={{ display: 'flex', gap: 2, mb: effectiveBioComplete ? 0 : 2.5 }}>
            {/* Face card */}
            <Box sx={{
              flex: 1, p: 2.5, borderRadius: 3, textAlign: 'center',
              border: `1.5px solid ${localFaceDone ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.1)'}`,
              background: localFaceDone ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.03)',
            }}>
              <Typography sx={{ fontSize: '2rem', mb: 1, lineHeight: 1 }}>
                {localFaceDone ? '✅' : '📷'}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: F.label, color: localFaceDone ? '#4ade80' : 'rgba(255,255,255,0.85)', mb: 0.5 }}>
                Face Scan
              </Typography>
              <Typography sx={{ fontSize: F.small, color: localFaceDone ? 'rgba(74,222,128,0.7)' : 'rgba(255,255,255,0.4)', mb: 2 }}>
                {localFaceDone ? 'Verified ✓' : 'Camera required'}
              </Typography>
              {localFaceDone ? (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: 20, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}>
                  <CheckCircleIcon sx={{ fontSize: 13, color: '#4ade80' }} />
                  <Typography sx={{ fontSize: F.small, color: '#4ade80', fontWeight: 700 }}>Completed</Typography>
                </Box>
              ) : (
                <Button variant="contained" size="small" onClick={openFaceSection}
                  startIcon={<CameraAltIcon sx={{ fontSize: '1.1rem !important' }} />}
                  sx={{ borderRadius: 2, fontWeight: 700, fontSize: F.small, background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', '&:hover': { background: 'linear-gradient(135deg, #1e40af, #2563eb)' } }}>
                  Scan Face
                </Button>
              )}
            </Box>

            {/* Fingerprint card */}
            <Box sx={{
              flex: 1, p: 2.5, borderRadius: 3, textAlign: 'center',
              border: `1.5px solid ${localFingerDone ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.1)'}`,
              background: localFingerDone ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.03)',
            }}>
              <Typography sx={{ fontSize: '2rem', mb: 1, lineHeight: 1 }}>
                {localFingerDone ? '✅' : '👆'}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: F.label, color: localFingerDone ? '#4ade80' : 'rgba(255,255,255,0.85)', mb: 0.5 }}>
                Fingerprint
              </Typography>
              <Typography sx={{ fontSize: F.small, color: localFingerDone ? 'rgba(74,222,128,0.7)' : 'rgba(255,255,255,0.4)', mb: 2 }}>
                {localFingerDone ? 'Enrolled ✓' : webAuthnSupported() ? 'Sensor or Face ID' : 'Not supported'}
              </Typography>
              {localFingerDone ? (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: 20, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}>
                  <CheckCircleIcon sx={{ fontSize: 13, color: '#4ade80' }} />
                  <Typography sx={{ fontSize: F.small, color: '#4ade80', fontWeight: 700 }}>Completed</Typography>
                </Box>
              ) : (
                <Button variant="contained" size="small" onClick={openFingerprintSection}
                  startIcon={<FingerprintIcon sx={{ fontSize: '1.1rem !important' }} />}
                  sx={{ borderRadius: 2, fontWeight: 700, fontSize: F.small, background: 'linear-gradient(135deg, #be185d, #ec4899)', '&:hover': { background: 'linear-gradient(135deg, #9d174d, #db2777)' } }}>
                  Enrol Fingerprint
                </Button>
              )}
            </Box>
          </Box>

          {!effectiveBioComplete && (
            <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                Completing <strong style={{ color: 'rgba(255,255,255,0.75)' }}>both</strong> methods (bimodal) gives the strongest verification, but only one is required. Use <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Next</strong> once at least one is done.
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── Face capture section ─────────────────────────────────────────── */}
      {activeSection === 'face' && (
        <Box sx={{ px: 3.5, pb: 3.5 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={closeSection}
            sx={{ mb: 2, color: 'rgba(255,255,255,0.5)', fontSize: F.small, '&:hover': { color: '#fff' } }}>
            Back to options
          </Button>

          <Typography sx={{ fontWeight: 700, fontSize: F.label, color: '#60a5fa', mb: 2 }}>
            Face Scan
          </Typography>

          {modelState === 'loading' && (
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.65)' }}>Loading face detection AI…</Typography>
                <CircularProgress size={16} sx={{ color: '#60a5fa' }} />
              </Box>
              <LinearProgress sx={{ borderRadius: 2, height: 5, bgcolor: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#3b82f6,#60a5fa)' } }} />
            </Box>
          )}

          {modelState === 'error' && (
            <Alert icon={<ErrorOutlineIcon />} severity="error"
              sx={{ mb: 2.5, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', '& .MuiAlert-message': { fontSize: F.body } }}>
              Face detection models not found in <code>/public/models/</code>. Contact support.
            </Alert>
          )}

          {modelState === 'ready' && cameraState === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2.5, bgcolor: 'rgba(245,158,11,0.1)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.2)', '& .MuiAlert-message': { fontSize: F.body } }}>
              Camera access denied. Grant permission in browser settings and retry.
            </Alert>
          )}

          {modelState === 'ready' && cameraState === 'unavailable' && (
            <Alert severity="error" sx={{ mb: 2.5, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', '& .MuiAlert-message': { fontSize: F.body } }}>
              No camera detected. A webcam is required.
            </Alert>
          )}

          {!captured && cameraState === 'active' && (
            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 2.5, background: '#000', border: '1px solid rgba(255,255,255,0.08)' }}>
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width: '100%', display: 'block', maxHeight: 290, objectFit: 'cover' }} />
              <Box component="svg" viewBox="0 0 640 480"
                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <ellipse cx="320" cy="240" rx="140" ry="170"
                  fill="none" stroke={detectionColor[detection]} strokeWidth="2.5" strokeDasharray="12 6"
                  style={{ transition: 'stroke 0.4s ease', animation: detection === 'scanning' ? 'dashRotate 1.2s linear infinite' : 'none' }} />
                <style>{`@keyframes dashRotate { to { stroke-dashoffset: -18; } }`}</style>
              </Box>
              <Box sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', px: 2.5, py: 0.75, borderRadius: 20, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: `1px solid ${detectionColor[detection]}33`, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: detectionColor[detection], ...(detection === 'scanning' && { animation: 'blink 0.8s ease-in-out infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }) }} />
                <Typography sx={{ fontSize: F.small, color: '#fff', fontWeight: 600 }}>{detectionLabel[detection]}</Typography>
              </Box>
            </Box>
          )}

          {captured && preview && (
            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 2.5, border: '2px solid rgba(74,222,128,0.4)', boxShadow: '0 0 32px rgba(74,222,128,0.15)' }}>
              <img src={preview} alt="Captured" style={{ width: '100%', display: 'block', maxHeight: 270, objectFit: 'cover' }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.72))' }} />
              <Box sx={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 20 }} />
                <Typography sx={{ color: '#4ade80', fontWeight: 700, fontSize: F.label }}>Face captured</Typography>
              </Box>
            </Box>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!captured && cameraState === 'active' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, p: 1.75, borderRadius: 2.5, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <LightbulbOutlinedIcon sx={{ fontSize: 18, color: '#f59e0b', flexShrink: 0 }} />
              <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.65)' }}>{TIPS[tipIndex]}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {!captured && cameraState === 'active' && (
              <Button fullWidth variant="contained" onClick={handleCapture}
                disabled={modelState !== 'ready' || detection === 'scanning'}
                startIcon={detection === 'scanning' ? <CircularProgress size={18} color="inherit" /> : <CameraAltIcon />}
                sx={{ py: 1.6, borderRadius: 2.5, fontWeight: 700, fontSize: F.btn, background: detection === 'scanning' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)', '&:hover': { background: 'linear-gradient(135deg, #1e40af, #2563eb)' } }}>
                {detection === 'scanning' ? 'Detecting Face…' : detection === 'missed' ? 'Try Again' : 'Capture Face'}
              </Button>
            )}
            {captured && (
              <>
                <Button variant="outlined" onClick={handleFaceRetry} disabled={submitFace.isLoading}
                  startIcon={<ReplayIcon />}
                  sx={{ borderRadius: 2.5, fontSize: F.btn, borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                  Retake
                </Button>
                <Button fullWidth variant="contained" onClick={handleFaceSubmit} disabled={submitFace.isLoading}
                  startIcon={submitFace.isLoading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                  sx={{ py: 1.6, borderRadius: 2.5, fontWeight: 700, fontSize: F.btn, background: 'linear-gradient(135deg, #16a34a, #4ade80)', '&:hover': { background: 'linear-gradient(135deg, #15803d, #22c55e)' } }}>
                  {submitFace.isLoading ? 'Submitting…' : 'Confirm & Save'}
                </Button>
              </>
            )}
          </Box>

          <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.25)', mt: 2.5, textAlign: 'center' }}>
            Stored as a 128-point mathematical descriptor · No photo saved on our servers
          </Typography>
        </Box>
      )}

      {/* ── Fingerprint / WebAuthn section ──────────────────────────────── */}
      {activeSection === 'fingerprint' && (
        <Box sx={{ px: 3.5, pb: 3.5 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveSection('none')}
            sx={{ mb: 2, color: 'rgba(255,255,255,0.5)', fontSize: F.small, '&:hover': { color: '#fff' } }}>
            Back to options
          </Button>

          <Typography sx={{ fontWeight: 700, fontSize: F.label, color: '#f9a8d4', mb: 2 }}>
            Fingerprint / Face ID Enrolment
          </Typography>

          {!webAuthnSupported() ? (
            <Alert icon={<ErrorOutlineIcon />} severity="error"
              sx={{ mb: 2.5, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', '& .MuiAlert-message': { fontSize: F.body } }}>
              WebAuthn is not available in this browser. Use Chrome, Firefox, or Safari on a device with a fingerprint sensor or Face ID.
            </Alert>
          ) : (
            <>
              {/* Fingerprint animation */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', width: 110, height: 110, mb: 2 }}>
                  {[1, 2, 3].map((ring) => (
                    <Box key={ring} sx={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 110, height: 110, borderRadius: '50%',
                      border: `1.5px solid ${fpState === 'prompt' ? 'rgba(249,168,212,0.5)' : 'rgba(255,255,255,0.06)'}`,
                      ...(fpState === 'prompt' && {
                        animation: `rippleRing ${1.4 + ring * 0.4}s ease-out infinite`,
                        animationDelay: `${ring * 0.3}s`,
                      }),
                      '@keyframes rippleRing': {
                        '0%':   { transform: 'translate(-50%,-50%) scale(0.7)', opacity: 0.8 },
                        '100%': { transform: 'translate(-50%,-50%) scale(1.9)', opacity: 0 },
                      },
                    }} />
                  ))}
                  <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 80, height: 80, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.4s ease',
                    background: fpState === 'prompt' ? 'linear-gradient(135deg, #be185d, #ec4899)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${fpState === 'prompt' ? 'rgba(249,168,212,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: fpState === 'prompt' ? '0 0 48px rgba(236,72,153,0.4)' : 'none',
                  }}>
                    {fpState === 'prompt'
                      ? <CircularProgress size={32} thickness={2.5} sx={{ color: '#fff' }} />
                      : <FingerprintIcon sx={{ fontSize: 40, color: fpState === 'error' ? '#f87171' : 'rgba(255,255,255,0.5)' }} />
                    }
                  </Box>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: F.body, mb: 0.5, textAlign: 'center', color: fpState === 'prompt' ? '#f9a8d4' : fpState === 'error' ? '#f87171' : 'rgba(255,255,255,0.85)', transition: 'color 0.3s' }}>
                  {fpState === 'prompt' ? 'Touch your fingerprint sensor or use Face ID…' : fpState === 'error' ? 'Enrolment failed — please retry' : 'Ready to enrol biometrics'}
                </Typography>
                {enrolledDevices.length > 0 && (
                  <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.35)', mt: 0.5 }}>
                    {enrolledDevices.length} device{enrolledDevices.length > 1 ? 's' : ''} already enrolled
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '10px', flexShrink: 0, mt: 0.5, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DevicesIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.5)' }} />
                </Box>
                <TextField fullWidth label="Device Name"
                  placeholder="e.g. My iPhone, Work Laptop, Home Desktop"
                  value={deviceName}
                  onChange={(e) => { setDeviceName(e.target.value); setNameError(''); }}
                  error={!!nameError}
                  helperText={nameError || 'A recognisable label for this authenticator device'}
                  disabled={fpState === 'prompt'}
                  inputProps={{ maxLength: 40 }}
                  sx={{
                    '& .MuiOutlinedInput-root': { color: '#fff', '& input': { fontSize: F.body }, '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' }, '&:hover fieldset': { borderColor: 'rgba(249,168,212,0.5)' }, '&.Mui-focused fieldset': { borderColor: '#f9a8d4' } },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)', fontSize: F.body },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#f9a8d4' },
                    '& .MuiFormHelperText-root': { color: nameError ? '#f87171' : 'rgba(255,255,255,0.35)', fontSize: F.small },
                  }} />
              </Box>

              <Button fullWidth variant="contained" onClick={handleEnroll}
                disabled={fpState === 'prompt' || getOptions.isLoading || verifyReg.isLoading}
                startIcon={fpState === 'prompt' ? <CircularProgress size={18} color="inherit" /> : <FingerprintIcon />}
                sx={{
                  py: 1.6, borderRadius: 2.5, fontWeight: 700, fontSize: F.btn,
                  background: fpState === 'error' ? 'linear-gradient(135deg, #b91c1c, #ef4444)' : 'linear-gradient(135deg, #be185d, #ec4899)',
                  '&:hover': { background: 'linear-gradient(135deg, #9d174d, #db2777)' },
                  '&:disabled': { color: 'rgba(255,255,255,0.35)' },
                }}>
                {fpState === 'prompt' ? 'Awaiting biometric…' : fpState === 'error' ? 'Retry Enrolment' : 'Enrol Fingerprint / Face ID'}
              </Button>
            </>
          )}

          <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.25)', mt: 2.5, textAlign: 'center' }}>
            Powered by WebAuthn (FIDO2) · Biometric data never leaves your device
          </Typography>
        </Box>
      )}

    </Box>
  );
}
