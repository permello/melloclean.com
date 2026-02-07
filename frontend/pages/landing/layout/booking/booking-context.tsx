/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/**
 * Shape of the booking context value.
 */
interface BookingContextValue {
  /** Whether the booking modal is currently open */
  isBookingOpen: boolean;
  /** Opens the booking modal */
  openBooking: () => void;
  /** Closes the booking modal */
  closeBooking: () => void;
}

/**
 * React context for booking modal state.
 */
const BookingContext = createContext<BookingContextValue | null>(null);

/**
 * Hook to access booking modal state from child components.
 *
 * @throws Error if used outside of BookingProvider
 * @returns Booking context value with open/close actions
 */
export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

/**
 * Props for the BookingProvider component.
 */
interface BookingProviderProps {
  /** Child components */
  children: ReactNode;
}

/**
 * Provider component that manages the booking modal open/close state.
 *
 * @param props - Component props
 * @returns Provider wrapping children with booking context
 */
export function BookingProvider({ children }: BookingProviderProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  /** Opens the booking modal. */
  const openBooking = useCallback(() => setIsBookingOpen(true), []);

  /** Closes the booking modal. */
  const closeBooking = useCallback(() => setIsBookingOpen(false), []);

  const value: BookingContextValue = {
    isBookingOpen,
    openBooking,
    closeBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
