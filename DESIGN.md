---
name: Warm & Playful
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#574144'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#8b7074'
  outline-variant: '#debfc2'
  surface-tint: '#ad2c4e'
  primary: '#ad2c4e'
  on-primary: '#ffffff'
  primary-container: '#ff6b8a'
  on-primary-container: '#6e0027'
  inverse-primary: '#ffb2bd'
  secondary: '#934656'
  on-secondary: '#ffffff'
  secondary-container: '#fe9dae'
  on-secondary-container: '#793141'
  tertiary: '#ba1340'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff6c80'
  on-tertiary-container: '#6f0020'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9dd'
  primary-fixed-dim: '#ffb2bd'
  on-primary-fixed: '#400013'
  on-primary-fixed-variant: '#8c1037'
  secondary-fixed: '#ffd9de'
  secondary-fixed-dim: '#ffb2be'
  on-secondary-fixed: '#3e0315'
  on-secondary-fixed-variant: '#762f3f'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b8'
  on-tertiary-fixed: '#40000f'
  on-tertiary-fixed-variant: '#91002d'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 20px
  gutter: 16px
---

## Brand & Style

This design system is built on the principles of accessibility, warmth, and encouragement. It moves away from the cold, sterile nature of traditional productivity tools and adopts a personality closer to an educational companion. The goal is to make potentially daunting tasks feel manageable and friendly.

The visual style blends **Modern Minimalism** with **Tactile** elements. By using soft shadows and generous corner radii, the interface feels physical and "squishy," inviting interaction without the intimidation of sharp edges or complex layouts. The atmosphere is optimistic, clear, and focused on positive reinforcement through color and shape.

## Colors

The palette is anchored by "Warm Pink," a hue that balances energy with softness. Unlike corporate blues, this palette communicates empathy and approachability. 

- **Primary & Secondary:** Used for high-intent actions and brand expression. The secondary pink provides a softer alternative for less critical UI elements.
- **Accent:** Reserved for high-priority alerts or "urgent" states to ensure they stand out against the softer primary palette.
- **Background:** A tinted white (#FFF5F7) ensures the screen feels warm and reduces eye strain compared to pure white.
- **Functional Colors:** Green and Red are used sparingly for success and error states, but are tuned to maintain the vibrant, non-scary aesthetic of the system.

## Typography

This design system utilizes **Inter** for its exceptional readability and modern, clean aesthetic. The hierarchy is intentionally simplified to keep the interface approachable.

- **Headings:** Use a Bold weight (700) to create clear entry points and a sense of confidence.
- **Body Text:** Set at 16px for optimal legibility on mobile devices, ensuring the app is accessible to users of all ages.
- **Captions:** A Medium weight (500) is applied to smaller text to maintain clarity and prevent the font from looking "anemic" at 12px.

## Layout & Spacing

The layout philosophy follows a **fluid grid** model tailored for mobile viewing. It relies on a consistent 8px base unit to create a rhythmic, predictable flow.

- **Margins:** A standard 20px horizontal margin is used for screen edges to provide breathing room.
- **Rhythm:** Elements are spaced using multiples of 8px (16, 24, 32) to maintain a cohesive structure.
- **Hierarchy:** Larger spacing (24px+) is used to separate distinct content blocks, while smaller spacing (8px-12px) groups related items like labels and inputs.

## Elevation & Depth

This design system avoids harsh shadows in favor of **Ambient, Tinted Shadows**. This creates a soft, layered effect that feels friendly rather than heavy.

- **Soft Depth:** Cards and floating elements use a shadow tinted with the primary color (e.g., a low-opacity #FF6B8A shadow) to integrate the element into the warm background.
- **Tonal Layering:** Depth is primarily conveyed through the contrast between the #FFF5F7 background and pure #FFFFFF surfaces.
- **Interaction:** Buttons may use a slight downward shift or a subtle glow when pressed to simulate a tactile, physical response.

## Shapes

The shape language is characterized by high-radius corners that eliminate sharp points, reinforcing the "not scary" brand promise.

- **Main Elements:** Large components like cards use a 16px radius.
- **Input Fields:** Form elements use a slightly tighter 12px radius to ensure they feel distinct from the containers they sit within.
- **Icons:** Should follow the same logic—avoiding sharp caps or joins in favor of rounded terminals.

## Components

- **Buttons:** Primary buttons are 48px high with a #FF6B8A background and white text. They feature a full-width or large-width presence to be easily tappable.
- **Cards:** Cards use a pure white background and a 16px radius. They are elevated by a soft pink shadow rather than a border.
- **Input Fields:** Inputs feature a white background with a 1px border in #FF9EAF (Secondary Pink). The 12px radius ensures they look friendly and modern.
- **Navigation:** A fixed bottom tab bar with 4 icons. The active state is indicated by a Primary Pink color shift in both the icon and a small dot indicator.
- **Chips:** Used for filtering or tags, these should have pill-shaped (fully rounded) corners and use the Secondary Pink for their background.
- **Progress Bars:** Thick, rounded bars with a Secondary Pink track and a Primary Pink fill to make progress feel rewarding and visible.