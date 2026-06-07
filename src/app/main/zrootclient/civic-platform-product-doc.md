# AfricanShops Civic Platform — Product Document

**Version:** 1.0  
**Date:** June 2026  
**Owner:** Ferdinand Eke  
**Status:** Active Development — Phase 1

---

## Vision

AfricanShops is evolving from a trade and SME marketplace into a full-stack civic platform. Using the existing Country → State → LGA → Market jurisdictional cascade, we extend every community service — security, governance, healthcare, tax, youth, and social engagement — to the very last mile of African society.

Nigeria is the pilot market. What we build here is a blueprint for every African country.

---

## Platform Architecture Philosophy

Every module on this platform is built on three pillars:

1. **Jurisdictional cascade** — Country → State → LGA → Community. Every service must be addressable at any level of this hierarchy. No service should be abstract to the user — it should always feel local.

2. **3-Section Responsive Layout** — Left sidebar (filters, navigation, drill-down), Center content (primary interaction), Right sidebar (stats, quick actions, activity). This layout is maintained across all screens on all devices.

3. **Mock-first, API-ready** — All screens are built with rich mock datasets that precisely mirror the shape of future API responses. When backend APIs are ready, only the data source changes — no UI restructuring required.

---

## Existing Modules (Production)

| Module | Folder | Status |
|---|---|---|
| Marketplace | `buz-marketplace` | Production |
| Bookings | `buz-bookings` | Production |
| Food & Restaurants | `buz-foodmart` | Production |
| Real Estate | `buz-realestates` | Production (Active Dev) |

---

## New Civic Modules — This Phase

| Priority | Module | Folder | Route Base | Status |
|---|---|---|---|---|
| 1 | Voluntary Civic Tax | `buz-civictax` | `/civictax` | Planned |
| 2 | Security Operations Center | `buz-security` | `/security` | Planned |
| 3 | Digital Governance & Elections | `buz-governance` | `/governance` | Planned |
| 4 | Community Social Engagement | `buz-social` | `/community` | Planned |
| 5 | Primary Healthcare | `buz-healthcare` | `/healthcare` | Planned |
| 6 | Youth & Sports Development | `buz-youthsports` | `/youth` | Planned |

---

## User Roles — Civic Platform

The following roles are defined here for documentation purposes. They will be implemented in the backend auth system when APIs are built. For now, all screens are accessible but role-gated sections display appropriate "coming soon" or "access restricted" states.

| Role | Code | Description |
|---|---|---|
| Citizen | `citizen` | Default authenticated user. Can report, vote, contribute, book. |
| Security Officer | `security_officer` | SOC operator. Can triage and respond to security incidents. |
| SOC Administrator | `soc_admin` | Manages security officers, can close and escalate incidents. |
| Returning Officer | `returning_officer` | Manages a ward or LGA's collation during elections. |
| Election Administrator | `election_admin` | Manages election setup, opens/closes voting, publishes results. |
| Election Observer | `election_observer` | Read-only access to collation and audit trail. |
| Health Worker | `health_worker` | Practitioners linked to a health facility. |
| Health Facility Admin | `health_facility_admin` | Manages facility profile, practitioners, and schedules. |
| Ward Leader | `ward_leader` | Verified community representative for a specific LGA/ward. |
| Youth Coordinator | `youth_coordinator` | Manages programs and talent spotlights in a jurisdiction. |

---

---

## MODULE 1: Voluntary Civic Tax (`buz-civictax`)

### Purpose
Enable every Nigerian citizen to voluntarily contribute to verified, LGA-level campaigns for security, agriculture, infrastructure, and community services. Every naira is tracked with full transparency and linked to specific projects.

### User Stories

- As a citizen, I want to see what campaigns are active in my LGA so I can decide where to contribute.
- As a citizen, I want to make a contribution to a campaign and receive a receipt.
- As a citizen, I want to track how my contributions are being used on real projects.
- As an LGA administrator, I want to create campaigns, set targets, and post project updates.

### Screens

#### Public (Unauthenticated)
| Screen | Path | Description |
|---|---|---|
| `CivicTaxLandingPage` | `/civictax` | Hero + platform overview, active campaigns teaser, CTA to sign in |
| `CampaignsBrowsePage` | `/civictax/campaigns` | Browse all active campaigns filtered by Country/State/LGA/Category |
| `CampaignDetailPublicPage` | `/civictax/campaigns/:campaignId/view` | Campaign details, progress, contributors (anonymized), sign-in CTA |

