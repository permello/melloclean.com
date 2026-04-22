/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { companyConfig } from '@permello/shared/config';
import { Heading, Text } from '@permello/ui';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { Link } from 'react-router';

/**
 * Props for the AuthLayout component.
 */
interface AuthLayoutProps {
  /** Content to render inside the layout */
  children: React.ReactNode;
  /** Page title displayed in the header */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
}

/**
 * Layout wrapper for authentication pages with decorative background.
 * Includes company branding, animated card, and gradient background.
 *
 * @param props - Component props
 * @returns Centered card layout with decorative elements
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden overscroll-none bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-4 md:overscroll-auto'>
      {/* Blurred decorative circles */}
      <div className='absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl' />
      <div className='absolute top-1/4 -right-24 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl' />
      <div className='absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl' />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='z-10 max-h-[calc(100vh-1rem)] w-full max-w-md overflow-y-auto md:max-h-none md:overflow-y-visible'
      >
        <div className='rounded-2xl bg-white p-5 shadow-xl sm:p-8'>
          <div className='mb-8 flex flex-col items-center'>
            <Link to='/' className='mb-4 flex items-center gap-2'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600'>
                <Sparkles className='h-5 w-5 text-white' />
              </div>
              <span className='text-xl font-bold text-slate-900 select-none'>
                {companyConfig.Name}
              </span>
            </Link>
            <Heading level={4}>{title}</Heading>
            {subtitle && <Text className='mt-1 text-center'>{subtitle}</Text>}
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export { AuthLayout };
