/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React from 'react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { validateForm, validators, type ValidationErrors } from '~/core/util/validation';
import { AuthLayout } from '../components/auth-layout';
import { PasswordInput } from '../components/password-input';
import { SocialButtons } from '../components/social-buttons';

/**
 * Login page component with email/password form and social login options.
 *
 * @returns Login page with form and social buttons
 */
export default function LoginPage() {
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  /**
   * Validates form fields and submits credentials to the API.
   *
   * @param e - Form submit event
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    const validationErrors = validateForm(
      { email, password },
      {
        email: [(v) => validators.required(v, 'Email'), validators.email],
        password: [(v) => validators.required(v, 'Password'), (v) => validators.minLength(v, 8)],
      },
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    // TODO: call authentication API
    setIsSubmitting(false);
  }

  return (
    <AuthLayout title='Welcome back' subtitle='Sign in to your account'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <Input
          name='email'
          label='Email'
          aria-label='Email address'
          type='email'
          placeholder='you@example.com'
          autoComplete='email'
          error={errors.email}
        />

        <PasswordInput
          name='password'
          label='Password'
          aria-label='Password'
          placeholder='Enter your password'
          autoComplete='current-password'
          error={errors.password}
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
      </form>

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
