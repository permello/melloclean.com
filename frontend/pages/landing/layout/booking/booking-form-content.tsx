/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { useCallback } from 'react';
import { WizardIndicator, WizardNavigation, WizardStage, useWizard } from '~/components/ui/wizard';
import { GeneralSection, HomeSection, SummarySection, VisitSection } from './components';

/**
 * Internal form content component rendered inside the Wizard.
 * Provides access to wizard context for form data and error state.
 * Contains all 4 booking stages: General Info, Home Details, Your Visit, and Summary.
 *
 * @returns Rendered wizard stages with form fields
 */
export function BookingFormContent() {
  const { formData, updateFormData, errors } = useWizard();

  /** Updates a single form field by key. */
  const setField = useCallback(
    (key: string, value: string) => {
      updateFormData({ [key]: value });
    },
    [updateFormData],
  );

  const priorityKeys = formData.priorityAreas
    ? formData.priorityAreas.split(',').filter(Boolean)
    : [];

  return (
    <>
      <WizardIndicator maxVisibleStages={4} className='mb-6' />

      {/* Stage 1: General Info */}
      <WizardStage id='general'>
        <GeneralSection formData={formData} setField={setField} errors={errors} />
      </WizardStage>

      {/* Stage 2: Home Details */}
      <WizardStage id='home'>
        <HomeSection formData={formData} setField={setField} errors={errors} />
      </WizardStage>

      {/* Stage 3: About Your Visit */}
      <WizardStage id='visit'>
        <VisitSection
          priorityKeys={priorityKeys}
          setField={setField}
          errors={errors}
          formData={formData}
        />
      </WizardStage>

      {/* Stage 4: Summary */}
      <WizardStage id='summary'>
        <SummarySection formData={formData} />
      </WizardStage>

      <WizardNavigation className='mt-8' completeLabel='Confirm & Create Account' />
    </>
  );
}
