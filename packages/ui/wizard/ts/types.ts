/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { ReactNode } from 'react';
import type { ValidationErrors, ValidatorFn } from '../../util/validation';

/**
 * Configuration for a single wizard stage.
 */
export interface WizardStageConfig {
  /** Unique identifier for the stage */
  id: string;
  /** Display name shown in the indicator */
  name: string;
  /** Optional validation function for the stage */
  validate?: Record<string, ValidatorFn[]>;
}

/**
 * Props for the main Wizard component.
 */
export interface WizardProps {
  /** Array of stage configurations */
  stages: WizardStageConfig[];
  /** Stage content as children */
  children: ReactNode;
  /** Callback when wizard completes */
  onComplete?: (formData: Record<string, string>) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for individual WizardStage components.
 */
export interface WizardStageProps {
  /** Must match a stage id from the wizard configuration */
  id: string;
  /** Stage content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the WizardIndicator component.
 */
export interface WizardIndicatorProps {
  /** Additional CSS classes */
  className?: string;
  /** Maximum number of visible stages before scrolling */
  maxVisibleStages?: number;
}

/**
 * Props for the WizardNavigation component.
 */
export interface WizardNavigationProps {
  /** Whether form submission is in progress */
  isSubmitting?: boolean;
  /** Label for the next button */
  nextLabel?: string;
  /** Label for the back button */
  backLabel?: string;
  /** Label for the complete/submit button */
  completeLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Context value providing wizard state and actions.
 */
export interface WizardContextValue {
  /** Current step index (0-based) */
  currentStep: number;
  /** Highest step index that has been validated (0-based). -1 means none completed. */
  maxCompletedStep: number;
  /** Array of stage configurations */
  stages: WizardStageConfig[];
  /** Current validation errors */
  errors: ValidationErrors;
  /** Collected form data */
  formData: Record<string, string>;
  /** Whether on the first stage */
  isFirstStage: boolean;
  /** Whether on the last stage */
  isLastStage: boolean;
  /** Advance to next stage, returns success status */
  nextStage: () => boolean;
  /** Go back to previous stage */
  prevStage: () => void;
  /**
   * Navigates directly to a previously completed stage.
   * Only allows navigation to previously completed stages.
   *
   * @param index - The 0-based index of the target stage
   */
  goToStage: (index: number) => void;
  /** Update form data */
  updateFormData: (data: Record<string, string>) => void;
  /** Set validation errors */
  setErrors: (errors: ValidationErrors) => void;
}
