/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Home, Building2, Truck, Sparkles, ArrowRight } from 'lucide-react';

/**
 * Service offerings displayed on the landing page.
 */
const services: ServiceOption[] = [
  {
    icon: Home,
    title: 'Standard Cleaning',
    description:
      'Regular maintenance cleaning to keep your home fresh and tidy. Perfect for weekly or bi-weekly schedules.',
    price: 'From $99',
    color: 'emerald',
    features: ['Dusting & wiping', 'Vacuuming & mopping', 'Kitchen & bathroom cleaning'],
  },
  {
    icon: Sparkles,
    title: 'Deep Cleaning',
    description:
      'Thorough top-to-bottom cleaning that reaches every corner. Ideal for seasonal refreshes.',
    price: 'From $199',
    color: 'teal',
    features: ['Inside appliances', 'Baseboards & blinds', 'Detailed scrubbing'],
  },
  {
    icon: Truck,
    title: 'Move In/Out',
    description:
      'Comprehensive cleaning for moving transitions. Leave your old place spotless or start fresh.',
    price: 'From $249',
    color: 'amber',
    features: ['Complete sanitization', 'Cabinet interiors', 'Window cleaning'],
  },
  {
    icon: Building2,
    title: 'Office Cleaning',
    description: 'Professional commercial cleaning to maintain a productive workspace.',
    price: 'Custom Quote',
    color: 'slate',
    features: ['Workspace sanitization', 'Common area care', 'Flexible scheduling'],
  },
];

/**
 * Tailwind class mappings for each color variant.
 */
const colorClasses: Record<Color, ColorClassesOptions> = {
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    hover: 'group-hover:bg-emerald-100',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'bg-teal-100 text-teal-600',
    hover: 'group-hover:bg-teal-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    hover: 'group-hover:bg-amber-100',
  },
  slate: {
    bg: 'bg-slate-50',
    icon: 'bg-slate-100 text-slate-600',
    hover: 'group-hover:bg-slate-100',
  },
};

export { services, colorClasses };
