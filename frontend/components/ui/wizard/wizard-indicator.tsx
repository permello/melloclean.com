import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '~/core/util/cn';
import { useWizard } from './wizard-context';
import { circleVariants, labelVariants, connectorVariants } from './ts/variants';
import type { WizardIndicatorProps } from './ts/types';

const getVisibleRange = (total: number, current: number, max: number) => {
  if (total <= max) return { start: 0, end: total };

  // Pin to start edge
  if (current < max - 1) return { start: 0, end: max };

  // Pin to end edge
  if (current >= total - 1) return { start: total - max, end: total };

  // Slide with current step at the end of visible window
  return { start: current - max + 2, end: current + 2 };
};

export function WizardIndicator({ className, maxVisibleSteps = 3 }: WizardIndicatorProps) {
  const { steps, currentStep } = useWizard();

  const { start, end } = getVisibleRange(steps.length, currentStep, maxVisibleSteps);
  const visibleSteps = steps.slice(start, end);

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className={cn('relative', className)}>
      {start > 0 && (
        <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      )}
      {end < steps.length && (
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      )}
      <div className="flex items-stretch justify-center gap-1 overflow-hidden">
        {visibleSteps.map((step, visibleIndex) => {
          const actualIndex = start + visibleIndex;
          const status = getStepStatus(actualIndex);
          const isCompleted = status === 'completed';

          return (
            <div key={step.id} className='flex items-stretch'>
              <div className='flex flex-col items-center'>
                <motion.div
                  className={cn(circleVariants({ status }))}
                  initial={false}
                  animate={{
                    scale: status === 'active' ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className='h-4 w-4' />
                    </motion.div>
                  ) : (
                    actualIndex + 1
                  )}
                </motion.div>
                <span className={cn(labelVariants({ status }))}>{step.name}</span>
              </div>

              {visibleIndex < visibleSteps.length - 1 && (
                <div
                  className={cn(
                    connectorVariants({
                      status: actualIndex < currentStep ? 'completed' : 'pending',
                    }),
                    'self-center',
                  )}
                  style={{ minWidth: '2rem' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
