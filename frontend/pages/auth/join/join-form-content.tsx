/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React from 'react';
import { useActionData, useNavigation } from 'react-router';
import { useWizard, WizardIndicator, WizardNavigation, WizardStage } from '~/components/ui/wizard';
import { AccountSection, AddressSection } from './components';
import { ACCOUNT_CONFIG, ADDRESS_CONFIG } from './ts/constants';
import type { ActionData } from './ts/types';

/**
 * Internal component containing the wizard form fields.
 * Manages form state and renders step content.
 *
 * @returns Wizard form with indicator, steps, and navigation
 */
export function JoinFormContent() {
  const { errors, formData, updateFormData } = useWizard();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const combinedErrors = { ...errors, ...actionData?.errors };

  /**
   * Updates a single form field in the wizard's shared form state.
   *
   * @param name - The field name to update
   * @param value - The new value for the field
   */
  const handleChange = (name: string, value: string) => {
    updateFormData({ [name]: value });
  };

  return (
    <React.Fragment>
      <WizardIndicator className='mb-6' />

      <WizardStage id={ACCOUNT_CONFIG.id}>
        <AccountSection
          formData={formData}
          handleChange={handleChange}
          combinedErrors={combinedErrors}
        />
      </WizardStage>

      <WizardStage id={ADDRESS_CONFIG.id}>
        <AddressSection
          formData={formData}
          handleChange={handleChange}
          combinedErrors={combinedErrors}
        />
      </WizardStage>

      <WizardNavigation
        isSubmitting={isSubmitting}
        completeLabel='Create Account'
        className='mt-6'
      />
    </React.Fragment>
  );
}
