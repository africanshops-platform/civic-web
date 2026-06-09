import { useRef, useState } from 'react';
import {
  Box, Button, CircularProgress, Divider, LinearProgress, TextField, Typography,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import {
  uploadDocumentImage,
  useSubmitDocument,
} from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';

const F = {
  heading:  'clamp(1.76rem, 2.6vw, 2.2rem)',
  sub:      'clamp(1.3rem,  1.8vw, 1.56rem)',
  body:     'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:    'clamp(1.44rem, 2vw,   1.76rem)',
  small:    'clamp(1.3rem,  1.8vw, 1.56rem)',
  btn:      'clamp(1.3rem,  2vw,   1.76rem)',
  docCard:  'clamp(1.3rem,  1.8vw, 1.5rem)',
};

const DOC_TYPES = [
  { value: 'NIN',             label: 'NIN',           sublabel: 'National Identity',  icon: '🪪', placeholder: 'e.g. 12345678901' },
  { value: 'PASSPORT',        label: 'Passport',      sublabel: 'International',      icon: '📕', placeholder: 'e.g. A12345678'  },
  { value: 'DRIVERS_LICENSE', label: "Driver's Lic",  sublabel: "Driver's Licence",   icon: '🚗', placeholder: 'e.g. ABC001234'  },
];

const DOC_LABEL = {
  NIN:             'National Identity Number (NIN)',
  PASSPORT:        'International Passport',
  DRIVERS_LICENSE: "Driver's Licence",
};

// ─── Completion banner shown when documentSubmitted === true ──────────────────
function DocumentCompletedBanner({ documentType, onUpdate }) {
  const label = DOC_LABEL[documentType] ?? 'Identity Document';
  return (
    <Box sx={{ px: 3.5, py: 4, textAlign: 'center' }}>
      {/* Icon */}
      <Box sx={{
        width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 2.5,
        background: 'linear-gradient(135deg, #16a34a, #4ade80)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(74,222,128,0.3)',
      }}>
        <CheckCircleIcon sx={{ fontSize: 44, color: '#fff' }} />
      </Box>

      <Typography sx={{ fontWeight: 800, fontSize: F.heading, color: '#4ade80', mb: 0.75 }}>
        Document Submitted ✓
      </Typography>
      <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.65)', mb: 2 }}>
        {label}
      </Typography>

      {/* Status pill */}
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1,
        px: 2.5, py: 0.75, borderRadius: 20, mb: 3,
        background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
      }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80', animation: 'pulse 2s ease-in-out infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
        <Typography sx={{ fontSize: F.small, color: '#4ade80', fontWeight: 700, letterSpacing: 0.5 }}>
          AWAITING ADMIN REVIEW
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 3 }} />

      {/* Info */}
      <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', mb: 3, textAlign: 'left' }}>
        <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
          Your document is on file. You can navigate to the <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Biometrics</strong> step to add facial or fingerprint verification, or return here to update this document if needed.
        </Typography>
      </Box>

      <Button
        onClick={onUpdate}
        startIcon={<RefreshIcon />}
        variant="outlined"
        sx={{
          fontSize: F.small, borderRadius: 2.5,
          borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)',
          '&:hover': { borderColor: 'rgba(255,255,255,0.4)', color: '#fff', background: 'rgba(255,255,255,0.05)' },
        }}
      >
        Update Document
      </Button>
    </Box>
  );
}

