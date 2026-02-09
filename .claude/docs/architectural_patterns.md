# Architectural Patterns

Code patterns used in melloclean.com with file:line references.

## CVA Component Pattern

Components use Class Variance Authority (CVA) for type-safe variant management.

**File Structure:**
- `component.tsx` - Component implementation
- `ts/variants.ts` - CVA variant definitions
- `ts/types.ts` - TypeScript interfaces
- `index.tsx` - Barrel exports

**Key Files:**
- `frontend/components/ui/button/ts/variants.ts:14-33` - CVA variant definition
- `frontend/components/ui/button/ts/types.ts:10-13` - Type composition with VariantProps
- `frontend/components/ui/button/button.tsx:17-27` - Component applying variants

```typescript
// button/ts/types.ts:10-13
type ButtonProps = ComponentPropsWithRef<'button'> &
  VariantProps<typeof buttonVariants> &
  ButtonBehaviorProp &
  AriaButtonProps<'button'>;
```

---

## Polymorphic Components

Components render as different HTML elements based on props.

**Key Files:**
- `frontend/components/ui/heading/heading.tsx:6-11`
- `frontend/components/ui/text/text.tsx:6-12`

```typescript
// heading/heading.tsx:6-11
const Heading = <T extends ElementType>(props: HeadingProps<T>) => {
  const { level, className, ...rest } = props;
  const Component = `h${level ?? 1}` as ElementType;
  return <Component className={cn(headingVariants({ level, className }))} {...rest} />;
};
```

---

## React Aria Integration

Interactive components use React Aria hooks and expose state via data attributes.

**Key File:** `frontend/components/ui/button/button.tsx:20-38`

```typescript
// button/button.tsx:20-30
const { buttonProps, isPressed } = useButton({ ...rest, isDisabled: disabled }, buttonRef);
const { focusProps, isFocusVisible } = useFocusRing();
const { hoverProps, isHovered } = useHover({ ...props, isDisabled: disabled });

const ariaProps = mergeProps(buttonProps, focusProps, hoverProps);
return (
  <button
    data-pressed={isPressed || undefined}
    data-hovered={isHovered || undefined}
    data-focus-visible={isFocusVisible || undefined}
    {...ariaProps}
  >
```

**CSS Usage:** `data-[hovered=true]:shadow-xl` (see `hero/hero.tsx:63`)

---

## Framer Motion Animations

Sections use motion components for scroll-triggered animations.

**Key Files:**
- `frontend/pages/landing/layout/hero/hero.tsx:23-27` - Entrance animation
- `frontend/pages/landing/layout/services/services.tsx:10-15` - Viewport-triggered
- `frontend/pages/landing/layout/hero/hero.tsx:47-51` - Staggered animations

```typescript
// services/services.tsx:10-15
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>

// hero/hero.tsx:47-51 (staggered)
transition={{ delay: 0.3 + index * 0.1 }}
```

---

## Barrel Export Pattern

All component directories use `index.tsx` for clean imports.

**Key Files:**
- `frontend/components/ui/button/index.tsx:1-2`
- `frontend/pages/landing/layout/index.tsx:1-7`

```typescript
// layout/index.tsx:1-7
export { Navbar } from './navbar/navbar';
export { Hero } from './hero/hero';
export { Footer } from './footer/footer';
export { Contact } from './contact/contact';
export { Pricing } from './prices/prices';
export { Services } from './services/services';
export { Testimonials } from './testimonials/testimonials';
```

---

## cn() Utility

Combines clsx + tailwind-merge for conditional class merging.

**Key File:** `frontend/core/util/cn.ts:4-6`

```typescript
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

---

## Configuration Object Pattern

Centralized company configuration.

**Key File:** `frontend/core/config/config.ts:9-15`

```typescript
const companyConfig: CompanyConfig = {
  Name: 'Some Cleaning Company',
  Phone: '(555) 123-4567',
  Email: 'company@email.com',
  Address: '123 A Street, TX 77001',
  Hours: 'Mon-Sat: 7AM - 8PM',
};
```

---

## Validation Pattern

Centralized validators with a `validateForm()` runner used by both wizard stage configs (client-side) and server actions.

**Key File:** `frontend/core/util/validation.ts:9-69`

```typescript
// validation.ts:9-33 — reusable validators
export const validators = {
  required: (value, fieldName) => ...,
  email: (value) => ...,
  minLength: (value, min) => ...,
  zipCode: (value) => ...,
  confirmPassword: (value, data) => ...,
  minNumber: (value, min, message?) => ...,
};

