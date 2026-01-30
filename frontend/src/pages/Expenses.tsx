import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../services/expenses';
import type { Expense, ExpenseFilters } from '../types';
import { colors, spacing, borderRadius, shadows, commonStyles } from '../styles/theme';

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

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
            <option value="">All Accounts</option>
            <option value="checking">Checking</option>
            <option value="credit_card">Credit Card</option>
            <option value="line_of_credit">Personal Line of Credit</option>
            <option value="student_line_of_credit">Student Line of Credit</option>
          </select>

          <select
            value={filters.paymentType || ''}
            onChange={(e) => handleFilterChange('paymentType', e.target.value)}
            style={styles.select}
          >
            <option value="">All Payment Types</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>

          {Object.keys(filters).length > 0 && (
            <button onClick={() => { setFilters({}); setSearchTerm(''); }} style={styles.clearButton}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No expenses found.</p>
          <button onClick={() => navigate('/expenses/new')} style={styles.emptyButton}>
            Add Your First Expense
          </button>
        </div>
      ) : (
        <div style={styles.expensesList}>
          {expenses.map((expense) => (
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
  container: {
    padding: spacing.lg,
    maxWidth: '1200px',
    margin: '0 auto',
    paddingBottom: '80px',
  },
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
    padding: spacing.xl,
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
    display: 'flex',
    gap: spacing.md,
    flexWrap: 'wrap',
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
};

export default Expenses;
