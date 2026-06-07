import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Chip, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { CalendarToday, Schedule } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import HealthcareHeader from './shared-components/HealthcareHeader';
import HealthcareSidebarLeft from './shared-components/HealthcareSidebarLeft';
import HealthcareSidebarRight from './shared-components/HealthcareSidebarRight';
import { useMyAppointments, useCancelAppointment } from '../hooks/useHealthcareRepo';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const STATUS_STYLES = {
  confirmed: { bg: '#dcfce7', color: '#166534', label: 'Confirmed' },
  pending: { bg: '#fffbeb', color: '#b45309', label: 'Pending' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  completed: { bg: '#f3f4f6', color: '#374151', label: 'Completed' },
};

function ActiveMyAppointmentsPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useMyAppointments();
  const cancelMutation = useCancelAppointment();
  const appointments = useMemo(() => data?.data?.appointments ?? [], [data]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <HealthcareHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="My Appointments" subtitle="Healthcare · Your Booked Appointments" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <HealthcareSidebarLeft />, []);
  const rightSidebar = useMemo(() => <HealthcareSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>
              <CalendarToday sx={{ fontSize: 'inherit', color: '#16a34a', mr: 1, verticalAlign: 'middle' }} />
              My Appointments
            </h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '1.8rem' }}>{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</p>
          </div>
          <Button component={Link} to="/healthcare/book" variant="contained"
            sx={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: '1.76rem', px: 3, py: 1.5, '&:hover': { filter: 'brightness(0.92)' } }}>
            + New Appointment
          </Button>
        </div>

        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#16a34a' }} /></div>}

        {isError && (
          <div style={{ padding: 32, textAlign: 'center', borderRadius: 18, background: '#fef2f2', border: '1px solid #fecaca' }}>
            <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '1.8rem' }}>Failed to load appointments.</div>
          </div>
        )}

        {!isLoading && !isError && appointments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>📋</div>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem', marginBottom: 10 }}>No appointments yet</div>
            <div style={{ color: '#9ca3af', fontSize: '1.8rem', marginBottom: 28 }}>Book your first appointment with a nearby facility.</div>
            <Button component={Link} to="/healthcare/book" variant="contained"
              sx={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: '1.76rem', px: 4, py: 1.5, '&:hover': { filter: 'brightness(0.92)' } }}>
              Book Appointment
            </Button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {appointments.map((apt, i) => {
            const statusStyle = STATUS_STYLES[apt.status] || STATUS_STYLES.pending;
            return (
              <motion.div key={apt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: 28, borderRadius: 22, background: 'white', border: '1px solid #e5e7eb', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0, border: '1px solid #bbf7d0' }}>
                  🏥
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: '2rem' }}>{apt.facilityName}</div>
                    <Chip label={statusStyle.label} sx={{ height: 36, fontSize: '1.4rem', background: statusStyle.bg, color: statusStyle.color, fontWeight: 800 }} />
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '1.76rem', marginBottom: 10 }}>Dr. {apt.practitionerName} · {apt.specialty}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '1.7rem', color: '#374151' }}><CalendarToday sx={{ fontSize: 24 }} />{apt.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '1.7rem', color: '#374151' }}><Schedule sx={{ fontSize: 24 }} />{apt.time}</span>
                    {apt.referenceCode && <span style={{ fontSize: '1.64rem', color: '#9ca3af', fontFamily: 'monospace' }}>Ref: {apt.referenceCode}</span>}
                  </div>
                </div>
                {(apt.status === 'confirmed' || apt.status === 'pending') && (
                  <Button size="medium" onClick={() => cancelMutation.mutate(apt.id)} disabled={cancelMutation.isLoading}
                    sx={{ color: '#dc2626', border: '1px solid #fecaca', borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '1.6rem', px: 2.5, flexShrink: 0, '&:hover': { background: '#fef2f2' } }}>
                    Cancel
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  ), [appointments, isLoading, isError, cancelMutation]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveMyAppointmentsPage);
export default function MyAppointmentsPage() { return <MemoizedActivePage />; }
