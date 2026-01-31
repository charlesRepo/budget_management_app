import React, { useState, useEffect } from 'react';
import { incomeService } from '../services/income';
import { settingsService } from '../services/settings';
import { accountCreditService } from '../services/accountCredits';
import type { Income, CreateIncomeInput, Settings, PaymentPeriod, AccountCredit, CreateAccountCreditInput, AccountType } from '../types';
import { colors, spacing, borderRadius, commonStyles, pageContainer } from '../styles/theme';

const IncomeManagement: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Try to load from localStorage, fallback to current month
    const saved = localStorage.getItem('selectedMonth');
    return saved || new Date().toISOString().slice(0, 7);
  });
  const [formData, setFormData] = useState<CreateIncomeInput>({
    personName: '',
    amount: 0,
    month: selectedMonth,
    paymentPeriod: 'part1',
  });

  // Account Credits state
  const [credits, setCredits] = useState<AccountCredit[]>([]);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [editingCredit, setEditingCredit] = useState<AccountCredit | null>(null);
  const [creditFormData, setCreditFormData] = useState<CreateAccountCreditInput>({
    description: '',
    amount: 0,
    accountType: 'checking',
    month: selectedMonth,
  });

  const hasInheritedIncome = incomes.some(income => income.isInherited);
  const hasInheritedCredits = credits.some(credit => credit.isInherited);
  const hasInheritedRecords = hasInheritedIncome || hasInheritedCredits;

  useEffect(() => {
    fetchData();
    // Update form data month when selected month changes
    setFormData(prev => ({ ...prev, month: selectedMonth }));
    setCreditFormData(prev => ({ ...prev, month: selectedMonth }));
    // Save selected month to localStorage
    localStorage.setItem('selectedMonth', selectedMonth);
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incomeData, settingsData, creditsData] = await Promise.all([
        incomeService.getIncome(selectedMonth),
        settingsService.getSettings(),
        accountCreditService.getAccountCredits(selectedMonth),
      ]);
      setIncomes(incomeData);
      setSettings(settingsData);
      setCredits(creditsData);

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
    if (!window.confirm('Apply all inherited income and credits for this month?')) return;
    try {
      setApplying(true);
      await incomeService.applyAllInherited(selectedMonth);
      fetchData();
    } catch (error) {
      console.error('Failed to apply inherited records:', error);
      alert('Failed to apply inherited records');
    } finally {
      setApplying(false);
    }
  };

  // Account Credit handlers
  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCredit) {
        await accountCreditService.updateAccountCredit(editingCredit.id, creditFormData);
      } else {
        await accountCreditService.createAccountCredit(creditFormData);
      }
      fetchData();
      resetCreditForm();
    } catch (error) {
      console.error('Failed to save credit:', error);
      alert('Failed to save account credit');
    }
  };

  const handleCreditEdit = (credit: AccountCredit) => {
    setEditingCredit(credit);
    setCreditFormData({
      description: credit.description,
      amount: credit.amount,
      accountType: credit.accountType,
      month: credit.month,
    });
    setShowCreditForm(true);
  };

  const handleCreditDelete = async (id: string) => {
    if (!window.confirm('Delete this account credit?')) return;
    try {
      await accountCreditService.deleteAccountCredit(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete credit:', error);
      alert('Failed to delete account credit');
    }
  };

  const resetCreditForm = () => {
    setShowCreditForm(false);
    setEditingCredit(null);
    setCreditFormData({
      description: '',
      amount: 0,
      accountType: 'checking',
      month: selectedMonth,
    });
  };

  const formatAccountType = (accountType: AccountType): string => {
    const typeMap: Record<AccountType, string> = {
      checking: 'CHK',
      credit_card: 'CC',
    };
    return typeMap[accountType] || accountType;
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalCredits = credits.reduce((sum, credit) => sum + credit.amount, 0);

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

      {hasInheritedRecords && (
        <div style={styles.inheritedGlobalNotice}>
          <div>
            <strong>ℹ️ Inherited Records Found</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
              Income and/or credit records from the previous month are displayed below. Click the button to save them for {selectedMonth}.
            </p>
          </div>
          <button
            onClick={handleApplyInherited}
            disabled={applying}
            style={styles.applyButton}
          >
            {applying ? 'Applying...' : 'Apply for This Month'}
          </button>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2>Income Records for {selectedMonth}</h2>
        </div>

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

      {/* Account Credits Section */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2>Account Credits for {selectedMonth}</h2>
            <p style={styles.helper}>Track money added TO accounts (government payments, tax refunds, etc.)</p>
          </div>
          <button
            onClick={() => setShowCreditForm(!showCreditForm)}
            style={showCreditForm ? styles.cancelButton : styles.button}
          >
            {showCreditForm ? 'Cancel' : '+ Add Credit'}
          </button>
        </div>

        {showCreditForm && (
          <form onSubmit={handleCreditSubmit} style={styles.creditForm}>
            <input
              type="text"
              placeholder="Description (e.g., GST Credit)"
              value={creditFormData.description}
              onChange={(e) => setCreditFormData({ ...creditFormData, description: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={creditFormData.amount || ''}
              onChange={(e) => setCreditFormData({ ...creditFormData, amount: parseFloat(e.target.value) || 0 })}
              required
              style={styles.input}
            />
            <select
              value={creditFormData.accountType}
              onChange={(e) => setCreditFormData({ ...creditFormData, accountType: e.target.value as AccountType })}
              required
              style={styles.input}
            >
              <option value="checking">Checking</option>
              <option value="credit_card">Credit Card</option>
            </select>
            <button type="submit" style={styles.button}>
              {editingCredit ? 'Update Credit' : 'Add Credit'}
            </button>
            {editingCredit && (
              <button type="button" onClick={resetCreditForm} style={styles.cancelButton}>
                Cancel
              </button>
            )}
          </form>
        )}

        {credits.length === 0 ? (
          <p>No account credits for this month</p>
        ) : (
          <>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div style={{ flex: 3 }}>Description</div>
                <div style={{ flex: 1.5 }}>Amount</div>
                <div style={{ flex: 1.5 }}>Account</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Actions</div>
              </div>
              {credits.map((credit) => (
                <div
                  key={credit.id}
                  style={{
                    ...styles.tableRow,
                    ...(credit.isInherited ? styles.inheritedTableRow : {}),
                  }}
                >
                  <div style={{ flex: 3 }}>
                    {credit.description}
                    {credit.isInherited && (
                      <span style={styles.inheritedBadge}> (Inherited from {credit.originalMonth})</span>
                    )}
                  </div>
                  <div style={{ flex: 1.5 }}>${credit.amount.toFixed(2)}</div>
                  <div style={{ flex: 1.5 }}>{formatAccountType(credit.accountType)}</div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                    {!credit.isInherited && (
                      <>
                        <button onClick={() => handleCreditEdit(credit)} style={styles.editButton}>
                          Edit
                        </button>
                        <button onClick={() => handleCreditDelete(credit.id)} style={styles.deleteButton}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.total}>
              <strong>Total Credits: ${totalCredits.toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { ...pageContainer },
  loading: { textAlign: 'center', padding: '40px', color: colors.textLight },
  title: { fontSize: '28px', marginBottom: spacing.xxl },
  monthSelector: { marginBottom: spacing.xxl },
  card: {
    ...commonStyles.card,
    marginBottom: spacing.lg,
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md, flexWrap: 'wrap' },
  applyButton: {
    ...commonStyles.button,
    backgroundColor: colors.success,
    borderColor: colors.success,
    whiteSpace: 'nowrap',
  },
  inheritedNotice: {
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    border: `1px solid ${colors.primary}`,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    fontSize: '14px',
    color: colors.primaryDark,
  },
  inheritedGlobalNotice: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
    border: `1px solid ${colors.primary}`,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
    color: colors.primaryDark,
    flexWrap: 'wrap',
  },
  helper: { ...commonStyles.helperText, margin: '4px 0 0 0' },
  form: { display: 'flex', gap: spacing.md, flexWrap: 'wrap' },
  creditForm: {
    display: 'flex',
    gap: spacing.md,
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  input: {
    ...commonStyles.input,
    flex: '1',
    minWidth: '150px',
  },
  button: { ...commonStyles.button },
  cancelButton: {
    ...commonStyles.buttonSecondary,
    backgroundColor: colors.textMuted,
    borderColor: colors.textMuted,
    color: colors.white,
  },
  editButton: {
    padding: `6px ${spacing.md}`,
    backgroundColor: colors.warning,
    color: colors.white,
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '70px',
    whiteSpace: 'nowrap',
  },
  incomeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottom: `1px solid ${colors.border}`,
  },
  inheritedItem: { backgroundColor: colors.background, opacity: 0.85 },
  inheritedBadge: { fontSize: '12px', color: colors.textMuted, fontWeight: 'normal' },
  deleteButton: {
    padding: `6px ${spacing.md}`,
    backgroundColor: colors.error,
    color: colors.white,
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '70px',
    whiteSpace: 'nowrap',
  },
  total: { marginTop: spacing.lg, fontSize: '18px', textAlign: 'right', fontWeight: '600' },
  table: {
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    padding: spacing.md,
    backgroundColor: colors.background,
    fontWeight: '500',
    borderBottom: `2px solid ${colors.border}`,
  },
  tableRow: {
    display: 'flex',
    padding: spacing.md,
    borderBottom: `1px solid ${colors.border}`,
    alignItems: 'center',
  },
  inheritedTableRow: { backgroundColor: colors.background, opacity: 0.85 },
};

export default IncomeManagement;
