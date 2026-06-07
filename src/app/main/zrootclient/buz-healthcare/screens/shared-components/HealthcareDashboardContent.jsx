import { memo } from 'react';
import { Button, CircularProgress, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, LocalHospital, Schedule, Star } from '@mui/icons-material';
import { FACILITY_TYPES } from '../../mock';

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

function FacilityRow({ facility }) {
  const typeInfo = FACILITY_TYPES.find((t) => t.id === facility.type) || FACILITY_TYPES[0];
  return (
    <motion.div {...inView()} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '20px 24px', borderRadius: 18, border: '1px solid #e5e7eb', background: 'white', marginBottom: 14 }}>
      <div style={{ width: 60, height: 60, borderRadius: 14, background: typeInfo.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
        {typeInfo.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.96rem' }}>{facility.name}</div>
            <div style={{ fontSize: '1.64rem', color: '#6b7280', marginTop: 4 }}>{facility.location.address}</div>
          </div>
          <Chip
            label={facility.status === 'open' ? 'Open' : 'Closed'}
            sx={{ height: 36, fontSize: '1.4rem', fontWeight: 800, background: facility.status === 'open' ? '#dcfce7' : '#fee2e2', color: facility.status === 'open' ? '#166534' : '#991b1b' }}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.64rem', color: '#374151' }}>
            <Star sx={{ fontSize: 24, color: '#f59e0b' }} />{facility.rating}
            <span style={{ color: '#9ca3af' }}>({facility.reviewsCount})</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.64rem', color: '#374151' }}>
            <Schedule sx={{ fontSize: 24, color: '#6b7280' }} />{facility.waitTimeMinutes}min wait
          </span>
          <span style={{ fontSize: '1.64rem', color: '#374151' }}>📍 {facility.distanceKm}km away</span>
          {facility.acceptsNHIS && (
            <Chip label="NHIS" sx={{ height: 32, fontSize: '1.3rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8' }} />
          )}
        </div>
      </div>
      <Button
        component={Link} to={`/healthcare/facility/${facility.id}`}
        size="medium" endIcon={<ArrowForward />}
        sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.56rem', px: 2.5, py: 1.25, flexShrink: 0, '&:hover': { filter: 'brightness(0.92)' } }}
      >
        View
      </Button>
    </motion.div>
  );
}

function HealthcareDashboardContent({ facilities, isLoading, isError }) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 20 }}>
        <CircularProgress size={56} sx={{ color: '#16a34a' }} />
        <div style={{ color: '#6b7280', fontWeight: 600, fontSize: '1.8rem' }}>Loading facilities...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 14 }}>⚠️</div>
        <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.8rem' }}>Failed to load facilities.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.6rem, 4vw, 3.4rem)', color: '#111827' }}>
            <LocalHospital sx={{ fontSize: 'inherit', color: '#16a34a', mr: 1, verticalAlign: 'middle' }} />
            Healthcare Facilities
          </h2>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '1.8rem' }}>
            {facilities?.length ?? 0} facilities found
          </p>
        </div>
        <Button
          component={Link} to="/healthcare/book"
          variant="contained"
          sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: '1.76rem', px: 3, py: 1.5, '&:hover': { filter: 'brightness(0.92)' } }}
        >
          Book an Appointment
        </Button>
      </div>

      {!facilities?.length ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>🔍</div>
          <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem', marginBottom: 10 }}>No facilities match your filters</div>
          <div style={{ color: '#9ca3af', fontSize: '1.8rem' }}>Try adjusting the filters on the left panel</div>
        </div>
      ) : (
        <div>{facilities.map((f) => <FacilityRow key={f.id} facility={f} />)}</div>
      )}
    </div>
  );
}

export default memo(HealthcareDashboardContent);
