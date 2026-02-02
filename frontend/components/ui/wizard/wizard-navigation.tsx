import { cn } from '~/core/util/cn';
import { Button } from '~/components/ui/button';
import { useWizard } from './wizard-context';
import type { WizardNavigationProps } from './ts/types';

export function WizardNavigation({
  isSubmitting = false,
  nextLabel = 'Next',
  backLabel = 'Back',
  completeLabel = 'Complete',
  className,
}: WizardNavigationProps) {
  const { isFirstStep, isLastStep, nextStep, prevStep } = useWizard();

  const handleNext = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isLastStep) {
      nextStep();
    }
  };

  const handleSubmit = (event: React.MouseEvent) => {
    const isValid = nextStep();
    if (!isValid) {
      event.preventDefault();
    }
  };

  return (
    <div
      className={cn('flex gap-3', isFirstStep ? 'justify-center' : 'justify-between', className)}
    >
      {!isFirstStep && (
        <Button type='button' variant='secondary' onPress={prevStep}>
          {backLabel}
        </Button>
      )}

      {isLastStep ? (
        <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} onClick={handleSubmit}>
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
