# CSS Variable Centralization Refactor Plan

**Created:** November 5, 2025  
**Purpose:** Centralize all hardcoded values into `_variables.css` for better maintainability and consistency  
**Current State:** Variables are well-organized but several hardcoded values exist across component files  
**Goal:** Single source of truth for all design tokens

---

## 📊 Current Variable Coverage

### ✅ Already Centralized in `_variables.css`:

#### Colors (8 variables)
- `--primary-gold: #e9c46a`
- `--text-secondary: #a8dadc`
- `--text-light: #f0f0f0`
- `--accent-orange: #f4a261`
- `--dark-bg: #1e1f26`
- `--light-bg: #283c63`
- `--bg-transparent: transparent`
- `--border-accent: #e9c56a5b`

#### Typography Scale (10 variables)
- `--font-size-3xs` through `--font-size-3xl`
- `--font-size-base: 1em`

#### Spacing Scale (9 variables)
- `--spacing-3xs: 2px` through `--spacing-3xl: 48px`

#### Layout (4 variables)
- `--header-height`, `--footer-height`, `--mobile-footer-height`
- `--mobile-breakpoint: 768px`

#### Border Radius (6 variables)
- `--radius-xs: 2px` through `--radius-circle: 50%`

#### Z-index (4 variables)
- `--z-base`, `--z-dropdown`, `--z-header`, `--z-player`

#### Animations (5 variables)
- `--transition-fast`, `--transition-normal`, `--transition-slow`, `--transition-smooth`
- `--easing-smooth`

#### Shadows (3 variables)
- `--shadow-light`, `--shadow-medium`, `--shadow-heavy`

#### Component Tokens (14 variables)
- Slider: `--slider-track-bg`, `--slider-thumb-color`, `--slider-track-radius`
- Button: `--button-bg`, `--button-border`, `--button-color`, `--button-hover-bg`, `--button-hover-color`, `--button-radius`
- Card: `--card-bg`, `--card-border`, `--card-hover-bg`, `--card-hover-color`, `--card-transform`, `--card-shadow`

#### Layout Helpers (4 variables)
- `--spacing-inline`, `--spacing-block`, `--content-max-width`, `--content-padding`

**Total: 67 existing variables**

---

## 🔍 Hardcoded Values Found (Need Centralization)

### 1. **Color Values - Transparency Variations** 🎨

#### File: `css/core/_reset.css`
```css
/* Scrollbar colors with hardcoded transparency */
scrollbar-color: rgba(233, 196, 106, 0.6) rgba(30, 31, 38, 0.3);
background: rgba(30, 31, 38, 0.3);
background: linear-gradient(135deg, rgba(233, 196, 106, 0.6), rgba(168, 218, 220, 0.6));
background: linear-gradient(135deg, rgba(233, 196, 106, 0.8), rgba(168, 218, 220, 0.8));
```

**Issues:**
- Multiple opacity variations of same colors
- Gradients not reusable
- Scrollbar colors not tokenized

**Recommendation:** Create alpha variants
```css
--primary-gold-60: rgba(233, 196, 106, 0.6);
--primary-gold-80: rgba(233, 196, 106, 0.8);
--text-secondary-60: rgba(168, 218, 220, 0.6);
--text-secondary-80: rgba(168, 218, 220, 0.8);
--dark-bg-30: rgba(30, 31, 38, 0.3);
```

#### File: `css/core/_base.css`
```css
/* Hardcoded gradient */
background: linear-gradient(135deg, #1e1f26, #283c63);

/* Hardcoded link transition */
transition: color 0.3s ease, text-decoration 0.3s ease;
```

**Recommendation:** Create gradient and transition variables
```css
--bg-gradient-main: linear-gradient(135deg, var(--dark-bg), var(--light-bg));
--transition-link: color var(--transition-normal), text-decoration var(--transition-normal);
```

#### File: `css/components/player.css`
```css
/* Hover states with hardcoded rgba */
background: rgba(233, 196, 106, 0.2);  /* Line 37 */
background: rgba(168, 218, 220, 0.4);  /* Line 123 */
```

**Recommendation:** Add alpha variants
```css
--primary-gold-20: rgba(233, 196, 106, 0.2);
--text-secondary-40: rgba(168, 218, 220, 0.4);
```

