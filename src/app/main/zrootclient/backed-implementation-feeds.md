
# AfricanShops Civic Platform — Implementation Guide

**Version:** 1.0  
**Date:** June 2026

This guide is the single technical reference for every developer building civic platform screens. Read this before writing a single line of code.

---

## 1. Module Folder Structure

Every civic module follows this exact structure. No deviation.

```
src/app/main/zrootclient/buz-{name}/
│
├── screens/                              ← page-level components (the "shells")
│   ├── {Feature}WithSidebarsContentScrollPage.jsx    ← main 3-section page
│   └── shared-components/
│       ├── {Feature}Header.jsx           ← top header bar
│       ├── {Feature}Content.jsx          ← center content area
│       ├── {Feature}SidebarLeft.jsx      ← left filter/nav sidebar
│       └── {Feature}SidebarRight.jsx     ← right stats/activity sidebar
│
├── components/                           ← reusable sub-components (cards, forms, etc.)
│   └── {ComponentName}.jsx
│
├── mock/                                 ← mock datasets
│   ├── mock{Entity}.js                   ← e.g. mockCampaigns.js
│   └── index.js                          ← barrel export
│
├── hooks/                                ← react-query hooks
│   └── use{Feature}Repo.js              ← e.g. useCivicTaxRepo.js
│
├── __tests__/                            ← test files (co-located at module level)
│   └── {ComponentName}.test.jsx
│
├── {name}PagesConfig.jsx                 ← AUTHENTICATED route config
└── {name}PublicPagesConfig.js            ← UNAUTHENTICATED route config (plain array)
```

---

## 2. The 3-Section Page Shell Pattern

This is the foundational pattern. Every main listing/dashboard page uses it. Copy this skeleton exactly.

```jsx
// screens/{Feature}WithSidebarsContentScrollPage.jsx

import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import {Feature}Header from './shared-components/{Feature}Header';
import {Feature}Content from './shared-components/{Feature}Content';
import {Feature}SidebarLeft from './shared-components/{Feature}SidebarLeft';
import {Feature}SidebarRight from './shared-components/{Feature}SidebarRight';
import { useXxxRepo } from '../hooks/useXxxRepo';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

function Active{Feature}Page() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const { data, isLoading, isError } = useXxxRepo(filters);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleLeftSidebarToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightSidebarToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftSidebarClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightSidebarClose = useCallback(() => setRightSidebarOpen(false), []);

  const items = useMemo(() => data?.data?.items, [data?.data?.items]);
  const stats = useMemo(() => data?.data?.stats, [data?.data?.stats]);

  const headerComponent = useMemo(() => (
    <{Feature}Header
      leftSidebarToggle={handleLeftSidebarToggle}
      rightSidebarToggle={handleRightSidebarToggle}
    />
  ), [handleLeftSidebarToggle, handleRightSidebarToggle]);

  const contentComponent = useMemo(() => (
    <{Feature}Content
      items={items}
      isLoading={isLoading}
      isError={isError}
    />
  ), [items, isLoading, isError]);

  const leftSidebarComponent = useMemo(() => (
    <{Feature}SidebarLeft onFilterChange={handleFilterChange} />
  ), [handleFilterChange]);

  const rightSidebarComponent = useMemo(() => (
    <{Feature}SidebarRight stats={stats} items={items} />
  ), [stats, items]);

  return (
    <Root
      header={headerComponent}
      content={contentComponent}
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={handleLeftSidebarClose}
      leftSidebarContent={leftSidebarComponent}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={handleRightSidebarClose}
      rightSidebarContent={rightSidebarComponent}
      scroll="content"
    />
  );
}

const Memoized{Feature}Page = memo(Active{Feature}Page);

function {Feature}WithSidebarsContentScrollPage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  const serviceStatus = useMemo(
    () => appSettings?.data?.payload?.{serviceKey}Status,
    [appSettings?.data?.payload?.{serviceKey}Status]
  );

  return (
    <ServiceStatusLandingPage
      serviceStatus={serviceStatus}
      ActiveComponent={Memoized{Feature}Page}
      isLoading={isLoading}
      isError={isError}
      serviceName="{Feature Display Name}"
    />
  );
}

export default {Feature}WithSidebarsContentScrollPage;
```

---

## 3. React Query Hook Pattern (Mock-First)

Every hook follows this pattern. The `USE_MOCK` flag switches between mock and real API. When the API is ready, remove the mock branch — nothing else changes.

```js
// hooks/useCivicTaxRepo.js

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { mockCampaigns } from '../mock';
// import axiosInstance from 'app/configs/data/utils/axiosInstance'; // uncomment when API ready

const USE_MOCK = true; // flip to false when API is ready

// GET list
export function useCampaigns(filters = {}) {
  return useQuery({
    queryKey: ['civictax-campaigns', filters],
    queryFn: async () => {
      if (USE_MOCK) {
        // simulate network delay
        await new Promise((r) => setTimeout(r, 600));
        return {
          data: {
            items: mockCampaigns,
            pagination: { total: mockCampaigns.length, page: 1, limit: 10 },
            stats: { totalRaised: 23000000, activeCampaigns: 12, contributors: 4821 },
          },
        };
      }
      // return axiosInstance.get('/civictax/campaigns', { params: filters });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true,
  });
}

// GET single
export function useCampaignDetail(campaignId) {
  return useQuery({
    queryKey: ['civictax-campaign', campaignId],
    queryFn: async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        return { data: { item: mockCampaigns.find((c) => c.id === campaignId) || mockCampaigns[0] } };
      }
      // return axiosInstance.get(`/civictax/campaigns/${campaignId}`);
    },
    enabled: !!campaignId,
  });
}

// POST (mutation)
export function useContributeToCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 1200));
        return { data: { success: true, transactionId: `txn_${Date.now()}` } };
      }
      // return axiosInstance.post('/civictax/contributions', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['civictax-campaigns']);
      queryClient.invalidateQueries(['civictax-my-contributions']);
    },
  });
}
```

---

## 4. Mock Data Pattern

```js
// mock/mockCampaigns.js

export const mockCampaigns = [
  {
    id: 'camp_001',
    title: 'Eti-Osa Security & Street Light Initiative',
    category: 'security',
    jurisdiction: { country: 'Nigeria', state: 'Lagos', lga: 'Eti-Osa' },
    targetAmount: 5000000,
    raisedAmount: 2847500,
    contributorsCount: 847,
    deadline: '2026-08-31',
    status: 'active',
    description: 'Funding for 200 solar-powered street lights and 24-hour security patrols across Eti-Osa LGA...',
    projects: [
      { id: 'proj_001', title: 'Phase 1: Street Light Installation', status: 'in_progress', completionPercentage: 65, budget: 1500000, spent: 980000 },
    ],
    createdAt: '2026-05-01T00:00:00Z',
    coverImage: null,
  },
  // ... add 9-14 more realistic entries
];

// mock/index.js (barrel export)
export { mockCampaigns } from './mockCampaigns';
export { mockContributions } from './mockContributions';
export { mockLgaProjects } from './mockLgaProjects';
```

---

## 5. Authenticated Pages Config Pattern

```jsx
// {name}PagesConfig.jsx

import { lazy } from 'react';

const {Feature}DashboardPage = lazy(() => import('./screens/{Feature}DashboardPage'));
const {Feature}WithSidebarsPage = lazy(() => import('./screens/{Feature}WithSidebarsContentScrollPage'));

const {name}PagesConfig = {
  settings: {
    layout: {
      config: {
        navbar: { display: false },
        toolbar: { display: true },
        footer: { display: false },
        leftSidePanel: { display: false },
        rightSidePanel: { display: false },
      },
    },
  },
  routes: [
    { path: '{name}/dashboard', element: <{Feature}DashboardPage /> },
    // ... add all authenticated routes
  ],
};

export default {name}PagesConfig;
```

---

## 6. Unauthenticated Pages Config Pattern

```js
// {name}PublicPagesConfig.js  (Note: .js not .jsx — no JSX in config)

import { lazy } from 'react';

const {Feature}LandingPage = lazy(() => import('./screens/{Feature}LandingPage'));

const LAYOUT_CONFIG = {
  layout: {
    config: {
      navbar: { display: false },
      toolbar: { display: true },
      footer: { display: false },
      leftSidePanel: { display: false },
      rightSidePanel: { display: false },
    },
  },
};

const {name}PublicPagesConfig = [
  {
    path: '/{name}',
    settings: LAYOUT_CONFIG,
    element: <{Feature}LandingPage />,
  },
  // ... add all public routes
];

export default {name}PublicPagesConfig;
```

