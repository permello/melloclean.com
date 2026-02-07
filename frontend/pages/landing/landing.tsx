/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { Route } from './+types/landing';

import {
  Navbar,
  Hero,
  Services,
  Pricing,
  Testimonials,
  Contact,
  Footer,
  BookingProvider,
  BookingModal,
} from './layout';
import { companyConfig } from '~/core/config';

/**
 * Meta function for the landing page.
 * Sets the page title and description.
 *
 * @returns Meta tags array
 */
export function meta({}: Route.MetaArgs) {
  return [
    { title: companyConfig.Name },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

/**
 * Landing page component composing all section layouts.
 * Main entry point for the marketing site.
 *
 * @returns Complete landing page
 */
export default function Landing() {
  return (
    <BookingProvider>
      <main className='min-h-screen'>
        <Navbar />
        <Hero />
        <Services />
        <Pricing />
        <Testimonials />
        <Contact />
        <Footer />
        <BookingModal />
      </main>
    </BookingProvider>
  );
}