#### File: `css/components/forms.css`
```css
/* Input backgrounds and focus states */
background: rgba(255, 255, 255, 0.04);
box-shadow: 0 0 0 2px rgba(233, 196, 106, 0.2);

/* Error color */
color: #ffb4b4;
```

**Recommendation:** Add semantic variables
```css
--input-bg: rgba(255, 255, 255, 0.04);
--input-focus-shadow: 0 0 0 2px rgba(233, 196, 106, 0.2);
--color-error: #ffb4b4;
```

#### File: `css/components/social.css`
```css
background: rgba(255, 255, 255, 0.03);
background: rgba(233, 196, 106, 0.15);
box-shadow: 0 4px 14px rgba(0,0,0,0.25);
```

**Recommendation:** Create component tokens
```css
--social-bg: rgba(255, 255, 255, 0.03);
--social-hover-bg: rgba(233, 196, 106, 0.15);
--social-hover-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
```

#### File: `css/pages/music.css`
```css
/* Multiple transparency variations */
background: rgba(168, 218, 220, 0.1);   /* Line 3 */
background: rgba(30, 31, 38, 0.3);      /* Line 12 */
background: rgba(168, 218, 220, 0.05);  /* Line 21 */
```

**Recommendation:** Add page-specific semantic tokens
```css
--music-section-bg: rgba(168, 218, 220, 0.1);
--music-stats-bg: rgba(30, 31, 38, 0.3);
--music-info-bg: rgba(168, 218, 220, 0.05);
```

---

### 2. **Border Widths & Styles** 📏

#### File: `css/layout/_layout.css`
```css
border-bottom: 2px solid var(--border-accent);  /* Line 27 */
border-top: 2px solid var(--border-accent);     /* Line 63 */
```

#### File: `css/pages/music.css`
```css
border: 1px solid var(--border-accent);   /* Line 3 */
border-left: 3px solid var(--border-accent);  /* Line 23 */
```

**Recommendation:** Create border width tokens
```css
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 3px;

/* Or semantic naming */
--border-default: 1px solid var(--border-accent);
--border-section: 2px solid var(--border-accent);
--border-accent-heavy: 3px solid var(--border-accent);
```

---

### 3. **Player Component Sizes** 🎵

#### File: `css/components/player.css`

**Control Button Sizes:**
```css
/* Desktop */
.control-btn { width: 1.8rem; height: 1.8rem; font-size: 0.8rem; }
.play-pause-btn { inline-size: 2.2rem; block-size: 2.2rem; font-size: 1rem; }

/* Touch devices */
@media (pointer: coarse) {
  .control-btn { min-inline-size: 2rem; min-block-size: 2rem; }
  .play-pause-btn { min-inline-size: 2.2rem; min-block-size: 2.2rem; }
}

/* Mobile */
@media (max-width: 768px) {
  .control-btn { inline-size: 1.6rem; block-size: 1.6rem; font-size: 0.75rem; }
  .play-pause-btn { inline-size: 2rem; block-size: 2rem; font-size: 0.9rem; }
}
```

**Progress Bar Sizing:**
```css
block-size: 4px;  /* Line 120 */
block-size: 6px;  /* Mobile - Line 161 */

/* Slider thumb sizes */
inline-size: 8px; block-size: 8px;   /* Line 124 */
inline-size: 12px; block-size: 12px; /* Mobile - Line 162 */
inline-size: 6px; block-size: 6px;   /* Volume - Line 140 */
```

**Max Width:**
```css
max-inline-size: 800px;  /* Line 10 */
max-inline-size: 650px;  /* Volume container - Line 138 */
```

**Recommendation:** Create player-specific tokens
```css
/* Player Controls */
--player-control-size: 1.8rem;
--player-control-size-mobile: 1.6rem;
--player-control-size-touch: 2rem;
--player-control-font: 0.8rem;
--player-control-font-mobile: 0.75rem;

--player-play-size: 2.2rem;
--player-play-size-mobile: 2rem;
--player-play-font: 1rem;
--player-play-font-mobile: 0.9rem;

/* Player Progress */
--player-progress-height: 4px;
--player-progress-height-mobile: 6px;
--player-thumb-size: 8px;
--player-thumb-size-mobile: 12px;
--player-volume-thumb-size: 6px;

/* Player Layout */
--player-max-width: 800px;
--player-volume-max-width: 650px;
```