In `routesConfig.jsx`:
```js
import civicTaxPublicPagesConfig from '../main/zrootclient/buz-civictax/civicTaxPublicPagesConfig';

const routes = [
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
  ...civicTaxPublicPagesConfig,   // ← spread public routes directly
  // existing routes...
];
```

---

## 7. GIS Map (react-leaflet) Pattern

Used in `buz-security` and `buz-healthcare`.

```jsx
// components/IncidentMap.jsx

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { memo, useMemo } from 'react';

// Fix default marker icons (leaflet webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SEVERITY_COLORS = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  critical: '#9c27b0',
};

function createSeverityIcon(severity) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 16px; height: 16px; border-radius: 50%;
      background: ${SEVERITY_COLORS[severity] || '#757575'};
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ${severity === 'critical' ? 'animation: pulse 1.5s infinite;' : ''}
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function IncidentMap({ incidents = [], center = [9.0765, 7.3986], zoom = 6 }) {
  const markers = useMemo(() => incidents.map((incident) => ({
    ...incident,
    icon: createSeverityIcon(incident.severity),
  })), [incidents]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: 8 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((incident) => (
        <Marker key={incident.id} position={[incident.location.lat, incident.location.lng]} icon={incident.icon}>
          <Popup>
            <strong>{incident.category}</strong><br />
            {incident.location.address}<br />
            Severity: {incident.severity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default memo(IncidentMap);
```

---

## 8. Live/Real-Time Mock Pattern (for Governance Collation)

For screens that need "live updating" feel while in mock mode:

```js
// hooks/useElectionCollation.js (real-time mock with interval)

import { useQuery, useQueryClient } from 'react-query';
import { mockElectionResults } from '../mock';

export function useElectionCollation(electionId) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['election-collation', electionId],
    queryFn: async () => {
      if (USE_MOCK) {
        // Simulate incremental result updates by randomizing last ward count
        const results = { ...mockElectionResults };
        results.collationResults.wardResults = results.collationResults.wardResults.map((ward) => ({
          ...ward,
          results: ward.results.map((r) => ({
            ...r,
            votes: r.votes + Math.floor(Math.random() * 50),
          })),
        }));
        return { data: results };
      }
      // return axiosInstance.get(`/governance/elections/${electionId}/collation`);
    },
    refetchInterval: USE_MOCK ? 5000 : 10000, // poll every 5s in mock, 10s in real
    enabled: !!electionId,
  });
}
```

---

## 9. Test Pattern

```jsx
// __tests__/CampaignCard.test.jsx

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import CampaignCard from '../components/CampaignCard';
import { mockCampaigns } from '../mock';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('CampaignCard', () => {
  const campaign = mockCampaigns[0];

  it('renders campaign title', () => {
    render(<CampaignCard campaign={campaign} />, { wrapper });
    expect(screen.getByText(campaign.title)).toBeInTheDocument();
  });

  it('renders jurisdiction', () => {
    render(<CampaignCard campaign={campaign} />, { wrapper });
    expect(screen.getByText(campaign.jurisdiction.lga)).toBeInTheDocument();
  });

  it('renders progress percentage', () => {
    render(<CampaignCard campaign={campaign} />, { wrapper });
    const percentage = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100);
    expect(screen.getByText(`${percentage}%`)).toBeInTheDocument();
  });

  it('renders loading skeleton when loading prop passed', () => {
    render(<CampaignCard isLoading />, { wrapper });
    expect(screen.getByTestId('campaign-card-skeleton')).toBeInTheDocument();
  });
});
```

---

## 10. Shared Civic Components Location

```
src/app/main/zrootclient/civic-shared/
├── JurisdictionSelector.jsx     ← Country → State → LGA → Ward cascading selector
├── CivicModuleHeader.jsx        ← Standardized page header
├── CivicStatCard.jsx            ← Icon + number + label stat card
├── CivicEmptyState.jsx          ← Engaging empty state with illustration
├── CivicLoadingSkeleton.jsx     ← Skeleton that matches 3-section layout
├── ActivityFeedItem.jsx         ← Feed item for right sidebars
└── index.js                     ← Barrel export
```

---

## 11. Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Page shell | `{Feature}WithSidebarsContentScrollPage` | `CivicTaxDashboardWithSidebarsContentScrollPage` |
| Simple page | `{Feature}Page` | `MakeTaxContributionPage` |
| Shared component | `{Feature}{Purpose}` | `CampaignProgressBar` |
| Hook | `use{Feature}Repo` | `useCivicTaxRepo` |
| Mock data | `mock{Entity}s` | `mockCampaigns` |
| Auth config | `{name}PagesConfig` | `civicTaxPagesConfig` |
| Public config | `{name}PublicPagesConfig` | `civicTaxPublicPagesConfig` |
| Test file | `{ComponentName}.test.jsx` | `CampaignCard.test.jsx` |

---

## 12. Adding a New Module to routesConfig.jsx

When a new module is ready, add these two lines to `routesConfig.jsx`:

```js
// In routeConfigs array (authenticated)
import civicTaxPagesConfig from '../main/zrootclient/buz-civictax/civicTaxPagesConfig';
// ...
const routeConfigs = [
  // ...existing configs,
  civicTaxPagesConfig,   // ← ADD HERE
];

// In routes array (unauthenticated) 
import civicTaxPublicPagesConfig from '../main/zrootclient/buz-civictax/civicTaxPublicPagesConfig';
// ...
const routes = [
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
  ...civicTaxPublicPagesConfig,   // ← ADD HERE (spread)
  // ...existing public routes
];
```

---

## 13. UX Design Principles for Civic Screens

These apply to every screen in every civic module:

1. **Jurisdiction always visible** — The user should always see which Country/State/LGA they're looking at. Show it in the header or as a persistent chip.

2. **Empty states are opportunities** — Never show a blank page. Always show an engaging empty state that explains what the section does and prompts action.

3. **Loading is part of the experience** — Use skeleton loaders, never spinners alone. Each skeleton should match the shape of the loaded content.

4. **Numbers tell stories** — Stats (₦23M raised, 847 contributors, 12 active campaigns) should be prominent and animated (use framer-motion for number counting).

5. **Framer-motion for page transitions** — Every screen fade/slide in. Use `AnimatePresence` and `motion.div` on top-level page containers.

6. **Right sidebar = live intelligence** — The right sidebar shows real-time stats, recent activity, and contextual quick actions. It should always feel "alive."

7. **Mobile-first collapsing** — On mobile, both sidebars collapse. Content expands to full width. Navigation uses a bottom sheet or FAB.
==========================================================================================================================================================================================


Product-document:
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
=========================================================================================================================================================

Progress-tracker:
# AfricanShops Civic Platform — Progress Tracker

**Last Updated:** June 4, 2026 (ALL 6 MODULES COMPLETE ✅ — All screens, routes, and mock data built for healthcare + youthsports)  
**Target:** All 6 modules mocked and functional by June 30, 2026

Legend: `[ ]` Not Started | `[~]` In Progress | `[x]` Complete

---

## Phase 1 — Foundation (Jun 4–11) ✅ COMPLETE

### Documents & Architecture
- [x] Product document (`civic-platform-product-doc.md`)
- [x] Implementation guide (`civic-platform-implementation-guide.md`)
- [x] Progress tracker (`civic-platform-progress-tracker.md`)
- [x] `civic-shared/` folder — shared components
  - [x] `JurisdictionSelector.jsx`
  - [x] `CivicStatCard.jsx`
  - [x] `CivicEmptyState.jsx`
  - [x] `CivicLoadingSkeleton.jsx`
  - [x] `ActivityFeedItem.jsx`
  - [x] `index.js` (barrel export)

