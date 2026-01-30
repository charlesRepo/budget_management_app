import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error');

  React.useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Budget Management App</h1>
        <p style={styles.subtitle}>Manage your household budget with ease</p>

        {error && (
          <div style={styles.error}>
            {error === 'auth_failed' && 'Authentication failed. Please try again.'}
            {error === 'server_error' && 'Server error. Please try again later.'}
            {!['auth_failed', 'server_error'].includes(error) && 'An error occurred. Please try again.'}
          </div>
        )}

        <button onClick={login} style={styles.button}>
          <svg style={styles.icon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <p style={styles.footer}>
          This app is for authorized users only. Please sign in with your authorized Google account.
        </p>
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
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.xxxl,
    borderRadius: borderRadius.md,
    boxShadow: shadows.lg,
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  subtitle: {
    fontSize: '14px',
    color: colors.textLight,
    marginBottom: spacing.xxxl,
  },
  error: {
    backgroundColor: colors.errorLight,
    color: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    fontSize: '14px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    padding: `${spacing.md} ${spacing.xxl}`,
    fontSize: '16px',
    fontWeight: '500' as const,
    color: colors.text,
    backgroundColor: colors.white,
    border: `2px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  icon: {
    width: '20px',
    height: '20px',
  },
  footer: {
    marginTop: spacing.xxl,
    fontSize: '12px',
    color: colors.textMuted,
    lineHeight: '1.5',
  },
};

export default Login;
