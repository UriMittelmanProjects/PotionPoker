/**
 * Utility functions for handling date conversions between frontend and backend
 */

import { PokerSession } from '../types/session';

/**
 * Convert backend session with string dates to frontend session with Date objects
 */
export const convertSessionDates = (session: PokerSession): PokerSession => {
  return {
    ...session,
    startTime: session.startTime,  // Keep as string for now to maintain consistency
    endTime: session.endTime,      // Keep as string for now
    createdAt: session.createdAt,  // Keep as string for now
    updatedAt: session.updatedAt,  // Keep as string for now
  };
};

/**
 * Format duration from start time to current time or end time
 */
export const formatDuration = (startTime: string | Date, endTime?: Date): string => {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const now = endTime || new Date();
  const diffInMs = now.getTime() - start.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Parse date string to Date object safely
 */
export const parseDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }
  return new Date(dateString);
};