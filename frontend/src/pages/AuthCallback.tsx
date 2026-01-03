import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('No authentication token received');
        setTimeout(() => navigate('/login?error=no_token'), 2000);
        return;
      }

      try {
        // Store the token
        authService.setToken(token);

        // Fetch user data
        const userData = await authService.getCurrentUser();
        setUser(userData);

        // Redirect to dashboard
        navigate('/');
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate. Please try again.');
        setTimeout(() => navigate('/login?error=auth_failed'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {error ? (
          <>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={styles.title}>Authentication Failed</h2>
            <p style={styles.message}>{error}</p>
            <p style={styles.redirect}>Redirecting to login...</p>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Signing you in...</h2>
            <p style={styles.message}>Please wait while we complete your authentication.</p>
          </>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto 20px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#e74c3c',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333',
  },
  message: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
  },
  redirect: {
    fontSize: '12px',
    color: '#999',
    marginTop: '16px',
  },
};

export default AuthCallback;
