import { memo } from 'react';
import { Chip } from '@mui/material';
import { mockTournaments } from '../../mock';

/* ── Shared responsive font tokens matching YouthSportsDashboardContent ── */
const F = {
  sectionHead:  'clamp(1.76rem, 2.6vw, 2.2rem)',   /* section titles              */
  statValue:    'clamp(2rem,    3.2vw, 2.8rem)',    /* stat card big number        */
  statLabel:    'clamp(1.3rem,  1.8vw, 1.64rem)',   /* stat card descriptor        */
  body:         'clamp(1.5rem,  2.2vw, 1.9rem)',    /* tournament title, contacts  */
  small:        'clamp(1.3rem,  1.8vw, 1.56rem)',   /* chip labels, cta body       */
  emoji:        'clamp(1.8rem,  2.8vw, 2.6rem)',    /* contact / cta emojis        */
  statEmoji:    'clamp(2rem,    3vw,   2.8rem)',     /* stat card emoji             */
  chipH:        36,
};

function StatCard({ emoji, value, label, accent }) {
  return (
    <div style={{
      padding: 'clamp(14px, 1.8vw, 20px) clamp(16px, 2vw, 22px)',
      borderRadius: 16,
      background: '#fff7ed', border: '1px solid #fed7aa',
      display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 16px)',
    }}>
      <div style={{ fontSize: F.statEmoji, lineHeight: 1 }}>{emoji}</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: F.statValue, color: accent || '#ea580c', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: F.statLabel, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function YouthSportsSidebarRight({ stats }) {
  const liveTournaments = mockTournaments.filter((t) => t.status === 'ongoing').slice(0, 3);

  return (
    <div style={{ padding: 'clamp(16px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.4vw, 26px)' }}>

      {/* ── Platform Stats ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
          Platform Stats
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.2vw, 14px)' }}>
          <StatCard emoji="📚" value={stats?.totalPrograms ?? 47}                         label="Total Programmes" />
          <StatCard emoji="🟢" value={stats?.openPrograms ?? 28}                          label="Open for Enrolment"  accent="#16a34a" />
          <StatCard emoji="👥" value={(stats?.totalYouthEnrolled ?? 8420).toLocaleString()} label="Youth Enrolled"       accent="#1d4ed8" />
          <StatCard emoji="🎓" value={(stats?.graduatesThisYear ?? 2140).toLocaleString()} label="Graduates This Year" />
        </div>
      </div>

      {/* ── Live Tournaments ── */}
      {liveTournaments.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
            🏆 Live Tournaments
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.2vw, 12px)' }}>
            {liveTournaments.map((t) => (
              <div
                key={t.id}
                style={{ padding: 'clamp(12px, 1.6vw, 18px)', borderRadius: 14, background: '#fff7ed', border: '1px solid #fed7aa' }}
              >
                <div style={{
                  fontWeight: 700,
                  fontSize: F.body,
                  color: '#9a3412', marginBottom: 8, lineHeight: 1.35,
                }}>
                  {t.title}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Chip label={t.sport}    size="small" sx={{ height: F.chipH, fontSize: F.small, fontWeight: 700, background: '#fed7aa',  color: '#9a3412' }} />
                  <Chip label={t.ageGroup} size="small" sx={{ height: F.chipH, fontSize: F.small, fontWeight: 700, background: '#dcfce7', color: '#166534' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Key Contacts ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
          Key Contacts
        </div>
        {[
          { label: 'Lagos Sports Commission', icon: '🏅' },
          { label: 'National Youth Council',  icon: '🇳🇬' },
          { label: 'NYSC Directorate',        icon: '🎖️'  },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 'clamp(8px, 1.2vw, 14px)',
              padding: 'clamp(8px, 1.2vw, 12px)',
              marginBottom: 8, borderRadius: 12,
              background: '#f9fafb', border: '1px solid #e5e7eb',
            }}
          >
            <span style={{ fontSize: F.emoji }}>{c.icon}</span>
            <span style={{ fontSize: F.body, fontWeight: 600, color: '#374151' }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* ── Nominate CTA ── */}
      <div style={{
        padding: 'clamp(14px, 1.8vw, 20px)',
        borderRadius: 16,
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        border: '1px solid #fdba74',
      }}>
        <div style={{ fontWeight: 800, fontSize: F.body, color: '#9a3412', marginBottom: 8 }}>
          🌟 Nominate a Talent
        </div>
        <p style={{ margin: 0, fontSize: F.small, color: '#c2410c', lineHeight: 1.65 }}>
          Know a gifted young Nigerian? Nominate them for the Talent Directory and connect them with scouts and mentors.
        </p>
      </div>

    </div>
  );
}

export default memo(YouthSportsSidebarRight);