#### Authenticated
| Screen | Path | Description |
|---|---|---|
| `CivicTaxDashboardPage` | `civictax/dashboard` | User's contribution history, active campaigns in their LGA, impact stats |
| `MakeTaxContributionPage` | `civictax/campaigns/:campaignId/contribute` | Contribution form → Paystack payment → receipt |
| `MyContributionsPage` | `civictax/my-contributions` | User's full contribution history with downloadable receipts |
| `LgaProjectTrackerPage` | `civictax/projects` | Live project updates, milestones, fund utilization charts |
| `ContributionReceiptPage` | `civictax/:transactionId/receipt` | Post-payment receipt and thank you page |

### Mock Data Shape

```js
// mockCampaigns.js
{
  id: 'camp_001',
  title: 'Lagos LGA Security Fund Q2 2026',
  category: 'security',       // security | agriculture | infrastructure | health | education
  jurisdiction: {
    country: 'Nigeria',
    state: 'Lagos',
    lga: 'Eti-Osa',
  },
  targetAmount: 5000000,        // in kobo (NGN × 100)
  raisedAmount: 2300000,
  contributorsCount: 847,
  deadline: '2026-07-31',
  status: 'active',             // active | completed | paused
  projects: [...],              // linked project milestones
  createdAt: '2026-05-01',
}
```

### Key Components
- `CampaignCard` — Visual card with progress ring, category badge, jurisdiction
- `CampaignProgressBar` — Animated progress with amount raised / target
- `ContributionForm` — Amount selector, message, payment trigger
- `ProjectMilestoneTimeline` — Visual project update tracker
- `JurisdictionDrilldown` — Country → State → LGA selector (shared across civic modules)

---

---

## MODULE 2: Security Operations Center (`buz-security`)

### Purpose
A citizen-facing incident reporting system and an operator-facing Security Operations Center (SOC). Citizens report security incidents with location. SOC operators see all incidents on a GIS map, assess risk levels, assign officers, and track response.

### Map Technology
`react-leaflet` + `leaflet` (already installed). No external API key required. OpenStreetMap tiles for base map. Custom incident markers by severity.

### User Stories

- As a citizen, I want to report a security incident with my location so authorities can respond.
- As a citizen near a high-risk area, I want to see an alert so I can make safe decisions.
- As a SOC operator, I want to see all active incidents on a map with risk levels so I can prioritize response.
- As a SOC operator, I want to assign officers to incidents and log response actions.
- As an administrator, I want to see response performance metrics for my jurisdiction.

### Screens

#### Public (Unauthenticated)
| Screen | Path | Description |
|---|---|---|
| `SecurityMapPublicPage` | `/security/map` | Live public incident map (low/medium severity only), awareness alerts, report CTA |
| `SecurityAwarenessPage` | `/security/awareness` | Safety tips, emergency contacts, report guidelines |

#### Authenticated (Citizen)
| Screen | Path | Description |
|---|---|---|
| `ReportIncidentPage` | `security/report-incident` | Multi-step incident report: location (GPS + manual), category, severity, description, photos |
| `MyReportsPage` | `security/my-reports` | User's submitted reports with status tracking |
| `ReportDetailPage` | `security/reports/:reportId/view` | Single report view with response timeline |
| `MySafetyZonePage` | `security/my-safety-zone` | Set home/work zones, configure proximity alerts |

#### Authenticated (SOC Operator — `security_officer`, `soc_admin`)
| Screen | Path | Description |
|---|---|---|
| `SocDashboardPage` | `security/soc/dashboard` | Operator overview: active incidents, response stats, heat map, triage queue |
| `SocIncidentMapPage` | `security/soc/map` | Full-screen GIS map with all incidents, cluster view, risk overlays |
| `SocIncidentDetailPage` | `security/soc/incidents/:incidentId` | Incident triage: risk assessment, officer assignment, response log |
| `SocTeamManagementPage` | `security/soc/team` | (soc_admin only) Manage officers, zones, capacity |
| `SocReportsPage` | `security/soc/reports` | Response performance analytics by jurisdiction |

### Mock Data Shape

