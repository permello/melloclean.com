import { Heading } from '~/components/ui/heading';
import { Select, type SelectOption } from '~/components/ui/select';
import { Slider } from '~/components/ui/slider';
import type { ValidationErrors } from '~/core/util/validation';

interface GeneralSectionProps {
  formData: Record<string, string>;
  setField: (key: string, value: string) => void;
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
