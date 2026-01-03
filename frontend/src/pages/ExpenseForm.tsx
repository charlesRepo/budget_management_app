import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { expenseService } from '../services/expenses';
import type { CreateExpenseInput, Expense, AccountType, PaymentType, Frequency } from '../types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ExpenseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateExpenseInput>({
    name: '',
    category: '',
    amount: 0,
    accountType: 'checking',
    paymentType: 'manual',
    frequency: 'monthly',
    activeMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && id) {
      fetchExpense(id);
    }
  }, [id, isEditMode]);

  const fetchExpense = async (expenseId: string) => {
    try {
      setLoading(true);
      const expense = await expenseService.getExpenseById(expenseId);
      setFormData({
        name: expense.name,
        category: expense.category,
        amount: expense.amount,
        accountType: expense.accountType,
        paymentType: expense.paymentType,
        frequency: expense.frequency,
        activeMonths: expense.activeMonths,
        notes: expense.notes || '',
      });
    } catch (err) {
      console.error('Failed to fetch expense:', err);
      alert('Failed to load expense. Redirecting...');
      navigate('/expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateExpenseInput, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleMonthToggle = (month: number) => {
    const currentMonths = [...formData.activeMonths];
    const index = currentMonths.indexOf(month);

    if (index > -1) {
      // Remove month
      currentMonths.splice(index, 1);
    } else {
      // Add month
      currentMonths.push(month);
    }

    // Sort months
    currentMonths.sort((a, b) => a - b);

    handleChange('activeMonths', currentMonths);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.activeMonths.length === 0) {
      newErrors.activeMonths = 'At least one month must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && id) {
        await expenseService.updateExpense(id, formData);
      } else {
        await expenseService.createExpense(formData);
      }

      navigate('/expenses');
    } catch (err: any) {
      console.error('Failed to save expense:', err);
      alert(err.response?.data?.error || 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading expense...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h1>
        <button onClick={() => navigate('/expenses')} style={styles.backButton}>
          ← Back to Expenses
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Name */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Expense Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            style={styles.input}
            placeholder="e.g., Mortgage, Groceries, Netflix"
          />
          {errors.name && <span style={styles.errorText}>{errors.name}</span>}
        </div>

        {/* Category */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Category *</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            style={styles.input}
            placeholder="e.g., Essentials, Home, Entertainment"
          />
          {errors.category && <span style={styles.errorText}>{errors.category}</span>}
        </div>

        {/* Amount */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Amount *</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            style={styles.input}
            placeholder="0.00"
          />
          {errors.amount && <span style={styles.errorText}>{errors.amount}</span>}
        </div>

        {/* Account Type */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Account Type *</label>
          <select
            value={formData.accountType}
            onChange={(e) => handleChange('accountType', e.target.value as AccountType)}
            style={styles.select}
          >
            <option value="checking">Checking Account</option>
            <option value="credit_card">Credit Card</option>
          </select>
        </div>

        {/* Payment Type */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Payment Type *</label>
          <select
            value={formData.paymentType}
            onChange={(e) => handleChange('paymentType', e.target.value as PaymentType)}
            style={styles.select}
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {/* Frequency */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Frequency *</label>
          <select
            value={formData.frequency}
            onChange={(e) => handleChange('frequency', e.target.value as Frequency)}
            style={styles.select}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Active Months */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Active Months *</label>
          <p style={styles.helper}>Select the months when this expense occurs</p>
          <div style={styles.monthsGrid}>
            {MONTHS.map((month, index) => {
              const monthNumber = index + 1;
              const isSelected = formData.activeMonths.includes(monthNumber);

              return (
                <button
                  key={monthNumber}
                  type="button"
                  onClick={() => handleMonthToggle(monthNumber)}
                  style={{
                    ...styles.monthButton,
                    ...(isSelected ? styles.monthButtonSelected : {}),
                  }}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}
          </div>
          {errors.activeMonths && <span style={styles.errorText}>{errors.activeMonths}</span>}
        </div>

        {/* Notes */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            style={styles.textarea}
            placeholder="Add any additional notes..."
            rows={3}
          />
        </div>

        {/* Submit Buttons */}
        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Expense' : 'Create Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '800px',
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
  backButton: {
    padding: '10px 16px',
    fontSize: '14px',
    color: '#666',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  form: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '6px',
  },
  helper: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  monthsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '8px',
  },
  monthButton: {
    padding: '10px',
    fontSize: '13px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  monthButtonSelected: {
    backgroundColor: '#3498db',
    color: 'white',
    borderColor: '#3498db',
  },
  errorText: {
    display: 'block',
    fontSize: '12px',
    color: '#e74c3c',
    marginTop: '4px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  cancelButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitButton: {
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

export default ExpenseForm;
