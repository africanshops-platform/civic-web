import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Chip, CircularProgress, Divider } from '@mui/material';
import { ArrowBack, Star, Schedule, Phone, Email, LocalHospital } from '@mui/icons-material';
import { motion } from 'framer-motion';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import HealthcareHeader from './shared-components/HealthcareHeader';
import HealthcareSidebarLeft from './shared-components/HealthcareSidebarLeft';
import HealthcareSidebarRight from './shared-components/HealthcareSidebarRight';
import { useFacilityDetail } from '../hooks/useHealthcareRepo';
import { FACILITY_TYPES } from '../mock';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

function ActiveFacilityDetailPage() {
  const { facilityId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useFacilityDetail(facilityId);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <HealthcareHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Facility Details" subtitle="Healthcare · Facilities · Book Appointment" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <HealthcareSidebarLeft />, []);
  const rightSidebar = useMemo(() => <HealthcareSidebarRight />, []);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={56} sx={{ color: '#16a34a' }} />
        </div>
      );
    }

    if (isError || !data?.data?.facility) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%', textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 14 }}>⚠️</div>
          <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.8rem' }}>Facility not found.</div>
          <Button component={Link} to="/healthcare/dashboard" sx={{ mt: 2, fontSize: '1.76rem' }} startIcon={<ArrowBack />}>Back to Facilities</Button>
        </div>
      );
    }

    const { facility, practitioners } = data.data;
    const typeInfo = FACILITY_TYPES.find((t) => t.id === facility.type) || FACILITY_TYPES[0];

    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Button component={Link} to="/healthcare/dashboard" startIcon={<ArrowBack sx={{ fontSize: 28 }} />}
            sx={{ mb: 3, color: '#6b7280', textTransform: 'none', fontWeight: 600, fontSize: '1.76rem', px: 0 }}>
            Back to Facilities
          </Button>

          {/* Header card */}
          <motion.div {...inView()} style={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', borderRadius: 24, padding: 'clamp(28px,4vw,40px)', border: '1px solid #bbf7d0', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ width: 76, height: 76, borderRadius: 18, background: typeInfo.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', flexShrink: 0 }}>
                {typeInfo.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>{facility.name}</h1>
                  <Chip label={facility.status === 'open' ? 'Open Now' : 'Closed'} sx={{ height: 40, fontSize: '1.6rem', background: facility.status === 'open' ? '#dcfce7' : '#fee2e2', color: facility.status === 'open' ? '#166534' : '#991b1b', fontWeight: 800 }} />
                </div>
                <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '1.9rem' }}>{facility.location.address}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 14 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '1.8rem', color: '#374151' }}>
                    <Star sx={{ fontSize: 26, color: '#f59e0b' }} /><strong>{facility.rating}</strong> ({facility.reviewsCount} reviews)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '1.8rem', color: '#374151' }}>
                    <Schedule sx={{ fontSize: 26, color: '#6b7280' }} />{facility.waitTimeMinutes} min avg wait
                  </span>
                  <span style={{ fontSize: '1.8rem', color: '#374151' }}>🏥 {facility.availableBeds}/{facility.totalBeds} beds available</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 20 }}>
            <motion.div {...inView(0.1)} style={{ background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 18px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Contact Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {facility.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Phone sx={{ fontSize: 28, color: '#16a34a' }} />
                    <a href={`tel:${facility.phone}`} style={{ color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '1.8rem' }}>{facility.phone}</a>
                  </div>
                )}
                {facility.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Email sx={{ fontSize: 28, color: '#16a34a' }} />
                    <a href={`mailto:${facility.email}`} style={{ color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '1.8rem' }}>{facility.email}</a>
                  </div>
                )}
              </div>
              <Divider sx={{ my: 2.5 }} />
              <h4 style={{ margin: '0 0 12px', fontWeight: 700, color: '#374151', fontSize: '1.76rem' }}>Operating Hours</h4>
              {Object.entries(facility.operatingHours).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '1.7rem' }}>
                  <span style={{ color: '#6b7280', fontWeight: 600, textTransform: 'capitalize' }}>{key}</span>
                  <span style={{ color: '#111827', fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </motion.div>

            <motion.div {...inView(0.15)} style={{ background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 18px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Services Offered</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {facility.services.map((s) => (
                  <Chip key={s} label={s} sx={{ height: 36, fontSize: '1.4rem', background: '#f0fdf4', color: '#166534', fontWeight: 600, border: '1px solid #bbf7d0' }} />
                ))}
              </div>
              <Divider sx={{ my: 2.5 }} />
              <h4 style={{ margin: '0 0 12px', fontWeight: 700, color: '#374151', fontSize: '1.76rem' }}>Insurance Accepted</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {facility.insuranceProviders.map((p) => (
                  <Chip key={p} label={p} sx={{ height: 36, fontSize: '1.4rem', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }} />
                ))}
              </div>
            </motion.div>
          </div>

          {practitioners?.length > 0 && (
            <motion.div {...inView(0.2)} style={{ background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb', marginTop: 20 }}>
              <h3 style={{ margin: '0 0 18px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>
                <LocalHospital sx={{ fontSize: 28, color: '#16a34a', mr: 1, verticalAlign: 'middle' }} />
                Practitioners ({practitioners.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap: 18 }}>
                {practitioners.map((p) => (
                  <div key={p.id} style={{ padding: 20, borderRadius: 16, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.4rem', flexShrink: 0 }}>
                        {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.76rem', color: '#111827' }}>{p.name}</div>
                        <div style={{ fontSize: '1.52rem', color: '#6b7280' }}>{p.specialty}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.56rem', color: '#6b7280' }}>{p.yearsExperience}yrs exp</span>
                      {p.rating && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '1.56rem', color: '#374151' }}><Star sx={{ fontSize: 22, color: '#f59e0b' }} />{p.rating}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div {...inView(0.25)} style={{ marginTop: 24, padding: 32, borderRadius: 22, background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', textAlign: 'center' }}>
            <h3 style={{ color: 'white', fontWeight: 900, margin: '0 0 12px', fontSize: '2.4rem' }}>Ready to Book an Appointment?</h3>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 24px', fontSize: '1.8rem' }}>Choose your preferred time slot with any available practitioner.</p>
            <Button component={Link} to="/healthcare/book" variant="contained"
              sx={{ backgroundColor: 'white', color: '#16a34a', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: 6, py: 2, fontSize: '2rem', '&:hover': { backgroundColor: '#f0fdf4', transform: 'translateY(-2px)' } }}>
              Book Appointment
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }, [data, isLoading, isError]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveFacilityDetailPage = memo(ActiveFacilityDetailPage);
export default function FacilityDetailPage() { return <MemoizedActiveFacilityDetailPage />; }
