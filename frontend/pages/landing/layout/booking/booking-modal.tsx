/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { X } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ModalTrigger, type ModalTriggerProps } from '~/components/ui/modal/modal-trigger';
import { Wizard, useWizard } from '~/components/ui/wizard';
import { BookingFormContent } from './booking-form-content';
import { BOOKING_STORAGE_KEY, bookingStages } from './ts/constants';

/**
 * Booking modal component that wraps the multi-step wizard in a modal dialog.
 * On form submission, saves the booking data to localStorage and navigates to /join.
 *
 * @returns Rendered modal with booking wizard
 */
export function BookingModal(
  props: ModalTriggerProps & { title?: string; showCloseButton?: boolean },
) {
  const { title, showCloseButton } = props;
  const navigate = useNavigate();

  /**
   * Saves the booking form data to localStorage, closes the modal,
   * and navigates the user to the account creation page.
   */
  const handleSave = useCallback(
    (formData: Record<string, string>) => {
      localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(formData));
      navigate('/join');
    },
    [navigate],
  );

  return (
    <ModalTrigger {...props}>
      {(close) => (
        <>
          {(title || showCloseButton) && (
            <div className='mb-4 flex items-center justify-between border-b border-slate-100 px-6 py-4'>
              {title && <h2 className='text-xl font-bold text-slate-900'>{title}</h2>}
              {showCloseButton && (
                <button
                  type='button'
                  onClick={close}
                  className='ml-auto rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600'
                  aria-label='Close dialog'
                >
                  <X className='h-5 w-5' />
                </button>
              )}
            </div>
          )}
          <Wizard stages={bookingStages}>
            <BookingFormWrapper onSave={handleSave}>
              <BookingFormContent />
            </BookingFormWrapper>
          </Wizard>
        </>
      )}
    </ModalTrigger>
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
