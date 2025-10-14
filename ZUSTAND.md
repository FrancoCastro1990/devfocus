# Zustand en DevFocus

## ¿Qué es Zustand?

Zustand es una librería muy ligera para manejar estado global en aplicaciones de React. Su filosofía es simple: un "store" centraliza los datos y cualquier componente puede leerlos o actualizarlos sin tener que pasar props manualmente. No hay reducers complicados ni boilerplate; solo funciones normales de JavaScript.

## Conceptos básicos

- **Store:** función creada con `create()` que devuelve hooks como `useTaskStore`. Cada store guarda un estado inicial y funciones para modificarlo.
- **Set:** función que ofrece Zustand dentro del store. `set()` recibe un nuevo estado (o un callback que usa el estado anterior) y actualiza la tienda de forma inmutable.
- **Selector:** cuando usamos el hook en un componente, podemos leer solo el fragmento de estado que necesitamos (`const tasks = useTaskStore((state) => state.tasks)`), evitando renderizados innecesarios.

Un store típico luce así:

```ts
import { create } from 'zustand';

type CounterStore = {
  count: number;
  increment: () => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## Cómo lo aplicamos en DevFocus

En DevFocus usamos tres stores principales ubicados en `src/features`:

1. **`useTaskStore` (`src/features/tasks/store/taskStore.ts`)**
   - Guarda el listado de tareas (`tasks`) y la tarea abierta actualmente (`currentTask`).
   - Expone acciones simples: `setTasks`, `addTask`, `updateTask`, `removeTask` y `setCurrentTask`.
   - Desde los componentes y hooks (`useTasks`, `useTaskActions`, `App.tsx`) llamamos estas acciones después de ejecutar comandos de Tauri (crear, actualizar o eliminar tareas). Así mantenemos la UI sincronizada con la base de datos.

2. **`useSubtaskStore` (`src/features/subtasks/store/subtaskStore.ts`)**
   - Mantiene quién es la subtarea activa y la sesión de tiempo asociada (`activeSubtaskId`, `activeSession`).
   - Expone `setActiveSubtask`, `updateSession` y `updateSessionDuration` para cuando iniciamos, pausamos o completamos una subtarea. `App.tsx` usa estas funciones cada vez que llegan datos nuevos desde los comandos de Tauri.

3. **`useCategoryStore` (`src/features/categories/store/categoryStore.ts`)** ⭐ NUEVO
   - Gestiona las categorías disponibles (`categories`) y sus estadísticas (`categoryStats`).
   - Maneja las animaciones de XP ganado (`activeXpGains`) que aparecen mientras trabajas.
   - Expone acciones: `setCategories`, `addCategory`, `setCategoryStats`, `addXpGainAnimation` y `removeXpGainAnimation`.
   - Se actualiza cuando cargas categorías desde el backend o cuando ganas XP trabajando en subtareas categorizadas.
   - Las animaciones se agregan cada 5 segundos durante el trabajo activo y se eliminan automáticamente después de 2 segundos.

### Flujo básico dentro de la app

1. Un componente o hook llama a un comando de Tauri (por ejemplo `createTask`).
2. Cuando el backend responde, se actualiza el store correspondiente con una acción (`addTask`, `setCurrentTask`, etc.).
3. Cualquier componente que use el hook del store recibe el nuevo estado automáticamente y React vuelve a renderizar solo las partes necesarias.

Este patrón mantiene el código limpio: el estado central vive en los stores y la UI solo se preocupa por leer datos y disparar acciones. Además, al compartir el mismo store, evitamos pasar props a través de múltiples niveles cuando varios componentes necesitan los mismos datos.

## Flujo del Sistema de Categorías y XP

El sistema de categorías introduce un flujo adicional que combina estado local y global:

### 1. Cargar Categorías
```ts
// En useCategories hook
const { categories, setCategories } = useCategoryStore();

useEffect(() => {
  const data = await listCategories(); // Comando Tauri
  setCategories(data); // Actualiza el store
}, []);
```

### 2. Crear Subtarea con Categoría
```ts
// El usuario selecciona una categoría en CategorySelector
// Se pasa el categoryId al crear la subtarea
const subtask = await createSubtask(taskId, title, categoryId);
// La subtarea ahora tiene una categoría asociada
```

### 3. Trabajar y Ganar XP
```ts
// Cuando una subtarea con categoría está activa (en App.tsx)
useEffect(() => {
  if (subtask.status === 'in_progress' && subtask.category) {
    const interval = setInterval(() => {
      // Agregar animación de +5 XP cada 5 segundos
      addXpGainAnimation({
        id: `xp-${Date.now()}`,
        categoryName: subtask.category.name,
        categoryColor: subtask.category.color,
        xpAmount: 5,
        timestamp: Date.now(),
      });
    }, 5000);
    return () => clearInterval(interval);
  }
}, [activeSubtaskId, currentTask]);
```

### 4. Mostrar Animaciones
```ts
// En XpGainPopup component
const { activeXpGains, removeXpGainAnimation } = useCategoryStore();

// Auto-remove después de 2 segundos
useEffect(() => {
  if (activeXpGains.length > 0) {
    const timer = setTimeout(() => {
      removeXpGainAnimation(activeXpGains[0].id);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [activeXpGains]);
```

### 5. Completar y Actualizar Stats
```ts
// Al completar una subtarea
await completeSubtask(subtaskId, duration);
// El backend calcula: xp_gained = duration_seconds
// El backend actualiza category_experience automáticamente
// Luego refrescamos el dashboard
const stats = await getAllCategoryStats();
setCategoryStats(stats);
```

### Beneficios de este Enfoque

- **Separación de responsabilidades**: Cada store maneja su dominio (tareas, subtareas, categorías)
- **Animaciones desacopladas**: Las animaciones de XP se gestionan independientemente del timer
- **Rendimiento optimizado**: Solo los componentes que usan `useCategoryStore` se re-renderizan con cambios de categorías
- **Estado predecible**: Las fuentes de verdad son claras (backend → store → UI)
