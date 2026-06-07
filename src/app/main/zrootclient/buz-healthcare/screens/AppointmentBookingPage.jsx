import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import HealthcareHeader from './shared-components/HealthcareHeader';
import HealthcareSidebarLeft from './shared-components/HealthcareSidebarLeft';
import HealthcareSidebarRight from './shared-components/HealthcareSidebarRight';
import { useBookConsultation } from '../hooks/useHealthcareRepo';
import { mockFacilities, mockPractitioners } from '../mock';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const SX_SELECT = { borderRadius: '12px', fontSize: '1.76rem' };
const SX_LABEL = { fontSize: '1.76rem' };
const SX_ITEM = { fontSize: '1.76rem' };

function ActiveAppointmentBookingPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [form, setForm] = useState({ facilityId: '', practitionerId: '', date: '', time: '', reason: '', appointmentType: '' });
  const [booked, setBooked] = useState(null);
  const bookMutation = useBookConsultation();

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const availablePractitioners = useMemo(() =>
    form.facilityId ? mockPractitioners.filter((p) => p.facilityId === form.facilityId) : [],
    [form.facilityId]
  );

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value, ...(key === 'facilityId' ? { practitionerId: '' } : {}) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await bookMutation.mutateAsync(form);
    if (result?.data?.success) setBooked(result.data);
  }

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <HealthcareHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Book Appointment" subtitle="Healthcare · Choose Facility · Select Time Slot" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <HealthcareSidebarLeft />, []);
  const rightSidebar = useMemo(() => <HealthcareSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
      {booked ? (
        <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <CheckCircle sx={{ fontSize: 96, color: '#16a34a', mb: 2 }} />
            <h2 style={{ margin: '0 0 12px', fontWeight: 900, color: '#111827', fontSize: '3.2rem' }}>Appointment Booked!</h2>
            <p style={{ color: '#6b7280', fontSize: '1.9rem', marginBottom: 20 }}>{booked.message}</p>
            <div style={{ padding: '20px 28px', borderRadius: 18, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 28 }}>
              <div style={{ fontWeight: 700, color: '#6b7280', fontSize: '1.64rem', marginBottom: 6 }}>Reference Code</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '2.6rem', color: '#16a34a', letterSpacing: '0.05em' }}>{booked.referenceCode}</div>
            </div>
            <Button component={Link} to="/healthcare/my-appointments" variant="contained"
              sx={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', px: 5, py: 2, fontSize: '1.9rem', '&:hover': { filter: 'brightness(0.92)' } }}>
              View My Appointments
            </Button>
          </motion.div>
        </div>
      ) : (
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>Book an Appointment</h1>
            <p style={{ margin: '0 0 36px', color: '#6b7280', fontSize: '1.9rem' }}>Choose a facility, practitioner, and preferred time slot.</p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <FormControl fullWidth required>
              <InputLabel sx={SX_LABEL}>Facility</InputLabel>
              <Select value={form.facilityId} label="Facility" onChange={(e) => handleChange('facilityId', e.target.value)} sx={SX_SELECT}>
                {mockFacilities.filter((f) => f.status === 'open').map((f) => (
                  <MenuItem key={f.id} value={f.id} sx={SX_ITEM}>{f.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required disabled={!form.facilityId}>
              <InputLabel sx={SX_LABEL}>Practitioner</InputLabel>
              <Select value={form.practitionerId} label="Practitioner" onChange={(e) => handleChange('practitionerId', e.target.value)} sx={SX_SELECT}>
                {availablePractitioners.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={SX_ITEM}>{p.name} — {p.specialty}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel sx={SX_LABEL}>Appointment Type</InputLabel>
              <Select value={form.appointmentType} label="Appointment Type" onChange={(e) => handleChange('appointmentType', e.target.value)} sx={SX_SELECT}>
                <MenuItem value="consultation" sx={SX_ITEM}>General Consultation</MenuItem>
                <MenuItem value="follow_up" sx={SX_ITEM}>Follow-Up Visit</MenuItem>
                <MenuItem value="antenatal" sx={SX_ITEM}>Antenatal Care</MenuItem>
                <MenuItem value="vaccination" sx={SX_ITEM}>Vaccination</MenuItem>
                <MenuItem value="lab_test" sx={SX_ITEM}>Lab Test</MenuItem>
              </Select>
            </FormControl>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <TextField label="Date" type="date" required fullWidth value={form.date} onChange={(e) => handleChange('date', e.target.value)}
                InputLabelProps={{ shrink: true, style: { fontSize: '1.76rem' } }}
                inputProps={{ min: new Date().toISOString().split('T')[0], style: { fontSize: '1.76rem' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '1.76rem' } }} />
              <FormControl fullWidth required>
                <InputLabel sx={SX_LABEL}>Time Slot</InputLabel>
                <Select value={form.time} label="Time Slot" onChange={(e) => handleChange('time', e.target.value)} sx={SX_SELECT}>
                  {TIME_SLOTS.map((t) => <MenuItem key={t} value={t} sx={SX_ITEM}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </div>

            <TextField label="Reason for Visit" multiline rows={4} fullWidth value={form.reason} onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Briefly describe your symptoms or reason for visiting..."
              InputLabelProps={{ style: { fontSize: '1.76rem' } }}
              inputProps={{ style: { fontSize: '1.76rem' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '1.76rem' } }} />

            <Button type="submit" variant="contained"
              disabled={bookMutation.isLoading || !form.facilityId || !form.practitionerId || !form.date || !form.time || !form.appointmentType}
              sx={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', color: 'white', fontWeight: 800, borderRadius: '16px', textTransform: 'none', py: 2.25, fontSize: '2rem', '&:hover': { filter: 'brightness(0.92)' } }}>
              {bookMutation.isLoading ? <CircularProgress size={28} sx={{ color: 'white' }} /> : 'Confirm Appointment'}
            </Button>
          </motion.form>
        </div>
      )}
    </div>
  ), [form, availablePractitioners, bookMutation, booked, handleSubmit]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveAppointmentBookingPage);
export default function AppointmentBookingPage() { return <MemoizedActivePage />; }
