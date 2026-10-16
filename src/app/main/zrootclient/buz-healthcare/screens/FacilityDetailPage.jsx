import { useParams, Link } from 'react-router-dom';
import { Button, Chip, CircularProgress, Divider } from '@mui/material';
import { ArrowBack, Phone, Email, LocalHospital } from '@mui/icons-material';
import { motion } from 'framer-motion';
import HealthcarePageShell from './shared-components/HealthcarePageShell';
import { useState } from 'react';
import { useEnrolmentOptions, useFacilityDetail, useMyEnrolment } from '../hooks/useHealthcareRepo';
import EnrolDialog from '../components/EnrolDialog';
import { AVAILABILITY, typeInfo } from '../constants';

const card = { background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb' };

export default function FacilityDetailPage() {
  const { facilityId } = useParams();
  const { data, isLoading, isError } = useFacilityDetail(facilityId);
  const facility = data?.data;
  const { data: mine } = useMyEnrolment();
  const { data: options } = useEnrolmentOptions(mine?.enabled);
  const isPrimaryForMe = (options?.items ?? []).some((i) => i.facility.id === facility?.id);
  const isMine = mine?.enrolment?.facility?.id === facility?.id;
  const [enrolling, setEnrolling] = useState(false);

  let body;
  if (isLoading) {
    body = (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <CircularProgress size={56} sx={{ color: '#16a34a' }} />
      </div>
    );
  } else if (isError || !facility) {
    body = (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: '3rem', marginBottom: 14 }}>⚠️</div>
        <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.8rem' }}>We could not find that facility. It may not be listed any more.</div>
        <Button component={Link} to="/healthcare/dashboard" sx={{ mt: 2, fontSize: '1.76rem' }} startIcon={<ArrowBack />}>Back to facilities</Button>
      </div>
    );
  } else {
    const t = typeInfo(facility.type);
    const a = AVAILABILITY[facility.availability] ?? AVAILABILITY.AVAILABLE;
    const people = facility.practitioners ?? [];
    const departments = facility.departments ?? [];
    body = (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Button component={Link} to="/healthcare/dashboard" startIcon={<ArrowBack sx={{ fontSize: 28 }} />} sx={{ mb: 3, color: '#6b7280', textTransform: 'none', fontWeight: 600, fontSize: '1.76rem', px: 0 }}>
          Back to facilities
        </Button>

        <div style={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', borderRadius: 24, padding: 'clamp(28px,4vw,40px)', border: '1px solid #bbf7d0', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 76, height: 76, borderRadius: 18, background: t.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', flexShrink: 0 }}>{t.icon}</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>{facility.name}</h1>
                <Chip label={a.label} sx={{ height: 40, fontSize: '1.6rem', background: a.bg, color: a.color, fontWeight: 800 }} />
              </div>
              <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '1.9rem' }}>
                {facility.address}, {facility.lga}, {facility.state}
              </p>
              <p style={{ margin: '6px 0 0', color: '#374151', fontSize: '1.7rem' }}>
                {t.label}
                {facility.licenceNo ? ` · Licence ${facility.licenceNo}` : ''}
              </p>
              {facility.gpsLat != null && facility.gpsLng != null && (
                <a href={`https://www.openstreetmap.org/?mlat=${facility.gpsLat}&mlon=${facility.gpsLng}#map=17/${facility.gpsLat}/${facility.gpsLng}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, color: '#0f766e', fontWeight: 700, fontSize: '1.7rem' }}>
                  Show on the map
                </a>
              )}
              {mine?.enabled && isMine && <Chip label="Your primary facility" sx={{ mt: 1.5, fontWeight: 800, background: '#fef3c7', color: '#92400e' }} />}
              {mine?.enabled && !isMine && isPrimaryForMe && (
                <Button variant="contained" onClick={() => setEnrolling(true)} sx={{ mt: 1.5, display: 'block', background: '#16a34a', fontWeight: 800, textTransform: 'none', fontSize: '1.7rem', borderRadius: '12px' }}>
                  Enrol here
                </Button>
              )}
              {enrolling && <EnrolDialog facility={facility} replacing={Boolean(mine?.enrolment)} onClose={() => setEnrolling(false)} />}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 20 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 18px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {facility.phone ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Phone sx={{ fontSize: 28, color: '#16a34a' }} />
                  <a href={`tel:${facility.phone}`} style={{ color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '1.8rem' }}>{facility.phone}</a>
                </div>
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '1.7rem' }}>No phone number listed.</span>
              )}
              {facility.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Email sx={{ fontSize: 28, color: '#16a34a' }} />
                  <a href={`mailto:${facility.email}`} style={{ color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '1.8rem' }}>{facility.email}</a>
                </div>
              )}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 18px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Services you can book</h3>
            {departments.length === 0 ? (
              <span style={{ color: '#9ca3af', fontSize: '1.7rem' }}>This facility has not listed its services yet.</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {departments.map((d) => (
                  <Chip key={d.id} label={d.name} sx={{ height: 36, fontSize: '1.4rem', background: '#f0fdf4', color: '#166534', fontWeight: 600, border: '1px solid #bbf7d0' }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {people.length > 0 && (
          <div style={{ ...card, marginTop: 20 }}>
            <h3 style={{ margin: '0 0 18px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>
              <LocalHospital sx={{ fontSize: 28, color: '#16a34a', mr: 1, verticalAlign: 'middle' }} />
              Practitioners ({people.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap: 18 }}>
              {people.map((p) => (
                <div key={p.id} style={{ padding: 20, borderRadius: 16, background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.4rem', flexShrink: 0 }}>
                    {(p.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.76rem', color: '#111827' }}>{p.name || 'Practitioner'}</div>
                    <div style={{ fontSize: '1.52rem', color: '#6b7280' }}>{p.specialty}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Divider sx={{ my: 3 }} />
        <div style={{ padding: 32, borderRadius: 22, background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', textAlign: 'center' }}>
          <h3 style={{ color: 'white', fontWeight: 900, margin: '0 0 12px', fontSize: '2.4rem' }}>Ready to book?</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 24px', fontSize: '1.8rem' }}>Pick a day and choose from the times the practitioners have free.</p>
          <Button
            component={Link}
            to={`/healthcare/book?facility=${facility.id}`}
            variant="contained"
            disabled={!a.open}
            sx={{ backgroundColor: 'white', color: '#16a34a', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: 6, py: 2, fontSize: '2rem', '&:hover': { backgroundColor: '#f0fdf4' } }}
          >
            {a.open ? 'Book an appointment' : a.label}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <HealthcarePageShell title="Facility" subtitle="Healthcare · Facilities" mapFacilities={facility ? [facility] : []}>
      {body}
    </HealthcarePageShell>
  );
}
