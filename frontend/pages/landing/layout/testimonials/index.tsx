import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Homeowner',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    content:
      "Absolutely incredible service! My home has never looked this spotless. The team is professional, thorough, and so friendly. I've recommended them to everyone I know.",
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Business Owner',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content:
      "We use their office cleaning service and it's transformed our workspace. Employees are happier and more productive in a clean environment. Worth every penny.",
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Apartment Resident',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content:
      "The move-out cleaning saved me so much stress! They handled everything perfectly and I got my full deposit back. Can't thank them enough!",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className='relative overflow-hidden bg-emerald-900 py-24'>
      {/* Decorative elements */}
      <div className='absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-800 opacity-50' />
      <div className='absolute right-0 bottom-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-teal-800 opacity-50' />

      <div className='relative z-10 container mx-auto px-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='mb-16 text-center'
        >
          <span className='text-sm font-semibold tracking-wider text-emerald-300 uppercase'>
            Testimonials
          </span>
          <h2 className='mt-3 mb-4 text-4xl font-bold text-white md:text-5xl'>
            What Our Clients Say
          </h2>
          <p className='mx-auto max-w-2xl text-xl text-emerald-200'>
            Don't just take our word for it – hear from our satisfied customers.
          </p>
        </motion.div>

        <div className='grid gap-8 md:grid-cols-3'>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className='group relative rounded-3xl bg-white/10 p-8 backdrop-blur-sm transition-all hover:bg-white/15'
            >
              <Quote className='absolute top-6 right-6 h-10 w-10 text-emerald-500/30' />

              <div className='mb-6 flex gap-1'>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className='h-5 w-5 fill-current text-amber-400' />
                ))}
              </div>

              <p className='mb-8 text-lg leading-relaxed text-emerald-100'>
                "{testimonial.content}"
              </p>

              <div className='flex items-center gap-4'>
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className='h-14 w-14 rounded-full object-cover ring-2 ring-emerald-400/50'
                />
                <div>
                  <p className='font-bold text-white'>{testimonial.name}</p>
                  <p className='text-sm text-emerald-300'>{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
