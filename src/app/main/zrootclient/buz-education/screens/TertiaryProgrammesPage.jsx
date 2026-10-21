import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, MenuItem, TextField } from '@mui/material';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import EducationPageShell from './EducationPageShell';
import { useApplyTertiary, useTertiaryProgrammes } from '../hooks/useEducationRepo';
import { applyReady, flattenProgrammes } from '../tertiary';

/** What a university or college offers, and a short form to apply to one programme. Browsing is open; applying needs sign-in (civic-65). */
export default function TertiaryProgrammesPage() {
  const { schoolId } = useParams();
  const { isAuthenticated } = useCivicWebAuth();
  const { data, isLoading, isError } = useTertiaryProgrammes(schoolId);
  const apply = useApplyTertiary();
  const tree = data?.data;
  const programmes = useMemo(() => flattenProgrammes(tree), [tree]);
  const [form, setForm] = useState({ name: '', programmeId: '', start: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <EducationPageShell title="Programmes" subtitle="Education · Apply to a university or college">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress /></div>}
        {isError && <Alert severity="error">This university or college could not be found.</Alert>}
        {tree && (
          <>
            <h1 style={{ margin: '0 0 8px', fontWeight: 900 }}>{tree.school.name}</h1>
            <p style={{ color: '#6b7280' }}>{tree.school.lga}, {tree.school.state}</p>
            {tree.faculties.length === 0 && <p data-testid="no-programmes">This school has not listed its programmes yet.</p>}
            {tree.faculties.map((f) => (
              <div key={f.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 18, padding: 20, marginBottom: 14 }}>
                <h3 style={{ margin: '0 0 8px', fontWeight: 800 }}>{f.name}</h3>
                {f.departments.map((d) => (
                  <div key={d.id} style={{ marginBottom: 8 }}>
                    <b>{d.name}</b>
                    <ul style={{ margin: '4px 0 0 18px' }}>
                      {d.programmes.map((p) => (
                        <li key={p.id}>{p.name} ({p.award}, {p.durationYears} year{p.durationYears === 1 ? '' : 's'})</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}

            {programmes.length > 0 && (
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>Apply</h3>
                {!isAuthenticated && <Alert severity="info" action={<Button component={Link} to="/sign-in" size="small">Sign in</Button>}>Sign in to apply.</Alert>}
                <TextField label="Your full name, as on your documents" value={form.name} onChange={set('name')} />
                <TextField select label="Programme" value={form.programmeId} onChange={set('programmeId')}>
                  {programmes.map((p) => <MenuItem key={p.id} value={p.id}>{p.name} ({p.award}) · {p.department}</MenuItem>)}
                </TextField>
                <TextField type="date" label="When do you want to start?" value={form.start} onChange={set('start')} InputLabelProps={{ shrink: true }} />
                {apply.isSuccess && <Alert severity="success">Application sent. <Link to="/education/tertiary-applications">Upload your documents</Link></Alert>}
                <Button
                  variant="contained"
                  disabled={!isAuthenticated || !applyReady(form) || apply.isLoading}
                  onClick={() => apply.mutate({ schoolId, programmeId: form.programmeId, intendedStartDate: form.start, applicantName: form.name.trim() })}
                >
                  Send application
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </EducationPageShell>
  );
}
