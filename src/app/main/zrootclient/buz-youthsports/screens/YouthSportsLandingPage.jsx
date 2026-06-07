import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, CheckCircle } from '@mui/icons-material';
import { PROGRAM_CATEGORIES, YOUTH_STATS } from '../mock';

const ORANGE_GRADIENT = 'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #b91c1c 100%)';

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
  { step: '01', title: 'Browse Programmes', desc: 'Explore government-backed programmes in technology, sports, arts, entrepreneurship, and more.' },
  { step: '02', title: 'Enrol Online', desc: 'Apply in minutes. Free programmes are available for youth aged 15–30 across all 36 states.' },
  { step: '03', title: 'Get Discovered', desc: 'Showcase your talent, join tournaments, and connect with mentors who can open doors.' },
];

const TRUST_BADGES = ['Government Backed', 'NFF Partnered', 'Free Programmes Available', 'NYSC Accredited'];

const PLATFORM_STATS = [
  { emoji: '📚', value: YOUTH_STATS.totalPrograms, label: 'Total Programmes' },
  { emoji: '🟢', value: YOUTH_STATS.openPrograms, label: 'Open for Enrolment' },
  { emoji: '👥', value: `${(YOUTH_STATS.totalYouthEnrolled / 1000).toFixed(1)}k`, label: 'Youth Enrolled' },
  { emoji: '🎓', value: YOUTH_STATS.graduatesThisYear.toLocaleString(), label: 'Graduates This Year' },
];

