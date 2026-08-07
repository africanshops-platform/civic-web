import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, CheckCircle } from '@mui/icons-material';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import { mockIssues, ISSUE_STATS, ISSUE_CATEGORIES } from '../mock';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 48 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] } });
const inViewUp = (delay = 0) => ({ initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } });
const GREEN_GRADIENT = 'linear-gradient(135deg, #059669 0%, #0f766e 50%, #134e4a 100%)';

const TRUST_BADGES = ['Citizen Verified', 'Direct to Authority', 'Public Accountability', 'Real-time Updates'];
const HOW_IT_WORKS = [
  { step: '01', title: 'Spot an Issue', desc: 'See a broken road, failed infrastructure, or service gap? Report it with a photo and location in under 2 minutes.' },
  { step: '02', title: 'Community Amplifies', desc: 'Neighbours upvote, comment, and share. The most critical issues rise to the top — visible to every official.' },
  { step: '03', title: 'Authorities Respond', desc: 'Issues are directly routed to the responsible LGA department, utility, or ministry — with public accountability.' },
];

const PLATFORM_STATS = [
  { emoji: '📋', value: ISSUE_STATS.totalIssues.toLocaleString(), label: 'Issues Reported' },
  { emoji: '✅', value: ISSUE_STATS.resolvedIssues, label: 'Resolved' },
  { emoji: '🏗️', value: '84', label: 'Projects Tracked' },
  { emoji: '📊', value: `${ISSUE_STATS.resolutionRate}%`, label: 'Resolution Rate' },
];

