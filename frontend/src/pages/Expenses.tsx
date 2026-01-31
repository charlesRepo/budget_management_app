import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../services/expenses';
import type { Expense, ExpenseFilters } from '../types';
import { colors, spacing, borderRadius, commonStyles, pageContainer } from '../styles/theme';

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [showStats, setShowStats] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getExpenses(filters);
      setExpenses(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm || undefined });
  };

  const handleFilterChange = (key: keyof ExpenseFilters, value: any) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this expense?')) {
      return;
    }

    try {
      await expenseService.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatAccountType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      checking: 'Checking',
      credit_card: 'Credit Card',
      line_of_credit: 'Personal Line of Credit',
      student_line_of_credit: 'Student Line of Credit',
    };
    return typeMap[type] || type;
  };

  const formatPaymentType = (type: string) => {
    return type === 'automatic' ? 'Automatic' : 'Manual';
  };

  const getMonthTags = (frequency: string, activeMonths: number[]) => {
    // Don't show tags for monthly expenses (all 12 months are active)
    if (frequency === 'monthly') return null;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return activeMonths.map(monthNum => monthNames[monthNum - 1]).join(', ');
  };

  // Get unique categories from all expenses
  const uniqueCategories = Array.from(new Set(expenses.map(e => e.category))).sort();

  // Filter expenses by period
  const filterByPeriod = (expense: Expense) => {
    if (!periodFilter) return true;

    if (periodFilter === 'monthly') {
      return expense.frequency === 'monthly';
    }

    if (periodFilter === 'yearly') {
      return expense.frequency === 'yearly';
    }

    // Month-based filtering (e.g., "january" -> check if month 1 is in activeMonths)
    const monthMap: { [key: string]: number } = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4,
      'may': 5, 'june': 6, 'july': 7, 'august': 8,
      'september': 9, 'october': 10, 'november': 11, 'december': 12
    };

    const monthNumber = monthMap[periodFilter.toLowerCase()];
    if (monthNumber) {
      return expense.activeMonths.includes(monthNumber);
    }

    return true;
  };

  const filteredExpenses = expenses.filter(filterByPeriod);

  // Calculate stats for graphs
  const categoryStats = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const monthStats = expenses.reduce((acc, expense) => {
    expense.activeMonths.forEach(month => {
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1];
      acc[monthName] = (acc[monthName] || 0) + expense.amount;
    });
    return acc;
  }, {} as Record<string, number>);

  const accountStats = expenses.reduce((acc, expense) => {
    const accountName = formatAccountType(expense.accountType);
    acc[accountName] = (acc[accountName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const maxCategoryAmount = Math.max(...Object.values(categoryStats));
  const maxMonthAmount = Math.max(...Object.values(monthStats));
  const maxAccountAmount = Math.max(...Object.values(accountStats));

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading expenses...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Expenses</h1>
        <button onClick={() => navigate('/expenses/new')} style={styles.addButton}>
          + Add Expense
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={styles.searchInput}
          />
          <button onClick={handleSearch} style={styles.searchButton}>
            Search
          </button>
        </div>

        <div style={styles.filters}>
          <select
            value={filters.accountType || ''}
            onChange={(e) => handleFilterChange('accountType', e.target.value)}
            style={styles.select}
          >
            <option value="">Accounts</option>
            <option value="checking">Checking</option>
            <option value="credit_card">Credit Card</option>
          </select>

          <select
            value={filters.paymentType || ''}
            onChange={(e) => handleFilterChange('paymentType', e.target.value)}
            style={styles.select}
          >
            <option value="">Payment Types</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>

          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            style={styles.select}
          >
            <option value="">Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">Period</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="january">January</option>
            <option value="february">February</option>
            <option value="march">March</option>
            <option value="april">April</option>
            <option value="may">May</option>
            <option value="june">June</option>
            <option value="july">July</option>
            <option value="august">August</option>
            <option value="september">September</option>
            <option value="october">October</option>
            <option value="november">November</option>
            <option value="december">December</option>
          </select>

          {(Object.keys(filters).length > 0 || periodFilter) && (
            <button onClick={() => { setFilters({}); setSearchTerm(''); setPeriodFilter(''); }} style={styles.clearFiltersButton}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stats Toggle */}
      <button
        onClick={() => setShowStats(!showStats)}
        style={styles.statsToggle}
      >
        {showStats ? '▼' : '▶'} {showStats ? 'Hide' : 'Show'} Stats
      </button>

      {/* Stats Section */}
      {showStats && (
        <div style={styles.statsSection}>
          {/* Category Stats */}
          <div style={styles.statsCard}>
            <h3 style={styles.statsTitle}>Expenses by Category</h3>
            <div style={styles.chartContainer}>
              {Object.entries(categoryStats)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} style={styles.chartRow}>
                    <div style={styles.chartLabel}>{category}</div>
                    <div style={styles.chartBarContainer}>
                      <div
                        style={{
                          ...styles.chartBar,
                          width: `${(amount / maxCategoryAmount) * 100}%`,
                        }}
                      />
                      <span style={styles.chartValue}>{formatCurrency(amount)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Month Stats */}
          <div style={styles.statsCard}>
            <h3 style={styles.statsTitle}>Expenses by Month</h3>
            <div style={styles.chartContainer}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                .map(month => ({
                  month,
                  amount: monthStats[month] || 0,
                }))
                .filter(({ amount }) => amount > 0)
                .map(({ month, amount }) => (
                  <div key={month} style={styles.chartRow}>
                    <div style={styles.chartLabel}>{month}</div>
                    <div style={styles.chartBarContainer}>
                      <div
                        style={{
                          ...styles.chartBar,
                          width: `${(amount / maxMonthAmount) * 100}%`,
                        }}
                      />
                      <span style={styles.chartValue}>{formatCurrency(amount)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Account Stats */}
          <div style={styles.statsCard}>
            <h3 style={styles.statsTitle}>Expenses by Account</h3>
            <div style={styles.chartContainer}>
              {Object.entries(accountStats)
                .sort(([, a], [, b]) => b - a)
                .map(([account, amount]) => (
                  <div key={account} style={styles.chartRow}>
                    <div style={styles.chartLabel}>{account}</div>
                    <div style={styles.chartBarContainer}>
                      <div
                        style={{
                          ...styles.chartBar,
                          width: `${(amount / maxAccountAmount) * 100}%`,
                        }}
                      />
                      <span style={styles.chartValue}>{formatCurrency(amount)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No expenses found.</p>
          {expenses.length === 0 && (
            <button onClick={() => navigate('/expenses/new')} style={styles.emptyButton}>
              Add Your First Expense
            </button>
          )}
        </div>
      ) : (
        <div style={styles.expensesList}>
          {filteredExpenses.map((expense) => (
            <div key={expense.id} style={styles.expenseCard}>
              <div style={styles.expenseHeader}>
                <h3 style={styles.expenseName}>{expense.name}</h3>
                <div style={styles.expenseAmount}>{formatCurrency(expense.amount)}</div>
              </div>

              <div style={styles.expenseDetails}>
                <span style={styles.badge}>{expense.category}</span>
                <span style={styles.badge}>{formatAccountType(expense.accountType)}</span>
                <span style={styles.badge}>{formatPaymentType(expense.paymentType)}</span>
                <span style={styles.badge}>{expense.frequency}</span>
              </div>

              {getMonthTags(expense.frequency, expense.activeMonths) && (
                <div style={styles.monthTags}>
                  <span style={styles.monthTagsLabel}>Active Months:</span>
                  <span style={styles.monthTagsValue}>{getMonthTags(expense.frequency, expense.activeMonths)}</span>
                </div>
              )}

              {expense.notes && (
                <p style={styles.notes}>{expense.notes}</p>
              )}

              <div style={styles.expenseActions}>
                <button
                  onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                  style={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  style={styles.deleteButton}
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { ...pageContainer },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `4px solid ${colors.background}`,
    borderTop: `4px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: spacing.lg,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    color: colors.text,
    margin: 0,
  },
  addButton: {
    ...commonStyles.button,
    fontSize: '14px',
  },
  error: {
    backgroundColor: colors.errorLight,
    color: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  filtersContainer: {
    ...commonStyles.card,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  searchBar: {
    display: 'flex',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchInput: {
    ...commonStyles.input,
    flex: 1,
  },
  searchButton: {
    ...commonStyles.button,
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: '14px',
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: spacing.sm,
    alignItems: 'start',
  },
  select: {
    ...commonStyles.select,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: '14px',
  },
  clearButton: {
    ...commonStyles.buttonSecondary,
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: '14px',
  },
  clearFiltersButton: {
    gridColumn: '1 / -1',
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: '14px',
    fontWeight: '600' as const,
    border: `2px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.textMuted,
    color: colors.white,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: spacing.sm,
  },
  emptyState: {
    ...commonStyles.card,
    textAlign: 'center' as const,
    padding: `${spacing.xxxl} ${spacing.xl}`,
  },
  emptyText: {
    fontSize: '16px',
    color: colors.textLight,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    ...commonStyles.button,
    fontSize: '14px',
  },
  expensesList: {
    display: 'grid',
    gap: spacing.lg,
  },
  expenseCard: {
    ...commonStyles.card,
    padding: spacing.xl,
  },
  expenseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  expenseName: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: colors.text,
    margin: 0,
  },
  expenseAmount: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: colors.success,
  },
  expenseDetails: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  badge: {
    padding: `${spacing.xs} ${spacing.md}`,
    fontSize: '12px',
    backgroundColor: colors.background,
    color: colors.textLight,
    borderRadius: borderRadius.lg,
  },
  monthTags: {
    display: 'flex',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    fontSize: '13px',
    flexWrap: 'wrap',
  },
  monthTagsLabel: {
    fontWeight: '600' as const,
    color: colors.primaryDark,
  },
  monthTagsValue: {
    color: colors.primaryDark,
  },
  notes: {
    fontSize: '14px',
    color: colors.textLight,
    marginBottom: spacing.md,
    lineHeight: '1.5',
  },
  expenseActions: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  editButton: {
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: '14px',
    color: colors.primary,
    backgroundColor: colors.white,
    border: `2px solid ${colors.primary}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontWeight: '600' as const,
  },
  deleteButton: {
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: '14px',
    color: colors.error,
    backgroundColor: colors.white,
    border: `2px solid ${colors.error}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontWeight: '600' as const,
  },
  statsToggle: {
    width: '100%',
    padding: spacing.md,
    fontSize: '16px',
    fontWeight: '500' as const,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    color: colors.textLight,
    cursor: 'pointer',
    marginBottom: spacing.lg,
    transition: 'all 0.2s',
  },
  statsSection: {
    display: 'grid',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  },
  statsCard: {
    ...commonStyles.card,
    padding: spacing.xl,
  },
  statsTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.md,
  },
  chartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  chartLabel: {
    fontSize: '14px',
    color: colors.text,
    minWidth: '100px',
    fontWeight: '500' as const,
  },
  chartBarContainer: {
    flex: 1,
    position: 'relative' as const,
    height: '32px',
    display: 'flex',
    alignItems: 'center',
  },
  chartBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    transition: 'width 0.3s ease',
    minWidth: '2px',
  },
  chartValue: {
    position: 'absolute' as const,
    right: spacing.sm,
    fontSize: '13px',
    fontWeight: '600' as const,
    color: colors.text,
  },
};

export default Expenses;
