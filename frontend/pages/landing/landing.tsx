import type { Route } from './+types/landing';

import Hero from '~/pages/landing/layout/hero';
import Navbar from '~/pages/landing/layout/navbar';
import Services from '~/pages/landing/layout/services';
import Pricing from '~/pages/landing/layout/prices';
import Contact from '~/pages/landing/layout/contact';
import Footer from '~/pages/landing/layout/footer';
import Testimonials from '~/pages/landing/layout/testimonials';
import { Button } from '~/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Mello Cleaning' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

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
    // <main className='container mx-auto flex min-h-screen items-center justify-between'>
    //   <div className='flex flex-col justify-between gap-6'>
    //     <Button size={'small'}>Book Now</Button>
    //     <Button>Book Now</Button>
    //     <Button size={'large'}>Book Now</Button>
    //   </div>

    //   <div className='flex flex-col justify-between gap-6'>
    //     <Button variant={'secondary'} size={'small'}>
    //       Book Now
    //     </Button>
    //     <Button variant={'secondary'}>Book Now</Button>
    //     <Button variant={'secondary'} size={'large'}>
    //       Book Now
    //     </Button>
    //   </div>
    // </main>
  );
}
