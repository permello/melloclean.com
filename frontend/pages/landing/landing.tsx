import type { Route } from './+types/landing';

import Hero from '~/pages/landing/layout/hero';
import Navbar from '~/pages/landing/layout/navbar';
import Services from '~/pages/landing/layout/services';
import Pricing from '~/pages/landing/layout/prices';
import Contact from '~/pages/landing/layout/contact';
import Footer from '~/pages/landing/layout/footer';
import Testimonials from '~/pages/landing/layout/testimonials';

import Button from '~/components/ui/button';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Mello Cleaning' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Landing() {
  return (
    <main className='min-h-screen'>
      {/* <main className='container mx-auto flex min-h-screen items-center justify-center'>
      <Button>Button test</Button> */}

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
