/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../util/cn';
import type { WizardIndicatorProps } from './ts/types';
import { circleVariants, connectorVariants, labelVariants } from './ts/variants';
import { useWizard } from './wizard-context';

/**
 * Calculates the visible range of steps for pagination.
 *
 * @param total - Total number of steps
 * @param current - Current step index
 * @param max - Maximum visible steps
 * @returns Start and end indices for visible steps
 */
const getVisibleRange = (total: number, current: number, max: number) => {
  if (total <= max) return { start: 0, end: total };

  // Pin to start edge
  if (current < max - 1) return { start: 0, end: max };

  // Pin to end edge
  if (current >= total - 1) return { start: total - max, end: total };

  // Slide with current step at the end of visible window
  return { start: current - max + 2, end: current + 2 };
};

/**
 * Visual stage indicator showing progress through the wizard.
 * Displays numbered circles with labels and connecting lines.
 * Supports pagination for wizards with many stages.
 *
 * @param props - Component props
 * @param props.maxVisibleStages - Maximum stages shown at once
 * @returns Stage indicator component
 */
export function WizardIndicator({ className, maxVisibleStages = 3 }: WizardIndicatorProps) {
  const { stages, currentStep, goToStage, maxCompletedStep } = useWizard();

  const { start, end } = getVisibleRange(stages.length, currentStep, maxVisibleStages);
  const visibleStages = stages.slice(start, end);

  /**
   * Determines the visual status of a stage by its index.
   *
   * @param index - The absolute stage index
   * @returns 'completed', 'active', or 'pending'
   */
  const getStageStatus = (index: number) => {
    if (index === currentStep) return 'active';
    if (index <= maxCompletedStep) return 'completed';
    return 'pending';
  };

  return (
    <div className={cn('hidden md:block', className)}>
      {start > 0 && (
        <div className='pointer-events-none absolute top-0 left-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent' />
      )}
      {end < stages.length && (
        <div className='pointer-events-none absolute top-0 right-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent' />
      )}
      <div className='flex items-stretch justify-center gap-1'>
        {visibleStages.map((stage, visibleIndex) => {
          const actualIndex = start + visibleIndex;
          const status = getStageStatus(actualIndex);
          const isCompleted = status === 'completed';

          return (
            <div key={stage.id} className='flex items-stretch'>
              {isCompleted ? (
                <button
                  type='button'
                  onClick={() => goToStage(actualIndex)}
                  aria-label={`Go back to step ${actualIndex + 1}: ${stage.name}`}
                  className='flex cursor-pointer flex-col items-center border-none bg-transparent p-0 focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none'
                >
                  <motion.div
                    className={cn(circleVariants({ status }))}
                    initial={false}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className='h-4 w-4' />
                    </motion.div>
                  </motion.div>
                  <span className={cn(labelVariants({ status }))}>{stage.name}</span>
                </button>
              ) : (
                <div className='flex flex-col items-center'>
                  <motion.div
                    className={cn(circleVariants({ status }))}
                    initial={false}
                    animate={{
                      scale: status === 'active' ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {actualIndex + 1}
                  </motion.div>
                  <span className={cn(labelVariants({ status }))}>{stage.name}</span>
                </div>
              )}

              {visibleIndex < visibleStages.length - 1 && (
                <div
                  className={cn(
                    connectorVariants({
                      status:
                        actualIndex < maxCompletedStep || actualIndex < currentStep
                          ? 'completed'
                          : 'pending',
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
