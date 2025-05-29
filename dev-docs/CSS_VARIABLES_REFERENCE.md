# CSS Variables Quick Reference Guide
**Nick Vuci Website Design Token System**  
**Updated:** May 29, 2025

## 🎨 **Color Palette Variables**

| Variable | Value | Usage |
|----------|-------|-------|
| `--primary-gold` | #e9c46a | Primary brand color, buttons, highlights |
| `--secondary-teal` | #a8dadc | Secondary text, subtle accents |
| `--accent-orange` | #f4a261 | Active states, hover effects |
| `--accent-red` | #e76f51 | Error states, special emphasis |
| `--dark-bg` | #1e1f26 | Main background, dark surfaces |
| `--darker-bg` | #283c63 | Deeper background areas |
| `--text-light` | #f0f0f0 | Primary text color |
| `--text-secondary` | #a8dadc | Secondary text, muted content |
| `--bg-overlay` | rgba(30, 31, 38, 0.95) | Modal backgrounds, overlays |
| `--border-accent` | rgba(233, 196, 106, 0.3) | Subtle borders, dividers |

## 📝 **Typography Scale**

| Variable | Value | Pixels @ 16px Base | Usage |
|----------|-------|-------------------|-------|
| `--font-size-xs` | 0.7em | 11.2px | Fine print, captions |
| `--font-size-sm` | 0.8em | 12.8px | Small text, metadata |
| `--font-size-base` | 1em | 16px | Body text, default size |
| `--font-size-md` | 1.1em | 17.6px | Slightly emphasized text |
| `--font-size-lg` | 1.2em | 19.2px | Subheadings, important text |
| `--font-size-xl` | 1.5em | 24px | Section headings |
| `--font-size-2xl` | 2em | 32px | Page titles, major headings |
| `--font-size-3xl` | 3em | 48px | Hero text, main titles |

## 📏 **Spacing Scale**

| Variable | Value | Usage |
|----------|-------|-------|
| `--spacing-xs` | 3px | Minimal spacing, fine adjustments |
| `--spacing-sm` | 6px | Small gaps, tight spacing |
| `--spacing-md` | 10px | Default spacing, comfortable gaps |
| `--spacing-lg` | 15px | Larger spacing, section padding |
| `--spacing-xl` | 20px | Major spacing, component separation |
| `--spacing-2xl` | 30px | Large gaps, generous spacing |
| `--spacing-3xl` | 40px | Major section separation |

### **Layout-Specific Spacing**
| Variable | Value | Usage |
|----------|-------|-------|
| `--header-height` | 180px | Desktop header height |
| `--footer-height` | 80px | Desktop footer height |
| `--mobile-footer-height` | 65px | Mobile footer height |
| `--mobile-breakpoint` | 768px | Mobile/desktop breakpoint |

## 🔄 **Border Radius Scale**

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-xs` | 2px | Minimal rounding, subtle edges |
| `--radius-sm` | 3px | Small rounding, compact elements |
| `--radius-md` | 4px | Default rounding, cards |
| `--radius-lg` | 10px | Pronounced rounding, major cards |
| `--radius-xl` | 15px | Heavy rounding, emphasized elements |
| `--radius-circle` | 50% | Perfect circles, round buttons |

## 📚 **Z-Index Scale**

| Variable | Value | Usage |
|----------|-------|-------|
| `--z-base` | 1 | Default stacking level |
| `--z-dropdown` | 100 | Dropdown menus, tooltips |
| `--z-header` | 999 | Site header, navigation |
| `--z-player` | 1000 | Music player overlay |
| `--z-modal` | 9999 | Modal dialogs, overlays |

## ⚡ **Animation & Transitions**

| Variable | Value | Usage |
|----------|-------|-------|
| `--transition-fast` | 0.2s ease | Quick interactions, hover states |
| `--transition-normal` | 0.3s ease | Standard transitions, UI changes |
| `--transition-slow` | 0.5s ease | Deliberate animations, major changes |

## 🌊 **Shadow System**

| Variable | Value | Usage |
|----------|-------|-------|
| `--shadow-light` | 0 4px 10px rgba(0, 0, 0, 0.1) | Subtle elevation, cards |
| `--shadow-medium` | 0 8px 32px rgba(0, 0, 0, 0.3) | Moderate elevation, floating elements |
| `--shadow-heavy` | 0 12px 50px rgba(0, 0, 0, 0.5) | Strong elevation, modals |

## 🧩 **Component Variables**

### **Slider Components**
| Variable | Value | Usage |
|----------|-------|-------|
| `--slider-track-bg` | rgba(168, 218, 220, 0.3) | Slider track background |
| `--slider-thumb-color` | var(--primary-gold) | Slider thumb color |
| `--slider-thumb-size` | 12px | Standard thumb size |
| `--slider-track-radius` | var(--radius-xs) | Track border radius |

### **Button Components**
| Variable | Value | Usage |
|----------|-------|-------|
| `--button-bg` | rgba(233, 196, 106, 0.2) | Default button background |
| `--button-border` | 1px solid var(--primary-gold) | Button border |
| `--button-color` | var(--primary-gold) | Button text color |
| `--button-hover-bg` | var(--primary-gold) | Hover background |
| `--button-hover-color` | var(--dark-bg) | Hover text color |
| `--button-radius` | var(--radius-circle) | Button border radius |

### **Card Components**
| Variable | Value | Usage |
|----------|-------|-------|
| `--card-bg` | rgba(233, 196, 106, 0.2) | Card background |
| `--card-border` | 1px solid var(--primary-gold) | Card border |
| `--card-hover-bg` | var(--primary-gold) | Card hover background |
| `--card-hover-color` | var(--dark-bg) | Card hover text color |
| `--card-transform` | translateY(-2px) | Card hover lift effect |
| `--card-shadow` | var(--shadow-medium) | Card shadow |

## 🎯 **Usage Guidelines**

### **Typography Hierarchy**
```css
.hero-title { font-size: var(--font-size-3xl); }
.page-title { font-size: var(--font-size-2xl); }
.section-title { font-size: var(--font-size-xl); }
.subsection { font-size: var(--font-size-lg); }
.body-text { font-size: var(--font-size-base); }
.small-text { font-size: var(--font-size-sm); }
.caption { font-size: var(--font-size-xs); }
```

### **Spacing Patterns**
```css
.component {
  padding: var(--spacing-lg);           /* Internal spacing */
  margin-bottom: var(--spacing-xl);     /* Component separation */
  gap: var(--spacing-md);               /* Internal gaps */
}
```

### **Color Application**
```css
.primary-element { 
  color: var(--primary-gold);
  background: var(--dark-bg);
}

.secondary-element {
  color: var(--text-secondary);
  background: var(--darker-bg);
}
```

## 🔧 **Custom Property Benefits**

1. **Theme Consistency:** Single source of truth for all design decisions
2. **Easy Customization:** Change entire theme by modifying variables
3. **Scalable Design:** Systematic approach to sizes and spacing
4. **Developer Experience:** Self-documenting variable names
5. **Performance:** Efficient CSS compilation and caching
6. **Maintainability:** Reduces hardcoded values and magic numbers

## 🚀 **Future Enhancements**

### **Potential Phase 3 Additions**
- Additional component-specific variables
- Advanced animation timing functions
- CSS Grid layout variables
- Extended color palette for themes
- Container query variables (future CSS feature)

---
**This reference guide reflects the current design token system established in Phase 2 of the CSS refactoring project.**
