import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const name = searchParams.get('name');
    const email = searchParams.get('email');

    if (token && userId && role) {
      // Save session
      const session = {
        userId: parseInt(userId),
        name: decodeURIComponent(name),
        email: decodeURIComponent(email),
        role: role.toLowerCase(),
        token: token,
        expiresAt: Date.now() + 86400000 // 24 hours
      };

      localStorage.setItem('hireflow_session', JSON.stringify(session));

      // Redirect based on role
      if (role === 'JOBSEEKER') {
        navigate('/jobs');
      } else {
        navigate('/company/dashboard');
      }
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <div>
        <div className="spinner"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}