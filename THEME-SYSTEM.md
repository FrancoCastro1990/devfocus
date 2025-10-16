# 🎨 DevFocus Theme System - Tailwind v4

## Overview

DevFocus soporta **múltiples themes alternables** usando el sistema moderno de Tailwind CSS v4 con la directiva `@theme`.

### Themes Disponibles

1. **Liquid Glass** (Default) - Tema moderno con efectos de vidrio y gradientes pastel
2. **Retro Terminal** - Tema estilo CRT vintage con phosphor green y efectos de terminal

El sistema usa CSS Variables y el atributo `data-theme` en el elemento HTML para alternar entre themes sin recargar la página.

---

## 🔄 Cambiar de Theme

### En la UI
Haz clic en el botón con el icono de paleta (🎨) en la barra de tareas. El botón muestra el theme actual ("Glass" o "Retro").

### Programáticamente
```tsx
import { useTheme } from './shared/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('retro')}>Use Retro</button>
      <button onClick={() => setTheme('glass')}>Use Glass</button>
    </div>
  );
}
```

### Persistencia
El theme seleccionado se guarda automáticamente en `localStorage` y se restaura al recargar la aplicación.

---

## 📐 Arquitectura

### Antes (v3 style) ❌
```
tailwind.config.js (100+ líneas)
  ├── colors: { ... }
  ├── fonts: { ... }
  ├── shadows: { ... }
  └── animations: { ... }
```

### Ahora (v4 style) ✅
```
src/index.css
  ├── @theme { ... }          → Variables del tema
  ├── @utility { ... }        → Utilidades personalizadas
  └── Custom CSS              → Estilos específicos

tailwind.config.js (minimal)
  ├── content: [ ... ]
  └── theme: {}
```

---

## 🎨 Variables del Theme

Todas las variables están definidas en `@theme` en `src/index.css`.

### Colores

#### Glass Backgrounds
```css
--color-glass-primary: rgba(255, 255, 255, 0.08)
--color-glass-secondary: rgba(255, 255, 255, 0.05)
--color-glass-tertiary: rgba(255, 255, 255, 0.12)
--color-glass-border: rgba(255, 255, 255, 0.18)
--color-glass-hover: rgba(255, 255, 255, 0.15)
```

**Uso en Tailwind:**
```tsx
<div className="bg-glass-primary border-glass-border">
  Glass panel
</div>
```

#### Panel Variants
```css
--color-panel-base: rgba(255, 255, 255, 0.15)
--color-panel-hover: rgba(255, 255, 255, 0.25)
--color-panel-border: rgba(255, 255, 255, 0.35)
--color-panel-border-hover: rgba(255, 255, 255, 0.45)
```

**Uso en Tailwind:**
```tsx
<div className="bg-panel-base border-panel-border hover:bg-panel-hover">
  Interactive panel
</div>
```

#### Input Variants
```css
--color-input-base: rgba(255, 255, 255, 0.15)
--color-input-hover: rgba(255, 255, 255, 0.25)
--color-input-focus: rgba(255, 255, 255, 0.25)
--color-input-border: rgba(255, 255, 255, 0.35)
--color-input-border-hover: rgba(255, 255, 255, 0.45)
--color-input-border-focus: rgba(147, 197, 253, 0.6)
--color-input-placeholder: rgba(255, 255, 255, 0.45)
--color-input-focus-ring: rgba(147, 197, 253, 0.4)
```

**Uso en Tailwind:**
```tsx
<input className="bg-input-base border-input-border focus:border-input-border-focus" />
```

#### Accent Colors
```css
--color-accent-purple: #a78bfa
--color-accent-purple-light: #c4b5fd
--color-accent-blue: #60a5fa
--color-accent-blue-light: #93c5fd
--color-accent-pink: #f472b6
--color-accent-pink-light: #f9a8d4
--color-accent-indigo: #818cf8
--color-accent-indigo-light: #a5b4fc
--color-accent-emerald: #34d399
--color-accent-emerald-light: #6ee7b7
```

