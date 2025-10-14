# DevFocus - Frontend React/TypeScript

Documentación completa de la arquitectura frontend de DevFocus, construida con React 19, TypeScript 5.9 y Tailwind CSS 4.1.

## 📋 Tabla de Contenidos

- [Arquitectura General](#arquitectura-general)
- [Estructura de Archivos](#estructura-de-archivos)
- [Feature-Based Architecture](#feature-based-architecture)
- [State Management](#state-management)
- [Componentes Compartidos](#componentes-compartidos)
- [Hooks Personalizados](#hooks-personalizados)
- [Integración con Tauri](#integración-con-tauri)
- [Styling con Tailwind](#styling-con-tailwind)
- [Features Existentes](#features-existentes)
- [Crear un Nuevo Feature](#crear-un-nuevo-feature)
- [Patrones y Convenciones](#patrones-y-convenciones)
- [Testing](#testing)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

---

## Arquitectura General

### Stack Tecnológico

- **React 19.1**: Biblioteca UI con concurrent features
- **TypeScript 5.9**: Tipado estático y type safety
- **Vite 7.1**: Build tool ultrarrápido
- **Tailwind CSS 4.1**: Utility-first CSS framework
- **Zustand 5.0**: State management minimalista
- **Recharts 3.2**: Gráficos y visualización de datos
- **Tauri API**: Comunicación con backend Rust

### Principios de Diseño

1. **Feature-Based Architecture**: Código organizado por features, no por tipo de archivo
2. **Component Composition**: Componentes pequeños y reutilizables
3. **Type Safety**: TypeScript estricto en toda la aplicación
4. **Declarative UI**: React hooks y programación funcional
5. **Single Source of Truth**: Zustand stores como estado central
6. **Separation of Concerns**: Lógica separada de presentación

### Flujo de Datos

```
User Interaction
       ↓
   Component
       ↓
   Event Handler
       ↓
   Tauri Command (async)
       ↓
   Rust Backend
       ↓
   Update Zustand Store
       ↓
   React Re-render
       ↓
   Updated UI
```

---

## Estructura de Archivos

```
src/
├── features/                      # Features organizados por dominio
│   ├── tasks/
│   │   ├── components/           # Componentes específicos de tasks
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskForm.tsx
│   │   ├── hooks/                # Hooks específicos de tasks
│   │   │   ├── useTasks.ts
│   │   │   └── useTaskActions.ts
│   │   └── store/                # Estado global de tasks
│   │       └── taskStore.ts
│   │
│   ├── subtasks/
│   │   ├── components/
│   │   │   ├── SubtaskList.tsx
│   │   │   └── SubtaskItem.tsx
│   │   └── store/
│   │       └── subtaskStore.ts
│   │
│   ├── categories/               # Sistema de categorías y XP
│   │   ├── components/
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   └── XpGainPopup.tsx
│   │   ├── hooks/
│   │   │   └── useCategories.ts
│   │   └── store/
│   │       └── categoryStore.ts
│   │
│   ├── timer/
│   │   ├── components/
│   │   │   └── SubtaskTrackerWindow.tsx
│   │   └── hooks/
│   │       └── useTimer.ts
│   │
│   └── metrics/
│       └── components/
│           ├── MetricsModal.tsx
│           ├── GeneralSummaryWindow.tsx
│           └── TaskSummaryWindow.tsx
│
├── shared/                       # Código compartido
│   ├── components/              # Componentes reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── types/                   # Definiciones de tipos
│   │   └── common.types.ts
│   └── utils/                   # Funciones de utilidad
│       ├── timeFormatter.ts
│       └── formatDate.ts
│
├── lib/
│   └── tauri/                   # Wrappers de Tauri commands
│       └── commands.ts
│
├── App.tsx                      # Componente raíz
├── main.tsx                     # Entry point
└── index.css                    # Estilos globales
```

### Convenciones de Nomenclatura

- **Componentes**: `PascalCase.tsx` (ej: `TaskList.tsx`)
- **Hooks**: `camelCase.ts` con prefijo `use` (ej: `useTasks.ts`)
- **Stores**: `camelCase.ts` con sufijo `Store` (ej: `taskStore.ts`)
- **Tipos**: `PascalCase` en archivos `.types.ts`
- **Utilidades**: `camelCase.ts` (ej: `timeFormatter.ts`)

---

## Feature-Based Architecture

### ¿Por Qué Feature-Based?

**Problema con estructura tradicional**:
```
❌ src/
   ├── components/  (¡100+ archivos mezclados!)
   ├── hooks/       (¡Difícil encontrar qué es de qué!)
   └── utils/       (¡Todo mezclado!)
```

**Ventajas de Feature-Based**:
- ✅ **Cohesión**: Todo relacionado está junto
- ✅ **Escalabilidad**: Fácil agregar features sin conflictos
- ✅ **Mantenibilidad**: Cambios localizados en un feature
- ✅ **Reutilización**: Compartir features entre proyectos

### Anatomía de un Feature

```
features/mi-feature/
├── components/              # UI específica del feature
│   ├── MiFeatureList.tsx
│   ├── MiFeatureCard.tsx
│   └── MiFeatureForm.tsx
├── hooks/                   # Lógica de negocio
│   ├── useMiFeature.ts
│   └── useMiFeatureActions.ts
└── store/                   # Estado global
    └── miFeatureStore.ts
```

### Principio: Local First, Global When Necessary

```typescript
// ✅ Estado local para UI (no necesita store)
const [isOpen, setIsOpen] = useState(false);

// ✅ Estado global para datos compartidos (usar store)
const { tasks, setTasks } = useTaskStore();
```

---

## State Management

### Zustand: Filosofía Simple

Zustand es minimalista: **un store es solo un hook**.

```typescript
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Usar en componente
const { count, increment } = useMyStore();
```

### Stores Existentes

#### taskStore.ts

**Responsabilidad**: Gestión del listado de tareas y la tarea actual.

```typescript
interface TaskStore {
  tasks: TaskWithActiveSubtask[];
  currentTask: TaskWithSubtasksAndSessions | null;
  setTasks: (tasks: TaskWithActiveSubtask[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setCurrentTask: (task: TaskWithSubtasksAndSessions | null) => void;
}
```

**Cuándo actualizar**:
- Después de crear/actualizar/eliminar tarea
- Al cambiar de vista (lista → detalle)
- Al recibir cambios desde Tauri

#### subtaskStore.ts

**Responsabilidad**: Tracking de la subtarea activa y su sesión de tiempo.

```typescript
interface SubtaskStore {
  activeSubtaskId: string | null;
  activeSession: TimeSession | null;
  setActiveSubtask: (id: string | null, session: TimeSession | null) => void;
  updateSession: (session: TimeSession) => void;
  updateSessionDuration: (duration: number) => void;
}
```

**Cuándo actualizar**:
- Al iniciar/pausar/reanudar/completar una subtarea
- Cada actualización del timer (opcional, para optimización)

#### categoryStore.ts

**Responsabilidad**: Categorías, estadísticas de XP y animaciones.

```typescript
interface CategoryStore {
  categories: Category[];
  categoryStats: CategoryStats[];
  activeXpGains: XpGainAnimation[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  setCategoryStats: (stats: CategoryStats[]) => void;
  addXpGainAnimation: (animation: XpGainAnimation) => void;
  removeXpGainAnimation: (id: string) => void;
}
```

**Cuándo actualizar**:
- Al cargar categorías desde backend
- Cada 5 segundos durante trabajo activo (agregar animación)
- Después de 2 segundos (remover animación)
- Al ver dashboard (cargar stats)

### Patrón de Actualización

```typescript
// 1. Llamar comando Tauri
const task = await createTask(title, description);

// 2. Actualizar store
const { addTask } = useTaskStore();
addTask(task);

// 3. React automáticamente re-renderiza componentes
// que usan el store
```

### Selectores para Performance

```typescript
// ❌ Re-renderiza si CUALQUIER parte del store cambia
const store = useTaskStore();

// ✅ Solo re-renderiza si `tasks` cambia
const tasks = useTaskStore((state) => state.tasks);
```

---

## Componentes Compartidos

### Ubicación

`src/shared/components/`

Estos componentes son:
- **Genéricos**: No conocen el dominio de negocio
- **Reutilizables**: Usados en múltiples features
- **Configurables**: Props para personalizar

### Button.tsx

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
}) => {
  const baseClasses = 'rounded-md font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} disabled:opacity-50`}
    >
      {children}
    </button>
  );
};
```

### Input.tsx

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
```

### Modal.tsx

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
```

---

## Hooks Personalizados

### ¿Cuándo Crear un Hook?

- Lógica reutilizable entre componentes
- Side effects complejos (fetch, suscripciones)
- Abstracción de lógica de negocio

### Patrón de Hook de Datos

```typescript
// features/tasks/hooks/useTasks.ts
export const useTasks = () => {
  const { tasks, setTasks } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
};
```

### Patrón de Hook de Acciones

```typescript
// features/tasks/hooks/useTaskActions.ts
export const useTaskActions = () => {
  const { addTask, updateTask, removeTask, setCurrentTask } = useTaskStore();

  const create = async (title: string, description?: string) => {
    const task = await createTask(title, description);
    addTask(task);
    return task;
  };

  const updateStatus = async (id: string, status: string) => {
    const updated = await updateTaskStatus(id, status);
    updateTask(id, updated);
    return updated;
  };

  const deleteTask = async (id: string) => {
    await deleteTaskCommand(id);
    removeTask(id);
  };

  const loadTaskWithSubtasks = async (id: string) => {
    const task = await getTaskWithSubtasksAndSessions(id);
    setCurrentTask(task);
    return task;
  };

  return { create, updateStatus, deleteTask, loadTaskWithSubtasks };
};
```

### useTimer Hook

```typescript
// features/timer/hooks/useTimer.ts
export const useTimer = ({
  initialSeconds,
  isActive,
}: UseTimerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  return { seconds };
};
```

---

## Integración con Tauri

### Command Wrappers

**Ubicación**: `src/lib/tauri/commands.ts`

**Propósito**: Tipado fuerte y centralización de llamadas.

```typescript
import { invoke } from '@tauri-apps/api/core';
import type { Task, Subtask } from '../../shared/types/common.types';

// Tasks
export const createTask = async (
  title: string,
  description?: string
): Promise<Task> => {
  return await invoke('create_task', { title, description });
};

export const listTasks = async (): Promise<Task[]> => {
  return await invoke('list_tasks');
};

export const updateTaskStatus = async (
  id: string,
  status: string
): Promise<Task> => {
  return await invoke('update_task_status', { id, status });
};

// Subtasks
export const createSubtask = async (
  taskId: string,
  title: string,
  categoryId?: string
): Promise<Subtask> => {
  return await invoke('create_subtask', { taskId, title, categoryId });
};

// Categories
export const listCategories = async (): Promise<Category[]> => {
  return await invoke('list_categories');
};

export const createCategory = async (
  name: string,
  color: string
): Promise<Category> => {
  return await invoke('create_category', { name, color });
};
```

### Event Listening

```typescript
import { listen } from '@tauri-apps/api/event';

useEffect(() => {
  let unlisten: (() => void) | undefined;

  listen<MyPayload>('my-event', (event) => {
    console.log('Received:', event.payload);
    // Actualizar estado
  })
    .then((fn) => {
      unlisten = fn;
    })
    .catch((error) => {
      console.error('Failed to listen:', error);
    });

  return () => {
    unlisten?.();
  };
}, []);
```

### Event Emitting

```typescript
import { emit } from '@tauri-apps/api/event';

const handleAction = async () => {
  await emit('subtask-tracker:updated', {
    action: 'pause',
    subtaskId: id,
  });
};
```

### Window Management

```typescript
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

const openTrackerWindow = async () => {
  const trackerWindow = new WebviewWindow('tracker', {
    url: 'index.html?view=tracker',
    title: 'Tracker',
    width: 340,
    height: 260,
    resizable: false,
    decorations: false,
    alwaysOnTop: true,
  });

  trackerWindow.once('tauri://created', () => {
    console.log('Window created');
  });

  trackerWindow.once('tauri://error', (error) => {
    console.error('Window error:', error);
  });
};
```

---

## Styling con Tailwind

### Tailwind 4.1 Features

DevFocus usa Tailwind CSS 4.1 con el nuevo sistema de imports:

```css
/* index.css */
@import "tailwindcss";
```

### Utility Classes

```typescript
// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">

// Hover & Focus
<button className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">

// Dark mode (cuando se implemente)
<div className="bg-white dark:bg-gray-900">

// Custom animations
<div className="animate-float-up">
```

### Custom Classes

```css
/* index.css */
@keyframes float-up {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translateY(-10px) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateY(-40px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-60px) scale(0.9);
  }
}

.animate-float-up {
  animation: float-up 2s ease-out forwards;
}
```

### Patrón: Componentes con Variantes

```typescript
const Button: React.FC<ButtonProps> = ({ variant = 'primary' }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-200 hover:bg-gray-300',
    success: 'bg-green-600 hover:bg-green-700',
  };

  return (
    <button className={`px-4 py-2 rounded-md ${variants[variant]}`}>
      Click me
    </button>
  );
};
```

---

## Features Existentes

### 1. Task Management

**Componentes**:
- `TaskList`: Grid de tarjetas de tareas
- `TaskCard`: Tarjeta individual con status y acciones
- `TaskForm`: Formulario para crear tareas

**Hooks**:
- `useTasks`: Fetch y listado de tareas
- `useTaskActions`: CRUD operations

**Store**: `taskStore`

### 2. Subtask Management

**Componentes**:
- `SubtaskList`: Lista con formulario de creación
- `SubtaskItem`: Item con timer y controles

**Store**: `subtaskStore`

### 3. Time Tracking

**Componentes**:
- `SubtaskTrackerWindow`: Ventana flotante con timer

**Hooks**:
- `useTimer`: Contador con auto-incremento

### 4. Categories & XP

**Componentes**:
- `CategorySelector`: Dropdown con creación inline
- `CategoryBadge`: Badge coloreado
- `CategoryCard`: Card con level y progress bar
- `XpGainPopup`: Notificaciones animadas

**Hooks**:
- `useCategories`: Fetch de categorías

**Store**: `categoryStore`

### 5. Metrics

**Componentes**:
- `GeneralSummaryWindow`: Dashboard con charts
- `TaskSummaryWindow`: Métricas de tarea específica

**Librerías**:
- Recharts para gráficos

---

## Crear un Nuevo Feature

### Paso 1: Crear Estructura de Carpetas

```bash
mkdir -p src/features/mi-feature/{components,hooks,store}
```

### Paso 2: Definir Tipos

```typescript
// src/shared/types/common.types.ts
export interface MiFeature {
  id: string;
  nombre: string;
  descripcion?: string;
  createdAt: string;
}
```

### Paso 3: Crear Store (si necesario)

```typescript
// src/features/mi-feature/store/miFeatureStore.ts
import { create } from 'zustand';
import type { MiFeature } from '../../../shared/types/common.types';

interface MiFeatureStore {
  items: MiFeature[];
  setItems: (items: MiFeature[]) => void;
  addItem: (item: MiFeature) => void;
  removeItem: (id: string) => void;
}

export const useMiFeatureStore = create<MiFeatureStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}));
```

### Paso 4: Crear Hook de Datos

```typescript
// src/features/mi-feature/hooks/useMiFeature.ts
import { useState, useEffect, useCallback } from 'react';
import { useMiFeatureStore } from '../store/miFeatureStore';
import { listMiFeature } from '../../../lib/tauri/commands';

export const useMiFeature = () => {
  const { items, setItems } = useMiFeatureStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listMiFeature();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [setItems]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { items, loading, error, refetch: fetch };
};
```

### Paso 5: Crear Componentes

```typescript
// src/features/mi-feature/components/MiFeatureList.tsx
import React from 'react';
import { useMiFeature } from '../hooks/useMiFeature';
import { MiFeatureCard } from './MiFeatureCard';

export const MiFeatureList: React.FC = () => {
  const { items, loading, error } = useMiFeature();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <MiFeatureCard key={item.id} item={item} />
      ))}
    </div>
  );
};
```

```typescript
// src/features/mi-feature/components/MiFeatureCard.tsx
import React from 'react';
import type { MiFeature } from '../../../shared/types/common.types';