---

### 4. **Typography - Line Heights** 📖

#### Found in Multiple Files:
```css
line-height: 1.6;  /* cards.css, music.css */
line-height: 1;    /* music.css - play icon */
```

**Recommendation:** Add line-height scale
```css
--line-height-tight: 1;
--line-height-normal: 1.4;
--line-height-relaxed: 1.6;
--line-height-loose: 1.8;
```

---

### 5. **Specific Layout Values** 📐

#### File: `css/layout/_layout.css`
```css
/* Container query breakpoint */
@container nav-buttons (width < 400px)  /* Line 111 */

/* Mobile main content padding */
padding-bottom: calc(200px + env(safe-area-inset-bottom, 0));  /* Line 107 */

/* Header font size override */
font-size: 1.6em;  /* Line 92 - mobile h1 */
```

**Recommendation:** Add layout-specific tokens
```css
--nav-container-breakpoint: 400px;
--mobile-content-padding-bottom: 200px;
--header-title-size-mobile: 1.6em;
```

---

### 6. **Component Dimensions** 📦

#### File: `css/components/social.css`
```css
/* Social icon sizing */
inline-size: 44px; block-size: 44px;   /* Container */
inline-size: 24px; block-size: 24px;   /* Icon image */
```

**Recommendation:** Add component size tokens
```css
--social-icon-container: 44px;
--social-icon-size: 24px;
```

#### File: `css/components/buttons.css`
```css
/* Nav button sizing */
width: 120px;
min-width: 80px;
```

**Recommendation:**
```css
--button-nav-width: 120px;
--button-nav-min-width: 80px;
```

---

### 7. **Animation/Transform Values** 🎭

#### File: `css/utilities/utilities.css`
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

#### File: `css/pages/music.css`
```css
transform: translateX(-8px);  /* Line 41 */
```

#### File: `css/components/social.css`
```css
transform: translateY(-2px);  /* Line 6 */
```

**Recommendation:** Create transform tokens
```css
--transform-lift-sm: translateY(-2px);
--transform-lift-md: translateY(-4px);
--transform-offset-left: translateX(-8px);
--transform-offset-right: translateX(8px);
--animation-slide-distance: 10px;
```

---

### 8. **Opacity Values** 👁️

#### Found in Multiple Files:
```css
opacity: 0.9;   /* buttons.css - active state */
opacity: 0.8;   /* music.css - metadata */
opacity: 0;     /* player.css - collapsed state */
opacity: 1;     /* player.css - expanded state */
```

**Recommendation:** Add opacity scale
```css
--opacity-invisible: 0;
--opacity-subtle: 0.3;
--opacity-muted: 0.6;
--opacity-dimmed: 0.8;
--opacity-slight: 0.9;
--opacity-full: 1;
```

---

### 9. **Scrollbar Dimensions** 📜

#### File: `css/core/_reset.css`
```css
::-webkit-scrollbar { width: 8px; height: 8px; }
```

**Recommendation:**
```css
--scrollbar-width: 8px;
--scrollbar-height: 8px;
```

---

## 📋 Implementation Plan

### Phase 1: Add New Alpha/Transparency Color Variables ✅ Priority: HIGH

**Add to `_variables.css` under "Color Palette" section:**

```css
/* Color Palette - Base Colors */
--primary-gold: #e9c46a;
--text-secondary: #a8dadc;
--text-light: #f0f0f0;
--accent-orange: #f4a261;
--dark-bg: #1e1f26;
--light-bg: #283c63;
--bg-transparent: transparent;
--border-accent: #e9c56a5b;
--color-error: #ffb4b4;

/* Color Palette - Alpha Variants */
--primary-gold-20: rgba(233, 196, 106, 0.2);
--primary-gold-60: rgba(233, 196, 106, 0.6);
--primary-gold-80: rgba(233, 196, 106, 0.8);
--text-secondary-40: rgba(168, 218, 220, 0.4);
--text-secondary-60: rgba(168, 218, 220, 0.6);
--text-secondary-80: rgba(168, 218, 220, 0.8);
--text-secondary-10: rgba(168, 218, 220, 0.1);
--text-secondary-05: rgba(168, 218, 220, 0.05);
--dark-bg-30: rgba(30, 31, 38, 0.3);
--white-03: rgba(255, 255, 255, 0.03);
--white-04: rgba(255, 255, 255, 0.04);
--black-25: rgba(0, 0, 0, 0.25);
```