**Uso en Tailwind:**
```tsx
<button className="bg-accent-purple hover:bg-accent-purple-light">
  Purple button
</button>
```

#### Status Colors
```css
/* Todo */
--color-status-todo: rgba(147, 197, 253, 0.2)
--color-status-todo-border: rgba(147, 197, 253, 0.4)
--color-status-todo-text: #93c5fd

/* In Progress */
--color-status-in-progress: rgba(167, 139, 250, 0.2)
--color-status-in-progress-border: rgba(167, 139, 250, 0.4)
--color-status-in-progress-text: #a78bfa

/* Paused */
--color-status-paused: rgba(129, 140, 248, 0.2)
--color-status-paused-border: rgba(129, 140, 248, 0.4)
--color-status-paused-text: #818cf8

/* Done */
--color-status-done: rgba(52, 211, 153, 0.2)
--color-status-done-border: rgba(52, 211, 153, 0.4)
--color-status-done-text: #34d399
```

**Uso en Tailwind:**
```tsx
<div className="bg-status-todo border-status-todo-border text-status-todo-text">
  Todo task
</div>
```

### Shadows

```css
--shadow-glass-sm: 0 2px 8px rgba(0, 0, 0, 0.1)
--shadow-glass: 0 4px 16px rgba(0, 0, 0, 0.15)
--shadow-glass-lg: 0 8px 32px rgba(0, 0, 0, 0.2)
--shadow-glass-xl: 0 12px 48px rgba(0, 0, 0, 0.25)
--shadow-inner-glass: inset 0 1px 2px rgba(255, 255, 255, 0.1)

--shadow-panel: 0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.15), inset 0 -1px 2px rgba(0, 0, 0, 0.1)
--shadow-panel-hover: 0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.15)

--shadow-button: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)
--shadow-button-hover: 0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)
--shadow-button-active: 0 4px 16px rgba(0, 0, 0, 0.2)

--shadow-input: 0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)
--shadow-input-hover: 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25)
--shadow-input-focus: 0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 3px rgba(147, 197, 253, 0.4)
```

**Uso en Tailwind:**
```tsx
<div className="shadow-glass-lg">
  Card with glass shadow
</div>
```

**Uso en CSS custom:**
```css
.my-element {
  box-shadow: var(--shadow-panel);
}
```

### Backdrop Blur

```css
--blur-xs: 4px
--blur-sm: 8px
--blur-md: 12px
--blur-lg: 20px
--blur-xl: 32px
```

**Uso en CSS:**
```css
.glass-element {
  backdrop-filter: blur(var(--blur-md));
}
```

### Fonts

```css
--font-sans: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-display: 'Inter', 'SF Pro Display', sans-serif
```

**Uso en Tailwind:**
```tsx
<h1 className="font-sans">Heading</h1>
<p className="font-display">Display text</p>
```

### Animations

```css
--animate-float-up: float-up 2s ease-out forwards
--animate-xp-popup: xp-popup 2s ease-in-out forwards
--animate-border-sweep: border-sweep 0.4s ease-out forwards
--animate-fade-in: fade-in 0.3s ease-out
--animate-scale-in: scale-in 0.2s ease-out
```

**Uso en HTML:**
```tsx
<div className="animate-float-up">
  Floating XP animation
</div>
```

---

## 🛠️ Custom Utilities

Definidas con `@utility` en `src/index.css`.

### Glass Panel

```tsx
<div className="glass-panel">
  Basic glass panel with hover effect
</div>

<div className="glass-panel glass-panel-interactive">
  Interactive panel with lift on hover
</div>
```

**CSS generado:**
```css
.glass-panel {
  background: var(--color-panel-base);
  border: 1px solid var(--color-panel-border);
  border-radius: 0.75rem;
  backdrop-filter: blur(var(--blur-sm));
  box-shadow: var(--shadow-panel);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-panel:hover {
  background: var(--color-panel-hover);
  border-color: var(--color-panel-border-hover);
  box-shadow: var(--shadow-panel-hover);
}
```

