import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import EducationPageShell from './EducationPageShell';
import { useApply, useApplyForWard, useChildrenToApplyFor, useSchool, useWardApplications } from '../hooks/useEducationRepo';
import { ACCENT, levelInfo } from '../constants';

const card = { background: 'white', borderRadius: 22, padding: 28, border: '1px solid #e5e7eb', marginBottom: 20 };

export default function SchoolDetailPage() {
  const { schoolId } = useParams();
  const { isAuthenticated } = useCivicWebAuth();
  const { data, isLoading, isError } = useSchool(schoolId);
  const school = data?.data;
  const apply = useApply();
  const applyForWard = useApplyForWard();
  const { data: ward } = useWardApplications();
  const { data: children = [] } = useChildrenToApplyFor();
  const wardOn = Boolean(ward) && children.length > 0;
  const [forChild, setForChild] = useState('');
  const [open, setOpen] = useState(false);
  const [programId, setProgramId] = useState('');
  const [start, setStart] = useState('');
  const programmes = [...new Set((school?.classes ?? []).map((c) => c.level).filter(Boolean))];

  let body;
  if (isLoading) {
    body = <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><CircularProgress size={56} sx={{ color: '#4f46e5' }} /></div>;
  } else if (isError || !school) {
    body = (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.8rem' }}>We could not find that school. It may not be listed any more.</div>
        <Button component={Link} to="/education/schools" startIcon={<ArrowBack />} sx={{ mt: 2, fontSize: '1.7rem' }}>Back to schools</Button>
      </div>
    );
  } else {
    body = (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Button component={Link} to="/education/schools" startIcon={<ArrowBack sx={{ fontSize: 28 }} />} sx={{ mb: 2, color: '#6b7280', textTransform: 'none', fontWeight: 600, fontSize: '1.7rem', px: 0 }}>Back to schools</Button>
        <div style={{ ...card, background: 'linear-gradient(135deg,#eef2ff 0%,#e0e7ff 100%)', border: '1px solid #c7d2fe' }}>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>{school.name}</h1>
          <p style={{ margin: '8px 0 0', color: '#4b5563', fontSize: '1.9rem' }}>{school.address}, {school.lga}, {school.state}</p>
          <p style={{ margin: '6px 0 0', color: '#374151', fontSize: '1.7rem' }}>
            {levelInfo(school.level).label}
            {school.registrationNo ? ` · Registration ${school.registrationNo}` : ''}
          </p>
          {school.phone && <p style={{ margin: '6px 0 0', fontSize: '1.7rem' }}>📞 <a href={`tel:${school.phone}`} style={{ color: '#4338ca', fontWeight: 700 }}>{school.phone}</a></p>}
          {school.latitude != null && school.longitude != null && (
            <a href={`https://www.openstreetmap.org/?mlat=${school.latitude}&mlon=${school.longitude}#map=17/${school.latitude}/${school.longitude}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, color: '#4338ca', fontWeight: 700, fontSize: '1.7rem' }}>Show on the map</a>
          )}
        </div>

        {school.level === 'TERTIARY' && (
          <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: '#111827', fontSize: '1.9rem' }}>Faculties and programmes</span>
            <Button component={Link} to={`/education/school/${school.id}/programmes`} sx={{ background: ACCENT, color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.7rem', px: 3 }}>See programmes and apply</Button>
          </div>
        )}

        {school.level !== 'TERTIARY' && (
        <div style={card}>
          <h3 style={{ margin: '0 0 14px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Classes</h3>
          {(school.classes ?? []).length === 0 ? (
            <span style={{ color: '#9ca3af', fontSize: '1.7rem' }}>This school has not listed its classes yet.</span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {school.classes.map((c) => <Chip key={c.id} label={c.name} sx={{ fontSize: '1.4rem', background: '#eef2ff', color: '#4338ca', fontWeight: 600 }} />)}
            </div>
          )}
          {(school.staff ?? []).length > 0 && (
            <>
              <h3 style={{ margin: '24px 0 14px', fontWeight: 800, color: '#111827', fontSize: '2rem' }}>Teachers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {school.staff.map((t) => (
                  <div key={t.id} style={{ fontSize: '1.7rem', color: '#374151' }}>
                    <strong>{t.name}</strong>
                    {t.subjects?.length ? <span style={{ color: '#6b7280' }}> · {t.subjects.join(', ')}</span> : null}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        )}

        {school.level !== 'TERTIARY' && (
        <div style={{ padding: 32, borderRadius: 22, background: ACCENT, textAlign: 'center' }}>
          <h3 style={{ color: 'white', fontWeight: 900, margin: '0 0 12px', fontSize: '2.4rem' }}>Want a place here?</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 22px', fontSize: '1.8rem' }}>Send an application. The school decides, and you will see its answer under My applications.</p>
          {isAuthenticated ? (
            <Button variant="contained" onClick={() => setOpen(true)} sx={{ backgroundColor: 'white', color: '#4338ca', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: 6, py: 2, fontSize: '1.9rem', '&:hover': { backgroundColor: '#eef2ff' } }}>Apply</Button>
          ) : (
            <Button component={Link} to="/sign-in" variant="contained" sx={{ backgroundColor: 'white', color: '#4338ca', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: 6, py: 2, fontSize: '1.9rem' }}>Sign in to apply</Button>
          )}
        </div>
        )}

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 800 }}>Apply to {school.name}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
            {programmes.length > 0 ? (
              <Select displayEmpty value={programId} onChange={(e) => setProgramId(e.target.value)} sx={{ borderRadius: '12px' }}>
                <MenuItem value="" disabled>Which class or level?</MenuItem>
                {programmes.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            ) : (
              <TextField label="Class or level you are applying for" value={programId} onChange={(e) => setProgramId(e.target.value.slice(0, 40))} />
            )}
            <TextField type="date" label="When would you like to start?" value={start} onChange={(e) => setStart(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toLocaleDateString('en-CA') }} />
            {wardOn && (
              <Select displayEmpty value={forChild} onChange={(e) => setForChild(e.target.value)} sx={{ borderRadius: '12px' }}>
                <MenuItem value="">For myself</MenuItem>
                {children.map((c) => <MenuItem key={c.id} value={c.id}>For my child: {c.fullName} ({c.age})</MenuItem>)}
              </Select>
            )}
            <Alert severity="info" sx={{ fontSize: '1.4rem' }}>{forChild ? 'The school sees your child\'s name and date of birth from your household, and decides. If it asks for a short test you can take it from Applications for my child.' : 'Applications are made in the student\'s own account.'}</Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)}>Back</Button>
            <Button variant="contained" disabled={!programId || !start || apply.isLoading} onClick={() => {
              const body = { schoolId: school.id, programId, intendedStartDate: new Date(`${start}T09:00:00`).toISOString() };
              if (forChild) applyForWard.mutate({ ...body, dependantId: forChild }, { onSuccess: () => setOpen(false) });
              else apply.mutate(body, { onSuccess: () => setOpen(false) });
            }}>
              Send application
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  return <EducationPageShell title="School" subtitle="Education · Schools">{body}</EducationPageShell>;
}
