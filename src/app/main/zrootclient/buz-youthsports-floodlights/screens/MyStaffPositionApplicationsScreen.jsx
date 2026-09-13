import { Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { Lock } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill, TeamName } from './shared/flHelpers';
import { useMyStaffPositionApplications, STAFF_ROLES } from '../hooks/useFloodlightsRepo';
import { getAdminAccessToken } from 'app/configs/data/utils/opsUtils';

const STATUS_VARIANT = { PENDING: 'gold', APPROVED: 'pos', REJECTED: 'muted' };
const STATUS_LABEL = { PENDING: 'Under Review', APPROVED: 'Recruited', REJECTED: 'Not Selected' };

// Mirrors MyAuditionApplicationsScreen.jsx's layout. Unlike that screen
// (route-level KYC-walled), this route is public per feedback_civic_public_
// browse_gated_interact — an anonymous visitor gets an in-page sign-in
// prompt here instead of never reaching the page at all.
export default function MyStaffPositionApplicationsScreen() {
  const isLoggedIn = Boolean(getAdminAccessToken());
  const { data: applications = [], isLoading } = useMyStaffPositionApplications();

  return (
    <FloodlightsPage>
      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Your Journey</span>
        <h1 style={{ fontSize: '2.8rem' }}>My Applications</h1>
        <span className="fl2-small fl2-muted">Track every club staff position you've applied to</span>
      </div>

      {!isLoggedIn ? (
        <div className="fl2-card fl2-stack" style={{ alignItems: 'center', textAlign: 'center', padding: '32px 16px', gap: 10 }}>
          <Lock sx={{ fontSize: 36, color: 'var(--ink-muted)' }} />
          <span className="fl2-small fl2-muted">Sign in to see the staff positions you've applied to.</span>
          <Button component={Link} to={`/sign-in?redirect=${encodeURIComponent('/youth-v2/staff-positions/mine')}`} variant="contained" className="fl2-btn fl2-btn-gold" sx={{ textTransform: 'none' }}>
            Sign In
          </Button>
        </div>
      ) : (
        <>
          {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}

          {!isLoading && (
            <div className="fl2-stack" style={{ gap: 14 }}>
              {applications.map((app) => (
                <Link
                  key={app.id}
                  to={`/youth-v2/staff-positions/${app.positionId}`}
                  className="fl2-card fl2-clickable"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div className="fl2-row fl2-between">
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>{app.position?.title ?? 'Staff Position'}</span>
                      <div className="fl2-small fl2-muted" style={{ marginTop: 4 }}>
                        🧑‍💼 {STAFF_ROLES.find((r) => r.value === app.position?.role)?.label ?? app.position?.role} · Posted by <TeamName team={{ managerId: app.position?.clubMerchantId, teamName: `Club ${app.position?.clubMerchantId?.slice(-6)}` }} />
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
                  <span style={{ fontSize: '2.4rem' }}>🧑‍💼</span>
                  <span style={{ fontWeight: 800, fontSize: '1.6rem' }}>No applications yet</span>
                  <span className="fl2-small fl2-muted">Browse open staff positions and put your name forward.</span>
                  <Link to="/youth-v2/staff-positions" className="fl2-btn fl2-btn-gold" style={{ marginTop: 8 }}>Browse Staff Positions</Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </FloodlightsPage>
  );
}
