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

import { companyConfig } from '@permello/shared/config';
import { Heading } from '@permello/ui';
import { FaFacebook as Facebook, FaInstagram as Instagram, FaXTwitter as Twitter } from 'react-icons/fa6';
import { Sparkles } from 'lucide-react';

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
