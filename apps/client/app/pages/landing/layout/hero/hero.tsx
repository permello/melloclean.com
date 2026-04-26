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

import { Button, Heading, Text } from '@permello/ui';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { BookingModal } from '../booking/booking-modal';

/**
 * Hero section with headline, benefits, and call-to-action buttons.
 * Features animated content and decorative background elements.
 *
 * @returns Hero section component
 */
export function Hero() {
  const benefits = [
    'Eco-friendly Products',
    'Trained Professionals',
    'Consistent, High-Standard Cleaning',
  ];

  return (
    <section className='relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50'>
      {/* Background decorative elements */}
      <div className='absolute top-20 right-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl' />
      <div className='absolute bottom-20 left-10 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl' />

      <div className='relative z-10 container mx-auto px-6 py-20'>
        <div className='grid items-center gap-16 lg:grid-cols-2'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className='mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700'>
              <Sparkles className='h-4 w-4' />
              Premium Cleaning Services
            </div>

            <Heading className='mb-6 leading-tight'>
              A Cleaner Home,
              <Text as='span' className='block'>
                A Happier Life
              </Text>
            </Heading>

            <Text className='mb-8 max-w-lg text-xl leading-relaxed'>
              Experience the luxury of a spotless home without lifting a finger. Our expert team
              delivers impeccable results, every time.
            </Text>

            <div className='mb-10 flex flex-wrap gap-4'>
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className='flex items-center gap-2 text-slate-700'
                >
                  <CheckCircle className='h-5 w-5 text-emerald-500' />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className='flex flex-wrap gap-4'>
              <BookingModal
                aria-label='Book a cleaning now'
                label='Book Now'
                icon={<ArrowRight className='h-4 w-4' />}
                title='Book a Cleaning'
                showCloseButton
                className='shadow-lg shadow-emerald-200 data-[hovered=true]:shadow-xl data-[hovered=true]:shadow-emerald-300'
              />
              <Link to={{ hash: '#services' }}>
                <Button
                  variant='secondary'
                  aria-label='View all services'
                  className='border-2 border-slate-200 data-[hovered=true]:border-emerald-300 data-[hovered=true]:bg-emerald-50'
                >
                  View Services
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='relative hidden lg:block'
          >
            <div className='relative h-[700px]'>
              <div className='absolute inset-0 rotate-6 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-400 opacity-20' />
              <img
                src='/images/hero-cleaner.png'
                alt='Professional cleaner'
                className='relative h-full w-full rounded-3xl object-cover shadow-2xl'
                width={600}
                height={700}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
