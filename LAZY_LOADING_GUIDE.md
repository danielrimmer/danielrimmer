# Lazy Loading Implementation Guide

## Overview

This document explains the lazy loading optimizations implemented to improve website performance by deferring the loading of below-the-fold content.

## What Was Changed

### 1. **JavaScript: Advanced Lazy Loading Module** (script.js)

Added a comprehensive lazy loading system with the following features:

#### A. Video Lazy Loading
- **File:** `script.js` (lines 1288-1325)
- **Function:** Loads video elements only when they come into view
- **Implementation:**
  - Uses IntersectionObserver to detect when videos enter viewport
  - Dynamically loads `<source>` elements 50px before visibility
  - Supports `data-src` attribute for deferred loading
  - Automatically calls `video.load()` to start playback

#### B. Background Image Lazy Loading
- **File:** `script.js` (lines 1328-1351)
- **Function:** Loads background images for parallax and wallpaper effects
- **Implementation:**
  - Uses `[data-bg-src]` attribute for deferred loading
  - Loads 100px before element becomes visible
  - Prevents unnecessary bandwidth usage for below-fold sections
  - Adds `bg-loaded` class for CSS transitions

#### C. Process Section Wallpapers
- **File:** `script.js` (lines 1354-1389)
- **Function:** Preloads process section wallpaper images on demand
- **Implementation:**
  - Detects when process section is visible
  - Preloads all 6 wallpaper images (brainstorm, design, website, etc.)
  - Starts loading 200px before section enters viewport
  - Improves performance for interactive wallpaper switching

#### D. Benefit Card Video Optimization
- **File:** `script.js` (lines 1392-1423)
- **Function:** Aggressive video lazy loading for benefit cards
- **Implementation:**
  - Sets `preload="none"` by default (no automatic loading)
  - Loads video metadata 150px before visibility
  - Changes to `preload="auto"` only when card is about to be visible
  - Tracks loaded state to prevent duplicate loads

#### E. Image Loading Optimization
- **File:** `script.js` (lines 1426-1451)
- **Function:** Tracks when lazy-loaded images are visible
- **Implementation:**
  - Adds `img-loaded` class when images are loaded
  - Enables smooth fade-in animations via CSS
  - Improves perceived performance

### 2. **HTML Changes**

#### Updated `he.html` and `index.html`
- **Change:** All benefit card videos now use `preload="none"`
- **Files Modified:**
  - `/he.html` - 7 benefit card videos updated
  - `/index.html` - 7 benefit card videos updated
- **Before:** `preload="metadata" loading="lazy"`
- **After:** `preload="none" loading="lazy"`
- **Benefit:** Prevents unnecessary metadata loading for off-screen videos

### 3. **CSS Optimization Styles** (style.css)

Added lazy loading-related CSS rules (lines 3859-3913):

```css
/* Video transitions */
video {
  transition: opacity 0.3s ease;
}

/* Smooth fade-in for loaded images */
img.img-loaded {
  animation: fadeInImage 0.3s ease;
}

/* Background image loading transitions */
[data-bg-src] {
  transition: opacity 0.4s ease;
}

[data-bg-src].bg-loaded {
  opacity: 1;
}

/* Placeholder styling for videos */
.card-video-full {
  background: rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
}

.card-video-full[preload="auto"],
.card-video-full.loaded {
  background: transparent;
}
```

## How to Use

### For Videos

#### Option 1: Default HTML Video (Recommended)
```html
<video class="card-video-full" muted playsinline preload="none">
  <source src="videos/example.mp4" type="video/mp4" />
</video>
```

The script automatically handles lazy loading based on visibility.

#### Option 2: Using data-src Attribute
```html
<video class="lazy-video" muted playsinline>
  <source data-src="videos/example.mp4" type="video/mp4" />
</video>
```

### For Background Images

```html
<div class="section" data-bg-src="images/background.webp">
  <!-- Content -->
</div>
```

The script will:
1. Load the image 100px before the element becomes visible
2. Set it as the background-image
3. Add the `bg-loaded` class for CSS transitions

### For Process Wallpapers

The script automatically handles the process section's 6 wallpaper images. They are preloaded when the process section becomes visible.

## Performance Benefits

### Before Optimization
- All benefit card videos loaded (with preload="metadata")
- Background images for parallax sections loaded immediately
- Process wallpaper images all loaded upfront
- **Estimated unused bandwidth:** 15-25% of video content

### After Optimization
- Benefit videos only load when card comes into view (50-150px before)
- Background images load only when section is approaching visibility
- Process wallpapers preload on-demand when section is visible
- **Expected improvement:** 20-30% reduction in initial page load time

## Browser Support

All features require:
- **IntersectionObserver API** - Modern browsers (IE 11 polyfill available)
- **HTML5 Video Element** - All modern browsers

Fallback: If IntersectionObserver is not available, images load normally with native `loading="lazy"`.

## Monitoring & Debugging

### Check Lazy Loading Status

```javascript
// In browser console:
// Check if videos are loaded
document.querySelectorAll('video[preload="none"]').forEach(v => {
  console.log('Video status:', v.preload, 'Loaded:', v.src ? 'yes' : 'no');
});

// Check background image state
document.querySelectorAll('[data-bg-src]').forEach(el => {
  console.log('BG Image:', el.dataset.bgSrc, 'Loaded:', el.classList.contains('bg-loaded'));
});
```

### Performance Timeline
1. **Page Load (0ms):** Hero section video starts
2. **Initial Render:** HTML/CSS loaded, no below-fold assets
3. **Process Section (500-1000ms):** Wallpapers start preloading
4. **First Benefit Card Visible (2000-3000ms):** First video lazy loads
5. **All Content Visible:** All lazy assets fully loaded

## Future Optimizations

Potential improvements for even better performance:

1. **Network-Aware Loading**
   - Detect slow connections (3G/LTE)
   - Load lower-quality video variants
   - Use requestIdleCallback for non-critical assets

2. **WebM Video Variants**
   - Provide WebM format alongside MP4
   - Smaller file sizes for supported browsers
   - Significant bandwidth savings

3. **Progressive Image Loading**
   - Add LQIP (Low Quality Image Placeholder)
   - Show blur-up effect while image loads
   - Better perceived performance

4. **Critical CSS**
   - Inline critical styles
   - Defer non-critical CSS
   - Faster first contentful paint

## Testing

### Mobile Network Throttling
1. Open DevTools → Network Tab
2. Set throttle to "Fast 3G" or "Slow 3G"
3. Reload page
4. Verify:
   - Hero video loads immediately
   - Benefit videos only load on scroll
   - Background images load smoothly without blocking

### Lighthouse Audit
Run Lighthouse to verify improvements:
- Initial load time should be faster
- First Contentful Paint (FCP) should improve
- Largest Contentful Paint (LCP) should maintain good score

## Maintenance

When adding new below-the-fold content:

1. **For Videos:** Use `preload="none"` and class `card-video-full` or `lazy-video`
2. **For Background Images:** Use `data-bg-src` attribute instead of inline styles
3. **For Static Content:** Use `loading="lazy"` on `<img>` tags

## References

- [MDN: Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Web.dev: Image lazy loading](https://web.dev/lazy-loading-images-and-video/)
- [HTML5 Video Preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-preload)
