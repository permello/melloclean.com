/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Link } from 'react-router';
import { Text } from '~/components/ui/text';
import { Wizard, type WizardStageConfig } from '~/components/ui/wizard';
import { AuthLayout } from '../components/auth-layout';
import { SocialButtons } from '../components/social-buttons';
import { JoinFormContent } from './join-form-content';
import { ACCOUNT_CONFIG, ADDRESS_CONFIG } from './ts/constants';

/**
 * Wizard step configurations with validation rules.
 */
const signUpStages: WizardStageConfig[] = [ACCOUNT_CONFIG, ADDRESS_CONFIG];

/**
 * Signup page component with multi-step wizard form.
 * Collects account info and service address.
 *
 * @returns Signup page with wizard form and social buttons
 */
export default function JoinPage() {
  return (
    <AuthLayout title='Create your account' subtitle='Join us to book your cleaning services'>
      <form>
        <Wizard stages={signUpStages}>
          <JoinFormContent />
        </Wizard>
      </form>

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