### Mock Data Layer
- [x] `buz-civictax/mock/` — mockCampaigns, mockContributions, mockLgaProjects
- [x] `buz-security/mock/` — mockIncidents, mockOfficers
- [ ] `buz-governance/mock/` — mockElections, mockCandidates, mockCollationResults, mockPetitions
- [ ] `buz-social/mock/` — mockIssues, mockComments, mockLeaders, mockProjects
- [ ] `buz-healthcare/mock/` — mockFacilities, mockPractitioners, mockAppointments, mockHealthAlerts
- [ ] `buz-youthsports/mock/` — mockPrograms, mockTalents, mockTournaments, mockMentors

---

## Phase 2 — Tax & Security (Jun 12–18) ✅ COMPLETE

### MODULE 1: `buz-civictax` (Voluntary Civic Tax) ✅

#### Live Screen URLs
| Screen | URL | Auth | Notes |
|---|---|---|---|
| Civic Tax Landing | `http://localhost:5174/civictax` | Public | Hero, categories, featured campaigns, CTA |
| Browse Campaigns | `http://localhost:5174/civictax/campaigns` | Auth | 3-section: filter sidebar, card grid, stats right |
| Campaign Detail | `http://localhost:5174/civictax/campaigns/camp_001/view` | Auth | Contribution form + project tracker |
| My Contributions | `http://localhost:5174/civictax/my-contributions` | Auth | History list + receipts + stats |
| LGA Project Tracker | `http://localhost:5174/civictax/projects` | Auth | Live milestones, contractor updates |
| Contribution Receipt | `http://localhost:5174/civictax/TXN-2026-001847/receipt` | Auth | Animated receipt + impact message |

#### Folder Scaffold
- [x] `buz-civictax/` folder
- [x] `screens/` subfolder
- [x] `components/` subfolder
- [x] `hooks/useCivicTaxRepo.js`
- [x] `civicTaxPagesConfig.jsx` (authenticated)
- [x] `civicTaxPublicPagesConfig.jsx` (public — no settings)
- [x] Registered in `routesConfig.jsx`

#### Public Screens
- [x] `CivicTaxLandingPage` → `/civictax`
- [x] `CampaignsBrowseWithSidebarsPage` → `/civictax/campaigns` (also serves as auth main)

#### Authenticated Screens
- [x] `CampaignsBrowseWithSidebarsPage` → `civictax/campaigns`
- [x] `CampaignDetailPage` → `civictax/campaigns/:campaignId/view`
- [x] `MyContributionsPage` → `civictax/my-contributions`
- [x] `LgaProjectTrackerPage` → `civictax/projects`
- [x] `ContributionReceiptPage` → `civictax/:transactionId/receipt`
- [ ] `CivicTaxDashboardPage` → `civictax/dashboard` ← still pending

#### Components
- [x] `CampaignCard`
- [x] `CampaignProgressBar`
- [x] `ContributionForm`
- [x] `ProjectMilestoneTimeline`

#### Tests
- [x] `CampaignCard.test.jsx`
- [x] `CampaignProgressBar.test.jsx`
- [x] `CivicTaxLandingPage.test.jsx`

---

### MODULE 2: `buz-security` (Security Operations Center) ✅

#### Live Screen URLs
| Screen | URL | Auth | Notes |
|---|---|---|---|
| Public Security Map | `http://localhost:5174/security/map` | Public | Dark GIS map, public incidents, category filters, LIVE badge |
| SOC Dashboard | `http://localhost:5174/security/soc/dashboard` | Auth (SOC) | Dark 3-section: filter sidebar, full map/list, triage queue |
| Report Incident | `http://localhost:5174/security/report-incident` | Auth | 4-step wizard: location → type → description → review |
| My Reports | `http://localhost:5174/security/my-reports` | Auth | Submitted reports list + stats + emergency footer |

#### Folder Scaffold
- [x] `buz-security/` folder
- [x] `screens/` subfolder
- [x] `components/` subfolder
- [x] `hooks/useSecurityRepo.js`
- [x] `securityPagesConfig.jsx` (authenticated)
- [x] `securityPublicPagesConfig.jsx` (public — no settings)
- [x] Registered in `routesConfig.jsx`

#### Public Screens
- [x] `SecurityMapPublicPage` → `/security/map`

#### Authenticated Screens (Citizen)
- [x] `ReportIncidentPage` → `security/report-incident`
- [x] `MyReportsPage` → `security/my-reports`
- [ ] `ReportDetailPage` → `security/reports/:reportId/view` ← pending
- [ ] `MySafetyZonePage` → `security/my-safety-zone` ← pending

#### Authenticated Screens (SOC Operator)
- [x] `SocDashboardWithSidebarsPage` → `security/soc/dashboard`
- [ ] `SocReportsPage` → `security/soc/reports` ← pending

#### Components
- [x] `IncidentMap` (react-leaflet, CircleMarker, dark + standard tile variants)
- [x] `IncidentCard` (full + compact variants)
- [x] `SeverityBadge` (sm/md/lg sizes, pulse animation for critical)
- [x] `IncidentTimeline` (event log, full + compact)
- [ ] `MySafetyZoneMap` ← pending

#### Tests
- [x] `SeverityBadge.test.jsx`
- [x] `IncidentCard.test.jsx`
- [x] `SecurityMapPublicPage.test.jsx`

---

## Phase 3 — Governance & Social (Jun 19–25) ⏳ IN PROGRESS

### MODULE 3: `buz-governance` (Digital Governance & Elections) ✅

#### Folder Scaffold
- [x] `buz-governance/` folder
- [x] `governancePagesConfig.jsx`
- [x] `governancePublicPagesConfig.jsx`
- [x] Registered in `routesConfig.jsx`

#### Public Screens
- [x] `GovernanceLandingPage` → `/governance`
- [x] `ElectionListPublicPage` → `/governance/elections`
- [x] `ElectionDetailPublicPage` → `/governance/elections/:electionId/live`

#### Authenticated Screens (Citizen)
- [x] `GovernanceDashboardWithSidebarsPage` → `governance/dashboard`
- [x] `VotingPortalPage` → `governance/elections/:electionId/vote`
- [x] `CitizenParticipationPage` → `governance/participate`
- [x] `PetitionDetailPage` → `governance/petitions/:petitionId`
- [x] `MyVotingHistoryPage` → `governance/my-votes`

#### Authenticated Screens (Officials)
- [x] `CollationCenterPage` → `governance/elections/:electionId/collation`
- [x] `ElectionOversightPage` → `governance/elections/:electionId/oversight`
- [x] `CollationAuditPage` → `governance/elections/:electionId/audit`

#### Components
- [x] `LiveCollationBoard` (ApexCharts real-time — refetchInterval 5s)
- [x] `CandidateCard`
- [x] `VotingBallot`
- [x] `CollationEntryForm`
- [x] `JurisdictionResultsMap` (Leaflet CircleMarker coloring)

#### Tests
- [x] `CandidateCard.test.jsx`
- [x] `LiveCollationBoard.test.jsx`
- [x] `GovernanceLandingPage.test.jsx`

---

### MODULE 4: `buz-social` (Community Social Engagement) [~] IN PROGRESS

#### Folder Scaffold
- [x] `buz-social/` folder
- [x] `socialPagesConfig.jsx`
- [x] `socialPublicPagesConfig.jsx`
- [x] Registered in `routesConfig.jsx`

#### Public Screens
- [x] `CommunityLandingPage` → `/community`
- [x] `CommunityFeedPublicPage` → `/community/feed`

#### Authenticated Screens
- [x] `CommunityFeedWithSidebarsPage` → `community/feed`
- [x] `CreateIssuePage` → `community/create-issue`
- [x] `IssueDetailPage` → `community/issues/:issueId`
- [x] `ResolvedIssuesPage` → `community/resolved`
- [x] `LocalLeadersPage` → `community/leaders`
- [x] `CommunityProjectsPage` → `community/projects`
- [x] `ProjectDetailPage` → `community/projects/:projectId`
- [x] `MyEngagementPage` → `community/my-engagement`

#### Components
- [x] `IssueCard`
- [x] `IssueFeed` (react-virtuoso virtualized list)
- [x] `IssueCommentThread`
- [x] `CommunityProjectCard`
- [x] `StatusBadge`

#### Tests
- [x] `IssueCard.test.jsx`
- [x] `CommunityFeedPage.test.jsx`
- [x] `CreateIssuePage.test.jsx`

---

## Phase 4 — Healthcare & Youth (Jun 26–30) ✅ COMPLETE

### MODULE 5: `buz-healthcare` (Primary Healthcare)

