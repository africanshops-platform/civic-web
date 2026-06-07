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
