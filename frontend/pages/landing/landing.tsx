/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { Route } from './+types/landing';

import { companyConfig } from '~/core/config';
import { Contact, Footer, Hero, Navbar, Pricing, Services, Testimonials } from './layout';

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
    <main className='min-h-screen'>
      <Navbar />
      <Hero />
      <Services />
      <Pricing />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
