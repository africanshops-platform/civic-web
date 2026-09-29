import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill } from './shared/flHelpers';
import { usePrograms } from '../hooks/useFloodlightsRepo';
import { PROGRAM_CATEGORIES } from '../mock';

const STATUS_VARIANT = { open: 'pos', upcoming: 'gold', ongoing: 'live', closed: 'muted' };

// Real GET /youth/programs only filters by sport/ageGroup/lga — category was
// never a server-side filter, even in the v1 page (YouthSportsSidebarLeft
// never offered it either). So this stays an honest client-side filter over
// the single fetched page (≤50 items, per the platform pagination rule),
// not a promise to search every programme ever created.
export default function ProgrammesScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const { data, isLoading } = usePrograms({ limit: 20 });
  const programs = data?.data?.programs ?? [];

  const filtered = useMemo(
    () => (activeCategory ? programs.filter((p) => p.category === activeCategory) : programs),
    [programs, activeCategory]
  );

  const setCategory = (id) => setSearchParams(id ? { category: id } : {});

  return (
    <FloodlightsPage>
      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Skill Up · Get Enrolled</span>
        <h1 style={{ fontSize: '2.8rem' }}>Programmes</h1>
        <span className="fl2-small fl2-muted">
          Government-backed youth programmes beyond sport — tech, agriculture, arts, entrepreneurship, health, vocational.
        </span>
      </div>

      <div className="fl2-row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className={`fl2-pill ${activeCategory ? 'fl2-pill-muted' : 'fl2-pill-gold'}`} style={{ padding: '9px 16px' }} onClick={() => setCategory('')}>
          All
        </button>
        {PROGRAM_CATEGORIES.map((c) => (
          <button
            key={c.id} type="button"
            className={`fl2-pill ${activeCategory === c.id ? 'fl2-pill-gold' : 'fl2-pill-muted'}`}
            style={{ padding: '9px 16px' }}
            onClick={() => setCategory(c.id)}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

      {!isLoading && (
        <div className="fl2-grid-3">
          {filtered.map((p) => {
            const cat = PROGRAM_CATEGORIES.find((c) => c.id === p.category);
            const fillPct = p.slots > 0 ? Math.min(100, Math.round((p.enrolledCount / p.slots) * 100)) : 0;
            return (
              <Link key={p.id} to={`/youth-v2/programs/${p.id}`} className="fl2-card fl2-stack fl2-clickable" style={{ textDecoration: 'none', height: '100%' }}>
                <div className="fl2-row fl2-between">
                  <span className="fl2-tiny fl2-muted">{cat?.icon ?? '📚'} {cat?.label ?? p.category}</span>
                  <Pill variant={STATUS_VARIANT[p.status] ?? 'muted'} live={p.status === 'ongoing'}>{p.status}</Pill>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.6rem', marginTop: 2 }}>{p.title}</span>
                <span className="fl2-small fl2-muted">📍 {p.location?.address || '—'}</span>
                <span className="fl2-tiny fl2-muted">👤 Ages {p.ageGroup}{p.duration ? ` · ${p.duration}` : ''}</span>
                <div className="fl2-stack" style={{ gap: 6, marginTop: 'auto' }}>
                  <div className="fl2-statbar"><i style={{ width: `${fillPct}%` }} /></div>
                  <span className="fl2-tiny fl2-muted">{p.enrolledCount ?? 0}/{p.slots} enrolled</span>
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="fl2-small fl2-muted">
              {activeCategory ? 'No programmes in this category on this page — try "All" or check back later.' : 'No programmes right now.'}
            </div>
          )}
        </div>
      )}
    </FloodlightsPage>
  );
}
