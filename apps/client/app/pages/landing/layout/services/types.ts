/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Available color variants for service cards.
 */
type Color = 'emerald' | 'teal' | 'amber' | 'slate';

/**
 * Configuration for a single service offering.
 */
type ServiceOption = {
  /** Icon component to display */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Service title */
  title: string;
  /** Service description */
  description: string;
  /** Price display text */
  price: string;
  /** Color theme for the card */
  color: Color;
  /** List of included features */
  features: string[];
};

/**
 * Tailwind class mappings for a color variant.
 */
type ColorClassesOptions = {
  /** Background color class */
  bg: string;
  /** Icon container classes */
  icon: string;
  /** Hover state classes */
  hover: string;
};
