import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBack, VerifiedUser, Lock } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill, TeamName } from './shared/flHelpers';
import { useStaffPositionDetail, useApplyToStaffPosition, STAFF_ROLES } from '../hooks/useFloodlightsRepo';
import { useGetKycStatus } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import { getAdminAccessToken } from 'app/configs/data/utils/opsUtils';

// Staff-position detail + apply — Feature A (2026-09-12), mirrors
// AuditionDetailScreen.jsx's layout/structure. One real difference: this
// gates the apply action behind auth+KYC (see feedback_civic_public_
// browse_gated_interact memory) rather than accepting the application
// straight from an anonymous visitor.
export default function StaffPositionDetailScreen() {
  const { id } = useParams();
  const { data: item, isLoading, isError } = useStaffPositionDetail(id);

  const [applicantName, setApplicantName] = useState('');
  const [pitchNote, setPitchNote] = useState('');
  const [nameError, setNameError] = useState('');

  const applyToPosition = useApplyToStaffPosition();

  const isLoggedIn = Boolean(getAdminAccessToken());
  // Only fetch KYC status once logged in — an anonymous visitor gets the
  // "sign in first" prompt below without an extra, guaranteed-401 network call.
  const { data: kyc, isLoading: kycLoading } = useGetKycStatus({ enabled: isLoggedIn });
  const isKycVerified = kyc?.kycStatus === 'FULLY_VERIFIED';

  const handleApply = () => {
    if (!applicantName.trim()) { setNameError('Enter the name you want the club to see'); return; }
    setNameError('');
    applyToPosition.mutate({ positionId: id, applicantName: applicantName.trim(), pitchNote: pitchNote.trim() || undefined });
  };

  return (
    <FloodlightsPage>
      <Button component={Link} to="/youth-v2/staff-positions" startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start', color: 'var(--ink-muted)', textTransform: 'none', fontWeight: 700, fontSize: '1.4rem' }}>
        Back to Staff Positions
      </Button>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}
      {(isError || (!isLoading && !item)) && <div className="fl2-small" style={{ color: 'var(--card-red)' }}>This position is no longer available.</div>}

      {item && (
        <>
          <div className="fl2-card">
            <div className="fl2-row" style={{ gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 68, height: 68, borderRadius: 16, background: 'var(--gold-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0 }}>
                🧑‍💼
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fl2-row fl2-between" style={{ marginBottom: 8 }}>
                  <h1 style={{ fontSize: '2.6rem' }}>{item.title}</h1>
                  <Pill variant="pos">Open</Pill>
                </div>
                <p className="fl2-small fl2-muted" style={{ margin: '0 0 4px' }}>
                  Posted by <TeamName team={{ managerId: item.clubMerchantId, teamName: `Club ${item.clubMerchantId?.slice(-6)}` }} />
                </p>
                <p className="fl2-small fl2-muted" style={{ margin: '0 0 12px' }}>
                  📍 {[item.lga, item.state, item.country].filter(Boolean).join(', ') || '—'}
                </p>
                <div className="fl2-row" style={{ gap: 20, flexWrap: 'wrap' }}>
                  <span className="fl2-small fl2-muted">🧑‍💼 {STAFF_ROLES.find((r) => r.value === item.role)?.label ?? item.role}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="fl2-grid-2">
            <div className="fl2-card fl2-stack">
              <span className="fl2-eyebrow">About this role</span>
              <span className="fl2-small fl2-muted" style={{ lineHeight: 1.7 }}>
                {item.description || 'No further details provided by the club.'}
              </span>
            </div>

            <div className="fl2-card fl2-stack" style={{ gap: 18 }}>
              <span className="fl2-eyebrow">Apply</span>

              {applyToPosition.isSuccess ? (
                <div className="fl2-stack" style={{ alignItems: 'center', textAlign: 'center', padding: '16px 0' }}>
                  <VerifiedUser sx={{ fontSize: 40, color: 'var(--gold)' }} />
                  <span className="fl2-small" style={{ fontWeight: 700 }}>Application submitted</span>
                  <span className="fl2-tiny fl2-muted">The club's coordinator will review it and get in touch.</span>
                  <Button component={Link} to="/youth-v2/staff-positions/mine" variant="text" sx={{ mt: 1, color: 'var(--gold)', textTransform: 'none', fontWeight: 700 }}>
                    View my applications →
                  </Button>
                </div>
              ) : !isLoggedIn ? (
                // Public browse, gated interact — see feedback_civic_public_
                // browse_gated_interact memory: never hard-block the detail
                // page, only the actual apply action.
                <div className="fl2-stack" style={{ alignItems: 'center', textAlign: 'center', padding: '12px 0', gap: 10 }}>
                  <Lock sx={{ fontSize: 32, color: 'var(--ink-muted)' }} />
                  <span className="fl2-small fl2-muted">Sign in to apply for this position.</span>
                  <Button component={Link} to={`/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`} variant="contained" className="fl2-btn fl2-btn-gold" sx={{ textTransform: 'none' }}>
                    Sign In
                  </Button>
                </div>
              ) : kycLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><CircularProgress size={28} sx={{ color: 'var(--gold)' }} /></div>
              ) : !isKycVerified ? (
                <div className="fl2-stack" style={{ alignItems: 'center', textAlign: 'center', padding: '12px 0', gap: 10 }}>
                  <VerifiedUser sx={{ fontSize: 32, color: 'var(--ink-muted)' }} />
                  <span className="fl2-small fl2-muted">Complete identity verification (KYC) to apply — this keeps every real applicant a real, verified person.</span>
                  <Button component={Link} to="/account/kyc" variant="contained" className="fl2-btn fl2-btn-gold" sx={{ textTransform: 'none' }}>
                    Complete KYC
                  </Button>
                </div>
              ) : (
                <>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child, satisfying the rule's own nesting assertion. */}
                  <label className="fl2-field">
                    <span>Your name *</span>
                    <input value={applicantName} placeholder="Full name"
                      onChange={(e) => { setApplicantName(e.target.value); setNameError(''); }} />
                    {nameError && <span className="fl2-error">{nameError}</span>}
                  </label>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child, satisfying the rule's own nesting assertion. */}
                  <label className="fl2-field">
                    <span>Tell the club about yourself (optional)</span>
                    <textarea
                      rows={4} maxLength={500}
                      value={pitchNote}
                      onChange={(e) => setPitchNote(e.target.value)}
                      placeholder="E.g. relevant experience, coaching licenses, availability..."
                    />
                    <span className="fl2-tiny fl2-muted">{pitchNote.length} / 500</span>
                  </label>
                  <button type="button" className="fl2-btn fl2-btn-gold fl2-btn-block" onClick={handleApply} disabled={applyToPosition.isLoading}>
                    {applyToPosition.isLoading ? <CircularProgress size={20} sx={{ color: 'var(--gold-ink)' }} /> : 'Submit Application'}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </FloodlightsPage>
  );
}
