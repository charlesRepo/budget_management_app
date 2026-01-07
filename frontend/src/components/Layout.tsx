import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
          <h1 style={styles.logo} onClick={() => navigate('/')}>CRH Budget Management App</h1>

          <div style={styles.userSection}>
              <span style={styles.userName}>{user?.name || user?.email}</span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                  Logout
              </button>
          </div>

        <div style={styles.headerContent}>
          <div style={styles.leftSection}>
            <nav style={styles.nav}>
              <button
                onClick={() => navigate('/')}
                style={{
                  ...styles.navLink,
                  ...(isActive('/') && location.pathname === '/' ? styles.navLinkActive : {}),
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/expenses')}
                style={{
                  ...styles.navLink,
                  ...(isActive('/expenses') ? styles.navLinkActive : {}),
                }}
              >
                Expenses
              </button>
              <button
                onClick={() => navigate('/income')}
                style={{
                  ...styles.navLink,
                  ...(isActive('/income') ? styles.navLinkActive : {}),
                }}
              >
                Income
              </button>
              <button
                onClick={() => navigate('/settings')}
                style={{
                  ...styles.navLink,
                  ...(isActive('/settings') ? styles.navLinkActive : {}),
                }}
              >
                Settings
              </button>
            </nav>
          </div>

        </div>
      </header>
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e5e5',
    padding: '0 20px',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '64px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    cursor: 'pointer',
    textAlign: 'center',
    padding: '20px 0',
    borderBottom: '1px solid #e5e5e5',
  },
  nav: {
    display: 'flex',
    gap: '8px',
  },
  navLink: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#666',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    fontWeight: '500',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    gap: '16px',
  },
  userName: {
    fontSize: '14px',
    color: '#666',
  },
  logoutButton: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#666',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: {
    minHeight: 'calc(100vh - 64px)',
  },
};

export default Layout;
