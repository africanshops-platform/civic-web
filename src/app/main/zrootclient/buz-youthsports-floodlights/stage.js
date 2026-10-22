// Tournament stage (civic-54): the backend derives `stage` from the status, the registration window and whether fixtures exist, and
// returns it with every tournament. Screens render from it instead of guessing from `status`, so "registration opening soon" is a real
// state with a real date, not a placeholder.
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null);

export const STAGE_LABEL = {
  REGISTRATION_NOT_OPEN: 'Registration not open yet',
  REGISTRATION_OPEN: 'Registration open',
  REGISTRATION_CLOSED: 'Registration closed',
  SEEDED: 'Bracket published',
  ONGOING: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/** One line for the registration card / list tile, e.g. "Registration opens 1 Nov 2026". */
export function stageText(t) {
  switch (t?.stage) {
    case 'REGISTRATION_NOT_OPEN':
      return t.registrationOpensAt ? `Registration opens ${fmt(t.registrationOpensAt)}` : STAGE_LABEL.REGISTRATION_NOT_OPEN;
    case 'REGISTRATION_OPEN':
      return t.registrationClosesAt ? `Registration open until ${fmt(t.registrationClosesAt)}` : STAGE_LABEL.REGISTRATION_OPEN;
    default:
      return STAGE_LABEL[t?.stage] ?? '';
  }
}

/** Stages in which a participant can still enter. */
export const canEnter = (t) => t?.stage === 'REGISTRATION_OPEN';
/** Stages in which the "registration" card is relevant (before play starts). */
export const preGame = (t) => ['REGISTRATION_NOT_OPEN', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'SEEDED'].includes(t?.stage);
