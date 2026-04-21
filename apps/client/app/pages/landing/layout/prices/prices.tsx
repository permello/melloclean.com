/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@permello/ui';

/**
 * Pricing plan configurations.
 */
const plans = [
  {
    name: 'Essential',
    description: 'Perfect for small apartments',
    price: 99,
    period: 'per visit',
    features: [
      'Up to 2 bedrooms',
      '1 bathroom',
      'Kitchen & living areas',
      'Dusting & vacuuming',
      'Surface wiping',
    ],
    popular: false,
  },
  {
    name: 'Premium',
    description: 'Most popular for families',
    price: 149,
    period: 'per visit',
    features: [
      'Up to 4 bedrooms',
      '2-3 bathrooms',
      'All living spaces',
      'Deep kitchen cleaning',
      'Interior windows',
      'Laundry folding',
    ],
    popular: true,
  },
  {
    name: 'Luxury',
    description: 'The ultimate clean experience',
    price: 249,
    period: 'per visit',
    features: [
      'Unlimited rooms',
      'All bathrooms',
      'Complete deep clean',
      'Appliance interiors',
      'Organization service',
      'Premium products',
      'Priority scheduling',
    ],
    popular: false,
  },
];

/**
 * Pricing section displaying available service plans.
 * Features three tiers with the middle option highlighted as popular.
 *
 * @returns Pricing section component
 */
export function Pricing() {
  return (
    <section className='bg-gradient-to-b from-slate-50 to-white py-24' id='pricing'>
      <div className='container mx-auto px-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='mb-16 text-center'
        >
          <span className='text-sm font-semibold tracking-wider text-emerald-600 uppercase'>
            Pricing
          </span>
          <h2 className='mt-3 mb-4 text-4xl font-bold text-slate-900 md:text-5xl'>
            Simple, Transparent Pricing
          </h2>
          <p className='mx-auto max-w-2xl text-xl text-slate-600'>
            No hidden fees. Choose the plan that fits your home and schedule.
          </p>
        </motion.div>

        <div className='mx-auto grid max-w-5xl gap-8 md:grid-cols-3'>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                plan.popular
                  ? 'scale-105 bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-2xl shadow-emerald-200'
                  : 'border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-xl'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className='absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-amber-400 px-4 py-1 text-sm font-bold text-amber-900'>
                  <Star className='h-4 w-4 fill-current' />
                  Most Popular
                </div>
              )}

              <h3
                className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'} mb-2`}
              >
                {plan.name}
              </h3>
              <p className={`${plan.popular ? 'text-emerald-100' : 'text-slate-500'} mb-6`}>
                {plan.description}
              </p>

              <div className='mb-8'>
                <span
                  className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}
                >
                  ${plan.price}
                </span>
                <span className={`${plan.popular ? 'text-emerald-100' : 'text-slate-500'} ml-2`}>
                  {plan.period}
                </span>
              </div>

              <ul className='mb-8 space-y-4'>
                {plan.features.map((feature) => (
                  <li key={feature} className='flex items-center gap-3'>
                    <div
                      className={`h-5 w-5 rounded-full ${plan.popular ? 'bg-white/20' : 'bg-emerald-100'} flex items-center justify-center`}
                    >
                      <Check
                        className={`h-3 w-3 ${plan.popular ? 'text-white' : 'text-emerald-600'}`}
                      />
                    </div>
                    <span className={plan.popular ? 'text-emerald-50' : 'text-slate-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to={'#pricing'}>
                <Button
                  variant={plan.popular ? 'secondary' : 'primary'}
                  aria-label={`Get started with ${plan.name} plan`}
                  className={`w-full rounded-xl py-3 text-lg ${
                    plan.popular && 'text-emerald-600 data-[hovered=true]:bg-emerald-50'
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