interface MiFeatureCardProps {
  item: MiFeature;
}

export const MiFeatureCard: React.FC<MiFeatureCardProps> = ({ item }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <h3 className="text-lg font-semibold">{item.nombre}</h3>
      {item.descripcion && (
        <p className="text-gray-600 mt-2">{item.descripcion}</p>
      )}
    </div>
  );
};
```

### Paso 6: Agregar Wrappers Tauri

```typescript
// src/lib/tauri/commands.ts
export const listMiFeature = async (): Promise<MiFeature[]> => {
  return await invoke('list_mi_feature');
};

export const createMiFeature = async (
  nombre: string,
  descripcion?: string
): Promise<MiFeature> => {
  return await invoke('create_mi_feature', { nombre, descripcion });
};
```

### Paso 7: Integrar en App

```typescript
// src/App.tsx
import { MiFeatureList } from './features/mi-feature/components/MiFeatureList';

function App() {
  return (
    <div>
      <MiFeatureList />
    </div>
  );
}
```

---

## Patrones y Convenciones

### 1. Composición de Componentes

```typescript
// ✅ Componentes pequeños y enfocados
<TaskCard task={task} onDelete={handleDelete} />

// ❌ Componentes grandes y monolíticos
<TaskEverything />
```

### 2. Props Interface

```typescript
// ✅ Props tipados y documentados
interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  showActions?: boolean; // Opcional con default
}

