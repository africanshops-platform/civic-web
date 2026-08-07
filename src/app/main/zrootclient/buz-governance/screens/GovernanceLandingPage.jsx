import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, CheckCircle } from '@mui/icons-material';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import { mockElections, ELECTION_STATS, ELECTION_TYPES } from '../mock';

const BLUE_GRADIENT = 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 50%, #7c3aed 100%)';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 48 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

const inViewUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const HOW_IT_WORKS = [
  { step: '01', title: 'Register & Verify', desc: 'Verify your identity using your NIN. Your voting record is secured and anonymous.' },
  { step: '02', title: 'Cast Your Vote', desc: 'Vote in any election you are eligible for — presidential, gubernatorial, or local government.' },
  { step: '03', title: 'Track Results Live', desc: 'Watch ward-by-ward collation results update in real time as counting progresses.' },
];

const TRUST_BADGES = ['NIN Verified', 'End-to-End Encrypted', 'INEC Partnered', 'Audit Trail Enabled'];

const PLATFORM_STATS = [
  { emoji: '🗳️', value: ELECTION_STATS.totalElections,                                          label: 'Elections Hosted'    },
  { emoji: '👥', value: (ELECTION_STATS.totalVotersRegistered / 1_000_000).toFixed(1) + 'M',   label: 'Voters Registered'   },
  { emoji: '📊', value: `${ELECTION_STATS.averageTurnout}%`,                                    label: 'Average Turnout'     },
  { emoji: '✅', value: ELECTION_STATS.completedElections,                                       label: 'Completed Elections' },
];

