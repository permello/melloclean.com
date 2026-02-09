# Core Directory Structure

```
frontend/core/
├── config/
│   ├── config.ts          # CompanyConfig interface and singleton
│   └── index.ts           # Barrel exports
├── theme/
│   └── app.css            # Tailwind v4 import, Inter font, custom scrollbar
└── util/
    ├── cn.ts              # clsx + tailwind-merge class merging
    ├── mergeRef.ts         # Multi-ref merging utility
    └── validation.ts      # Form validators and validateForm()
```

## config/

Centralized company configuration as a typed singleton.

**Key File:** `config/config.ts:9-31`

```typescript
// config/config.ts:9-20
export interface CompanyConfig {
  Email: any;
  Address: any;
  Hours: any;
  Phone: any;
  Name: string;
}

// config/config.ts:25-31
const companyConfig: CompanyConfig = {
  Name: 'Some Cleaning Company',
  Phone: '(555) 123-4567',
  Email: 'company@email.com',
  Address: '123 A Street, TX 77001',
  Hours: 'Mon-Sat: 7AM - 8PM',
};
```

Consumed throughout the app via `import { companyConfig } from '~/core/config'`.

## theme/

**`app.css`** — Single CSS entry point imported by `root.tsx`. Contains:

1. `@import 'tailwindcss'` — Tailwind CSS v4 import
2. `@theme` block — Sets Inter as the default sans-serif font
3. Responsive scrollbar styles:
   - Mobile (`< 768px`): hidden scrollbar
   - Desktop (`>= 768px`): thin emerald-colored scrollbar with slate track

## util/cn.ts

Combines clsx and tailwind-merge for conditional class merging. Used by every UI component.

**Key File:** `util/cn.ts:15-17`

```typescript
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

## util/mergeRef.ts

Merges multiple React refs (RefObjects or ref callbacks) into a single ref callback. Used by Input and other components that need to combine internal refs with forwarded refs.

**Key File:** `util/mergeRef.ts:14-25`

```typescript
export function mergeRefs<T = any>(
  refs: Array<React.RefObject<T> | React.RefAttributes<T>['ref']>,
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.RefObject<T | null>).current = value;
      }
    });
  };
}
```

## util/validation.ts

Centralized form validation with reusable validators, a `ValidatorFn` type, and a `validateForm()` runner.

**Key File:** `util/validation.ts:9-69`

### Validators

```typescript
// validation.ts:9-33
export const validators = {
  required: (value: string, fieldName: string): string | null => ...,
  email: (value: string): string | null => ...,
  minLength: (value: string, min: number): string | null => ...,
  zipCode: (value: string): string | null => ...,
  confirmPassword: (value: string, data: Record<string, string>): string | null => ...,
  minNumber: (value: string, min: number, message?: string): string | null => ...,
};
```

| Validator         | Signature                                           | Rule                        |
| ----------------- | --------------------------------------------------- | --------------------------- |
| `required`        | `(value, fieldName) => string \| null`               | Non-empty after trim        |
| `email`           | `(value) => string \| null`                          | Basic email regex           |
| `minLength`       | `(value, min) => string \| null`                     | Minimum string length       |
| `zipCode`         | `(value) => string \| null`                          | 5-digit US zip              |
| `confirmPassword` | `(value, data) => string \| null`                    | Matches `data.password`     |
| `minNumber`       | `(value, min, message?) => string \| null`           | Numeric value >= min        |

### Types

```typescript
// validation.ts:35-42
type ValidatorFn<T extends Record<string, string> = Record<string, string>> =
  (value: string, data: T) => string | null;

type ValidationErrors = Record<string, string>;
```

### validateForm()

Runs an array of `ValidatorFn` per field, stopping at the first error for each field:

```typescript
// validation.ts:51-69
function validateForm<T extends Record<string, string>>(
  data: T,
  rules: Record<keyof T, ValidatorFn[]>,
): ValidationErrors
```

### Usage in Wizard Stage Configs

```typescript
// pages/auth/join/ts/constants.ts
export const ACCOUNT_CONFIG: WizardStageConfig = {
  id: 'account',
  name: 'Account',
  validate: {
    firstName: [(v) => validators.required(v, 'First name')],
    email: [(v) => validators.required(v, 'Email'), validators.email],
  },
};
```

### Usage in Server Actions

```typescript
// pages/auth/login/login.tsx:38-44
const errors = validateForm(
  { email, password },
  {
    email: [(v) => validators.required(v, 'Email'), validators.email],
    password: [(v) => validators.required(v, 'Password'), (v) => validators.minLength(v, 8)],
  },
);
```
