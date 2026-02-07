import { useActionData, useNavigation } from 'react-router';
import { Input } from '~/components/ui/input';
import { useWizard, WizardIndicator, WizardNavigation, WizardStage } from '~/components/ui/wizard';
import { PasswordInput } from '../components/password-input';
import type { ActionData } from './ts/types';

/**
 * Internal component containing the wizard form fields.
 * Manages form state and renders step content.
 *
 * @returns Wizard form with indicator, steps, and navigation
 */
export function WizardFormContent() {
  const { errors, formData, updateFormData } = useWizard();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const combinedErrors = { ...errors, ...actionData?.errors };

  const handleChange = (name: string, value: string) => {
    updateFormData({ [name]: value });
  };

  return (
    <>
      <WizardIndicator className='mb-6' />

      <WizardStage id='account'>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <Input
              name='firstName'
              label='First Name'
              placeholder='John'
              autoComplete='given-name'
              value={formData.firstName || ''}
              onChange={(value) => handleChange('firstName', value)}
              errorMessage={combinedErrors?.firstName}
              isInvalid={!!combinedErrors?.firstName}
            />
            <Input
              name='lastName'
              label='Last Name'
              placeholder='Doe'
              autoComplete='family-name'
              value={formData.lastName || ''}
              onChange={(value) => handleChange('lastName', value)}
              errorMessage={combinedErrors?.lastName}
              isInvalid={!!combinedErrors?.lastName}
            />
          </div>

          <Input
            name='email'
            label='Email'
            type='email'
            placeholder='you@example.com'
            autoComplete='email'
            value={formData.email || ''}
            onChange={(value) => handleChange('email', value)}
            errorMessage={combinedErrors?.email}
            isInvalid={!!combinedErrors?.email}
          />

          <PasswordInput
            name='password'
            label='Password'
            placeholder='Create a password'
            autoComplete='new-password'
            showRequirements
            value={formData.password || ''}
            onChange={(value) => handleChange('password', value)}
            errorMessage={combinedErrors?.password}
            isInvalid={!!combinedErrors?.password}
          />

          <PasswordInput
            name='confirmPassword'
            label='Confirm Password'
            placeholder='Confirm your password'
            autoComplete='new-password'
            value={formData.confirmPassword || ''}
            onChange={(value) => handleChange('confirmPassword', value)}
            errorMessage={combinedErrors?.confirmPassword}
            isInvalid={!!combinedErrors?.confirmPassword}
          />
        </div>
      </WizardStage>

      <WizardStage id='address'>
        <div className='space-y-4'>
          <Input
            name='street'
            label='Street Address'
            placeholder='123 Main St'
            autoComplete='street-address'
            value={formData.street || ''}
            onChange={(value) => handleChange('street', value)}
            errorMessage={combinedErrors?.street}
            isInvalid={!!combinedErrors?.street}
          />

          <div className='grid grid-cols-2 gap-4'>
            <Input
              name='city'
              label='City'
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
            placeholder='77001'
            autoComplete='postal-code'
            value={formData.zipCode || ''}
            onChange={(value) => handleChange('zipCode', value)}
            errorMessage={combinedErrors?.zipCode}
            isInvalid={!!combinedErrors?.zipCode}
          />
        </div>
      </WizardStage>

      <WizardStage id='address 2'>
        <div className='space-y-4'>
          <Input
            name='street'
            label='Street Address'
            placeholder='123 Main St'
            autoComplete='street-address'
            value={formData.street || ''}
            onChange={(value) => handleChange('street', value)}
            errorMessage={combinedErrors?.street}
            isInvalid={!!combinedErrors?.street}
          />

          <div className='grid grid-cols-2 gap-4'>
            <Input
              name='city'
              label='City'
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
            placeholder='77001'
            autoComplete='postal-code'
            value={formData.zipCode || ''}
            onChange={(value) => handleChange('zipCode', value)}
            errorMessage={combinedErrors?.zipCode}
            isInvalid={!!combinedErrors?.zipCode}
          />
        </div>
      </WizardStage>

      <WizardStage id='address 3'>
        <div className='space-y-4'>
          <Input
            name='street'
            label='Street Address'
            placeholder='123 Main St'
            autoComplete='street-address'
            value={formData.street || ''}
            onChange={(value) => handleChange('street', value)}
            errorMessage={combinedErrors?.street}
            isInvalid={!!combinedErrors?.street}
          />

          <div className='grid grid-cols-2 gap-4'>
            <Input
              name='city'
              label='City'
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
            placeholder='77001'
            autoComplete='postal-code'
            value={formData.zipCode || ''}
            onChange={(value) => handleChange('zipCode', value)}
            errorMessage={combinedErrors?.zipCode}
            isInvalid={!!combinedErrors?.zipCode}
          />
        </div>
      </WizardStage>

      <WizardNavigation
        isSubmitting={isSubmitting}
        completeLabel='Create Account'
        className='mt-6'
      />
    </>
  );
}
