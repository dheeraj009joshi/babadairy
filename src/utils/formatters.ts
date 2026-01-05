import { format } from 'date-fns';

/**
 * Format a number as Indian Rupee currency
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format a date string to readable format
 */
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
    return format(new Date(date), formatStr);
};

/**
 * Format compact number (1234 → 1.2K)
 */
export const formatCompactNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(num);
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
