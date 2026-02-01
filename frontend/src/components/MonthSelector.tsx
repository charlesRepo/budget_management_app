import React from 'react';
import { commonStyles, colors } from '../styles/theme';

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
  label?: string;
  showLabel?: boolean;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  value,
  onChange,
  label = 'Month:',
  showLabel = true
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    onChange(newMonth);
    localStorage.setItem('selectedMonth', newMonth);
  };

  return (
    <>
      <style>{`
        input[type="month"]::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
        input[type="month"]::-webkit-inner-spin-button,
        input[type="month"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
      <div style={styles.container}>
        {showLabel && <label style={styles.label}>{label}</label>}
        <input
          type="month"
          value={value}
          onChange={handleChange}
          style={styles.input}
        />
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginBottom: '16px',
  },
  label: {
    marginRight: '8px',
    fontSize: '16px',
    fontWeight: '500' as const,
  },
  input: {
    ...commonStyles.input,
    maxWidth: '100%',
    color: colors.text, // Force black text color on all platforms
    paddingRight: '40px', // More space for the custom arrow
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '20px',
    // Hide calendar icon on webkit browsers (Chrome, Safari)
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
  } as React.CSSProperties,
};

export default MonthSelector;
