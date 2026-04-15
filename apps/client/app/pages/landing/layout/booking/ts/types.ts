/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Shape of the booking form data stored in localStorage.
 * All values are strings to match the wizard's Record<string, string> contract.
 */
export interface BookingFormData {
  /** Type of cleaning: 'standard' | 'deep' | 'move' | 'office' */
  cleaningType: string;
  /** Dirtiness scale from '1' to '10' */
  dirtiness: string;
  /** Number of bedrooms: '1' through '6+' */
  bedrooms: string;
  /** Number of bathrooms: '1' through '4+' */
  bathrooms: string;
  /** Approximate square footage as a numeric string */
  squareFootage: string;
  /** How recently the home was professionally cleaned */
  lastCleaned: string;
  /** Comma-separated priority area keys */
  priorityAreas: string;
  /** Whether there is a special occasion: 'yes' | 'no' */
  hasSpecialOccasion: string;
  /** Description of the special occasion (only if hasSpecialOccasion='yes') */
  specialOccasion: string;
  /** Preferred cleaning date in YYYY-MM-DD format */
  preferredDate: string;
}
