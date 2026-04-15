/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Form, Link, useActionData, useNavigation } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { validateForm, validators, type ValidationErrors } from '~/core/util/validation';
import { AuthLayout } from '../components/auth-layout';
import { PasswordInput } from '../components/password-input';
import { SocialButtons } from '../components/social-buttons';
import type { Route } from './+types/login';

/**
 * Response data from the login action.
 */
interface ActionData {
  /** Validation errors by field name */
  errors?: ValidationErrors;
  /** Whether login was successful */
  success?: boolean;
}

/**
 * Server action to handle login form submission.
 * Validates email and password fields.
 *
 * @param args - Route action arguments
 * @returns Action response with errors or success status
 */
export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const errors = validateForm(
    { email, password },
    {
      email: [(v) => validators.required(v, 'Email'), validators.email],
      password: [(v) => validators.required(v, 'Password'), (v) => validators.minLength(v, 8)],
    },
  );

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return { success: true };
}

/**
 * Login page component with email/password form and social login options.
 *
 * @returns Login page with form and social buttons
 */
export default function LoginPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <AuthLayout title='Welcome back' subtitle='Sign in to your account'>
      <Form method='post' className='space-y-4'>
        <Input
          name='email'
          label='Email'
          aria-label='Email address'
          type='email'
          placeholder='you@example.com'
          autoComplete='email'
          error={actionData?.errors?.email}
        />

        <PasswordInput
          name='password'
          label='Password'
          aria-label='Password'
          placeholder='Enter your password'
          autoComplete='current-password'
          error={actionData?.errors?.password}
        />

        <Button
          type='submit'
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className='w-full'
          aria-label='Sign in'
        >
          Sign In
        </Button>
      </Form>

      <SocialButtons />

      <Text className='mt-6 text-center text-sm'>
        Don&apos;t have an account?{' '}
        <Link to='/join' className='font-medium text-emerald-600 hover:text-emerald-700'>
          Create one
        </Link>
      </Text>
    </AuthLayout>
  );
}
