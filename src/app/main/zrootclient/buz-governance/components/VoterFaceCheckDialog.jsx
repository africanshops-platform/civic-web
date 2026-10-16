import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useFaceCheck } from '../hooks/useGovernanceRepo';

// face-api.js models are served from /public/models (the same ones identity verification uses).
let modelsPromise = null;
const ensureModels = () => {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ]).catch((e) => { modelsPromise = null; throw e; });
  }
  return modelsPromise;
};

/**
 * Accredits the voter: a live camera capture is compared with the face registered at identity verification. Only a match
 * yields the one-time token the vote needs, so nobody can vote from someone else's signed-in session, and a person
 * who has already voted never gets this far (the portal checks first).
 */
export default function VoterFaceCheckDialog({ open, electionId, onClose, onAccredited }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [state, setState] = useState('starting'); // starting | ready | scanning | error | denied
  const [message, setMessage] = useState('');
  const faceCheck = useFaceCheck(electionId);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setState('starting');
    setMessage('');
    Promise.all([
      ensureModels(),
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } }),
    ])
      .then(([, stream]) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => { /* autoplay may be blocked; the voter can still scan */ }); }
        setState('ready');
      })
      .catch((err) => { if (!cancelled) setState(err?.name === 'NotAllowedError' ? 'denied' : 'error'); });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  async function scan() {
    setState('scanning');
    setMessage('');
    try {
      const found = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (!found) { setState('ready'); setMessage('No face found. Look straight at the camera in good light and try again.'); return; }
      faceCheck.mutate(Array.from(found.descriptor), {
        onSuccess: (res) => onAccredited(res.actionToken),
        onError: () => setState('ready'),
      });
    } catch {
      setState('ready');
      setMessage('Could not read your face. Please try again.');
    }
  }

  return (
    <Dialog open={open} onClose={faceCheck.isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Verify it is you</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: '0.95rem', color: '#4b5563', mb: 1.5 }}>
          Before you vote we check your face against the one you registered. This confirms the person voting is you, and that each person votes once. Your face is not shared and your choice stays secret.
        </Typography>
        {state === 'denied' && <Alert severity="error">Camera access was blocked. Allow the camera for this site and try again.</Alert>}
        {state === 'error' && <Alert severity="error">The camera or the face check could not start on this device.</Alert>}
        {message && <Alert severity="warning" sx={{ mb: 1 }}>{message}</Alert>}
        {(state === 'starting' || state === 'ready' || state === 'scanning') && (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#111827' }}>
            <video ref={videoRef} muted playsInline style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }} />
            {state === 'starting' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#fff' }} /></div>}
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={faceCheck.isLoading} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" onClick={scan} disabled={state !== 'ready' || faceCheck.isLoading} sx={{ textTransform: 'none', fontWeight: 700 }}>
          {state === 'scanning' || faceCheck.isLoading ? 'Checking…' : 'Scan my face'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