```js
// mockIncidents.js
{
  id: 'inc_001',
  reportedBy: 'user_xyz',           // anonymized in public view
  category: 'armed_robbery',         // armed_robbery | civil_unrest | kidnapping | fire | accident | other
  severity: 'high',                  // low | medium | high | critical
  status: 'active',                  // active | responding | resolved | false_alarm
  location: {
    lat: 6.5244,
    lng: 3.3792,
    address: 'Lekki Phase 1, Lagos',
    lga: 'Eti-Osa',
    state: 'Lagos',
  },
  description: 'Armed men blocking road...',
  photos: ['url1', 'url2'],
  reportedAt: '2026-06-04T08:23:00Z',
  responseTimeline: [
    { action: 'reported', timestamp: '...', by: 'citizen' },
    { action: 'acknowledged', timestamp: '...', by: 'officer_012' },
    { action: 'responding', timestamp: '...', by: 'officer_012' },
  ],
  assignedOfficer: 'officer_012',
}
```

### Key Components
- `IncidentMap` — react-leaflet MapContainer with custom MarkerClusterGroup and severity color codes
- `IncidentMarker` — Custom animated marker by severity (pulsing for critical/high)
- `RiskOverlayLayer` — Heat map layer for high-density incident areas
- `IncidentReportWizard` — Multi-step form: location → category → details → review → submit
- `SocTriageQueue` — Sortable/filterable list of active incidents for operators
- `IncidentTimeline` — Response action log with timestamps and officer IDs
- `SafetyZoneDrawer` — User-drawn zone on map with alert radius

---

---

## MODULE 3: Digital Governance & Elections (`buz-governance`)

### Purpose
A fully transparent election management and digital governance system. Citizens can see real-time ward-by-ward collation as results come in. Election administrators manage the election lifecycle. An optional online voting switch enables/disables digital balloting per election.

### User Stories

- As a citizen, I want to watch live election results collation in my ward/LGA/state.
- As a citizen, I want to participate in local governance polls and sign petitions.
- As a returning officer, I want to enter and submit collation results for my assigned ward.
- As an election administrator, I want to open/close an election and toggle online voting.
- As an election observer, I want to view the full audit trail and download reports.

### Screens

#### Public (Unauthenticated)
| Screen | Path | Description |
|---|---|---|
| `GovernanceLandingPage` | `/governance` | Platform overview, active elections teaser, governance news, sign-in CTA |
| `ElectionListPublicPage` | `/governance/elections` | Browse all elections by jurisdiction and status |
| `ElectionDetailPublicPage` | `/governance/elections/:electionId/live` | Live collation board, real-time charts, candidate overview (public view) |

#### Authenticated (Citizen)
| Screen | Path | Description |
|---|---|---|
| `GovernanceDashboardPage` | `governance/dashboard` | Active elections in your jurisdiction, petitions to sign, polls |
| `VotingPortalPage` | `governance/elections/:electionId/vote` | Secure ballot interface — shown only when online_voting is enabled |
| `CitizenParticipationPage` | `governance/participate` | Active polls, petitions, community referendums |
| `PetitionDetailPage` | `governance/petitions/:petitionId` | Petition detail, signatories count, sign action |
| `MyVotingHistoryPage` | `governance/my-votes` | User's participation record (no vote content — only participation confirmation) |

#### Authenticated (Election Officials)
| Screen | Path | Description |
|---|---|---|
| `CollationCenterPage` | `governance/elections/:electionId/collation` | Returning officer: enter and submit ward results |
| `ElectionOversightPage` | `governance/elections/:electionId/oversight` | Observer: read-only full view of collation, audit log |
| `ElectionAdminPage` | `governance/admin/elections` | Election admin: create/manage elections, toggle online voting |
| `CollationAuditPage` | `governance/elections/:electionId/audit` | Full audit trail with timestamps, submitted-by, verification hashes |

### Mock Data Shape

```js
// mockElections.js
{
  id: 'elec_001',
  title: 'Lagos State Governorship Election 2027',
  type: 'governorship',        // presidential | gubernatorial | senatorial | house | lga | ward
  jurisdiction: { country: 'Nigeria', state: 'Lagos' },
  status: 'active',             // upcoming | active | closed | results_published
  onlineVotingEnabled: false,
  startDate: '2027-02-15',
  endDate: '2027-02-15',
  candidates: [
    { id: 'cand_001', name: 'Adewale Ogundimu', party: 'APC', photo: '...', manifesto: '...' },
  ],
  collationResults: {
    totalAccreditedVoters: 4200000,
    totalVotesCast: 2800000,
    wardResults: [
      { wardCode: 'LAG_EOS_W01', wardName: 'Victoria Island Ward 1', results: [...] }
    ],
  },
}
```