#### Folder Scaffold
- [x] `buz-healthcare/` folder
- [x] `healthcarePagesConfig.jsx`
- [x] `healthcarePublicPagesConfig.jsx`
- [x] Registered in `routesConfig.jsx`

#### Public Screens
- [x] `HealthcareLandingPage` → `/healthcare`

#### Authenticated Screens
- [x] `HealthcareDashboardWithSidebarsPage` → `healthcare/dashboard`
- [x] `FacilityDetailPage` → `healthcare/facility/:facilityId`
- [x] `AppointmentBookingPage` → `healthcare/book`
- [x] `MyAppointmentsPage` → `healthcare/my-appointments`
- [x] `HealthAlertsPage` → `healthcare/alerts`

#### Shared Components
- [x] `HealthcareHeader`
- [x] `HealthcareSidebarLeft` (with type/NHIS filters)
- [x] `HealthcareSidebarRight` (stats + alerts + emergency contacts)
- [x] `HealthcareDashboardContent`

---

### MODULE 6: `buz-youthsports` (Youth & Sports Development)

#### Folder Scaffold
- [x] `buz-youthsports/` folder
- [x] `youthsportsPagesConfig.jsx`
- [x] `youthsportsPublicPagesConfig.jsx`
- [x] Registered in `routesConfig.jsx`

#### Public Screens
- [x] `YouthSportsLandingPage` → `/youth`
- [x] `YouthSportsDashboardWithSidebarsPage` → `/youth/programs` (public browse)

#### Authenticated Screens
- [x] `YouthSportsDashboardWithSidebarsPage` → `youth/dashboard`
- [x] `ProgramDetailPage` → `youth/programs/:programId`
- [x] `TournamentsPage` → `youth/tournaments`
- [x] `TalentsPage` → `youth/talents`
- [x] `MentorsPage` → `youth/mentors`

#### Shared Components
- [x] `YouthSportsHeader`
- [x] `YouthSportsSidebarLeft` (category/status filters)
- [x] `YouthSportsSidebarRight` (stats + live tournaments)
- [x] `YouthSportsDashboardContent`

---

## Overall Progress Summary

| Module | Screens Built | Components | Status |
|---|---|---|---|
| `civic-shared` | — | 5 shared components | [x] |
| `buz-civictax` | 5 screens | 4 components | [x] |
| `buz-security` | 4 screens | 4 components | [x] |
| `buz-governance` | 11 screens | 5 components | [x] |
| `buz-social` | 10 screens | 5 components | [x] |
| `buz-healthcare` | 5 screens | 4 shared components | [x] ✅ |
| `buz-youthsports` | 5 screens | 4 shared components | [x] ✅ |
| **Total** | **40 screens** | **31 components** | **6/6 modules complete** |

---

## Architecture Decisions Locked

| Decision | Choice | Reason |
|---|---|---|
| Map provider | `react-leaflet` + leaflet | Already installed, no API key |
| Map tiles (public) | OpenStreetMap | Free, no key |
| Map tiles (SOC) | CartoDB Dark All | Ops-center aesthetic |
| Marker type | `CircleMarker` (not `Marker`) | Avoids Webpack/Vite default icon bug |
| Civic roles | Defined in product doc | Backend to implement |
| Public route layout | No `settings` object | Prevents Fuse gray background container |
| Font sizing | `clamp()` fluid scaling | See typography memory |
| Layout responsiveness | CSS Grid `auto-fill minmax` | See responsive design memory |

---

## Notes

- All screens use mock data with `USE_MOCK = true` until APIs are ready
- All imports from `civic-shared` use relative paths (no alias) — Docker-safe
- Public landing pages use no `settings` in route config — prevents Fuse gray background
- `react-apexcharts` will be used for `LiveCollationBoard` in `buz-governance`
- `react-virtuoso` for long lists in `buz-social` feed
- Every main module page must pass `ServiceStatusLandingPage` check

