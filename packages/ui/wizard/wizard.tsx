/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cn } from '~/core/util/cn';
import { WizardProvider } from './wizard-context';
import type { WizardProps } from './ts/types';

/**
 * Multi-step form wizard component with validation support.
 * Manages step state and form data collection across multiple steps.
 *
 * @example
 * ```tsx
 * <Wizard steps={[{ id: 'info', name: 'Info' }]}>
 *   <WizardIndicator />
 *   <WizardStep id="info">Step content</WizardStep>
 *   <WizardNavigation />
 * </Wizard>
 * ```
 *
 * @param props - Component props
 * @returns Wizard container with context provider
 */
export function Wizard({ stages, children, className }: WizardProps) {
  return (
    <WizardProvider stages={stages}>
      <div className={cn(className)}>{children}</div>
    </WizardProvider>
  );
}
