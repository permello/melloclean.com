/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Modal } from '~/components/ui/modal';
import { Wizard, useWizard } from '~/components/ui/wizard';
import { useBooking } from './booking-context';
import { BookingFormContent } from './booking-form-content';
import { bookingStages, BOOKING_STORAGE_KEY } from './ts/constants';

/**
 * Booking modal component that wraps the multi-step wizard in a modal dialog.
 * On form submission, saves the booking data to localStorage and navigates to /join.
 *
 * @returns Rendered modal with booking wizard
 */
export function BookingModal() {
  const { isBookingOpen, closeBooking } = useBooking();
  const navigate = useNavigate();

  /**
   * Saves the booking form data to localStorage, closes the modal,
   * and navigates the user to the account creation page.
   */
  const handleSave = useCallback(
    (formData: Record<string, string>) => {
      localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(formData));
      closeBooking();
      navigate('/join');
    },
    [closeBooking, navigate],
  );

  return (
    <Modal isOpen={isBookingOpen} onClose={closeBooking} title='Book a Cleaning' size='large'>
      <Wizard stages={bookingStages}>
        <BookingFormWrapper onSave={handleSave}>
          <BookingFormContent />
        </BookingFormWrapper>
      </Wizard>
    </Modal>
  );
}

/**
 * Props for the BookingFormWrapper component.
 */
interface BookingFormWrapperProps {
  /** Child components (wizard stages and navigation) */
  children: React.ReactNode;
  /** Callback to save form data on successful submission */
  onSave: (formData: Record<string, string>) => void;
}

/**
 * Wrapper component that renders a form element around the wizard content.
 * On submit, reads the wizard's form data from context and passes it to onSave.
 * Must be rendered inside a Wizard component to access useWizard().
 */
function BookingFormWrapper({ children, onSave }: BookingFormWrapperProps) {
  const { formData } = useWizard();

  /** Prevents default form submission and delegates to the onSave callback. */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return <form onSubmit={handleSubmit}>{children}</form>;
}
