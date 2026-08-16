import { useParams, Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBack, CalendarToday } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill } from './shared/flHelpers';
import { useProgramDetail } from '../hooks/useFloodlightsRepo';
import { PROGRAM_CATEGORIES } from '../mock';

const STATUS_VARIANT = { open: 'pos', upcoming: 'gold', ongoing: 'live', closed: 'muted' };

export default function ProgramDetailScreen() {
  const { programId } = useParams();
  const { data, isLoading, isError } = useProgramDetail(programId);
  const program = data?.data?.program;

  return (
    <FloodlightsPage>
      <Button component={Link} to="/youth-v2/programs" startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start', color: 'var(--ink-muted)', textTransform: 'none', fontWeight: 700, fontSize: '1.4rem' }}>
        Back to Programmes
      </Button>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}
      {(isError || (!isLoading && !program)) && <div className="fl2-small" style={{ color: 'var(--card-red)' }}>Programme not found.</div>}

      {program && (() => {
        const cat = PROGRAM_CATEGORIES.find((c) => c.id === program.category);
        const fillPct = program.slots > 0 ? Math.min(100, Math.round((program.enrolledCount / program.slots) * 100)) : 0;
        const spotsLeft = Math.max(0, (program.slots ?? 0) - (program.enrolledCount ?? 0));

        return (
          <>
            <div className="fl2-card">
              <div className="fl2-row" style={{ gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: 68, height: 68, borderRadius: 16, background: 'var(--gold-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0 }}>
                  {cat?.icon ?? '📚'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fl2-row fl2-between" style={{ marginBottom: 8 }}>
                    <h1 style={{ fontSize: '2.6rem' }}>{program.title}</h1>
                    <Pill variant={STATUS_VARIANT[program.status] ?? 'muted'} live={program.status === 'ongoing'}>{program.status}</Pill>
                  </div>
                  <p className="fl2-small fl2-muted" style={{ margin: '0 0 12px' }}>📍 {program.location?.address || '—'}</p>
                  <div className="fl2-row" style={{ gap: 20, flexWrap: 'wrap' }}>
                    {program.duration && <span className="fl2-small fl2-muted">📅 {program.duration}</span>}
                    <span className="fl2-small fl2-muted">👤 Ages {program.ageGroup}</span>
                    {program.rating && <span className="fl2-small fl2-muted">⭐ {program.rating}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="fl2-grid-2">
              <div className="fl2-card fl2-stack">
                <span className="fl2-eyebrow">About this programme</span>
                <span className="fl2-small fl2-muted" style={{ lineHeight: 1.7 }}>{program.description}</span>
              </div>

              <div className="fl2-card fl2-stack">
                <span className="fl2-eyebrow">Enrolment</span>
                <div className="fl2-row fl2-between">
                  <span className="fl2-small fl2-muted">Spots filled</span>
                  <span className="fl2-small" style={{ fontWeight: 700, color: fillPct >= 90 ? 'var(--card-red)' : 'var(--ink)' }}>
                    {program.enrolledCount ?? 0}/{program.slots} ({spotsLeft} left)
                  </span>
                </div>
                <div className="fl2-statbar"><i style={{ width: `${fillPct}%` }} /></div>

                {(program.startDate || program.endDate) && (
                  <div style={{ padding: 14, borderRadius: 12, background: 'var(--ground)', border: '1px solid var(--line)' }}>
                    <div className="fl2-row" style={{ gap: 8, marginBottom: 6 }}>
                      <CalendarToday sx={{ fontSize: 18, color: 'var(--gold)' }} />
                      <span className="fl2-small" style={{ fontWeight: 700 }}>Programme dates</span>
                    </div>
                    {program.startDate && <div className="fl2-tiny fl2-muted">Start: <strong style={{ color: 'var(--ink)' }}>{new Date(program.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>}
                    {program.endDate && <div className="fl2-tiny fl2-muted" style={{ marginTop: 4 }}>End: <strong style={{ color: 'var(--ink)' }}>{new Date(program.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>}
                  </div>
                )}

                {/* Enrollment is real-data-aware but not yet wired to the real
                    enroll endpoint — a fake success here would misrepresent a
                    genuine enrollment, so this stays honestly disabled, same
                    as the v1 page it replaces. */}
                <button type="button" disabled className="fl2-btn fl2-btn-gold fl2-btn-block">Enrollment Opening Soon</button>
              </div>
            </div>
          </>
        );
      })()}
    </FloodlightsPage>
  );
}