### Key Components
- `LiveCollationBoard` — Real-time updating results table with ApexCharts bar/donut chart (ApexCharts already installed)
- `CandidateCard` — Photo, name, party, vote count, percentage
- `VotingBallot` — Secure ballot UI with candidate selection and confirmation
- `CollationEntryForm` — Returning officer's ward result entry form
- `ElectionTimeline` — Visual lifecycle of election (announced → active → closed → published)
- `AuditTrailTable` — Sortable audit table with verification checksums
- `JurisdictionResultsMap` — Leaflet map coloring wards by leading candidate

---

---

## MODULE 4: Community Social Engagement (`buz-social`)

### Purpose
A locality-scoped community platform where citizens discuss, report, and solve issues in their LGA. Issues are tagged, tracked, and resolved with community participation. It replaces the vacuum left by ineffective local governance communication channels.

### User Stories

- As a citizen, I want to post an issue in my LGA so my community can see it and engage.
- As a citizen, I want to upvote issues that affect me so they get priority attention.
- As a ward leader, I want to acknowledge issues and post updates so citizens stay informed.
- As any citizen, I want to see which issues were resolved and how, to build trust.

### Screens

#### Public (Unauthenticated)
| Screen | Path | Description |
|---|---|---|
| `CommunityLandingPage` | `/community` | Platform intro, top issues, active discussions, sign-in CTA |
| `CommunityFeedPublicPage` | `/community/feed` | Browsable feed of community issues with jurisdiction filter |

#### Authenticated
| Screen | Path | Description |
|---|---|---|
| `CommunityFeedPage` | `community/feed` | Personalized feed for user's LGA + followed topics |
| `CreateIssuePage` | `community/create-issue` | Post issue: title, description, category, location, photos, urgency |
| `IssueDetailPage` | `community/issues/:issueId` | Full thread view: issue + comments + proposed solutions + status |
| `ResolvedIssuesPage` | `community/resolved` | Gallery of solved community problems with outcome stories |
| `LocalLeadersPage` | `community/leaders` | Verified ward leaders — their issues engagement, accountability record |
| `CommunityProjectsPage` | `community/projects` | Community-driven volunteer and fund-based projects |
| `ProjectDetailPage` | `community/projects/:projectId` | Project detail, contributors, milestones, join CTA |
| `MyEngagementPage` | `community/my-engagement` | User's posted issues, comments, project participations |

### Mock Data Shape

```js
// mockCommunityIssues.js
{
  id: 'issue_001',
  title: 'Broken Street Lights on Admiralty Way',
  category: 'infrastructure',   // infrastructure | security | health | education | environment | governance
  urgency: 'medium',            // low | medium | high | critical
  status: 'open',               // open | acknowledged | in_progress | resolved
  jurisdiction: { state: 'Lagos', lga: 'Eti-Osa', ward: 'Victoria Island Ward 1' },
  postedBy: { name: 'Amara O.', avatar: '...', isVerified: false },
  upvotes: 234,
  commentsCount: 47,
  photos: ['url1'],
  createdAt: '2026-05-28T14:00:00Z',
  lastActivity: '2026-06-03T09:12:00Z',
  tags: ['streetlights', 'safety', 'nighttime'],
}
```

### Key Components
- `IssueCard` — Compact card with category icon, urgency badge, upvote count, comment count
- `IssueFeed` — Virtualized list (react-virtuoso already installed) for performance
- `IssueCommentThread` — Nested comment display with ward leader highlighting
- `StatusBadge` — Visual status indicator with color coding
- `UrgencyMeter` — Visual representation of issue urgency
- `CommunityProjectCard` — Project card with progress and contributor avatars

---

---

## MODULE 5: Primary Healthcare (`buz-healthcare`)

### Purpose
Connect citizens with verified primary healthcare facilities in their LGA. Facilities are registered and cascaded through the Country → State → LGA hierarchy. Citizens can find facilities, view services, and book consultations (reusing the bookings engine).

### User Stories

- As a citizen, I want to find verified health facilities near my LGA.
- As a citizen, I want to see what services a facility offers before I go.
- As a citizen, I want to book a consultation appointment with a specific practitioner.
- As a health worker, I want my facility's profile to be visible and up-to-date.

