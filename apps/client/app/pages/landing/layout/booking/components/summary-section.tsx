/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Heading, Text } from '@permello/ui';

/**
 * Props for the BookingSummary component.
 */
interface SummarySectionProps {
  /** The collected form data to display */
  formData: Record<string, string>;
}
/**
 * Human-readable labels for cleaning type keys.
 */
export const cleaningTypeLabels: Record<string, string> = {
  standard: 'Standard',
  deep: 'Deep',
  move: 'Move In/Out',
  office: 'Office',
};

/**
 * Human-readable labels for last-cleaned keys.
 */
export const lastCleanedLabels: Record<string, string> = {
  never: 'Never',
  '1month': 'Within 1 month',
  '1-3months': '1-3 months',
  '3-6months': '3-6 months',
  '6-12months': '6-12 months',
  '1+year': '1+ year',
};

/**
 * Human-readable labels for priority area keys.
 */
export const priorityAreaLabels: Record<string, string> = {
  bathrooms: 'Bathrooms',
  kitchen: 'Kitchen',
  bedrooms: 'Bedrooms',
  floors: 'Floors',
  sinks: 'Sinks',
  dusting: 'Dusting',
  windows: 'Windows',
  appliances: 'Appliances',
  baseboards: 'Baseboards',
  garage: 'Garage',
};

/**
 * Generates a cleaning recommendation based on dirtiness level and last cleaning date.
 *
 * @param dirtiness - Dirtiness level as a numeric string (1-10)
 * @param lastCleaned - Key indicating when the home was last professionally cleaned
 * @returns A recommendation string describing the suggested cleaning type
 */
function getRecommendation(dirtiness: string, lastCleaned: string): string {
  const dirt = Number(dirtiness) || 0;

  if (dirt >= 7 || lastCleaned === 'never' || lastCleaned === '1+year') {
    return 'We recommend an intensive deep clean to bring your home back to a pristine state.';
  }

  if (dirt >= 4 || lastCleaned === '3-6months' || lastCleaned === '6-12months') {
    return 'We recommend a deep clean to address accumulated buildup and refresh your space.';
  }

  return 'A standard clean should be perfect to maintain your already well-kept home.';
}

/**
 * Summary stage component that displays all collected booking data in a readable format.
 * Shows a cleaning recommendation based on the dirtiness level and last cleaning date.
 *
 * @param props - Component props
 * @returns Rendered summary view with recommendation card
 */
export function SummarySection({ formData }: SummarySectionProps) {
  const priorityAreas = formData.priorityAreas
    ? formData.priorityAreas.split(',').map((k) => priorityAreaLabels[k] || k)
    : [];

  const recommendation = getRecommendation(formData.dirtiness, formData.lastCleaned);

  return (
    <div className='space-y-6'>
      <Heading level={4} className='mb-4'>
        Review Your Booking
      </Heading>

      {/* Recommendation Card */}
      <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-4'>
        <Text as='strong' className='mb-1 block text-emerald-800'>
          Our Recommendation
        </Text>
        <Text className='text-emerald-700'>{recommendation}</Text>
      </div>

      {/* General Info */}
      <div>
        <Text as='strong' className='mb-2 block'>
          General Info
        </Text>
        <div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
          <span className='text-slate-500'>Cleaning Type</span>
          <span className='text-slate-900'>
            {cleaningTypeLabels[formData.cleaningType] || formData.cleaningType}
          </span>
          <span className='text-slate-500'>Dirtiness Level</span>
          <span className='text-slate-900'>{formData.dirtiness}/10</span>
        </div>
      </div>

      {/* Home Details */}
      <div>
        <Text as='strong' className='mb-2 block'>
          Home Details
        </Text>
        <div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
          <span className='text-slate-500'>Bedrooms</span>
          <span className='text-slate-900'>{formData.bedrooms}</span>
          <span className='text-slate-500'>Bathrooms</span>
          <span className='text-slate-900'>{formData.bathrooms}</span>
          <span className='text-slate-500'>Square Footage</span>
          <span className='text-slate-900'>{formData.squareFootage} sq ft</span>
          <span className='text-slate-500'>Last Professionally Cleaned</span>
          <span className='text-slate-900'>
            {lastCleanedLabels[formData.lastCleaned] || formData.lastCleaned}
          </span>
        </div>
      </div>

      {/* Visit Details */}
      <div>
        <Text as='strong' className='mb-2 block'>
          Visit Details
        </Text>
        <div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
          <span className='text-slate-500'>Priority Areas</span>
          <span className='text-slate-900'>
            {priorityAreas.length > 0 ? priorityAreas.join(', ') : 'None selected'}
          </span>
          <span className='text-slate-500'>Preferred Date</span>
          <span className='text-slate-900'>{formData.preferredDate}</span>
          {formData.hasSpecialOccasion === 'yes' && (
            <>
              <span className='text-slate-500'>Special Occasion</span>
              <span className='text-slate-900'>{formData.specialOccasion}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
