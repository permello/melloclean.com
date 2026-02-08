import { Heading } from '~/components/ui/heading';
import { Input } from '~/components/ui/input';
import { ToggleButtonGroup, type ToggleOption } from '~/components/ui/toggle-button-group';
import type { ValidationErrors } from '~/core/util/validation';

interface VisitSectionProps {
  priorityKeys: string[];
  setField: (key: string, value: string) => void;
  errors: ValidationErrors;
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
