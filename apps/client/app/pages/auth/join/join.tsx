/**
 * MIT License
 *
 * Copyright (c) 2025-present Eduardo Turcios.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Form, Link } from 'react-router';
import { Text, Wizard, type WizardStageConfig } from '@permello/ui';
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
 * Client action to handle signup form submission.
 * Processes the completed wizard form data.
 *
 * @param args - Route client action arguments
 * @returns Action response with success status
 */
export async function clientAction({ request }: Route.ClientActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const data = Object.fromEntries(formData.entries()) as SignupFormData;

  // Wizard component handles all validation client-side
  // TODO: Actual account creation logic here
  console.log('Creating account for:', data.email);

  return { success: true };
}

/**
 * Signup page component with multi-step wizard form.
 * Collects account info and service address.
 *
 * @returns Signup page with wizard form and social buttons
 */
export default function JoinPage() {
  return (
    <AuthLayout title='Create your account' subtitle='Join us to book your cleaning services'>
      <Form method='post'>
        <Wizard stages={signUpStages}>
          <JoinFormContent />
        </Wizard>
      </Form>

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
