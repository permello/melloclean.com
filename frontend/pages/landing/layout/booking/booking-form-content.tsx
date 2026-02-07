/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { useCallback } from 'react';
import {
  WizardStage,
  WizardIndicator,
  WizardNavigation,
  useWizard,
} from '~/components/ui/wizard';
import { Select } from '~/components/ui/select';
import { Slider } from '~/components/ui/slider';
import { Input } from '~/components/ui/input';
import { ToggleButtonGroup } from '~/components/ui/toggle-button-group';
import { Heading } from '~/components/ui/heading';
import { BookingSummary } from './booking-summary';
import {
  cleaningTypeOptions,
  bedroomOptions,
  bathroomOptions,
  lastCleanedOptions,
  priorityAreaOptions,
  occasionOptions,
} from './ts/constants';

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

  const priorityKeys = formData.priorityAreas ? formData.priorityAreas.split(',').filter(Boolean) : [];

  return (
    <>
      <WizardIndicator maxVisibleStages={4} className='mb-6' />

      {/* Stage 1: General Info */}
      <WizardStage id='general'>
        <div className='space-y-6'>
          <Heading level={5} className='mb-2'>
            General Info
          </Heading>
          <Select
            label='Cleaning Type'
            placeholder='Select cleaning type'
            options={cleaningTypeOptions}
            selectedKey={formData.cleaningType || ''}
            onSelectionChange={(key) => setField('cleaningType', key)}
            errorMessage={errors.cleaningType}
          />
          <Slider
            label='Dirtiness Scale'
            hint='1 = spotless, 10 = almost unlivable'
            minValue={1}
            maxValue={10}
            step={1}
            value={Number(formData.dirtiness) || 1}
            onChange={(val) => setField('dirtiness', String(val))}
            showValue
            errorMessage={errors.dirtiness}
          />
        </div>
      </WizardStage>

      {/* Stage 2: Home Details */}
      <WizardStage id='home'>
        <div className='space-y-6'>
          <Heading level={5} className='mb-2'>
            Home Details
          </Heading>
          <div className='grid grid-cols-2 gap-4'>
            <Select
              label='Bedrooms'
              placeholder='Select'
              options={bedroomOptions}
              selectedKey={formData.bedrooms || ''}
              onSelectionChange={(key) => setField('bedrooms', key)}
              errorMessage={errors.bedrooms}
            />
            <Select
              label='Bathrooms'
              placeholder='Select'
              options={bathroomOptions}
              selectedKey={formData.bathrooms || ''}
              onSelectionChange={(key) => setField('bathrooms', key)}
              errorMessage={errors.bathrooms}
            />
          </div>
          <Input
            label='Square Footage'
            type='number'
            placeholder='e.g. 1500'
            value={formData.squareFootage || ''}
            onChange={(val) => setField('squareFootage', val)}
            errorMessage={errors.squareFootage}
          />
          <Select
            label='Last Professionally Cleaned'
            placeholder='Select'
            options={lastCleanedOptions}
            selectedKey={formData.lastCleaned || ''}
            onSelectionChange={(key) => setField('lastCleaned', key)}
            errorMessage={errors.lastCleaned}
          />
        </div>
      </WizardStage>

      {/* Stage 3: About Your Visit */}
      <WizardStage id='visit'>
        <div className='space-y-6'>
          <Heading level={5} className='mb-2'>
            About Your Visit
          </Heading>
          <ToggleButtonGroup
            label='Priority areas to clean'
            options={priorityAreaOptions}
            selectedKeys={priorityKeys}
            onSelectionChange={(keys) => setField('priorityAreas', keys.join(','))}
            errorMessage={errors.priorityAreas}
          />
          <ToggleButtonGroup
            label='Special occasion?'
            options={occasionOptions}
            selectedKeys={formData.hasSpecialOccasion ? [formData.hasSpecialOccasion] : []}
            onSelectionChange={(keys) => {
              const value = keys[keys.length - 1] || '';
              setField('hasSpecialOccasion', value);
              if (value !== 'yes') {
                setField('specialOccasion', '');
              }
            }}
          />
          {formData.hasSpecialOccasion === 'yes' && (
            <Input
              label='Describe the occasion'
              placeholder='e.g. Housewarming party, Holiday guests'
              value={formData.specialOccasion || ''}
              onChange={(val) => setField('specialOccasion', val)}
              errorMessage={errors.specialOccasion}
            />
          )}
          <Input
            label='Preferred Date'
            type='date'
            value={formData.preferredDate || ''}
            onChange={(val) => setField('preferredDate', val)}
            errorMessage={errors.preferredDate}
          />
        </div>
      </WizardStage>

      {/* Stage 4: Summary */}
      <WizardStage id='summary'>
        <BookingSummary formData={formData} />
      </WizardStage>

      <WizardNavigation
        className='mt-8'
        completeLabel='Confirm & Create Account'
      />
    </>
  );
}
