// Shared visual primitives ported from the Floodlights artifact's helper
// functions (avatar/formDots/ring/statBar/naira/colorFor/initials) — same
// deterministic-color-from-name scheme, same markup, as React components.
import { useTeamName } from '../../hooks/useFloodlightsRepo';

const PALETTE = ['#B8791E', '#1F8F4E', '#2B6CB0', '#B23A48', '#6B4FA0', '#0F766E', '#A16207', '#9D174D'];

export function colorFor(seed = '') {
  const h = [...seed].reduce((acc, c) => Math.abs(acc * 31 + c.charCodeAt(0)) % 2147483647, 0);
  return PALETTE[h % PALETTE.length];
}

export function initials(name = '') {
  return name.split(' ').filter((w) => w.length > 1 || /[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function naira(n) {
  return `₦${Number(n ?? 0).toLocaleString('en-NG')}`;
}

// Same 5-a-side W/D/L "form" the artifact shows — computed from a team's
// real completed matches (the backend doesn't store a precomputed form
// field), most recent first. Shared across Hub/League/Club screens.
export function computeForm(teamId, matches = []) {
  return matches
    .filter((m) => m.isCompleted && (m.homeTeamId === teamId || m.awayTeamId === teamId))
    .slice(-5)
    .map((m) => {
      const isHome = m.homeTeamId === teamId;
      const own = isHome ? m.homeScore : m.awayScore;
      const opp = isHome ? m.awayScore : m.homeScore;
      if (own > opp) return 'W';
      if (own < opp) return 'L';
      return 'D';
    });
}

export function Avatar({ name, size = 40, color }) {
  const c = color || colorFor(name);
  return (
    <div className="fl2-avatar" style={{ width: size, height: size, background: c, fontSize: Math.round(size * 0.4) }}>
      {initials(name)}
    </div>
  );
}

export function FormDots({ form = [] }) {
  if (!form.length) return null;
  return (
    <div className="fl2-formdots" aria-label={`Recent form: ${form.join(', ')}`}>
      {form.map((r, i) => (
        <div key={i} className={`fl2-formdot fl2-fd-${r.toLowerCase()}`}>{r}</div>
      ))}
    </div>
  );
}

export function Ring({ pct, big, small, color }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct);
  return (
    <div className="fl2-ring">
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="9" />
        <circle cx="52" cy="52" r={r} fill="none" stroke={color || 'var(--gold)'} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="fl2-ring-label"><b>{big}</b><span>{small}</span></div>
    </div>
  );
}

export function StatBar({ pct, color }) {
  return <div className="fl2-statbar"><i style={{ width: `${pct}%`, background: color || 'var(--gold)' }} /></div>;
}

// Resolves a TournamentTeam's real registered club name (via managerId,
// see useTeamName) rather than trusting the generic snapshot placeholder
// (team.teamName, e.g. "Club e914b9"). Falls back to that placeholder only
// while resolving or if the merchant lookup fails.
export function TeamName({ team }) {
  return useTeamName(team?.managerId, team?.teamName);
}

export function TeamIdentity({ team, size = 26, align = 'left', bold = true }) {
  const name = useTeamName(team?.managerId, team?.teamName);
  const label = <span style={{ fontWeight: bold ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>;
  const av = <Avatar name={name} size={size} />;
  return (
    <div className="fl2-row" style={{ minWidth: 0, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
      {align === 'right' ? <>{label}{av}</> : <>{av}{label}</>}
    </div>
  );
}

export function Pill({ children, variant = 'muted', live, style }) {
  return (
    <span className={`fl2-pill fl2-pill-${variant}`} style={style}>
      {live && <span className="fl2-dot" />}
      {children}
    </span>
  );
}