export default function CommunityLandingPage() {
  const { isAuthenticated } = useCivicWebAuth();
  const featured = mockIssues.filter((i) => i.status !== 'resolved').slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', backgroundColor: 'white' }}>

      {/* ══════ HERO ══════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: GREEN_GRADIENT }}>
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -180, left: -180, width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(56px)', pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: -140, right: -140, width: 460, height: 460, borderRadius: '50%', background: 'rgba(110,231,183,0.15)', filter: 'blur(56px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,64px)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center' }}>
            <div>
              <motion.div {...fadeUp(0.1)}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: 'clamp(7px, 1vw, 10px) clamp(16px, 2.4vw, 22px)', marginBottom: 28, border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(12px)' }}>
                  <span style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)' }}>🇳🇬</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: F.meta }}>Community-Powered Change — Nigeria</span>
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.22)}>
                <h1 style={{ color: 'white', fontWeight: 900, lineHeight: 1.08, margin: '0 0 20px', fontSize: 'clamp(2.6rem, 6.5vw, 5.5rem)' }}>
                  Your Community.
                  <span style={{ display: 'block', color: '#6ee7b7' }}>Your Voice.</span>
                </h1>
              </motion.div>
              <motion.div {...fadeUp(0.34)}>
                <p style={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.82, margin: '0 0 36px', maxWidth: 580, fontSize: F.body }}>
                  Report community issues directly to local authorities. Track government projects.
                  Hold leaders accountable — in public, in real time.{' '}
                  <strong style={{ color: '#6ee7b7' }}>Every report matters. Every voice counts.</strong>
                </p>
              </motion.div>
              <motion.div {...fadeUp(0.46)} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
                <Button component={Link} to="/community/feed" variant="contained" size="large" endIcon={<ArrowForward />}
                  sx={{ backgroundColor: 'white', color: '#059669', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: { xs: 3.5, sm: 5 }, py: { xs: 1.75, sm: 2.25 }, fontSize: F.btn, boxShadow: '0 20px 48px rgba(0,0,0,0.22)', '&:hover': { backgroundColor: '#f0fdf4', transform: 'translateY(-3px)' } }}>
                  Browse Issues
                </Button>
                <Button component={Link} to={isAuthenticated ? '/community/create-issue' : '/sign-in'} variant="outlined" size="large"
                  sx={{ borderColor: 'rgba(255,255,255,0.65)', color: 'white', fontWeight: 700, borderRadius: '16px', textTransform: 'none', px: { xs: 3.5, sm: 5 }, py: { xs: 1.75, sm: 2.25 }, fontSize: F.btn, backdropFilter: 'blur(12px)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.12)' } }}>
                  Report an Issue
                </Button>
              </motion.div>
              <motion.div {...fadeUp(0.56)} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {TRUST_BADGES.map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', borderRadius: 999, padding: 'clamp(5px, 0.8vw, 8px) clamp(12px, 1.8vw, 18px)' }}>
                    <CheckCircle sx={{ color: '#6ee7b7', fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
                    <span style={{ color: 'white', fontWeight: 600, fontSize: F.meta }}>{b}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {PLATFORM_STATS.map((s, i) => (
                <div key={s.label} style={{ borderRadius: 24, padding: 'clamp(20px, 3vw, 32px) clamp(18px, 2.6vw, 28px)', background: i === 0 ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.16)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: i === 0 ? '0 24px 48px rgba(0,0,0,0.18)' : 'none' }}>
                  <div style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', marginBottom: 8 }}>{s.emoji}</div>
                  <div style={{ fontSize: 'clamp(2rem, 4.2vw, 3.2rem)', fontWeight: 900, color: i === 0 ? '#059669' : 'white', lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                  <div style={{ fontSize: F.meta, color: i === 0 ? '#6b7280' : 'rgba(255,255,255,0.82)', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ CATEGORIES ══════ */}
      <section style={{ padding: 'clamp(36px,5vw,56px) clamp(20px,5vw,64px)', backgroundColor: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: F.meta, marginBottom: 20 }}>Browse by Issue Category</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {ISSUE_CATEGORIES.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Button component={Link} to={`/community/feed?category=${c.id}`}
                  sx={{ backgroundColor: c.bgColor, color: c.color, fontWeight: 700, borderRadius: '14px', textTransform: 'none', px: { xs: 2.5, sm: 3.5 }, py: { xs: 1.2, sm: 1.5 }, fontSize: F.meta, border: `1.5px solid ${c.color}28`, '&:hover': { backgroundColor: c.color, color: 'white', transform: 'translateY(-3px)', boxShadow: `0 10px 24px ${c.color}44` } }}>
                  <span style={{ marginRight: 8, fontSize: F.body }}>{c.icon}</span>{c.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section style={{ padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,64px)', background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div {...inViewUp()} style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,64px)' }}>
            <h2 style={{ margin: '0 0 16px', fontWeight: 900, color: '#111827', fontSize: F.sectionH }}>How It Works</h2>
            <p style={{ margin: '0 auto', color: '#6b7280', maxWidth: 540, fontSize: F.body }}>From ground level to government desk in minutes.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(20px,3vw,36px)' }}>
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={s.step} {...inViewUp(i * 0.15)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'clamp(28px,4vw,48px)', borderRadius: 24, background: 'white', border: '1px solid #bbf7d0' }}>
                <div style={{ width: 'clamp(56px, 8vw, 80px)', height: 'clamp(56px, 8vw, 80px)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: GREEN_GRADIENT, boxShadow: '0 12px 28px rgba(5,150,105,0.4)', marginBottom: 24, fontSize: F.subH, fontWeight: 900, color: 'white' }}>
                  {s.step}
                </div>
                <h3 style={{ margin: '0 0 12px', fontSize: F.subH, fontWeight: 800, color: '#14532d' }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: F.body, color: '#6b7280', lineHeight: 1.75 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section style={{ padding: 'clamp(72px,9vw,112px) clamp(20px,5vw,64px)', textAlign: 'center', background: GREEN_GRADIENT, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -80, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -80, right: '15%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(110,231,183,0.12)', filter: 'blur(40px)' }} />
        </div>
        <motion.div {...inViewUp()} style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'white', fontWeight: 900, margin: '0 0 20px', fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)', lineHeight: 1.1 }}>
            Every Issue Reported Is a Vote for a Better Nigeria.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: F.body, margin: '0 auto 44px', maxWidth: 600, lineHeight: 1.75 }}>
            Don't just complain. Report, upvote, and hold your leaders accountable — publicly.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            <Button component={Link} to="/sign-up" variant="contained" size="large"
              sx={{ backgroundColor: 'white', color: '#059669', fontWeight: 900, borderRadius: '16px', textTransform: 'none', px: { xs: 5, sm: 7 }, py: { xs: 2, sm: 2.5 }, fontSize: F.btn, boxShadow: '0 24px 48px rgba(0,0,0,0.22)', '&:hover': { backgroundColor: '#f0fdf4', transform: 'translateY(-3px)' } }}>
              Join &amp; Start Reporting
            </Button>
            <Button component={Link} to="/community/feed" variant="outlined" size="large" endIcon={<ArrowForward />}
              sx={{ borderColor: 'rgba(255,255,255,0.7)', color: 'white', fontWeight: 700, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 5 }, py: { xs: 2, sm: 2.5 }, fontSize: F.btn, backdropFilter: 'blur(12px)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.12)' } }}>
              Browse Issues
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
