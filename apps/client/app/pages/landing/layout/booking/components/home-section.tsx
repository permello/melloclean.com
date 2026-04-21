/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */
import { Heading, Input, Select, type SelectOption } from '@permello/ui';
import type { ValidationErrors } from '~/core/util/validation';

/**
 * Options for the number of bedrooms select field.
 */
const bedroomOptions: SelectOption[] = [
  { key: '1', label: '1' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '4', label: '4' },
  { key: '5', label: '5' },
  { key: '6+', label: '6+' },
];

/**
 * Options for the number of bathrooms select field.
 */
const bathroomOptions: SelectOption[] = [
  { key: '1', label: '1' },
  { key: '1.5', label: '1.5' },
  { key: '2', label: '2' },
  { key: '2.5', label: '2.5' },
  { key: '3', label: '3' },
  { key: '3.5', label: '3.5' },
  { key: '4+', label: '4+' },
];

/**
 * Options for the "last professionally cleaned" select field.
 */
const lastCleanedOptions: SelectOption[] = [
  { key: 'never', label: 'Never' },
  { key: '1month', label: 'Within 1 month' },
  { key: '1-3months', label: '1-3 months' },
  { key: '3-6months', label: '3-6 months' },
  { key: '6-12months', label: '6-12 months' },
  { key: '1+year', label: '1+ year' },
];

/**
 * Props for the {@link HomeSection} component.
 */
interface HomeSectionProps {
  /** Current wizard form values */
  formData: Record<string, string>;
  /** Callback to update a single form field by key */
  setField: (key: string, value: string) => void;
  /** Validation errors keyed by field name */
  errors: ValidationErrors;
}

/**
 * Second booking stage — home details.
 * Renders selects for bedrooms, bathrooms, and last cleaned, plus a square footage input.
 *
 * @param props - Component props
 * @param props.formData - Current wizard form values
 * @param props.setField - Callback to update a single form field
 * @param props.errors - Validation errors keyed by field name
 * @returns Home details form fields
 */
export function HomeSection({ formData, setField, errors }: HomeSectionProps) {
  return (
    <div className='space-y-6'>
      <Heading level={5} className='mb-2'>
        Home Details
      </Heading>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
        aria-label='Square footage of your home'
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
  );
}
