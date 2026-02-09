/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */
import { Heading } from '~/components/ui/heading';
import { Input } from '~/components/ui/input';
import { ToggleButtonGroup, type ToggleOption } from '~/components/ui/toggle-button-group';
import type { ValidationErrors } from '~/core/util/validation';

/**
 * Props for the {@link VisitSection} component.
 */
interface VisitSectionProps {
  /** Currently selected priority area keys */
  priorityKeys: string[];
  /** Callback to update a single form field by key */
  setField: (key: string, value: string) => void;
  /** Validation errors keyed by field name */
  errors: ValidationErrors;
  /** Current wizard form values */
  formData: Record<string, string>;
}
/**
 * Options for the priority areas toggle button group.
 */
const priorityAreaOptions: ToggleOption[] = [
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'floors', label: 'Floors' },
  { key: 'sinks', label: 'Sinks' },
  { key: 'dusting', label: 'Dusting' },
  { key: 'windows', label: 'Windows' },
  { key: 'appliances', label: 'Appliances' },
  { key: 'baseboards', label: 'Baseboards' },
  { key: 'garage', label: 'Garage' },
];

/**
 * Options for the special occasion yes/no toggle.
 */
const occasionOptions: ToggleOption[] = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
];

/**
 * Third booking stage — visit preferences.
 * Renders priority areas toggle, special occasion toggle with conditional input,
 * and a preferred date picker.
 *
 * @param props - Component props
 * @param props.priorityKeys - Currently selected priority area keys
 * @param props.setField - Callback to update a single form field
 * @param props.errors - Validation errors keyed by field name
 * @param props.formData - Current wizard form values
 * @returns Visit details form fields
 */
export function VisitSection({ priorityKeys, setField, errors, formData }: VisitSectionProps) {
  return (
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
          aria-label='Describe the special occasion'
          placeholder='e.g. Housewarming party, Holiday guests'
          value={formData.specialOccasion || ''}
          onChange={(val) => setField('specialOccasion', val)}
          errorMessage={errors.specialOccasion}
        />
      )}
      <Input
        label='Preferred Date'
        aria-label='Preferred cleaning date'
        type='date'
        value={formData.preferredDate || ''}
        onChange={(val) => setField('preferredDate', val)}
        errorMessage={errors.preferredDate}
      />
    </div>
  );
}
