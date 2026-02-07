/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cn } from '~/core/util/cn';
import { Button } from '~/components/ui/button';
import { useWizard } from './wizard-context';
import type { WizardNavigationProps } from './ts/types';

/**
 * Navigation buttons for wizard step transitions.
 * Provides back, next, and complete buttons with automatic state handling.
 *
 * @param props - Component props
 * @returns Navigation button container
 */
export function WizardNavigation({
  isSubmitting = false,
  nextLabel = 'Next',
  backLabel = 'Back',
  completeLabel = 'Complete',
  className,
}: WizardNavigationProps) {
  const { isFirstStage, isLastStage, nextStage, prevStage } = useWizard();

  /** Advances to the next stage without submitting the form. */
  const handleNext = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isLastStage) {
      nextStage();
    }
  };

  /** Validates the final stage and allows form submission if valid. */
  const handleSubmit = (event: React.MouseEvent) => {
    const isValid = nextStage();
    if (!isValid) {
      event.preventDefault();
    }
  };

  return (
    <div
      className={cn('flex gap-3', isFirstStage ? 'justify-center' : 'justify-between', className)}
    >
      {!isFirstStage && (
        <Button type='button' variant='secondary' onPress={prevStage}>
          {backLabel}
        </Button>
      )}

      {isLastStage ? (
        <Button
          type='submit'
          disabled={isSubmitting}
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          {completeLabel}
        </Button>
      ) : (
        <Button type='button' onClick={handleNext}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
