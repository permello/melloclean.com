/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import companyData from './company.json';

/**
 * Configuration interface for company information.
 */
export interface CompanyConfig {
  /** Company email address */
  Email: string;
  /** Company physical address */
  Address: string;
  /** Business operating hours */
  Hours: string;
  /** Company phone number */
  Phone: string;
  /** Company name */
  Name: string;
}

/**
 * Company configuration containing business contact details.
 */
const companyConfig: CompanyConfig = companyData;

export { companyConfig };
