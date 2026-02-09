import { Input } from '~/components/ui/input';
import { PasswordInput } from '../../components/password-input';

interface AccountSectionProps {
  formData: Record<string, string>;
  handleChange: (name: string, value: string) => void;
  combinedErrors: {
    [x: string]: string;
  };
}

export function AccountSection({ formData, handleChange, combinedErrors }: AccountSectionProps) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Input
          name='firstName'
          label='First Name'
          aria-label='First name'
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
          aria-label='Last name'
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
        aria-label='Email address'
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
        aria-label='Create a password'
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
        aria-label='Confirm your password'
        placeholder='Confirm your password'
        autoComplete='new-password'
        value={formData.confirmPassword || ''}
        onChange={(value) => handleChange('confirmPassword', value)}
        errorMessage={combinedErrors?.confirmPassword}
        isInvalid={!!combinedErrors?.confirmPassword}
      />
    </div>
  );
}