=======================================================================================================================

 The above guide,product document, and progess tracker are additions to our africanshops project where we hope to drive community service and citizens engagement to enable all users on the platfrom take ownership of their localities and environments. It becam really imminent to get thes added and functional which is why we have drafted these documents and developed the pioonering screens on the front end to begin to forge engagements for all user concers. So this is to be a civic-platform with several modules that will be treaded and handled so as to build-test-release in stages. the modules are

 1. civic-tax : which consists of project-tax-campaigns which is voluntary and the a compulsory-tax functionality where users pay their monthly taxes. These monthly taxes are compulsory and can be splitted into two regions/LGAs where the civicuser chooses, The civicuser is a tpe of the user model that when instanciated has the permissions to engage in all civic activities ranging from civic tax, governance,  security, social, healtcare and youthsports and other modules to come like education, etc and only verified user with their kyc updated can be able to become civic users. Now civic users will also have its own type of users that are civicuserdoctors,civicusercandidates for the governance section where they can be president,governors, etc, civicusercraftman for users who will be providing different craft services and hope to find jobs on the platform, civicusersecurityofficer which can be private security, communitysecurity, government forces security etc. So the core functionalities of this civictax is to have functionalities that enable users pay compulsory taxes, being able to split these tax paid between their resident LGA and LGA place of origin while a percentage(5% => to be dynamic, goes to the platfrom as developer funding to be used by the founders of this platform to fund all IT-works to keep the platform running efficiently and also train other younger developers), this is geared at encouraging users to take charge and ownership of their environments around which they thrive in. the following are mock datas used to craft the front ends to give a tip of what has been developed on the frontend: [
    export const mockCampaigns = [
  {
    id: 'camp_001',
    title: 'Eti-Osa Security & Street Light Initiative',
    slug: 'eti-osa-security-street-light-2026',
    category: 'security',
    jurisdiction: { country: 'Nigeria', countryId: 'ng', state: 'Lagos', stateId: 'lag', lga: 'Eti-Osa', lgaId: 'eti-osa' },
    targetAmount: 5000000,
    raisedAmount: 2847500,
    contributorsCount: 847,
    deadline: '2026-08-31',
    status: 'active',
    priority: 'high',
    description:
      'Funding for 200 solar-powered street lights and a 24-hour community security patrol network across all wards in Eti-Osa LGA. Every naira raised goes directly to certified vendors and trained local security personnel.',
    impactStatement: '200 street lights. 24-hour patrol. Safer homes for 280,000 residents.',
    projects: [
      {
        id: 'proj_001',
        title: 'Phase 1: Street Light Installation (Wards 1–5)',
        status: 'in_progress',
        completionPercentage: 65,
        budget: 1500000,
        spent: 980000,
        updatedAt: '2026-05-28',
      },
      {
        id: 'proj_002',
        title: 'Phase 2: Security Patrol Setup',
        status: 'upcoming',
        completionPercentage: 0,
        budget: 2000000,
        spent: 0,
        updatedAt: '2026-05-01',
      },
    ],
    coverImage: null,
    createdAt: '2026-05-01T00:00:00Z',
    organizer: { name: 'Eti-Osa LGA Civic Board', verified: true },
    tags: ['security', 'infrastructure', 'lighting'],
  },
  {
    id: 'camp_002',
    title: 'Ibadan North Agricultural Revival Fund',
    slug: 'ibadan-north-agric-revival-2026',
    category: 'agriculture',
    jurisdiction: { country: 'Nigeria', countryId: 'ng', state: 'Oyo', stateId: 'oyo', lga: 'Ibadan North', lgaId: 'ibadan-north' },
    targetAmount: 8000000,
    raisedAmount: 5210000,
    contributorsCount: 1234,
    deadline: '2026-09-30',
    status: 'active',
    priority: 'high',
    description:
      'Restoring 500 hectares of farmland with subsidized fertilizers, modern irrigation, and cooperative market access for 320 smallholder farmers in Ibadan North.',
    impactStatement: '500 hectares. 320 farmers. Food security for the region.',
    projects: [
      {
        id: 'proj_003',
        title: 'Fertilizer Distribution — Phase 1',
        status: 'completed',
        completionPercentage: 100,
        budget: 2000000,
        spent: 1980000,
        updatedAt: '2026-05-15',
      },
      {
        id: 'proj_004',
        title: 'Irrigation Infrastructure',
        status: 'in_progress',
        completionPercentage: 42,
        budget: 3500000,
        spent: 1470000,
        updatedAt: '2026-05-30',
      },
    ],
    coverImage: null,
    createdAt: '2026-04-10T00:00:00Z',
    organizer: { name: 'Oyo State Agric Development Board', verified: true },
    tags: ['agriculture', 'food-security', 'farmers'],
  },
  {
    id: 'camp_003',
    title: 'Abuja Municipal Roads Maintenance Fund',
    slug: 'abuja-mun-roads-2026',
    category: 'infrastructure',
    jurisdiction: { country: 'Nigeria', countryId: 'ng', state: 'FCT Abuja', stateId: 'fct', lga: 'Abuja Municipal', lgaId: 'abuja-mun' },
    targetAmount: 12000000,
    raisedAmount: 3600000,
    contributorsCount: 420,
    deadline: '2026-10-15',
    status: 'active',
    priority: 'medium',
    description:
      'Patching and resurfacing 18km of critical inner-city roads in Abuja Municipal Area Council. Works include drainage clearing and road marking renewal.',
    impactStatement: '18km of roads. 3 major routes restored. 500,000 commuters impacted.',
    projects: [
      {
        id: 'proj_005',
        title: 'Route A: Airport Road Patch Works',
        status: 'in_progress',
        completionPercentage: 30,
        budget: 4000000,
        spent: 1200000,
        updatedAt: '2026-05-25',
      },
    ],
    coverImage: null,
    createdAt: '2026-04-22T00:00:00Z',
    organizer: { name: 'AMAC Community Development Fund', verified: true },
    tags: ['roads', 'infrastructure', 'transport'],
  },
  {
    id: 'camp_004',
    title: 'Kano Municipal Primary Health Fund',
    slug: 'kano-mun-primary-health-2026',
    category: 'health',
    jurisdiction: { country: 'Nigeria', countryId: 'ng', state: 'Kano', stateId: 'kano', lga: 'Kano Municipal', lgaId: 'kano-mun' },
    targetAmount: 6500000,
    raisedAmount: 6500000,
    contributorsCount: 2100,
    deadline: '2026-06-30',
    status: 'completed',
    priority: 'high',
    description:
      'Fully stocking 12 primary health centres in Kano Municipal with essential medicines, vaccines, and diagnostic equipment. ACHIEVED!',
    impactStatement: '12 health centres. 120,000 patients served annually.',
    projects: [
      {
        id: 'proj_006',
        title: 'Medical Supplies Procurement',
        status: 'completed',
        completionPercentage: 100,
        budget: 4000000,
        spent: 3980000,
        updatedAt: '2026-05-10',
      },
      {
        id: 'proj_007',
        title: 'Equipment Installation',
        status: 'completed',
        completionPercentage: 100,
        budget: 2500000,
        spent: 2490000,
        updatedAt: '2026-05-20',
      },
    ],
    coverImage: null,
    createdAt: '2026-03-01T00:00:00Z',
    organizer: { name: 'Kano State PHC Board', verified: true },
    tags: ['health', 'medicine', 'primary-care'],
  },
  {
    id: 'camp_005',
    title: 'Port Harcourt Flood Mitigation Drains',
    slug: 'ph-flood-mitigation-2026',
    category: 'infrastructure',
    jurisdiction: { country: 'Nigeria', countryId: 'ng', state: 'Rivers', stateId: 'rivers', lga: 'Port Harcourt', lgaId: 'ph-city' },
    targetAmount: 9000000,
    raisedAmount: 1350000,
    contributorsCount: 198,
    deadline: '2026-11-30',
    status: 'active',
    priority: 'critical',
    description:
      'Constructing and clearing 8km of storm drainage channels in the most flood-prone wards of Port Harcourt City to prevent annual disaster-level flooding.',
    impactStatement: '8km drainage. 45,000 households protected from annual floods.',
    projects: [
      {
        id: 'proj_008',
        title: 'Drainage Clearing — Diobu Ward',
        status: 'upcoming',
        completionPercentage: 0,
        budget: 3000000,
        spent: 0,
        updatedAt: '2026-05-01',
      },
    ],
    coverImage: null,
    createdAt: '2026-05-10T00:00:00Z',
    organizer: { name: 'PH City Environmental Board', verified: false },
    tags: ['flood', 'drainage', 'environment'],
  },
  {
    id: 'camp_006',
    title: 'Enugu North Youth Skills Centre',
    slug: 'enugu-north-youth-skills-2026',
    category: 'education',
    jurisdiction: { country: 'Nigeria', countryId: 'ng', state: 'Enugu', stateId: 'enugu', lga: 'Enugu North', lgaId: 'enugu-north' },
    targetAmount: 4000000,
    raisedAmount: 2800000,
    contributorsCount: 670,
    deadline: '2026-08-15',
    status: 'active',
    priority: 'medium',
    description:
      'Building and equipping a modern vocational training centre for 300 youth per year in welding, tailoring, tech repair, and digital skills.',
    impactStatement: '300 youth trained per year. 1 modern skills centre built.',
    projects: [
      {
        id: 'proj_009',
        title: 'Building Construction — Foundation to Roof',
        status: 'in_progress',
        completionPercentage: 70,
        budget: 2500000,
        spent: 1750000,
        updatedAt: '2026-05-22',
      },
    ],
    coverImage: null,
    createdAt: '2026-03-15T00:00:00Z',
    organizer: { name: 'Enugu North LGA Education Fund', verified: true },
    tags: ['youth', 'skills', 'education', 'vocational'],
  },
];

export const CAMPAIGN_CATEGORIES = [
  { id: 'security', label: 'Security', color: '#dc2626', bgColor: '#fee2e2', icon: '🛡️' },
  { id: 'agriculture', label: 'Agriculture', color: '#16a34a', bgColor: '#dcfce7', icon: '🌾' },
  { id: 'infrastructure', label: 'Infrastructure', color: '#2563eb', bgColor: '#dbeafe', icon: '🏗️' },
  { id: 'health', label: 'Health', color: '#7c3aed', bgColor: '#ede9fe', icon: '🏥' },
  { id: 'education', label: 'Education', color: '#d97706', bgColor: '#fef3c7', icon: '📚' },
  { id: 'environment', label: 'Environment', color: '#059669', bgColor: '#d1fae5', icon: '🌿' },
];

export const CAMPAIGN_STATS = {
  totalCampaigns: 6,
  activeCampaigns: 4,
  totalRaised: 22307500,
  totalContributors: 5469,
  completedCampaigns: 1,
  totalTarget: 44500000,
};
all payments on compulsory taxes must go through the ledger service after confrimed from the fintech service where the different streams of inflow coming in either from paystack, flutterwaye, stripe etc. Also, wallets should be provisioned for all COUNRTY, STATE, LGA. The sharing formulas for compulsory taxes payed will be  10% to federal, 20% to states and 70% to LGAs. These payments must be plit and sent to all country, state and LGA wallets where they can be spent for for projects the citizens with valid decision making legibility have decided to engage in. Every transaction must go through the kedger. Wallets for country state, and LGAs should have a separate account code , type etc so ass to clearly identify the type of account being operated at any point in time. Wile civictaxcampaigns funds goes directly to the campaigns untouched and should be logged as campaigns under the LGA, State oe Country level of governance, so a more intelligent way can be provisioned as regards the accounts and wallets that will hold these funds cos these a accounts and funds that have a life cycle and ends the moment those civic tasks are completed eg: fixing a delapidated bridge
--------------
export const mockContributions = [
  {
    id: 'contrib_001',
    transactionId: 'TXN-2026-001847',
    campaignId: 'camp_001',
    campaignTitle: 'Eti-Osa Security & Street Light Initiative',
    campaignCategory: 'security',
    amount: 10000,
    message: 'Our community deserves safety. Happy to contribute!',
    status: 'successful',
    paymentMethod: 'paystack',
    receipt: true,
    createdAt: '2026-05-28T11:24:00Z',
    jurisdiction: { state: 'Lagos', lga: 'Eti-Osa' },
  },
  {
    id: 'contrib_002',
    transactionId: 'TXN-2026-001523',
    campaignId: 'camp_002',
    campaignTitle: 'Ibadan North Agricultural Revival Fund',
    campaignCategory: 'agriculture',
    amount: 25000,
    message: 'Supporting our farmers is supporting our future.',
    status: 'successful',
    paymentMethod: 'paystack',
    receipt: true,
    createdAt: '2026-05-20T09:15:00Z',
    jurisdiction: { state: 'Oyo', lga: 'Ibadan North' },
  },
  {
    id: 'contrib_003',
    transactionId: 'TXN-2026-001102',
    campaignId: 'camp_004',
    campaignTitle: 'Kano Municipal Primary Health Fund',
    campaignCategory: 'health',
    amount: 5000,
    message: null,
    status: 'successful',
    paymentMethod: 'paystack',
    receipt: true,
    createdAt: '2026-05-10T14:40:00Z',
    jurisdiction: { state: 'Kano', lga: 'Kano Municipal' },
  },
  {
    id: 'contrib_004',
    transactionId: 'TXN-2026-000891',
    campaignId: 'camp_006',
    campaignTitle: 'Enugu North Youth Skills Centre',
    campaignCategory: 'education',
    amount: 15000,
    message: 'Investing in our youth today builds a stronger tomorrow.',
    status: 'successful',
    paymentMethod: 'paystack',
    receipt: true,
    createdAt: '2026-04-30T16:05:00Z',
    jurisdiction: { state: 'Enugu', lga: 'Enugu North' },
  },
  {
    id: 'contrib_005',
    transactionId: 'TXN-2026-000344',
    campaignId: 'camp_003',
    campaignTitle: 'Abuja Municipal Roads Maintenance Fund',
    campaignCategory: 'infrastructure',
    amount: 50000,
    message: 'These roads are a disgrace. Let\'s fix them ourselves.',
    status: 'successful',
    paymentMethod: 'paystack',
    receipt: true,
    createdAt: '2026-04-25T10:30:00Z',
    jurisdiction: { state: 'FCT Abuja', lga: 'Abuja Municipal' },
  },
];

export const mockMyContributionStats = {
  totalContributed: 105000,
  totalCampaigns: 5,
  totalImpacted: 3,
  badges: ['Early Contributor', 'Community Champion', 'Multi-Sector'],
};
------------
export const mockLgaProjects = [
  {
    id: 'lga_proj_001',
    title: 'Eti-Osa Street Light Phase 1',
    campaignId: 'camp_001',
    campaignTitle: 'Eti-Osa Security & Street Light Initiative',
    lga: 'Eti-Osa',
    state: 'Lagos',
    category: 'security',
    status: 'in_progress',
    completionPercentage: 65,
    budget: 1500000,
    spent: 980000,
    contractor: 'Solaris Nigeria Ltd.',
    contractorVerified: true,
    startDate: '2026-05-05',
    expectedEndDate: '2026-06-20',
    milestones: [
      { id: 'm1', title: 'Site Survey & Design Approval', status: 'completed', date: '2026-05-07', evidence: 'survey_report.pdf' },
      { id: 'm2', title: 'Procurement of 200 Solar Lights', status: 'completed', date: '2026-05-14', evidence: 'delivery_note.pdf' },
      { id: 'm3', title: 'Installation — Wards 1 & 2', status: 'completed', date: '2026-05-22', evidence: 'photo_ward1.jpg' },
      { id: 'm4', title: 'Installation — Wards 3, 4 & 5', status: 'in_progress', date: null, evidence: null },
      { id: 'm5', title: 'Quality Inspection & Sign-Off', status: 'upcoming', date: null, evidence: null },
    ],
    updates: [
      { id: 'u1', date: '2026-05-28', text: 'Installation of Ward 3 lights is 80% complete. Expected to finish by June 2nd.', by: 'Project Manager' },
      { id: 'u2', date: '2026-05-15', text: 'All 200 solar light units received from Solaris Nigeria. Delivery verified by community reps.', by: 'Project Manager' },
    ],
  },
  {
    id: 'lga_proj_002',
    title: 'Ibadan North Fertilizer Distribution',
    campaignId: 'camp_002',
    campaignTitle: 'Ibadan North Agricultural Revival Fund',
    lga: 'Ibadan North',
    state: 'Oyo',
    category: 'agriculture',
    status: 'completed',
    completionPercentage: 100,
    budget: 2000000,
    spent: 1980000,
    contractor: 'Oyo Agric Cooperative',
    contractorVerified: true,
    startDate: '2026-04-15',
    expectedEndDate: '2026-05-15',
    milestones: [
      { id: 'm1', title: 'Farmer Registration & Verification', status: 'completed', date: '2026-04-18', evidence: 'farmer_register.pdf' },
      { id: 'm2', title: 'Fertilizer Procurement (320 farmers)', status: 'completed', date: '2026-04-28', evidence: 'procurement.pdf' },
      { id: 'm3', title: 'Distribution to All Registered Farmers', status: 'completed', date: '2026-05-14', evidence: 'distribution_photos.zip' },
      { id: 'm4', title: 'Impact Assessment & Reporting', status: 'completed', date: '2026-05-20', evidence: 'impact_report.pdf' },
    ],
    updates: [
      { id: 'u1', date: '2026-05-20', text: 'COMPLETED. 320 farmers received fertilizer. Impact report published — 98% satisfaction rate.', by: 'Project Coordinator' },
    ],
  },
  {
    id: 'lga_proj_003',
    title: 'Ibadan North Irrigation Infrastructure',
    campaignId: 'camp_002',
    campaignTitle: 'Ibadan North Agricultural Revival Fund',
    lga: 'Ibadan North',
    state: 'Oyo',
    category: 'agriculture',
    status: 'in_progress',
    completionPercentage: 42,
    budget: 3500000,
    spent: 1470000,
    contractor: 'WaterFlow Engineering',
    contractorVerified: true,
    startDate: '2026-05-01',
    expectedEndDate: '2026-07-30',
    milestones: [
      { id: 'm1', title: 'Site Survey & Engineering Design', status: 'completed', date: '2026-05-05', evidence: 'engineering_plans.pdf' },
      { id: 'm2', title: 'Borehole Drilling (4 sites)', status: 'in_progress', date: null, evidence: null },
      { id: 'm3', title: 'Pipe Network Installation', status: 'upcoming', date: null, evidence: null },
      { id: 'm4', title: 'Pump Installation & Testing', status: 'upcoming', date: null, evidence: null },
    ],
    updates: [
      { id: 'u1', date: '2026-05-30', text: '2 of 4 boreholes drilled successfully. Water quality tests passed. Work on sites 3 & 4 begins Monday.', by: 'WaterFlow Engineering' },
    ],
  },
];
--------------------------------------------
const MOCK_PROFILE = {
  homeOrigin:    { lga: 'Ijebu-Ode',   state: 'Ogun State'   },
  dwelling:      { lga: 'Eti-Osa',     state: 'Lagos State'  },
  splitRatio:    { homeOrigin: 40, dwelling: 60 },
  complianceScore: 88,
  totalPaidThisYear: 36_500,
  lastPaymentDate: '2026-03-12',
};

const MOCK_OBLIGATIONS = [
  {
    id: 'obl-001', name: 'Annual Civic Development Levy', category: 'infrastructure',
    icon: '🏗️', amount: 18_000, dueDate: '2026-06-20', status: 'overdue',
    description: 'Funds road maintenance, drainage, and utility infrastructure across both your LGAs.',
    splitBreakdown: { homeOrigin: 7_200, dwelling: 10_800 },
  },
  {
    id: 'obl-002', name: 'Community Security Contribution', category: 'security',
    icon: '🛡️', amount: 9_500, dueDate: '2026-07-05', status: 'due_soon',
    description: 'Funds local security patrols, CCTV infrastructure, and emergency response units.',
    splitBreakdown: { homeOrigin: 3_800, dwelling: 5_700 },
  },
  {
    id: 'obl-003', name: 'Primary Healthcare Fund', category: 'health',
    icon: '🏥', amount: 6_000, dueDate: '2026-08-01', status: 'upcoming',
    description: 'Supports PHC centres, mobile clinics, and medicine procurement in your registered LGAs.',
    splitBreakdown: { homeOrigin: 2_400, dwelling: 3_600 },
  },
  {
    id: 'obl-004', name: 'Education Infrastructure Levy', category: 'education',
    icon: '📚', amount: 7_500, dueDate: '2026-09-15', status: 'upcoming',
    description: 'Builds and renovates public schools, libraries, and skill acquisition centres.',
    splitBreakdown: { homeOrigin: 3_000, dwelling: 4_500 },
  },
];

const MOCK_HISTORY = [
  { id: 'h-001', name: 'Annual Civic Development Levy',   amount: 18_000, paidDate: '2025-06-10', txId: 'CTAX-250610-A1B2', status: 'successful' },
  { id: 'h-002', name: 'Community Security Contribution', amount: 9_500,  paidDate: '2025-07-02', txId: 'CTAX-250702-C3D4', status: 'successful' },
  { id: 'h-003', name: 'Primary Healthcare Fund',         amount: 6_000,  paidDate: '2025-08-08', txId: 'CTAX-250808-E5F6', status: 'successful' },
  { id: 'h-004', name: 'Education Infrastructure Levy',   amount: 7_500,  paidDate: '2025-09-20', txId: 'CTAX-250920-G7H8', status: 'successful' },
  { id: 'h-005', name: 'Annual Civic Development Levy',   amount: 16_500, paidDate: '2024-06-14', txId: 'CTAX-240614-I9J0', status: 'successful' },
];

const GOVERNANCE_RIGHTS = [
  { icon: HowToVote, label: 'Vote in LGA Elections',   desc: 'Cast ballots in local government elections for both registered LGAs.' },
  { icon: Forum,     label: 'Community Issue Reports', desc: 'Submit, upvote, and comment on infrastructure issues in your LGAs.' },
  { icon: Build,     label: 'Project Proposals',       desc: 'Propose and vote on community development projects.' },
  { icon: Assessment,label: 'Budget Review Access',    desc: 'Review and comment on LGA budget allocations and expenditure reports.' },
];

const STATUS_CONFIG = {
  overdue:   { label: 'Overdue',   bg: '#fee2e2', color: '#991b1b', icon: Warning,   pulse: true  },
  due_soon:  { label: 'Due Soon',  bg: '#fff7ed', color: '#c2410c', icon: Schedule,  pulse: false },
  upcoming:  { label: 'Upcoming',  bg: '#f0fdf4', color: '#15803d', icon: Schedule,  pulse: false },
  successful:{ label: 'Paid',      bg: '#dcfce7', color: '#166534', icon: CheckCircle,pulse: false },
}; 
 ]
 These are just guides so we can full integrate all features required to get this ver efficiently implementd for the frontend to integrate seamlessly