export default function KycDocumentStep({ completed = false, documentType = null }) {
  // When already completed, start in "view" mode (banner); user can switch to edit form
  const [showForm, setShowForm] = useState(!completed);

  const fileRef = useRef(null);

  const [docType,          setDocType]         = useState('NIN');
  const [docNumber,        setDocNumber]        = useState('');
  const [file,             setFile]             = useState(null);
  const [preview,          setPreview]          = useState(null);
  const [isDragging,       setIsDragging]       = useState(false);
  const [uploadProgress,   setUploadProgress]   = useState(0);
  const [uploading,        setUploading]        = useState(false);
  const [errors,           setErrors]           = useState({});

  const submitDocument = useSubmitDocument();
  const selectedDoc = DOC_TYPES.find((d) => d.value === docType);

  function handleFile(selected) {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) { toast.warning('Please select an image file.'); return; }
    if (selected.size > 5 * 1024 * 1024) { toast.warning('File must be under 5 MB.'); return; }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setErrors((e) => ({ ...e, file: undefined }));
  }

  function handleDrop(e) {
    e.preventDefault(); setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function validate() {
    const errs = {};
    if (!docNumber.trim()) errs.docNumber = 'Document number is required';
    if (!file) errs.file = 'Upload a clear photo of your document';
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setUploading(true); setUploadProgress(0);

    const t = setInterval(() => setUploadProgress((p) => p < 82 ? p + 11 : p), 300);
    try {
      const imageUrl = await uploadDocumentImage(file);
      setUploadProgress(100);
      clearInterval(t);
      await submitDocument.mutateAsync({
        documentType:     docType,
        documentNumber:   docNumber.trim().toUpperCase(),
        documentImageUrl: imageUrl,
      });
    } catch (err) {
      clearInterval(t);
      toast.error(err?.response?.data?.message || err.message || 'Submission failed. Please retry.');
    } finally {
      setUploading(false); setUploadProgress(0);
    }
  }

  const busy = uploading || submitDocument.isLoading;

  return (
    <Box sx={{ color: '#fff' }}>
      {/* Header */}
      <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
            background: completed
              ? 'linear-gradient(135deg, rgba(22,163,74,0.3), rgba(74,222,128,0.15))'
              : 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(167,139,250,0.15))',
            border: `1px solid ${completed ? 'rgba(74,222,128,0.35)' : 'rgba(167,139,250,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {completed
              ? <CheckCircleIcon sx={{ fontSize: 20, color: '#4ade80' }} />
              : <BadgeIcon sx={{ fontSize: 20, color: '#a78bfa' }} />}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: F.heading }}>Document Verification</Typography>
            <Typography sx={{ fontSize: F.sub, color: completed ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
              {completed ? 'Step 1 of 3 · Completed ✓' : 'Step 1 of 3 · Government-issued ID required'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Completion banner — shown when step is already done and user hasn't clicked Update */}
      {completed && !showForm && (
        <DocumentCompletedBanner documentType={documentType} onUpdate={() => setShowForm(true)} />
      )}

      {/* Form — shown on first visit OR after clicking Update */}
      {showForm && <Box sx={{ px: 3.5, py: 3 }}>
        {/* Document type cards */}
        <Typography sx={{ fontSize: F.label, color: 'rgba(255,255,255,0.5)', mb: 1.5, letterSpacing: 0.5, fontWeight: 600 }}>
          SELECT DOCUMENT TYPE
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          {DOC_TYPES.map((d) => {
            const selected = docType === d.value;
            return (
              <Box key={d.value} onClick={() => !busy && setDocType(d.value)} sx={{
                flex: 1, p: 1.75, borderRadius: 2.5, cursor: busy ? 'default' : 'pointer',
                textAlign: 'center', transition: 'all 0.2s ease',
                border: `1.5px solid ${selected ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.08)'}`,
                background: selected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                boxShadow: selected ? '0 0 18px rgba(139,92,246,0.2)' : 'none',
                '&:hover': selected || busy ? {} : { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' },
              }}>
                <Typography sx={{ fontSize: 'clamp(1.6rem, 2.6vw, 2rem)', lineHeight: 1, mb: 0.75 }}>{d.icon}</Typography>
                <Typography sx={{ fontSize: F.docCard, fontWeight: 700, color: selected ? '#c4b5fd' : 'rgba(255,255,255,0.75)', mb: 0.25 }}>
                  {d.label}
                </Typography>
                <Typography sx={{ fontSize: F.small, color: selected ? 'rgba(196,181,253,0.7)' : 'rgba(255,255,255,0.35)' }}>
                  {d.sublabel}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Document number */}
        <TextField fullWidth label="Document Number"
          value={docNumber}
          onChange={(e) => { setDocNumber(e.target.value); setErrors((er) => ({ ...er, docNumber: undefined })); }}
          error={!!errors.docNumber}
          helperText={errors.docNumber || `Enter the number exactly as it appears on your ${selectedDoc?.label}`}
          disabled={busy}
          placeholder={selectedDoc?.placeholder}
          inputProps={{ style: { textTransform: 'uppercase', color: '#fff', fontFamily: 'monospace', letterSpacing: 3, fontSize: 'clamp(1.5rem,2.2vw,1.9rem)' } }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
              '&:hover fieldset': { borderColor: 'rgba(167,139,250,0.5)' },
              '&.Mui-focused fieldset': { borderColor: '#a78bfa' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)', fontSize: F.body },
            '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
            '& .MuiFormHelperText-root': { color: errors.docNumber ? '#f87171' : 'rgba(255,255,255,0.35)', fontSize: F.small },
          }}
        />

        {/* Drop zone */}
        <Typography sx={{ fontSize: F.label, color: 'rgba(255,255,255,0.5)', mb: 1.5, letterSpacing: 0.5, fontWeight: 600 }}>
          DOCUMENT PHOTO
        </Typography>
        <Box
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !busy && fileRef.current?.click()}
          sx={{
            borderRadius: 3, cursor: busy ? 'default' : 'pointer',
            border: `2px dashed ${errors.file ? 'rgba(248,113,113,0.7)' : isDragging ? 'rgba(167,139,250,0.8)' : 'rgba(255,255,255,0.12)'}`,
            background: isDragging ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease', overflow: 'hidden', mb: errors.file ? 1 : 2,
            '&:hover': busy ? {} : { borderColor: 'rgba(167,139,250,0.4)', background: 'rgba(139,92,246,0.05)' },
          }}
        >
          {preview ? (
            <Box sx={{ position: 'relative' }}>
              <img src={preview} alt="Document"
                style={{ width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' }} />
              <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.72))',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: 2,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.75)' }} />
                  <Typography sx={{ fontSize: F.label, color: 'rgba(255,255,255,0.75)' }}>
                    Click or drag to replace
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 4.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 60, height: 60, borderRadius: '14px',
                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CloudUploadIcon sx={{ fontSize: 28, color: '#a78bfa' }} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: F.body, fontWeight: 600, color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                  {isDragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
                </Typography>
                <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.35)' }}>
                  JPG, PNG, WEBP · Max 5 MB
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {errors.file && (
          <Typography sx={{ fontSize: F.small, color: '#f87171', mb: 2, ml: 0.5 }}>
            {errors.file}
          </Typography>
        )}

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])} />

        {/* Upload progress */}
        {uploading && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: F.body, color: 'rgba(255,255,255,0.55)' }}>
                {uploadProgress < 100 ? 'Uploading to secure storage…' : 'Upload complete'}
              </Typography>
              <Typography sx={{ fontSize: F.label, color: '#a78bfa', fontWeight: 700 }}>{uploadProgress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={uploadProgress}
              sx={{ borderRadius: 2, height: 5, bgcolor: 'rgba(255,255,255,0.08)',
                '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' } }} />
          </Box>
        )}

        <Button fullWidth variant="contained" onClick={handleSubmit} disabled={busy}
          startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
          sx={{
            py: 1.6, borderRadius: 2.5, fontWeight: 700, fontSize: F.btn,
            background: busy ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            '&:hover': { background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' },
            '&:disabled': { color: 'rgba(255,255,255,0.35)' },
          }}>
          {busy ? (uploading ? 'Uploading…' : 'Submitting Document…') : 'Submit Document'}
        </Button>

        <Typography sx={{ fontSize: F.small, color: 'rgba(255,255,255,0.25)', mt: 2.5, textAlign: 'center' }}>
          Document data is encrypted in transit and at rest. Used solely for identity verification.
        </Typography>
      </Box>}
    </Box>
  );
}
