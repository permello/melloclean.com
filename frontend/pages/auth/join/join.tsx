/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Link, redirect, useSubmit } from 'react-router';
import { Text } from '~/components/ui/text';
import { Wizard, type WizardStageConfig } from '~/components/ui/wizard';
import type { ApiError, ApiValidationError, AuthResponse } from '~/core/api';
import { AuthLayout } from '../components/auth-layout';
import { SocialButtons } from '../components/social-buttons';
import type { Route } from './+types/join';
import { JoinFormContent } from './join-form-content';
import { ACCOUNT_CONFIG, ADDRESS_CONFIG } from './ts/constants';
import type { ActionData, SignupFormData } from './ts/types';

/**
 * Wizard step configurations with validation rules.
 */
const signUpStages: WizardStageConfig[] = [ACCOUNT_CONFIG, ADDRESS_CONFIG];

/**
 * Client loader that redirects already-authenticated users to the dashboard.
 * Calls `/api/auth/me` — if the server returns 200, the user is logged in.
 *
 * @returns null when the user is not authenticated
 */
export async function clientLoader(): Promise<null> {
  const response = await fetch('/api/auth/me', { credentials: 'include' });
  if (response.ok) {
    throw redirect('/dashboard');
  }
  return null;
}

/**
 * Prevents the client loader from re-running after form submissions.
 * The auth check only needs to happen on initial page load.
 *
 * @returns false to skip re-validation after actions
 */
export function shouldRevalidate() {
  return false;
}
/**
 * Prevents the loader from re-running after form submissions.
 * The auth check only needs to run on initial navigation.
 */

/**
 * Client action to handle signup form submission.
 * Validates all fields, calls Flask's signup endpoint, and redirects on success.
 *
 * @param args - Route client action arguments
 * @returns Action response with errors or server error message
 */
export async function clientAction({ request }: Route.ClientActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const data = Object.fromEntries(formData.entries()) as SignupFormData;

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      }),
    });

    if (response.status === 201) {
      const _body: AuthResponse = await response.json();
      throw redirect('/dashboard');
    }

    const errorBody = (await response.json()) as ApiError | ApiValidationError;
    return { serverError: errorBody.error.message };
  } catch (e) {
    if (e instanceof Response) throw e;
    return { serverError: 'Something went wrong. Please try again.' };
  }
}

/**
 * Signup page component with multi-step wizard form.
 * Collects account info and service address.
 *
 * @returns Signup page with wizard form and social buttons
 */
export default function JoinPage() {
  const submit = useSubmit();

  return (
    <AuthLayout title='Create your account' subtitle='Join us to book your cleaning services'>
      <Wizard stages={signUpStages} onComplete={(formData) => submit(formData, { method: 'post' })}>
        <JoinFormContent />
      </Wizard>

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
