import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowForward, CheckCircle } from '@mui/icons-material';
import CampaignCard from '../components/CampaignCard';
import { mockCampaigns, CAMPAIGN_STATS, CAMPAIGN_CATEGORIES } from '../mock';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
};

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

const PLATFORM_STATS = [
  { emoji: '💰', value: `₦${(CAMPAIGN_STATS.totalRaised / 1_000_000).toFixed(1)}M`, label: 'Total Raised' },
  { emoji: '👥', value: CAMPAIGN_STATS.totalContributors.toLocaleString(),           label: 'Contributors' },
  { emoji: '🔥', value: CAMPAIGN_STATS.activeCampaigns,                              label: 'Active Campaigns' },
  { emoji: '🏆', value: CAMPAIGN_STATS.completedCampaigns,                           label: 'Goals Reached' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose a Campaign',   desc: 'Browse verified campaigns in your LGA, state, or across Nigeria — filtered by category and real-world impact.' },
  { step: '02', title: 'Contribute Securely', desc: 'Contribute any amount via Paystack. Receive an instant receipt and watch your impact grow in real time.' },
  { step: '03', title: 'Track Every Naira',   desc: 'Follow live project milestones, contractor updates, and full fund utilization as work happens on the ground.' },
];

const TRUST_BADGES = ['Transparent Funding', 'Paystack Secured', 'Verified Projects', 'Receipts Issued'];

const ORANGE_GRADIENT = 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)';
const WARM_BG         = 'linear-gradient(180deg, #fafaf9 0%, #fff7ed 100%)';

/* ── sub-components ── */
function HeroStatCard({ emoji, value, label, primary }) {
  return (
    <div style={{
      borderRadius: 24,
      padding: 'clamp(20px, 3vw, 32px) clamp(18px, 2.6vw, 28px)',
      background: primary ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.35)',
      boxShadow: primary ? '0 24px 48px rgba(0,0,0,0.18)' : 'none',
    }}>
      <div style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)', marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 'clamp(2rem, 4.2vw, 3.2rem)', fontWeight: 900, color: primary ? '#ea580c' : 'white', lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: F.meta, color: primary ? '#6b7280' : 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

function StepCard({ step, title, desc, delay }) {
  return (
    <motion.div {...inViewUp(delay)} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: 'clamp(28px, 4vw, 48px)', borderRadius: 24,
      background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)',
      border: '1px solid #fdba74',
    }}>
      <div style={{
        width: 'clamp(56px, 8vw, 80px)', height: 'clamp(56px, 8vw, 80px)',
        borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: ORANGE_GRADIENT, boxShadow: '0 12px 28px rgba(234,88,12,0.4)',
        marginBottom: 24, fontSize: F.subH, fontWeight: 900, color: 'white',
      }}>
        {step}
      </div>
      <h3 style={{ margin: '0 0 12px', fontSize: F.subH, fontWeight: 800, color: '#1f2937' }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: F.body, color: '#6b7280', lineHeight: 1.75 }}>
        {desc}
      </p>
    </motion.div>
  );
}