### Screens

#### Public (Unauthenticated)
| Screen | Path | Description |
|---|---|---|
| `HealthcareLandingPage` | `/healthcare` | Platform overview, find-facility search, active health campaigns |
| `FindFacilityPage` | `/healthcare/facilities` | Browse facilities by State/LGA/specialty with map toggle |
| `FacilityDetailPublicPage` | `/healthcare/facilities/:facilityId/view` | Facility info, services, practitioners, hours, booking CTA |

#### Authenticated (Citizen)
| Screen | Path | Description |
|---|---|---|
| `HealthcareDashboardPage` | `healthcare/dashboard` | My upcoming appointments, nearby facilities, health alerts |
| `BookConsultationPage` | `healthcare/facilities/:facilityId/book` | Book appointment — practitioner, date, time, reason |
| `MyAppointmentsPage` | `healthcare/my-appointments` | Upcoming and past appointments |
| `AppointmentDetailPage` | `healthcare/appointments/:appointmentId` | Appointment details, documents, notes |
| `HealthAlertsPage` | `healthcare/alerts` | Outbreak alerts, vaccination drives, health advisories by jurisdiction |

#### Authenticated (Health Worker / Facility Admin)
| Screen | Path | Description |
|---|---|---|
| `FacilityManagementPage` | `healthcare/manage/facility` | Facility admin: update profile, services, operating hours |
| `AppointmentManagementPage` | `healthcare/manage/appointments` | Manage bookings, mark attended, add notes |

### Mock Data Shape

```js
// mockFacilities.js
{
  id: 'fac_001',
  name: 'Eti-Osa Community Health Centre',
  type: 'primary_health_centre',   // hospital | clinic | primary_health_centre | pharmacy | maternity
  services: ['general_practice', 'antenatal', 'immunization', 'dental'],
  jurisdiction: { state: 'Lagos', lga: 'Eti-Osa' },
  location: { lat: 6.4698, lng: 3.5852, address: '...' },
  operatingHours: { monday: '8:00-17:00', ... },
  practitioners: [
    { id: 'prac_001', name: 'Dr. Chukwuemeka Obi', specialty: 'General Practice', available: true }
  ],
  rating: 4.2,
  reviewsCount: 89,
  isVerified: true,
}
```

### Key Components
- `FacilityCard` — Card with services, rating, distance, booking CTA
- `FacilityMap` — Leaflet map with facility pins and clustering
- `PractitionerCard` — Practitioner photo, specialty, availability badge
- `AppointmentBookingWizard` — Step-through: practitioner → date → time → reason → confirm
- `HealthAlertBanner` — Urgent health advisory banner with jurisdiction
- `ServiceBadgeList` — Visual list of services offered

---

---

## MODULE 6: Youth & Sports Development (`buz-youthsports`)

### Purpose
Channel Nigeria's enormous youth population into productive programs — vocational training, entrepreneurship, sports, arts — using the LGA-level cascade to make opportunities accessible everywhere.

### User Stories

- As a youth, I want to discover programs near me (vocational, sports, entrepreneurship).
- As a youth, I want to enroll in a program and track my progress.
- As a talent scout / coordinator, I want to spotlight youth achievements.
- As any citizen, I want to follow local sports tournaments and see results.

### Screens

#### Public (Unauthenticated)
| Screen | Path | Description |
|---|---|---|
| `YouthHubLandingPage` | `/youth` | Platform overview, featured programs, talent spotlights, sign-in CTA |
| `ProgramsPublicPage` | `/youth/programs` | Browse programs by State/LGA/category |
| `TalentSpotlightPage` | `/youth/spotlight` | Public gallery of spotlighted youth achievements |
| `SportsTournamentsPublicPage` | `/youth/sports/tournaments` | Active and upcoming tournaments |

#### Authenticated
| Screen | Path | Description |
|---|---|---|
| `YouthDashboardPage` | `youth/dashboard` | My enrolled programs, upcoming events, spotlight nominations |
| `ProgramDetailPage` | `youth/programs/:programId` | Program info, curriculum, mentor, enroll CTA |
| `MyProgramsPage` | `youth/my-programs` | Enrolled programs with progress tracking |
| `MentorshipPage` | `youth/mentorship` | Find mentors by domain, send connection request |
| `TournamentDetailPage` | `youth/sports/tournaments/:tournamentId` | Tournament bracket, scores, registration |
| `RegisterForTournamentPage` | `youth/sports/tournaments/:tournamentId/register` | Team/individual registration form |

