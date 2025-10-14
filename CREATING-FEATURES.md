# Guía Completa: Crear un Feature en DevFocus

Esta guía te llevará paso a paso a través del proceso completo de agregar un nuevo feature a DevFocus, desde la base de datos hasta la interfaz de usuario.

## 📋 Tabla de Contenidos

- [Overview del Proceso](#overview-del-proceso)
- [Ejemplo Práctico: Sistema de Prioridades](#ejemplo-práctico-sistema-de-prioridades)
- [Fase 1: Backend (Rust/Tauri)](#fase-1-backend-rusttauri)
- [Fase 2: Frontend (React/TypeScript)](#fase-2-frontend-reacttypescript)
- [Fase 3: Integración y Testing](#fase-3-integración-y-testing)
- [Checklist Final](#checklist-final)
- [Tips y Best Practices](#tips-y-best-practices)

---

## Overview del Proceso

### Flujo Completo

```
1. BACKEND (Rust)
   ├─ Definir modelo de datos
   ├─ Crear tabla en SQLite
   ├─ Implementar comandos Tauri
   └─ Registrar comandos

2. FRONTEND (TypeScript/React)
   ├─ Definir tipos TypeScript
   ├─ Crear wrappers de comandos
   ├─ Implementar store Zustand
   ├─ Crear componentes UI
   └─ Integrar en la app

3. TESTING & INTEGRATION
   ├─ Probar flujo completo
   ├─ Verificar persistencia
   └─ Testing de edge cases
```

### Tiempo Estimado

- **Feature Simple** (CRUD básico): 2-3 horas
- **Feature Medio** (con lógica de negocio): 4-6 horas
- **Feature Complejo** (con relaciones múltiples): 8+ horas

---

## Ejemplo Práctico: Sistema de Prioridades

Vamos a implementar un sistema de prioridades para tareas con los siguientes requisitos:

**Requisitos**:
- 3 niveles: Low, Medium, High
- Colores visuales para cada nivel
- Asignable a tareas y subtareas
- Filtrado por prioridad
- Default: Medium

**Features**:
- Ver prioridad en cards de tareas
- Cambiar prioridad con dropdown
- Badge con color correspondiente
- Filtro en lista principal

---

## Fase 1: Backend (Rust/Tauri)

### Paso 1.1: Definir el Modelo

**Archivo**: `src-tauri/src/models.rs`

```rust
// Agregar al final del archivo

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Priority {
    pub id: String,
    pub name: String,        // "Low", "Medium", "High"
    pub level: i32,          // 1, 2, 3 (para ordenamiento)
    pub color: String,       // Hex color
}

// Implementación de helpers si es necesario
impl Priority {
    pub fn default() -> Self {
        Self {
            id: "medium".to_string(),
            name: "Medium".to_string(),
            level: 2,
            color: "#f59e0b".to_string(),
        }
    }
}
```

### Paso 1.2: Actualizar Modelos Existentes

Agregar `priority_id` a Task y Subtask:

```rust
// En struct Task
pub struct Task {
    // ... campos existentes
    pub priority_id: Option<String>,
    pub priority: Option<Priority>,
}

// En struct Subtask
pub struct Subtask {
    // ... campos existentes
    pub priority_id: Option<String>,
    pub priority: Option<Priority>,
}
```

### Paso 1.3: Crear Tabla en Database

**Archivo**: `src-tauri/src/db.rs`

Agregar dentro de `create_tables()`:

```rust
// Tabla de prioridades
conn.execute(
    "CREATE TABLE IF NOT EXISTS priorities (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        level INTEGER NOT NULL,
        color TEXT NOT NULL
    )",
    [],
)?;

// Agregar columna a tasks
migrate_add_priority_to_tasks(conn)?;

// Agregar columna a subtasks
migrate_add_priority_to_subtasks(conn)?;

// Seed de prioridades por defecto
seed_default_priorities(conn)?;
```

### Paso 1.4: Crear Funciones de Migración

Agregar antes de `seed_default_categories()`:

```rust
fn migrate_add_priority_to_tasks(conn: &Connection) -> Result<()> {
    let column_exists: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM pragma_table_info('tasks') WHERE name='priority_id'",
            [],
            |row| row.get::<_, i32>(0),
        )
        .unwrap_or(0)
        > 0;

    if !column_exists {
        conn.execute(
            "ALTER TABLE tasks ADD COLUMN priority_id TEXT DEFAULT 'medium'",
            [],
        )?;
        println!("Migration: Added priority_id to tasks");
    }

    Ok(())
}

fn migrate_add_priority_to_subtasks(conn: &Connection) -> Result<()> {
    let column_exists: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM pragma_table_info('subtasks') WHERE name='priority_id'",
            [],
            |row| row.get::<_, i32>(0),
        )
        .unwrap_or(0)
        > 0;

    if !column_exists {
        conn.execute(
            "ALTER TABLE subtasks ADD COLUMN priority_id TEXT DEFAULT 'medium'",
            [],
        )?;
        println!("Migration: Added priority_id to subtasks");
    }

    Ok(())
}

fn seed_default_priorities(conn: &Connection) -> Result<()> {
    let priorities = vec![
        ("low", "Low", 1, "#22c55e"),      // Verde
        ("medium", "Medium", 2, "#f59e0b"), // Amarillo
        ("high", "High", 3, "#ef4444"),     // Rojo
    ];

    for (id, name, level, color) in priorities {
        conn.execute(
            "INSERT OR IGNORE INTO priorities (id, name, level, color)
             VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![id, name, level, color],
        )?;
    }

    Ok(())
}
```

### Paso 1.5: Implementar Comandos Tauri

**Archivo**: `src-tauri/src/commands.rs`

Agregar al final del archivo:

```rust
// ============================================================================
// Priority Commands
// ============================================================================

#[tauri::command]
pub fn list_priorities(state: State<AppState>) -> Result<Vec<Priority>, String> {
    let conn = state.db.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT id, name, level, color FROM priorities ORDER BY level")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let priorities = stmt
        .query_map([], |row| {
            Ok(Priority {
                id: row.get(0)?,
                name: row.get(1)?,
                level: row.get(2)?,
                color: row.get(3)?,
            })
        })
        .map_err(|e| format!("Query failed: {}", e))?;

    let mut result = Vec::new();
    for priority in priorities {
        result.push(priority.map_err(|e| format!("Row error: {}", e))?);
    }

    Ok(result)
}

#[tauri::command]
pub fn update_task_priority(
    task_id: String,
    priority_id: String,
    state: State<AppState>,
) -> Result<Task, String> {
    let conn = state.db.lock().unwrap();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE tasks SET priority_id = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![&priority_id, &now, &task_id],
    )
    .map_err(|e| format!("Failed to update priority: {}", e))?;

    // Retornar tarea actualizada con prioridad
    conn.query_row(
        "SELECT
            t.id, t.title, t.description, t.status, t.created_at,
            t.updated_at, t.completed_at, t.priority_id,
            p.id, p.name, p.level, p.color
         FROM tasks t
         LEFT JOIN priorities p ON t.priority_id = p.id
         WHERE t.id = ?1",
        [&task_id],
        |row| {
            let priority = if row.get::<_, Option<String>>(8)?.is_some() {
                Some(Priority {
                    id: row.get(8)?,
                    name: row.get(9)?,
                    level: row.get(10)?,
                    color: row.get(11)?,
                })
            } else {
                None
            };

            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                completed_at: row.get(6)?,
                priority_id: row.get(7)?,
                priority,
            })
        },
    )
    .map_err(|e| format!("Failed to get updated task: {}", e))
}

#[tauri::command]
pub fn update_subtask_priority(
    subtask_id: String,
    priority_id: String,
    state: State<AppState>,
) -> Result<Subtask, String> {
    let conn = state.db.lock().unwrap();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE subtasks SET priority_id = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![&priority_id, &now, &subtask_id],
    )
    .map_err(|e| format!("Failed to update priority: {}", e))?;

    // Retornar subtarea actualizada
    // (implementar query similar a update_task_priority)
    // ...

    Ok(Subtask {
        // ... construir subtask
    })
}
```

### Paso 1.6: Actualizar Queries Existentes

Modificar `list_tasks` para incluir prioridades:

```rust
#[tauri::command]
pub fn list_tasks(state: State<AppState>) -> Result<Vec<TaskWithActiveSubtask>, String> {
    let conn = state.db.lock().unwrap();

    let mut stmt = conn.prepare(
        "SELECT
            t.id, t.title, t.description, t.status,
            t.created_at, t.updated_at, t.completed_at,
            t.priority_id,
            p.id, p.name, p.level, p.color,
            s.id as subtask_id, s.title as subtask_title
         FROM tasks t
         LEFT JOIN priorities p ON t.priority_id = p.id
         LEFT JOIN subtasks s ON t.id = s.task_id AND s.status = 'in_progress'
         ORDER BY t.updated_at DESC"
    ).map_err(|e| format!("Failed to prepare: {}", e))?;

    // ... resto del código con mapeo de priority
}
```

### Paso 1.7: Registrar Comandos

**Archivo**: `src-tauri/src/lib.rs`

```rust
.invoke_handler(tauri::generate_handler![
    // ... comandos existentes
    commands::list_priorities,
    commands::update_task_priority,
    commands::update_subtask_priority,
])
```

### Paso 1.8: Verificar Compilación

```bash
cd src-tauri
cargo check
```

Si hay errores, corregir antes de continuar.

---

## Fase 2: Frontend (React/TypeScript)

### Paso 2.1: Definir Tipos TypeScript

**Archivo**: `src/shared/types/common.types.ts`

```typescript
// Agregar al final del archivo

export interface Priority {
  id: string;
  name: string;
  level: number;
  color: string;
}

// Actualizar interfaces existentes
export interface Task {
  // ... campos existentes
  priorityId?: string;
  priority?: Priority;
}

export interface Subtask {
  // ... campos existentes
  priorityId?: string;
  priority?: Priority;
}
```

### Paso 2.2: Crear Wrappers de Comandos

**Archivo**: `src/lib/tauri/commands.ts`

```typescript
// Agregar al final del archivo

// Priorities
export const listPriorities = async (): Promise<Priority[]> => {
  return await invoke('list_priorities');
};

export const updateTaskPriority = async (
  taskId: string,
  priorityId: string
): Promise<Task> => {
  return await invoke('update_task_priority', { taskId, priorityId });
};

export const updateSubtaskPriority = async (
  subtaskId: string,
  priorityId: string
): Promise<Subtask> => {
  return await invoke('update_subtask_priority', { subtaskId, priorityId });
};
```

### Paso 2.3: Crear Store (Opcional)

Si las prioridades se usan mucho, crear un store:

**Archivo**: `src/features/priorities/store/priorityStore.ts`

```typescript
import { create } from 'zustand';
import type { Priority } from '../../../shared/types/common.types';

interface PriorityStore {
  priorities: Priority[];
  setPriorities: (priorities: Priority[]) => void;
}

export const usePriorityStore = create<PriorityStore>((set) => ({
  priorities: [],
  setPriorities: (priorities) => set({ priorities }),
}));
```

### Paso 2.4: Crear Hook de Datos

**Archivo**: `src/features/priorities/hooks/usePriorities.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { usePriorityStore } from '../store/priorityStore';
import { listPriorities } from '../../../lib/tauri/commands';

export const usePriorities = () => {
  const { priorities, setPriorities } = usePriorityStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPriorities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listPriorities();
      setPriorities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch priorities');
    } finally {
      setLoading(false);
    }
  }, [setPriorities]);

  useEffect(() => {
    fetchPriorities();
  }, [fetchPriorities]);

  return { priorities, loading, error, refetch: fetchPriorities };
};
```

### Paso 2.5: Crear Componente Badge

**Archivo**: `src/features/priorities/components/PriorityBadge.tsx`

```typescript
import React from 'react';
import type { Priority } from '../../../shared/types/common.types';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'sm',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${priority.color}20`,
        color: priority.color,
      }}
    >
      {priority.name}
    </span>
  );
};
```

### Paso 2.6: Crear Selector de Prioridad

**Archivo**: `src/features/priorities/components/PrioritySelector.tsx`

```typescript
import React from 'react';
import { usePriorities } from '../hooks/usePriorities';
import type { Priority } from '../../../shared/types/common.types';

interface PrioritySelectorProps {
  value?: string;
  onChange: (priorityId: string) => void;
  disabled?: boolean;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { priorities, loading } = usePriorities();

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <select
      value={value || 'medium'}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {priorities.map((priority) => (
        <option key={priority.id} value={priority.id}>
          {priority.name}
        </option>
      ))}
    </select>
  );
};
```

### Paso 2.7: Integrar en Componentes Existentes

**TaskCard.tsx** - Mostrar prioridad:

```typescript
import { PriorityBadge } from '../../priorities/components/PriorityBadge';

// Dentro del render
{task.priority && <PriorityBadge priority={task.priority} />}
```

**TaskForm.tsx** - Selector al crear tarea:

```typescript
import { PrioritySelector } from '../../priorities/components/PrioritySelector';

const [priorityId, setPriorityId] = useState('medium');

// En el formulario
<PrioritySelector value={priorityId} onChange={setPriorityId} />
```

### Paso 2.8: Actualizar Acciones

**useTaskActions.ts** - Agregar función de update:

```typescript
const updatePriority = async (taskId: string, priorityId: string) => {
  const updated = await updateTaskPriority(taskId, priorityId);
  updateTask(taskId, updated);
  return updated;
};

return { create, updateStatus, deleteTask, updatePriority };
```

### Paso 2.9: Crear Índice de Exportación

**Archivo**: `src/features/priorities/index.ts`

```typescript
export * from './components/PriorityBadge';
export * from './components/PrioritySelector';
export * from './hooks/usePriorities';
export * from './store/priorityStore';
```

---

## Fase 3: Integración y Testing

### Paso 3.1: Testing Manual

1. **Iniciar la aplicación**:
   ```bash
   npm run tauri:dev
   ```

2. **Verificar migraciones**:
   - Buscar en consola: "Migration: Added priority_id to tasks"
   - Buscar en consola: "Migration: Added priority_id to subtasks"

3. **Probar flujo completo**:
   - [ ] Crear tarea nueva con prioridad
   - [ ] Ver badge de prioridad en card
   - [ ] Cambiar prioridad de tarea existente
   - [ ] Crear subtarea con prioridad
   - [ ] Verificar colores correctos
   - [ ] Cerrar y reabrir app (persistencia)

### Paso 3.2: Testing de Database

Inspeccionar directamente la DB:

```bash
# En Windows
sqlite3 "%LOCALAPPDATA%/devfocus/devfocus.db"

# Verificar tabla
.schema priorities

# Ver datos
SELECT * FROM priorities;
SELECT id, title, priority_id FROM tasks;
```

### Paso 3.3: Testing de Edge Cases

- [ ] ¿Qué pasa con tareas antiguas sin prioridad?
- [ ] ¿Se mantiene la prioridad al editar tarea?
- [ ] ¿Funciona el selector cuando no hay conexión?
- [ ] ¿Se ve bien en diferentes tamaños de ventana?

### Paso 3.4: Tests Unitarios (Opcional pero Recomendado)

**Rust**:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_priority_default() {
        let priority = Priority::default();
        assert_eq!(priority.id, "medium");
        assert_eq!(priority.level, 2);
    }
}
```

**TypeScript**:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriorityBadge } from './PriorityBadge';

describe('PriorityBadge', () => {
  it('renders priority name', () => {
    const priority = {
      id: 'high',
      name: 'High',
      level: 3,
      color: '#ef4444',
    };

    render(<PriorityBadge priority={priority} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});
```

### Paso 3.5: Build de Producción

```bash
npm run tauri:build
```

Verificar que no hay errores y que el feature funciona en el build.

---

## Checklist Final

### Backend ✅
- [ ] Modelo definido en `models.rs`
- [ ] Tabla creada en `db.rs`
- [ ] Migraciones implementadas
- [ ] Seed data agregado
- [ ] Comandos implementados en `commands.rs`
- [ ] Comandos registrados en `lib.rs`
- [ ] Queries existentes actualizados
- [ ] `cargo check` pasa sin errores

### Frontend ✅
- [ ] Tipos definidos en `common.types.ts`
- [ ] Wrappers creados en `commands.ts`
- [ ] Store implementado (si necesario)
- [ ] Hook de datos creado
- [ ] Componentes UI implementados
- [ ] Integración en componentes existentes
- [ ] Estilos aplicados con Tailwind
- [ ] `npm run build` pasa sin errores

### Testing ✅
- [ ] Flujo completo probado manualmente
- [ ] Database inspeccionada
- [ ] Edge cases verificados
- [ ] Tests unitarios escritos (opcional)
- [ ] Build de producción exitoso

### Documentación ✅
- [ ] README actualizado (si es feature mayor)
- [ ] Comentarios en código complejo
- [ ] Tipos bien documentados con JSDoc/comentarios

---

## Tips y Best Practices

### 1. Empezar con el Backend

Siempre implementa primero el backend. Es más difícil cambiar el schema de DB después.

### 2. Migraciones Siempre

```rust
// ✅ SIEMPRE verificar si columna existe
let column_exists = /* check pragma_table_info */;
if !column_exists {
    // agregar columna
}

// ❌ NUNCA asumir que no existe
conn.execute("ALTER TABLE ...", [])?;
```

### 3. Default Values

Proveer defaults sensatos para compatibilidad:

```rust
// En migración
"ALTER TABLE tasks ADD COLUMN priority_id TEXT DEFAULT 'medium'"

// En modelo
pub fn default() -> Self { ... }
```

### 4. Tipos Opcionales

Usar `Option<T>` para campos que pueden no existir:

```rust
pub priority_id: Option<String>,  // Puede ser NULL en DB
```

```typescript
priority?: Priority;  // Puede no estar presente
```

### 5. Queries con LEFT JOIN

Para relaciones opcionales:

```sql
SELECT
    t.*,
    p.id, p.name, p.level, p.color
FROM tasks t
LEFT JOIN priorities p ON t.priority_id = p.id
```

### 6. Naming Consistency

```rust
// Backend
priority_id  (snake_case)
```

```typescript
// Frontend
priorityId   (camelCase)
```

Serde convierte automáticamente con `#[serde(rename_all = "camelCase")]`

### 7. Error Handling Robusto

```rust
conn.execute(...)
    .map_err(|e| format!("Descriptive error: {}", e))?;
```

```typescript
try {
  await command();
} catch (error) {
  console.error('Context:', error);
  setError(error instanceof Error ? error.message : 'Unknown error');
}
```

### 8. Performance

- Agregar índices para columnas frecuentemente consultadas
- Usar selectores específicos en Zustand
- Memoizar componentes pesados con `React.memo`

### 9. Mantener DRY

Si repites código, crear helpers:

```rust
// Helper para construir Priority desde row
fn priority_from_row(row: &Row, offset: usize) -> Result<Option<Priority>> {
    if row.get::<_, Option<String>>(offset)?.is_some() {
        Ok(Some(Priority {
            id: row.get(offset)?,
            name: row.get(offset + 1)?,
            level: row.get(offset + 2)?,
            color: row.get(offset + 3)?,
        }))
    } else {
        Ok(None)
    }
}
```

### 10. Commits Incrementales

```bash
git add src-tauri/src/models.rs
git commit -m "feat(priorities): add Priority model"

git add src-tauri/src/db.rs
git commit -m "feat(priorities): create priorities table and migrations"

# ... etc
```

---

## Recursos Adicionales

### Documentación del Proyecto

- `README.md` - Overview general
- `FRONTEND-ARCHITECTURE.md` - Arquitectura frontend detallada
- `src-tauri/RUST-BACKEND.md` - Arquitectura backend detallada
- `ZUSTAND.md` - State management con Zustand

### Referencias Externas

- [Tauri Commands](https://tauri.app/v1/guides/features/command)
- [rusqlite Documentation](https://docs.rs/rusqlite/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Ejemplos en el Proyecto

Estudiar features existentes como referencia:

- **Simple**: `categories/` - CRUD básico
- **Medio**: `subtasks/` - Con relaciones
- **Complejo**: `metrics/` - Con agregaciones y cálculos
- **Integración de Sistema**: `tray-icon` - Integración con OS (ejemplo completo abajo)

---

## Ejemplo Completo: Sistema de Tray Icon

Este es un ejemplo real de un feature implementado recientemente en DevFocus que integra funcionalidad del sistema operativo.

### Requisitos del Feature

**Objetivo**: Agregar integración con el system tray del OS para permitir que la app se minimice y siga ejecutándose en segundo plano.

**Características**:
- Icono en la bandeja del sistema (system tray)
- Menú contextual con opciones: Show/Hide, Open Summary, Quit
- Botón "Minimize to Tray" en la interfaz principal
- Click izquierdo en icono para mostrar/ocultar ventana

### Implementación Paso a Paso

#### Backend (Rust/Tauri)

**1. Agregar dependencia en Cargo.toml:**
```toml
[dependencies]
tauri = { version = "2.8.5", features = ["tray-icon"] }
```

**2. Configurar tray icon en lib.rs:**
```rust
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::Manager;

// En la función setup()
// Crear menú del tray
let show_hide = MenuItem::with_id(app, "show_hide", "Show/Hide", true, None::<&str>)?;
let open_summary = MenuItem::with_id(app, "open_summary", "Open Summary", true, None::<&str>)?;
let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

let menu = Menu::with_items(
  app,
  &[
    &show_hide,
    &PredefinedMenuItem::separator(app)?,
    &open_summary,
    &PredefinedMenuItem::separator(app)?,
    &quit,
  ],
)?;

// Crear tray icon con event handlers
let _tray = TrayIconBuilder::new()
  .icon(app.default_window_icon().unwrap().clone())
  .menu(&menu)
  .show_menu_on_left_click(false)
  .on_tray_icon_event(|tray, event| {
    if let TrayIconEvent::Click {
      button: MouseButton::Left,
      button_state: MouseButtonState::Up,
      ..
    } = event
    {
      let app = tray.app_handle();
      if let Some(window) = app.get_webview_window("main") {
        let _ = if window.is_visible().unwrap_or(false) {
          window.hide()
        } else {
          window.show().and_then(|_| window.set_focus())
        };
      }
    }
  })
  .on_menu_event(|app, event| match event.id.as_ref() {
    "show_hide" => { /* toggle window */ },
    "open_summary" => { /* open summary window */ },
    "quit" => { app.exit(0); },
    _ => {}
  })
  .build(app)?;
```

**3. Agregar comandos Tauri en commands.rs:**
```rust
use tauri::Manager;

#[tauri::command]
pub fn minimize_to_tray(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn restore_from_tray(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

**4. Registrar comandos en lib.rs:**
```rust
.invoke_handler(tauri::generate_handler![
    // ... otros comandos
    commands::minimize_to_tray,
    commands::restore_from_tray,
])
```

#### Frontend (React/TypeScript)

**5. Crear wrappers en commands.ts:**
```typescript
// Tray Icon Commands
export const minimizeToTray = async (): Promise<void> => {
  return await invoke('minimize_to_tray');
};

export const restoreFromTray = async (): Promise<void> => {
  return await invoke('restore_from_tray');
};
```

**6. Agregar botón en App.tsx:**
```typescript
const handleMinimizeToTray = async () => {
  if (!isTauri) return;
  try {
    await commands.minimizeToTray();
  } catch (error) {
    console.error('Error minimizing to tray:', error);
  }
};

// En el render:
<Button variant="secondary" onClick={handleMinimizeToTray}>
  Minimize to Tray
</Button>
```

### Archivos Modificados

```
src-tauri/
├── Cargo.toml                    # Agregada feature "tray-icon"
├── src/
│   ├── lib.rs                    # Configuración del tray icon y menú
│   └── commands.rs               # Comandos minimize_to_tray y restore_from_tray

src/
├── lib/tauri/commands.ts         # Wrappers TypeScript
└── App.tsx                       # Botón "Minimize to Tray"
```

### Lecciones Aprendidas

**1. Features de Tauri**: Algunas funcionalidades requieren agregar features específicos en Cargo.toml

**2. Trait Manager**: Para acceder a métodos como `get_webview_window`, necesitas importar `use tauri::Manager;`

**3. Event Handlers**: Los event handlers del tray se ejecutan en el contexto de Tauri, no de la ventana web

**4. API Deprecations**: Usar métodos actualizados (e.g., `show_menu_on_left_click` vs `menu_on_left_click`)

**5. Cross-platform**: El tray icon funciona automáticamente en Windows, macOS y Linux

### Testing

```bash
# Compilar y probar
npm run tauri:dev

# Verificar:
# 1. Icono aparece en la bandeja del sistema
# 2. Botón "Minimize to Tray" oculta la ventana
# 3. Click en icono muestra/oculta la ventana
# 4. Menú contextual funciona correctamente
# 5. Opción "Quit" cierra la aplicación
```

Este ejemplo demuestra:
- Integración con APIs del sistema operativo
- Uso de features de Tauri
- Event handling en Rust
- Comunicación bidireccional Rust ↔ TypeScript

---

## Troubleshooting Común

### "Failed to initialize database"

**Solución**: Eliminar DB antigua y dejar que se recree:
```bash
# Windows
del "%LOCALAPPDATA%\devfocus\devfocus.db"

# macOS/Linux
rm ~/Library/Application\ Support/devfocus/devfocus.db
```

### "Command not found"

**Causa**: Olvidaste registrar el comando en `lib.rs`

**Solución**: Agregar a `invoke_handler`

### "Type error in TypeScript"

**Causa**: Tipos no coinciden con backend

**Solución**: Verificar que `#[serde(rename_all = "camelCase")]` esté presente

### "Data not persisting"

**Causa**: No se está guardando en DB correctamente

**Solución**: Inspeccionar DB con sqlite3 para verificar datos

---

## Plantilla Rápida

### Crear Estructura Inicial

```bash
# Backend (ya existe, solo agregar archivos)

# Frontend
mkdir -p src/features/mi-feature/{components,hooks,store}
touch src/features/mi-feature/components/MiFeatureList.tsx
touch src/features/mi-feature/components/MiFeatureCard.tsx
touch src/features/mi-feature/hooks/useMiFeature.ts
touch src/features/mi-feature/store/miFeatureStore.ts
touch src/features/mi-feature/index.ts
```

### Copiar y Personalizar

1. Copiar código de un feature similar (ej: `categories/`)
2. Buscar y reemplazar nombres
3. Ajustar lógica específica
4. Probar incrementalmente

---

## Conclusión

Siguiendo esta guía paso a paso, puedes agregar cualquier feature a DevFocus de manera consistente y profesional. La clave es:

1. **Planificar** - Definir claramente qué necesitas
2. **Backend primero** - Garantizar persistencia
3. **Frontend después** - Construir UI sobre datos sólidos
4. **Probar todo** - No asumir que funciona
5. **Documentar** - Tu yo del futuro te lo agradecerá

¡Buena suerte con tu nuevo feature! 🚀

---

**Última actualización**: 2025-01-14
**Versión del documento**: 1.0
