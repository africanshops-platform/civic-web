import { memo } from 'react';
import { Button, CircularProgress, Chip, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, Star, EmojiEvents } from '@mui/icons-material';
import { PROGRAM_CATEGORIES } from '../../mock';

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const STATUS_STYLES = {
  open:     { bg: '#dcfce7', color: '#166534', label: 'Open'     },
  upcoming: { bg: '#eff6ff', color: '#1d4ed8', label: 'Upcoming' },
  ongoing:  { bg: '#fff7ed', color: '#9a3412', label: 'Ongoing'  },
  closed:   { bg: '#f3f4f6', color: '#6b7280', label: 'Closed'   },
};

/* ── Responsive font & spacing tokens ── */
const F = {
  title:   'clamp(1.44rem, 2.4vw, 1.96rem)',
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
  empty:   'clamp(1.6rem,  2.8vw, 2.2rem)',
};

function ProgramCard({ program }) {
  const catInfo = PROGRAM_CATEGORIES.find((c) => c.id === program.category) || PROGRAM_CATEGORIES[0];
  const statusStyle = STATUS_STYLES[program.status] || STATUS_STYLES.closed;
  const fillPct = program.slots > 0 ? Math.round((program.enrolledCount / program.slots) * 100) : 0;

  return (
    <motion.div
      {...inView()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(10px, 1.4vw, 14px)',
        padding: 'clamp(16px, 2.2vw, 24px)',
        borderRadius: 18,
        border: '1px solid #e5e7eb',
        background: 'white',
        marginBottom: 'clamp(10px, 1.4vw, 16px)',
      }}
    >
      {/* ── Row 1: icon · title · status chip ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(12px, 1.8vw, 20px)' }}>
        <div style={{
          width:  'clamp(48px, 6vw, 64px)',
          height: 'clamp(48px, 6vw, 64px)',
          borderRadius: 'clamp(10px, 1.4vw, 14px)',
          background: catInfo.bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)',
          flexShrink: 0,
        }}>
          {catInfo.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: F.title, lineHeight: 1.3, flex: 1, minWidth: 0 }}>
              {program.title}
            </div>
            <Chip
              label={statusStyle.label}
              sx={{ height: 'clamp(28px, 3.2vw, 38px)', fontSize: F.meta, fontWeight: 800, background: statusStyle.bg, color: statusStyle.color, flexShrink: 0 }}
            />
          </div>
          <div style={{ fontSize: F.body, color: '#6b7280', marginTop: 4, lineHeight: 1.4 }}>
            {program.location.address}
          </div>
        </div>
      </div>

      {/* ── Row 2: meta tags ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(8px, 1.4vw, 16px)', paddingLeft: 'clamp(60px, 7.8vw, 84px)' }}>
        <span style={{ fontSize: F.body, color: '#374151' }}>📅 {program.duration}</span>
        <span style={{ fontSize: F.body, color: '#374151' }}>👤 Ages {program.ageRange.min}–{program.ageRange.max}</span>
        {program.isFree
          ? <Chip label="FREE" sx={{ height: 'clamp(26px, 3vw, 34px)', fontSize: F.meta, fontWeight: 800, background: '#dcfce7', color: '#166534' }} />
          : <span style={{ fontSize: F.body, color: '#374151' }}>₦{program.fee.toLocaleString()}</span>
        }
        {program.rating && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: F.body, color: '#374151' }}>
            <Star sx={{ fontSize: 'clamp(18px, 2.2vw, 26px)', color: '#f59e0b' }} />
            {program.rating}
          </span>
        )}
      </div>

      {/* ── Row 3: enrolment progress ── */}
      <div style={{ paddingLeft: 'clamp(60px, 7.8vw, 84px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600 }}>Enrolment</span>
          <span style={{ fontSize: F.meta, color: '#374151', fontWeight: 700 }}>
            {program.enrolledCount}/{program.slots}
          </span>
        </div>
        <LinearProgress
          variant="determinate"
          value={fillPct}
          sx={{
            borderRadius: 6, height: 8, background: '#f3f4f6',
            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #ea580c, #dc2626)', borderRadius: 6 },
          }}
        />
      </div>

      {/* ── Row 4: CTA — full width on all screens ── */}
      <Button
        component={Link}
        to={`/youth/programs/${program.id}`}
        variant="contained"
        endIcon={<ArrowForward sx={{ fontSize: 'clamp(18px, 2vw, 22px)' }} />}
        sx={{
          background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
          color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none',
          fontSize: F.btn,
          px: 'clamp(12px, 2vw, 24px)',
          py: 'clamp(8px, 1.2vw, 14px)',
          width: '100%',
          '&:hover': { filter: 'brightness(0.92)' },
        }}
      >
        Enroll
      </Button>
    </motion.div>
  );
}

function YouthSportsDashboardContent({ programs, isLoading, isError }) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 20 }}>
        <CircularProgress size={56} sx={{ color: '#ea580c' }} />
        <div style={{ color: '#6b7280', fontWeight: 600, fontSize: F.subH }}>Loading programmes...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 'clamp(24px, 3vw, 40px)', textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', marginBottom: 14 }}>⚠️</div>
        <div style={{ fontWeight: 700, color: '#dc2626', fontSize: F.subH }}>Failed to load programmes.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(16px, 2.5vw, 28px)' }}>
      {/* ── Section header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'clamp(16px, 2vw, 24px)', flexWrap: 'wrap', gap: 'clamp(10px, 1.4vw, 14px)',
      }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: F.sectionH, color: '#111827', lineHeight: 1.2 }}>
            <EmojiEvents sx={{ fontSize: 'inherit', color: '#ea580c', mr: 1, verticalAlign: 'middle' }} />
            Youth Programmes
          </h2>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: F.subH }}>
            {programs?.length ?? 0} programmes found
          </p>
        </div>
        <Button
          component={Link}
          to="/youth/tournaments"
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
            color: 'white', fontWeight: 700, borderRadius: '14px', textTransform: 'none',
            fontSize: 'clamp(1.3rem, 2vw, 1.76rem)',
            px: 'clamp(14px, 2vw, 24px)',
            py: 'clamp(8px, 1vw, 14px)',
            '&:hover': { filter: 'brightness(0.92)' },
          }}
        >
          View Tournaments
        </Button>
      </div>

      {/* ── Empty state ── */}
      {!programs?.length ? (
        <div style={{ textAlign: 'center', padding: 'clamp(40px, 6vw, 80px) 20px' }}>
          <div style={{ fontSize: 'clamp(2.8rem, 5vw, 4rem)', marginBottom: 'clamp(12px, 1.6vw, 20px)' }}>🔍</div>
          <div style={{ fontWeight: 800, color: '#374151', fontSize: F.empty, marginBottom: 10 }}>
            No programmes match your filters
          </div>
          <div style={{ color: '#9ca3af', fontSize: F.subH }}>
            Try adjusting the filters on the left panel
          </div>
        </div>
      ) : (
        <div>
          {programs.map((p) => <ProgramCard key={p.id} program={p} />)}
        </div>
      )}
    </div>
  );
}

export default memo(YouthSportsDashboardContent);