2. Security Map:: So this is to be a security operation center where security flashpoints can be seen on the map. The idea is to have a quick incident reporting stream that picks the location(latitude, longitude) of the reporter from the browser or mobile device and establish a GPS/GIS pointer on the map to show the location of this incident so tha security operatives on the platform with the loes od civicusersecurity... can swing into actions to salvage the situation. An expansion of this platform is to have surveilance dron fields where surveilance drones can always fly from to give on-prem surveilance on these security flashpoint location which will be authorized by the administrative actions so tha we can have eyes in the sky to cobver these incidents and give leads to the security operatives handling these incidents with communications between the drones and our security operation center dasboards: mock datas used so far are: [
    export const mockIncidents = [
  {
    id: 'inc_001',
    category: 'armed_robbery',
    severity: 'high',
    status: 'active',
    location: { lat: 6.4310, lng: 3.4314, address: 'Lekki Phase 1, Lagos', lga: 'Eti-Osa', state: 'Lagos' },
    description: 'Three armed men accosting motorists at the Lekki roundabout. Currently blocking traffic.',
    photos: [],
    reportedAt: '2026-06-04T07:15:00Z',
    reportedBy: { id: 'u_anon', name: 'Anonymous', verified: false },
    assignedOfficer: 'off_003',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T07:15:00Z', by: 'citizen' },
      { action: 'acknowledged', timestamp: '2026-06-04T07:18:00Z', by: 'off_003' },
      { action: 'responding', timestamp: '2026-06-04T07:22:00Z', by: 'off_003' },
    ],
  },
  {
    id: 'inc_002',
    category: 'fire',
    severity: 'critical',
    status: 'responding',
    location: { lat: 6.5244, lng: 3.3792, address: 'Victoria Island, Lagos', lga: 'Eti-Osa', state: 'Lagos' },
    description: 'Fire outbreak on a 3-storey commercial building near Adeola Odeku. Fire service has been contacted.',
    photos: [],
    reportedAt: '2026-06-04T06:50:00Z',
    reportedBy: { id: 'u_021', name: 'Emeka O.', verified: true },
    assignedOfficer: 'off_001',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T06:50:00Z', by: 'citizen' },
      { action: 'acknowledged', timestamp: '2026-06-04T06:52:00Z', by: 'off_001' },
      { action: 'fire_service_dispatched', timestamp: '2026-06-04T06:55:00Z', by: 'off_001' },
    ],
  },
  {
    id: 'inc_003',
    category: 'civil_unrest',
    severity: 'medium',
    status: 'active',
    location: { lat: 9.0579, lng: 7.4951, address: 'Area 1, Abuja', lga: 'Abuja Municipal', state: 'FCT Abuja' },
    description: 'Small crowd gathering outside the Ministry of Finance protesting unpaid salaries. Peaceful but growing.',
    photos: [],
    reportedAt: '2026-06-04T08:05:00Z',
    reportedBy: { id: 'u_044', name: 'Fatima A.', verified: true },
    assignedOfficer: null,
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T08:05:00Z', by: 'citizen' },
    ],
  },
  {
    id: 'inc_004',
    category: 'accident',
    severity: 'medium',
    status: 'resolved',
    location: { lat: 6.4550, lng: 3.3841, address: 'Third Mainland Bridge, Lagos', lga: 'Lagos Island', state: 'Lagos' },
    description: 'Two-vehicle collision causing traffic backup. LASTMA and ambulance have been dispatched. One casualty.',
    photos: [],
    reportedAt: '2026-06-04T05:30:00Z',
    reportedBy: { id: 'u_007', name: 'Chukwuma B.', verified: false },
    assignedOfficer: 'off_002',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T05:30:00Z', by: 'citizen' },
      { action: 'acknowledged', timestamp: '2026-06-04T05:33:00Z', by: 'off_002' },
      { action: 'resolved', timestamp: '2026-06-04T06:45:00Z', by: 'off_002' },
    ],
  },
  {
    id: 'inc_005',
    category: 'kidnapping',
    severity: 'critical',
    status: 'active',
    location: { lat: 4.8147, lng: 7.0498, address: 'Rumuola, Port Harcourt', lga: 'Port Harcourt', state: 'Rivers' },
    description: 'Attempted abduction of a businessman reported by witnesses near GRA junction. Two suspects fled in a Sienna.',
    photos: [],
    reportedAt: '2026-06-04T07:45:00Z',
    reportedBy: { id: 'u_062', name: 'Tunde K.', verified: true },
    assignedOfficer: 'off_004',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T07:45:00Z', by: 'citizen' },
      { action: 'acknowledged', timestamp: '2026-06-04T07:47:00Z', by: 'off_004' },
      { action: 'alert_issued', timestamp: '2026-06-04T07:50:00Z', by: 'soc_admin' },
    ],
  },
  {
    id: 'inc_006',
    category: 'civil_unrest',
    severity: 'high',
    status: 'responding',
    location: { lat: 12.0022, lng: 8.5920, address: 'Sabon Gari, Kano', lga: 'Kano Municipal', state: 'Kano' },
    description: 'Communal clash between two groups reported at the market. Police patrol dispatched. 3 injuries reported.',
    photos: [],
    reportedAt: '2026-06-04T06:20:00Z',
    reportedBy: { id: 'u_103', name: 'Musa A.', verified: true },
    assignedOfficer: 'off_005',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T06:20:00Z', by: 'citizen' },
      { action: 'patrol_dispatched', timestamp: '2026-06-04T06:28:00Z', by: 'off_005' },
    ],
  },
  {
    id: 'inc_007',
    category: 'armed_robbery',
    severity: 'low',
    status: 'false_alarm',
    location: { lat: 6.3650, lng: 3.3148, address: 'Badagry Expressway, Lagos', lga: 'Badagry', state: 'Lagos' },
    description: 'Report of suspicious vehicle later confirmed to be a breakdown. False alarm confirmed by patrol.',
    photos: [],
    reportedAt: '2026-06-04T04:00:00Z',
    reportedBy: { id: 'u_anon', name: 'Anonymous', verified: false },
    assignedOfficer: 'off_002',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T04:00:00Z', by: 'citizen' },
      { action: 'false_alarm_confirmed', timestamp: '2026-06-04T04:22:00Z', by: 'off_002' },
    ],
  },
  {
    id: 'inc_008',
    category: 'other',
    severity: 'low',
    status: 'active',
    location: { lat: 7.3775, lng: 3.9470, address: 'Ring Road, Ibadan', lga: 'Ibadan North', state: 'Oyo' },
    description: 'Power transformer explosion causing fire. PHCN and fire service notified. Road partially blocked.',
    photos: [],
    reportedAt: '2026-06-04T08:30:00Z',
    reportedBy: { id: 'u_201', name: 'Adeola F.', verified: false },
    assignedOfficer: null,
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T08:30:00Z', by: 'citizen' },
    ],
  },
];

