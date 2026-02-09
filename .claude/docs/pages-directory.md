# Pages Directory Structure

```
frontend/pages/
├── 404/                              # Error pages
│   └── UserNotRegisteredError.tsx     # Unregistered user error page
├── auth/                             # Authentication pages
│   ├── index.tsx                     # Barrel exports (AuthLayout, SocialButtons, PasswordInput)
│   ├── components/                   # Shared auth components
│   │   ├── auth-layout.tsx           # Layout wrapper with branding and gradient background
│   │   ├── divider-with-text.tsx     # Horizontal divider with centered label
│   │   ├── password-input.tsx        # Password input with optional requirements hint
│   │   ├── social-buttons.tsx        # Google and Facebook OAuth button group
│   │   ├── google-login-button.tsx   # Google OAuth button (placeholder)
│   │   └── facebook-login-button.tsx # Facebook OAuth button (placeholder)
│   ├── login/                        # Login page
│   │   └── login.tsx                 # Email/password form with server action
│   └── join/                         # Signup page (wizard form)
│       ├── join.tsx                  # Page component with Wizard wrapper
│       ├── join-form-content.tsx     # Wizard content with stage composition
│       ├── ts/
│       │   ├── types.ts             # ActionData, SignupFormData
│       │   └── constants.ts         # ACCOUNT_CONFIG, ADDRESS_CONFIG
│       └── components/
│           ├── index.tsx            # Barrel exports
│           ├── account-section.tsx  # First/last name, email, password fields
│           └── address-section.tsx  # Street, city, state, zip code fields
└── landing/                          # Landing page
    ├── landing.tsx                   # Root page composing all sections
    └── layout/
        ├── index.tsx                # Barrel exports for all layout sections
        ├── hero/hero.tsx            # Hero banner with CTAs
        ├── navbar/navbar.tsx        # Responsive navigation bar
        ├── services/               # Services section
        │   ├── services.tsx         # Service cards grid
        │   ├── types.ts             # Color, ServiceOption, ColorClassesOptions
        │   └── constants.ts         # services array, colorClasses map
        ├── prices/prices.tsx        # Pricing tiers section
        ├── testimonials/testimonials.tsx  # Customer reviews section
        ├── contact/contact.tsx      # Contact info and message form
        ├── footer/footer.tsx        # Site footer with links and social icons
        └── booking/                 # Booking wizard (in modal)
            ├── booking-modal.tsx    # ModalTrigger wrapper with Wizard
            ├── booking-form-content.tsx  # Wizard content with stage composition
            ├── ts/
            │   ├── types.ts         # BookingFormData interface
            │   └── constants.ts     # Stage configs (GENERAL, HOME, VISIT, SUMMARY)
            └── components/
                ├── index.tsx        # Barrel exports
                ├── general-section.tsx  # Cleaning type and dirtiness fields
                ├── home-section.tsx     # Bedrooms, bathrooms, sq ft fields
                ├── visit-section.tsx    # Priority areas, occasion, date fields
                └── summary-section.tsx  # Review data with recommendation
```

## Page Conventions

- **Route pages** export a default component and optionally a `meta` function and `action` server action
- **Auth pages** wrap content in `AuthLayout` for consistent branding and styling
- **Landing sections** are standalone components composed in `landing.tsx`
- **Wizard pages** follow the four-layer pattern: stage configs, page, form content, section components (see [wizard-patterns.md](wizard-patterns.md) for details)
- **Barrel exports** (`index.tsx`) use `@module` TSDoc tags and re-export named components
- **Shared auth components** live in `pages/auth/components/` and are re-exported from `pages/auth/index.tsx`
- **Section-local types** live in `ts/types.ts`; constants and stage configs in `ts/constants.ts`
