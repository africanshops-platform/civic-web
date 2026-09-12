import { Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBack, Lock } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill } from './shared/flHelpers';
import { useMyAuditionApplications, useMyStaffPositionApplications, useTeamName, STAFF_ROLES } from '../hooks/useFloodlightsRepo';
import { getAdminAccessToken } from 'app/configs/data/utils/opsUtils';

const STATUS_VARIANT = { PENDING: 'gold', APPROVED: 'pos', REJECTED: 'muted' };

// Every audition/staff-position is club-authored -- there is no "platform"
// listing type, but the club posting it was previously invisible on this
// screen. Resolves the real club name the same way team names resolve
// everywhere else in Floodlights v2 (see flHelpers.jsx's TeamName).
function ClubByline({ clubMerchantId }) {
  const clubName = useTeamName(clubMerchantId, 'a club');
  return <span className="fl2-tiny fl2-muted">Posted by {clubName}</span>;
}

function AuditionApplicationRow({ app }) {
  return (
    <Link to={`/youth-v2/opportunities/auditions/${app.auditionId}`} className="fl2-card fl2-row fl2-between fl2-clickable" style={{ textDecoration: 'none' }}>
      <div className="fl2-stack" style={{ gap: 2 }}>
        <span style={{ fontWeight: 700, fontSize: '1.4rem' }}>{app.audition?.sport ? `${app.audition.sport} Audition` : 'Audition'}</span>
        <ClubByline clubMerchantId={app.audition?.clubMerchantId} />
        <span className="fl2-tiny fl2-muted">📍 {[app.audition?.lga, app.audition?.state].filter(Boolean).join(', ') || '—'}</span>
      </div>
      <Pill variant={STATUS_VARIANT[app.status] ?? 'muted'}>{app.status}</Pill>
    </Link>
  );
}

function StaffPositionApplicationRow({ app }) {
  return (
    <Link to={`/youth-v2/opportunities/staff-positions/${app.positionId}`} className="fl2-card fl2-row fl2-between fl2-clickable" style={{ textDecoration: 'none' }}>
      <div className="fl2-stack" style={{ gap: 2 }}>
        <span style={{ fontWeight: 700, fontSize: '1.4rem' }}>{app.position?.title ?? 'Staff Position'}</span>
        <ClubByline clubMerchantId={app.position?.clubMerchantId} />
        <span className="fl2-tiny fl2-muted">
          {app.position?.role ? (STAFF_ROLES.find((r) => r.value === app.position.role)?.label ?? app.position.role) : ''}
          {app.position?.lga || app.position?.state ? ` · 📍 ${[app.position.lga, app.position.state].filter(Boolean).join(', ')}` : ''}
        </span>
      </div>
      <Pill variant={STATUS_VARIANT[app.status] ?? 'muted'}>{app.status}</Pill>
    </Link>
  );
}

export default function MyOpportunityApplicationsScreen() {
  const isLoggedIn = Boolean(getAdminAccessToken());

  const auditionsQuery = useMyAuditionApplications();
  const positionsQuery = useMyStaffPositionApplications();

  return (
    <FloodlightsPage>
      <Button component={Link} to="/youth-v2/opportunities" startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start', color: 'var(--ink-muted)', textTransform: 'none', fontWeight: 700, fontSize: '1.4rem' }}>
        Back to Opportunities
      </Button>

      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Track Your Applications</span>
        <h1 style={{ fontSize: '2.8rem' }}>My Applications</h1>
      </div>

      {!isLoggedIn ? (
        <div className="fl2-card fl2-stack" style={{ alignItems: 'center', textAlign: 'center', padding: '32px 16px', gap: 10 }}>
          <Lock sx={{ fontSize: 36, color: 'var(--ink-muted)' }} />
          <span className="fl2-small fl2-muted">Sign in to see the auditions and staff positions you've applied to.</span>
          <Button component={Link} to={`/sign-in?redirect=${encodeURIComponent('/youth-v2/opportunities/mine')}`} variant="contained" className="fl2-btn fl2-btn-gold" sx={{ textTransform: 'none' }}>
            Sign In
          </Button>
        </div>
      ) : (
        <>
          <div className="fl2-stack" style={{ gap: 12 }}>
            <span className="fl2-eyebrow">⚽ Player Auditions</span>
            {auditionsQuery.isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><CircularProgress size={28} sx={{ color: 'var(--gold)' }} /></div>}
            {!auditionsQuery.isLoading && (
              <div className="fl2-stack" style={{ gap: 10 }}>
                {(auditionsQuery.data ?? []).map((app) => (
                  <AuditionApplicationRow key={app.id} app={app} />
                ))}
                {(auditionsQuery.data ?? []).length === 0 && <div className="fl2-small fl2-muted">You haven't applied to any auditions yet.</div>}
              </div>
            )}
          </div>

          <div className="fl2-stack" style={{ gap: 12 }}>
            <span className="fl2-eyebrow">🧑‍💼 Staff Positions</span>
            {positionsQuery.isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><CircularProgress size={28} sx={{ color: 'var(--gold)' }} /></div>}
            {!positionsQuery.isLoading && (
              <div className="fl2-stack" style={{ gap: 10 }}>
                {(positionsQuery.data ?? []).map((app) => (
                  <StaffPositionApplicationRow key={app.id} app={app} />
                ))}
                {(positionsQuery.data ?? []).length === 0 && <div className="fl2-small fl2-muted">You haven't applied to any staff positions yet.</div>}
              </div>
            )}
          </div>
        </>
      )}
    </FloodlightsPage>
  );
}
