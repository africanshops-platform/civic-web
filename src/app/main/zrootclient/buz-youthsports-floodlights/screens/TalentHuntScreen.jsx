import { CircularProgress } from '@mui/material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Avatar, Pill } from './shared/flHelpers';
import { useTalents } from '../hooks/useFloodlightsRepo';

export default function TalentHuntScreen() {
  const { data, isLoading } = useTalents({ limit: 40 });
  const talents = data?.data?.talents ?? [];
  const sports = [...new Set(talents.map((t) => t.discipline).filter(Boolean))];

  return (
    <FloodlightsPage title="Talent Hunt" subtitle="Youth & Sports · Discover · Scout · Connect">
      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Discover · Scout · Connect</span>
        <h1 style={{ fontSize: '2.8rem' }}>🌟 Talent Hunt</h1>
        <span className="fl2-small fl2-muted">
          Discover Nigeria's brightest young athletes — coordinator-verified spotlights from across every LGA.
        </span>
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

      {!isLoading && (
        <div className="fl2-grid-4">
          {talents.map((t) => (
            <div key={t.id} className="fl2-card fl2-stack">
              <div className="fl2-row fl2-between">
                <Avatar name={t.name} size={44} />
                {t.verified && <Pill variant="gold" style={{ padding: '2px 7px', fontSize: '1.1rem' }}>✓ Verified</Pill>}
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', marginTop: 2 }}>{t.name}</span>
              <span className="fl2-tiny fl2-muted">{t.discipline}</span>
              <span className="fl2-tiny fl2-muted">{[t.jurisdiction?.lga, t.jurisdiction?.state].filter(Boolean).join(', ')}</span>
            </div>
          ))}
          {talents.length === 0 && <div className="fl2-small fl2-muted">No talent spotlights published yet.</div>}
        </div>
      )}

      {sports.length > 0 && (
        <div className="fl2-card fl2-stack">
          <span className="fl2-eyebrow">Disciplines represented</span>
          <div className="fl2-row" style={{ gap: 10, flexWrap: 'wrap' }}>
            {sports.map((s) => <Pill key={s} variant="muted">{s}</Pill>)}
          </div>
        </div>
      )}
    </FloodlightsPage>
  );
}
