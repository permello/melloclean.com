import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Text } from '~/components/ui/text';

export function Hero() {
  const benefits = [
    'Eco-friendly Products',
    'Trained Professionals',
    'Consistent, High-Standard Cleaning',
  ];

  return (
    <section className='relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50'>
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
              {/* <Link to={createPageUrl("Dashboard")}> */}
              <Link to={''}>
                <Button className='shadow-lg shadow-emerald-200 data-[hovered=true]:shadow-xl data-[hovered=true]:shadow-emerald-300'>
                  Book Now
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </Link>
              <Button
                variant='secondary'
                className='border-2 border-slate-200 data-[hovered=true]:border-emerald-300 data-[hovered=true]:bg-emerald-50'
              >
                View Services
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='relative hidden lg:block'
          >
            <div className='relative'>
              <div className='absolute inset-0 rotate-6 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-400 opacity-20' />
              <img
                src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=700&fit=crop'
                alt='Professional cleaner'
                className='relative w-full rounded-3xl object-cover shadow-2xl'
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
