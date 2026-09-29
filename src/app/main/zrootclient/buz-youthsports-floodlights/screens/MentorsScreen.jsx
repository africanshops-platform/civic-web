import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import FloodlightsPage from './shared/FloodlightsPage';
import { useRequestMentorship } from '../hooks/useFloodlightsRepo';
import { SPORT_ICONS } from '../mock';

const SPORTS = Object.keys(SPORT_ICONS);

export default function MentorsScreen() {
  const [sport, setSport] = useState('');
  const [talentDescription, setTalentDescription] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [errors, setErrors] = useState({});

  const requestMutation = useRequestMentorship();

  const handleSubmit = () => {
    const next = {};
    if (!sport) next.sport = 'Please select a sport or discipline';
    if (!talentDescription.trim()) next.talentDescription = 'Tell us about your talent or goals';
    if (!state.trim()) next.state = 'State is required';
    if (!lga.trim()) next.lga = 'LGA is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    requestMutation.mutate({
      sport,
      talentDescription: talentDescription.trim(),
      jurisdiction: { country: 'NG', state: state.trim(), lga: lga.trim() },
    });
  };

  if (requestMutation.isSuccess) {
    return (
      <FloodlightsPage>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <div className="fl2-stack" style={{ textAlign: 'center', maxWidth: 480, alignItems: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: 'var(--gold)' }} />
            <h2 style={{ fontSize: '2.4rem' }}>Request Submitted</h2>
            <span className="fl2-small fl2-muted" style={{ lineHeight: 1.7 }}>
              A civic youth coordinator will review your request and match you with a mentor. There's no live directory
              to browse yet — matches are made by the coordinator team.
            </span>
          </div>
        </div>
      </FloodlightsPage>
    );
  }

  return (
    <FloodlightsPage>
      <div className="fl2-stack" style={{ gap: 6 }}>
        <span className="fl2-eyebrow">Youth &amp; Sports · Learn · Grow · Get Discovered</span>
        <h1 style={{ fontSize: '2.8rem' }}>🤝 Request a Mentor</h1>
        <span className="fl2-small fl2-muted">
          There's no mentor directory to browse yet — describe your talent and a coordinator will match you with one.
        </span>
      </div>

      <div className="fl2-card fl2-stack" style={{ maxWidth: 560, gap: 18 }}>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child (select/input/textarea), satisfying the rule's own 'nesting' assertion; false positive under this plugin version. */}
        <label className="fl2-field">
          <span>Sport / Discipline *</span>
          <select value={sport} onChange={(e) => { setSport(e.target.value); setErrors((p) => ({ ...p, sport: undefined })); }}>
            <option value="">Select a sport or discipline</option>
            {SPORTS.map((s) => <option key={s} value={s}>{SPORT_ICONS[s]} {s}</option>)}
          </select>
          {errors.sport && <span className="fl2-error">{errors.sport}</span>}
        </label>

        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child (select/input/textarea), satisfying the rule's own 'nesting' assertion; false positive under this plugin version. */}
        <label className="fl2-field">
          <span>Tell us about your talent or goals *</span>
          <textarea
            rows={4}
            maxLength={500}
            value={talentDescription}
            onChange={(e) => { setTalentDescription(e.target.value); setErrors((p) => ({ ...p, talentDescription: undefined })); }}
            placeholder="E.g. achievements so far, what you're hoping to learn, current skill level..."
          />
          <div className="fl2-row fl2-between">
            {errors.talentDescription ? <span className="fl2-error">{errors.talentDescription}</span> : <span />}
            <span className="fl2-tiny fl2-muted">{talentDescription.length} / 500</span>
          </div>
        </label>

        <div className="fl2-grid-2">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child (select/input/textarea), satisfying the rule's own 'nesting' assertion; false positive under this plugin version. */}
        <label className="fl2-field">
            <span>State *</span>
            <input value={state} placeholder="e.g. Lagos"
              onChange={(e) => { setState(e.target.value); setErrors((p) => ({ ...p, state: undefined })); }} />
            {errors.state && <span className="fl2-error">{errors.state}</span>}
          </label>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- control is a direct nested child (select/input/textarea), satisfying the rule's own 'nesting' assertion; false positive under this plugin version. */}
        <label className="fl2-field">
            <span>LGA *</span>
            <input value={lga} placeholder="e.g. Ikeja"
              onChange={(e) => { setLga(e.target.value); setErrors((p) => ({ ...p, lga: undefined })); }} />
            {errors.lga && <span className="fl2-error">{errors.lga}</span>}
          </label>
        </div>

        <button type="button" className="fl2-btn fl2-btn-gold fl2-btn-block" onClick={handleSubmit} disabled={requestMutation.isLoading}>
          {requestMutation.isLoading ? <CircularProgress size={20} sx={{ color: 'var(--gold-ink)' }} /> : 'Submit Request'}
        </button>
      </div>
    </FloodlightsPage>
  );
}
