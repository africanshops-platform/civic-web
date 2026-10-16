// Display config for the governance module. Nothing here is data: elections, candidates and petitions all come from the
// governance service. Wording is deliberately "community vote", never an official election.

/** The service's election levels, as the screens group and label them. */
export const ELECTION_LEVELS = [
  { id: 'COMMUNITY', label: 'Community', icon: '🏘️', color: '#be123c', bgColor: '#fff1f2' },
  { id: 'LOCAL_GOVT', label: 'Local area', icon: '🏠', color: '#b45309', bgColor: '#fffbeb' },
  { id: 'STATE', label: 'State', icon: '🏢', color: '#7c3aed', bgColor: '#f5f3ff' },
  { id: 'FEDERAL', label: 'National', icon: '🏛️', color: '#1d4ed8', bgColor: '#eff6ff' },
];

/** A neutral palette for candidates (parties are optional and have no brand colours here). */
export const CANDIDATE_COLORS = ['#1d4ed8', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0f766e', '#be185d', '#475569'];
export const candidateColor = (index) => CANDIDATE_COLORS[index % CANDIDATE_COLORS.length];

export const COMMUNITY_VOTE_NOTICE =
  'Community votes on AfricanShops Civic are run by community members and are independent. They are not official government elections and do not replace them.';
