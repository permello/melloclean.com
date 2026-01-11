import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
// import { createPageUrl } from "@/utils";

export default function Hero() {
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

            <h1 className='mb-6 text-5xl leading-tight font-bold text-slate-900 md:text-6xl lg:text-7xl'>
              A Cleaner Home,
              <span className='block bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent'>
                A Happier Life
              </span>
            </h1>

            <p className='mb-8 max-w-lg text-xl leading-relaxed text-slate-600'>
              Experience the luxury of a spotless home without lifting a finger. Our expert team
              delivers impeccable results, every time.
            </p>

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
                <button className='rounded-full bg-emerald-600 px-8 py-6 text-lg text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-300'>
                  Book Now
                  <ArrowRight className='ml-2 h-5 w-5' />
                </button>
              </Link>
              <button className='rounded-full border-2 border-slate-200 px-8 py-6 text-lg hover:border-emerald-300 hover:bg-emerald-50'>
                View Services
              </button>
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

              {/* Floating card
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white">5★</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">2,500+ Reviews</p>
                                        <p className="text-slate-500 text-sm">Trusted by thousands</p>
                                    </div>
                                </div>
                            </motion.div> */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
