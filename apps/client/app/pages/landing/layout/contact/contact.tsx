/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { companyConfig } from '~/core/config';

/**
 * Contact section with company info and message form.
 * Displays phone, email, address, and hours with a contact form.
 *
 * @returns Contact section component
 */
export function Contact() {
  const contactInfo = [
    { icon: Phone, label: 'Call Us', value: companyConfig.Phone },
    { icon: Mail, label: 'Email Us', value: companyConfig.Email },
    { icon: MapPin, label: 'Visit Us', value: companyConfig.Address },
    { icon: Clock, label: 'Hours', value: companyConfig.Hours },
  ];

  return (
    <section className='bg-white py-24' id='contact'>
      <div className='container mx-auto px-6'>
        <div className='grid items-start gap-16 lg:grid-cols-2'>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className='text-sm font-semibold tracking-wider text-emerald-600 uppercase'>
              Contact Us
            </span>
            <h2 className='mt-3 mb-6 text-4xl font-bold text-slate-900 md:text-5xl'>
              Ready for a
              <span className='bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent'>
                {' '}
                Spotless Home?
              </span>
            </h2>
            <p className='mb-10 text-xl text-slate-600'>
              Get in touch with us today. We'd love to hear from you and help make your space shine.
            </p>

            <div className='grid gap-6 sm:grid-cols-2'>
              {contactInfo.map((item) => (
                <div
                  key={item.label}
                  className='@container rounded-2xl bg-slate-50 transition-colors hover:bg-emerald-50'
                >
                  <div className='flex items-start gap-4 p-4'>
                    <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600'>
                      <item.icon className='h-6 w-6' />
                    </div>
                    <div>
                      <p className='text-sm text-slate-500'>{item.label}</p>
                      <p className='font-semibold text-slate-900 lg:text-[5.5cqi]'>{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className='rounded-3xl bg-slate-50 p-8 lg:p-10'
          >
            <h3 className='mb-6 text-2xl font-bold text-slate-900'>Send Us a Message</h3>

            <form className='space-y-5'>
              <div className='grid gap-5 sm:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>Name</label>
                  <input
                    aria-label='Your name'
                    placeholder='Your name'
                    className='block h-12 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-xs focus:border-2 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>Email</label>
                  <input
                    aria-label='Your email'
                    type='email'
                    placeholder='your@email.com'
                    className='block h-12 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-xs focus:border-2 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none'
                  />
                </div>
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700'>Phone</label>
                <input
                  aria-label='Your phone number'
                  type='tel'
                  placeholder='(555) 000-0000'
                  className='"block h-12 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-xs focus:border-2 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700'>Message</label>
                <textarea
                  aria-label='Your message'
                  placeholder='Tell us about your cleaning needs...'
                  rows={4}
                  className='block w-full resize-none rounded-xl border border-slate-200 p-3.5 text-sm shadow-xs focus:border-2 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none'
                />
              </div>

              <Button aria-label='Send message' className='w-full rounded-xl font-semibold'>
                Send Message
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
