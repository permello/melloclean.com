/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Form, Link } from 'react-router';
import { Text } from '~/components/ui/text';
import { Wizard, type WizardStageConfig } from '~/components/ui/wizard';
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
 * Server action to handle signup form submission.
 * Processes the completed wizard form data.
 *
 * @param args - Route action arguments
 * @returns Action response with success status
 */
export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
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
