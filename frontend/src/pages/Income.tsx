import React, { useState, useEffect } from 'react';
import { incomeService } from '../services/income';
import { settingsService } from '../services/settings';
import type { Income, CreateIncomeInput, Settings, PaymentPeriod } from '../types';

const IncomeManagement: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [formData, setFormData] = useState<CreateIncomeInput>({
    personName: '',
    amount: 0,
    month: selectedMonth,
    paymentPeriod: 'part1',
  });

  const hasInheritedRecords = incomes.some(income => income.isInherited);

  useEffect(() => {
    fetchData();
    // Update form data month when selected month changes
    setFormData(prev => ({ ...prev, month: selectedMonth }));
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incomeData, settingsData] = await Promise.all([
        incomeService.getIncome(selectedMonth),
        settingsService.getSettings(),
      ]);
      setIncomes(incomeData);
      setSettings(settingsData);

      // Set initial person name if not already set
      if (!formData.personName && settingsData.person1Name) {
        setFormData(prev => ({ ...prev, personName: settingsData.person1Name }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await incomeService.createIncome(formData);
      fetchData();
      setFormData({
        personName: settings?.person1Name || '',
        amount: 0,
        month: selectedMonth,
        paymentPeriod: 'part1'
      });
    } catch (error) {
      console.error('Failed to create income:', error);
      alert('Failed to add income');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this income record?')) return;
    try {
      await incomeService.deleteIncome(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete income:', error);
      alert('Failed to delete income');
    }
  };

  const handleApplyInherited = async () => {
    if (!window.confirm('Apply all inherited income records for this month?')) return;
    try {
      setApplying(true);
      await incomeService.applyInheritedIncome(selectedMonth);
      fetchData();
    } catch (error) {
      console.error('Failed to apply inherited income:', error);
      alert('Failed to apply inherited income');
    } finally {
      setApplying(false);
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Income Management</h1>

      <div style={styles.monthSelector}>
        <label>Month: </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.card}>
        <h2>Add Income</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <select
            value={formData.personName}
            onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
            required
            style={styles.input}
          >
            <option value="">Select Person</option>
            {settings?.person1Name && <option value={settings.person1Name}>{settings.person1Name}</option>}
            {settings?.person2Name && <option value={settings.person2Name}>{settings.person2Name}</option>}
          </select>
          <select
            value={formData.paymentPeriod}
            onChange={(e) => setFormData({ ...formData, paymentPeriod: e.target.value as PaymentPeriod })}
            required
            style={styles.input}
          >
            <option value="part1">Part 1</option>
            <option value="part2">Part 2</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Add Income</button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2>Income Records for {selectedMonth}</h2>
          {hasInheritedRecords && (
            <button
              onClick={handleApplyInherited}
              disabled={applying}
              style={styles.applyButton}
            >
              {applying ? 'Applying...' : 'Apply for This Month'}
            </button>
          )}
        </div>

        {hasInheritedRecords && (
          <div style={styles.inheritedNotice}>
            <strong>ℹ️ Inherited Income:</strong> These records are from the previous month. Click "Apply for This Month" to save them for {selectedMonth}.
          </div>
        )}

        {incomes.length === 0 ? (
          <p>No income records for this month</p>
        ) : (
          <>
            {incomes.map((income) => (
              <div
                key={income.id}
                style={{
                  ...styles.incomeItem,
                  ...(income.isInherited ? styles.inheritedItem : {}),
                }}
              >
                <div>
                  <strong>{income.personName}</strong> ({income.paymentPeriod === 'part1' ? 'Part 1' : 'Part 2'}): ${income.amount.toFixed(2)}
                  {income.isInherited && (
                    <span style={styles.inheritedBadge}> (Inherited from {income.originalMonth})</span>
                  )}
                </div>
                {!income.isInherited && (
                  <button onClick={() => handleDelete(income.id)} style={styles.deleteButton}>
                    Delete
                  </button>
                )}
              </div>
            ))}
            <div style={styles.total}>
              <strong>Total: ${totalIncome.toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
  loading: { textAlign: 'center', padding: '40px' },
  title: { fontSize: '28px', marginBottom: '24px' },
  monthSelector: { marginBottom: '24px' },
  card: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  applyButton: { padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
  inheritedNotice: { padding: '12px', backgroundColor: '#e8f4f8', border: '1px solid #bee5eb', borderRadius: '4px', marginBottom: '16px', fontSize: '14px', color: '#0c5460' },
  form: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', flex: '1', minWidth: '150px' },
  button: { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  incomeItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee' },
  inheritedItem: { backgroundColor: '#f8f9fa', opacity: 0.85 },
  inheritedBadge: { fontSize: '12px', color: '#6c757d', fontWeight: 'normal' },
  deleteButton: { padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  total: { marginTop: '16px', fontSize: '18px', textAlign: 'right' },
};

export default IncomeManagement;