### Glass Button

```tsx
<button className="glass-button">
  Glass button
</button>
```

**Efectos:**
- Hover: Levanta 2px + aumenta brillo
- Active: Scale 0.95

### Glass Input

```tsx
<input className="glass-input" placeholder="Type here..." />

<select className="glass-input">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

**Efectos:**
- Hover: Aumenta brillo
- Focus: Ring azul + levanta 1px

### Status Badges

```tsx
<span className="status-badge status-badge-todo">
  Todo
</span>

<span className="status-badge status-badge-in-progress">
  In Progress
</span>

<span className="status-badge status-badge-done">
  Done
</span>
```

---

## 📝 Ejemplos de Uso

### Panel con Header

```tsx
<div className="glass-panel p-6 space-y-4">
  <h2 className="text-xl font-semibold">Panel Title</h2>
  <p className="text-white/80">Panel content goes here.</p>
</div>
```

### Form con Glass Inputs

```tsx
<form className="glass-panel p-6 space-y-4">
  <div>
    <label className="block mb-2 text-sm font-medium">Name</label>
    <input
      type="text"
      className="glass-input w-full"
      placeholder="Enter your name"
    />
  </div>

  <div>
    <label className="block mb-2 text-sm font-medium">Category</label>
    <select className="glass-input w-full">
      <option>Frontend</option>
      <option>Backend</option>
      <option>Design</option>
    </select>
  </div>

  <button type="submit" className="glass-button w-full">
    Submit
  </button>
</form>
```

### Card con Status

```tsx
<div className="glass-panel glass-panel-interactive p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-semibold">Task Title</h3>
    <span className="status-badge status-badge-in-progress">
      In Progress
    </span>
  </div>
  <p className="text-white/70 text-sm">Task description...</p>
</div>
```

### Splash Screen

El splash screen utiliza el tema liquid glass con diseño simple y profesional:

```tsx
<div className="h-screen w-screen relative flex items-center justify-center overflow-hidden">
  {/* Liquid Glass Background */}
  <div
    className="fixed inset-0 z-0"
    style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundAttachment: 'fixed',
    }}
  />

  {/* Content */}
  <div className="relative z-10 flex flex-col items-center gap-8">
    {/* App Title */}
    <div className="text-center">
      <h1 className="text-6xl font-bold text-white mb-3">
        DevFocus
      </h1>
      <p className="text-white/60 text-sm font-medium tracking-wider uppercase">
        Task Management System
      </p>
    </div>

    {/* Simple Spinner */}
    <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
</div>
```

**Características del Splash Screen:**
- Fondo de gradiente liquid glass
- Diseño minimalista y profesional
- Spinner circular simple con animación
- Duración de 2 segundos antes de mostrar la ventana principal
- Sin efectos excesivos para mantener el profesionalismo

### Usando Variables en CSS Custom

```css
/* En tu componente CSS */
.my-custom-component {
  background: var(--color-glass-primary);
  border: 2px solid var(--color-glass-border);
  box-shadow: var(--shadow-glass);
  backdrop-filter: blur(var(--blur-md));
}

