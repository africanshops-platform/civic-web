import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, TextField, CircularProgress, Stepper, Step, StepLabel } from '@mui/material';
import { Shield, LocationOn, Send, ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useReportIncident } from '../hooks/useSecurityRepo';
import SecurityHeader from './shared-components/SecurityHeader';
import SocDashboardSidebarLeft from './shared-components/SocDashboardSidebarLeft';
import SocDashboardSidebarRight from './shared-components/SocDashboardSidebarRight';
import { INCIDENT_CATEGORIES, SEVERITY_CONFIG } from '../mock';

const F = {
  body:      'clamp(1.3rem,  2vw,   1.64rem)',
  meta:      'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:       'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:  'clamp(2rem,    4vw,   3.4rem)',
  subH:      'clamp(1.4rem,  2.2vw, 1.8rem)',
  stepTitle: 'clamp(1.5rem,  2.8vw, 2.2rem)',
};

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    '& fieldset':             { borderColor: 'rgba(255,255,255,0.18)' },
    '&:hover fieldset':       { borderColor: '#dc2626' },
    '&.Mui-focused fieldset': { borderColor: '#dc2626' },
  },
  '& .MuiInputBase-input, & .MuiInputBase-inputMultiline': {
    color: 'white', fontSize: F.body,
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.55)', fontSize: F.body,
    '&.Mui-focused': { color: '#f87171' },
  },
};

const Root = styled(FusePageSimpleWithMargin)(() => ({
  '& .FusePageSimple-header':  { backgroundColor: '#0f172a', borderBottomWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)' },
  '& .FusePageSimple-sidebar': { backgroundColor: '#0f172a' },
  '& .FusePageSimple-content': { backgroundColor: '#0f172a' },
}));

const STEPS = ['Location', 'Incident Type', 'Details', 'Review'];