**Files to Update:**
1. `css/core/_reset.css` - scrollbar colors
2. `css/components/player.css` - hover states
3. `css/components/forms.css` - input backgrounds
4. `css/components/social.css` - icon backgrounds
5. `css/pages/music.css` - section backgrounds

**Estimated Changes:** ~15 replacements  
**Risk:** Low - color substitutions are straightforward  
**Test:** Visual regression test for color accuracy

---

### Phase 2: Add Gradient & Special Effect Variables ✅ Priority: HIGH

**Add to `_variables.css` after colors:**

```css
/* Gradients */
--bg-gradient-main: linear-gradient(135deg, var(--dark-bg), var(--light-bg));
--gradient-scrollbar: linear-gradient(135deg, var(--primary-gold-60), var(--text-secondary-60));
--gradient-scrollbar-hover: linear-gradient(135deg, var(--primary-gold-80), var(--text-secondary-80));

/* Focus & Interaction States */
--input-focus-shadow: 0 0 0 2px var(--primary-gold-20);
--social-hover-shadow: 0 4px 14px var(--black-25);
```

**Files to Update:**
1. `css/core/_base.css` - body gradient
2. `css/core/_reset.css` - scrollbar gradients
3. `css/components/forms.css` - focus shadow
4. `css/components/social.css` - hover shadow

**Estimated Changes:** ~8 replacements  
**Risk:** Low  
**Test:** Verify gradient rendering, focus states

---

### Phase 3: Add Border & Line Variables ✅ Priority: MEDIUM

**Add to `_variables.css` after radius:**

```css
/* Border Widths */
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 3px;

/* Border Styles (Semantic) */
--border-default: var(--border-width-thin) solid var(--border-accent);
--border-section: var(--border-width-medium) solid var(--border-accent);
--border-accent-heavy: var(--border-width-thick) solid var(--border-accent);
```

**Files to Update:**
1. `css/layout/_layout.css` - header/footer borders
2. `css/pages/music.css` - section borders
3. Any other files with border declarations

**Estimated Changes:** ~6 replacements  
**Risk:** Low  
**Test:** Check border rendering at different scales

---

### Phase 4: Add Typography Enhancements ✅ Priority: MEDIUM

**Add to `_variables.css` after font sizes:**

```css
/* Line Heights */
--line-height-tight: 1;
--line-height-normal: 1.4;
--line-height-relaxed: 1.6;
--line-height-loose: 1.8;

/* Font Weights (if not using custom fonts with specific weights) */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**Files to Update:**
1. `css/components/cards.css` - line-height
2. `css/pages/music.css` - line-height, font-weight
3. `css/components/player.css` - font-weight

**Estimated Changes:** ~5 replacements  
**Risk:** Low  
**Test:** Verify text rendering, readability

---

### Phase 5: Add Player Component Tokens ✅ Priority: HIGH

**Add to `_variables.css` in Components section:**

```css
/* Player Component */
--player-max-width: 800px;
--player-volume-max-width: 650px;

/* Player Controls - Desktop */
--player-control-size: 1.8rem;
--player-control-font: 0.8rem;
--player-play-size: 2.2rem;
--player-play-font: 1rem;

/* Player Controls - Touch Devices */
--player-control-size-touch: 2rem;
--player-play-size-touch: 2.2rem;

/* Player Controls - Mobile */
--player-control-size-mobile: 1.6rem;
--player-control-font-mobile: 0.75rem;
--player-play-size-mobile: 2rem;
--player-play-font-mobile: 0.9rem;

/* Player Progress Bar */
--player-progress-height: 4px;
--player-progress-height-mobile: 6px;
--player-thumb-size: 8px;
--player-thumb-size-mobile: 12px;
--player-volume-thumb-size: 6px;
```

**Files to Update:**
1. `css/components/player.css` - All button sizes, progress bar heights

**Estimated Changes:** ~25 replacements  
**Risk:** Medium - Many interconnected values  
**Test:** Test player on desktop, mobile, and touch devices thoroughly

---

### Phase 6: Add Layout & Component Dimension Tokens ✅ Priority: MEDIUM

**Add to `_variables.css` in Layout section:**

```css
/* Layout Dimensions */
--nav-container-breakpoint: 400px;
--mobile-content-padding-bottom: 200px;