export const INCIDENT_CATEGORIES = [
  { id: 'armed_robbery', label: 'Armed Robbery', icon: '🔫', color: '#dc2626', bg: '#fee2e2' },
  { id: 'civil_unrest', label: 'Civil Unrest', icon: '📢', color: '#d97706', bg: '#fef3c7' },
  { id: 'kidnapping', label: 'Kidnapping', icon: '🚨', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'fire', label: 'Fire Outbreak', icon: '🔥', color: '#ea580c', bg: '#fff7ed' },
  { id: 'accident', label: 'Road Accident', icon: '🚗', color: '#2563eb', bg: '#dbeafe' },
  { id: 'other', label: 'Other', icon: '⚠️', color: '#6b7280', bg: '#f3f4f6' },
];

export const SEVERITY_CONFIG = {
  low: { label: 'Low', color: '#16a34a', bg: '#dcfce7', ring: '#bbf7d0', size: 8 },
  medium: { label: 'Medium', color: '#d97706', bg: '#fef3c7', ring: '#fde68a', size: 10 },
  high: { label: 'High', color: '#dc2626', bg: '#fee2e2', ring: '#fca5a5', size: 13 },
  critical: { label: 'Critical', color: '#7f1d1d', bg: '#fee2e2', ring: '#ef4444', size: 16, pulse: true },
};

