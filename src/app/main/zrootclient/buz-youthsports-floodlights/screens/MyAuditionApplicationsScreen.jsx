import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill, TeamName } from './shared/flHelpers';
import { useMyAuditionApplications } from '../hooks/useFloodlightsRepo';

const STATUS_VARIANT = { PENDING: 'gold', APPROVED: 'pos', REJECTED: 'muted' };
const STATUS_LABEL = { PENDING: 'Under Review', APPROVED: 'Recruited', REJECTED: 'Not Selected' };

export default function MyAuditionApplicationsScreen() {
  const { data, isLoading } = useMyAuditionApplications();
  const applications = data?.data?.applications ?? [];

  return (
    <FloodlightsPage>
      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Your Journey</span>
        <h1 style={{ fontSize: '2.8rem' }}>My Applications</h1>
        <span className="fl2-small fl2-muted">Track every club audition you've applied to</span>
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

      {!isLoading && (
        <div className="fl2-stack" style={{ gap: 14 }}>
          {applications.map((app) => (
            <Link
              key={app.id}
              to={`/youth-v2/auditions/${app.auditionId}`}
              className="fl2-card fl2-clickable"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div className="fl2-row fl2-between">
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>
                    <TeamName team={{ managerId: app.audition?.clubMerchantId, teamName: `Club ${app.audition?.clubMerchantId?.slice(-6)}` }} />
                  </span>
                  <div className="fl2-small fl2-muted" style={{ marginTop: 4 }}>
                    🏅 {app.audition?.sport} · 📍 {[app.audition?.country, app.audition?.state, app.audition?.lga].filter(Boolean).join(' / ')}
                  </div>
                </div>
                <Pill variant={STATUS_VARIANT[app.status] ?? 'muted'}>{STATUS_LABEL[app.status] ?? app.status}</Pill>
              </div>
              {app.pitchNote && <p className="fl2-tiny fl2-muted" style={{ marginTop: 10, fontStyle: 'italic' }}>&ldquo;{app.pitchNote}&rdquo;</p>}
              {app.status === 'REJECTED' && app.rejectionReason && (
                <p className="fl2-tiny" style={{ marginTop: 8, color: 'var(--card-red)' }}>{app.rejectionReason}</p>
              )}
            </Link>
          ))}
          {applications.length === 0 && (
            <div className="fl2-card fl2-stack" style={{ alignItems: 'center', textAlign: 'center', padding: 40 }}>
              <span style={{ fontSize: '2.4rem' }}>🧢</span>
              <span style={{ fontWeight: 800, fontSize: '1.6rem' }}>No applications yet</span>
              <span className="fl2-small fl2-muted">Browse open auditions and put your name forward.</span>
              <Link to="/youth-v2/auditions" className="fl2-btn fl2-btn-gold" style={{ marginTop: 8 }}>Browse Auditions</Link>
            </div>
          )}
        </div>
      )}
    </FloodlightsPage>
  );
}
