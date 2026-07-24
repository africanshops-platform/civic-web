const MATCH_HEIGHT = 64;
const MATCH_WIDTH = 168;
const ROUND_GAP = 36;

function teamName(teams, id) {
  return teams.find((t) => t.id === id)?.teamName ?? 'TBD';
}

function MatchBox({ match, teams }) {
  const homeWon = match.isCompleted && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = match.isCompleted && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <div style={{ width: MATCH_WIDTH, height: MATCH_HEIGHT, background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', background: homeWon ? '#f0fdf4' : 'transparent' }}>
        <span style={{ fontSize: 11, fontWeight: homeWon ? 800 : 600, color: '#0f172a', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {teamName(teams, match.homeTeamId)}
        </span>
        <span style={{ fontSize: 12, fontWeight: 900, color: homeWon ? '#16a34a' : '#94a3b8' }}>{match.homeScore ?? '-'}</span>
      </div>
      <div style={{ height: 1, background: '#e2e8f0' }} />
      <div style={{ height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', background: awayWon ? '#f0fdf4' : 'transparent' }}>
        <span style={{ fontSize: 11, fontWeight: awayWon ? 800 : 600, color: '#0f172a', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {teamName(teams, match.awayTeamId)}
        </span>
        <span style={{ fontSize: 12, fontWeight: 900, color: awayWon ? '#16a34a' : '#94a3b8' }}>{match.awayScore ?? '-'}</span>
      </div>
    </div>
  );
}

// Pure-CSS knockout bracket, ported from the civic-app mobile version (same
// grouping/spacing algorithm, DOM instead of react-native Views). Vertical
// spacing between matches doubles each round so pairs visually converge
// toward the next round's match — the standard CSS-bracket trick.
export default function BracketTree({ matches, teams }) {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);

  if (!rounds.length) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>No matches scheduled yet.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', overflowX: 'auto', padding: 16 }}>
      {rounds.map((round, roundIdx) => {
        const roundMatches = matches.filter((m) => m.round === round).sort((a, b) => a.id.localeCompare(b.id));
        // Gap doubles each round: round 0 has base gap, round 1 has 2x, etc.,
        // so each pair's midpoint lines up with the next round's single slot.
        const gapMultiplier = 2 ** roundIdx;
        const topOffset = roundIdx === 0 ? 0 : (MATCH_HEIGHT + ROUND_GAP) * (gapMultiplier / 2 - 0.5);

        return (
          <div key={round} style={{ marginRight: 28, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, textAlign: 'center' }}>
              Round {round}
            </div>
            <div style={{ paddingTop: Math.max(0, topOffset) }}>
              {roundMatches.map((match, i) => (
                <div key={match.id} style={{ position: 'relative', marginBottom: i < roundMatches.length - 1 ? ROUND_GAP * gapMultiplier : 0 }}>
                  <MatchBox match={match} teams={teams} />
                  {/* Connector stub to the next round */}
                  {roundIdx < rounds.length - 1 && (
                    <div style={{ position: 'absolute', right: -14, top: MATCH_HEIGHT / 2 - 1, width: 14, height: 2, background: '#cbd5e1', pointerEvents: 'none' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
