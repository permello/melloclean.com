import type { ReactNode } from 'react';
import type { ValidationErrors } from '~/core/util/validation';

export interface WizardStepConfig {
  id: string;
  name: string;
  validate?: (formData: Record<string, string>) => ValidationErrors;
}

export interface WizardProps {
  steps: WizardStepConfig[];
  children: ReactNode;
  onComplete?: (formData: Record<string, string>) => void;
  className?: string;
}

export interface WizardStepProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export interface WizardIndicatorProps {
  className?: string;
  maxVisibleSteps?: number;
}

export interface WizardNavigationProps {
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
  completeLabel?: string;
  className?: string;
}

export interface WizardContextValue {
  currentStep: number;
  steps: WizardStepConfig[];
  errors: ValidationErrors;
  formData: Record<string, string>;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => boolean;
  prevStep: () => void;
  updateFormData: (data: Record<string, string>) => void;
  setErrors: (errors: ValidationErrors) => void;
}
