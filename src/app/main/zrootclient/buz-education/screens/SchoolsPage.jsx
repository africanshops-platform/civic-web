import { Link, useSearchParams } from 'react-router-dom';
import { Button, Chip, CircularProgress, FormControl, InputLabel, MenuItem, Pagination, Select } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import EducationPageShell from './EducationPageShell';
import { useSchools } from '../hooks/useEducationRepo';
import { ACCENT, LEVELS, levelInfo } from '../constants';

const LIMIT = 20;

/** The schools your community has approved. Anyone can look; applying needs an account. */
export default function SchoolsPage() {
  const [sp, setSp] = useSearchParams();
  const level = sp.get('level') || '';
  const page = Math.max(Number(sp.get('page')) || 1, 1);
  const set = (patch) => {
    const n = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    setSp(n, { replace: true });
  };
  const { data, isLoading, isError } = useSchools({ level: level || undefined, page, limit: LIMIT });
  const body = data?.data;
  const rows = body?.data ?? [];

  return (
    <EducationPageShell title="Schools" subtitle="Education · Approved by your community">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.8rem,4.5vw,4rem)', color: '#111827' }}>Find a school</h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '1.8rem' }}>{body?.total ?? 0} {body?.total === 1 ? 'school' : 'schools'} {level ? 'of that kind' : 'listed'}</p>
          </div>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel sx={{ fontSize: '1.6rem' }}>Kind of school</InputLabel>
            <Select value={level} label="Kind of school" onChange={(e) => set({ level: e.target.value, page: '' })} sx={{ borderRadius: '12px', fontSize: '1.6rem' }}>
              <MenuItem value="" sx={{ fontSize: '1.6rem' }}>All kinds</MenuItem>
              {LEVELS.map((l) => (
                <MenuItem key={l.id} value={l.id} sx={{ fontSize: '1.6rem' }}>{l.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress size={56} sx={{ color: '#4f46e5' }} /></div>}
        {isError && <div style={{ padding: 32, textAlign: 'center', borderRadius: 18, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 700, fontSize: '1.8rem' }}>We could not load the schools. Please try again.</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '70px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏫</div>
            <div style={{ fontWeight: 800, color: '#374151', fontSize: '2.2rem' }}>No schools listed yet</div>
            <div style={{ color: '#9ca3af', fontSize: '1.8rem', marginTop: 8 }}>Schools appear here once your community has approved them.</div>
          </div>
        )}

        {rows.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderRadius: 18, border: '1px solid #e5e7eb', background: 'white', marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{levelInfo(s.level).icon}</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.96rem' }}>{s.name}</div>
              <div style={{ fontSize: '1.64rem', color: '#6b7280', marginTop: 4 }}>{s.address}, {s.lga}</div>
              <div style={{ marginTop: 8 }}>
                <Chip label={levelInfo(s.level).label} size="small" sx={{ background: '#eef2ff', color: '#4338ca', fontWeight: 700, fontSize: '1.3rem' }} />
              </div>
            </div>
            <Button component={Link} to={`/education/school/${s.id}`} endIcon={<ArrowForward />} sx={{ background: ACCENT, color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: '1.56rem', px: 2.5, py: 1.25 }}>
              View
            </Button>
          </div>
        ))}

        {(body?.totalPages ?? 1) > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <Pagination count={body.totalPages} page={page} onChange={(_, p) => set({ page: p > 1 ? String(p) : '' })} size="large" />
          </div>
        )}
      </div>
    </EducationPageShell>
  );
}
