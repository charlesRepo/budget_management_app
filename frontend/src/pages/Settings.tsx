import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/settings';
import type { Settings as SettingsType, UpdateSettingsInput } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateSettingsInput>({});
  const [showBalances, setShowBalances] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setFormData({
        splitRatioPerson1: data.splitRatioPerson1,
        splitRatioPerson2: data.splitRatioPerson2,
        person1Name: data.person1Name,
        person2Name: data.person2Name,
        checkingBalance: data.checkingBalance,
        creditCardBalance: data.creditCardBalance,
        lineOfCreditBalance: data.lineOfCreditBalance,
        studentLineOfCreditBalance: data.studentLineOfCreditBalance,
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

    // Validate split ratios
    const ratio1 = formData.splitRatioPerson1 || 0;
    const ratio2 = formData.splitRatioPerson2 || 0;

    if (ratio1 + ratio2 !== 100) {
      alert('Split ratios must sum to 100%');
      return;
    }

    try {
      setSaving(true);
      const updated = await settingsService.updateSettings(formData);
      setSettings(updated);
      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      alert(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>

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
                required
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
                required
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

            <div style={styles.formGroup}>
              <label style={styles.label}>Line of Credit Balance ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.lineOfCreditBalance || ''}
                onChange={(e) => setFormData({ ...formData, lineOfCreditBalance: parseFloat(e.target.value) || 0 })}
                style={styles.input}
                placeholder="0.00"
              />
              <span style={styles.helperSmall}>Use negative value for debt</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Student Line of Credit Balance ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.studentLineOfCreditBalance || ''}
                onChange={(e) => setFormData({ ...formData, studentLineOfCreditBalance: parseFloat(e.target.value) || 0 })}
                style={styles.input}
                placeholder="0.00"
              />
              <span style={styles.helperSmall}>Use negative value for debt</span>
            </div>
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
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
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
};

export default Settings;
