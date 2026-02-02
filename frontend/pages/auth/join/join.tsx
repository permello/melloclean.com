import { Form, Link, useActionData, useNavigation } from 'react-router';
import type { Route } from './+types/join';
import { AuthLayout } from '../components/auth-layout';
import { SocialButtons } from '../components/social-buttons';
import { PasswordInput } from '../components/password-input';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import {
  Wizard,
  WizardStep,
  WizardIndicator,
  WizardNavigation,
  useWizard,
  type WizardStepConfig,
} from '~/components/ui/wizard';
import { validators, validateForm, type ValidationErrors } from '~/core/util/validation';

interface ActionData {
  errors?: ValidationErrors;
  success?: boolean;
}

type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const data = Object.fromEntries(formData.entries()) as SignupFormData;

  // Wizard component handles all validation client-side
  // TODO: Actual account creation logic here
  console.log('Creating account for:', data.email);

  return { success: true };
}

const wizardSteps: WizardStepConfig[] = [
  {
    id: 'account',
    name: 'Account',
    validate: (data) =>
      validateForm(
        {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          password: data.password || '',
          confirmPassword: data.confirmPassword || '',
        },
        {
          firstName: [(v) => validators.required(v, 'First name')],
          lastName: [(v) => validators.required(v, 'Last name')],
          email: [(v) => validators.required(v, 'Email'), validators.email],
          password: [(v) => validators.required(v, 'Password'), (v) => validators.minLength(v, 8)],
          confirmPassword: [
            (v) => validators.required(v, 'Confirm password'),
            (v) => validators.confirmPassword(v, data.password || ''),
          ],
        },
      ),
  },
  {
    id: 'address',
    name: 'Service Address',
    validate: (data) =>
      validateForm(
        {
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
        },
        {
          street: [(v) => validators.required(v, 'Street address')],
          city: [(v) => validators.required(v, 'City')],
          state: [(v) => validators.required(v, 'State')],
          zipCode: [(v) => validators.required(v, 'Zip code'), validators.zipCode],
        },
      ),
  },

  {
    id: 'address 2',
    name: 'Service Address 2',
    validate: (data) =>
      validateForm(
        {
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
        },
        {
          street: [(v) => validators.required(v, 'Street address')],
          city: [(v) => validators.required(v, 'City')],
          state: [(v) => validators.required(v, 'State')],
          zipCode: [(v) => validators.required(v, 'Zip code'), validators.zipCode],
        },
      ),
  },
  {
    id: 'address 3',
    name: 'Service Address 3',
    validate: (data) =>
      validateForm(
        {
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
        },
        {
          street: [(v) => validators.required(v, 'Street address')],
          city: [(v) => validators.required(v, 'City')],
          state: [(v) => validators.required(v, 'State')],
          zipCode: [(v) => validators.required(v, 'Zip code'), validators.zipCode],
        },
      ),
  },
];

