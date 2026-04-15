/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Sparkles, Facebook, Instagram, Twitter } from 'lucide-react';
import { Heading } from '~/components/ui/heading';
import { companyConfig } from '~/core/config';

/**
 * Site footer with company info, navigation links, and social media.
 * Includes services list, company links, and copyright notice.
 *
 * @returns Footer component
 */
export function Footer() {
  return (
    <footer className='bg-slate-900 py-16 text-white'>
      <div className='container mx-auto px-6'>
        <div className='grid gap-10 md:grid-cols-4'>
          <div className='md:col-span-2'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400'>
                <Sparkles className='h-6 w-6 text-white' />
              </div>
              <Heading level={4}>{companyConfig.Name}</Heading>
            </div>
            <p className='mb-6 max-w-sm text-slate-400'>
              Professional cleaning services that transform your space into a spotless sanctuary.
              Quality, reliability, and care in every clean.
            </p>
            <div className='flex gap-4'>
              <a
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-emerald-600'
              >
                <Facebook className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-emerald-600'
              >
                <Instagram className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-emerald-600'
              >
                <Twitter className='h-5 w-5' />
              </a>
            </div>
          </div>

          <div>
            <Heading level={6} className='mb-4'>
              Services
            </Heading>
            <ul className='space-y-3 text-slate-400'>
              <li>
                <a href='#' className='transition-colors hover:text-emerald-400'>
                  Standard Cleaning
                </a>
              </li>
              <li>
                <a href='#' className='transition-colors hover:text-emerald-400'>
                  Deep Cleaning
                </a>
              </li>
              <li>
                <a href='#' className='transition-colors hover:text-emerald-400'>
                  Move In/Out
                </a>
              </li>
              <li>
                <a href='#' className='transition-colors hover:text-emerald-400'>
                  Office Cleaning
                </a>
              </li>
            </ul>
          </div>

          <div>
            <Heading level={6} className='mb-4'>
              Company
            </Heading>
            <ul className='space-y-3 text-slate-400'>
              <li>
                <a href='#' className='transition-colors hover:text-emerald-400'>
                  About Us
                </a>
              </li>
              <li>
                <a href='#' className='transition-colors hover:text-emerald-400'>
                  Careers
                </a>
              </li>
              <li>
                <a href='#' className='transition-colors hover:text-emerald-400'>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href='#' className='transition-colors hover:text-emerald-400'>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-12 border-t border-slate-800 pt-8 text-center text-slate-500'>
          <p>
            &copy; {new Date().getFullYear()} {companyConfig.Name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
