# Wizard Form Content Structure

How to organize the form content inside wizard stages. Both the join page and booking page follow these patterns.

## File Organization

Each wizard form has four layers:

| Layer              | File                            | Responsibility                                                                                       |
| ------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Stage configs      | `ts/constants.ts`               | Individual `WizardStageConfig` exports with validation rules                                         |
| Page               | `join.tsx`, `booking-modal.tsx` | Assembles configs into a `WizardStageConfig[]` array, wraps `<Wizard>`, handles submission           |
| Form content       | `*-form-content.tsx`            | Composes `WizardIndicator`, `WizardStage`s, `WizardNavigation`; wires `useWizard()` data to sections |
| Section components | `components/*-section.tsx`      | Renders fields for a single stage                                                                    |

## Stage Config Naming Conventions

Stage configs live in the wizard form's `ts/constants.ts` and follow these conventions:

- **Config names**: `SCREAMING_SNAKE_CASE` with a `_CONFIG` suffix — e.g. `ACCOUNT_CONFIG`, `HOME_CONFIG`, `SUMMARY_CONFIG`
- **`id`**: Short lowercase slug matching the stage concept — e.g. `'account'`, `'home'`, `'summary'`
- **`name`**: Human-readable label shown in `WizardIndicator` — e.g. `'Account'`, `'Home Details'`, `'Summary'`
- **Stages array**: Assembled in the page component as `const WizardStages: WizardStageConfig[] = [...]` and passed to `<Wizard stages={WizardStages}>`
- **Imports in form content**: `*-form-content.tsx` also imports individual configs to reference their `id` in `<WizardStage id={ACCOUNT_CONFIG.id}>`

```ts
// ts/constants.ts
export const ACCOUNT_CONFIG: WizardStageConfig = {
  id: 'account',
  name: 'Account',
  validate: {
    firstName: [(v) => validators.required(v, 'First name')],
    email: [(v) => validators.required(v, 'Email'), validators.email],
  },
};
```

```ts
// page component
const signUpStages: WizardStageConfig[] = [ACCOUNT_CONFIG, ADDRESS_CONFIG];
<Wizard stages={signUpStages}>...</Wizard>
```

## Form Content Composition

The `*-form-content.tsx` always follows this order classNames can be adjusted for margin and padding:

```tsx
<>
  <WizardIndicator className='mb-6' />
  <WizardStage id={STAGE_A.id}>
    <SectionA formData={formData} setField={setField} errors={errors} />
  </WizardStage>
  <WizardStage id={STAGE_B.id}>
    <SectionB formData={formData} setField={setField} errors={errors} />
  </WizardStage>
  <WizardNavigation className='mt-6' /> {/* mt-6 for compact forms, mt-8 for larger ones */}
</>
```

## Section Component Structure

```tsx
function ExampleSection({ formData, setField, errors }) {
  return (
    <div className='space-y-6'>                              {/* space-y-6 for booking, space-y-4 for auth forms */}
      <Heading level={5} className='mb-2'>Section Title</Heading>  {/* optional */}

      {/* Side-by-side field pairs */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Input label='First' ... />
        <Input label='Last' ... />
      </div>

      {/* Full-width fields sit directly in the space-y wrapper */}
      <Input label='Email' ... />
    </div>
  );
}
```

## Data Flow

Section components receive these props from `useWizard()`:

| Prop                        | Type                                   | Purpose                                                              |
| --------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `formData`                  | `Record<string, string>`               | Current form values                                                  |
| `setField` / `handleChange` | `(key: string, value: string) => void` | Wraps `updateFormData`                                               |
| `errors`                    | `Record<string, string>`               | Validation errors (may be combined with server `actionData?.errors`) |

## Summary Stage Pattern

Summary sections display submitted data in a label/value grid:

```tsx
<div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
  <span className='text-slate-500'>Cleaning Type</span>
  <span className='text-slate-900'>{cleaningTypeLabels[formData.cleaningType]}</span>
</div>
```
