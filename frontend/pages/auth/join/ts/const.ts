import type { WizardStageConfig } from '~/components/ui/wizard';
import { validators } from '~/core/util/validation';

const AccountStage: WizardStageConfig = {
  id: 'account',
  name: 'Account',
  validate: {
    firstName: [(v) => validators.required(v, 'First name')],
    lastName: [(v) => validators.required(v, 'Last name')],
    email: [(v) => validators.required(v, 'Email'), validators.email],
    password: [(v) => validators.required(v, 'Password'), (v) => validators.minLength(v, 8)],
    confirmPassword: [
      (v) => validators.required(v, 'Confirm password'),
      (v, password) => validators.confirmPassword(v, password || ''),
    ],
  },
};

const AddressStage: WizardStageConfig = {
  id: 'address',
  name: 'Service Address',
  validate: {
    street: [(v) => validators.required(v, 'Street address')],
    city: [(v) => validators.required(v, 'City')],
    state: [(v) => validators.required(v, 'State')],
    zipCode: [(v) => validators.required(v, 'Zip code'), validators.zipCode],
  },
};

/**
 * Wizard step configurations with validation rules.
 */
export const WizardStages: WizardStageConfig[] = [AccountStage, AddressStage];