// validation.ts:51-69 — generic runner (stops at first error per field)
function validateForm<T>(data: T, rules: Record<keyof T, ValidatorFn[]>): ValidationErrors
```

**Consumed by:**
- `pages/auth/join/ts/constants.ts` — wizard stage validation rules
- `pages/landing/layout/booking/ts/constants.ts` — booking wizard validation rules
- `pages/auth/login/login.tsx:38-44` — server action validation

---

## Type Composition Pattern

Component prop types are built by intersecting three tiers: HTML/React base props, CVA variant props, and behavioral/accessibility props.

**Key Files:**
- `frontend/components/ui/button/ts/types.ts:23-26`
- `frontend/components/ui/input/ts/types.ts:31`

```typescript
// button/ts/types.ts:23-26 — four-way intersection
type ButtonProps = ComponentPropsWithRef<'button'> &
  VariantProps<typeof buttonVariants> &
  ButtonBehaviorProp &
  AriaButtonProps<'button'>;

// input/ts/types.ts:31 — three-way intersection (React Aria covers base HTML)
type InputProps = VariantProps<typeof inputVariants> & InputBehaviorProps & AriaTextFieldProps;
```

---

## Form Field Layout Pattern

Form-oriented components share a consistent label → field → hint/error structure.

**Key File:** `frontend/components/ui/input/input.tsx:69-99`

```tsx
<div className='flex flex-col gap-1.5'>
  {label && <label className='text-sm font-medium text-slate-700'>...</label>}
  <div className='relative'>
    <input ... />
  </div>
  {hint && !isInvalid && <p className='text-sm text-slate-500'>...</p>}
  {isInvalid && <p className='text-sm text-red-500'>...</p>}
</div>
```

Used by: Input, Textarea, Select, Slider, ToggleButtonGroup.

---

## Server Action Pattern

Route-level `action()` functions handle form submissions with typed `ActionData` responses.

**Key File:** `frontend/pages/auth/login/login.tsx:33-51`

```typescript
export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const errors = validateForm(
    { email, password },
    {
      email: [(v) => validators.required(v, 'Email'), validators.email],
      password: [(v) => validators.required(v, 'Password'), (v) => validators.minLength(v, 8)],
    },
  );

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return { success: true };
}
```

Pattern: extract FormData → validate with `validateForm()` → return `{ errors }` or `{ success: true }`.

---

## Toast Provider/Context Pattern

App-wide toast notifications via React context with a provider in `root.tsx`.

**Key Files:**
- `frontend/components/ui/toast/toast-provider.tsx:25-64` — Provider and `useToast()` hook
- `frontend/root.tsx:50-55` — Provider wrapping `<Outlet />`

```typescript
// root.tsx:50-55
export default function App() {
  return (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  );
}

// Any component:
const { addToast } = useToast();
addToast('Saved!', 'success', 5000);
```

`ToastProvider` manages state via `@react-stately/toast` and renders a portal-based `ToastRegion`. The `useToast()` hook returns `{ addToast, removeToast }` and throws if used outside the provider.

---

## Quick Reference Table

| Pattern | Key Files | Purpose |
|---------|-----------|---------|
| CVA Component | `button/button.tsx:17-27`, `button/ts/variants.ts:14-33` | Type-safe variants |
| Polymorphic | `heading/heading.tsx:6-11`, `text/text.tsx:6-12` | Flexible elements |
| React Aria | `button/button.tsx:20-38` | Accessibility + data attrs |
| Framer Motion | `hero/hero.tsx:23-27`, `services/services.tsx:10-15` | Animations |
| Barrel Exports | `layout/index.tsx:1-7` | Clean imports |
| cn() Utility | `core/util/cn.ts:4-6` | Class merging |
| Config Object | `core/config/config.ts:9-15` | Company data |
| Validation | `core/util/validation.ts:9-69` | Centralized form validation |
| Type Composition | `button/ts/types.ts:23-26`, `input/ts/types.ts:31` | Multi-tier prop types |
| Form Field Layout | `input/input.tsx:69-99` | Label/field/hint/error structure |
| Server Action | `login/login.tsx:33-51` | Route action with typed response |
| Toast Provider | `toast/toast-provider.tsx:25-64`, `root.tsx:50-55` | App-wide notifications |
