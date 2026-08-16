import { resultForClub } from '../screens/ClubScreen';

// Regression guard for the fixtures-clarity redesign: the whole point of
// that pass was that a viewer can tell win/loss/draw for *their* club
// specifically, independent of which side happened to be "home" in the
// data. These lock in that home/away-relative math.
describe('resultForClub', () => {
  const myTeamId = 'team1';
  const oppTeamId = 'team2';

  it('returns null for an unplayed match regardless of scores', () => {
    const match = { isCompleted: false, homeTeamId: myTeamId, awayTeamId: oppTeamId, homeScore: null, awayScore: null };
    expect(resultForClub(match, myTeamId)).toBeNull();
  });

  it('returns W when my club is home and scores more', () => {
    const match = { isCompleted: true, homeTeamId: myTeamId, awayTeamId: oppTeamId, homeScore: 2, awayScore: 0 };
    expect(resultForClub(match, myTeamId)).toBe('W');
  });

  it('returns L when my club is home and scores less', () => {
    const match = { isCompleted: true, homeTeamId: myTeamId, awayTeamId: oppTeamId, homeScore: 0, awayScore: 2 };
    expect(resultForClub(match, myTeamId)).toBe('L');
  });

  it('returns W when my club is away and scores more — result flips relative to raw home/away score', () => {
    const match = { isCompleted: true, homeTeamId: oppTeamId, awayTeamId: myTeamId, homeScore: 0, awayScore: 2 };
    expect(resultForClub(match, myTeamId)).toBe('W');
  });

  it('returns L when my club is away and scores less', () => {
    const match = { isCompleted: true, homeTeamId: oppTeamId, awayTeamId: myTeamId, homeScore: 2, awayScore: 0 };
    expect(resultForClub(match, myTeamId)).toBe('L');
  });

  it('returns D for an equal score regardless of home/away', () => {
    const home = { isCompleted: true, homeTeamId: myTeamId, awayTeamId: oppTeamId, homeScore: 1, awayScore: 1 };
    const away = { isCompleted: true, homeTeamId: oppTeamId, awayTeamId: myTeamId, homeScore: 1, awayScore: 1 };
    expect(resultForClub(home, myTeamId)).toBe('D');
    expect(resultForClub(away, myTeamId)).toBe('D');
  });
});