/* Component Dimensions */
--social-icon-container: 44px;
--social-icon-size: 24px;
--button-nav-width: 120px;
--button-nav-min-width: 80px;
--scrollbar-width: 8px;
```

**Files to Update:**
1. `css/layout/_layout.css` - container query, padding
2. `css/components/social.css` - icon sizes
3. `css/components/buttons.css` - nav button widths
4. `css/core/_reset.css` - scrollbar width

**Estimated Changes:** ~10 replacements  
**Risk:** Low-Medium  
**Test:** Responsive layout testing, container queries

---

### Phase 7: Add Transform & Animation Tokens ✅ Priority: LOW

**Add to `_variables.css` in Animation section:**

```css
/* Transform Values */
--transform-lift-sm: translateY(-2px);
--transform-lift-md: translateY(-4px);
--transform-offset-left: translateX(-8px);
--transform-offset-right: translateX(8px);
--animation-slide-distance: 10px;

/* Rotation */
--rotate-180: 180deg;

/* Scale */
--scale-up-sm: scale(1.1);
--scale-up-md: scale(1.2);
```

**Files to Update:**
1. `css/utilities/utilities.css` - fadeIn animation
2. `css/pages/music.css` - play icon transform
3. `css/components/social.css` - hover lift
4. `css/components/player.css` - slider hover, arrow rotation

**Estimated Changes:** ~8 replacements  
**Risk:** Low  
**Test:** Animation smoothness, transform accuracy

---

### Phase 8: Add Opacity Scale ✅ Priority: LOW

**Add to `_variables.css` after animations:**

```css
/* Opacity Scale */
--opacity-invisible: 0;
--opacity-subtle: 0.3;
--opacity-muted: 0.6;
--opacity-dimmed: 0.8;
--opacity-slight: 0.9;
--opacity-full: 1;
```

**Files to Update:**
1. `css/components/buttons.css` - active opacity
2. `css/pages/music.css` - metadata opacity
3. `css/components/player.css` - collapsed states

**Estimated Changes:** ~6 replacements  
**Risk:** Low  
**Test:** Visual transparency rendering

---

## 🎯 Implementation Order (Recommended)

1. **Phase 1** - Alpha/Transparency Colors (HIGH priority, ~15 changes)
2. **Phase 2** - Gradients & Effects (HIGH priority, ~8 changes)
3. **Phase 5** - Player Component Tokens (HIGH priority, ~25 changes)
4. **Phase 3** - Borders (MEDIUM priority, ~6 changes)
5. **Phase 4** - Typography (MEDIUM priority, ~5 changes)
6. **Phase 6** - Layout Dimensions (MEDIUM priority, ~10 changes)
7. **Phase 7** - Transforms & Animations (LOW priority, ~8 changes)
8. **Phase 8** - Opacity Scale (LOW priority, ~6 changes)

**Total Estimated Changes: ~83 replacements across 11 files**

---

## 📊 Impact Summary

### Before Refactor:
- **Total Variables:** 67
- **Hardcoded Values:** ~83 instances
- **Variable Coverage:** ~45% (estimated)

### After Refactor:
- **Total Variables:** ~135 (+68 new)
- **Hardcoded Values:** ~0 (all centralized)
- **Variable Coverage:** ~100%

### Benefits:
✅ **Maintainability:** Single source of truth for all design tokens  
✅ **Consistency:** Reduced risk of mismatched values  
✅ **Scalability:** Easy to add new variants or adjust existing values  
✅ **Theme Support:** Foundation for dark/light theme switching  
✅ **Documentation:** Self-documenting variable names  
✅ **Developer Experience:** Predictable naming convention

### Risks:
⚠️ **Build Size:** Slight increase in CSS size (~1-2KB)  
⚠️ **Complexity:** More variables to maintain  
⚠️ **Browser Support:** CSS variables work IE11+, modern browsers only  
⚠️ **Refactor Time:** ~2-4 hours estimated for full implementation  

---

## 🧪 Testing Checklist

After each phase, verify:

- [ ] **Visual Regression:** No unintended visual changes
- [ ] **Responsive:** Layout works on mobile, tablet, desktop
- [ ] **Interactions:** Hover, focus, active states work correctly
- [ ] **Animations:** Smooth transitions and animations
- [ ] **Player:** Audio player functions correctly on all devices
- [ ] **Forms:** Input fields focus/blur states correct
- [ ] **Accessibility:** Color contrast ratios maintained
- [ ] **Build:** CSS compiles without errors
- [ ] **Production:** Minified CSS size acceptable

---

## 📝 Variable Naming Conventions

### Current Pattern (Keep Consistent):
```css
--{category}-{property}-{variant}: value;
```

### Examples:
- Colors: `--primary-gold-60` (color-variant-opacity)
- Spacing: `--spacing-md` (category-size)
- Components: `--player-control-size` (component-element-property)
- Semantic: `--border-accent-heavy` (purpose-variant)
- States: `--button-hover-bg` (component-state-property)

### Recommended Additions:
- Alpha variants: `--{color}-{opacity-percent}`
- Component tokens: `--{component}-{element}-{property}-{variant}`
- Responsive: `--{property}-mobile` or `--{property}-touch`
- Semantic: `--{purpose}-{variant}`

---

## 🔄 Future Enhancements

### After Centralization Complete:

1. **Theme System:**
   - Create `_themes.css` for light/dark mode variants
   - Use CSS custom property overrides
   - Implement `prefers-color-scheme` media query

2. **Color Scales:**
   - Expand to full opacity scale (10%, 20%, 30%... 100%)
   - Add tint/shade variations
   - HSL-based color manipulation

3. **Responsive Token System:**
   - Fluid typography with clamp()
   - Container query-aware spacing
   - Breakpoint tokens

4. **Component Library:**
   - Document all variables in Storybook or style guide
   - Create usage examples
   - Add visual reference

5. **Build Optimization:**
   - PurgeCSS to remove unused variables
   - Variable tree-shaking
   - Critical CSS extraction

---

## 📚 Reference Files

Files to modify during refactor:

### Core
- `css/core/_variables.css` ⭐ (Main file - add all new variables)
- `css/core/_reset.css` (Phase 1, 2, 6)
- `css/core/_base.css` (Phase 2)

### Layout
- `css/layout/_layout.css` (Phase 3, 6)

### Components
- `css/components/buttons.css` (Phase 6, 8)
- `css/components/cards.css` (Phase 4)
- `css/components/forms.css` (Phase 1, 2)
- `css/components/player.css` (Phase 1, 5, 7, 8)
- `css/components/social.css` (Phase 1, 2, 6, 7)

### Pages
- `css/pages/music.css` (Phase 1, 3, 4, 7, 8)

### Utilities
- `css/utilities/utilities.css` (Phase 7)

---

## ✅ Success Criteria

This refactor is complete when:

1. ✅ All hardcoded color values use CSS variables
2. ✅ All hardcoded spacing/sizing values use CSS variables
3. ✅ All hardcoded border values use CSS variables
4. ✅ All hardcoded typography values use CSS variables
5. ✅ All hardcoded animation values use CSS variables
6. ✅ Build passes without errors
7. ✅ All visual regression tests pass
8. ✅ Production CSS size remains reasonable (<5% increase)
9. ✅ Code review approves changes
10. ✅ Documentation updated

---

## 🚀 Getting Started

**To begin refactoring:**

1. Create a new branch: `git checkout -b refactor/css-centralization`
2. Start with **Phase 1** (highest impact, lowest risk)
3. Add new variables to `_variables.css`
4. Replace hardcoded values one file at a time
5. Run `npm run build:css` after each file
6. Test in browser after each phase
7. Commit frequently with descriptive messages
8. Run full test suite before merging

**Commands:**
```bash
# Build CSS
npm run build:css

# Watch for changes (if available)
npm run watch:css

# Production build
npm run build
```

---

**Document Version:** 1.0  
**Last Updated:** November 5, 2025  
**Estimated Implementation Time:** 2-4 hours  
**Priority:** Medium (Improves maintainability, not urgent for functionality)
