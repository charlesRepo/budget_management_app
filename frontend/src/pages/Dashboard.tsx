import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Budget Management</h1>
      <p style={styles.subtitle}>Hello, {user?.name || user?.email}!</p>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Getting Started</h2>
        <p style={styles.cardText}>
          Your budget management app is ready. The following features will be available soon:
        </p>
        <ul style={styles.list}>
          <li>Track expenses across Checking and Credit Card accounts</li>
          <li>Manage automatic and manual payments</li>
          <li>Set up custom split ratios</li>
          <li>View monthly budget summaries</li>
          <li>Calculate individual contributions</li>
        </ul>
      </div>

      <div style={styles.info}>
        <p><strong>Logged in as:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  cardText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  list: {
    paddingLeft: '20px',
    color: '#666',
    lineHeight: '1.8',
  },
  info: {
    backgroundColor: '#f9f9f9',
    padding: '16px',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#666',
  },
};

export default Dashboard;
