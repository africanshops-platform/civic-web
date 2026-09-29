import { roundLabel } from '../screens/TournamentDetailScreen';

// Regression guard for the bracket-skeleton fix: when a KNOCKOUT tournament
// has no real match data yet, the fallback bracket is a fixed 3-round
// Quarterfinal/Semifinal/Final shape (matching the artifact) rather than a
// capacity-derived round count. These lock in the naming for both that
// fixed 3-round case and real multi-round data.
describe('roundLabel', () => {
  it('labels the 3 fixed fallback rounds as Quarterfinal/Semifinal/Final', () => {
    expect(roundLabel(1, 3)).toBe('Quarterfinal');
    expect(roundLabel(2, 3)).toBe('Semifinal');
    expect(roundLabel(3, 3)).toBe('Final');
  });

  it('labels the last real round as Final regardless of how many rounds exist', () => {
    expect(roundLabel(5, 5)).toBe('Final');
  });

  it('labels earlier real rounds generically as "Round N"', () => {
    expect(roundLabel(1, 5)).toBe('Round 1');
    expect(roundLabel(2, 5)).toBe('Round 2');
  });

  it('handles a single-round tournament as just the Final', () => {
    expect(roundLabel(1, 1)).toBe('Final');
  });
});
