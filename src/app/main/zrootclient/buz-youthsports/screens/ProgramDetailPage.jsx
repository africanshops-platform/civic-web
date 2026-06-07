import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Chip, CircularProgress, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowBack, Star, CalendarToday, CheckCircle } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import YouthSportsHeader from './shared-components/YouthSportsHeader';
import YouthSportsSidebarLeft from './shared-components/YouthSportsSidebarLeft';
import YouthSportsSidebarRight from './shared-components/YouthSportsSidebarRight';
import { useProgramDetail, useEnrollInProgram } from '../hooks/useYouthSportsRepo';
import { PROGRAM_CATEGORIES } from '../mock';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const STATUS_STYLES = {
  open: { bg: '#dcfce7', color: '#166534', label: 'Open' },
  upcoming: { bg: '#eff6ff', color: '#1d4ed8', label: 'Upcoming' },
  ongoing: { bg: '#fff7ed', color: '#9a3412', label: 'Ongoing' },
  closed: { bg: '#f3f4f6', color: '#6b7280', label: 'Closed' },
};

function ActiveProgramDetailPage() {
  const { programId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useProgramDetail(programId);
  const enrollMutation = useEnrollInProgram();

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <YouthSportsHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Programme Details" subtitle="Youth & Sports · Enrol · Get Skilled" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <YouthSportsSidebarLeft />, []);
  const rightSidebar = useMemo(() => <YouthSportsSidebarRight />, []);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={56} sx={{ color: '#ea580c' }} />
        </div>
      );
    }
    if (isError || !data?.data?.program) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%', textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 14 }}>⚠️</div>
          <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.8rem' }}>Programme not found.</div>
          <Button component={Link} to="/youth/programs" sx={{ mt: 2, fontSize: '1.76rem' }} startIcon={<ArrowBack />}>Back to Programmes</Button>
        </div>
      );
    }

    const { program } = data.data;
    const catInfo = PROGRAM_CATEGORIES.find((c) => c.id === program.category) || PROGRAM_CATEGORIES[0];
    const statusStyle = STATUS_STYLES[program.status] || STATUS_STYLES.closed;
    const fillPct = program.slots > 0 ? Math.round((program.enrolledCount / program.slots) * 100) : 0;
    const spotsLeft = program.slots - program.enrolledCount;

    if (enrolled) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%' }}>
          <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <CheckCircle sx={{ fontSize: 96, color: '#ea580c', mb: 2 }} />
              <h2 style={{ margin: '0 0 12px', fontWeight: 900, color: '#111827', fontSize: '3.2rem' }}>Enrolled Successfully!</h2>
              <p style={{ color: '#6b7280', fontSize: '1.9rem', marginBottom: 28 }}>You are now enrolled in <strong>{program.title}</strong>. Check your email for confirmation.</p>
              <Button component={Link} to="/youth/dashboard" variant="contained"
                sx={{ background: 'linear-gradient(135deg,#ea580c 0%,#dc2626 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', px: 5, py: 2, fontSize: '1.9rem', '&:hover': { filter: 'brightness(0.92)' } }}>
                Go to Dashboard
              </Button>
            </motion.div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Button component={Link} to="/youth/programs" startIcon={<ArrowBack sx={{ fontSize: 28 }} />}
            sx={{ mb: 3, color: '#6b7280', textTransform: 'none', fontWeight: 600, fontSize: '1.76rem', px: 0 }}>
            Back to Programmes
          </Button>

          <div style={{ background: 'linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%)', borderRadius: 24, padding: 'clamp(28px,4vw,40px)', border: '1px solid #fed7aa', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ width: 76, height: 76, borderRadius: 18, background: catInfo.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', flexShrink: 0 }}>
                {catInfo.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                  <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.6rem,4vw,3.8rem)', color: '#111827' }}>{program.title}</h1>
                  <Chip label={statusStyle.label} sx={{ height: 40, fontSize: '1.6rem', background: statusStyle.bg, color: statusStyle.color, fontWeight: 800 }} />
                </div>
                <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: '1.8rem' }}>{program.location.address}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                  <span style={{ fontSize: '1.8rem', color: '#374151' }}>📅 {program.duration}</span>
                  <span style={{ fontSize: '1.8rem', color: '#374151' }}>👤 Ages {program.ageRange.min}–{program.ageRange.max}</span>
                  {program.isFree ? <Chip label="FREE" sx={{ height: 36, fontSize: '1.4rem', fontWeight: 800, background: '#dcfce7', color: '#166534' }} /> : <span style={{ fontSize: '1.8rem', color: '#374151' }}>₦{program.fee.toLocaleString()}</span>}
                  {program.rating && <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Star sx={{ fontSize: 26, color: '#f59e0b' }} /><strong style={{ fontSize: '1.8rem' }}>{program.rating}</strong><span style={{ fontSize: '1.7rem', color: '#9ca3af' }}> · {program.graduatesCount} graduates</span></span>}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 20 }}>
            <div style={{ background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 14px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>About this Programme</h3>
              <p style={{ margin: '0 0 18px', color: '#6b7280', fontSize: '1.8rem', lineHeight: 1.7 }}>{program.description}</p>
              <h4 style={{ margin: '0 0 12px', fontWeight: 700, color: '#374151', fontSize: '1.76rem' }}>Skills You'll Gain</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {program.skills.map((s) => <Chip key={s} label={s} sx={{ height: 36, fontSize: '1.4rem', background: '#fff7ed', color: '#9a3412', fontWeight: 600, border: '1px solid #fed7aa' }} />)}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Enrolment</h3>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '1.7rem', color: '#6b7280', fontWeight: 600 }}>Spots filled</span>
                  <span style={{ fontSize: '1.7rem', fontWeight: 700, color: fillPct >= 90 ? '#dc2626' : '#374151' }}>{program.enrolledCount}/{program.slots} ({spotsLeft} left)</span>
                </div>
                <LinearProgress variant="determinate" value={fillPct} sx={{ borderRadius: 6, height: 10, background: '#f3f4f6', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#ea580c,#dc2626)', borderRadius: 6 } }} />
              </div>
              <div style={{ padding: 16, borderRadius: 14, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <CalendarToday sx={{ fontSize: 26, color: '#ea580c' }} />
                  <span style={{ fontWeight: 700, fontSize: '1.76rem', color: '#374151' }}>Programme Dates</span>
                </div>
                <div style={{ fontSize: '1.7rem', color: '#6b7280' }}>Start: <strong style={{ color: '#111827' }}>{new Date(program.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                <div style={{ fontSize: '1.7rem', color: '#6b7280', marginTop: 6 }}>End: <strong style={{ color: '#111827' }}>{new Date(program.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
              </div>
              <div style={{ fontSize: '1.64rem', color: '#6b7280', padding: '12px 16px', borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <strong>Facilitator:</strong> {program.facilitator.name}
              </div>
              {program.status === 'open' && spotsLeft > 0 ? (
                <Button onClick={() => enrollMutation.mutateAsync({ programId: program.id }).then((r) => { if (r?.data?.success) setEnrolled(true); })}
                  disabled={enrollMutation.isLoading} variant="contained"
                  sx={{ background: 'linear-gradient(135deg,#ea580c 0%,#dc2626 100%)', color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none', py: 2, fontSize: '2rem', '&:hover': { filter: 'brightness(0.92)' } }}>
                  {enrollMutation.isLoading ? <CircularProgress size={28} sx={{ color: 'white' }} /> : program.isFree ? 'Enrol Free' : `Enrol — ₦${program.fee.toLocaleString()}`}
                </Button>
              ) : (
                <Button disabled variant="contained" sx={{ fontWeight: 800, borderRadius: '14px', textTransform: 'none', py: 2, fontSize: '2rem' }}>
                  {program.status === 'closed' ? 'Applications Closed' : spotsLeft === 0 ? 'Fully Booked' : 'Not Available'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }, [data, isLoading, isError, enrolled, enrollMutation]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveProgramDetailPage);
export default function ProgramDetailPage() { return <MemoizedActivePage />; }
