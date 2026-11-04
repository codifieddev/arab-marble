# Annotation Plugin

The Annotation Plugin is a comprehensive, React-based UI tool that empowers users to leave contextual comments and annotations directly on UI elements within the web application. Designed for visual feedback and review, it anchors comments to specific DOM nodes using robust CSS selectors and relative percentages, ensuring pins stay precisely where you placed them.

## Key Features

- **Visual Annotations**: Toggle "Comment Mode" to click anywhere on the interface and drop a new feedback pin.
- **Dynamic DOM Tracking**: Hooks into `requestAnimationFrame` to update pin positions automatically. Pins stay perfectly glued to their target elements during fluid scrolling, resizing, and dynamic layout shifts.
- **Draggable Pins**: Drag existing pins to reposition them precisely within the element boundaries.
- **Visibility & Screen Context**: Tag comments with the screen size context they were created on (`Mobile`, `Tablet`, `Desktop`). Filter annotations by device size to streamline the review process.
- **Issue Tracking**: Features a built-in status management system (`Open`, `Pending`, `Done`). You can filter out resolved ("Done") comments from the settings menu.
- **Calibration Mode**: An optional developer setting that visually highlights elements containing a `data-annotate-id` attribute, aiding in precise selection and DOM stability.
- **Redux & Zustand State Management**: Zustand (`store.ts`) handles rapid client-side rendering and volatile local states (like dragging and active UI popovers), while Redux hooks seamlessly sync with the backend via thunks (`createCommentThunk`, etc.).

## Directory Structure

```text
src/components/annotationPlugin/
├── index.ts                 # Main exports for the plugin
├── AnnotatorPlugin.tsx      # Core plugin wrapper & UI Controls (FAB, settings, Draft overlay)
├── Marker.tsx               # Renders individual comment pins, popovers, and drag logic
├── store.ts                 # Zustand store for client-side state
├── utils.ts                 # Utility helpers (CSS selector generation, viewport calcs)
├── GetAllCommments.tsx      # Data fetching component to populate Redux at plugin initialization
└── style.css                # Base stylesheet
```

---

## Technical Overview

### 1. Element Targeting Strategy
When a user clicks to leave a comment, the plugin temporarily bypasses the capture overlay to retrieve the underlying component via `document.elementFromPoint`. 

It evaluates the target in `utils.ts -> getCssSelector` in the following priority order to guarantee maximum stability across page reloads:
1. `id` attribute
2. `data-annotate-id` custom attribute
3. A globally unique class name
4. Structural sequential DOM paths (`div.container > main > section > p:nth-of-type(2)`)

### 2. Positioning Engine
Instead of relying on absolute page coordinates (`X, Y`) which break instantly upon window resize or reflow, the plugin calculates the position of the click as relative percentages to the target element:
- `offsetX`: Percentage of width (0-100)
- `offsetY`: Percentage of height (0-100)

Using these stored percentages, `Marker.tsx` actively repositions the comment pin regardless of where the element moves on the screen.

### 3. Route Syncing
Annotations are localized by the URL path. `usePathname` is utilized to extract the final route slug, ensuring that the annotations shown belong strictly to the view the user is looking at.

---

## Integration Guide

### 1. Basic Setup
To integrate the tool, inject it at a broad layout level (like you would a Toast provider) so it's accessible across routes.

```tsx
import { AnnotatorPlugin } from '@/src/components/annotationPlugin';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AnnotatorPlugin />
      </body>
    </html>
  );
}
```

### 2. Best Practices (`data-annotate-id`)
Because semantic markup and dynamic utility classes (like Tailwind) can change frequently, consider passing the custom `data-annotate-id` attribute to critical sections of your application to protect annotation stability:

```tsx
<nav data-annotate-id="main-navigation" className="flex justify-between items-center p-4">
  <ul data-annotate-id="nav-links">
    <li>Home</li>
    <li>About</li>
  </ul>
</nav>
```
The Calibration Mode inside the plugin's settings menu will scan the DOM and highlight elements bearing these IDs to help test your annotation zones.

### 3. Backend Implementation Expectations
For persistent storage, the plugin leverages Redux Thunks. Ensure the following thunks are correctly defined in your features directory (`src/hook/comments/commentThunk.ts`):
- `createCommentThunk`
- `updateCommentThunk`
- `deleteCommentThunk`

The expected payload format mapped to the Database schema is structured identically to the `Annotation` interface in `store.ts`.

---

## User Workflow

1. **Activate Mode**: Click the Floating Action Button (FAB) at the bottom right.
2. **Leave Feedback**: Click any element on the screen to spawn a `Draft Pin`. Type a comment and press "Save".
3. **Review**: Hover/click an existing pin to see the comment popover. You can update its status, change responsive visibility, or drag it.
4. **Settings Options**: Toggling the settings icon opens preferences such as toggling visible states for resolved issues, or enabling calibration markers.
