/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Public API exports for Wizard component.
 * @module components/ui/wizard
 */
export { Wizard } from './wizard';
export { WizardStage } from './wizard-stage';
export { WizardIndicator } from './wizard-indicator';
export { WizardNavigation } from './wizard-navigation';
export { useWizard } from './wizard-context';
export type {
  WizardProps,
  WizardStageProps,
  WizardStageConfig,
  WizardIndicatorProps,
  WizardNavigationProps,
  WizardContextValue,
} from './ts/types';