export default function GovernanceLandingPage() {
  const { isAuthenticated } = useCivicWebAuth();
  const liveElections = mockElections.filter((e) => e.status === 'ongoing');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', backgroundColor: 'white' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: BLUE_GRADIENT }}>
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -180, left: -180, width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(56px)', pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: -140, right: -140, width: 460, height: 460, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', filter: 'blur(56px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,64px)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>
            <div>
              <motion.div {...fadeUp(0.1)}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '10px 24px', marginBottom: 32, border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(12px)' }}>
                  <span style={{ fontSize: '2rem' }}>🇳🇬</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(1.7rem, 2.8vw, 2rem)' }}>Digital Democracy — Nigeria First</span>
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.22)}>
                <h1 style={{ color: 'white', fontWeight: 900, lineHeight: 1.08, margin: '0 0 24px', fontSize: 'clamp(5.2rem, 9vw, 9rem)' }}>
                  Your Vote.
                  <span style={{ display: 'block', color: '#a5b4fc' }}>Your Nigeria.</span>
                </h1>
              </motion.div>
              <motion.div {...fadeUp(0.34)}>
                <p style={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.82, margin: '0 0 40px', maxWidth: 580, fontSize: 'clamp(2.1rem, 3.6vw, 2.6rem)' }}>
                  Transparent elections, live collation results, and citizen petitions — right from your phone.{' '}
                  <strong style={{ color: '#a5b4fc' }}>Every vote verified. Every result public.</strong>
                </p>
              </motion.div>
              <motion.div {...fadeUp(0.46)} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
                <Button component={Link} to="/governance/elections" variant="contained" size="large" endIcon={<ArrowForward sx={{ fontSize: 26 }} />}
                  sx={{ backgroundColor: 'white', color: '#1d4ed8', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 6 }, py: { xs: 2, sm: 2.5 }, fontSize: 'clamp(2rem, 3.6vw, 2.4rem)', boxShadow: '0 20px 48px rgba(0,0,0,0.22)', '&:hover': { backgroundColor: '#eff6ff', transform: 'translateY(-3px)' } }}>
                  View Elections
                </Button>
                <Button component={Link} to={isAuthenticated ? '/governance/participate' : '/sign-in'} variant="outlined" size="large"
                  sx={{ borderColor: 'rgba(255,255,255,0.65)', color: 'white', fontWeight: 700, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 6 }, py: { xs: 2, sm: 2.5 }, fontSize: 'clamp(2rem, 3.6vw, 2.4rem)', backdropFilter: 'blur(12px)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.12)' } }}>
                  {isAuthenticated ? 'Vote Now' : 'Sign In to Vote'}
                </Button>
              </motion.div>
              <motion.div {...fadeUp(0.56)} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {TRUST_BADGES.map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', borderRadius: 999, padding: '8px 18px' }}>
                    <CheckCircle sx={{ color: '#a5b4fc', fontSize: 'clamp(1.9rem, 2.8vw, 2.2rem)' }} />
                    <span style={{ color: 'white', fontWeight: 600, fontSize: 'clamp(1.6rem, 2.4vw, 1.84rem)' }}>{b}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {PLATFORM_STATS.map((s, i) => (
                <div key={s.label} style={{ borderRadius: 24, padding: '32px 28px', background: i === 0 ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.16)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: i === 0 ? '0 24px 48px rgba(0,0,0,0.18)' : 'none' }}>
                  <div style={{ fontSize: 'clamp(3.6rem, 6vw, 4.8rem)', marginBottom: 10 }}>{s.emoji}</div>
                  <div style={{ fontSize: 'clamp(4.4rem, 9vw, 6.4rem)', fontWeight: 900, color: i === 0 ? '#1d4ed8' : 'white', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
                  <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.1rem)', color: i === 0 ? '#6b7280' : 'rgba(255,255,255,0.82)', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ELECTION TYPES ── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,64px)', backgroundColor: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 'clamp(1.6rem,2.4vw,1.8rem)', marginBottom: 24 }}>Browse by Election Type</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            {ELECTION_TYPES.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Button component={Link} to={`/governance/elections?type=${t.id}`}
                  sx={{ backgroundColor: t.bgColor, color: t.color, fontWeight: 700, borderRadius: '14px', textTransform: 'none', px: { xs: 3, sm: 4.5 }, py: { xs: 1.5, sm: 2 }, fontSize: 'clamp(1.8rem, 3vw, 2.1rem)', border: `1.5px solid ${t.color}28`, '&:hover': { backgroundColor: t.color, color: 'white', transform: 'translateY(-3px)', boxShadow: `0 10px 24px ${t.color}44` } }}>
                  <span style={{ marginRight: 10, fontSize: 'clamp(2rem, 3.2vw, 2.4rem)' }}>{t.icon}</span>{t.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM STATS ── */}
      <section style={{ padding: 'clamp(56px,6vw,80px) clamp(20px,5vw,64px)', background: 'linear-gradient(180deg, #eff6ff 0%, #e0e7ff 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(16px,3vw,28px)' }}>
            {PLATFORM_STATS.map((s, i) => (
              <motion.div key={s.label} {...inViewUp(i * 0.09)} style={{ textAlign: 'center', padding: 'clamp(32px,4vw,48px) clamp(20px,2.5vw,32px)', borderRadius: 22, backgroundColor: 'white', border: '1px solid #c7d2fe', boxShadow: '0 4px 20px rgba(29,78,216,0.08)' }}>
                <div style={{ fontSize: 'clamp(4.4rem, 8vw, 6rem)', marginBottom: 12 }}>{s.emoji}</div>
                <div style={{ fontSize: 'clamp(4.4rem, 9vw, 7rem)', fontWeight: 900, color: '#1d4ed8', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.1rem)', color: '#6b7280', marginTop: 10, fontWeight: 600 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(64px,7vw,112px) clamp(20px,5vw,64px)', backgroundColor: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div {...inViewUp()} style={{ textAlign: 'center', marginBottom: 'clamp(48px,5vw,80px)' }}>
            <h2 style={{ margin: '0 0 18px', fontWeight: 900, color: '#111827', fontSize: 'clamp(4rem, 9vw, 7rem)' }}>How It Works</h2>
            <p style={{ margin: '0 auto', color: '#6b7280', maxWidth: 540, fontSize: 'clamp(2rem, 3.6vw, 2.4rem)' }}>Simple. Secure. Transparent.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(24px,3vw,40px)' }}>
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={s.step} {...inViewUp(i * 0.15)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'clamp(32px,4vw,56px)', borderRadius: 24, background: 'linear-gradient(180deg, #eff6ff 0%, #e0e7ff 100%)', border: '1px solid #c7d2fe' }}>
                <div style={{ width: 'clamp(80px,10vw,100px)', height: 'clamp(80px,10vw,100px)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLUE_GRADIENT, boxShadow: '0 12px 28px rgba(29,78,216,0.4)', marginBottom: 28, fontSize: 'clamp(2.8rem,5vw,3.8rem)', fontWeight: 900, color: 'white' }}>
                  {s.step}
                </div>
                <h3 style={{ margin: '0 0 14px', fontSize: 'clamp(2.4rem, 4.4vw, 3rem)', fontWeight: 800, color: '#1e1b4b' }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 'clamp(1.9rem, 3.2vw, 2.2rem)', color: '#6b7280', lineHeight: 1.75 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: 'clamp(80px,9vw,128px) clamp(20px,5vw,64px)', textAlign: 'center', background: BLUE_GRADIENT, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -80, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -80, right: '15%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', filter: 'blur(40px)' }} />
        </div>
        <motion.div {...inViewUp()} style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'white', fontWeight: 900, margin: '0 0 24px', fontSize: 'clamp(4.4rem, 11vw, 9rem)', lineHeight: 1.1 }}>
            Democracy Starts With You.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(2.2rem, 4.4vw, 2.9rem)', margin: '0 auto 52px', maxWidth: 640, lineHeight: 1.75 }}>
            Register, vote, and hold your leaders accountable — from your phone, in real time.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
            <Button component={Link} to="/sign-up" variant="contained" size="large"
              sx={{ backgroundColor: 'white', color: '#1d4ed8', fontWeight: 900, borderRadius: '16px', textTransform: 'none', px: { xs: 5, sm: 8 }, py: { xs: 2.25, sm: 3 }, fontSize: 'clamp(2.1rem, 3.8vw, 2.6rem)', boxShadow: '0 24px 48px rgba(0,0,0,0.22)', '&:hover': { backgroundColor: '#eff6ff', transform: 'translateY(-3px)' } }}>
              Create Free Account
            </Button>
            <Button component={Link} to="/governance/elections" variant="outlined" size="large" endIcon={<ArrowForward sx={{ fontSize: 28 }} />}
              sx={{ borderColor: 'rgba(255,255,255,0.7)', color: 'white', fontWeight: 700, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 6 }, py: { xs: 2.25, sm: 3 }, fontSize: 'clamp(2rem, 3.4vw, 2.4rem)', backdropFilter: 'blur(12px)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.12)' } }}>
              Browse Elections
            </Button>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
