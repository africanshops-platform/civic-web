import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle } from '@mui/icons-material';
import HealthcarePageShell from './shared-components/HealthcarePageShell';
import { useBookAppointment, useFacilities, useFacilityDetail, useSlots } from '../hooks/useHealthcareRepo';
import { formatSlot, formatWhen } from '../constants';

const SX_SELECT = { borderRadius: '12px', fontSize: '1.76rem' };
const SX_LABEL = { fontSize: '1.76rem' };
const SX_ITEM = { fontSize: '1.76rem' };
const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the visitor's own date

/** Book a visit: the facility, what you need, a day, and one of the times the practitioners actually have free. */
export default function AppointmentBookingPage() {
  const [sp, setSp] = useSearchParams();
  const facilityId = sp.get('facility') || '';
  const [department, setDepartment] = useState('');
  const [practitionerId, setPractitionerId] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [booked, setBooked] = useState(null);

  const { data: list } = useFacilities({ limit: 50 });
  const facilities = (list?.data?.data ?? []).filter((f) => f.availability === 'AVAILABLE');
  const { data: detail } = useFacilityDetail(facilityId);
  const facility = detail?.data;
  const departments = facility?.departments ?? [];
  const people = facility?.practitioners ?? [];
  const { data: slotData, isFetching: slotsLoading } = useSlots({ facilityId, date, practitionerId });
  const slots = useMemo(() => slotData?.data?.slots ?? [], [slotData]);
  const book = useBookAppointment();

  const pickFacility = (id) => {
    const next = new URLSearchParams(sp);
    if (id) next.set('facility', id);
    else next.delete('facility');
    setSp(next, { replace: true });
    setDepartment('');
    setPractitionerId('');
    setSlot(null);
  };

  const canSubmit = facilityId && department && slot && reason.trim().length > 2 && !book.isLoading;

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    book.mutate(
      {
        facilityId,
        departmentId: department,
        preferredDate: slot.start,
        slotStart: slot.start,
        assignedDoctorId: slot.practitionerId,
        reason: reason.trim(),
        patientNote: note.trim() || undefined,
      },
      { onSuccess: (res) => setBooked({ appointment: res.data, slot }) }
    );
  };

  if (booked) {
    return (
      <HealthcarePageShell title="Book an appointment" subtitle="Healthcare">
        <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <CheckCircle sx={{ fontSize: 96, color: '#16a34a', mb: 2 }} />
            <h2 style={{ margin: '0 0 12px', fontWeight: 900, color: '#111827', fontSize: '3.2rem' }}>Request sent</h2>
            <p style={{ color: '#6b7280', fontSize: '1.9rem', marginBottom: 20 }}>
              {facility?.name}, {formatWhen(booked.slot.start)}
              {booked.slot.practitioner?.name ? ` with ${booked.slot.practitioner.name}` : ''}. The facility will confirm it, and you will see the answer under My appointments.
            </p>
            <Button component={Link} to="/healthcare/my-appointments" variant="contained" sx={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none', px: 5, py: 2, fontSize: '1.9rem' }}>
              View my appointments
            </Button>
          </motion.div>
        </div>
      </HealthcarePageShell>
    );
  }

  return (
    <HealthcarePageShell title="Book an appointment" subtitle="Healthcare · Choose a facility · Pick a free time">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>Book an appointment</h1>
        <p style={{ margin: '0 0 36px', color: '#6b7280', fontSize: '1.9rem' }}>Only times the practitioners have free are shown, so what you pick is what is held for you.</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <FormControl fullWidth required>
            <InputLabel sx={SX_LABEL}>Facility</InputLabel>
            <Select value={facilityId} label="Facility" onChange={(e) => pickFacility(e.target.value)} sx={SX_SELECT}>
              {facilityId && !facilities.some((f) => f.id === facilityId) && facility && (
                <MenuItem value={facilityId} sx={SX_ITEM}>{facility.name}</MenuItem>
              )}
              {facilities.map((f) => (
                <MenuItem key={f.id} value={f.id} sx={SX_ITEM}>{f.name} · {f.lga}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required disabled={!facilityId}>
            <InputLabel sx={SX_LABEL}>What do you need?</InputLabel>
            <Select value={department} label="What do you need?" onChange={(e) => setDepartment(e.target.value)} sx={SX_SELECT}>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.name} sx={SX_ITEM}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 20 }}>
            <TextField
              label="Day" type="date" required fullWidth disabled={!facilityId} value={date}
              onChange={(e) => { setDate(e.target.value); setSlot(null); }}
              InputLabelProps={{ shrink: true, style: { fontSize: '1.76rem' } }}
              inputProps={{ min: todayStr(), style: { fontSize: '1.76rem' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <FormControl fullWidth disabled={!facilityId || people.length < 2}>
              <InputLabel sx={SX_LABEL}>Practitioner (optional)</InputLabel>
              <Select value={practitionerId} label="Practitioner (optional)" onChange={(e) => { setPractitionerId(e.target.value); setSlot(null); }} sx={SX_SELECT}>
                <MenuItem value="" sx={SX_ITEM}>Anyone free</MenuItem>
                {people.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={SX_ITEM}>{p.name || 'Practitioner'} · {p.specialty}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {facilityId && date && (
            <div>
              <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.9rem', marginBottom: 12 }}>Free times that day</div>
              {slotsLoading && <CircularProgress size={32} sx={{ color: '#16a34a' }} />}
              {!slotsLoading && slots.length === 0 && <Alert severity="info" sx={{ fontSize: '1.6rem' }}>Nothing is free that day. Try another day.</Alert>}
              {!slotsLoading && slots.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {slots.map((s) => {
                    const on = slot?.start === s.start && slot?.practitionerId === s.practitionerId;
                    return (
                      <button
                        type="button" key={`${s.practitionerId}-${s.start}`} onClick={() => setSlot(s)}
                        style={{ cursor: 'pointer', padding: '12px 18px', borderRadius: 14, border: `2px solid ${on ? '#16a34a' : '#e5e7eb'}`, background: on ? '#f0fdf4' : 'white', textAlign: 'left' }}
                      >
                        <div style={{ fontWeight: 900, fontSize: '1.9rem', color: '#111827' }}>{formatSlot(s.start)}</div>
                        <div style={{ fontSize: '1.4rem', color: '#6b7280' }}>{s.practitioner?.name || 'Practitioner'}</div>
                      </button>
                    );
                  })}
                </div>
              )}
              <p style={{ margin: '10px 0 0', fontSize: '1.4rem', color: '#9ca3af' }}>Times are in West Africa Time, the facility's own clock.</p>
            </div>
          )}

          <TextField
            label="Reason for the visit" multiline rows={3} fullWidth required value={reason} onChange={(e) => setReason(e.target.value.slice(0, 280))}
            placeholder="In a few words, what is it about?"
            InputLabelProps={{ style: { fontSize: '1.76rem' } }} inputProps={{ style: { fontSize: '1.76rem' } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <TextField
            label="Anything the facility should know (optional)" fullWidth value={note} onChange={(e) => setNote(e.target.value.slice(0, 280))}
            InputLabelProps={{ style: { fontSize: '1.76rem' } }} inputProps={{ style: { fontSize: '1.76rem' } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          <Button type="submit" variant="contained" disabled={!canSubmit} sx={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f766e 100%)', color: 'white', fontWeight: 800, borderRadius: '16px', textTransform: 'none', py: 2.25, fontSize: '2rem' }}>
            {book.isLoading ? <CircularProgress size={28} sx={{ color: 'white' }} /> : 'Request this appointment'}
          </Button>
        </form>
      </div>
    </HealthcarePageShell>
  );
}
