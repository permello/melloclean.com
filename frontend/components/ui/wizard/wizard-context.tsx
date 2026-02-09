/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { validateForm, type ValidationErrors } from '~/core/util/validation';
import type { WizardContextValue, WizardStageConfig } from './ts/types';

/**
 * React context for wizard state and actions.
 */
const WizardContext = createContext<WizardContextValue | null>(null);

/**
 * Hook to access wizard context from child components.
 *
 * @throws Error if used outside of WizardProvider
 * @returns Wizard context value with state and actions
 */
export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

/**
 * Props for the WizardProvider component.
 */
interface WizardProviderProps {
  /** Stage configurations */
  stages: WizardStageConfig[];
  /** Child components */
  children: ReactNode;
}

/**
 * Provider component that manages wizard state and provides context to children.
 *
 * @param props - Component props
 * @returns Provider wrapping children with wizard context
 */
export function WizardProvider({ stages, children }: WizardProviderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxCompletedStep, setMaxCompletedStep] = useState(-1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});

  const isFirstStage = currentStep === 0;
  const isLastStage = currentStep === stages.length - 1;

  /** Merges new field values into the existing form data. */
  const updateFormData = useCallback((data: Record<string, string>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  /** Validates the current stage and advances to the next if valid. Returns true on success. */
  const nextStage = useCallback((): boolean => {
    const currentStepConfig = stages[currentStep];
    if (currentStepConfig.validate === undefined) {
      return false;
    }
    const validationErrors = validateForm(formData, currentStepConfig.validate);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    setMaxCompletedStep((prev) => Math.max(prev, currentStep));

    if (!isLastStage) {
      setCurrentStep((prev) => prev + 1);
    }

    return true;
  }, [currentStep, stages, formData, isLastStage]);

  /** Returns to the previous stage, clearing any validation errors. */
  const prevStage = useCallback(() => {
    if (!isFirstStage) {
      setErrors({});
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStage]);

  /** Navigates directly to a previously completed stage by index. Clears validation errors. */
  const goToStage = useCallback(
    (index: number) => {
      if (index >= 0 && index <= maxCompletedStep && index !== currentStep) {
        setErrors({});
        setCurrentStep(index);
      }
    },
    [currentStep, maxCompletedStep],
  );

  const value: WizardContextValue = {
    currentStep,
    maxCompletedStep,
    stages,
    errors,
    formData,
    isFirstStage,
    isLastStage,
    nextStage,
    prevStage,
    goToStage,
    updateFormData,
    setErrors,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
