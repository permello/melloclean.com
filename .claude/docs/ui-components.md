# UI Components Reference

All components live in `frontend/components/ui/` and follow the CVA pattern with `ts/types.ts`, `ts/variants.ts`, and optional `ts/constants.ts`.

## Button

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

## Heading

Polymorphic heading component. The `level` prop sets both the HTML element (h1-h6) and responsive text size.

| Prop    | Type                         | Default |
| ------- | ---------------------------- | ------- |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1`     |

```tsx
<Heading level={2}>Section Title</Heading>
```

## Text

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

## Input

Accessible input with label, error, hint, and password visibility toggle. Built with React Aria `useTextField`.

| Prop                 | Type                       | Default     |
| -------------------- | -------------------------- | ----------- |
| `label`              | `string`                   | --          |
| `errorMessage`       | `string`                   | --          |
| `hint`               | `string`                   | --          |
| `type`               | `string`                   | `'text'`    |
| `variant`            | `'default' \| 'error'`     | `'default'` |
| `validate`           | React Aria validator       | --          |
| `validationBehavior` | React Aria validation mode | --          |

```tsx
<Input label='Email' type='email' />
```

## Textarea

Textarea component mirroring Input's label/error/hint pattern.

| Prop           | Type                      | Default     |
| -------------- | ------------------------- | ----------- |
| `label`        | `string`                  | --          |
| `errorMessage` | `string`                  | --          |
| `hint`         | `string`                  | --          |
| `rows`         | `number`                  | `4`         |
| `value`        | `string`                  | --          |
| `onChange`     | `(value: string) => void` | --          |
| `isDisabled`   | `boolean`                 | `false`     |
| `variant`      | `'default' \| 'error'`    | `'default'` |

```tsx
<Textarea label='Notes' rows={6} value={text} onChange={setText} />
```

## Select

Custom dropdown select with keyboard navigation, Framer Motion animations, and click-outside dismissal.

| Prop                | Type                    | Default              |
| ------------------- | ----------------------- | -------------------- |
| `label`             | `string`                | --                   |
| `errorMessage`      | `string`                | --                   |
| `hint`              | `string`                | --                   |
| `placeholder`       | `string`                | `'Select an option'` |
| `options`           | `SelectOption[]`        | required             |
| `selectedKey`       | `string`                | required             |
| `onSelectionChange` | `(key: string) => void` | required             |
| `variant`           | `'default' \| 'error'`  | `'default'`          |

`SelectOption`: `{ key: string; label: string }`

```tsx
<Select label='Room' options={rooms} selectedKey={room} onSelectionChange={setRoom} />
```

## Slider

Range slider with visual track, thumb, and optional value display.

| Prop           | Type                        | Default  |
| -------------- | --------------------------- | -------- |
| `label`        | `string`                    | --       |
| `errorMessage` | `string`                    | --       |
| `hint`         | `string`                    | --       |
| `showValue`    | `boolean`                   | `true`   |
| `formatValue`  | `(value: number) => string` | --       |
| `minValue`     | `number`                    | required |
| `maxValue`     | `number`                    | required |
| `step`         | `number`                    | required |
| `value`        | `number`                    | required |
| `onChange`     | `(value: number) => void`   | required |

```tsx
<Slider label='Rating' minValue={1} maxValue={10} step={1} value={val} onChange={setVal} />
```

## Modal

Accessible modal dialog with backdrop blur, scroll lock, and focus trap. Built with React Aria `useModalOverlay`.

| Prop          | Type                   | Default     |
| ------------- | ---------------------- | ----------- |
| `size`        | `'default' \| 'large'` | `'default'` |
| `state`       | `OverlayTriggerState`  | required    |
| `modalStyles` | `string`               | --          |
| `children`    | `ReactNode`            | required    |

**ModalTrigger**: Compound component pairing a Button with a Modal.

| Prop       | Type                                 | Default  |
| ---------- | ------------------------------------ | -------- |
| `label`    | `string`                             | required |
| `icon`     | `ReactNode`                          | --       |
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

## Toast

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

## ToggleButtonGroup

Multi-select toggle button group with pill-shaped buttons.

| Prop                | Type                       | Default  |
| ------------------- | -------------------------- | -------- |
| `label`             | `string`                   | --       |
| `errorMessage`      | `string`                   | --       |
| `hint`              | `string`                   | --       |
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

## Wizard

Multi-step form wizard with validation, progress indicators, and animated transitions.

**Wizard** (container):

| Prop         | Type                                         | Default  |
| ------------ | -------------------------------------------- | -------- |
| `stages`     | `WizardStageConfig[]`                        | required |
| `children`   | `ReactNode`                                  | required |
| `onComplete` | `(formData: Record<string, string>) => void` | --       |

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
