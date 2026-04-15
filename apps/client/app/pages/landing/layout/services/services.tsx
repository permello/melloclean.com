/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { services, colorClasses } from './constants';
import { Heading } from '~/components/ui/heading';
import { Text } from '~/components/ui/text';

/**
 * Services section displaying available cleaning service offerings.
 * Renders a grid of animated service cards with features and pricing.
 *
 * @returns Services section component
 */
export function Services() {
  return (
    <section className='bg-white py-24' id='services'>
      <div className='container mx-auto px-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='mb-16 text-center'
        >
          <Text as='em' className='text-sm'>
            Our Services
          </Text>
          <Heading level={2} className='mt-3 mb-4'>
            Cleaning Solutions for
            <span className='bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent'>
              {' '}
              Every Need
            </span>
          </Heading>
          <p className='mx-auto max-w-2xl text-xl text-slate-600'>
            From routine tidying to intensive deep cleans, we've got the perfect service for your
            space.
          </p>
        </motion.div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative rounded-3xl p-8 ${colorClasses[service.color].bg} ${colorClasses[service.color].hover} cursor-pointer transition-all duration-300 hover:shadow-xl`}
            >
              <div
                className={`h-14 w-14 rounded-2xl ${colorClasses[service.color].icon} mb-6 flex items-center justify-center transition-transform group-hover:scale-110`}
              >
                <service.icon className='h-7 w-7' />
              </div>

              <h3 className='mb-3 text-xl font-bold text-slate-900'>{service.title}</h3>
              <p className='mb-4 text-sm leading-relaxed text-slate-600'>{service.description}</p>

              <ul className='mb-6 space-y-2'>
                {service.features.map((feature) => (
                  <li key={feature} className='flex items-center gap-2 text-sm text-slate-500'>
                    <div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className='flex items-center justify-between border-t border-slate-200/50 pt-4'>
                <span className='font-bold text-slate-900'>{service.price}</span>
                <ArrowRight className='h-5 w-5 text-slate-400 transition-colors transition-transform group-hover:translate-x-1 group-hover:text-emerald-600' />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
