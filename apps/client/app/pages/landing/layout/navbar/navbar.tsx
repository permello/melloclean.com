/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import { companyConfig } from '~/core/config';
import { BookingModal } from '../booking/booking-modal';

/**
 * Navigation bar with responsive mobile menu.
 * Features scroll-based styling changes and animated mobile menu.
 *
 * @returns Navbar component with desktop and mobile views
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 shadow-lg backdrop-blur-lg' : 'bg-transparent'
        }`}
      >
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link to={''} className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200'>
                <Sparkles className='h-6 w-6 text-white' />
              </div>
              <span className='text-xl font-bold text-slate-900'>{companyConfig.Name}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden items-center gap-8 md:flex'>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className='font-medium text-slate-600 transition-colors hover:text-emerald-600'
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className='hidden items-center gap-4 md:flex'>
              <Link to={'/login'}>
                <Button aria-label='Customer login' size='small' variant='secondary'>
                  Customer Login
                </Button>
              </Link>
              <BookingModal
                label='Book now'
                size='small'
                aria-label='Book a cleaning'
                title='Book a Cleaning'
                showCloseButton
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className='p-2 text-slate-600 md:hidden'
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='fixed inset-0 z-40 bg-white pt-20 md:hidden'
          >
            <div className='container mx-auto px-6 py-8'>
              <div className='flex flex-col gap-6'>
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className='text-2xl font-semibold text-slate-900 hover:text-emerald-600'
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}

                <hr className='my-4' />
                <BookingModal
                  label='Book Now'
                  size='large'
                  className='w-full'
                  aria-label='Book a cleaning'
                  title='Book a Cleaning'
                  showCloseButton
                />

                <Link to='/login' onClick={() => setMobileOpen(false)}>
                  <Button
                    aria-label='Customer login'
                    size='large'
                    variant='secondary'
                    className='w-full'
                  >
                    Customer Login
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
