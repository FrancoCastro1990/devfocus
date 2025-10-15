# 🖥️ DevFocus Retro Terminal Theme

## Overview

DevFocus now features a complete **retro terminal theme** inspired by classic CRT monitors and vintage computing interfaces. The theme combines phosphor green aesthetics, monospace fonts, and CRT-style effects for an immersive developer experience.

---

## 🎨 Color Palette

### Primary Colors

| Color Name | Hex | Usage |
|------------|-----|-------|
| **Background Primary** | `#0a0e0f` | Main app background |
| **Background Secondary** | `#111518` | Cards and panels |
| **Background Tertiary** | `#1a1f23` | Hover states |
| **Phosphor Green 500** | `#00ff80` | Primary text and borders |
| **Phosphor Green 600** | `#00cc66` | Secondary text |
| **Phosphor Green 700** | `#00994d` | Muted elements |

### Accent Colors

| Color Name | Hex | Usage |
|------------|-----|-------|
| **Amber 500** | `#ffc300` | Warnings and highlights |
| **Cyan 500** | `#00ffff` | Special elements |
| **Red 500** | `#ff0000` | Errors and danger |

### Status Colors

| Status | Background | Border | Usage |
|--------|-----------|--------|-------|
| **Todo** | `#2a3f4a` | `#00ff80` | Tasks not started |
| **In Progress** | `#1a3a2a` | `#00ff80` | Active tasks |
| **Paused** | `#3a2f1a` | `#ffc300` | Paused work |
| **Done** | `#1a2f25` | `#00cc66` | Completed tasks |

---

## 🔤 Typography

### Fonts

- **Primary**: IBM Plex Mono
- **Secondary**: JetBrains Mono
- **Fallback**: Fira Code, Courier New, monospace

### Font Styles

```css
/* Headers */
font-family: 'IBM Plex Mono', monospace;
font-weight: 600-700;
text-transform: uppercase;
letter-spacing: 0.05em;

/* Body Text */
font-family: 'IBM Plex Mono', monospace;
font-weight: 400;

/* Code/Data */
font-family: 'JetBrains Mono', monospace;
```

---

## ✨ Visual Effects

### Glow Effects

The theme implements CRT-style glow effects using CSS text shadows and box shadows:

```css
/* Text Glow (subtle) */
text-shadow: 0 0 5px currentColor, 0 0 10px currentColor;

/* Text Glow (strong) */
text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;

/* Border Glow (green) */
box-shadow: 0 0 5px #00ff80, 0 0 10px #00ff80;

/* Border Glow (amber) */
box-shadow: 0 0 5px #ffc300, 0 0 10px #ffc300;
```

### Scanline Effect

A subtle scanline overlay simulates CRT monitor artifacts:

```css
background: repeating-linear-gradient(
  0deg,
  rgba(0, 255, 128, 0.03) 0px,
  transparent 1px,
  transparent 2px,
  rgba(0, 255, 128, 0.03) 3px
);
```

### Flicker Animation

Elements with `animate-flicker` class have a subtle screen flicker effect:

```css
@keyframes flicker {
  0%, 100% { opacity: 1; }
  42% { opacity: 0.8; }
  43% { opacity: 1; }
  46% { opacity: 0.88; }
}
```

---

## 🧩 Component Styles

### Buttons

```tsx
// Primary button (phosphor green)
<Button variant="primary">Action</Button>

// Secondary button (muted green)
<Button variant="secondary">Cancel</Button>

// Danger button (red)
<Button variant="danger">Delete</Button>
```

**Characteristics:**
- 2px solid borders
- Transparent backgrounds
- Uppercase text
- Glow on hover
- Scale effect on active

### Input Fields

```tsx
<Input
  label="Field Name"
  placeholder="Enter value..."
/>
```

**Characteristics:**
- Phosphor green borders
- Semi-transparent backgrounds
- Inner glow on focus
- Monospace font
- Uppercase labels

### Panels/Cards

```tsx
<div className="retro-panel">
  {/* Content */}
</div>
```

**Characteristics:**
- Dark secondary background
- Phosphor green borders (2px)
- Subtle scanline overlay
- Glow shadow effect

### Badges

```tsx
<span className="retro-badge">Status</span>
```

**Characteristics:**
- 1px border with currentColor
- Semi-transparent background
- Uppercase text
- Small size (0.75rem)
- Box shadow glow

---

## 🎯 Icon Integration

The theme uses **Lucide React** icons throughout the app:

### Common Icons

| Icon | Component | Usage |
|------|-----------|-------|
| `Trophy` | GlobalLevelHeader | User level display |
| `Zap` | GlobalLevelHeader | XP indicator |
| `Clock` | TaskCard | Active work timer |
| `CheckCircle2` | TaskCard | Completion status |
| `Trash2` | TaskCard | Delete action |
| `FileQuestion` | TaskList | Empty state |
| `X` | Modal | Close button |

### Usage Example

