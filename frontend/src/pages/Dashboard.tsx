import React, { useState, useEffect } from 'react';
import { calculationService } from '../services/calculations';
import { settingsService } from '../services/settings';
import type { MonthlyCalculation, Settings } from '../types';

const Dashboard: React.FC = () => {
  const [calculations, setCalculations] = useState<MonthlyCalculation | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem('selectedMonth');
    return saved || new Date().toISOString().slice(0, 7);
  });
  const [selectedPart, setSelectedPart] = useState<'part1' | 'part2'>('part1');
  const [selectedPerson, setSelectedPerson] = useState<'all' | 'person1' | 'person2'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchData();
    localStorage.setItem('selectedMonth', selectedMonth);
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

  const copyToClipboard = async (amount: number, id: string) => {
    try {
      // Copy only the number without dollar sign
      await navigator.clipboard.writeText(amount.toFixed(2));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!calculations) {
    return <div style={styles.error}>Failed to load data</div>;
  }

  const person1Name = settings?.person1Name || 'Person 1';
  const person2Name = settings?.person2Name || 'Person 2';

  const getPartAmount = (contribution: { part1: number; part2: number }) => {
    return selectedPart === 'part1' ? contribution.part1 : contribution.part2;
  };

  const shouldShowPerson = (person: 'person1' | 'person2') => {
    return selectedPerson === 'all' || selectedPerson === person;
  };

  const renderCopyButton = (amount: number, label: string, id: string) => {
    const isCopied = copiedId === id;
    return (
      <button
        onClick={() => copyToClipboard(amount, id)}
        style={{
          ...styles.copyButton,
          ...(isCopied ? styles.copiedButton : {}),
        }}
      >
        <div style={styles.copyButtonContent}>
          <span style={styles.copyLabel}>{label}</span>
          <span style={styles.copyAmount}>${amount.toFixed(2)}</span>
        </div>
        <span style={styles.copyIcon}>{isCopied ? '✓' : '📋'}</span>
      </button>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={styles.monthInput}
        />
      </div>

      {/* Part Selector */}
      <div style={styles.partSelector}>
        <button
          onClick={() => setSelectedPart('part1')}
          style={{
            ...styles.partButton,
            ...(selectedPart === 'part1' ? styles.partButtonActive : {}),
          }}
        >
          Part 1
        </button>
        <button
          onClick={() => setSelectedPart('part2')}
          style={{
            ...styles.partButton,
            ...(selectedPart === 'part2' ? styles.partButtonActive : {}),
          }}
        >
          Part 2
        </button>
      </div>

      {/* Person Filter */}
      <div style={styles.personSelector}>
        <button
          onClick={() => setSelectedPerson('all')}
          style={{
            ...styles.personButton,
            ...(selectedPerson === 'all' ? styles.personButtonActive : {}),
          }}
        >
          Both
        </button>
        <button
          onClick={() => setSelectedPerson('person1')}
          style={{
            ...styles.personButton,
            ...(selectedPerson === 'person1' ? styles.personButtonActive : {}),
          }}
        >
          {person1Name}
        </button>
        <button
          onClick={() => setSelectedPerson('person2')}
          style={{
            ...styles.personButton,
            ...(selectedPerson === 'person2' ? styles.personButtonActive : {}),
          }}
        >
          {person2Name}
        </button>
      </div>

      {/* Transfers Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>💸 Transfers Needed</h2>

        {/* Checking Account */}
        <div style={styles.accountCard}>
          <h3 style={styles.accountName}>Checking Account</h3>
          <div style={styles.transferGrid}>
            {shouldShowPerson('person1') && renderCopyButton(
              getPartAmount(calculations.checking.person1Share),
              person1Name,
              `checking-${selectedPart}-person1`
            )}
            {shouldShowPerson('person2') && renderCopyButton(
              getPartAmount(calculations.checking.person2Share),
              person2Name,
              `checking-${selectedPart}-person2`
            )}
          </div>
        </div>

        {/* Credit Card */}
        <div style={styles.accountCard}>
          <h3 style={styles.accountName}>Credit Card</h3>
          <div style={styles.transferGrid}>
            {shouldShowPerson('person1') && renderCopyButton(
              getPartAmount(calculations.creditCard.person1Share),
              person1Name,
              `credit-${selectedPart}-person1`
            )}
            {shouldShowPerson('person2') && renderCopyButton(
              getPartAmount(calculations.creditCard.person2Share),
              person2Name,
              `credit-${selectedPart}-person2`
            )}
          </div>
        </div>

        {/* Savings */}
        <div style={styles.accountCard}>
          <h3 style={styles.accountName}>Savings</h3>

          {/* Travel */}
          {calculations.savings.travelGoal > 0 && (
            <>
              <div style={styles.savingsLabel}>Travel (${calculations.savings.travelGoal.toFixed(2)})</div>
              <div style={styles.transferGrid}>
                {shouldShowPerson('person1') && calculations.savings.person1.travel.total > 0 && renderCopyButton(
                  getPartAmount(calculations.savings.person1.travel),
                  person1Name,
                  `travel-${selectedPart}-person1`
                )}
                {shouldShowPerson('person2') && calculations.savings.person2.travel.total > 0 && renderCopyButton(
                  getPartAmount(calculations.savings.person2.travel),
                  person2Name,
                  `travel-${selectedPart}-person2`
                )}
              </div>
            </>
          )}

          {/* Home */}
          {calculations.savings.homeGoal > 0 && (
            <>
              <div style={styles.savingsLabel}>Home (${calculations.savings.homeGoal.toFixed(2)})</div>
              <div style={styles.transferGrid}>
                {shouldShowPerson('person1') && calculations.savings.person1.home.total > 0 && renderCopyButton(
                  getPartAmount(calculations.savings.person1.home),
                  person1Name,
                  `home-${selectedPart}-person1`
                )}
                {shouldShowPerson('person2') && calculations.savings.person2.home.total > 0 && renderCopyButton(
                  getPartAmount(calculations.savings.person2.home),
                  person2Name,
                  `home-${selectedPart}-person2`
                )}
              </div>
            </>
          )}

          {/* General */}
          {calculations.savings.generalGoal > 0 && (
            <>
              <div style={styles.savingsLabel}>General (${calculations.savings.generalGoal.toFixed(2)})</div>
              <div style={styles.transferGrid}>
                {shouldShowPerson('person1') && calculations.savings.person1.general.total > 0 && renderCopyButton(
                  getPartAmount(calculations.savings.person1.general),
                  person1Name,
                  `general-${selectedPart}-person1`
                )}
                {shouldShowPerson('person2') && calculations.savings.person2.general.total > 0 && renderCopyButton(
                  getPartAmount(calculations.savings.person2.general),
                  person2Name,
                  `general-${selectedPart}-person2`
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Remaining Amounts */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>💰 Remaining (Personal Money)</h2>
        <div style={styles.remainingGrid}>
          {shouldShowPerson('person1') && (
            <div style={styles.remainingCard}>
              <div style={styles.remainingName}>{person1Name}</div>
              <div style={styles.remainingAmount}>
                ${selectedPart === 'part1'
                  ? calculations.person1.remainingAfterPart1.toFixed(2)
                  : calculations.person1.remainingAfterPart2.toFixed(2)}
              </div>
              <div style={styles.remainingTotal}>
                Total: ${calculations.person1.remaining.toFixed(2)}
              </div>
            </div>
          )}
          {shouldShowPerson('person2') && (
            <div style={styles.remainingCard}>
              <div style={styles.remainingName}>{person2Name}</div>
              <div style={styles.remainingAmount}>
                ${selectedPart === 'part1'
                  ? calculations.person2.remainingAfterPart1.toFixed(2)
                  : calculations.person2.remainingAfterPart2.toFixed(2)}
              </div>
              <div style={styles.remainingTotal}>
                Total: ${calculations.person2.remaining.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={styles.detailsToggle}
      >
        {showDetails ? '▼' : '▶'} {showDetails ? 'Hide' : 'Show'} Details
      </button>

      {/* Detailed Information (Collapsible) */}
      {showDetails && (
        <div style={styles.detailsSection}>
          <div style={styles.summaryCard}>
            <h3 style={styles.detailTitle}>Summary</h3>
            <div style={styles.detailRow}>
              <span>Total Income:</span>
              <span>${calculations.totalIncome.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Total Expenses:</span>
              <span>${calculations.totalExpenses.toFixed(2)}</span>
            </div>
            <div style={{...styles.detailRow, ...styles.detailRowBold}}>
              <span>Balance:</span>
              <span style={{ color: calculations.balance >= 0 ? '#4caf50' : '#f44336' }}>
                ${calculations.balance.toFixed(2)}
              </span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <h3 style={styles.detailTitle}>Checking Account</h3>
            <div style={styles.detailRow}>
              <span>Total Expenses:</span>
              <span>${calculations.checking.totalExpenses.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Current Balance:</span>
              <span>${calculations.checking.currentBalance.toFixed(2)}</span>
            </div>
            {calculations.checking.credits > 0 && (
              <div style={styles.detailRow}>
                <span>Credits:</span>
                <span style={{ color: '#4caf50' }}>+${calculations.checking.credits.toFixed(2)}</span>
              </div>
            )}
            <div style={{...styles.detailRow, ...styles.detailRowBold}}>
              <span>Balance After:</span>
              <span>${calculations.checking.balanceAfterExpenses.toFixed(2)}</span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <h3 style={styles.detailTitle}>Credit Card</h3>
            <div style={styles.detailRow}>
              <span>Total Expenses:</span>
              <span>${calculations.creditCard.totalExpenses.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Current Balance:</span>
              <span>${calculations.creditCard.currentBalance.toFixed(2)}</span>
            </div>
            {calculations.creditCard.credits > 0 && (
              <div style={styles.detailRow}>
                <span>Credits:</span>
                <span style={{ color: '#4caf50' }}>+${calculations.creditCard.credits.toFixed(2)}</span>
              </div>
            )}
            <div style={{...styles.detailRow, ...styles.detailRowBold}}>
              <span>Balance After:</span>
              <span>${calculations.creditCard.balanceAfterExpenses.toFixed(2)}</span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <h3 style={styles.detailTitle}>{person1Name} - Income & Contributions</h3>
            <div style={styles.detailRow}>
              <span>Total Income:</span>
              <span>${calculations.person1.totalIncome.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Part 1 Income:</span>
              <span>${calculations.person1.incomePart1.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Part 2 Income:</span>
              <span>${calculations.person1.incomePart2.toFixed(2)}</span>
            </div>
            <div style={{...styles.detailRow, marginTop: '8px'}}>
              <span>Total Contributions:</span>
              <span>${calculations.person1.totalContribution.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Part 1 Contributions:</span>
              <span>${calculations.person1.contributionPart1.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Part 2 Contributions:</span>
              <span>${calculations.person1.contributionPart2.toFixed(2)}</span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <h3 style={styles.detailTitle}>{person2Name} - Income & Contributions</h3>
            <div style={styles.detailRow}>
              <span>Total Income:</span>
              <span>${calculations.person2.totalIncome.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Part 1 Income:</span>
              <span>${calculations.person2.incomePart1.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Part 2 Income:</span>
              <span>${calculations.person2.incomePart2.toFixed(2)}</span>
            </div>
            <div style={{...styles.detailRow, marginTop: '8px'}}>
              <span>Total Contributions:</span>
              <span>${calculations.person2.totalContribution.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Part 1 Contributions:</span>
              <span>${calculations.person2.contributionPart1.toFixed(2)}</span>
            </div>
            <div style={styles.detailRow}>
              <span>Part 2 Contributions:</span>
              <span>${calculations.person2.contributionPart2.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '16px',
    maxWidth: '600px',
    margin: '0 auto',
    paddingBottom: '80px',
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
    marginBottom: '16px',
  },
  monthInput: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    fontWeight: '500',
  },
  partSelector: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '12px',
  },
  partButton: {
    padding: '16px',
    fontSize: '18px',
    fontWeight: '600',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  partButtonActive: {
    backgroundColor: '#2196f3',
    color: 'white',
    borderColor: '#2196f3',
  },
  personSelector: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
    marginBottom: '24px',
  },
  personButton: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  personButtonActive: {
    backgroundColor: '#9c27b0',
    color: 'white',
    borderColor: '#9c27b0',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  accountCard: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  accountName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
  },
  transferGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    fontSize: '16px',
    border: '2px solid #2196f3',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#2196f3',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '60px',
  },
  copiedButton: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
    color: 'white',
  },
  copyButtonContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    flex: 1,
  },
  copyLabel: {
    fontSize: '14px',
    opacity: 0.8,
  },
  copyAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  copyIcon: {
    fontSize: '24px',
  },
  savingsLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    marginTop: '12px',
    marginBottom: '8px',
  },
  remainingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
  },
  remainingCard: {
    backgroundColor: '#e8f5e9',
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'center',
  },
  remainingName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: '8px',
  },
  remainingAmount: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: '4px',
  },
  remainingTotal: {
    fontSize: '12px',
    color: '#4caf50',
    fontWeight: '500',
  },
  detailsToggle: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '500',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#666',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  detailsSection: {
    marginBottom: '32px',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '14px',
    color: '#666',
  },
  detailRowBold: {
    fontWeight: '600',
    color: '#333',
    borderTop: '1px solid #eee',
    marginTop: '8px',
    paddingTop: '12px',
  },
};

export default Dashboard;