.my-custom-component:hover {
  background: var(--color-glass-hover);
  box-shadow: var(--shadow-glass-lg);
}
```

---

## 🎨 Personalización

### Cambiar Colores del Theme

Edita `src/index.css`:

```css
@theme {
  /* Cambia el color base de los paneles */
  --color-panel-base: rgba(255, 255, 255, 0.20);  /* Más opaco */

  /* Cambia el color de acento principal */
  --color-accent-purple: #9333ea;  /* Purple-600 */

  /* Cambia shadows */
  --shadow-glass-lg: 0 12px 40px rgba(0, 0, 0, 0.3);  /* Más prominente */
}
```

### Agregar Nuevas Variables

```css
@theme {
  /* ... variables existentes ... */

  /* Nueva variable personalizada */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

**Uso:**
```tsx
<div className="bg-success text-white">
  Success message
</div>
```

### Crear Nueva Utility

```css
@utility my-custom-card {
  background: var(--color-panel-base);
  border: 2px solid var(--color-accent-purple);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-glass-lg);

  &:hover {
    transform: scale(1.02);
    box-shadow: var(--shadow-glass-xl);
  }
}
```

**Uso:**
```tsx
<div className="my-custom-card">
  Custom styled card
</div>
```

---

## 🔄 Migración desde el Sistema Anterior

### Antes (hardcoded)
```tsx
<div style={{
  background: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.35)',
  borderRadius: '0.75rem',
  backdropFilter: 'blur(8px)',
}}>
  Content
</div>
```

### Ahora (usando theme)
```tsx
<div className="glass-panel">
  Content
</div>
```

### Antes (tailwind.config.js)
```js
theme: {
  extend: {
    colors: {
      'glass-primary': 'rgba(255, 255, 255, 0.08)',
    }
  }
}
```

### Ahora (index.css)
```css
@theme {
  --color-glass-primary: rgba(255, 255, 255, 0.08);
}
```

---

## ✅ Beneficios del Nuevo Sistema

1. **Centralizado**: Todo en un solo archivo (`index.css`)
2. **Type-safe**: Tailwind genera clases automáticamente
3. **IntelliSense**: Autocompletado en VSCode
4. **Fácil de mantener**: Cambios en un solo lugar
5. **CSS Variables**: Accesibles en JavaScript
6. **Performance**: Menos archivos de config
7. **Moderno**: Siguiendo las best practices de Tailwind v4

---

## 📚 Referencia Completa

### Todas las Utilities Disponibles

| Utility | Descripción |
|---------|-------------|
| `glass-panel` | Panel base con efecto glass |
| `glass-panel-interactive` | Agrega efecto lift al hover |
| `glass-button` | Botón con efecto glass |
| `glass-input` | Input/Select con efecto glass |
| `status-badge` | Badge base |
| `status-badge-todo` | Badge azul (todo) |
| `status-badge-in-progress` | Badge púrpura (in progress) |
| `status-badge-done` | Badge verde (done) |

### Todas las Clases de Color

**Glass:**
- `bg-glass-primary`, `border-glass-border`, `bg-glass-hover`, etc.

**Panel:**
- `bg-panel-base`, `bg-panel-hover`, `border-panel-border`, etc.

**Input:**
- `bg-input-base`, `border-input-border`, `border-input-border-focus`, etc.

**Accent:**
- `bg-accent-purple`, `text-accent-blue`, `border-accent-pink`, etc.

**Status:**
- `bg-status-todo`, `text-status-in-progress-text`, `border-status-done-border`, etc.

### Todas las Clases de Shadow

- `shadow-glass-sm`
- `shadow-glass`
- `shadow-glass-lg`
- `shadow-glass-xl`
- `shadow-inner-glass`

### Todas las Animaciones

- `animate-float-up` (XP floating)
- `animate-xp-popup` (XP popup)
- `animate-border-sweep` (Border sweep effect)
- `animate-fade-in` (Fade in)
- `animate-scale-in` (Scale in)

---

## 🌟 Retro Terminal Theme

El tema retro emula terminales CRT clásicos con:

### Características Visuales
- ✅ Background negro profundo (`#0a0e0f`)
- ✅ Phosphor green text (`#00ff80`)
- ✅ Efecto de scanlines CRT
- ✅ Text glow (resplandor de texto)
- ✅ Border glow en paneles
- ✅ Fuentes monospace (IBM Plex Mono, JetBrains Mono)
- ✅ Shadows tipo glow en lugar de shadows normales

### Diferencias con Liquid Glass

| Aspecto | Liquid Glass | Retro Terminal |
|---------|-------------|----------------|
| Background | Gradiente púrpura-rosa | Negro sólido (#0a0e0f) |
| Colores primarios | Pasteles suaves | Phosphor green (#00ff80) |
| Fuentes | Inter (sans-serif) | IBM Plex Mono (monospace) |
| Efectos | Blur glass | Scanlines + glow |
| Shadows | Drop shadows normales | Glow shadows |
| Status colors | Azul, púrpura, verde | Cyan, green, amber |

### Variables Sobrescritas

Cuando `data-theme="retro"` está activo, se sobrescriben estas variables:

```css
[data-theme="retro"] {
  /* Panels con estilo terminal oscuro */
  --color-panel-base: rgba(17, 21, 24, 0.95);
  --color-panel-border: rgba(0, 255, 128, 0.4);

  /* Inputs con borders phosphor */
  --color-input-border: rgba(0, 255, 128, 0.5);
  --color-input-border-focus: rgba(0, 255, 128, 0.9);

  /* Status colors estilo terminal */
  --color-status-todo-text: #00ffff;  /* Cyan */
  --color-status-in-progress-text: #00ff80;  /* Green */
  --color-status-paused-text: #ffc300;  /* Amber */
  --color-status-done-text: #00cc66;  /* Green dark */

  /* Shadows tipo glow */
  --shadow-glass: 0 0 16px rgba(0, 255, 128, 0.25);
  --shadow-panel: 0 0 16px rgba(0, 255, 128, 0.2);

  /* Fuentes monospace */
  --font-sans: 'IBM Plex Mono', 'JetBrains Mono', monospace;
}
```

---

## 🎯 Crear un Nuevo Theme

### Paso 1: Define las Variables

En `src/index.css`, agrega un nuevo bloque `[data-theme="mi-theme"]`:

```css
[data-theme="mi-theme"] {
  /* Sobrescribe las variables necesarias */
  --color-panel-base: /* tu color */;
  --color-panel-border: /* tu color */;
  /* ... más variables ... */
}
```

### Paso 2: Agrega Estilos Específicos (opcional)

```css
[data-theme="mi-theme"] body {
  background: /* tu background */;
  color: /* tu color de texto */;
}
```

### Paso 3: Actualiza el ThemeContext

En `src/shared/contexts/ThemeContext.tsx`:

```tsx
export type Theme = 'glass' | 'retro' | 'mi-theme';
```

### Paso 4: Actualiza el ThemeToggle

Si quieres más de 2 themes, modifica `ThemeToggle.tsx` para usar un dropdown en lugar de toggle:

```tsx
<select
  value={theme}
  onChange={(e) => setTheme(e.target.value as Theme)}
  className="glass-input"
>
  <option value="glass">Glass</option>
  <option value="retro">Retro</option>
  <option value="mi-theme">Mi Theme</option>
</select>
```

---

## 🛠️ Archivos del Sistema de Themes

| Archivo | Responsabilidad |
|---------|----------------|
| `src/index.css` | Definición de themes con `@theme` y `[data-theme]` |
| `src/shared/contexts/ThemeContext.tsx` | Context + Provider para manejar el theme actual |
| `src/shared/components/ThemeToggle.tsx` | Componente UI para cambiar theme |
| `src/main.tsx` | Envuelve la app con `<ThemeProvider>` |
| `src/App.tsx` | Usa `<ThemeToggle />` en la UI |

---

## 🌟 Componentes que Usan el Theme

### Splash Screen
- **Ubicación**: `src/features/splash/components/SplashScreen.tsx`
- **Theme**: Liquid Glass (siempre, no cambia con theme toggle)
- **Características**: Gradiente púrpura-rosa, tipografía clean, spinner minimalista

### Main Application
- **Ubicación**: `src/App.tsx` y componentes de features
- **Theme**: Switchable (Glass / Retro)
- **Componente Toggle**: `<ThemeToggle />` en barra de tareas

### Additional Windows
- **General Summary**, **Task Summary**, **Subtask Tracker**
- **Theme**: Heredan el theme seleccionado via ThemeProvider
- **Sincronización**: Automática al cambiar theme

---

**Última actualización**: 2025-10-15
**Versión**: 2.2
**Tailwind CSS**: v4.1
**Themes**: Liquid Glass + Retro Terminal
**Nuevas Features**: Splash Screen con liquid glass theme
