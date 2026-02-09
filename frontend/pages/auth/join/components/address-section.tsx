import { Input } from '~/components/ui/input';

interface AddressSectionProps {
  formData: Record<string, string>;
  handleChange: (name: string, value: string) => void;
  combinedErrors: {
    [x: string]: string;
  };
}

export function AddressSection({ formData, handleChange, combinedErrors }: AddressSectionProps) {
  return (
    <div className='space-y-4'>
      <Input
        name='street'
        label='Street Address'
        aria-label='Street address'
        placeholder='123 Main St'
        autoComplete='street-address'
        value={formData.street || ''}
        onChange={(value) => handleChange('street', value)}
        errorMessage={combinedErrors?.street}
        isInvalid={!!combinedErrors?.street}
      />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Input
          name='city'
          label='City'
          aria-label='City'
          placeholder='Houston'
          autoComplete='address-level2'
          value={formData.city || ''}
          onChange={(value) => handleChange('city', value)}
          errorMessage={combinedErrors?.city}
          isInvalid={!!combinedErrors?.city}
        />
        <Input
          name='state'
          label='State'
          aria-label='State'
          placeholder='TX'
          autoComplete='address-level1'
          value={formData.state || ''}
          onChange={(value) => handleChange('state', value)}
          errorMessage={combinedErrors?.state}
          isInvalid={!!combinedErrors?.state}
        />
      </div>

      <Input
        name='zipCode'
        label='Zip Code'
        aria-label='Zip code'
        placeholder='77001'
        autoComplete='postal-code'
        value={formData.zipCode || ''}
        onChange={(value) => handleChange('zipCode', value)}
        errorMessage={combinedErrors?.zipCode}
        isInvalid={!!combinedErrors?.zipCode}
      />
    </div>
  );
}
