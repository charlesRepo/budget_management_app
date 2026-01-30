// Shared theme and styles for consistent UI across the app

export const colors = {
  primary: '#2196f3',
  primaryDark: '#1976d2',
  primaryLight: '#bbdefb',
  success: '#4caf50',
  successLight: '#e8f5e9',
  error: '#f44336',
  errorLight: '#ffebee',
  warning: '#ff9800',
  warningLight: '#fff3e0',
  purple: '#9c27b0',
  purpleLight: '#f3e5f5',
  text: '#333',
  textLight: '#666',
  textMuted: '#999',
  border: '#ddd',
  background: '#f5f5f5',
  white: '#ffffff',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

export const shadows = {
  sm: '0 1px 4px rgba(0,0,0,0.1)',
  md: '0 2px 8px rgba(0,0,0,0.1)',
  lg: '0 4px 12px rgba(0,0,0,0.15)',
};

// Common component styles
export const commonStyles = {
  input: {
    width: '100%',
    padding: spacing.md,
    fontSize: '16px',
    border: `2px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    boxSizing: 'border-box' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    appearance: 'none' as const,
  },

  select: {
    width: '100%',
    padding: spacing.md,
    paddingRight: '40px', // More space for the dropdown arrow
    fontSize: '16px',
    border: `2px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    boxSizing: 'border-box' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    appearance: 'none' as const,
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '20px',
  },

  button: {
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: '16px',
    fontWeight: '600' as const,
    border: `2px solid ${colors.primary}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    color: colors.white,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxSizing: 'border-box' as const,
  },

  buttonSecondary: {
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: '16px',
    fontWeight: '600' as const,
    border: `2px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    color: colors.textLight,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxSizing: 'border-box' as const,
  },

  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    boxShadow: shadows.md,
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: colors.text,
    marginBottom: spacing.lg,
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },

  helperText: {
    display: 'block',
    fontSize: '12px',
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
};

// Helper function to create consistent page container
export const pageContainer = {
  padding: spacing.lg,
  maxWidth: '600px',
  margin: '0 auto',
  paddingBottom: '80px',
};