/* ── main component ── */
export default function CivicTaxLandingPage() {
  const featured = mockCampaigns.filter((c) => c.status === 'active').slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', backgroundColor: 'white' }}>

      {/* ══════ HERO ══════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: ORANGE_GRADIENT }}>
        <motion.div animate={{ scale: [1, 1.25, 1], rotate: [0, 12, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -160, left: -160, width: 480, height: 480, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(48px)', pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1, 1.18, 1], rotate: [0, -9, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
          style={{ position: 'absolute', bottom: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'rgba(253,224,71,0.14)', filter: 'blur(48px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.09, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,5vw,64px)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center' }}>

            {/* Left: copy */}
            <div>
              <motion.div {...fadeUp(0.1)}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: 'clamp(7px,1vw,10px) clamp(16px,2.4vw,22px)', marginBottom: 28, border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)' }}>
                  <span style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)' }}>🇳🇬</span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: F.meta }}>Civic Innovation — Nigeria First</span>
                </div>
              </motion.div>

              <motion.div {...fadeUp(0.22)}>
                <h1 style={{ color: 'white', fontWeight: 900, lineHeight: 1.08, margin: '0 0 20px', fontSize: 'clamp(2.6rem, 6.5vw, 5.5rem)' }}>
                  Fund the Nigeria
                  <span style={{ display: 'block', color: '#fde047' }}>You Want to Live In.</span>
                </h1>
              </motion.div>

              <motion.div {...fadeUp(0.34)}>
                <p style={{ color: 'rgba(255,255,255,0.93)', lineHeight: 1.82, margin: '0 0 36px', maxWidth: 580, fontSize: F.body }}>
                  The Voluntary Civic Tax system lets every Nigerian contribute to verified,
                  transparent community projects — from security to agriculture — right down to their LGA.{' '}
                  <strong style={{ color: '#fde047' }}>Every naira is tracked. Every project is accountable.</strong>
                </p>
              </motion.div>

              <motion.div {...fadeUp(0.46)} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
                <Button component={Link} to="/civictax/campaigns" variant="contained" size="large" endIcon={<ArrowForward />}
                  style={{ fontSize: F.btn }}
                  sx={{ backgroundColor: 'white', color: '#ea580c', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: { xs: 3.5, sm: 5 }, py: { xs: 1.75, sm: 2.25 }, boxShadow: '0 20px 48px rgba(0,0,0,0.22)', '&:hover': { backgroundColor: '#fff7ed', transform: 'translateY(-3px)' } }}>
                  Browse Campaigns
                </Button>
                <Button component={Link} to="/sign-in" variant="outlined" size="large"
                  style={{ fontSize: F.btn }}
                  sx={{ borderColor: 'rgba(255,255,255,0.65)', color: 'white', fontWeight: 700, borderRadius: '16px', textTransform: 'none', px: { xs: 3.5, sm: 5 }, py: { xs: 1.75, sm: 2.25 }, backdropFilter: 'blur(12px)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.12)' } }}>
                  Sign In
                </Button>
              </motion.div>

              <motion.div {...fadeUp(0.56)} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {TRUST_BADGES.map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)', borderRadius: 999, padding: 'clamp(5px,0.8vw,8px) clamp(12px,1.8vw,18px)' }}>
                    <CheckCircle style={{ color: '#fde047', fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
                    <span style={{ color: 'white', fontWeight: 600, fontSize: F.meta }}>{b}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: stat cards */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {PLATFORM_STATS.map((s, i) => <HeroStatCard key={s.label} {...s} primary={i === 0} />)}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ CATEGORIES STRIP ══════ */}
      <section style={{ padding: 'clamp(36px,5vw,56px) clamp(20px,5vw,64px)', backgroundColor: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: F.meta, marginBottom: 20 }}>
            Browse by Category
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {CAMPAIGN_CATEGORIES.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Button component={Link} to={`/civictax/campaigns?category=${cat.id}`}
                  style={{ fontSize: F.meta }}
                  sx={{ backgroundColor: cat.bgColor, color: cat.color, fontWeight: 700, borderRadius: '14px', textTransform: 'none', px: { xs: 2.5, sm: 3.5 }, py: { xs: 1.2, sm: 1.5 }, border: `1.5px solid ${cat.color}28`, '&:hover': { backgroundColor: cat.color, color: 'white', transform: 'translateY(-3px)', boxShadow: `0 10px 24px ${cat.color}44` } }}>
                  <span style={{ marginRight: 8, fontSize: F.body }}>{cat.icon}</span>
                  {cat.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ IMPACT STATS ══════ */}
      <section style={{ padding: 'clamp(48px,6vw,72px) clamp(20px,5vw,64px)', background: 'linear-gradient(180deg,#fff7ed 0%,#ffedd5 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(16px,3vw,28px)' }}>
            {PLATFORM_STATS.map((s, i) => (
              <motion.div key={s.label} {...inViewUp(i * 0.09)} style={{ textAlign: 'center', padding: 'clamp(22px,4vw,36px) clamp(16px,2.5vw,24px)', borderRadius: 20, backgroundColor: 'white', border: '1px solid #fdba74', boxShadow: '0 4px 20px rgba(234,88,12,0.08)' }}>
                <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 10 }}>{s.emoji}</div>
                <div style={{ fontSize: 'clamp(2rem, 4.2vw, 3.2rem)', fontWeight: 900, color: '#ea580c', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: F.meta, color: '#6b7280', marginTop: 8, fontWeight: 600 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURED CAMPAIGNS ══════ */}
      <section style={{ padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,64px)', background: WARM_BG }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div {...inViewUp()} style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,56px)' }}>
            <div style={{ display: 'inline-block', background: '#fff7ed', color: '#ea580c', fontWeight: 700, fontSize: F.meta, padding: 'clamp(5px,0.8vw,8px) clamp(14px,2vw,20px)', borderRadius: 999, border: '1px solid #fdba74', marginBottom: 18 }}>
              🔥 Featured Campaigns
            </div>
            <h2 style={{ margin: '0 0 16px', fontWeight: 900, color: '#1f2937', fontSize: F.sectionH }}>
              Active Campaigns Need You
            </h2>
            <p style={{ margin: '0 auto', color: '#6b7280', maxWidth: 600, fontSize: F.body, lineHeight: 1.7 }}>
              Real campaigns. Real impact. Real people in your community waiting for change.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 'clamp(20px,3vw,32px)', marginBottom: 'clamp(32px,4vw,48px)' }}>
            {featured.map((c, i) => <CampaignCard key={c.id} campaign={c} index={i} />)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button component={Link} to="/civictax/campaigns" variant="contained" size="large" endIcon={<ArrowForward />}
              style={{ fontSize: F.btn }}
              sx={{ background: ORANGE_GRADIENT, color: 'white', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 6 }, py: { xs: 1.75, sm: 2.25 }, boxShadow: '0 10px 28px rgba(234,88,12,0.38)', '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', transform: 'translateY(-3px)' } }}>
              See All Campaigns
            </Button>
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section style={{ padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,64px)', backgroundColor: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div {...inViewUp()} style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,64px)' }}>
            <h2 style={{ margin: '0 0 16px', fontWeight: 900, color: '#1f2937', fontSize: F.sectionH }}>
              How It Works
            </h2>
            <p style={{ margin: '0 auto', color: '#6b7280', maxWidth: 540, fontSize: F.body }}>
              Three simple steps. Real community impact. Full transparency.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(20px,3vw,36px)' }}>
            {HOW_IT_WORKS.map((s, i) => <StepCard key={s.step} {...s} delay={i * 0.15} />)}
          </div>
        </div>
      </section>

      {/* ══════ WHY IT MATTERS ══════ */}
      <section style={{ padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,64px)', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'clamp(36px,5vw,64px)', alignItems: 'center' }}>
            <motion.div {...inViewUp()}>
              <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.2)', color: '#f97316', fontWeight: 700, fontSize: F.meta, padding: 'clamp(5px,0.8vw,8px) clamp(14px,2vw,20px)', borderRadius: 999, marginBottom: 20, border: '1px solid rgba(249,115,22,0.35)' }}>
                💡 Why This Matters
              </div>
              <h2 style={{ color: 'white', fontWeight: 900, margin: '0 0 20px', fontSize: F.sectionH, lineHeight: 1.15 }}>
                No country thrives without{' '}
                <span style={{ color: '#f97316' }}>community ownership.</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, margin: '0 0 32px', fontSize: F.body }}>
                Nigeria's challenges — from security gaps to agricultural underfunding — cannot wait for government alone.
                When citizens take direct ownership of their communities through voluntary civic investment,
                real change happens faster, more transparently, and more sustainably.
              </p>
              <Button component={Link} to="/sign-up" variant="contained" size="large"
                style={{ fontSize: F.btn }}
                sx={{ background: ORANGE_GRADIENT, color: 'white', fontWeight: 800, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 5 }, py: { xs: 1.75, sm: 2 }, boxShadow: '0 10px 28px rgba(234,88,12,0.4)', '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', transform: 'translateY(-3px)' } }}>
                Create Free Account
              </Button>
            </motion.div>

            <motion.div {...inViewUp(0.2)} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.6vw, 16px)' }}>
              {[
                { emoji: '🛡️', title: 'Security',    text: 'Fund local security initiatives before incidents happen, not after.' },
                { emoji: '🌾', title: 'Agriculture',  text: 'Back smallholder farmers who feed your community every day.' },
                { emoji: '🏥', title: 'Healthcare',   text: "Ensure the PHC in your ward has medicines when they're needed." },
                { emoji: '📚', title: 'Education',    text: 'Build the skills centre that lifts 300 youth out of unemployment.' },
              ].map((item, i) => (
                <motion.div key={item.title} {...inViewUp(0.2 + i * 0.1)} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 'clamp(14px,2vw,20px)', borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: 'clamp(1.4rem, 2.4vw, 2rem)', flexShrink: 0 }}>{item.emoji}</span>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: F.body, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: F.meta, lineHeight: 1.6 }}>{item.text}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section style={{ padding: 'clamp(72px,9vw,112px) clamp(20px,5vw,64px)', textAlign: 'center', background: ORANGE_GRADIENT, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -80, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -80, right: '15%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(253,224,71,0.1)', filter: 'blur(40px)' }} />
        </div>
        <motion.div {...inViewUp()} style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'white', fontWeight: 900, margin: '0 0 20px', fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)', lineHeight: 1.1 }}>
            Ready to Build Nigeria Together?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: F.body, margin: '0 auto 44px', maxWidth: 600, lineHeight: 1.75 }}>
            Every contribution, no matter how small, is a vote for the Nigeria you believe in.
            Join thousands of Nigerians already making their communities better.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            <Button component={Link} to="/sign-up" variant="contained" size="large"
              style={{ fontSize: F.btn }}
              sx={{ backgroundColor: 'white', color: '#ea580c', fontWeight: 900, borderRadius: '16px', textTransform: 'none', px: { xs: 5, sm: 7 }, py: { xs: 2, sm: 2.5 }, boxShadow: '0 24px 48px rgba(0,0,0,0.22)', '&:hover': { backgroundColor: '#fff7ed', transform: 'translateY(-3px)' } }}>
              Join the Movement
            </Button>
            <Button component={Link} to="/civictax/campaigns" variant="outlined" size="large" endIcon={<ArrowForward />}
              style={{ fontSize: F.btn }}
              sx={{ borderColor: 'rgba(255,255,255,0.7)', color: 'white', fontWeight: 700, borderRadius: '16px', textTransform: 'none', px: { xs: 4, sm: 5 }, py: { xs: 2, sm: 2.5 }, backdropFilter: 'blur(12px)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.12)' } }}>
              Browse Campaigns
            </Button>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