export default function YouthSportsLandingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', backgroundColor: 'white' }}>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: ORANGE_GRADIENT }}>
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -180, left: -180, width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(56px)', pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: -140, right: -140, width: 460, height: 460, borderRadius: '50%', background: 'rgba(253,186,116,0.15)', filter: 'blur(56px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,64px)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>
            <div>
              <motion.div {...fadeUp(0.1)}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '10px 24px', marginBottom: 32, border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(12px)' }}>
                  <span style={{ fontSize: '2rem' }}>🏆</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(1.7rem, 2.8vw, 2rem)' }}>Empowering Nigerian Youth</span>
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.22)}>
                <h1 style={{ color: 'white', fontWeight: 900, lineHeight: 1.08, margin: '0 0 24px', fontSize: 'clamp(5.2rem, 9vw, 9rem)' }}>
                  Your Talent.
                  <span style={{ display: 'block', color: '#fed7aa' }}>Your Future.</span>
                </h1>
              </motion.div>
              <motion.div {...fadeUp(0.34)}>
                <p style={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.82, margin: '0 0 40px', maxWidth: 580, fontSize: 'clamp(2.1rem, 3.6vw, 2.6rem)' }}>
                  Discover government-backed programmes, join national tournaments, and connect with mentors who can unlock your potential.{' '}
                  <strong style={{ color: '#fed7aa' }}>From Lagos to Kano. From pitch to boardroom.</strong>
                </p>
              </motion.div>
              <motion.div {...fadeUp(0.46)} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
                <Button component={Link} to="/youth/programs" variant="contained" size="large" endIcon={<ArrowForward sx={{ fontSize: 26 }} />}
                  sx={{ backgroundColor: 'white', color: '#ea580c', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 6 }, py: { xs: 2, sm: 2.5 }, fontSize: 'clamp(2rem, 3.6vw, 2.4rem)', boxShadow: '0 20px 48px rgba(0,0,0,0.22)', '&:hover': { backgroundColor: '#fff7ed', transform: 'translateY(-3px)' } }}>
                  Browse Programmes
                </Button>
                <Button component={Link} to="/youth/tournaments" variant="outlined" size="large"
                  sx={{ borderColor: 'rgba(255,255,255,0.65)', color: 'white', fontWeight: 700, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 6 }, py: { xs: 2, sm: 2.5 }, fontSize: 'clamp(2rem, 3.6vw, 2.4rem)', backdropFilter: 'blur(12px)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.12)' } }}>
                  Tournaments
                </Button>
              </motion.div>
              <motion.div {...fadeUp(0.56)} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {TRUST_BADGES.map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', borderRadius: 999, padding: '8px 18px' }}>
                    <CheckCircle sx={{ color: '#fed7aa', fontSize: 'clamp(1.9rem, 2.8vw, 2.2rem)' }} />
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
                  <div style={{ fontSize: 'clamp(4.4rem, 9vw, 6.4rem)', fontWeight: 900, color: i === 0 ? '#ea580c' : 'white', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
                  <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.1rem)', color: i === 0 ? '#6b7280' : 'rgba(255,255,255,0.82)', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,64px)', backgroundColor: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 'clamp(1.6rem,2.4vw,1.8rem)', marginBottom: 24 }}>Browse by Category</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            {PROGRAM_CATEGORIES.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Button component={Link} to={`/youth/programs?category=${c.id}`}
                  sx={{ backgroundColor: c.bgColor, color: c.color, fontWeight: 700, borderRadius: '14px', textTransform: 'none', px: { xs: 3, sm: 4.5 }, py: { xs: 1.5, sm: 2 }, fontSize: 'clamp(1.8rem, 3vw, 2.1rem)', border: `1.5px solid ${c.color}28`, '&:hover': { backgroundColor: c.color, color: 'white', transform: 'translateY(-3px)', boxShadow: `0 10px 24px ${c.color}44` } }}>
                  <span style={{ marginRight: 10, fontSize: 'clamp(2rem, 3.2vw, 2.4rem)' }}>{c.icon}</span>{c.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: 'clamp(56px,6vw,80px) clamp(20px,5vw,64px)', background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(16px,3vw,28px)' }}>
            {PLATFORM_STATS.map((s, i) => (
              <motion.div key={s.label} {...inViewUp(i * 0.09)} style={{ textAlign: 'center', padding: 'clamp(32px,4vw,48px) clamp(20px,2.5vw,32px)', borderRadius: 22, backgroundColor: 'white', border: '1px solid #fed7aa', boxShadow: '0 4px 20px rgba(234,88,12,0.08)' }}>
                <div style={{ fontSize: 'clamp(4.4rem, 8vw, 6rem)', marginBottom: 12 }}>{s.emoji}</div>
                <div style={{ fontSize: 'clamp(4.4rem, 9vw, 7rem)', fontWeight: 900, color: '#ea580c', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.1rem)', color: '#6b7280', marginTop: 10, fontWeight: 600 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: 'clamp(64px,7vw,112px) clamp(20px,5vw,64px)', backgroundColor: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div {...inViewUp()} style={{ textAlign: 'center', marginBottom: 'clamp(48px,5vw,80px)' }}>
            <h2 style={{ margin: '0 0 18px', fontWeight: 900, color: '#111827', fontSize: 'clamp(4rem, 9vw, 7rem)' }}>How It Works</h2>
            <p style={{ margin: '0 auto', color: '#6b7280', maxWidth: 540, fontSize: 'clamp(2rem, 3.6vw, 2.4rem)' }}>Simple. Open. Empowering.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(24px,3vw,40px)' }}>
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={s.step} {...inViewUp(i * 0.15)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'clamp(32px,4vw,56px)', borderRadius: 24, background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fed7aa' }}>
                <div style={{ width: 'clamp(80px,10vw,100px)', height: 'clamp(80px,10vw,100px)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ORANGE_GRADIENT, boxShadow: '0 12px 28px rgba(234,88,12,0.4)', marginBottom: 28, fontSize: 'clamp(2.8rem,5vw,3.8rem)', fontWeight: 900, color: 'white' }}>
                  {s.step}
                </div>
                <h3 style={{ margin: '0 0 14px', fontSize: 'clamp(2.4rem, 4.4vw, 3rem)', fontWeight: 800, color: '#7c2d12' }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 'clamp(1.9rem, 3.2vw, 2.2rem)', color: '#6b7280', lineHeight: 1.75 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(80px,9vw,128px) clamp(20px,5vw,64px)', textAlign: 'center', background: ORANGE_GRADIENT, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -80, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -80, right: '15%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(253,186,116,0.12)', filter: 'blur(40px)' }} />
        </div>
        <motion.div {...inViewUp()} style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'white', fontWeight: 900, margin: '0 0 24px', fontSize: 'clamp(4.4rem, 11vw, 9rem)', lineHeight: 1.1 }}>
            Your Moment is Now.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(2.2rem, 4.4vw, 2.9rem)', margin: '0 auto 52px', maxWidth: 640, lineHeight: 1.75 }}>
            Join thousands of Nigerian youth building skills, winning tournaments, and creating legacies.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
            <Button component={Link} to="/sign-up" variant="contained" size="large"
              sx={{ backgroundColor: 'white', color: '#ea580c', fontWeight: 900, borderRadius: '16px', textTransform: 'none', px: { xs: 5, sm: 8 }, py: { xs: 2.25, sm: 3 }, fontSize: 'clamp(2.1rem, 3.8vw, 2.6rem)', boxShadow: '0 24px 48px rgba(0,0,0,0.22)', '&:hover': { backgroundColor: '#fff7ed', transform: 'translateY(-3px)' } }}>
              Get Started Free
            </Button>
            <Button component={Link} to="/youth/programs" variant="outlined" size="large" endIcon={<ArrowForward sx={{ fontSize: 28 }} />}
              sx={{ borderColor: 'rgba(255,255,255,0.7)', color: 'white', fontWeight: 700, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 6 }, py: { xs: 2.25, sm: 3 }, fontSize: 'clamp(2rem, 3.4vw, 2.4rem)', backdropFilter: 'blur(12px)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.12)' } }}>
              View All Programmes
            </Button>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