### Mock Data Shape

```js
// mockPrograms.js
{
  id: 'prog_001',
  title: 'Digital Skills Bootcamp — Lagos',
  category: 'vocational',       // vocational | sports | arts | entrepreneurship | civic
  jurisdiction: { state: 'Lagos', lga: 'Eti-Osa' },
  ageRange: '18-35',
  duration: '12 weeks',
  startDate: '2026-07-01',
  spotsAvailable: 30,
  totalSpots: 50,
  mentor: { id: 'mentor_01', name: 'Tunde Adeyemi', title: 'Senior Software Engineer', photo: '...' },
  format: 'hybrid',             // online | in_person | hybrid
  benefits: ['certification', 'stipend', 'job_placement'],
  enrolledCount: 20,
}
```

### Key Components
- `ProgramCard` — Program card with category, age range, availability badge, CTA
- `TalentCard` — Youth spotlight card with photo, achievement, story link
- `TournamentBracket` — Visual bracket for sports tournament progression
- `MentorCard` — Mentor profile card with domain, availability, connect button
- `ProgramProgressTracker` — Visual progress bar for enrolled program completion

---

---

## Cross-Module Shared Components

These components are shared across all civic modules and live in a shared folder:

### `src/app/main/zrootclient/civic-shared/`

| Component | Description |
|---|---|
| `JurisdictionSelector` | Country → State → LGA → Ward cascading dropdown. The core navigation component for all civic modules. |
| `CivicModuleHeader` | Standardized 3-section header with module title, jurisdiction display, and toggle buttons |
| `EmptyStateCivic` | Engaging empty state for when no data is available in a jurisdiction |
| `CivicLoadingSkeleton` | Skeleton loading states that match the 3-section layout |
| `CivicStatCard` | Compact stat card: icon + number + label + trend indicator |
| `ActivityFeedItem` | Generic activity feed item for right sidebar use across all modules |
| `CivicSearchBar` | Unified search bar with jurisdiction context |

---

## Routing Architecture

### Authenticated Routes Pattern
Each module has a `{module}PagesConfig.jsx` file:
```js
const moduleAuthConfig = {
  settings: { layout: { config: { navbar: { display: false }, toolbar: { display: true }, ... } } },
  routes: [ { path: 'civictax/dashboard', element: <CivicTaxDashboardPage /> }, ... ]
};
```
Imported into `routeConfigs[]` in `routesConfig.jsx`.

### Unauthenticated Routes Pattern
Each module has a `{module}PublicPagesConfig.js` file:
```js
const modulePublicRoutes = [
  { path: '/civictax', settings: { layout: { config: { ... } } }, element: <CivicTaxLandingPage /> },
];
export default modulePublicRoutes;
```
Spread directly into the `routes[]` array in `routesConfig.jsx`.

---

## Development Phases

### Phase 1 — Foundation & Documents (Week 1: Jun 4–11)
- [x] Product document
- [ ] Implementation guide
- [ ] Progress tracker
- [ ] `civic-shared/` folder with shared components skeleton
- [ ] Mock data layer for all 6 modules

### Phase 2 — Tax & Security (Week 2: Jun 12–18)
- [ ] `buz-civictax` — all screens, mock data, tests
- [ ] `buz-security` — all screens, GIS map, mock data, tests

### Phase 3 — Governance & Social (Week 3: Jun 19–25)
- [ ] `buz-governance` — all screens, live collation board, mock data, tests
- [ ] `buz-social` — all screens, virtualized feed, mock data, tests

### Phase 4 — Healthcare & Youth (Week 4: Jun 26–30)
- [ ] `buz-healthcare` — all screens, facility map, mock data, tests
- [ ] `buz-youthsports` — all screens, tournament bracket, mock data, tests

### Phase 5 — API Integration (Post-June)
- [ ] Backend API contracts defined per module
- [ ] React Query hooks switched from mock to real endpoints
- [ ] End-to-end testing

---

## Success Metrics (End of June 2026)

- All 6 modules accessible via their public routes
- All authenticated screens functional with mock data
- All screens responsive on mobile (< 768px), tablet, and desktop
- GIS map rendering with mock incidents/facilities
- Live collation board updating in real-time (mocked with intervals)
- Test coverage ≥ 80% on all screens