function ActiveReportIncidentPage() {
  const navigate  = useNavigate();
  const isMobile  = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { mutate: submitReport, isLoading, isSuccess } = useReportIncident();
  const [step,   setStep]   = useState(0);
  const [form,   setForm]   = useState({ address: '', lga: '', state: '', category: '', severity: '', description: '' });
  const [errors, setErrors] = useState({});

  const update = (field, value) => { setForm((p) => ({ ...p, [field]: value })); setErrors((p) => ({ ...p, [field]: undefined })); };

  const validateStep = () => {
    const e = {};
    if (step === 0) { if (!form.address) e.address = 'Address is required'; if (!form.state) e.state = 'State is required'; }
    if (step === 1) { if (!form.category) e.category = 'Select a category'; if (!form.severity) e.severity = 'Select a severity level'; }
    if (step === 2) { if (!form.description || form.description.length < 20) e.description = 'Describe the incident (min 20 characters)'; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext   = () => { if (validateStep()) setStep((s) => s + 1); };
  const handleSubmit = () => { if (!validateStep()) return; submitReport(form, { onSuccess: () => setTimeout(() => navigate('/security/my-reports'), 2200) }); };

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <SecurityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Report Incident" subtitle="Help keep your community safe" showReportBtn={false} />
  ), [handleLeftToggle, handleRightToggle]);

  const stepContent = [
    /* STEP 0 — Location */
    <div key="loc" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px,2.5vw,24px)' }}>
      <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: F.body, lineHeight: 1.75 }}>
        Where is this happening? Be as specific as possible so our team can respond accurately.
      </div>
      <TextField fullWidth label="Street Address / Landmark" value={form.address}
        onChange={(e) => update('address', e.target.value)} sx={INPUT_SX} error={!!errors.address}
        helperText={<span style={{ color: '#f87171', fontSize: F.meta }}>{errors.address}</span>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(12px,2vw,18px)' }}>
        <TextField fullWidth label="State" value={form.state} onChange={(e) => update('state', e.target.value)}
          sx={INPUT_SX} error={!!errors.state}
          helperText={<span style={{ color: '#f87171', fontSize: F.meta }}>{errors.state}</span>} />
        <TextField fullWidth label="LGA" value={form.lga} onChange={(e) => update('lga', e.target.value)} sx={INPUT_SX} />
      </div>
      <div style={{ padding: 'clamp(12px,1.8vw,18px)', borderRadius: 14, background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.25)' }}>
        <div style={{ fontSize: F.body, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.6 }}>
          <LocationOn style={{ color: '#ea580c', fontSize: 'clamp(18px, 2.2vw, 22px)', flexShrink: 0 }} />
          Tip: Use your browser's Share Location for pinpoint accuracy.
        </div>
      </div>
    </div>,

    /* STEP 1 — Incident Type */
    <div key="type" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.5vw,28px)' }}>
      <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: F.body, lineHeight: 1.75 }}>
        Select the incident type and your assessment of severity.
      </div>
      <div>
        <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.42)', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Incident Type</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(110px,14vw,140px), 1fr))', gap: 'clamp(8px,1.5vw,14px)' }}>
          {INCIDENT_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => update('category', cat.id)}
              style={{ padding: 'clamp(12px,2vw,18px) clamp(8px,1.5vw,14px)', borderRadius: 14, border: `2px solid ${form.category === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`, backgroundColor: form.category === cat.id ? `${cat.color}22` : 'rgba(255,255,255,0.03)', color: form.category === cat.id ? cat.color : 'rgba(255,255,255,0.72)', cursor: 'pointer', fontWeight: 700, fontSize: F.body, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(6px,1vw,10px)', transition: 'all 0.2s' }}>
              <span style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', lineHeight: 1 }}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
        {errors.category && <div style={{ color: '#f87171', fontSize: F.meta, marginTop: 8 }}>{errors.category}</div>}
      </div>
      <div>
        <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.42)', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Severity Level</div>
        <div style={{ display: 'flex', gap: 'clamp(8px,1.5vw,14px)', flexWrap: 'wrap' }}>
          {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => update('severity', key)}
              style={{ padding: 'clamp(10px,1.5vw,14px) clamp(18px,3vw,28px)', borderRadius: 999, border: `2px solid ${form.severity === key ? cfg.color : 'rgba(255,255,255,0.12)'}`, backgroundColor: form.severity === key ? `${cfg.color}22` : 'transparent', color: form.severity === key ? cfg.color : 'rgba(255,255,255,0.68)', fontWeight: 700, fontSize: F.body, cursor: 'pointer', transition: 'all 0.2s' }}>
              {cfg.label}
            </button>
          ))}
        </div>
        {errors.severity && <div style={{ color: '#f87171', fontSize: F.meta, marginTop: 8 }}>{errors.severity}</div>}
      </div>
    </div>,

    /* STEP 2 — Description */
    <div key="desc" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px,2.5vw,24px)' }}>
      <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: F.body, lineHeight: 1.75 }}>
        Describe what is happening. Include the number of people involved, vehicles, or weapons if visible.
      </div>
      <TextField fullWidth multiline rows={6} label="Incident Description" value={form.description}
        onChange={(e) => update('description', e.target.value)} sx={INPUT_SX} error={!!errors.description}
        helperText={<span style={{ color: form.description.length < 20 ? '#f87171' : '#4ade80', fontSize: F.meta }}>{errors.description || `${form.description.length} / 500 characters`}</span>}
        inputProps={{ maxLength: 500 }} />
      <div style={{ padding: 'clamp(12px,1.8vw,18px)', borderRadius: 14, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.22)' }}>
        <div style={{ fontSize: F.body, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7 }}>
          🚨 <strong style={{ color: '#f87171' }}>If in immediate danger</strong>, call{' '}
          <strong style={{ color: 'white' }}>112</strong> or <strong style={{ color: 'white' }}>199</strong> first. Only submit this report once you are safe.
        </div>
      </div>
    </div>,

    /* STEP 3 — Review */
    <div key="review" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,2vw,18px)' }}>
      <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: F.body, lineHeight: 1.75 }}>Review your report before submitting.</div>
      {[
        { label: 'Location',    value: [form.address, form.lga, form.state].filter(Boolean).join(', ') },
        { label: 'Category',    value: INCIDENT_CATEGORIES.find((c) => c.id === form.category)?.label || form.category },
        { label: 'Severity',    value: SEVERITY_CONFIG[form.severity]?.label || form.severity },
        { label: 'Description', value: form.description },
      ].map((row) => (
        <div key={row.label} style={{ padding: 'clamp(14px,2vw,20px)', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 700 }}>{row.label}</div>
          <div style={{ fontSize: F.body, color: 'white', fontWeight: 600, lineHeight: 1.6 }}>
            {row.value || <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Not provided</span>}
          </div>
        </div>
      ))}
    </div>,
  ];

  const content = useMemo(() => {
    if (isSuccess) {
      return (
        <div className="flex-auto" style={{ background: '#0f172a', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,4vw,52px)' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', maxWidth: 480 }}>
            <motion.div animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 0.65 }}>
              <div style={{ width: 'clamp(80px,12vw,100px)', height: 'clamp(80px,12vw,100px)', borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#991b1b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto clamp(22px,3vw,34px)', boxShadow: '0 16px 40px rgba(220,38,38,0.45)' }}>
                <CheckCircle style={{ color: 'white', fontSize: 'clamp(2.2rem,4.5vw,3.2rem)' }} />
              </div>
            </motion.div>
            <div style={{ fontWeight: 900, fontSize: F.sectionH, color: 'white', marginBottom: 16, lineHeight: 1.1 }}>Report Submitted</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: F.body, lineHeight: 1.8 }}>
              Our security team has been notified. Stay safe and move to a secure location.
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="flex-auto" style={{ background: '#0f172a', minHeight: '100%', padding: 'clamp(20px,4vw,48px)', overflowY: 'auto' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'clamp(24px,3.5vw,40px)' }}>
            <Button startIcon={<ArrowBack style={{ fontSize: 'clamp(16px,2vw,20px)' }} />} onClick={() => navigate(-1)}
              style={{ fontSize: F.body }} sx={{ color: 'rgba(255,255,255,0.52)', mb: 2.5, textTransform: 'none', '&:hover': { color: 'white' } }}>
              Back
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,2vw,18px)' }}>
              <div style={{ width: 'clamp(48px,7vw,66px)', height: 'clamp(48px,7vw,66px)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 12px 32px rgba(220,38,38,0.44)', flexShrink: 0 }}>
                <Shield style={{ color: 'white', fontSize: 'clamp(1.6rem,3.2vw,2.2rem)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: F.sectionH, color: 'white', lineHeight: 1.1 }}>Report Incident</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: F.body, marginTop: 4 }}>Help keep your community safe</div>
              </div>
            </div>
          </motion.div>

          {/* Stepper */}
          <Stepper activeStep={step} sx={{
            mb: 'clamp(20px,3vw,36px)',
            '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.38)', fontSize: F.meta, '&.Mui-active': { color: 'white', fontWeight: 700 }, '&.Mui-completed': { color: '#4ade80' } },
            '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.15)', '&.Mui-active': { color: '#dc2626' }, '&.Mui-completed': { color: '#16a34a' } },
            '& .MuiStepConnector-line': { borderColor: 'rgba(255,255,255,0.08)' },
          }}>
            {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {/* Step card */}
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.32 }}
            style={{ background: 'rgba(255,255,255,0.045)', borderRadius: 'clamp(18px,2.5vw,26px)', padding: 'clamp(22px,3.5vw,40px)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 'clamp(20px,3vw,30px)' }}>
            <div style={{ fontWeight: 900, fontSize: F.stepTitle, color: 'white', marginBottom: 'clamp(16px,2.5vw,26px)' }}>
              {STEPS[step]}
            </div>
            {stepContent[step]}
          </motion.div>

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'clamp(10px,2vw,16px)' }}>
            <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)} variant="outlined"
              style={{ fontSize: F.btn }}
              sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.65)', borderRadius: '14px', textTransform: 'none', px: { xs: 3, sm: 4 }, py: { xs: 1.4, sm: 1.6 }, minWidth: 'clamp(100px,14vw,140px)', '&:hover': { borderColor: 'rgba(255,255,255,0.45)', color: 'white', backgroundColor: 'rgba(255,255,255,0.04)' }, '&:disabled': { borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' } }}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="contained" endIcon={<ArrowForward />} onClick={handleNext}
                style={{ fontSize: F.btn }}
                sx={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', px: { xs: 3.5, sm: 5 }, py: { xs: 1.4, sm: 1.6 }, boxShadow: '0 8px 24px rgba(220,38,38,0.42)', '&:hover': { background: 'linear-gradient(135deg,#b91c1c,#7f1d1d)', transform: 'translateY(-1px)' } }}>
                Next
              </Button>
            ) : (
              <Button variant="contained" endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                disabled={isLoading} onClick={handleSubmit}
                style={{ fontSize: F.btn }}
                sx={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none', px: { xs: 3.5, sm: 5 }, py: { xs: 1.4, sm: 1.6 }, boxShadow: '0 8px 24px rgba(220,38,38,0.42)', '&:hover': { background: 'linear-gradient(135deg,#b91c1c,#7f1d1d)' }, '&:disabled': { background: '#374151', color: '#6b7280', boxShadow: 'none' } }}>
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </Button>
            )}
          </div>

        </div>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, form, errors, isLoading, isSuccess]);

  const leftSidebar  = useMemo(() => <SocDashboardSidebarLeft />, []);
  const rightSidebar = useMemo(() => <SocDashboardSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveReportIncidentPage = memo(ActiveReportIncidentPage);
export default function ReportIncidentPage() { return <MemoizedActiveReportIncidentPage />; }
