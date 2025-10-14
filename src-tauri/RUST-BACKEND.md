# DevFocus - Backend Rust/Tauri

Documentación completa de la arquitectura backend de DevFocus, construida con Rust y Tauri 2.8.

## 📋 Tabla de Contenidos

- [Arquitectura General](#arquitectura-general)
- [Estructura de Archivos](#estructura-de-archivos)
- [Base de Datos](#base-de-datos)
- [Modelos de Datos](#modelos-de-datos)
- [Comandos Tauri](#comandos-tauri)
- [Features Existentes](#features-existentes)
- [Crear un Nuevo Feature](#crear-un-nuevo-feature)
- [Patrones y Convenciones](#patrones-y-convenciones)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Arquitectura General

### Stack Tecnológico

- **Tauri 2.8**: Framework para aplicaciones desktop con Rust
- **rusqlite 0.32**: Driver SQLite para persistencia de datos
- **uuid 1.11**: Generación de identificadores únicos
- **chrono 0.4**: Manejo de fechas y timestamps
- **serde 1.0**: Serialización/deserialización JSON

### Principios de Diseño

1. **Command Pattern**: Cada operación se expone como un comando Tauri
2. **Database-First**: SQLite como fuente única de verdad
3. **Separation of Concerns**: Modelos, comandos y database separados
4. **Immutable by Default**: Rust garantiza seguridad de memoria
5. **Error Handling**: Uso de `Result<T, String>` para propagación de errores

### Flujo de Datos

```
Frontend (React/TypeScript)
         ↓
   Tauri IPC Bridge
         ↓
   Command Handlers (commands.rs)
         ↓
   Business Logic
         ↓
   Database Layer (rusqlite)
         ↓
   SQLite Database (devfocus.db)
```

---

## Estructura de Archivos

```
src-tauri/
├── src/
│   ├── lib.rs                 # Punto de entrada, configuración Tauri
│   ├── commands.rs            # Handlers de comandos Tauri
│   ├── models.rs              # Estructuras de datos (Models)
│   └── db.rs                  # Inicialización y migraciones DB
├── Cargo.toml                 # Dependencias Rust
├── tauri.conf.json            # Configuración de Tauri
└── capabilities/
    └── default.json           # Permisos y capabilities
```

### lib.rs

**Responsabilidad**: Inicializar la aplicación Tauri y registrar comandos.

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Inicializar base de datos
            let db = db::init_db()
                .map_err(|e| format!("Failed to initialize database: {}", e))?;

            // Guardar conexión en estado global
            app.manage(AppState { db: Mutex::new(db) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Registrar todos los comandos aquí
            commands::create_task,
            commands::list_tasks,
            // ...
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### commands.rs

**Responsabilidad**: Implementar la lógica de negocio y exponer comandos al frontend.

**Estructura típica de un comando**:
```rust
#[tauri::command]
pub fn nombre_comando(
    parametros: Tipo,
    state: State<AppState>
) -> Result<TipoRetorno, String> {
    let conn = state.db.lock().unwrap();

    // Lógica de negocio
    // Queries SQL
    // Transformaciones

    Ok(resultado)
}
```

### models.rs

**Responsabilidad**: Definir estructuras de datos compartidas entre Rust y TypeScript.

**Características**:
- Derives: `Debug`, `Clone`, `Serialize`, `Deserialize`
- Naming: `#[serde(rename_all = "camelCase")]` para compatibilidad JS
- Validación en constructores cuando sea necesario

### db.rs

**Responsabilidad**: Inicialización de database y migraciones.

**Funciones clave**:
- `get_db_path()`: Determina ubicación de la DB según OS
- `init_db()`: Crea conexión y ejecuta migraciones
- `create_tables()`: Define schema SQL
- `migrate_*()`: Funciones de migración para cambios de schema

---

## Base de Datos

### Ubicación del Archivo

- **Windows**: `%LOCALAPPDATA%\devfocus\devfocus.db`
- **macOS**: `~/Library/Application Support/devfocus/devfocus.db`
- **Linux**: `~/.local/share/devfocus/devfocus.db`

### Schema Actual

#### Tasks
```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,           -- 'todo', 'in_progress', 'done'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT
);
```

#### Subtasks
```sql
CREATE TABLE subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,           -- 'todo', 'in_progress', 'paused', 'done'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT,
    category_id TEXT,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

#### Time Sessions
```sql
CREATE TABLE time_sessions (
    id TEXT PRIMARY KEY,
    subtask_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    paused_at TEXT,
    resumed_at TEXT,
    ended_at TEXT,
    duration_seconds INTEGER DEFAULT 0,
    FOREIGN KEY(subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE
);
```

#### Categories
```sql
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL,            -- Hex color: '#3b82f6'
    created_at TEXT NOT NULL
);
```

#### Category Experience
```sql
CREATE TABLE category_experience (
    id TEXT PRIMARY KEY,
    category_id TEXT UNIQUE NOT NULL,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### Índices

```sql
CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX idx_subtasks_category_id ON subtasks(category_id);
CREATE INDEX idx_time_sessions_subtask_id ON time_sessions(subtask_id);
CREATE INDEX idx_category_experience_category_id ON category_experience(category_id);
```

### Migraciones

**Patrón de Migración**:

```rust
fn migrate_add_nueva_columna(conn: &Connection) -> Result<()> {
    // 1. Verificar si la columna ya existe
    let column_exists: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM pragma_table_info('tabla') WHERE name='columna'",
            [],
            |row| row.get::<_, i32>(0),
        )
        .unwrap_or(0) > 0;

    if !column_exists {
        // 2. Agregar la columna
        conn.execute(
            "ALTER TABLE tabla ADD COLUMN columna TEXT",
            [],
        )?;
        println!("Migration: Added columna to tabla");
    }

    Ok(())
}
```

**Llamar desde `create_tables()`**:
```rust
fn create_tables(conn: &Connection) -> Result<()> {
    // ... crear tablas existentes

    // Ejecutar migraciones
    migrate_add_nueva_columna(conn)?;

    Ok(())
}
```

---

## Modelos de Datos

### Estructura Base

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]  // JavaScript usa camelCase
pub struct MiModelo {
    pub id: String,
    pub campo_texto: String,
    pub campo_opcional: Option<String>,
    pub created_at: String,
}
```

### Modelos Existentes

#### Task
```rust
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
}
```

#### Subtask
```rust
pub struct Subtask {
    pub id: String,
    pub task_id: String,
    pub title: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
    pub total_time_seconds: Option<i64>,
    pub category_id: Option<String>,
    pub category: Option<Category>,
}
```

#### Category
```rust
pub struct Category {
    pub id: String,
    pub name: String,
    pub color: String,
    pub created_at: String,
}
```

#### CategoryStats
```rust
pub struct CategoryStats {
    pub category: Category,
    pub total_xp: i64,
    pub level: i64,
    pub xp_for_next_level: i64,
    pub progress_percentage: f64,
}
```

### Helpers y Utilities

```rust
// Cálculo de nivel basado en XP
fn calculate_level(xp: i64) -> i64 {
    if xp <= 0 { return 1; }
    let level = ((xp as f64 / 100.0).sqrt().floor() as i64) + 1;
    level.max(1)
}

// XP requerido para siguiente nivel
fn get_xp_for_next_level(current_level: i64) -> i64 {
    ((current_level) * (current_level)) * 100
}
```

---

## Comandos Tauri

### Anatomía de un Comando

```rust
#[tauri::command]
pub fn my_command(
    // Parámetros del frontend
    param1: String,
    param2: i64,
    // Estado global de la app
    state: State<AppState>
) -> Result<MyReturnType, String> {
    // 1. Obtener conexión a DB
    let conn = state.db.lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    // 2. Ejecutar lógica de negocio
    let result = conn.query_row(
        "SELECT * FROM table WHERE id = ?1",
        [param1],
        |row| {
            Ok(MyReturnType {
                field: row.get(0)?,
            })
        },
    ).map_err(|e| format!("Query error: {}", e))?;

    // 3. Retornar resultado
    Ok(result)
}
```

### Registrar Comando

En `lib.rs`:
```rust
.invoke_handler(tauri::generate_handler![
    commands::my_command,
])
```

### Comandos por Feature

#### Tasks
- `create_task(title, description)` → `Task`
- `list_tasks()` → `Vec<TaskWithActiveSubtask>`
- `get_task(id)` → `Task`
- `update_task_status(id, status)` → `Task`
- `delete_task(id)` → `()`

#### Subtasks
- `create_subtask(task_id, title, category_id)` → `Subtask`
- `get_task_with_subtasks_and_sessions(task_id)` → `TaskWithSubtasksAndSessions`
- `delete_subtask(id)` → `()`

#### Time Tracking
- `start_subtask(id)` → `TimeSession`
- `pause_subtask(id, duration)` → `TimeSession`
- `resume_subtask(id)` → `TimeSession`
- `complete_subtask(id, duration)` → `SubtaskCompletion`

#### Categories
- `create_category(name, color)` → `Category`
- `list_categories()` → `Vec<Category>`
- `get_category_experience(category_id)` → `CategoryExperience`
- `get_all_category_stats()` → `Vec<CategoryStats>`

#### Metrics
- `get_general_metrics()` → `GeneralMetrics`
- `get_task_metrics(task_id)` → `TaskMetrics`

---

## Features Existentes

### 1. Task Management

**Archivos**: `commands.rs` (líneas 1-150)

**Responsabilidades**:
- CRUD de tareas
- Gestión de estados (todo, in_progress, done)
- Cálculo de métricas por tarea

**Comandos**:
- `create_task`
- `list_tasks`
- `update_task_status`
- `delete_task`

### 2. Subtask Management

**Archivos**: `commands.rs` (líneas 151-350)

**Responsabilidades**:
- CRUD de subtareas
- Relación con tareas padre
- Tracking de tiempo acumulado

**Comandos**:
- `create_subtask`
- `get_task_with_subtasks_and_sessions`
- `delete_subtask`

### 3. Time Tracking

**Archivos**: `commands.rs` (líneas 351-500)

**Responsabilidades**:
- Crear sesiones de tiempo
- Pausar/reanudar tracking
- Calcular duraciones
- Persistir tiempo trabajado

**Comandos**:
- `start_subtask`
- `pause_subtask`
- `resume_subtask`
- `complete_subtask`

**Lógica de Tracking**:
```rust
// Al iniciar
TimeSession {
    id: uuid,
    subtask_id: id,
    started_at: now,
    duration_seconds: 0,
}

// Al pausar
UPDATE time_sessions
SET paused_at = ?, duration_seconds = ?

// Al reanudar
UPDATE time_sessions
SET resumed_at = ?, paused_at = NULL

// Al completar
UPDATE time_sessions
SET ended_at = ?, duration_seconds = ?
UPDATE subtasks
SET status = 'done', completed_at = ?
```

### 4. Category & XP System

**Archivos**: `commands.rs` (líneas 530-650), `models.rs` (líneas 103-140)

**Responsabilidades**:
- Gestión de categorías
- Cálculo de XP y niveles
- Tracking de progreso por categoría

**Fórmulas**:
```rust
// XP ganado = duración en segundos
xp_gained = duration_seconds;

// Nivel basado en XP total
level = floor(sqrt(total_xp / 100)) + 1;

// XP para siguiente nivel
xp_next = (level)² × 100;

// Progreso hacia siguiente nivel
current_level_xp = (level - 1)² × 100;
xp_in_current = total_xp - current_level_xp;
xp_needed = xp_next - current_level_xp;
progress = (xp_in_current / xp_needed) × 100;
```

**Comandos**:
- `create_category`
- `list_categories`
- `get_all_category_stats`

### 5. Metrics & Analytics

**Archivos**: `commands.rs` (líneas 651-900)

**Responsabilidades**:
- Calcular puntos por eficiencia
- Generar estadísticas agregadas
- Métricas de los últimos 7 días

**Comandos**:
- `get_general_metrics`
- `get_task_metrics`

---

## Crear un Nuevo Feature

### Paso 1: Definir el Modelo

En `models.rs`:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MiNuevoFeature {
    pub id: String,
    pub nombre: String,
    pub descripcion: Option<String>,
    pub created_at: String,
}
```

### Paso 2: Crear Tabla en Database

En `db.rs`, dentro de `create_tables()`:

```rust
conn.execute(
    "CREATE TABLE IF NOT EXISTS mi_feature (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        created_at TEXT NOT NULL
    )",
    [],
)?;

// Agregar índice si es necesario
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_mi_feature_nombre ON mi_feature(nombre)",
    [],
)?;
```

### Paso 3: Implementar Comandos

En `commands.rs`:

```rust
// CREATE
#[tauri::command]
pub fn create_mi_feature(
    nombre: String,
    descripcion: Option<String>,
    state: State<AppState>
) -> Result<MiNuevoFeature, String> {
    let conn = state.db.lock().unwrap();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO mi_feature (id, nombre, descripcion, created_at)
         VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![&id, &nombre, &descripcion, &now],
    ).map_err(|e| format!("Failed to create: {}", e))?;

    Ok(MiNuevoFeature {
        id,
        nombre,
        descripcion,
        created_at: now,
    })
}

// READ (List)
#[tauri::command]
pub fn list_mi_feature(state: State<AppState>) -> Result<Vec<MiNuevoFeature>, String> {
    let conn = state.db.lock().unwrap();

    let mut stmt = conn.prepare(
        "SELECT id, nombre, descripcion, created_at FROM mi_feature ORDER BY created_at DESC"
    ).map_err(|e| format!("Failed to prepare: {}", e))?;

    let items = stmt.query_map([], |row| {
        Ok(MiNuevoFeature {
            id: row.get(0)?,
            nombre: row.get(1)?,
            descripcion: row.get(2)?,
            created_at: row.get(3)?,
        })
    }).map_err(|e| format!("Query failed: {}", e))?;

    let mut result = Vec::new();
    for item in items {
        result.push(item.map_err(|e| format!("Row error: {}", e))?);
    }

    Ok(result)
}

// UPDATE
#[tauri::command]
pub fn update_mi_feature(
    id: String,
    nombre: String,
    state: State<AppState>
) -> Result<MiNuevoFeature, String> {
    let conn = state.db.lock().unwrap();

    conn.execute(
        "UPDATE mi_feature SET nombre = ?1 WHERE id = ?2",
        rusqlite::params![&nombre, &id],
    ).map_err(|e| format!("Update failed: {}", e))?;

    // Retornar el item actualizado
    conn.query_row(
        "SELECT id, nombre, descripcion, created_at FROM mi_feature WHERE id = ?1",
        [&id],
        |row| {
            Ok(MiNuevoFeature {
                id: row.get(0)?,
                nombre: row.get(1)?,
                descripcion: row.get(2)?,
                created_at: row.get(3)?,
            })
        },
    ).map_err(|e| format!("Failed to get updated: {}", e))
}

// DELETE
#[tauri::command]
pub fn delete_mi_feature(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().unwrap();

    conn.execute(
        "DELETE FROM mi_feature WHERE id = ?1",
        [&id],
    ).map_err(|e| format!("Delete failed: {}", e))?;

    Ok(())
}
```

### Paso 4: Registrar Comandos

En `lib.rs`:

```rust
.invoke_handler(tauri::generate_handler![
    // ... comandos existentes
    commands::create_mi_feature,
    commands::list_mi_feature,
    commands::update_mi_feature,
    commands::delete_mi_feature,
])
```

### Paso 5: Crear Wrappers en Frontend

En `src/lib/tauri/commands.ts`:

```typescript
export const createMiFeature = async (
  nombre: string,
  descripcion?: string
): Promise<MiNuevoFeature> => {
  return await invoke('create_mi_feature', { nombre, descripcion });
};

export const listMiFeature = async (): Promise<MiNuevoFeature[]> => {
  return await invoke('list_mi_feature');
};
```

---

## Patrones y Convenciones

### 1. Manejo de Errores

**Siempre usar `Result<T, String>`**:
```rust
pub fn my_function() -> Result<MyType, String> {
    // Convertir errores a String
    operation().map_err(|e| format!("Error: {}", e))?;
    Ok(result)
}
```

**Propagar errores con `?`**:
```rust
let value = operation_that_fails()?; // Se propaga automáticamente
```

### 2. Timestamps

**Siempre usar RFC3339**:
```rust
let now = chrono::Utc::now().to_rfc3339();
// Resultado: "2024-01-15T10:30:00.000Z"
```

### 3. UUIDs

**Generar IDs únicos**:
```rust
let id = uuid::Uuid::new_v4().to_string();
// Resultado: "550e8400-e29b-41d4-a716-446655440000"
```

### 4. Queries Preparados

**Usar parámetros en lugar de interpolación**:
```rust
// ✅ CORRECTO
conn.query_row(
    "SELECT * FROM table WHERE id = ?1",
    [&id],
    |row| Ok(row.get(0)?)
)?;

// ❌ INCORRECTO (vulnerable a SQL injection)
let query = format!("SELECT * FROM table WHERE id = '{}'", id);
```

### 5. Transacciones

**Para operaciones múltiples**:
```rust
let tx = conn.transaction()
    .map_err(|e| format!("Failed to start transaction: {}", e))?;

tx.execute("INSERT INTO table1 ...", params![])?;
tx.execute("INSERT INTO table2 ...", params![])?;

tx.commit()
    .map_err(|e| format!("Failed to commit: {}", e))?;
```

### 6. Option vs Result

```rust
// Option: valor puede estar o no, sin error
let maybe_value: Option<String> = row.get(0).ok();

// Result: operación puede fallar con error
let value: Result<String, Error> = row.get(0);
```

### 7. Naming Conventions

- **Funciones**: `snake_case`
- **Structs**: `PascalCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Comandos Tauri**: `snake_case` (se convierten a camelCase en JS)

---

## Testing

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_level() {
        assert_eq!(calculate_level(0), 1);
        assert_eq!(calculate_level(100), 2);
        assert_eq!(calculate_level(400), 3);
        assert_eq!(calculate_level(900), 4);
    }

    #[test]
    fn test_xp_for_next_level() {
        assert_eq!(get_xp_for_next_level(1), 100);
        assert_eq!(get_xp_for_next_level(2), 400);
        assert_eq!(get_xp_for_next_level(3), 900);
    }
}
```

### Ejecutar Tests

```bash
cd src-tauri
cargo test
```

### Integration Tests

```rust
#[test]
fn test_db_creation() {
    let conn = init_db().unwrap();

    // Verificar que las tablas existen
    let table_exists: i32 = conn.query_row(
        "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='tasks'",
        [],
        |row| row.get(0)
    ).unwrap();

    assert_eq!(table_exists, 1);
}
```

---

## Troubleshooting

### Error: "Database is locked"

**Causa**: Múltiples threads intentando acceder a la DB simultáneamente.

**Solución**: El `Mutex` en `AppState` debería prevenir esto. Verificar que siempre se libera el lock:

```rust
{
    let conn = state.db.lock().unwrap();
    // operaciones...
} // lock se libera aquí automáticamente
```

### Error: "Failed to prepare statement"

**Causa**: Sintaxis SQL incorrecta o tabla no existe.

**Solución**:
1. Verificar sintaxis SQL
2. Confirmar que la migración se ejecutó
3. Revisar logs de inicialización

```bash
RUST_LOG=debug cargo tauri dev
```

### Error: "Column not found"

**Causa**: Schema cambió pero migración no se ejecutó.

**Solución**:
1. Eliminar DB antigua: Delete `devfocus.db`
2. Reiniciar app para recrear con nuevo schema
3. O implementar migración apropiada

### Performance: Queries Lentos

**Diagnóstico**:
```rust
let start = std::time::Instant::now();
// operación lenta
println!("Query took: {:?}", start.elapsed());
```

**Soluciones**:
- Agregar índices a columnas frecuentemente consultadas
- Usar `EXPLAIN QUERY PLAN` para analizar queries
- Considerar denormalización para queries complejos

### Memory Leaks

**Rust previene memory leaks** gracias a su ownership system, pero:

**Verificar**:
- Que no hay ciclos de referencia con `Rc<RefCell<T>>`
- Que los threads spawneados terminan correctamente
- Que no hay handles de recursos sin cerrar

---

## Recursos Adicionales

### Documentación Oficial

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [rusqlite Documentation](https://docs.rs/rusqlite/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Serde Documentation](https://serde.rs/)

### Herramientas Útiles

```bash
# Formatear código
cargo fmt

# Linter (muy estricto)
cargo clippy

# Verificar compilación sin generar binario
cargo check

# Build optimizado
cargo build --release

# Ver estructura de dependencias
cargo tree
```

### Debug en Tauri

```rust
// En cualquier comando
println!("Debug: {:?}", variable);

// En el frontend, aparecerá en la terminal donde ejecutaste tauri dev
```

---

## Checklist para Nuevo Feature

- [ ] Modelo definido en `models.rs` con derives correctos
- [ ] Tabla creada en `db.rs` con schema apropiado
- [ ] Índices agregados para queries frecuentes
- [ ] Comandos CRUD implementados en `commands.rs`
- [ ] Comandos registrados en `lib.rs`
- [ ] Manejo de errores con `Result<T, String>`
- [ ] Tests unitarios para lógica de negocio
- [ ] Validación de entrada en comandos
- [ ] Wrappers TypeScript creados en frontend
- [ ] Documentación actualizada

---

**Última actualización**: 2025-01-14

**Versión Tauri**: 2.8
**Versión Rust**: 1.75+
**Versión rusqlite**: 0.32
