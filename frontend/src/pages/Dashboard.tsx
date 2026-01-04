import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { calculationService } from '../services/calculations';
import { settingsService } from '../services/settings';
import type { MonthlyCalculation, Settings, AccountCalculation } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [calculations, setCalculations] = useState<MonthlyCalculation | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [calculationsData, settingsData] = await Promise.all([
        calculationService.getMonthCalculations(selectedMonth),
        settingsService.getSettings(),
      ]);
      setCalculations(calculationsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>;
  }

  if (!calculations) {
    return <div style={styles.error}>Failed to load dashboard data</div>;
  }

  const person1Name = settings?.person1Name || 'Person 1';
  const person2Name = settings?.person2Name || 'Person 2';

  const renderAccountCard = (
    title: string,
    account: AccountCalculation,
    colorScheme: 'blue' | 'orange' | 'red' | 'purple'
  ) => {
    const colors = {
      blue: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
      orange: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
      red: { bg: '#ffebee', border: '#f44336', text: '#c62828' },
      purple: { bg: '#f3e5f5', border: '#9c27b0', text: '#6a1b9a' },
    };
    const color = colors[colorScheme];

    return (
      <div style={{ ...styles.accountCard, borderLeft: `4px solid ${color.border}` }}>
        <h2 style={styles.accountTitle}>{title}</h2>

        {/* Current Balance */}
        <div style={styles.balanceInfo}>
          <span style={styles.balanceLabel}>Current Balance:</span>
          <span style={{ ...styles.balanceValue, color: account.currentBalance >= 0 ? '#4caf50' : '#f44336' }}>
            ${account.currentBalance.toFixed(2)}
          </span>
        </div>

        {/* Expenses */}
        <div style={styles.expenseSection}>
          <div style={styles.accountTotal}>
            Monthly Expenses: ${account.totalExpenses.toFixed(2)}
          </div>
          <div style={styles.breakdown}>
            <div style={styles.breakdownItem}>
              <span>Automatic:</span>
              <span>${account.automaticPayments.toFixed(2)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>Manual:</span>
              <span>${account.manualPayments.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Contributions */}
        <div style={styles.contributionSection}>
          <h3 style={styles.contributionTitle}>Contributions Needed</h3>

          {/* Person 1 */}
          <div style={styles.personContribution}>
            <div style={styles.personContributionHeader}>{person1Name}</div>
            <div style={styles.partBreakdown}>
              <div style={styles.partItem}>
                <span>Part 1:</span>
                <span style={styles.partAmount}>${account.person1Share.part1.toFixed(2)}</span>
              </div>
              <div style={styles.partItem}>
                <span>Part 2:</span>
                <span style={styles.partAmount}>${account.person1Share.part2.toFixed(2)}</span>
              </div>
              <div style={{ ...styles.partItem, ...styles.totalPart }}>
                <span><strong>Total:</strong></span>
                <span style={styles.contributionAmount}><strong>${account.person1Share.total.toFixed(2)}</strong></span>
              </div>
            </div>
          </div>

          {/* Person 2 */}
          <div style={styles.personContribution}>
            <div style={styles.personContributionHeader}>{person2Name}</div>
            <div style={styles.partBreakdown}>
              <div style={styles.partItem}>
                <span>Part 1:</span>
                <span style={styles.partAmount}>${account.person2Share.part1.toFixed(2)}</span>
              </div>
              <div style={styles.partItem}>
                <span>Part 2:</span>
                <span style={styles.partAmount}>${account.person2Share.part2.toFixed(2)}</span>
              </div>
              <div style={{ ...styles.partItem, ...styles.totalPart }}>
                <span><strong>Total:</strong></span>
                <span style={styles.contributionAmount}><strong>${account.person2Share.total.toFixed(2)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance After Expenses */}
        <div style={styles.divider} />
        <div style={styles.balanceAfter}>
          <span>Balance After Expenses:</span>
          <span style={{ fontWeight: '600', color: account.balanceAfterExpenses >= 0 ? '#4caf50' : '#f44336' }}>
            ${account.balanceAfterExpenses.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header with Month Selector */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <div style={styles.monthSelector}>
          <label style={styles.monthLabel}>Month: </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.monthInput}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={{ ...styles.summaryCard, ...styles.incomeCard }}>
          <div style={styles.cardLabel}>Total Income</div>
          <div style={styles.cardValue}>${calculations.totalIncome.toFixed(2)}</div>
        </div>

        <div style={{ ...styles.summaryCard, ...styles.expenseCard }}>
          <div style={styles.cardLabel}>Total Expenses</div>
          <div style={styles.cardValue}>${calculations.totalExpenses.toFixed(2)}</div>
        </div>

        <div
          style={{
            ...styles.summaryCard,
            ...(calculations.balance >= 0 ? styles.surplusCard : styles.deficitCard),
          }}
        >
          <div style={styles.cardLabel}>Balance</div>
          <div style={styles.cardValue}>
            {calculations.balance >= 0 ? '+' : ''}${calculations.balance.toFixed(2)}
          </div>
          <div style={styles.cardSubtext}>
            {calculations.balance >= 0 ? 'Surplus' : 'Deficit'}
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div style={styles.accountsGrid}>
        {renderAccountCard('Checking Account', calculations.checking, 'blue')}
        {renderAccountCard('Credit Card', calculations.creditCard, 'orange')}
        {renderAccountCard('Line of Credit', calculations.lineOfCredit, 'red')}
        {renderAccountCard('Student Line of Credit', calculations.studentLineOfCredit, 'purple')}
      </div>

      {/* Person Summary Cards */}
      <div style={styles.personSummaryGrid}>
        {/* Person 1 Summary */}
        <div style={styles.personSummaryCard}>
          <h2 style={styles.personSummaryTitle}>{person1Name}</h2>

          <div style={styles.summarySection}>
            <h3 style={styles.summarySectionTitle}>Income</h3>
            <div style={styles.summaryItem}>
              <span>Part 1:</span>
              <span>${calculations.person1.incomePart1.toFixed(2)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span>Part 2:</span>
              <span>${calculations.person1.incomePart2.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.summaryItem, ...styles.summaryTotal }}>
              <span><strong>Total Income:</strong></span>
              <span><strong>${calculations.person1.totalIncome.toFixed(2)}</strong></span>
            </div>
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.summarySectionTitle}>Contributions</h3>
            <div style={styles.summaryItem}>
              <span>Part 1:</span>
              <span>${calculations.person1.contributionPart1.toFixed(2)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span>Part 2:</span>
              <span>${calculations.person1.contributionPart2.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.summaryItem, ...styles.summaryTotal }}>
              <span><strong>Total Contributions:</strong></span>
              <span><strong>${calculations.person1.totalContribution.toFixed(2)}</strong></span>
            </div>
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.summarySectionTitle}>Remaining (Personal Money)</h3>
            <div style={styles.summaryItem}>
              <span>After Part 1:</span>
              <span style={{ color: calculations.person1.remainingAfterPart1 >= 0 ? '#4caf50' : '#f44336' }}>
                ${calculations.person1.remainingAfterPart1.toFixed(2)}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span>After Part 2:</span>
              <span style={{ color: calculations.person1.remainingAfterPart2 >= 0 ? '#4caf50' : '#f44336' }}>
                ${calculations.person1.remainingAfterPart2.toFixed(2)}
              </span>
            </div>
            <div style={{ ...styles.summaryItem, ...styles.summaryTotal }}>
              <span><strong>Total Remaining:</strong></span>
              <span style={{
                fontWeight: 'bold',
                color: calculations.person1.remaining >= 0 ? '#4caf50' : '#f44336'
              }}>
                ${calculations.person1.remaining.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Person 2 Summary */}
        <div style={styles.personSummaryCard}>
          <h2 style={styles.personSummaryTitle}>{person2Name}</h2>

          <div style={styles.summarySection}>
            <h3 style={styles.summarySectionTitle}>Income</h3>
            <div style={styles.summaryItem}>
              <span>Part 1:</span>
              <span>${calculations.person2.incomePart1.toFixed(2)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span>Part 2:</span>
              <span>${calculations.person2.incomePart2.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.summaryItem, ...styles.summaryTotal }}>
              <span><strong>Total Income:</strong></span>
              <span><strong>${calculations.person2.totalIncome.toFixed(2)}</strong></span>
            </div>
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.summarySectionTitle}>Contributions</h3>
            <div style={styles.summaryItem}>
              <span>Part 1:</span>
              <span>${calculations.person2.contributionPart1.toFixed(2)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span>Part 2:</span>
              <span>${calculations.person2.contributionPart2.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.summaryItem, ...styles.summaryTotal }}>
              <span><strong>Total Contributions:</strong></span>
              <span><strong>${calculations.person2.totalContribution.toFixed(2)}</strong></span>
            </div>
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.summarySectionTitle}>Remaining (Personal Money)</h3>
            <div style={styles.summaryItem}>
              <span>After Part 1:</span>
              <span style={{ color: calculations.person2.remainingAfterPart1 >= 0 ? '#4caf50' : '#f44336' }}>
                ${calculations.person2.remainingAfterPart1.toFixed(2)}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span>After Part 2:</span>
              <span style={{ color: calculations.person2.remainingAfterPart2 >= 0 ? '#4caf50' : '#f44336' }}>
                ${calculations.person2.remainingAfterPart2.toFixed(2)}
              </span>
            </div>
            <div style={{ ...styles.summaryItem, ...styles.summaryTotal }}>
              <span><strong>Total Remaining:</strong></span>
              <span style={{
                fontWeight: 'bold',
                color: calculations.person2.remaining >= 0 ? '#4caf50' : '#f44336'
              }}>
                ${calculations.person2.remaining.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '18px',
    color: '#e74c3c',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  monthLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
  },
  monthInput: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
  },

  // Summary Cards
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  summaryCard: {
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  incomeCard: {
    backgroundColor: '#e8f5e9',
    borderLeft: '4px solid #4caf50',
  },
  expenseCard: {
    backgroundColor: '#fff3e0',
    borderLeft: '4px solid #ff9800',
  },
  surplusCard: {
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #2196f3',
  },
  deficitCard: {
    backgroundColor: '#ffebee',
    borderLeft: '4px solid #f44336',
  },
  cardLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    marginBottom: '8px',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtext: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px',
  },

  // Account Cards
  accountsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  accountCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  accountTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  balanceInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  balanceLabel: {
    fontSize: '13px',
    color: '#666',
  },
  balanceValue: {
    fontSize: '14px',
    fontWeight: '600',
  },
  expenseSection: {
    marginBottom: '12px',
  },
  accountTotal: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  breakdown: {
    fontSize: '13px',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    color: '#666',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '12px 0',
  },
  contributionSection: {
    marginTop: '12px',
  },
  contributionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px',
  },
  personContribution: {
    marginBottom: '12px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  },
  personContributionHeader: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px',
  },
  partBreakdown: {
    fontSize: '12px',
  },
  partItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '3px 0',
    color: '#666',
  },
  totalPart: {
    marginTop: '4px',
    paddingTop: '6px',
    borderTop: '1px solid #e0e0e0',
  },
  partAmount: {
    fontWeight: '500',
    color: '#2196f3',
  },
  contributionAmount: {
    fontWeight: '600',
    color: '#2196f3',
  },
  balanceAfter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#666',
    marginTop: '8px',
  },

  // Person Summary Cards
  personSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
  },
  personSummaryCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  personSummaryTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  summarySection: {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #eee',
  },
  summarySectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '14px',
    color: '#666',
  },
  summaryTotal: {
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '2px solid #e0e0e0',
    fontSize: '15px',
  },
};

export default Dashboard;
