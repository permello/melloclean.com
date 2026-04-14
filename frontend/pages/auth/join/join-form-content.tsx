/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React from 'react';
import { useWizard, WizardIndicator, WizardNavigation, WizardStage } from '~/components/ui/wizard';
import { AccountSection, AddressSection } from './components';
import { ACCOUNT_CONFIG, ADDRESS_CONFIG } from './ts/constants';

/**
 * Internal component containing the wizard form fields.
 * Manages form state and renders step content.
 *
 * @returns Wizard form with indicator, steps, and navigation
 */
export function JoinFormContent() {
  const { errors, formData, updateFormData } = useWizard();

  const combinedErrors = { ...errors };

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

      <WizardNavigation completeLabel='Create Account' className='mt-6' />
    </React.Fragment>
  );
}
