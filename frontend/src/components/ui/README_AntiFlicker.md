# Anti-Flicker Components and Utilities

This document explains the anti-flicker components and CSS utilities implemented to prevent screen flickering during state transitions, button clicks, and data fetching.

## Components

### 1. AntiFlickerWrapper

Wraps content to prevent layout shifts and flickering during loading states.

```tsx
import AntiFlickerWrapper from "@/components/ui/AntiFlickerWrapper";

<AntiFlickerWrapper
  isLoading={isLoading}
  preserveDimensions={true}
  debounceMs={100}
>
  <YourContent />
</AntiFlickerWrapper>;
```

### 2. Skeleton Components

Provide placeholder content while data loads.

```tsx
import { Skeleton, SkeletonText, SkeletonButton } from '@/components/ui/AntiFlickerWrapper';

<Skeleton width="100%" height="2rem" />
<SkeletonText lines={3} />
<SkeletonButton />
```

## CSS Classes

### Global Anti-Flicker Classes

- `no-flicker`: Basic GPU acceleration and anti-flicker properties
- `smooth-transition`: Smooth transitions with optimized timing
- `btn-smooth`: Anti-flicker button animations
- `preserve-dimensions`: Maintains element dimensions during state changes

### Loading States

- `loading-container`: Container for elements with loading overlays
- `loading-overlay`: Smooth loading overlay with backdrop blur
- `content-loading`: Dims content during loading
- `content-loaded`: Restores content after loading

### Skeleton Loading

- `skeleton`: Animated skeleton placeholder
- `skeleton-loading`: Keyframe animation for skeleton effect

## Usage Examples

### Button with Anti-Flicker

```tsx
<button className="btn-smooth preserve-dimensions">Click me</button>
```

### Form with Stable Inputs

```tsx
<input className="form-input-stable" />
```

### Container with Loading State

```tsx
<div className="loading-container">
  <div className={isLoading ? "content-loading" : "content-loaded"}>
    Your content
  </div>
  {isLoading && <div className="loading-overlay active">Loading...</div>}
</div>
```

## Implementation Details

### Debouncing

- Loading states are debounced by 150ms to prevent rapid flickering
- Button states use shorter 50ms transitions for responsiveness

### GPU Acceleration

- All animated elements use `transform: translateZ(0)` for GPU acceleration
- `backface-visibility: hidden` prevents rendering artifacts

### Dimension Preservation

- Components maintain their dimensions during loading states
- Uses `min-height` and `min-width` to prevent layout shifts

## Global Optimizations

### Body Element

- Font smoothing optimizations
- Perspective for 3D acceleration
- Overflow management

### Transitions

- Optimized cubic-bezier timing functions
- Hardware acceleration triggers
- Reduced motion support
