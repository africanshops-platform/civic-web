import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button } from '@mui/material';
import { LocationOn, Phone, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useIncidentDetail } from '../hooks/useSecurityRepo';
import SecurityHeader from './shared-components/SecurityHeader';
import SocDashboardSidebarLeft from './shared-components/SocDashboardSidebarLeft';
import SocDashboardSidebarRight from './shared-components/SocDashboardSidebarRight';
import SeverityBadge from '../components/SeverityBadge';
import { CivicLoadingSkeleton, CivicEmptyState } from '../../civic-shared';

// Real IncidentCategory/IncidentStatus enum values from soc-service's Prisma
// schema (lowercased by normalizeIncident) -- deliberately NOT reusing the
// mock's INCIDENT_CATEGORIES/STATUS_CONFIG, which only cover a placeholder
// taxonomy (armed_robbery/kidnapping/active/responding/false_alarm) that
// doesn't match the real enum. Same real-category set ReportIncidentPage
// already uses, mirrors civic-mobile's IncidentDetailScreen exactly.
const CATEGORY_LABEL = {
  theft: 'Theft',
  assault: 'Assault',
  fire: 'Fire',
  flood: 'Flood',
  accident: 'Accident',
  medical_emergency: 'Medical Emergency',
  civil_unrest: 'Civil Unrest',
  other: 'Other',
};

const STATUS_STEPS = ['reported', 'acknowledged', 'assigned', 'in_response', 'resolved'];
const STATUS_LABEL = {
  reported: 'Reported',
  acknowledged: 'Acknowledged',
  assigned: 'Officer Assigned',
  in_response: 'In Response',
  resolved: 'Resolved',
  closed: 'Closed',
};

const F = {
  body: 'clamp(1.3rem,  2vw,   1.64rem)',
  meta: 'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:  'clamp(1.3rem,  2vw,   1.56rem)',
  title:'clamp(1.8rem,  3vw,   2.4rem)',
  subH: 'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const Root = styled(FusePageSimpleWithMargin)(() => ({
  '& .FusePageSimple-header':  { backgroundColor: '#0f172a', borderBottomWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)' },
  '& .FusePageSimple-sidebar': { backgroundColor: '#0f172a' },
  '& .FusePageSimple-content': { backgroundColor: '#0f172a' },
}));

function ActiveIncidentDetailPage() {
  const { id } = useParams();
  const navigate  = useNavigate();
  const isMobile  = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useIncidentDetail(id);
  const incident = data?.data?.incident;

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <SecurityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Incident Detail" subtitle="Full report, status and response log" />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => {
    if (isLoading) return (
      <div style={{ background: '#0f172a', flex: 1 }}>
        <CivicLoadingSkeleton message="Loading incident..." variant="list" cardCount={1} />
      </div>
    );

    if (isError || !incident) {
      return (
        <div style={{ background: '#0f172a', minHeight: '100%', padding: 'clamp(20px,4vw,48px)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <CivicEmptyState
              title="Couldn't load this incident"
              description="It may have been removed, or you may not have permission to view it."
              ctaLabel="Back to My Reports"
              onCta={() => navigate('/security/my-reports')}
            />
          </div>
        </div>
      );
    }

    const currentStepIndex = STATUS_STEPS.indexOf(incident.status);

    return (
      <div className="flex-auto" style={{ background: '#0f172a', minHeight: '100%', padding: 'clamp(20px,4vw,48px)', overflowY: 'auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          <Button startIcon={<ArrowBack style={{ fontSize: 'clamp(14px,1.8vw,18px)' }} />}
            onClick={() => navigate(-1)}
            style={{ fontSize: F.meta, marginBottom: 'clamp(14px,2vw,20px)' }}
            sx={{ color: 'rgba(255,255,255,0.55)', textTransform: 'none', px: 0, '&:hover': { background: 'none', color: 'white' } }}>
            Back
          </Button>

          {/* ── Incident header card ── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 'clamp(16px,2.2vw,22px)', padding: 'clamp(18px,2.8vw,28px)', marginBottom: 'clamp(16px,2.4vw,24px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
              <div style={{ fontWeight: 900, fontSize: F.title, color: 'white', flex: 1 }}>{incident.title}</div>
              <SeverityBadge severity={incident.severity} size="lg" pulse />
            </div>
            <div style={{ fontSize: F.meta, fontWeight: 700, color: '#f97316', marginBottom: 14 }}>
              {CATEGORY_LABEL[incident.category] ?? incident.category}
            </div>
            <div style={{ fontSize: F.body, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 16 }}>
              {incident.description}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <LocationOn style={{ fontSize: 'clamp(14px,1.8vw,18px)', color: '#f97316' }} />
              <span style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.6)' }}>{incident.location.address}</span>
            </div>
            <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.4)' }}>
              {incident.location.lga}, {incident.location.state} · Reported {new Date(incident.reportedAt).toLocaleString()}
            </div>
          </motion.div>

          {/* ── Status timeline ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 'clamp(16px,2.2vw,22px)', padding: 'clamp(18px,2.8vw,28px)', marginBottom: 'clamp(16px,2.4vw,24px)' }}>
            <div style={{ fontWeight: 800, fontSize: F.subH, color: 'white', marginBottom: 16 }}>Status</div>
            {incident.status === 'closed' ? (
              <div style={{ fontSize: F.body, color: 'rgba(255,255,255,0.55)' }}>This incident has been closed.</div>
            ) : (
              STATUS_STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', marginBottom: i < STATUS_STEPS.length - 1 ? 12 : 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, marginRight: 12, backgroundColor: done ? '#16a34a' : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                    <span style={{ fontSize: F.body, fontWeight: done ? 700 : 500, color: done ? 'white' : 'rgba(255,255,255,0.4)' }}>
                      {STATUS_LABEL[step]}
                    </span>
                  </div>
                );
              })
            )}
            {incident.resolution && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: F.meta, fontWeight: 700, color: 'white', marginBottom: 4 }}>Resolution</div>
                <div style={{ fontSize: F.body, color: 'rgba(255,255,255,0.65)' }}>{incident.resolution}</div>
              </div>
            )}
          </motion.div>

          {/* ── Response action log ── */}
          {incident.actions?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 'clamp(16px,2.2vw,22px)', padding: 'clamp(18px,2.8vw,28px)', marginBottom: 'clamp(16px,2.4vw,24px)' }}>
              <div style={{ fontWeight: 800, fontSize: F.subH, color: 'white', marginBottom: 14 }}>Response Log</div>
              {incident.actions.map((action) => (
                <div key={action.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: F.body, fontWeight: 600, color: 'white' }}>{action.action}</div>
                  {action.note && <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{action.note}</div>}
                  <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                    {new Date(action.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── Emergency CTA ── */}
          <motion.a href="tel:112" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'block', textDecoration: 'none', textAlign: 'center', padding: 'clamp(14px,2.2vw,18px)', borderRadius: 'clamp(12px,2vw,18px)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <span style={{ fontSize: F.body, fontWeight: 700, color: '#f87171' }}>
              <Phone style={{ fontSize: 'clamp(14px,1.8vw,18px)', verticalAlign: 'middle', marginRight: 6 }} />
              Emergency? Call 112 now
            </span>
          </motion.a>

        </div>
      </div>
    );
  }, [incident, isLoading, isError, navigate]);

  const leftSidebar  = useMemo(() => <SocDashboardSidebarLeft />, []);
  const rightSidebar = useMemo(() => <SocDashboardSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveIncidentDetailPage = memo(ActiveIncidentDetailPage);
export default function IncidentDetailPage() { return <MemoizedActiveIncidentDetailPage />; }