// ❌ Props sin tipo
function TaskCard(props: any) { ... }
```

### 3. Event Handlers

```typescript
// ✅ Prefijo 'handle' para handlers
const handleClick = () => { ... };
const handleSubmit = (e: FormEvent) => { ... };

// ✅ Prefijo 'on' para props de callback
<Button onClick={handleClick} />
```

### 4. useState Initialization

```typescript
// ✅ Tipo inferido del valor inicial
const [count, setCount] = useState(0);

// ✅ Tipo explícito cuando necesario
const [user, setUser] = useState<User | null>(null);

// ❌ Estado sin tipo
const [data, setData] = useState();
```

### 5. useEffect Dependencies

```typescript
// ✅ Dependencias correctas
useEffect(() => {
  fetchData(id);
}, [id]);

// ❌ Array vacío cuando hay dependencias
useEffect(() => {
  fetchData(id); // ¡id puede cambiar!
}, []);
```

### 6. Conditional Rendering

```typescript
// ✅ Para elementos simples
{isLoading && <Spinner />}

// ✅ Para condiciones complejas
{isLoading ? <Spinner /> : <Content />}

// ✅ Para múltiples condiciones
{isLoading ? (
  <Spinner />
) : error ? (
  <Error message={error} />
) : (
  <Content data={data} />
)}
```

### 7. Async Operations

```typescript
// ✅ Try-catch para manejo de errores
const handleSubmit = async () => {
  try {
    setLoading(true);
    await createTask(title);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Testing

### Unit Tests con Vitest

```typescript
import { describe, it, expect } from 'vitest';
import { formatTime } from './timeFormatter';

describe('formatTime', () => {
  it('formats seconds correctly', () => {
    expect(formatTime(0)).toBe('00:00:00');
    expect(formatTime(61)).toBe('00:01:01');
    expect(formatTime(3661)).toBe('01:01:01');
  });
});
```

### Component Tests con React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByText('Click')).toBeDisabled();
  });
});
```

### Ejecutar Tests

```bash
npm run test          # Ejecutar todos los tests
npm run test:watch    # Watch mode
npm run test:coverage # Con coverage
```

---

## Performance

### 1. Memo para Componentes Pesados

```typescript
import { memo } from 'react';

