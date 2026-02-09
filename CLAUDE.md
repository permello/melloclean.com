# Melloclean.com

Cleaning company landing page built with React Router 7 (SSR mode).

## Quick Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Run production server
npm run typecheck  # Run TypeScript type checking
npm run pretty     # Run prettier to format all files
npm copyright      # Add copyright statement to top of all files
```

## Tech Stack

- **React 19** - UI library
- **React Router 7** - SSR framework (Vite-based)
- **TypeScript 5.9** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Vite 7** - Build tool
- **React Aria** - Accessible component primitives
- **Framer Motion** - Animations
- **CVA** - Component variant management

## Color Palette

| Role           | Color     | Classes                        | Hex                       |
| -------------- | --------- | ------------------------------ | ------------------------- |
| Primary        | Emerald   | `emerald-500`, `emerald-600`   | #10b981, #059669          |
| Secondary      | Teal      | `teal-500`, `teal-600`         | #14b8a6, #0d9488          |
| Accent         | Warm Gold | `amber-500`                    | #F59E0B                   |
| Text (heading) | Slate     | `slate-900`                    | #0f172a                   |
| Text (body)    | Slate     | `slate-600`                    | #475569                   |
| Background     | Neutral   | `slate-50`, `gray-50`, `white` | #f8fafc, #f9fafb, #ffffff |
| Destructive    | Red       | `red-500`, `red-600`           | #ef4444, #dc2626          |

## Directory Structure

```
frontend/
├── components/     # Reusable UI components
│   └── ui/         # Base components (button, heading, text)
├── core/           # Shared utilities and configuration
│   ├── config/     # App configuration (company info)
│   └── util/       # Utilities (cn, mergeRef)
├── pages/          # Page components and layouts
│   └── landing/    # Landing page with section layouts
├── root.tsx        # App root component
└── routes.ts       # Route definitions
```

## Path Alias

`~/*` maps to `frontend/*`

Example: `import { cn } from '~/core/util/cn'`

## Key Conventions

### CVA Component Pattern

Components use Class Variance Authority for variant management:

- Component file: `component.tsx`
- Variants: `ts/variants.ts` (cva definitions)
- Types: `ts/types.ts` (TypeScript interfaces)

### Polymorphic Components

`Heading` and `Text` components accept generic element types:

```tsx
<Heading level={2}>...</Heading>  // renders as h2
<Text as="span">...</Text>        // renders as span
```

### React Aria Integration

Interactive components use React Aria hooks and expose state via data attributes:

- `data-pressed`, `data-hovered`, `data-focus-visible`

### Framer Motion

Sections use motion components with viewport-triggered animations:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
```

### Utility Function

`cn()` combines clsx and tailwind-merge for conditional class merging.

## Important Files

| File                             | Purpose                          |
| -------------------------------- | -------------------------------- |
| `package.json`                   | Dependencies and scripts         |
| `vite.config.ts`                 | Vite configuration               |
| `react-router.config.ts`         | React Router SSR config          |
| `frontend/core/config/config.ts` | Company info (name, phone, etc.) |
| `frontend/core/util/cn.ts`       | Class name utility               |

## UI Components Reference

All components live in `frontend/components/ui/` and follow the CVA pattern with `ts/types.ts`, `ts/variants.ts`, and optional `ts/constants.ts`.

### Button

Accessible button with multiple variants and sizes. Built with React Aria.

| Prop        | Type                                                             | Default     |
| ----------- | ---------------------------------------------------------------- | ----------- |
| `variant`   | `'primary' \| 'secondary' \| 'destructive' \| 'ghost' \| 'link'` | `'primary'` |
| `size`      | `'small' \| 'default' \| 'large'`                                | `'default'` |
| `isLoading` | `boolean`                                                        | `false`     |
| `disabled`  | `boolean`                                                        | `false`     |

```tsx
<Button variant='primary' size='large'>
  Click me
</Button>
```

### Heading

Polymorphic heading component. The `level` prop sets both the HTML element (h1-h6) and responsive text size.

| Prop    | Type                         | Default |
| ------- | ---------------------------- | ------- |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1`     |

```tsx
<Heading level={2}>Section Title</Heading>
```

### Text

Polymorphic text component with variant styling per element type.

| Prop | Type                                | Default |
| ---- | ----------------------------------- | ------- |
| `as` | `'p' \| 'span' \| 'em' \| 'strong'` | `'p'`   |

- `p` renders slate body text
- `span` renders emerald-to-teal gradient text
- `em` renders uppercase emerald tracking text
- `strong` renders bold slate text

```tsx
<Text as='span'>Gradient highlighted text</Text>
```

### Input

Accessible input with label, error, hint, and password visibility toggle. Built with React Aria `useTextField`.

| Prop                 | Type                       | Default     |
| -------------------- | -------------------------- | ----------- |
| `label`              | `string`                   | —           |
| `errorMessage`       | `string`                   | —           |
| `hint`               | `string`                   | —           |
| `type`               | `string`                   | `'text'`    |
| `variant`            | `'default' \| 'error'`     | `'default'` |
| `validate`           | React Aria validator       | —           |
| `validationBehavior` | React Aria validation mode | —           |

```tsx
<Input label='Email' type='email' />
```

### Textarea

Textarea component mirroring Input's label/error/hint pattern.

| Prop           | Type                      | Default     |
| -------------- | ------------------------- | ----------- |
| `label`        | `string`                  | —           |
| `errorMessage` | `string`                  | —           |
| `hint`         | `string`                  | —           |
| `rows`         | `number`                  | `4`         |
| `value`        | `string`                  | —           |
| `onChange`     | `(value: string) => void` | —           |
| `isDisabled`   | `boolean`                 | `false`     |
| `variant`      | `'default' \| 'error'`    | `'default'` |

```tsx
<Textarea label='Notes' rows={6} value={text} onChange={setText} />
```

### Select

Custom dropdown select with keyboard navigation, Framer Motion animations, and click-outside dismissal.

| Prop                | Type                    | Default              |
| ------------------- | ----------------------- | -------------------- |
| `label`             | `string`                | —                    |
| `errorMessage`      | `string`                | —                    |
| `hint`              | `string`                | —                    |
| `placeholder`       | `string`                | `'Select an option'` |
| `options`           | `SelectOption[]`        | required             |
| `selectedKey`       | `string`                | required             |
| `onSelectionChange` | `(key: string) => void` | required             |
| `variant`           | `'default' \| 'error'`  | `'default'`          |

`SelectOption`: `{ key: string; label: string }`

```tsx
<Select label='Room' options={rooms} selectedKey={room} onSelectionChange={setRoom} />
```

### Slider

Range slider with visual track, thumb, and optional value display.

| Prop           | Type                        | Default  |
| -------------- | --------------------------- | -------- |
| `label`        | `string`                    | —        |
| `errorMessage` | `string`                    | —        |
| `hint`         | `string`                    | —        |
| `showValue`    | `boolean`                   | `true`   |
| `formatValue`  | `(value: number) => string` | —        |
| `minValue`     | `number`                    | required |
| `maxValue`     | `number`                    | required |
| `step`         | `number`                    | required |
| `value`        | `number`                    | required |
| `onChange`     | `(value: number) => void`   | required |

```tsx
<Slider label='Rating' minValue={1} maxValue={10} step={1} value={val} onChange={setVal} />
```

### Modal

Accessible modal dialog with backdrop blur, scroll lock, and focus trap. Built with React Aria `useModalOverlay`.

| Prop          | Type                   | Default     |
| ------------- | ---------------------- | ----------- |
| `size`        | `'default' \| 'large'` | `'default'` |
| `state`       | `OverlayTriggerState`  | required    |
| `modalStyles` | `string`               | —           |
| `children`    | `ReactNode`            | required    |

**ModalTrigger**: Compound component pairing a Button with a Modal.

| Prop       | Type                                 | Default  |
| ---------- | ------------------------------------ | -------- |
| `label`    | `string`                             | required |
| `icon`     | `ReactNode`                          | —        |
| `children` | `(close: () => void) => JSX.Element` | required |

```tsx
<ModalTrigger label='Open'>
  {(close) => (
    <div>
      <button onClick={close}>Close</button>
    </div>
  )}
</ModalTrigger>
```

### Toast

Toast notification system with provider/context pattern and animated enter/exit.

**Variants**: `'success' | 'error' | 'warning' | 'info'`

**Setup**:

```tsx
<ToastProvider>
  <App />
</ToastProvider>
```

**Usage**:

```tsx
const { addToast } = useToast();
addToast('Saved!', 'success', 5000);
```

| Hook/Component  | Purpose                                     |
| --------------- | ------------------------------------------- |
| `ToastProvider` | Wraps app, manages toast state              |
| `ToastRegion`   | Renders visible toasts (top-right corner)   |
| `Toast`         | Individual toast with icon and close button |
| `useToast()`    | Returns `{ addToast, removeToast }`         |

### ToggleButtonGroup

Multi-select toggle button group with pill-shaped buttons.

| Prop                | Type                       | Default  |
| ------------------- | -------------------------- | -------- |
| `label`             | `string`                   | —        |
| `errorMessage`      | `string`                   | —        |
| `hint`              | `string`                   | —        |
| `options`           | `ToggleOption[]`           | required |
| `selectedKeys`      | `string[]`                 | required |
| `onSelectionChange` | `(keys: string[]) => void` | required |

`ToggleOption`: `{ key: string; label: string }`

```tsx
<ToggleButtonGroup
  label='Areas'
  options={[{ key: 'kitchen', label: 'Kitchen' }]}
  selectedKeys={selected}
  onSelectionChange={setSelected}
/>
```

### Wizard

Multi-step form wizard with validation, progress indicators, and animated transitions.

**Wizard** (container):

| Prop         | Type                                         | Default  |
| ------------ | -------------------------------------------- | -------- |
| `stages`     | `WizardStageConfig[]`                        | required |
| `children`   | `ReactNode`                                  | required |
| `onComplete` | `(formData: Record<string, string>) => void` | —        |

`WizardStageConfig`: `{ id: string; name: string; validate?: Record<string, ValidatorFn[]> }`

**WizardStage**: Renders content for a single stage (animated enter/exit).

| Prop | Type     | Default  |
| ---- | -------- | -------- |
| `id` | `string` | required |

**WizardIndicator**: Visual step progress with numbered circles and labels.

| Prop               | Type     | Default |
| ------------------ | -------- | ------- |
| `maxVisibleStages` | `number` | `3`     |

**WizardNavigation**: Back/Next/Complete buttons with automatic state handling.

| Prop            | Type      | Default      |
| --------------- | --------- | ------------ |
| `isSubmitting`  | `boolean` | `false`      |
| `nextLabel`     | `string`  | `'Next'`     |
| `backLabel`     | `string`  | `'Back'`     |
| `completeLabel` | `string`  | `'Complete'` |

**useWizard()**: Hook returning wizard context (currentStep, formData, nextStage, prevStage, goToStage, errors, etc.).

```tsx
<Wizard stages={[{ id: 'info', name: 'Info', validate: { name: [required] } }]}>
  <WizardIndicator />
  <WizardStage id='info'>...</WizardStage>
  <WizardNavigation />
</Wizard>
```

### Wizard Form Content Structure

How to organize the form content inside wizard stages. Both the join page and booking page follow these patterns.

#### File Organization

Each wizard form has four layers:

| Layer              | File                            | Responsibility                                                                                       |
| ------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Stage configs      | `ts/constants.ts`               | Individual `WizardStageConfig` exports with validation rules                                         |
| Page               | `join.tsx`, `booking-modal.tsx` | Assembles configs into a `WizardStageConfig[]` array, wraps `<Wizard>`, handles submission           |
| Form content       | `*-form-content.tsx`            | Composes `WizardIndicator`, `WizardStage`s, `WizardNavigation`; wires `useWizard()` data to sections |
| Section components | `components/*-section.tsx`      | Renders fields for a single stage                                                                    |

#### Stage Config Naming Conventions

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

#### Form Content Composition

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

#### Section Component Structure

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

#### Data Flow

Section components receive these props from `useWizard()`:

| Prop                        | Type                                   | Purpose                                                              |
| --------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `formData`                  | `Record<string, string>`               | Current form values                                                  |
| `setField` / `handleChange` | `(key: string, value: string) => void` | Wraps `updateFormData`                                               |
| `errors`                    | `Record<string, string>`               | Validation errors (may be combined with server `actionData?.errors`) |

#### Summary Stage Pattern

Summary sections display submitted data in a label/value grid:

```tsx
<div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
  <span className='text-slate-500'>Cleaning Type</span>
  <span className='text-slate-900'>{cleaningTypeLabels[formData.cleaningType]}</span>
</div>
```

## Additional Documentation

See `.claude/docs/architectural_patterns.md` for detailed code patterns with file references.
