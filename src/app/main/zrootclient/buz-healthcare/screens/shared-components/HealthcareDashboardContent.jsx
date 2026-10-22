import { memo } from 'react';
import { Button, CircularProgress, Chip, Pagination } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, LocalHospital } from '@mui/icons-material';
import { AVAILABILITY, typeInfo } from '../../constants';

function FacilityRow({ facility, enrolment }) {
  const isMine = enrolment?.mineId === facility.id;
  const isPrimary = enrolment?.primaryIds?.includes(facility.id);
  const t = typeInfo(facility.type);
  const a = AVAILABILITY[facility.availability] ?? AVAILABILITY.AVAILABLE;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '20px 24px', borderRadius: 18, border: '1px solid #e5e7eb', background: 'white', marginBottom: 14, flexWrap: 'wrap' }}>
      <div style={{ width: 60, height: 60, borderRadius: 14, background: t.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>{t.icon}</div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.96rem' }}>{facility.name}</div>
            <div style={{ fontSize: '1.64rem', color: '#6b7280', marginTop: 4 }}>
              {facility.address}, {facility.lga}
            </div>
          </div>
          <Chip label={a.label} sx={{ height: 36, fontSize: '1.4rem', fontWeight: 800, background: a.bg, color: a.color }} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, fontSize: '1.64rem', color: '#374151' }}>
          <span>{t.label}</span>
          {isMine && <Chip label="Your primary facility" size="small" sx={{ fontWeight: 800, background: '#fef3c7', color: '#92400e' }} />}
          {!isMine && isPrimary && <Chip label="Primary for your area" size="small" sx={{ fontWeight: 800, background: '#dcfce7', color: '#166534' }} />}
          {facility.phone && <span>📞 {facility.phone}</span>}
          {facility._count?.practitioners > 0 && (
            <span>
              👨‍⚕️ {facility._count.practitioners} {facility._count.practitioners === 1 ? 'practitioner' : 'practitioners'}
            </span>
          )}
        </div>
      </div>
      {enrolment?.enabled && isPrimary && !isMine && (
        <Button variant="outlined" onClick={() => enrolment.onEnrol(facility)} sx={{ borderColor: '#16a34a', color: '#166534', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.56rem', px: 2.5, py: 1.25, flexShrink: 0 }}>
          Enrol here
        </Button>
      )}
      <Button
        component={Link}
        to={`/healthcare/facility/${facility.id}`}
        size="medium"
        endIcon={<ArrowForward />}
        sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.56rem', px: 2.5, py: 1.25, flexShrink: 0, '&:hover': { filter: 'brightness(0.92)' } }}
      >
        View
      </Button>
    </motion.div>
  );
}

function HealthcareDashboardContent({ facilities, total, page, totalPages, onPage, isLoading, isError, filtered, enrolment }) {
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
        <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.8rem' }}>We could not load the facilities. Please try again.</div>
      </div>
    );
  }
  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.6rem, 4vw, 3.4rem)', color: '#111827' }}>
            <LocalHospital sx={{ fontSize: 'inherit', color: '#16a34a', mr: 1, verticalAlign: 'middle' }} />
            Healthcare facilities
          </h2>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '1.8rem' }}>
            {total} {total === 1 ? 'facility' : 'facilities'} {filtered ? 'match your filter' : 'approved by your community'}
          </p>
        </div>
        <Button
          component={Link}
          to="/healthcare/book"
          variant="contained"
          sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: '1.76rem', px: 3, py: 1.5, '&:hover': { filter: 'brightness(0.92)' } }}
        >
          Book an appointment
        </Button>
      </div>

      {!facilities?.length ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>🔍</div>
          <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem', marginBottom: 10 }}>{filtered ? 'No facility of that kind yet' : 'No facilities are listed yet'}</div>
          <div style={{ color: '#9ca3af', fontSize: '1.8rem' }}>{filtered ? 'Try another kind in the filter.' : 'Facilities appear here once your community has approved them.'}</div>
        </div>
      ) : (
        <div>
          {facilities.map((f) => (
            <FacilityRow key={f.id} facility={f} enrolment={enrolment} />
          ))}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <Pagination count={totalPages} page={page} onChange={(_, p) => onPage(p)} size="large" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(HealthcareDashboardContent);
