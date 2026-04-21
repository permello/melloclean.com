/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */
import { Heading, Select, type SelectOption, Slider } from '@permello/ui';
import type { ValidationErrors } from '~/core/util/validation';

/**
 * Props for the {@link GeneralSection} component.
 */
interface GeneralSectionProps {
  /** Current wizard form values */
  formData: Record<string, string>;
  /** Callback to update a single form field by key */
  setField: (key: string, value: string) => void;
  /** Validation errors keyed by field name */
  errors: ValidationErrors;
}

/**
 * Options for the cleaning type select field.
 */
const cleaningTypeOptions: SelectOption[] = [
  { key: 'standard', label: 'Standard' },
  { key: 'deep', label: 'Deep' },
  { key: 'move', label: 'Move In/Out' },
  { key: 'office', label: 'Office' },
];

/**
 * First booking stage — cleaning type and dirtiness level.
 * Renders a select dropdown for cleaning type and a slider for dirtiness scale.
 *
 * @param props - Component props
 * @param props.formData - Current wizard form values
 * @param props.setField - Callback to update a single form field
 * @param props.errors - Validation errors keyed by field name
 * @returns General info form fields
 */
export function GeneralSection({ formData, setField, errors }: GeneralSectionProps) {
  return (
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
  );
}
