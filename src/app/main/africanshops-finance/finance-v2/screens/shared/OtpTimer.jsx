import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { F } from '../../financeUiTokens';

const OTP_DURATION = 300;

export default function OtpTimer({ expiresAt, onExpired, tokens }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const expires = new Date(expiresAt).getTime();
    const tick = () => {
      const secs = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setRemaining(secs);
      if (secs === 0) onExpired();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const pct = expiresAt ? (remaining / OTP_DURATION) * 100 : 100;

  return (
    <div className="mb-16">
      <div className="flex justify-between mb-6">
        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>OTP expires in</Typography>
        <Typography style={{ fontSize: F.small, fontWeight: 700, color: remaining < 60 ? tokens.danger : tokens.accentSolid }}>{mm}:{ss}</Typography>
      </div>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ borderRadius: 2, height: 4, background: tokens.borderColor, '& .MuiLinearProgress-bar': { background: pct < 20 ? tokens.danger : tokens.accentSolid, borderRadius: 2 } }}
      />
    </div>
  );
}
