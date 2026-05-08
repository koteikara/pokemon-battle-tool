---
name: Pokedex OS Retro
colors:
  border-primary: '#BC0100'
  shadow-primary: '#930100'
  surface-card: '#FFFFFF'
  surface-accent: '#E0E0FE'
  stat-h: '#FDD400'
  stat-a: '#FFB4A8'
  stat-b: '#FFE24A'
  stat-c: '#C4C4E2'
  stat-d: '#FFDAD6'
  stat-s: '#EBBBB4'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-pixel:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  margin: 32px
  gutter: 24px
---

## Brand & Style
The brand is a nostalgic, high-energy fusion of **Retro-Gaming (Pixel Art)** and **Brutalism**. It evokes the feeling of a 90s handheld monster-battling interface upgraded with modern performance.

The design style utilizes **Bold Borders** and **High-Contrast** elements. It relies on heavy black or dark-toned hard shadows (non-diffused) and thick outlines to create a tactile, "pressable" physical interface. The aesthetic is loud, technical, and data-heavy, yet remains playful and approachable for a gaming audience.

## Colors
The palette is dominated by a high-intensity **Pokedex Red** (#BC0100) used for primary actions and headers.

- **Primary:** A vivid red that signifies energy and main navigation.
- **Secondary/Tertiary:** Subdued indigos and ochres used for auxiliary data categorization (e.g., stats, info boxes).
- **Functional Surfaces:** The background uses a slightly off-white light gray to reduce eye strain, while cards are pure white to pop against the background.
- **Semantic Accents:** Specialized colors are reserved for the "H-A-B-C-D-S" stat categories to provide immediate visual recognition during competitive play.

## Typography
The system uses a tri-font strategy to balance technical feel with readability:
1. **Space Grotesk (Headlines):** High-personality, geometric sans-serif for impact.
2. **Plus Jakarta Sans (Body):** Modern, clean sans-serif for dense data entry and long-form reading.
3. **Space Mono (Labels/Technical):** Monospaced font used for data labels, version numbers, and "pixel-style" UI elements to reinforce the technical OS aesthetic.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Navigation is anchored to a fixed sidebar on desktop, while the content area uses a fluid 12-column grid.

- **Margins:** 32px global page margins.
- **Gutters:** 24px between main layout columns and cards.
- **Rhythm:** An 8px base unit drives all internal component padding and smaller gaps.
- **Density:** High information density is prioritized to keep competitive data visible without excessive scrolling.

## Elevation & Depth
Depth is created through **Brutalist Hard Shadows** rather than z-axis blurs.

- **Primary Elevation:** 4px x 4px solid color offsets (no blur). The shadow color should be a darker shade of the element's border or primary color.
- **Interaction Depth:** On hover or active states, the shadow shrinks (e.g., to 2px) and the element translates downward/right to simulate a physical button being pressed.
- **Outlines:** All containers must have a minimum 2px solid border (Outline #956D67 or Primary #BC0100) to separate layers.

## Shapes
The shape language combines **High Roundedness** (to feel modern/friendly) with **Hard Outlines** (to feel retro/technical).

- **Cards/Containers:** Use `rounded-2xl` (1.5rem) to soften the aggressive brutalist borders.
- **Buttons:** Large buttons use `rounded-xl`, while secondary navigation or tags use `rounded-full` for a "pill" aesthetic.
- **Inputs:** Use `rounded-lg` (0.5rem) to maintain a crisp, functional appearance.

## Components

### Buttons
- **Primary:** Background Red (#BC0100), 2px dark red border, 4px hard shadow. White bold text.
- **Secondary:** White background, 2px outline (#956D67), 2px soft shadow.
- **Interaction:** Hover triggers a `-2px` translation on X and Y axes to meet the shadow.

### Cards
- **Pixel-Card:** White background, 2px solid border (#956D67), 4px hard shadow using a tinted neutral or primary-dim color.
- **Stat-Card:** Small centered containers with a dark header block (inverted text) and a centered numeric input.

### Input Fields
- **Text/Number:** 2px solid borders. Backgrounds are slightly off-white (#f3f3f4) to distinguish from the card surface. Focus state switches border to Primary Red.
- **Selects:** Standard height with 2px borders and custom chevron icons.

### Chips & Tags
- **Data Tags:** `Space Mono` font, 12px or 14px. Rounded-full with a 1px or 2px border matching the text color. Backgrounds should be light tints of the border color.

### Navigation
- **Sidebar:** Fixed width (256px), solid right-hand border. Uses high-contrast active states with primary-container backgrounds.
