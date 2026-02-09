# TSDoc Commenting Conventions

All exported and non-trivial functions, types, interfaces, and React components must have TSDoc comments. Follow these rules:

## General Rules

- Use `/** */` block comments (TSDoc style), never `//` for documentation
- Place the comment directly above the declaration
- First line is a concise summary sentence
- Use `@param` for every function/component parameter
- Use `@returns` to describe the return value
- Use `@module` on barrel export files (`index.tsx`)

## React Components

```tsx
/**
 * Brief description of what this component renders.
 * Optional second line with more context.
 *
 * @param props - Component props
 * @param props.formData - Current wizard form values
 * @param props.setField - Callback to update a single form field
 * @param props.errors - Validation errors keyed by field name
 * @returns Description of rendered output
 */
export function MyComponent({ formData, setField, errors }: MyComponentProps) {
```

## Interfaces and Types

```tsx
/**
 * Props for the {@link MyComponent} component.
 */
interface MyComponentProps {
  /** Current wizard form values */
  formData: Record<string, string>;
  /** Callback to update a single form field by key */
  setField: (key: string, value: string) => void;
  /** Validation errors keyed by field name */
  errors: ValidationErrors;
}
```

- Use `{@link ComponentName}` in interface docs to reference the consuming component
- Every interface/type member gets a `/** */` single-line doc comment

## Functions and Callbacks

```tsx
/**
 * Generates a cleaning recommendation based on dirtiness and last cleaning date.
 *
 * @param dirtiness - Dirtiness level as a numeric string (1-10)
 * @param lastCleaned - Key indicating when the home was last professionally cleaned
 * @returns A recommendation string describing the suggested cleaning type
 */
function getRecommendation(dirtiness: string, lastCleaned: string): string {
```

## Constants

```tsx
/**
 * General info stage config.
 * Validates cleaning type and dirtiness level.
 */
export const GENERAL_CONFIG: WizardStageConfig = { ... };
```

## Barrel Export Files

```tsx
/**
 * Public API exports for booking wizard section components.
 * @module pages/landing/layout/booking/components
 */
export { GeneralSection } from './general-section';
```

## Server Actions (React Router)

```tsx
/**
 * Server action to handle login form submission.
 * Validates email and password fields.
 *
 * @param args - Route action arguments
 * @returns Action response with errors or success status
 */
export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
```
