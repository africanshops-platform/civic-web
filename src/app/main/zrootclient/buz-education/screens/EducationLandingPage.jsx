import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import { useSchools } from '../hooks/useEducationRepo';
import { ACCENT } from '../constants';

const STEPS = [
  { step: '01', title: 'Find a school', desc: 'Look through the schools your community has approved, with their classes and teachers.' },
  { step: '02', title: 'Apply or link your child', desc: 'Send an application, or enter the code your child\'s school gave you to follow them.' },
  { step: '03', title: 'Stay close', desc: 'See grades and attendance as the school records them, and read the school\'s notices.' },
];

function Landing() {
  const { isAuthenticated } = useCivicWebAuth();
  const { data } = useSchools({ limit: 1 });
  const total = data?.data?.total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', background: 'white' }}>
      <section style={{ background: ACCENT, padding: 'clamp(64px,9vw,128px) clamp(20px,5vw,64px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ color: 'white', fontWeight: 900, margin: '0 0 20px', fontSize: 'clamp(4rem, 9vw, 7.2rem)', lineHeight: 1.05 }}>
            Your child&apos;s school,<br />in your pocket.
          </motion.h1>
          <p style={{ color: 'rgba(255,255,255,0.92)', maxWidth: 640, fontSize: 'clamp(2rem, 3.4vw, 2.6rem)', lineHeight: 1.7, margin: '0 0 36px' }}>
            Find a school your community has approved, apply, and follow grades, attendance and notices once your child is linked. Free to use.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <Button component={Link} to="/education/schools" variant="contained" sx={{ backgroundColor: 'white', color: '#4338ca', fontWeight: 900, borderRadius: '16px', textTransform: 'none', px: 6, py: 2.4, fontSize: '2rem', '&:hover': { backgroundColor: '#eef2ff' } }}>Find a school</Button>
            <Button component={Link} to={isAuthenticated ? '/education/my-children' : '/sign-in'} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.7)', color: 'white', fontWeight: 700, borderRadius: '16px', textTransform: 'none', px: 5, py: 2.4, fontSize: '2rem' }}>
              {isAuthenticated ? 'My children' : 'Sign in to follow my child'}
            </Button>
            {total != null && <span style={{ color: 'white', fontWeight: 700, fontSize: '1.9rem' }}>{total} {total === 1 ? 'school' : 'schools'} listed</span>}
          </div>
        </div>
      </section>
      <section style={{ padding: 'clamp(56px,7vw,100px) clamp(20px,5vw,64px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 28 }}>
          {STEPS.map((s) => (
            <div key={s.step} style={{ padding: 36, borderRadius: 24, background: '#eef2ff', border: '1px solid #c7d2fe' }}>
              <div style={{ fontWeight: 900, fontSize: '3.2rem', color: '#4f46e5', marginBottom: 12 }}>{s.step}</div>
              <h3 style={{ margin: '0 0 10px', fontWeight: 800, color: '#312e81', fontSize: '2.4rem' }}>{s.title}</h3>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '1.9rem', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function EducationLandingPage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  return <ServiceStatusLandingPage serviceStatus={appSettings?.data?.payload?.digitalEduServiceStatus} ActiveComponent={Landing} isLoading={isLoading} isError={isError} serviceName="Education" />;
}
