import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../services/settings';
import type { UpdateSettingsInput } from '../types';
import { colors, spacing, borderRadius, commonStyles, pageContainer } from '../styles/theme';

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
  container: { ...pageContainer },
  loading: { textAlign: 'center', padding: '40px', color: colors.textLight },
  title: { fontSize: '28px', marginBottom: spacing.xxl },
  card: {
    ...commonStyles.card,
    marginBottom: spacing.xxl,
  },
  sectionTitle: { ...commonStyles.sectionTitle },
  helper: { fontSize: '14px', color: colors.textLight, marginBottom: spacing.lg },
  formGroup: { marginBottom: spacing.xl },
  label: { ...commonStyles.label },
  labelSmall: { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: spacing.sm, color: colors.textLight },
  input: {
    ...commonStyles.input,
  },
  select: {
    ...commonStyles.select,
  },
  savingsItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  },
  savingsItem: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border}`,
  },
  savingsItemHeader: {
    marginBottom: spacing.md,
  },
  savingsItemFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.md,
  },
  ratioContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg },
  helperSmall: { ...commonStyles.helperText },
  totalRatio: { marginTop: spacing.lg, fontSize: '16px', fontWeight: '500' },
  errorText: { color: colors.error },
  actions: { display: 'flex', justifyContent: 'flex-end', marginTop: spacing.xxl },
  saveButton: {
    ...commonStyles.button,
  },
  accountInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  accountLabel: {
    fontSize: '12px',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  accountValue: {
    fontSize: '14px',
    color: colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: '14px',
    color: colors.error,
    backgroundColor: colors.white,
    border: `2px solid ${colors.error}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '600',
  },
};

export default Settings;
