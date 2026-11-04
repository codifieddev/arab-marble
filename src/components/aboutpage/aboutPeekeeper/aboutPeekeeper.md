# AboutPeekeeper Component Documentation

This document provides a comprehensive overview of the styling, layout, typography, and data structure used in the `AboutPeekeeper` component.

## 1. Component Overview
The `AboutPeekeeper` component is a bilingual, CMS-driven hero section designed for the "About Us" page. It features a split-layout design with text content on the left and a staggered image grid on the right, overlaid on a dark, immersive background with a gradient fade.

## 2. Dependencies on `globals.css`
The component heavily relies on the project's central design system defined in `app/globals.css`.

### Global CSS Variables Used
- `--border`: Defines the base border color (`border-border`), falling back to `oklch(0.922 0 0)` or the specific theme color.
- `--secondary`: The brand's secondary color (`#98c45f`), used for the badge text (`text-secondary`) and the primary button background (`bg-secondary`).
- `--font-heading`: The primary heading font (`"Cormorant Garamond", Georgia, serif`), applied via the `font-heading` utility class.

## 3. Layout & Structure

### Section Container
- **Layout:** `relative`, `overflow-hidden`
- **Spacing:** `border-b`
- **Colors:** Custom dark background `bg-[#0f1f17]`, `text-white`
- **Border:** `border-border` (Uses `globals.css`)

### Background Layer
- **Container:** `absolute inset-0`
- **Image:** `h-full w-full object-cover opacity-35`
- **Gradient Overlay:** `absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30`

### Main Content Grid
- **Layout:** CSS Grid `grid`, `items-center`
- **Columns:** `lg:grid-cols-[1.1fr_0.9fr]` (Split layout on desktop)
- **Sizing & Spacing:** `mx-auto max-w-7xl min-h-[78vh] px-[5%] py-24 gap-10`

### Image Grid (Right Column)
- **Layout:** `grid sm:grid-cols-2 gap-4`
- **Image Wrapper:** 
  - **Styling:** `overflow-hidden rounded-[26px] border border-white/10 bg-white/10 backdrop-blur-md`
  - **Dynamic Layout:** The second image (`idx === 1`) uses `sm:translate-y-10` to create a staggered, overlapping aesthetic.
- **Images:** `h-[240px] w-full object-cover`

## 4. Typography & Text Styles

### Badge
- **Typography:** `text-[12px] font-black uppercase tracking-[4px]`
- **Color:** `text-secondary` (from `globals.css`)
- **Spacing:** `mb-5`

### Heading
- **Typography:** `font-heading font-bold leading-[0.95] tracking-tight`
- **Font Sizes:** Responsive scaling: `text-[30px] sm:text-[40px] lg:text-[50px]`
- **Constraints:** `max-w-[780px]`

### Description
- **Typography:** `text-[16px] sm:text-[18px] font-semibold leading-8`
- **Color:** `text-white/80`
- **Constraints & Spacing:** `mt-6 max-w-[620px]`

## 5. Interactive Elements & Buttons

### Button Container
- **Layout:** `mt-9 flex flex-wrap gap-4`

### Primary Button
- **Layout:** `inline-flex items-center h-12 px-6 rounded-full`
- **Typography:** `text-[13px] font-black uppercase tracking-[2px]`
- **Colors:** `bg-secondary text-black`
- **Transitions/Hover:** `transition hover:opacity-90`

### Secondary Button
- **Layout:** `inline-flex items-center h-12 px-6 rounded-full`
- **Typography:** `text-[13px] font-black uppercase tracking-[2px]`
- **Colors & Borders:** `border border-white/20 text-white`
- **Transitions/Hover:** `transition hover:bg-white/10`

## 6. Animations (Framer Motion)
The component utilizes `motion/react` for entry animations triggered when scrolling into view (`whileInView`, `viewport={{ once: true }}`).
- **Text Elements:** Fade in and slide up (`y: 16` to `y: 0`, `opacity: 0` to `opacity: 1`) with staggered delays (`0.08`, `0.14`, `0.2`).
- **Image Grid:** Subtle scale-in effect (`scale: 0.96` to `scale: 1`, `opacity: 0` to `opacity: 1`) with a `0.18` delay.

## 7. Data Structure (`aboutPeekeeperData.ts`)
The default fallback data is structured to support bilingual content (English `en` and Hindi `hi`).

```typescript
{
  props: {
    badge: { en: string, hi: string },
    heading: { en: string, hi: string },
    description: { en: string, hi: string },
    primaryButton: { en: string, hi: string },
    secondaryButton: { en: string, hi: string },
    backgroundImage: string, // URL
  },
  content: [
    {
      id: string,
      type: "item",
      props: {
        image: string, // URL
        alt: { en: string, hi: string }
      }
    }
  ]
}
```
