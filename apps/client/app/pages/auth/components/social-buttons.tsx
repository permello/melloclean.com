/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React from 'react';
import { DividerWithText } from './divider-with-text';
import { FacebookLoginButton } from './facebook-login-button';
import { GoogleLoginButton } from './google-login-button';

/**
 * Container for social authentication buttons.
 * Renders Google and Facebook login options.
 *
 * @returns Social login button group
 */
const SocialButtons: React.FC = () => {
  return (
    <React.Fragment>
      <DividerWithText text='Or continue with' />
      <div className='space-y-3'>
        <GoogleLoginButton />
        <FacebookLoginButton />
      </div>
    </React.Fragment>
  );
};

export { SocialButtons };
