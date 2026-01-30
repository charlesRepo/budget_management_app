import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../services/settings';
import type { UpdateSettingsInput } from '../types';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateSettingsInput>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setFormData({
        splitRatioPerson1: data.splitRatioPerson1,
        splitRatioPerson2: data.splitRatioPerson2,
        autoCalculateSplitRatio: data.autoCalculateSplitRatio,
        person1Name: data.person1Name,
        person2Name: data.person2Name,
        checkingBalance: data.checkingBalance,
        creditCardBalance: data.creditCardBalance,
        travelSavings: data.travelSavings,
        homeSavings: data.homeSavings,
        generalSavings: data.generalSavings,
        travelSavingsAssignedTo: data.travelSavingsAssignedTo,
        homeSavingsAssignedTo: data.homeSavingsAssignedTo,
        generalSavingsAssignedTo: data.generalSavingsAssignedTo,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      alert('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate split ratios only if not auto-calculating
    if (!formData.autoCalculateSplitRatio) {
      const ratio1 = formData.splitRatioPerson1 || 0;
      const ratio2 = formData.splitRatioPerson2 || 0;

      if (ratio1 + ratio2 !== 100) {
        alert('Split ratios must sum to 100%');
        return;
      }
    }

    try {
      setSaving(true);
      await settingsService.updateSettings(formData);
      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      alert(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Account</h2>
        <div style={styles.accountInfo}>
          <div>
            <div style={styles.accountLabel}>Logged in as:</div>
            <div style={styles.accountValue}>{user?.name || user?.email}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton} type="button">
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Partner Names</h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>Person 1 Name</label>
            <input
              type="text"
              value={formData.person1Name || ''}
              onChange={(e) => setFormData({ ...formData, person1Name: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Person 2 Name</label>
            <input
              type="text"
              value={formData.person2Name || ''}
              onChange={(e) => setFormData({ ...formData, person2Name: e.target.value })}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Split Ratio</h2>
          <p style={styles.helper}>Configure how expenses are split between partners (must total 100%)</p>

          <div style={styles.formGroup}>
            <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.autoCalculateSplitRatio || false}
                onChange={(e) => setFormData({ ...formData, autoCalculateSplitRatio: e.target.checked })}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              Auto-calculate split ratio based on income
            </label>
            <span style={styles.helperSmall}>
              When enabled, split ratio is automatically calculated from each person's monthly income
            </span>
          </div>

          <div style={styles.ratioContainer}>
            <div style={styles.formGroup}>
              <label style={styles.label}>{formData.person1Name || 'Person 1'} (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.splitRatioPerson1 || ''}
                onChange={(e) =>
                  setFormData({ ...formData, splitRatioPerson1: parseInt(e.target.value) || 0 })
                }
                style={styles.input}
                disabled={formData.autoCalculateSplitRatio}
                required={!formData.autoCalculateSplitRatio}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{formData.person2Name || 'Person 2'} (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.splitRatioPerson2 || ''}
                onChange={(e) =>
                  setFormData({ ...formData, splitRatioPerson2: parseInt(e.target.value) || 0 })
                }
                style={styles.input}
                disabled={formData.autoCalculateSplitRatio}
                required={!formData.autoCalculateSplitRatio}
              />
            </div>
          </div>

          <div style={styles.totalRatio}>
            Total: {(formData.splitRatioPerson1 || 0) + (formData.splitRatioPerson2 || 0)}%
            {(formData.splitRatioPerson1 || 0) + (formData.splitRatioPerson2 || 0) !== 100 && (
              <span style={styles.errorText}> (must equal 100%)</span>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Account Balances</h2>
          <p style={styles.helper}>Enter current balances for accurate calculations (negative for debt)</p>

          <div style={styles.balancesGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Checking Balance ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.checkingBalance || ''}
                onChange={(e) => setFormData({ ...formData, checkingBalance: parseFloat(e.target.value) || 0 })}
                style={styles.input}
                placeholder="0.00"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Credit Card Balance ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.creditCardBalance || ''}
                onChange={(e) => setFormData({ ...formData, creditCardBalance: parseFloat(e.target.value) || 0 })}
                style={styles.input}
                placeholder="0.00"
              />
              <span style={styles.helperSmall}>Use negative value if you owe money</span>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Monthly Savings Goals</h2>
          <p style={styles.helper}>Set monthly savings targets and assign them to individuals or split between partners</p>

          <div style={styles.savingsItemsContainer}>
            {/* Travel Savings */}
            <div style={styles.savingsItem}>
              <div style={styles.savingsItemHeader}>
                <label style={styles.label}>Travel Savings</label>
              </div>
              <div style={styles.savingsItemFields}>
                <div style={styles.formGroup}>
                  <label style={styles.labelSmall}>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.travelSavings || ''}
                    onChange={(e) => setFormData({ ...formData, travelSavings: parseFloat(e.target.value) || 0 })}
                    style={styles.input}
                    placeholder="1000.00"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.labelSmall}>Assigned To</label>
                  <select
                    value={formData.travelSavingsAssignedTo || 'shared'}
                    onChange={(e) => setFormData({ ...formData, travelSavingsAssignedTo: e.target.value as any })}
                    style={styles.select}
                  >
                    <option value="shared">Shared (split by ratio)</option>
                    <option value="person1">{formData.person1Name || 'Person 1'} only</option>
                    <option value="person2">{formData.person2Name || 'Person 2'} only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Home Savings */}
            <div style={styles.savingsItem}>
              <div style={styles.savingsItemHeader}>
                <label style={styles.label}>Home Savings</label>
              </div>
              <div style={styles.savingsItemFields}>
                <div style={styles.formGroup}>
                  <label style={styles.labelSmall}>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.homeSavings || ''}
                    onChange={(e) => setFormData({ ...formData, homeSavings: parseFloat(e.target.value) || 0 })}
                    style={styles.input}
                    placeholder="500.00"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.labelSmall}>Assigned To</label>
                  <select
                    value={formData.homeSavingsAssignedTo || 'shared'}
                    onChange={(e) => setFormData({ ...formData, homeSavingsAssignedTo: e.target.value as any })}
                    style={styles.select}
                  >
                    <option value="shared">Shared (split by ratio)</option>
                    <option value="person1">{formData.person1Name || 'Person 1'} only</option>
                    <option value="person2">{formData.person2Name || 'Person 2'} only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* General Savings */}
            <div style={styles.savingsItem}>
              <div style={styles.savingsItemHeader}>
                <label style={styles.label}>General Savings</label>
              </div>
              <div style={styles.savingsItemFields}>
                <div style={styles.formGroup}>
                  <label style={styles.labelSmall}>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.generalSavings || ''}
                    onChange={(e) => setFormData({ ...formData, generalSavings: parseFloat(e.target.value) || 0 })}
                    style={styles.input}
                    placeholder="1000.00"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.labelSmall}>Assigned To</label>
                  <select
                    value={formData.generalSavingsAssignedTo || 'shared'}
                    onChange={(e) => setFormData({ ...formData, generalSavingsAssignedTo: e.target.value as any })}
                    style={styles.select}
                  >
                    <option value="shared">Shared (split by ratio)</option>
                    <option value="person1">{formData.person1Name || 'Person 1'} only</option>
                    <option value="person2">{formData.person2Name || 'Person 2'} only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', fontSize: '14px', fontWeight: '500', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            Total Monthly Savings: ${((formData.travelSavings || 0) + (formData.homeSavings || 0) + (formData.generalSavings || 0)).toFixed(2)}
          </div>
        </div>

        <div style={styles.actions}>
          <button type="submit" style={styles.saveButton} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
  loading: { textAlign: 'center', padding: '40px' },
  title: { fontSize: '28px', marginBottom: '24px' },
  card: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: { fontSize: '20px', marginBottom: '16px' },
  helper: { fontSize: '14px', color: '#666', marginBottom: '16px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' },
  labelSmall: { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#555' },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  savingsItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  savingsItem: {
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  savingsItemHeader: {
    marginBottom: '12px',
  },
  savingsItemFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  ratioContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  balancesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  helperSmall: { display: 'block', fontSize: '12px', color: '#999', marginTop: '4px' },
  totalRatio: { marginTop: '16px', fontSize: '16px', fontWeight: '500' },
  errorText: { color: '#e74c3c' },
  actions: { display: 'flex', justifyContent: 'flex-end' },
  saveButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  accountInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  accountLabel: {
    fontSize: '12px',
    color: '#999',
    marginBottom: '4px',
  },
  accountValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '10px 20px',
    fontSize: '14px',
    color: '#e74c3c',
    backgroundColor: 'white',
    border: '1px solid #e74c3c',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default Settings;