```tsx
import { Trophy, Zap, Clock } from 'lucide-react';

<Trophy size={20} className="text-phosphor-500" />
<Zap size={24} className="text-amber-retro-500" />
<Clock size={16} className="text-phosphor-600" />
```

---

## 📐 Layout Guidelines

### Spacing

- **Panel padding**: `1.5rem` (p-6)
- **Section gaps**: `1rem` (gap-4)
- **Element spacing**: `0.5rem` (gap-2)

### Borders

- **Primary borders**: `2px solid #00ff80`
- **Secondary borders**: `2px solid #006633`
- **Accent borders**: `2px solid #ffc300`

### Animations

| Animation | Duration | Usage |
|-----------|----------|-------|
| `flicker` | 3s | Screen flicker effect |
| `blink` | 1s | Cursor blink |
| `float-up` | 2s | XP gain notification |
| `ping` | 1s | Active indicator |

---

## 🔧 Customization

### Changing Theme Colors

Edit `src/lib/theme/retro-theme.ts`:

```typescript
export const retroTheme = {
  colors: {
    phosphor: {
      500: '#00ff80',  // Change main green
      // ...
    },
    amber: {
      500: '#ffc300',  // Change accent
      // ...
    }
  }
}
```

### Adjusting Glow Intensity

Edit `tailwind.config.js`:

```javascript
boxShadow: {
  'glow-sm': '0 0 5px currentColor',
  'glow': '0 0 10px currentColor, 0 0 20px currentColor',
  'glow-lg': '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
}
```

### Disabling Scanlines

Remove or comment out in `src/index.css`:

```css
/* CRT Scanline effect overlay */
body::before {
  /* ... */
  display: none; /* Add this to disable */
}
```

---

## 🎨 Theme Features

### ✅ Implemented

- [x] Phosphor green color scheme
- [x] Monospace font system (IBM Plex Mono, JetBrains Mono)
- [x] CRT scanline overlay
- [x] Screen flicker animation
- [x] Glow effects (text & borders)
- [x] Retro button styles
- [x] Retro input/textarea styles
- [x] Retro panel/card backgrounds
- [x] Custom scrollbars
- [x] Status color system
- [x] Lucide React icons integration
- [x] ASCII-style borders
- [x] Terminal cursor effects
- [x] Selection highlighting

### 🎯 Best Practices

1. **Always use monospace fonts** for consistency
2. **Apply glow effects sparingly** to avoid visual clutter
3. **Use uppercase text** for headers and labels
4. **Maintain high contrast** for accessibility
5. **Keep animations subtle** to avoid distraction

---

## 📦 Files Modified

### Core Theme Files

- `src/lib/theme/retro-theme.ts` - Theme configuration
- `tailwind.config.js` - Tailwind theme extensions
- `src/index.css` - Global retro styles

### Component Updates

**Shared Components:**
- `src/shared/components/Button.tsx`
- `src/shared/components/Input.tsx`
- `src/shared/components/Modal.tsx`
- `src/shared/components/ConfirmDialog.tsx`

**Feature Components:**
- `src/App.tsx`
- `src/features/tasks/components/TaskList.tsx`
- `src/features/tasks/components/TaskCard.tsx`
- `src/features/subtasks/components/SubtaskList.tsx`
- `src/features/user-profile/components/GlobalLevelHeader.tsx`

---

## 🚀 Usage Tips

### Terminal-Style Headers

```tsx
<h1 className="font-mono font-bold text-phosphor-500 text-glow-strong uppercase tracking-wider">
  [DevFocus]
</h1>
```

### Loading States

```tsx
<div className="retro-panel">
  <p className="text-phosphor-600 font-mono uppercase tracking-wide animate-flicker">
    &gt;&gt; Loading data...
  </p>
</div>
```

### Status Indicators

```tsx
<span className="retro-badge text-phosphor-500 uppercase">
  {status}
</span>
```

### Active/Working Elements

```tsx
<div className="border-2 border-phosphor-500 shadow-glow-sm animate-flicker">
  {/* Active content */}
</div>
```

---

## 🎬 Visual Examples

### Header Example
```
┌─────────────────────────────────────┐
│  [DevFocus]                         │
│  > Task Management System v2.0      │
└─────────────────────────────────────┘
```

### Button States
```
Normal:    [ START ]
Hover:     [ START ] ← (glowing)
Active:    [ START ] ← (pressed)
```

### Progress Bar
```
LVL 5                         LVL 6
████████░░░░░░░░░░░░░░░░░░░░  35.2%
2,450 XP needed
```

---

## 📝 Notes

- **Font Loading**: Fonts are loaded from Google Fonts CDN
- **Browser Support**: Modern browsers with CSS3 support required
- **Performance**: Animations are GPU-accelerated for smooth rendering
- **Accessibility**: High contrast ratios maintained for readability

---

## 🔗 Resources

- [IBM Plex Mono Font](https://fonts.google.com/specimen/IBM+Plex+Mono)
- [JetBrains Mono Font](https://fonts.google.com/specimen/JetBrains+Mono)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Generated**: 2025-10-15
**Theme Version**: 1.0
**DevFocus Version**: 2.0
