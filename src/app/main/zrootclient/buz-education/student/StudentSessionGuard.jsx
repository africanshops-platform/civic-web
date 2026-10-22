import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isStudentSession } from './studentSession';

/**
 * A child's school login can reach only the student pages (the server refuses everything else too). This keeps the screens in line:
 * a student session that wanders anywhere else is sent straight back to the student home.
 */
export default function StudentSessionGuard() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isStudentSession() && !pathname.startsWith('/student')) navigate('/student', { replace: true });
  }, [pathname, navigate]);

  return null;
}
