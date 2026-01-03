import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../services/expenses';
import type { Expense, ExpenseFilters } from '../types';

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
    return type === 'checking' ? 'Checking' : 'Credit Card';
  };

  const formatPaymentType = (type: string) => {
    return type === 'automatic' ? 'Automatic' : 'Manual';
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
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
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
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  addButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  },
  searchBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  searchButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  clearButton: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#666',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  emptyText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  emptyButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  expensesList: {
    display: 'grid',
    gap: '16px',
  },
  expenseCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  expenseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  expenseName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  expenseAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  expenseDetails: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  badge: {
    padding: '4px 12px',
    fontSize: '12px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    borderRadius: '12px',
  },
  notes: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
    lineHeight: '1.5',
  },
  expenseActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#3498db',
    backgroundColor: 'white',
    border: '1px solid #3498db',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#e74c3c',
    backgroundColor: 'white',
    border: '1px solid #e74c3c',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Expenses;