export const HeavyComponent = memo(({ data }) => {
  return <div>{/* render costoso */}</div>;
});
```

### 2. useCallback para Funciones

```typescript
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]); // Solo recrea si value cambia
```

### 3. useMemo para Cálculos

```typescript
const expensiveValue = useMemo(() => {
  return calculateSomethingExpensive(data);
}, [data]);
```

### 4. Lazy Loading de Componentes

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}
```

### 5. Virtualization para Listas Largas

```typescript
// Para listas con 1000+ items
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{items[index]}</div>
  )}
</FixedSizeList>
```

---

## Troubleshooting

### Problema: Componente no re-renderiza

**Causa**: Store no está siendo actualizado o selector mal configurado.

**Solución**:
```typescript
// ❌ Mal: no se suscribe a cambios
const store = useTaskStore.getState();

// ✅ Bien: se suscribe correctamente
const { tasks } = useTaskStore();
```

### Problema: "Cannot read property of undefined"

**Causa**: Datos async no han cargado.

**Solución**:
```typescript
// ✅ Verificar existencia antes de acceder
{task?.title}
{task && <div>{task.title}</div>}
```

### Problema: Infinite loop en useEffect

**Causa**: Dependencias incorrectas.

**Solución**:
```typescript
// ❌ Mal: función se recrea cada render
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ Bien: useCallback estabiliza la función
const fetchData = useCallback(async () => {
  // ...
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### Problema: State updates muy lentos

**Causa**: Re-renders innecesarios.

**Solución**:
```typescript
// ✅ Usar selectores específicos
const tasks = useTaskStore((state) => state.tasks);

// ✅ Memoizar componentes pesados
const MemoizedCard = memo(TaskCard);
```

---

## Checklist para Nuevo Feature

- [ ] Estructura de carpetas creada en `features/`
- [ ] Tipos definidos en `shared/types/common.types.ts`
- [ ] Store creado (si necesario) con Zustand
- [ ] Hook de datos implementado (useMiFeature)
- [ ] Hook de acciones implementado (useMiFeatureActions)
- [ ] Componentes creados con tipado correcto
- [ ] Wrappers Tauri agregados en `lib/tauri/commands.ts`
- [ ] Integrado en App.tsx o router
- [ ] Styling con Tailwind aplicado
- [ ] Tests unitarios escritos
- [ ] Documentación actualizada

---

## Recursos Adicionales

### Documentación Oficial

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tauri API](https://tauri.app/v1/api/js/)

### Herramientas de Desarrollo

```bash
# Lint y formateo
npm run lint
npm run format

# Type checking
npm run type-check

# Build
npm run build
npm run preview
```

---

**Última actualización**: 2025-01-14

**Versión React**: 19.1
**Versión TypeScript**: 5.9
**Versión Tailwind**: 4.1
**Versión Zustand**: 5.0