function WizardFormContent() {
  const { errors, formData, updateFormData } = useWizard();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const combinedErrors = { ...errors, ...actionData?.errors };

  const handleInputChange = (name: string, value: string) => {
    updateFormData({ [name]: value });
  };

  return (
    <>
      <WizardIndicator className='mb-6' />

      <WizardStep id='account'>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <Input
              name='firstName'
              label='First Name'
              placeholder='John'
              autoComplete='given-name'
              value={formData.firstName || ''}
              onChange={(value) => handleInputChange('firstName', value)}
              error={combinedErrors?.firstName}
            />
            <Input
              name='lastName'
              label='Last Name'
              placeholder='Doe'
              autoComplete='family-name'
              value={formData.lastName || ''}
              onChange={(value) => handleInputChange('lastName', value)}
              error={combinedErrors?.lastName}
            />
          </div>

          <Input
            name='email'
            label='Email'
            type='email'
            placeholder='you@example.com'
            autoComplete='email'
            value={formData.email || ''}
            onChange={(value) => handleInputChange('email', value)}
            error={combinedErrors?.email}
          />

          <PasswordInput
            name='password'
            label='Password'
            placeholder='Create a password'
            autoComplete='new-password'
            showRequirements
            value={formData.password || ''}
            onChange={(value) => handleInputChange('password', value)}
            error={combinedErrors?.password}
          />

          <PasswordInput
            name='confirmPassword'
            label='Confirm Password'
            placeholder='Confirm your password'
            autoComplete='new-password'
            value={formData.confirmPassword || ''}
            onChange={(value) => handleInputChange('confirmPassword', value)}
            error={combinedErrors?.confirmPassword}
          />
        </div>
      </WizardStep>

      <WizardStep id='address'>
        <div className='space-y-4'>
          <Input
            name='street'
            label='Street Address'
            placeholder='123 Main St'
            autoComplete='street-address'
            value={formData.street || ''}
            onChange={(value) => handleInputChange('street', value)}
            error={combinedErrors?.street}
          />

          <div className='grid grid-cols-2 gap-4'>
            <Input
              name='city'
              label='City'
              placeholder='Houston'
              autoComplete='address-level2'
              value={formData.city || ''}
              onChange={(value) => handleInputChange('city', value)}
              error={combinedErrors?.city}
            />
            <Input
              name='state'
              label='State'
              placeholder='TX'
              autoComplete='address-level1'
              value={formData.state || ''}
              onChange={(value) => handleInputChange('state', value)}
              error={combinedErrors?.state}
            />
          </div>

          <Input
            name='zipCode'
            label='Zip Code'
            placeholder='77001'
            autoComplete='postal-code'
            value={formData.zipCode || ''}
            onChange={(value) => handleInputChange('zipCode', value)}
            error={combinedErrors?.zipCode}
          />
        </div>
      </WizardStep>

      <WizardStep id='address 2'>
        <div className='space-y-4'>
          <Input
            name='street'
            label='Street Address'
            placeholder='123 Main St'
            autoComplete='street-address'
            value={formData.street || ''}
            onChange={(value) => handleInputChange('street', value)}
            error={combinedErrors?.street}
          />

          <div className='grid grid-cols-2 gap-4'>
            <Input
              name='city'
              label='City'
              placeholder='Houston'
              autoComplete='address-level2'
              value={formData.city || ''}
              onChange={(value) => handleInputChange('city', value)}
              error={combinedErrors?.city}
            />
            <Input
              name='state'
              label='State'
              placeholder='TX'
              autoComplete='address-level1'
              value={formData.state || ''}
              onChange={(value) => handleInputChange('state', value)}
              error={combinedErrors?.state}
            />
          </div>

          <Input
            name='zipCode'
            label='Zip Code'
            placeholder='77001'
            autoComplete='postal-code'
            value={formData.zipCode || ''}
            onChange={(value) => handleInputChange('zipCode', value)}
            error={combinedErrors?.zipCode}
          />
        </div>
      </WizardStep>

      <WizardStep id='address 3'>
        <div className='space-y-4'>
          <Input
            name='street'
            label='Street Address'
            placeholder='123 Main St'
            autoComplete='street-address'
            value={formData.street || ''}
            onChange={(value) => handleInputChange('street', value)}
            error={combinedErrors?.street}
          />

          <div className='grid grid-cols-2 gap-4'>
            <Input
              name='city'
              label='City'
              placeholder='Houston'
              autoComplete='address-level2'
              value={formData.city || ''}
              onChange={(value) => handleInputChange('city', value)}
              error={combinedErrors?.city}
            />
            <Input
              name='state'
              label='State'
              placeholder='TX'
              autoComplete='address-level1'
              value={formData.state || ''}
              onChange={(value) => handleInputChange('state', value)}
              error={combinedErrors?.state}
            />
          </div>

          <Input
            name='zipCode'
            label='Zip Code'
            placeholder='77001'
            autoComplete='postal-code'
            value={formData.zipCode || ''}
            onChange={(value) => handleInputChange('zipCode', value)}
            error={combinedErrors?.zipCode}
          />
        </div>
      </WizardStep>

      {/* Hidden inputs to submit all form data */}
      {Object.entries(formData).map(([key, value]) => (
        <input key={key} type='hidden' name={key} value={value} />
      ))}

      <WizardNavigation
        isSubmitting={isSubmitting}
        completeLabel='Create Account'
        className='mt-6'
      />
    </>
  );
}

export default function JoinPage() {
  return (
    <AuthLayout title='Create your account' subtitle='Join us to book your cleaning services'>
      <Form method='post'>
        <Wizard steps={wizardSteps}>
          <WizardFormContent />
        </Wizard>
      </Form>

      <div className='relative my-6'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-slate-200' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='bg-white px-4 text-slate-500'>Or continue with</span>
        </div>
      </div>

      <SocialButtons />

      <Text className='mt-6 text-center text-sm'>
        Already have an account?{' '}
        <Link to='/login' className='font-medium text-emerald-600 hover:text-emerald-700'>
          Sign in
        </Link>
      </Text>
    </AuthLayout>
  );
}
