/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Form, Link } from 'react-router';
import type { Route } from './+types/join';
import { AuthLayout } from '../components/auth-layout';
import { SocialButtons } from '../components/social-buttons';
import { Text } from '~/components/ui/text';
import { Wizard } from '~/components/ui/wizard';
import type { ActionData, SignupFormData } from './ts/types';
import { WizardFormContent } from './WizardFormContent';
import { WizardStages } from './ts/const';

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
        <Wizard stages={WizardStages}>
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