export const STATUS_CONFIG = {
  active: { label: 'Active', color: '#dc2626', bg: '#fee2e2' },
  responding: { label: 'Responding', color: '#d97706', bg: '#fef3c7' },
  resolved: { label: 'Resolved', color: '#16a34a', bg: '#dcfce7' },
  false_alarm: { label: 'False Alarm', color: '#6b7280', bg: '#f3f4f6' },
};

export const SECURITY_STATS = {
  activeIncidents: 5,
  respondingIncidents: 2,
  resolvedToday: 1,
  avgResponseTime: '7 mins',
  totalReported: 8,
  criticalCount: 2,
};
---------------------------------------------------
export const mockOfficers = [
  {
    id: 'off_001', name: 'Insp. Adeyemi Bola', badge: 'LG-1042',
    zone: { state: 'Lagos', lga: 'Eti-Osa' }, status: 'on_scene',
    currentIncident: 'inc_002', phone: '080-XXX-XXXX',
  },
  {
    id: 'off_002', name: 'Sgt. Chukwudi Obi', badge: 'LG-0887',
    zone: { state: 'Lagos', lga: 'Lagos Island' }, status: 'available',
    currentIncident: null, phone: '080-XXX-XXXX',
  },
  {
    id: 'off_003', name: 'Cpl. Ngozi Eze', badge: 'LG-1155',
    zone: { state: 'Lagos', lga: 'Eti-Osa' }, status: 'responding',
    currentIncident: 'inc_001', phone: '080-XXX-XXXX',
  },
  {
    id: 'off_004', name: 'Insp. Yakubu Sani', badge: 'RV-0341',
    zone: { state: 'Rivers', lga: 'Port Harcourt' }, status: 'on_scene',
    currentIncident: 'inc_005', phone: '080-XXX-XXXX',
  },
  {
    id: 'off_005', name: 'Sgt. Halima Musa', badge: 'KN-0562',
    zone: { state: 'Kano', lga: 'Kano Municipal' }, status: 'responding',
    currentIncident: 'inc_006', phone: '080-XXX-XXXX',
  },
];

export const OFFICER_STATUS_CONFIG = {
  available: { label: 'Available', color: '#16a34a', bg: '#dcfce7' },
  responding: { label: 'Responding', color: '#d97706', bg: '#fef3c7' },
  on_scene: { label: 'On Scene', color: '#dc2626', bg: '#fee2e2' },
  off_duty: { label: 'Off Duty', color: '#6b7280', bg: '#f3f4f6' },
};

]

3. Governance: The governance is a platform where we inted to digitalize all electoral processes for elections management within Nigeria and Africa at large, here we intend to have a digital voting feature where users can vote from the comfort of their homes via their phones, browser. Here the voting will use encryotion to store all voter casted votes to enforce anonimity and saftey of users choice on the platfrom. this service will reply hugely on the places service where countries, states, LGAs Districts and wards are managed as these are the building blocks which the entire 6+ modules of the civic platfrom will be running on. Also we would love to simulate the RESULT PORTAL like is ran by INEC in Nigeria so as to serve as a backup check and evidence providing platform and aslo serve as a huge counter check and resolution, oversight platform to mitigate the malpractices carries out by corrupt election supervisory bodies across countries in AFRICA using Nigeria as a model


4. Social: This is to be some sort of a discord server where issues and topics create a discussion server or group chat where users can chat in realt-time on issues, these issues where funding are needed to drive them become a civictaxcampaign which users can subscribe to and pay volutarily to raise funds to execute the solutions suggested in the discussion forum. 

5. Youth-Sport-Engagements: This is to be a platform that drives sports around all Districs, LGAs, States and Country...rangoing from hosting tournaments across sports like FIFA play-station gaming, to real football leagues tournaments, basketball leagues and tournaments, etc for both females and males. This module looks to digitalize the entire process of sports activities ranging from managers of every sport federating sport-type to teams, and actual games where spectators, commentary, statistics will all be digitally profiled and given tasks to execute and monitor. So i want a proper system to actualize all these. Teams and individual sport athletes can register and become part of any sporting activing being managed on the platform

6. Health Care:This module is going to be really huge, cos this looks to cover healthcare from all levels ranging from primary healthcare platfroms from district levels up to General & specialist but making sure patient records are hinged to the country, state, LGA levels so that users health history can be easily tracked, accessed when authorized by user seeking health service and can be transferred from their primaru hospitals to othe hospitals should they sick for a transfer of primary hospital...This should also handle phlebotomy general health services and pharmaceutical to cather for the needs of their users and also have a feature where certain drugs are not available, can access it from other health care providers on the platform and make them availble to the users

7. Digital Education for all: This module is to cather for edducational needs of the country from primary,secondary and f#university levels...This platfrom should make it possible for achools to be sighted acrros country, state LGA levels, this module has to make sure that all key features that will aid this platform/module enable the managers manage education properly is weaved into it, ranging from school platform enlisting and unveiling where they can then manage their students and teacher, schedule new intakes for their students, receive applications from students, receive payments from registeration/applications where the school toggles on application fee as neede. after that conduct entrance examination for students where students can write online CBT tests on this, and after exams grade the student, accept or decline their applications based on the gradings...then receive fees from students. After this next is plan the seesions, classes, attentance from srudents on their classes and courses, manage their engagements on extra curriculm activities like sports etc that their students decide to engage in which will be aprtnering with the youth-sports platform, then conduct exams, from their question banks, have their students take exams that are to be CBT-based and then grade them and admoniter their results to their students, whole also having a parent section that enables parents see their childrens performances at school and have a picture of how their children and wards are perfroming. 


The 7-modules, though 7th has not be given piopneering UIs like the first 6 should be handled. SO i want to see your thought processes and architectures that the entire system should run on with the existing services that we have. 

So the services will start on new services to power them  up 

1. civic-tax :  civictac-service
2. Security Map : soc-service
3. Governance: governance-service
4. Social: use existing social-service
5. Youth-Sport-Engagements: : youthandsports-service
6. Health Care: Healthcare-service
7. Digital Education for all: digitaleducation-service





 
