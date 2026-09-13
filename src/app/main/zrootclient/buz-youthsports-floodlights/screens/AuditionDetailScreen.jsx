import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, CircularProgress, TextField } from '@mui/material';
import { ArrowBack, CalendarToday } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { Pill, TeamName } from './shared/flHelpers';
import { useAuditionDetail, useApplyToAudition, useMyAuditionApplications } from '../hooks/useFloodlightsRepo';

export default function AuditionDetailScreen() {
  const { auditionId } = useParams();
  const { data, isLoading, isError } = useAuditionDetail(auditionId);
  const audition = data?.data?.audition;
  const { data: myAppsData } = useMyAuditionApplications();
  const myApplications = myAppsData?.data?.applications ?? [];
  const existingApplication = myApplications.find((a) => a.auditionId === auditionId);
  const applyToAudition = useApplyToAudition();

  const [applicantName, setApplicantName] = useState('');
  const [pitchNote, setPitchNote] = useState('');

  function handleApply() {
    applyToAudition.mutate({ auditionId, applicantName, pitchNote: pitchNote || undefined });
  }

  return (
    <FloodlightsPage>
      <Button component={Link} to="/youth-v2/auditions" startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start', color: 'var(--ink-muted)', textTransform: 'none', fontWeight: 700, fontSize: '1.4rem' }}>
        Back to Auditions
      </Button>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><CircularProgress sx={{ color: 'var(--gold)' }} /></div>}
      {(isError || (!isLoading && !audition)) && <div className="fl2-small" style={{ color: 'var(--card-red)' }}>Audition not found.</div>}

      {audition && (
        <>
          <div className="fl2-card">
            <div className="fl2-row" style={{ gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 68, height: 68, borderRadius: 16, background: 'var(--gold-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0 }}>
                🏆
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fl2-row fl2-between" style={{ marginBottom: 8 }}>
                  <h1 style={{ fontSize: '2.6rem' }}>
                    <TeamName team={{ managerId: audition.clubMerchantId, teamName: `Club ${audition.clubMerchantId?.slice(-6)}` }} />
                  </h1>
                  <Pill variant="pos">Open</Pill>
                </div>
                <p className="fl2-small fl2-muted" style={{ margin: '0 0 12px' }}>
                  📍 {[audition.country, audition.state, audition.lga, audition.ward].filter(Boolean).join(' / ')}
                </p>
                <div className="fl2-row" style={{ gap: 20, flexWrap: 'wrap' }}>
                  <span className="fl2-small fl2-muted">🏅 {audition.sport}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="fl2-grid-2">
            <div className="fl2-card fl2-stack">
              <span className="fl2-eyebrow">Requirements</span>
              <span className="fl2-small fl2-muted" style={{ lineHeight: 1.7 }}>
                {audition.requirements || 'No specific requirements listed — turn up on trial day ready to play.'}
              </span>
              <div style={{ padding: 14, borderRadius: 12, background: 'var(--ground)', border: '1px solid var(--line)', marginTop: 8 }}>
                <div className="fl2-row" style={{ gap: 8, marginBottom: 6 }}>
                  <CalendarToday sx={{ fontSize: 18, color: 'var(--gold)' }} />
                  <span className="fl2-small" style={{ fontWeight: 700 }}>Trial date</span>
                </div>
                <div className="fl2-tiny fl2-muted">
                  <strong style={{ color: 'var(--ink)' }}>
                    {new Date(audition.scheduledDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </strong>
                </div>
              </div>
            </div>

            <div className="fl2-card fl2-stack">
              <span className="fl2-eyebrow">Apply to this audition</span>

              {existingApplication ? (
                <div style={{ padding: 14, borderRadius: 12, background: 'var(--ground)', border: '1px solid var(--line)' }}>
                  <span className="fl2-small" style={{ fontWeight: 700 }}>
                    You've already applied — status: {existingApplication.status}
                  </span>
                  {existingApplication.status === 'REJECTED' && existingApplication.rejectionReason && (
                    <p className="fl2-tiny fl2-muted" style={{ marginTop: 6 }}>{existingApplication.rejectionReason}</p>
                  )}
                </div>
              ) : (
                <>
                  <TextField
                    label="Your name"
                    fullWidth
                    size="small"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                  />
                  <TextField
                    label="Pitch note (optional)"
                    placeholder="Position played, years of experience, why you're a fit..."
                    fullWidth
                    multiline
                    minRows={3}
                    size="small"
                    value={pitchNote}
                    onChange={(e) => setPitchNote(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={!applicantName.trim() || applyToAudition.isLoading}
                    onClick={handleApply}
                    className="fl2-btn fl2-btn-gold fl2-btn-block"
                  >
                    {applyToAudition.isLoading ? 'Submitting…' : 'Apply Now'}
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
