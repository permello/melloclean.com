# Components Directory Structure

```
frontend/components/ui/
├── button/
│   ├── button.tsx
│   ├── index.tsx
│   └── ts/
│       ├── constants.ts
│       ├── types.ts
│       └── variants.ts
├── heading/
│   ├── heading.tsx
│   ├── index.tsx
│   └── ts/
│       ├── types.tsx
│       └── variants.tsx
├── input/
│   ├── input.tsx
│   ├── index.tsx
│   └── ts/
│       ├── constants.ts
│       ├── types.ts
│       └── variants.ts
├── modal/
│   ├── modal.tsx
│   ├── modal-trigger.tsx
│   ├── index.ts
│   └── ts/
│       ├── constants.ts
│       ├── types.ts
│       └── variants.ts
├── select/
│   ├── select.tsx
│   ├── index.ts
│   └── ts/
│       ├── constants.ts
│       ├── types.ts
│       └── variants.ts
├── slider/
│   ├── slider.tsx
│   ├── index.ts
│   └── ts/
│       ├── constants.ts
│       ├── types.ts
│       └── variants.ts
├── text/
│   ├── text.tsx
│   ├── index.tsx
│   └── ts/
│       ├── types.tsx
│       └── variants.tsx
├── textarea/
│   ├── textarea.tsx
│   ├── index.ts
│   └── ts/
│       ├── constants.ts
│       ├── types.ts
│       └── variants.ts
├── toast/
│   ├── toast.tsx
│   ├── toast-provider.tsx
│   ├── toast-region.tsx
│   ├── index.tsx
│   └── ts/
│       ├── constants.ts
│       ├── types.ts
│       └── variants.ts
├── toggle-button-group/
│   ├── toggle-button-group.tsx
│   ├── index.ts
│   └── ts/
│       ├── constants.ts
│       ├── types.ts
│       └── variants.ts
└── wizard/
    ├── wizard.tsx
    ├── wizard-context.tsx
    ├── wizard-indicator.tsx
    ├── wizard-navigation.tsx
    ├── wizard-stage.tsx
    ├── index.ts
    └── ts/
        ├── constants.ts
        ├── types.ts
        └── variants.ts
```

## CVA File Structure

Every component directory follows the same layout:

| File              | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `component.tsx`   | Component implementation                       |
| `ts/variants.ts`  | CVA `cva()` definitions for variant classes     |
| `ts/types.ts`     | TypeScript interfaces and type aliases          |
| `ts/constants.ts` | Static data (options arrays, default values)    |
| `index.tsx`       | Barrel exports (component + public types)       |

### Exceptions

- **Toast** and **Wizard** have multiple component files (e.g. `toast-provider.tsx`, `toast-region.tsx`, `wizard-context.tsx`, `wizard-indicator.tsx`, etc.)
- **Modal** has two component files: `modal.tsx` and `modal-trigger.tsx`
- **Heading** and **Text** use `.tsx` extensions for their type and variant files (`ts/types.tsx`, `ts/variants.tsx`) instead of `.ts`
- **Heading** and **Text** have no `ts/constants.ts`

## Type Composition Pattern

Component prop types are built by intersecting CVA variant props, behavioral props, and React Aria props:

```typescript
// button/ts/types.ts:23-26
type ButtonProps = ComponentPropsWithRef<'button'> &
  VariantProps<typeof buttonVariants> &
  ButtonBehaviorProp &
  AriaButtonProps<'button'>;
```

```typescript
// input/ts/types.ts:31
type InputProps = VariantProps<typeof inputVariants> & InputBehaviorProps & AriaTextFieldProps;
```

The tiers are:
1. **HTML/React base** — `ComponentPropsWithRef<'element'>` or omitted when React Aria covers it
2. **CVA variants** — `VariantProps<typeof componentVariants>`
3. **Behavioral props** — local interface for component-specific props (label, hint, error, isLoading, etc.)
4. **Accessibility** — React Aria props (`AriaButtonProps`, `AriaTextFieldProps`, etc.)

## Form Field Layout Pattern

Form-oriented components (Input, Textarea, Select, Slider, ToggleButtonGroup) share a consistent label → field → hint/error layout:

```tsx
// input/input.tsx:69-99
<div className='flex flex-col gap-1.5'>
  {label && (
    <label {...labelProps} className='text-sm font-medium text-slate-700'>
      {label}
    </label>
  )}
  <div className='relative'>
    <input ref={mRef} className={inputClasses} {...inputProps} type={inputType} />
    {/* password toggle button if applicable */}
  </div>
  {hint && !isInvalid && (
    <p {...descriptionProps} className='text-sm text-slate-500 select-none'>
      {hint}
    </p>
  )}
  {isInvalid && (
    <p {...errorMessageProps} className='text-sm text-red-500 select-none'>
      {errorMessage as string}
    </p>
  )}
</div>
```

All field components follow this structure:
1. Outer `flex flex-col gap-1.5` container
2. Optional `<label>` with `text-sm font-medium text-slate-700`
3. Field element (input, textarea, custom dropdown, etc.)
4. Conditional hint (`text-slate-500`) or error (`text-red-500`) message — never both

## Barrel Export Convention

Every component directory has an `index.tsx` (or `index.ts`) that re-exports the component and its public types:

```typescript
// button/index.tsx:7-11
/**
 * Public API exports for Button component.
 * @module components/ui/button
 */
export * from './button';
export type { ButtonProps } from './ts/types';
```

- Use `@module` TSDoc tag for the barrel
- Re-export the component via `export * from './component'`
- Re-export public types via `export type { ... }`

## Key Files

| File | Purpose |
| ---- | ------- |
| `button/button.tsx:20-38` | React Aria integration reference (useButton, useFocusRing, useHover) |
| `button/ts/types.ts:23-26` | Type composition reference |
| `button/ts/variants.ts:14-33` | CVA variant definition reference |
| `input/input.tsx:69-99` | Form field layout reference |
| `heading/heading.tsx:6-11` | Polymorphic component reference |
| `toast/toast-provider.tsx:25-49` | Provider/context pattern reference |
| `wizard/wizard-context.tsx` | Wizard state management and context |
