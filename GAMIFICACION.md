# 🎮 Sistema de Gamificación DevFocus

Documentación completa del sistema de gamificación robusto inspirado en Game Dev Tycoon.

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Sistema Actual](#sistema-actual)
- [Sistema Propuesto](#sistema-propuesto)
- [Tier 1: Core Gamification](#tier-1-core-gamification)
- [Tier 2: Analytics & Insights](#tier-2-analytics--insights)
- [Tier 3: Advanced Features](#tier-3-advanced-features)
- [Base de Datos](#base-de-datos)
- [Componentes UI](#componentes-ui)
- [Fórmulas Matemáticas](#fórmulas-matemáticas)
- [Achievements Completos](#achievements-completos)
- [Sistema de Títulos](#sistema-de-títulos)
- [Guía de Implementación](#guía-de-implementación)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## Visión General

### 🎯 Objetivo

Transformar DevFocus en una aplicación que:
- **Motive** al usuario a trabajar diariamente
- **Visualice** claramente el progreso y crecimiento
- **Recompense** la consistencia y eficiencia
- **Genere** reportes profesionales para presentar a managers
- **Identifique** fortalezas y áreas de mejora
- **Celebre** los logros y milestones alcanzados

### 🎨 Inspiración: Game Dev Tycoon

**Lo que tomaremos:**
- Sistema de **skills progresivas** visibles
- **Sensación de crecimiento constante**
- **Feedback visual inmediato** de mejoras
- **Stats claras y comprensibles**
- **Desbloqueables y recompensas** que dan sentido de logro

**Diferenciador de DevFocus:**
- Orientado a **productividad profesional**
- **Reportes exportables** para entornos corporativos
- **Métricas reales** de trabajo (no solo juego)
- **Análisis de fortalezas** por categorías técnicas

---

## Sistema Actual

### ✅ Features Existentes

#### 1. Sistema de XP por Categoría
```
XP ganado = 1 XP por segundo trabajado
Asignado a: Categoría específica (Frontend, Backend, etc.)
Visualización: Animación "+5 XP" cada 5 segundos
```

#### 2. Sistema de Niveles por Categoría
```
Fórmula: level = floor(sqrt(total_xp / 100)) + 1
XP para siguiente nivel = (level)² × 100

Ejemplos:
- Nivel 1: 0-99 XP
- Nivel 2: 100-399 XP (requiere 100 XP)
- Nivel 3: 400-899 XP (requiere 400 XP)
- Nivel 5: 1600-2499 XP (requiere 1600 XP)
- Nivel 10: 8100-9999 XP (requiere 8100 XP)
```

#### 3. Sistema de Puntos
```
Puntos base: 10 por subtarea completada
Bonus eficiencia: +5 si completada en < 25 minutos
Bonus complejidad: +20 si tarea tiene 5+ subtareas

Ejemplo tarea compleja y eficiente:
- 6 subtasks, todas < 25min
- Puntos = (6 × 15) + 20 = 110 puntos
```

#### 4. Métricas Básicas
- Puntos totales acumulados
- Puntos hoy / esta semana
- Últimos 7 días (gráfica)
- Mejor día histórico
- Promedio de tiempo por subtarea
- Tareas/subtareas completadas

#### 5. Categorías con Progress Bars
- Vista de todas las categorías
- Nivel y XP por categoría
- Barra de progreso hacia siguiente nivel
- Porcentaje de progreso

---

## Sistema Propuesto

### 🏗️ Arquitectura de 3 Tiers

```
TIER 1: Core Gamification (Implementar primero)
├─ Sistema de Nivel Global
├─ Títulos Progresivos
├─ Sistema de Racha Diaria
├─ Achievements Básicos (10)
└─ Skill Tree Visual

TIER 2: Analytics & Insights (Implementar segundo)
├─ Dashboard de Fortalezas
├─ Estadísticas Comparativas
├─ Reportes Exportables
└─ Milestones & Hitos

TIER 3: Advanced Features (Implementar tercero)
├─ Sistema de Multiplicadores
├─ Leaderboard Personal
├─ Challenges Semanales
└─ Modo Pomodoro Integrado
```

---

## TIER 1: Core Gamification

### 1. Sistema de Nivel Global

**Concepto:** Un nivel que representa el progreso general del usuario, independiente de categorías individuales.

**Cálculo:**
```javascript
// XP total = suma de XP de todas las categorías
total_xp = sum(all_categories.xp)

// Nivel global con escala más generosa
global_level = floor(sqrt(total_xp / 500)) + 1

// XP para siguiente nivel
xp_for_next = ((global_level)² × 500)
```

**Escala de niveles:**
```
Nivel 1:  0 - 499 XP
Nivel 2:  500 - 1999 XP     (500 XP needed)
Nivel 3:  2000 - 4499 XP    (2000 XP needed)
Nivel 5:  8000 - 12499 XP   (8000 XP needed)
Nivel 10: 40500 - 49999 XP  (40500 XP needed)
Nivel 20: 180500 - 199999 XP (180500 XP needed)
```

**UI Component: GlobalLevelHeader**
```
┌─────────────────────────────────────────────────────┐
│ 🏆 Level 12: Senior Developer                       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  67% (48,230 / 72,000 XP)    │
│ 23,770 XP to next level                            │
└─────────────────────────────────────────────────────┘
```

**Beneficios:**
- Da sentido de progreso general
- Motivación clara de "siguiente nivel"
- Punto de referencia único y simple
- Base para sistema de títulos

---

### 2. Títulos Progresivos

**Sistema de 7 títulos** que se desbloquean según nivel global:

| Título | Nivel Requerido | Descripción | Color |
|--------|----------------|-------------|-------|
| 🌱 Novice | 1-4 | Comenzando tu journey | Verde claro |
| 💼 Junior Developer | 5-9 | Ganando experiencia | Verde |
| 🚀 Mid-Level Developer | 10-14 | Solidificando skills | Azul |
| 💎 Senior Developer | 15-19 | Dominio técnico | Azul oscuro |
| 🏅 Expert Developer | 20-24 | Maestro en múltiples áreas | Púrpura |
| 👑 Master Developer | 25-29 | Elite técnico | Dorado |
| ⭐ Legend | 30+ | Leyenda viviente | Arcoíris |

**UI Display:**
```tsx
<div className="title-badge">
  <span className="title-icon">💎</span>
  <span className="title-text">Senior Developer</span>
  <span className="title-level">Level 17</span>
</div>
```

**Unlock Messages:**
```
🎉 ¡Nuevo Título Desbloqueado!

💎 Senior Developer

Has alcanzado el nivel 15. Tu dominio técnico
es evidente. ¡Sigue así!

[Continuar]
```

---

### 3. Sistema de Racha Diaria (Streak)

**Concepto:** Contador de días consecutivos trabajando al menos 1 subtarea.

**Reglas:**
```
✅ Cuenta como día trabajado: Completar ≥ 1 subtarea
❌ Rompe la racha: Pasar 24h sin completar subtarea
🎁 Bonificador de XP: +5% por cada 7 días (máx 50%)

Ejemplos:
- 7 días racha → +5% XP
- 14 días racha → +10% XP
- 28 días racha → +20% XP
- 70+ días racha → +50% XP (máximo)
```

**Cálculo del bonificador:**
```rust
fn calculate_streak_bonus(streak_days: i64) -> f64 {
    let weeks = (streak_days / 7) as f64;
    let bonus_percentage = (weeks * 0.05).min(0.50); // Max 50%
    bonus_percentage
}

// Ejemplo: 42 días de racha
// weeks = 42 / 7 = 6
// bonus = 6 × 0.05 = 0.30 = 30%
```

**Aplicación del bonus:**
```rust
// Al completar subtask
let base_xp = duration_seconds;
let streak_bonus = calculate_streak_bonus(current_streak);
let bonus_xp = (base_xp as f64 * streak_bonus) as i64;
let total_xp = base_xp + bonus_xp;

// Ejemplo: 1800 segundos (30 min) con racha de 21 días
// base_xp = 1800
// streak_bonus = 15%
// bonus_xp = 270
// total_xp = 2070 XP
```

**UI Component: StreakIndicator**
```
┌──────────────────────────────┐
│ 🔥 42 Day Streak!           │
│ +30% XP Bonus               │
│ Don't break it!             │
│                              │
│ Next milestone: 49 days     │
│ (35% bonus)                  │
└──────────────────────────────┘
```

**Alertas:**
```
⚠️ Tu racha está en riesgo!

🔥 21 días consecutivos
No has trabajado hoy. Completa al menos
1 subtarea para mantener tu racha.

Bonificador actual: +15% XP

[Ir a trabajar]
```

**Milestones de Racha:**
- 🔥 **7 días** - "Week Warrior" - Badge bronce
- 🔥🔥 **14 días** - "Fortnight Fighter" - Badge plata
- 🔥🔥🔥 **30 días** - "Month Master" - Badge oro + 500 puntos
- 💪 **60 días** - "Unstoppable" - Badge platino + 1000 puntos
- 👑 **100 días** - "Century Legend" - Badge diamante + 2500 puntos

**Tracking en DB:**
```sql
CREATE TABLE user_profile (
    -- ...
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_work_date TEXT, -- ISO 8601 date
    -- ...
);

-- Lógica al completar subtask
UPDATE user_profile SET
    last_work_date = CURRENT_DATE,
    current_streak = CASE
        WHEN last_work_date = DATE(CURRENT_DATE, '-1 day') THEN current_streak + 1
        WHEN last_work_date = CURRENT_DATE THEN current_streak
        ELSE 1
    END,
    longest_streak = MAX(longest_streak, current_streak);
```

---

### 4. Sistema de Achievements

**20 Achievements** divididos en 5 categorías:

#### Categoría: Speed (Velocidad)

| ID | Nombre | Descripción | Requisito | Recompensa |
|----|--------|-------------|-----------|------------|
| speed_01 | ⚡ Flash | Completa 10 subtasks en < 15 min | 10 subtasks < 15min | 100 pts + Badge |
| speed_02 | 🏃 Speedrunner | Completa 50 subtasks en < 15 min | 50 subtasks < 15min | 300 pts + Badge |
| speed_03 | 🚀 Lightning | Completa 100 subtasks en < 15 min | 100 subtasks < 15min | 500 pts + Badge |
| speed_04 | ⏱️ Time Lord | Completa 10 subtasks en < 10 min | 10 subtasks < 10min | 200 pts + Badge |

#### Categoría: Volume (Volumen)

| ID | Nombre | Descripción | Requisito | Recompensa |
|----|--------|-------------|-----------|------------|
| vol_01 | 📚 Getting Started | Completa 10 subtasks | 10 subtasks total | 50 pts + Badge |
| vol_02 | 💯 Century | Completa 100 subtasks | 100 subtasks total | 250 pts + Badge |
| vol_03 | 📈 Half K | Completa 500 subtasks | 500 subtasks total | 750 pts + Badge |
| vol_04 | 🏆 Millennium | Completa 1000 subtasks | 1000 subtasks total | 2000 pts + Badge |

#### Categoría: Mastery (Maestría)

| ID | Nombre | Descripción | Requisito | Recompensa |
|----|--------|-------------|-----------|------------|
| mast_01 | 📖 Specialist | Alcanza nivel 5 en 1 categoría | Category level 5 | 150 pts + Badge |
| mast_02 | 🎓 Category Master | Alcanza nivel 10 en 1 categoría | Category level 10 | 400 pts + Badge |
| mast_03 | 🌟 Expert | Alcanza nivel 15 en 1 categoría | Category level 15 | 800 pts + Badge |
| mast_04 | 🗣️ Polyglot | Alcanza nivel 5 en 3 categorías | 3 categories level 5 | 600 pts + Badge |
| mast_05 | 🧙 Multi-Master | Alcanza nivel 10 en 3 categorías | 3 categories level 10 | 1500 pts + Badge |

#### Categoría: Streak (Racha)

| ID | Nombre | Descripción | Requisito | Recompensa |
|----|--------|-------------|-----------|------------|
| streak_01 | 🔥 Week Warrior | Mantén 7 días de racha | Streak = 7 days | 100 pts + Badge |
| streak_02 | 🔥🔥 Month Master | Mantén 30 días de racha | Streak = 30 days | 500 pts + Badge |
| streak_03 | 💪 Unstoppable | Mantén 60 días de racha | Streak = 60 days | 1000 pts + Badge |
| streak_04 | 👑 Century Legend | Mantén 100 días de racha | Streak = 100 days | 2500 pts + Badge |

#### Categoría: Perfection (Perfección)

| ID | Nombre | Descripción | Requisito | Recompensa |
|----|--------|-------------|-----------|------------|
| perf_01 | ✨ Perfect Day | Completa 10 subtasks sin pausar | 10 subtasks, 0 pauses | 200 pts + Badge |
| perf_02 | 🎯 Efficiency King | 90%+ eficiencia en 50 subtasks | 50 subtasks, 90%+ fast | 400 pts + Badge |
| perf_03 | 🏅 Marathon Runner | Trabaja 4h continuas | 4h non-stop session | 300 pts + Badge |
| perf_04 | 🌟 Flawless | 100% eficiencia en 20 subtasks | 20 subtasks, all fast | 600 pts + Badge |

**Achievement Data Structure:**
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'speed' | 'volume' | 'mastery' | 'streak' | 'perfection';
  icon: string;
  requirementType: 'subtasks_count' | 'subtasks_fast' | 'category_level' | 'streak_days' | 'continuous_work';
  requirementValue: number;
  pointsReward: number;
  badgeUrl?: string;
}
```

**Achievement Check Logic:**
```rust
// Después de completar una subtask
fn check_achievements_after_completion(
    conn: &Connection,
    user_id: &str,
) -> Vec<String> {
    let mut newly_unlocked = Vec::new();

    // Speed achievements
    let fast_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM subtasks s
         JOIN time_sessions ts ON s.id = ts.subtask_id
         WHERE ts.duration_seconds < 900", // 15 min
        [],
        |row| row.get(0)
    ).unwrap_or(0);

    if fast_count >= 10 && !has_achievement(conn, "speed_01") {
        unlock_achievement(conn, "speed_01");
        newly_unlocked.push("speed_01".to_string());
    }

    // Volume achievements
    let total_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM subtasks WHERE status = 'done'",
        [],
        |row| row.get(0)
    ).unwrap_or(0);

    if total_count >= 100 && !has_achievement(conn, "vol_02") {
        unlock_achievement(conn, "vol_02");
        newly_unlocked.push("vol_02".to_string());
    }

    // ... checks para otras categorías

    newly_unlocked
}
```

**UI Component: AchievementCard**
```tsx
interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number; // 0-100
  unlockedAt?: string;
}

// Locked state
┌────────────────────────────┐
│ 🔒 ⚡ Flash                │
│                            │
│ Completa 10 subtasks       │
│ en menos de 15 minutos     │
│                            │
│ ▓▓▓▓▓░░░░░  6/10 (60%)   │
│                            │
│ Recompensa: 100 puntos     │
└────────────────────────────┘

// Unlocked state
┌────────────────────────────┐
│ ✅ ⚡ Flash                │
│                            │
│ Completa 10 subtasks       │
│ en menos de 15 minutos     │
│                            │
│ 🎉 Desbloqueado           │
│ 2025-10-01 14:32          │
│                            │
│ +100 puntos ganados        │
└────────────────────────────┘
```

**Unlock Modal:**
```
╔══════════════════════════════════════╗
║                                      ║
║          🎉 ¡LOGRO DESBLOQUEADO!    ║
║                                      ║
║              ⚡ Flash                ║
║                                      ║
║   Completa 10 subtasks en < 15min   ║
║                                      ║
║         +100 Puntos Ganados          ║
║                                      ║
║            [Continuar]               ║
║                                      ║
╚══════════════════════════════════════╝
```

---

### 5. Skill Tree Visual

**Concepto:** Visualización tipo árbol/mapa de todas las categorías con sus niveles.

**Layout:**
```
                    💎 DevFocus
                        |
        ┌───────────────┼───────────────┐
        |               |               |
    Frontend        Backend         Architecture
    Lvl 12          Lvl 8           Lvl 5
    🏅 Gold         🥈 Silver       🥉 Bronze
        |               |               |
    ┌───┴───┐       ┌───┴───┐       ┌───┴───┐
    |       |       |       |       |       |
  CSS   Tailwind  API    DB    Design  Testing
  Lvl 6   Lvl 4   Lvl 7  Lvl 3  Lvl 2   Lvl 1
```

**Badges por Nivel:**
```javascript
const getBadgeForLevel = (level: number): string => {
  if (level >= 15) return '💎'; // Diamond
  if (level >= 10) return '🏅'; // Gold
  if (level >= 5) return '🥈';  // Silver
  if (level >= 1) return '🥉';  // Bronze
  return '⭕'; // Locked
};
```

**UI Component: SkillTreeView**
```tsx
interface SkillNode {
  id: string;
  name: string;
  level: number;
  xp: number;
  color: string;
  children?: SkillNode[];
}

// Renderiza como SVG interactivo
<svg viewBox="0 0 800 600">
  {nodes.map(node => (
    <>
      <circle
        cx={node.x}
        cy={node.y}
        r={30}
        fill={node.color}
        opacity={node.level > 0 ? 1 : 0.3}
      />
      <text x={node.x} y={node.y} textAnchor="middle">
        {getBadgeForLevel(node.level)}
      </text>
      <text x={node.x} y={node.y + 50} fontSize="12">
        Lvl {node.level}
      </text>
    </>
  ))}
</svg>
```

**Interactividad:**
- Hover sobre nodo → Tooltip con detalles (XP, progreso, tiempo trabajado)
- Click sobre nodo → Detalles completos + historial
- Líneas conectoras entre nodos relacionados
- Animaciones al subir de nivel

---

## TIER 2: Analytics & Insights

### 6. Dashboard de Fortalezas

**Objetivo:** Identificar rápidamente en qué categorías destaca el usuario.

**Componentes:**

#### Top 3 Categorías
```
┌─────────────────────────────────────┐
│ 🏆 Tus Fortalezas                  │
├─────────────────────────────────────┤
│ 1. 🎨 Frontend                     │
│    Nivel 12 | 54,320 XP            │
│    872 horas trabajadas             │
│                                     │
│ 2. ⚙️ Backend                      │
│    Nivel 8 | 28,450 XP             │
│    458 horas trabajadas             │
│                                     │
│ 3. 🏗️ Architecture                 │
│    Nivel 5 | 8,120 XP              │
│    142 horas trabajadas             │
└─────────────────────────────────────┘
```

#### Radar Chart
```tsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';

const data = [
  { category: 'Frontend', level: 12, maxLevel: 15 },
  { category: 'Backend', level: 8, maxLevel: 15 },
  { category: 'Architecture', level: 5, maxLevel: 15 },
  { category: 'CSS', level: 6, maxLevel: 15 },
  { category: 'Tailwind', level: 4, maxLevel: 15 },
];

<RadarChart data={data}>
  <PolarGrid />
  <PolarAngleAxis dataKey="category" />
  <Radar dataKey="level" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
</RadarChart>
```

#### Time Distribution Pie Chart
```tsx
import { PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Frontend', value: 872, color: '#3b82f6' },
  { name: 'Backend', value: 458, color: '#10b981' },
  { name: 'Architecture', value: 142, color: '#8b5cf6' },
  // ...
];

<PieChart>
  <Pie data={data} dataKey="value" nameKey="name">
    {data.map((entry, index) => (
      <Cell key={index} fill={entry.color} />
    ))}
  </Pie>
</PieChart>
```

#### Sugerencias Inteligentes
```
💡 Sugerencias para mejorar

✅ Excelente en Frontend (Nivel 12)
⚠️ Backend necesita más práctica (Nivel 8)
💪 Considera trabajar en Testing (Nivel 1)

Trabaja 10 horas en Backend para alcanzar
nivel 10 y obtener el achievement "Multi-Master"
```

---

### 7. Estadísticas Comparativas Temporales

**Comparación Este Mes vs Mes Anterior:**

```
┌──────────────────────────────────────────────────┐
│ 📊 Octubre 2025 vs Septiembre 2025             │
├──────────────────────────────────────────────────┤
│                                                  │
│ XP Ganado                                        │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 12,450 (+25%)                  │
│ ░░░░░░░░░░░░ 9,980                              │
│                                                  │
│ Puntos Ganados                                   │
│ ▓▓▓▓▓▓▓▓▓▓▓▓ 2,340 (+15%)                       │
│ ░░░░░░░░░░░ 2,030                               │
│                                                  │
│ Horas Trabajadas                                 │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 87.5h (+12%)                     │
│ ░░░░░░░░░░░░ 78.2h                              │
│                                                  │
│ Subtareas Completadas                            │
│ ▓▓▓▓▓▓▓▓▓▓▓ 234 (+8%)                           │
│ ░░░░░░░░░░ 217                                  │
│                                                  │
└──────────────────────────────────────────────────┘

📈 Tendencia: ¡Excelente! Estás +18% más productivo
```

**Comparación Esta Semana vs Semana Anterior:**

```
┌──────────────────────────────────────┐
│ Esta semana vs semana pasada        │
├──────────────────────────────────────┤
│ Lun  ▓▓▓ 340 pts  vs  ░░ 280 pts   │
│ Mar  ▓▓▓▓ 420 pts vs  ░░░ 310 pts  │
│ Mié  ▓▓ 280 pts   vs  ░░░ 350 pts  │
│ Jue  ▓▓▓▓▓ 510 pts vs  ░░░ 390 pts │
│ Vie  ▓▓▓ 380 pts  vs  ░░░ 340 pts  │
│ Sáb  ▓ 120 pts    vs  ░ 110 pts    │
│ Dom  - 0 pts      vs  - 0 pts       │
└──────────────────────────────────────┘
```

**Gráfica de Evolución Mensual:**

```tsx
<LineChart data={monthlyData}>
  <Line dataKey="xp" stroke="#3b82f6" name="XP" />
  <Line dataKey="points" stroke="#10b981" name="Puntos" />
  <Line dataKey="hours" stroke="#f59e0b" name="Horas" />
</LineChart>

// monthlyData = [
//   { month: 'Jun', xp: 8500, points: 1890, hours: 68 },
//   { month: 'Jul', xp: 9200, points: 2100, hours: 72 },
//   { month: 'Ago', xp: 9980, points: 2030, hours: 78 },
//   { month: 'Sep', xp: 12450, points: 2340, hours: 87 },
// ]
```

---

### 8. Reportes Exportables Profesionales

**Objetivo:** Generar PDFs presentables para mostrar a managers o clientes.

**Formato de Reporte:**

```markdown
# DevFocus - Reporte de Productividad

**Usuario:** Franco Castro
**Período:** 01/10/2025 - 31/10/2025
**Generado:** 01/11/2025 14:30

---

## 📊 Resumen Ejecutivo

- **Horas Trabajadas:** 87.5 horas
- **Tareas Completadas:** 24 tareas
- **Subtareas Completadas:** 234 subtareas
- **Eficiencia Promedio:** 78%
- **Puntos Ganados:** 2,340 puntos

**Tendencia:** +18% más productivo vs mes anterior

---

## 🏆 Categorías y Habilidades

### Frontend (Nivel 12)
- **XP:** 54,320 (+4,200 este mes)
- **Tiempo:** 45.2 horas (52% del total)
- **Tareas:** React components, UI improvements, Tailwind styling

### Backend (Nivel 8)
- **XP:** 28,450 (+2,800 este mes)
- **Tiempo:** 28.3 horas (32% del total)
- **Tareas:** API endpoints, Database queries, Authentication

### Architecture (Nivel 5)
- **XP:** 8,120 (+1,100 este mes)
- **Tiempo:** 10.5 horas (12% del total)
- **Tareas:** System design, Documentation, Planning

---

## 📈 Tareas Principales Completadas

1. **Sistema de Gamificación** (14 subtareas, 18.5h)
   - Implementar achievements
   - Diseñar skill tree
   - Crear reportes exportables

2. **Refactor Authentication** (8 subtareas, 12.2h)
   - JWT implementation
   - Session management
   - Security improvements

3. **Dashboard Analytics** (12 subtareas, 15.8h)
   - Charts integration
   - Real-time updates
   - Performance optimization

---

## 💡 Insights

**Fortalezas:**
- Excelente en Frontend (52% del tiempo)
- Alta eficiencia en tareas rápidas (78%)
- Consistencia: 22 días de racha

**Áreas de Mejora:**
- Testing (solo 3% del tiempo)
- Documentación podría aumentar
- Equilibrar más Backend vs Frontend

---

## 🎯 Logros Destacados

- 🏅 Alcanzado nivel 12 en Frontend
- 🔥 Racha de 22 días consecutivos
- ⚡ 45 subtareas completadas en < 15 min
- 🎉 Desbloqueados 3 achievements nuevos

---

*Generado automáticamente por DevFocus*
```

**Implementación:**

```typescript
import jsPDF from 'jspdf';

async function generatePDF(startDate: string, endDate: string) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.text('DevFocus - Reporte de Productividad', 20, 20);

  // User info
  doc.setFontSize(12);
  doc.text(`Período: ${startDate} - ${endDate}`, 20, 35);

  // Metrics section
  doc.setFontSize(16);
  doc.text('Resumen Ejecutivo', 20, 50);

  doc.setFontSize(12);
  doc.text(`Horas Trabajadas: ${metrics.totalHours}h`, 20, 60);
  doc.text(`Tareas Completadas: ${metrics.tasks}`, 20, 67);
  doc.text(`Subtareas Completadas: ${metrics.subtasks}`, 20, 74);

  // Categories section
  doc.setFontSize(16);
  doc.text('Categorías y Habilidades', 20, 95);

  categoryStats.forEach((cat, index) => {
    const y = 105 + (index * 20);
    doc.setFontSize(14);
    doc.text(`${cat.category.name} (Nivel ${cat.level})`, 25, y);
    doc.setFontSize(10);
    doc.text(`XP: ${cat.totalXp} | Tiempo: ${cat.hours}h`, 25, y + 5);
  });

  // Save
  doc.save(`devfocus-report-${startDate}-${endDate}.pdf`);
}
```

**Opciones de Exportación:**

```
┌─────────────────────────────────────┐
│ 📄 Exportar Reporte                │
├─────────────────────────────────────┤
│ Período:                            │
│ [▼ Último mes]                      │
│ [ ] Personalizado                   │
│                                     │
│ Incluir:                            │
│ ☑ Resumen ejecutivo                │
│ ☑ Desglose de categorías           │
│ ☑ Tareas principales               │
│ ☑ Gráficas                         │
│ ☑ Logros y achievements            │
│ ☐ Desglose diario                  │
│                                     │
│ Formato:                            │
│ ⦿ PDF  ○ CSV  ○ JSON               │
│                                     │
│ [Cancelar]  [Exportar]             │
└─────────────────────────────────────┘
```

---

### 9. Milestones & Hitos Memorables

**Concepto:** Registrar y celebrar momentos importantes en el journey del usuario.

**Tipos de Milestones:**

1. **Primeras Veces:**
   - Primera tarea completada
   - Primera subtarea < 15 min
   - Primer nivel alcanzado
   - Primer achievement desbloqueado
   - Primera racha de 7 días

2. **Niveles de Categoría:**
   - Primer nivel 5 en cualquier categoría
   - Primer nivel 10 en cualquier categoría
   - Primer nivel 15 en cualquier categoría
   - Nivel 10 en 3 categorías

3. **Volumen:**
   - 100 subtareas completadas
   - 500 subtareas completadas
   - 1000 subtareas completadas
   - 100 horas trabajadas
   - 1000 horas trabajadas

4. **Puntos:**
   - 1,000 puntos acumulados
   - 10,000 puntos acumulados
   - 50,000 puntos acumulados

**Milestone Data:**

```typescript
interface Milestone {
  id: string;
  type: 'first_time' | 'category_level' | 'volume' | 'points' | 'streak';
  title: string;
  description: string;
  achievedAt: string;
  metadata?: {
    categoryName?: string;
    level?: number;
    count?: number;
    [key: string]: any;
  };
}
```

**Timeline Component:**

```tsx
<div className="timeline">
  {milestones.map(milestone => (
    <div key={milestone.id} className="timeline-item">
      <div className="timeline-marker">
        <span className="icon">{getIconForType(milestone.type)}</span>
      </div>
      <div className="timeline-content">
        <h3>{milestone.title}</h3>
        <p>{milestone.description}</p>
        <time>{formatDate(milestone.achievedAt)}</time>
      </div>
    </div>
  ))}
</div>
```

**Visual:**

```
┌────────────────────────────────────────────┐
│ 📅 Tu Línea de Tiempo                     │
├────────────────────────────────────────────┤
│                                            │
│ ● 2025-10-14                              │
│ │ 🏆 Alcanzaste Nivel 12 en Frontend     │
│ │ ¡Tu dominio de React es impresionante! │
│ │                                         │
│ ● 2025-10-07                              │
│ │ 🔥 Racha de 30 días                    │
│ │ ¡Consistencia impecable!                │
│ │                                         │
│ ● 2025-09-28                              │
│ │ 💯 100 Subtareas Completadas           │
│ │ ¡Gran progreso!                         │
│ │                                         │
│ ● 2025-09-15                              │
│ │ ⚡ Primer subtask en < 10 minutos      │
│ │ Speed: Lightning fast!                  │
│ │                                         │
│ ● 2025-08-20                              │
│ │ 🎉 Primera Tarea Completada            │
│ │ ¡El comienzo de un gran journey!       │
│                                            │
└────────────────────────────────────────────┘
```

---

## TIER 3: Advanced Features

### 10. Sistema de Multiplicadores

**Objetivo:** Recompensar sesiones intensas y enfocadas con bonificadores de XP.

#### Combo System

**Regla:** +10% XP por cada 5 subtasks completadas sin cambiar de categoría.

```javascript
// Estado del combo
interface ComboState {
  currentCategory: string;
  consecutiveCount: number;
  multiplier: number; // 1.0, 1.1, 1.2, 1.3, ...
}

// Al completar subtask
function updateCombo(state: ComboState, completedCategory: string): ComboState {
  if (completedCategory === state.currentCategory) {
    const newCount = state.consecutiveCount + 1;
    const multiplier = 1.0 + Math.floor(newCount / 5) * 0.1;

    return {
      currentCategory: completedCategory,
      consecutiveCount: newCount,
      multiplier: Math.min(multiplier, 2.0), // Max 2x
    };
  } else {
    // Reset combo
    return {
      currentCategory: completedCategory,
      consecutiveCount: 1,
      multiplier: 1.0,
    };
  }
}

// Ejemplo:
// Frontend x1 → 1.0x
// Frontend x2 → 1.0x
// Frontend x3 → 1.0x
// Frontend x4 → 1.0x
// Frontend x5 → 1.1x (¡Combo!)
// Frontend x10 → 1.2x
// Backend x1 → 1.0x (combo roto)
```

**UI Display:**

```
┌─────────────────────────────┐
│ 🔥 COMBO x5                │
│ Frontend                    │
│ +10% XP Bonus              │
│                             │
│ Siguiente combo: 5 más      │
└─────────────────────────────┘
```

#### Focus Time Bonus

**Regla:** +20% XP si trabajas >2h continuas en la misma sesión.

```rust
fn calculate_focus_bonus(session_duration_seconds: i64) -> f64 {
    if session_duration_seconds >= 7200 { // 2 hours
        0.20 // 20% bonus
    } else {
        0.0
    }
}
```

#### Weekend Warrior

**Regla:** +15% XP si trabajas en sábado o domingo.

```rust
fn is_weekend(date: &NaiveDate) -> bool {
    let weekday = date.weekday();
    weekday == Weekday::Sat || weekday == Weekday::Sun
}

fn calculate_weekend_bonus(completed_at: &str) -> f64 {
    if let Ok(parsed) = chrono::DateTime::parse_from_rfc3339(completed_at) {
        let date = parsed.with_timezone(&Utc).date_naive();
        if is_weekend(&date) {
            return 0.15;
        }
    }
    0.0
}
```

#### Multiplicadores Acumulativos

```rust
fn calculate_total_xp_with_multipliers(
    base_xp: i64,
    streak_days: i64,
    combo_multiplier: f64,
    session_duration: i64,
    completed_at: &str,
) -> i64 {
    let streak_bonus = calculate_streak_bonus(streak_days);
    let focus_bonus = calculate_focus_bonus(session_duration);
    let weekend_bonus = calculate_weekend_bonus(completed_at);

    // Los bonuses se suman, no multiplican entre sí
    let total_multiplier = 1.0
        + streak_bonus
        + focus_bonus
        + weekend_bonus
        + (combo_multiplier - 1.0);

    let total_xp = (base_xp as f64 * total_multiplier) as i64;

    total_xp
}

// Ejemplo extremo:
// base_xp = 3600 (1 hora)
// streak = 35 días → +25%
// combo = x1.3 → +30%
// focus = 2.5h → +20%
// weekend = sábado → +15%
// Total: 1.0 + 0.25 + 0.30 + 0.20 + 0.15 = 1.90 → 90% bonus
// total_xp = 3600 × 1.90 = 6840 XP
```

**Indicator UI:**

```
┌─────────────────────────────────────┐
│ 💪 Multiplicadores Activos         │
├─────────────────────────────────────┤
│ 🔥 Racha (35 días)       +25%     │
│ 🎯 Combo (x1.3)          +30%     │
│ ⏱️ Focus (2.5h)          +20%     │
│ 🎮 Weekend Warrior       +15%     │
├─────────────────────────────────────┤
│ TOTAL BONUS:             +90%      │
│                                     │
│ Tu próximo XP:                      │
│ 1 minuto = 60 × 1.90 = 114 XP      │
└─────────────────────────────────────┘
```

---

### 11. Leaderboard Personal

**Concepto:** Ranking de tus propios records históricos.

**Categorías:**

```
┌─────────────────────────────────────────────────┐
│ 🏆 Records Personales                          │
├─────────────────────────────────────────────────┤
│                                                 │
│ 🔥 Mejor Racha                                 │
│    42 días consecutivos                         │
│    Septiembre 2025                              │
│                                                 │
│ 💪 Día Más Productivo                          │
│    18 subtareas | 720 puntos                    │
│    15 de Octubre 2025                           │
│                                                 │
│ 📅 Semana Más Productiva                       │
│    92 subtareas | 2,340 puntos                  │
│    Semana del 7-13 Oct 2025                     │
│                                                 │
│ 📆 Mes Más Productivo                          │
│    234 subtareas | 7,890 puntos                 │
│    Octubre 2025                                 │
│                                                 │
│ ⚡ Subtarea Más Rápida                         │
│    "Fix button bug" - 3 minutos                 │
│    Frontend - 8 Oct 2025                        │
│                                                 │
│ 🏅 Más XP en un Día                            │
│    8,450 XP (14.2 horas)                        │
│    Frontend - 12 Oct 2025                       │
│                                                 │
│ 🎯 Mayor Eficiencia                            │
│    95% (19/20 subtasks < 25min)                 │
│    Backend - Semana del 30 Sep                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Data Tracking:**

```typescript
interface PersonalRecord {
  id: string;
  type: 'best_streak' | 'most_productive_day' | 'most_productive_week' |
        'most_productive_month' | 'fastest_subtask' | 'most_xp_day' |
        'best_efficiency';
  value: number;
  date: string;
  metadata?: any;
  achievedAt: string;
}
```

---

### 12. Challenges Semanales

**Concepto:** Desafíos rotativos cada semana con recompensas especiales.

**Tipos de Challenges:**

1. **Volumen:**
   - "Completa 30 subtasks esta semana"
   - "Finaliza 5 tareas completas"

2. **Eficiencia:**
   - "80% eficiencia (20/25 subtasks < 25min)"
   - "10 subtasks en < 15 min"

3. **Categoría Específica:**
   - "Gana 3,600 XP en Frontend (1 hora)"
   - "Sube 1 nivel en Testing"

4. **Racha:**
   - "Trabaja todos los días (7/7)"
   - "Mantén racha viva toda la semana"

5. **Multiplicador:**
   - "Alcanza combo x2.0"
   - "Completa sesión de 3h focus time"

**Challenge Structure:**

```typescript
interface WeeklyChallenge {
  id: string;
  week: string; // "2025-W42"
  title: string;
  description: string;
  type: 'volume' | 'efficiency' | 'category' | 'streak' | 'multiplier';
  requirement: number;
  rewardPoints: number;
  rewardBadge?: string;
  progress: number;
  completed: boolean;
  expiresAt: string;
}
```

**UI:**

```
┌────────────────────────────────────────────────┐
│ 🎯 Challenge de esta Semana                   │
│ Expira en: 3 días 12h                         │
├────────────────────────────────────────────────┤
│                                                │
│ 🏃 "Sprint Master"                            │
│                                                │
│ Completa 30 subtasks antes del domingo        │
│                                                │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  22/30 (73%)           │
│                                                │
│ Recompensa:                                    │
│ • 500 puntos bonus                             │
│ • Badge "Sprint Master"                        │
│                                                │
└────────────────────────────────────────────────┘
```

**Rotation System:**

```javascript
// Challenges rotan cada lunes a las 00:00
const weeklyChallengePools = {
  week1: {
    title: "Sprint Master",
    description: "Completa 30 subtasks",
    requirement: 30,
    type: "volume",
    reward: 500,
  },
  week2: {
    title: "Efficiency Expert",
    description: "80% eficiencia (24/30)",
    requirement: 24,
    type: "efficiency",
    reward: 600,
  },
  week3: {
    title: "Frontend Fanatic",
    description: "Gana 5000 XP en Frontend",
    requirement: 5000,
    type: "category",
    reward: 750,
  },
  week4: {
    title: "Perfect Week",
    description: "Trabaja todos los días (7/7)",
    requirement: 7,
    type: "streak",
    reward: 800,
  },
};

function getWeeklyChallenge(weekNumber: number): Challenge {
  const index = (weekNumber % 4) + 1;
  return weeklyChallengePools[`week${index}`];
}
```

---

### 13. Modo Pomodoro Integrado

**Concepto:** Timer 25/5 minutos con integración al sistema de XP.

**Configuración:**

```typescript
interface PomodoroConfig {
  workDuration: number; // Default: 25 min (1500s)
  shortBreak: number;   // Default: 5 min (300s)
  longBreak: number;    // Default: 15 min (900s)
  longBreakInterval: number; // Default: 4 (cada 4 pomodoros)
}
```

**Bonus por Pomodoro:**

```
Completar 1 pomodoro (25 min completos) = +5 puntos bonus
Completar 4 pomodoros consecutivos = +25 puntos bonus adicional
```

**UI:**

```
┌─────────────────────────────────┐
│ 🍅 Modo Pomodoro               │
├─────────────────────────────────┤
│                                 │
│     Session 1 of 4              │
│                                 │
│       ⏱️ 18:42                 │
│                                 │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░       │
│       75% completado            │
│                                 │
│  Trabajando en:                 │
│  "Implement auth system"        │
│  Backend                        │
│                                 │
│  [⏸️ Pausar]  [⏹️ Detener]    │
│                                 │
└─────────────────────────────────┘

// Durante break:
┌─────────────────────────────────┐
│ ☕ Break Time                   │
├─────────────────────────────────┤
│                                 │
│     Break 1 of 4                │
│                                 │
│       ⏱️ 03:12                 │
│                                 │
│  Relájate! Vuelves en 3 min    │
│                                 │
│  ✅ Pomodoro completado         │
│     +5 puntos ganados           │
│                                 │
│  [Saltar break]                 │
│                                 │
└─────────────────────────────────┘
```

**Tracking:**

```typescript
interface PomodoroSession {
  id: string;
  subtaskId: string;
  startedAt: string;
  completedAt?: string;
  interrupted: boolean;
  cycleNumber: number; // 1, 2, 3, 4
  bonusPoints: number; // 5 or 30
}
```

**Stats:**

```
┌─────────────────────────────────────┐
│ 🍅 Estadísticas Pomodoro           │
├─────────────────────────────────────┤
│ Total completados: 87              │
│ Esta semana: 18                     │
│ Racha actual: 4 días                │
│ Ciclos completos (4x): 15           │
│ Bonus ganados: 510 puntos           │
│                                     │
│ Tiempo total focus: 36h 15min       │
│ Promedio por día: 2.3 pomodoros     │
└─────────────────────────────────────┘
```

---

## Base de Datos

### Schema Completo

#### user_profile

```sql
CREATE TABLE user_profile (
    id TEXT PRIMARY KEY,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    current_title TEXT DEFAULT 'novice',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_work_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Índices
CREATE INDEX idx_user_profile_level ON user_profile(level);
CREATE INDEX idx_user_profile_last_work ON user_profile(last_work_date);
```

#### achievements

```sql
CREATE TABLE achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'speed', 'volume', 'mastery', 'streak', 'perfection'
    icon TEXT,
    requirement_type TEXT NOT NULL, -- 'subtasks_count', 'subtasks_fast', 'category_level', etc.
    requirement_value INTEGER NOT NULL,
    points_reward INTEGER DEFAULT 0,
    badge_url TEXT,
    created_at TEXT NOT NULL
);

-- Seed inicial
INSERT INTO achievements (id, name, description, category, icon, requirement_type, requirement_value, points_reward, created_at) VALUES
('speed_01', 'Flash', 'Completa 10 subtasks en < 15 min', 'speed', '⚡', 'subtasks_fast_15', 10, 100, datetime('now')),
('speed_02', 'Speedrunner', 'Completa 50 subtasks en < 15 min', 'speed', '🏃', 'subtasks_fast_15', 50, 300, datetime('now')),
-- ... resto de achievements
;
```

#### user_achievements

```sql
CREATE TABLE user_achievements (
    id TEXT PRIMARY KEY,
    achievement_id TEXT NOT NULL,
    unlocked_at TEXT NOT NULL,
    FOREIGN KEY(achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at);
```

#### monthly_stats

```sql
CREATE TABLE monthly_stats (
    id TEXT PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_xp INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    subtasks_completed INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    average_efficiency REAL DEFAULT 0.0,
    created_at TEXT NOT NULL,
    UNIQUE(year, month)
);

-- Índices
CREATE INDEX idx_monthly_stats_date ON monthly_stats(year, month);
```

#### milestones

```sql
CREATE TABLE milestones (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'first_time', 'category_level', 'volume', 'points', 'streak'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    achieved_at TEXT NOT NULL,
    metadata TEXT -- JSON con datos adicionales
);

-- Índices
CREATE INDEX idx_milestones_type ON milestones(type);
CREATE INDEX idx_milestones_achieved ON milestones(achieved_at);
```

#### weekly_challenges

```sql
CREATE TABLE weekly_challenges (
    id TEXT PRIMARY KEY,
    week_number INTEGER NOT NULL, -- ISO week number
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL, -- 'volume', 'efficiency', 'category', 'streak', 'multiplier'
    requirement_value INTEGER NOT NULL,
    reward_points INTEGER NOT NULL,
    reward_badge TEXT,
    started_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    UNIQUE(year, week_number)
);
```

#### user_weekly_progress

```sql
CREATE TABLE user_weekly_progress (
    id TEXT PRIMARY KEY,
    challenge_id TEXT NOT NULL,
    current_progress INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0, -- boolean
    completed_at TEXT,
    FOREIGN KEY(challenge_id) REFERENCES weekly_challenges(id) ON DELETE CASCADE
);
```

#### pomodoro_sessions

```sql
CREATE TABLE pomodoro_sessions (
    id TEXT PRIMARY KEY,
    subtask_id TEXT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    interrupted INTEGER DEFAULT 0, -- boolean
    cycle_number INTEGER DEFAULT 1,
    bonus_points INTEGER DEFAULT 0,
    FOREIGN KEY(subtask_id) REFERENCES subtasks(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_pomodoro_subtask ON pomodoro_sessions(subtask_id);
CREATE INDEX idx_pomodoro_started ON pomodoro_sessions(started_at);
```

#### Modificaciones a Tablas Existentes

```sql
-- Agregar campos a time_sessions para tracking de multiplicadores
ALTER TABLE time_sessions ADD COLUMN combo_multiplier REAL DEFAULT 1.0;
ALTER TABLE time_sessions ADD COLUMN focus_bonus REAL DEFAULT 0.0;
ALTER TABLE time_sessions ADD COLUMN weekend_bonus REAL DEFAULT 0.0;
ALTER TABLE time_sessions ADD COLUMN streak_bonus REAL DEFAULT 0.0;
ALTER TABLE time_sessions ADD COLUMN total_bonus_xp INTEGER DEFAULT 0;

-- Agregar campos a subtasks
ALTER TABLE subtasks ADD COLUMN pomodoro_count INTEGER DEFAULT 0;
```

### Migraciones

```rust
// src-tauri/src/db.rs

fn migrate_add_gamification_tables(conn: &Connection) -> Result<()> {
    // user_profile
    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_profile (
            id TEXT PRIMARY KEY,
            level INTEGER DEFAULT 1,
            total_xp INTEGER DEFAULT 0,
            current_title TEXT DEFAULT 'novice',
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_work_date TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Crear perfil inicial si no existe
    let profile_exists: i64 = conn.query_row(
        "SELECT COUNT(*) FROM user_profile",
        [],
        |row| row.get(0)
    ).unwrap_or(0);

    if profile_exists == 0 {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO user_profile (id, created_at, updated_at) VALUES (?1, ?2, ?3)",
            params![id, &now, &now],
        )?;
    }

    // achievements
    conn.execute(
        "CREATE TABLE IF NOT EXISTS achievements (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            icon TEXT,
            requirement_type TEXT NOT NULL,
            requirement_value INTEGER NOT NULL,
            points_reward INTEGER DEFAULT 0,
            badge_url TEXT,
            created_at TEXT NOT NULL
        )",
        [],
    )?;

    // user_achievements
    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_achievements (
            id TEXT PRIMARY KEY,
            achievement_id TEXT NOT NULL,
            unlocked_at TEXT NOT NULL,
            FOREIGN KEY(achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // monthly_stats
    conn.execute(
        "CREATE TABLE IF NOT EXISTS monthly_stats (
            id TEXT PRIMARY KEY,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            total_xp INTEGER DEFAULT 0,
            total_points INTEGER DEFAULT 0,
            total_time_seconds INTEGER DEFAULT 0,
            subtasks_completed INTEGER DEFAULT 0,
            tasks_completed INTEGER DEFAULT 0,
            average_efficiency REAL DEFAULT 0.0,
            created_at TEXT NOT NULL,
            UNIQUE(year, month)
        )",
        [],
    )?;

    // milestones
    conn.execute(
        "CREATE TABLE IF NOT EXISTS milestones (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            achieved_at TEXT NOT NULL,
            metadata TEXT
        )",
        [],
    )?;

    // weekly_challenges
    conn.execute(
        "CREATE TABLE IF NOT EXISTS weekly_challenges (
            id TEXT PRIMARY KEY,
            week_number INTEGER NOT NULL,
            year INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            type TEXT NOT NULL,
            requirement_value INTEGER NOT NULL,
            reward_points INTEGER NOT NULL,
            reward_badge TEXT,
            started_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            UNIQUE(year, week_number)
        )",
        [],
    )?;

    // user_weekly_progress
    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_weekly_progress (
            id TEXT PRIMARY KEY,
            challenge_id TEXT NOT NULL,
            current_progress INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            completed_at TEXT,
            FOREIGN KEY(challenge_id) REFERENCES weekly_challenges(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // pomodoro_sessions
    conn.execute(
        "CREATE TABLE IF NOT EXISTS pomodoro_sessions (
            id TEXT PRIMARY KEY,
            subtask_id TEXT,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            interrupted INTEGER DEFAULT 0,
            cycle_number INTEGER DEFAULT 1,
            bonus_points INTEGER DEFAULT 0,
            FOREIGN KEY(subtask_id) REFERENCES subtasks(id) ON DELETE SET NULL
        )",
        [],
    )?;

    // Índices
    conn.execute("CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(type)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_pomodoro_subtask ON pomodoro_sessions(subtask_id)", [])?;

    println!("Migration: Added gamification tables");

    Ok(())
}

fn seed_default_achievements(conn: &Connection) -> Result<()> {
    let achievements = vec![
        // Speed
        ("speed_01", "Flash", "Completa 10 subtasks en < 15 min", "speed", "⚡", "subtasks_fast_15", 10, 100),
        ("speed_02", "Speedrunner", "Completa 50 subtasks en < 15 min", "speed", "🏃", "subtasks_fast_15", 50, 300),
        // ... resto
    ];

    for (id, name, desc, category, icon, req_type, req_val, reward) in achievements {
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT OR IGNORE INTO achievements
             (id, name, description, category, icon, requirement_type, requirement_value, points_reward, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![id, name, desc, category, icon, req_type, req_val, reward, &now],
        )?;
    }

    Ok(())
}
```

---

## Componentes UI

### GlobalLevelHeader

```tsx
import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';

export const GlobalLevelHeader: React.FC = () => {
  const { profile, loading } = useUserProfile();

  if (loading || !profile) return null;

  const progress = (profile.totalXp / profile.xpForNextLevel) * 100;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getTitleIcon(profile.currentTitle)}</span>
          <div>
            <div className="text-sm opacity-90">Level {profile.level}</div>
            <div className="text-lg font-bold">{formatTitle(profile.currentTitle)}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm opacity-90">
            {profile.totalXp.toLocaleString()} / {profile.xpForNextLevel.toLocaleString()} XP
          </div>
          <div className="text-xs opacity-75">
            {(profile.xpForNextLevel - profile.totalXp).toLocaleString()} to next level
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-right mt-1 opacity-75">
          {progress.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
```

### StreakIndicator

```tsx
import React from 'react';

interface StreakIndicatorProps {
  currentStreak: number;
  longestStreak: number;
  lastWorkDate: string;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  currentStreak,
  longestStreak,
  lastWorkDate,
}) => {
  const bonusPercentage = Math.min(Math.floor(currentStreak / 7) * 5, 50);
  const today = new Date().toISOString().split('T')[0];
  const isAtRisk = lastWorkDate !== today;

  return (
    <div className={`p-4 rounded-lg border-2 ${
      isAtRisk ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🔥</span>
        <div>
          <div className="text-lg font-bold text-gray-900">
            {currentStreak} Day Streak!
          </div>
          {bonusPercentage > 0 && (
            <div className="text-sm text-orange-600">
              +{bonusPercentage}% XP Bonus
            </div>
          )}
        </div>
      </div>

      {isAtRisk && (
        <div className="text-sm text-red-600 font-medium">
          ⚠️ At risk! Complete 1 subtask today to maintain streak.
        </div>
      )}

      <div className="text-xs text-gray-600 mt-2">
        Longest streak: {longestStreak} days
      </div>
    </div>
  );
};
```

### AchievementCard

```tsx
import React from 'react';
import type { Achievement } from '../types';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number;
  unlockedAt?: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  unlocked,
  progress = 0,
  unlockedAt,
}) => {
  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      unlocked
        ? 'border-green-500 bg-green-50'
        : 'border-gray-300 bg-gray-50 opacity-75'
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{unlocked ? '✅' : '🔒'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{achievement.icon}</span>
            <h3 className="font-bold text-gray-900">{achievement.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {achievement.description}
          </p>

          {!unlocked && progress !== undefined && (
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {progress.toFixed(0)}% complete
              </div>
            </div>
          )}

          {unlocked && unlockedAt && (
            <div className="mt-2 text-xs text-green-600">
              🎉 Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </div>
          )}

          <div className="mt-2 text-xs font-medium text-gray-700">
            Reward: {achievement.pointsReward} points
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## Fórmulas Matemáticas

### Sistema de Niveles

#### Nivel por Categoría (Existente)
```
level = floor(sqrt(xp / 100)) + 1
xp_for_level(L) = (L - 1)² × 100
xp_for_next_level(L) = L² × 100

Progreso:
xp_current_level = (level - 1)² × 100
xp_next_level = level² × 100
xp_in_current = total_xp - xp_current_level
xp_needed = xp_next_level - xp_current_level
progress_percentage = (xp_in_current / xp_needed) × 100
```

#### Nivel Global (Nuevo)
```
total_xp = Σ(all_categories.xp)
global_level = floor(sqrt(total_xp / 500)) + 1
xp_for_level(L) = (L - 1)² × 500
xp_for_next_level(L) = L² × 500
```

### Sistema de Puntos

#### Puntos Base (Existente)
```
base_points = 10
efficiency_bonus = (duration < 1500) ? 5 : 0
complexity_bonus = (subtasks >= 5 && all_done) ? 20 : 0

task_points = Σ(subtask_points) + complexity_bonus
subtask_points = base_points + efficiency_bonus
```

#### Puntos de Achievements (Nuevo)
```
achievement_points = predefined per achievement (100-2500)
total_points = task_points + achievement_points + challenge_points + pomodoro_points
```

### Sistema de XP

#### XP Base (Existente)
```
xp_gained = duration_seconds
```

#### XP con Multiplicadores (Nuevo)
```
streak_bonus = min(floor(streak_days / 7) × 0.05, 0.50)
combo_multiplier = 1.0 + floor(consecutive_count / 5) × 0.1
focus_bonus = (session_duration >= 7200) ? 0.20 : 0.0
weekend_bonus = is_weekend() ? 0.15 : 0.0

total_multiplier = 1.0 + streak_bonus + focus_bonus + weekend_bonus + (combo_multiplier - 1.0)
total_xp = base_xp × total_multiplier
bonus_xp = total_xp - base_xp
```

### Eficiencia

```
efficiency_rate = (subtasks_fast / subtasks_completed) × 100
where subtasks_fast = count(duration < 1500)
```

### Rachas

```
// Update streak
if last_work_date == today:
    current_streak = current_streak (no change)
else if last_work_date == yesterday:
    current_streak = current_streak + 1
    longest_streak = max(longest_streak, current_streak)
else:
    current_streak = 1 (reset)

last_work_date = today
```

---

## Achievements Completos

Ver sección [4. Sistema de Achievements](#4-sistema-de-achievements) para la lista completa de 20 achievements.

---

## Sistema de Títulos

| Título | Nivel | XP Requerido | Descripción |
|--------|-------|--------------|-------------|
| 🌱 Novice | 1-4 | 0 - 7,999 | Comenzando tu journey |
| 💼 Junior Developer | 5-9 | 8,000 - 39,999 | Ganando experiencia |
| 🚀 Mid-Level Developer | 10-14 | 40,000 - 89,999 | Solidificando skills |
| 💎 Senior Developer | 15-19 | 90,000 - 159,999 | Dominio técnico |
| 🏅 Expert Developer | 20-24 | 160,000 - 249,999 | Maestro múltiple |
| 👑 Master Developer | 25-29 | 250,000 - 359,999 | Elite técnico |
| ⭐ Legend | 30+ | 360,000+ | Leyenda viviente |

---

## Guía de Implementación

### Fase 1: TIER 1 - Core Gamification (2-3 semanas)

#### Semana 1: Nivel Global + Títulos ✅ **COMPLETADO** (2025-10-14)

**Backend:**
1. ✅ Migración de tabla `user_profile`
2. ✅ Crear perfil inicial
3. ✅ Comando `get_user_profile()`
4. ✅ Función `update_user_profile_level()` (ejecutar después de cada XP ganado)
5. ✅ Lógica para calcular nivel global (`calculate_global_level()`, `get_title_for_level()`)

**Frontend:**
6. ✅ Tipo `UserProfile`
7. ✅ Wrapper `getUserProfile()`
8. ✅ Hook `useUserProfile()`
9. ✅ Componente `GlobalLevelHeader` con gradientes dinámicos según título
10. ✅ Integrar en `App.tsx`

**Estado:** Totalmente funcional. El sistema actualiza automáticamente el nivel global cada vez que se completa una subtask con categoría.

#### Semana 2: Sistema de Racha ✅ **COMPLETADO** (2025-10-14)

**Backend:**
1. ✅ Campos de racha en `user_profile` (current_streak, longest_streak, last_work_date)
2. ✅ Lógica de actualización de racha en `complete_subtask()` vía `update_user_streak()`
3. ✅ Cálculo de bonificador de racha con `calculate_streak_bonus()`
4. ✅ Aplicar bonificador a XP ganado (base_xp + bonus_xp)

**Frontend:**
5. ✅ Mostrar racha en `UserProfile` interface y hook
6. ✅ Componente `StreakIndicator` con animaciones
7. ✅ Alerta de racha en riesgo (cuando lastWorkDate ≠ today)
8. ✅ Animación de llama 🔥 y visualización de bonus activo

**Estado:** Totalmente funcional. El sistema actualiza automáticamente la racha diaria y aplica bonificadores de XP de hasta +50% según días consecutivos trabajados.

#### Semana 3: Achievements

**Backend:**
1. Tabla `achievements` + seed
2. Tabla `user_achievements`
3. Comando `list_achievements()`
4. Comando `get_user_achievements()`
5. Lógica `check_achievements()` después de cada completar subtask
6. Comando `unlock_achievement()`

**Frontend:**
7. Tipos `Achievement`, `UserAchievement`
8. Wrappers de comandos
9. Hook `useAchievements()`
10. Componente `AchievementCard`
11. Modal `AchievementUnlockedModal`
12. Página de Achievements

### Fase 2: TIER 2 - Analytics (2 semanas)

#### Semana 4: Dashboard de Fortalezas + Comparativas

**Backend:**
1. Tabla `monthly_stats`
2. Comando `aggregate_monthly_stats()` (cron job)
3. Comando `get_monthly_comparison()`
4. Comando `get_strength_insights()`

**Frontend:**
5. Componentes de gráficas (Radar, Pie)
6. Componente `StrengthsDashboard`
7. Componente `MonthlyComparison`
8. Integrar en General Summary

#### Semana 5: Reportes + Milestones

**Backend:**
1. Tabla `milestones`
2. Lógica de detección de milestones
3. Comando `get_milestones()`

**Frontend:**
4. Librería jsPDF
5. Componente `ExportReportModal`
6. Generador de PDF
7. Componente `MilestoneTimeline`
8. Página de Milestones

### Fase 3: TIER 3 - Advanced (2-3 semanas)

#### Semana 6-7: Multiplicadores + Leaderboard

**Backend:**
1. Campos de multiplicadores en `time_sessions`
2. Lógica de combo, focus, weekend
3. Cálculo total de multiplicadores
4. Comando `get_personal_records()`

**Frontend:**
5. Componente `MultiplierIndicator`
6. Mostrar multiplicadores activos
7. Componente `PersonalLeaderboard`

#### Semana 8: Challenges + Pomodoro

**Backend:**
1. Tablas de challenges
2. Sistema de rotación semanal
3. Comandos de challenges
4. Tabla `pomodoro_sessions`
5. Comandos de pomodoro

**Frontend:**
6. Componente `WeeklyChallengeCard`
7. Componente `PomodoroTimer`
8. Integración con subtasks

---

## Ejemplos de Uso

### Ejemplo 1: Usuario Nuevo

```
Día 1:
- Crea primera tarea
- Completa primera subtask (10 min)
- Gana: 15 XP (Frontend), 15 puntos
- Milestone: "Primera Tarea Completada"
- Achievement: Ninguno aún

Día 2:
- Completa 3 subtasks (todas < 15 min)
- Gana: 180 XP, 45 puntos
- Racha: 2 días (bonus 0%)

Día 7:
- Completa 2 subtasks
- Racha: 7 días → ¡+5% XP bonus!
- Achievement desbloqueado: "Week Warrior" (+100 pts)
- Total acumulado: ~600 XP → Nivel 3
```

### Ejemplo 2: Usuario Avanzado

```
Día 100:
- Nivel global: 18 (Senior Developer)
- Racha: 42 días (+30% XP)
- Categorías:
  - Frontend: Nivel 12 (54,320 XP)
  - Backend: Nivel 8 (28,450 XP)
  - Testing: Nivel 2 (1,200 XP)

Sesión del día:
1. Trabaja 3h en Frontend (combo x1.2)
2. Completa 8 subtasks rápidas
3. Multiplicadores activos:
   - Racha: +30%
   - Combo: +20%
   - Focus: +20%
   Total: +70% bonus
4. XP ganado: 10,800 base × 1.70 = 18,360 XP
5. Achievements desbloqueados:
   - "Lightning" (100 subtasks < 15min)
   - "Category Master" (nivel 10 Frontend)
6. Frontend sube a Nivel 13
7. Milestone: "13,000 horas trabajadas"
```

### Ejemplo 3: Reporte para Manager

```
Franco Castro - Reporte Q4 2025

Resumen:
- 287 subtareas completadas
- 178.5 horas trabajadas
- 8,234 puntos ganados
- Nivel 16 (Senior Developer)

Categorías destacadas:
1. Frontend: 98h (55%)
2. Backend: 52h (29%)
3. Architecture: 28.5h (16%)

Eficiencia: 82% (236/287 subtasks < 25min)

Proyectos principales:
- Sistema de gamificación (45h)
- Refactor autenticación (28h)
- Dashboard analytics (35h)

Tendencia: +32% más productivo vs Q3
```

---

## Conclusión

Este sistema de gamificación transformará DevFocus en una aplicación que:

✅ **Motiva** con progreso visual constante
✅ **Recompensa** la consistencia y eficiencia
✅ **Celebra** cada logro alcanzado
✅ **Analiza** fortalezas y debilidades
✅ **Reporta** métricas profesionales
✅ **Inspira** a mejorar continuamente

La implementación por tiers permite agregar funcionalidad progresivamente, validando cada feature antes de continuar.

**Progreso actual:**
- ✅ Feature #1: Sistema de Nivel Global + Títulos (COMPLETADO - 2025-10-14)
- ✅ Feature #2: Sistema de Racha Diaria (Streak) (COMPLETADO - 2025-10-14)

**Siguiente paso:** Implementar Feature #3: Sistema de Achievements (20 logros) - TIER 1.

---

**Última actualización:** 2025-10-14
**Versión:** 1.2
**Autor:** DevFocus Team

## FEATURES A IMPLEMENTAR
  🏆 TIER 1: Core Gamification (Alta Prioridad)

  1. Sistema de Nivel Global + Títulos ⭐ ✅ **COMPLETADO** (2025-10-14)

  - ✅ Nivel único que representa progreso general del usuario
  - ✅ 7 títulos progresivos: Novice → Junior → Mid → Senior → Expert → Master → Legend
  - ✅ Barra de progreso global en header
  - ✅ Celebración al cambiar de título
  - ✅ Base de datos: tabla `user_profile` con nivel, XP total, título actual
  - ✅ Backend: Comandos `get_user_profile()`, actualización automática después de ganar XP
  - ✅ Frontend: Hook `useUserProfile()`, componente `GlobalLevelHeader` con gradientes dinámicos
  - ✅ Fórmula global: `level = floor(sqrt(total_xp / 500)) + 1` (más generosa que categorías)
  - **Duración real:** 1 semana
  - **Archivos modificados:**
    - Backend: `src-tauri/src/db.rs`, `src-tauri/src/models.rs`, `src-tauri/src/commands.rs`, `src-tauri/src/lib.rs`
    - Frontend: `src/shared/types/common.types.ts`, `src/lib/tauri/commands.ts`, `src/features/user-profile/*`, `src/App.tsx`

  2. Sistema de Racha Diaria (Streak) 🔥 ✅ **COMPLETADO** (2025-10-14)

  - ✅ Contador de días consecutivos trabajando
  - ✅ Bonificador de XP: +5% por cada 7 días (máx 50%)
  - ✅ Alertas si está por romper racha
  - ✅ Milestones visuales: 7, 14, 30, 60, 100 días
  - ✅ Animación de llama 🔥
  - ✅ Componentes: `StreakIndicator` integrado en `GlobalLevelHeader`
  - **Duración real:** 1 día
  - **Archivos modificados:**
    - Backend: `src-tauri/src/commands.rs` (funciones `calculate_streak_bonus()`, `update_user_streak()`, modificación de `complete_subtask()`)
    - Backend: `src-tauri/src/models.rs` (actualización de `SubtaskCompletion` con campos de streak)
    - Frontend: `src/shared/types/common.types.ts` (interface `SubtaskCompletion`)
    - Frontend: `src/features/user-profile/components/StreakIndicator.tsx` (nuevo componente)
    - Frontend: `src/features/user-profile/components/GlobalLevelHeader.tsx` (integración)
    - Frontend: `src/App.tsx` (logging de streak bonus)

  3. Sistema de Achievements (20 logros) 🏅

  - 5 categorías: Speed, Volume, Mastery, Streak, Perfection
  - 20 achievements desbloqueables
  - Badges visuales
  - Modal de celebración al desbloquear
  - Sistema de tracking automático
  - Página dedicada de achievements
  - Duración: ~1 semana

  4. Skill Tree Visual 🌳

  - Visualización tipo árbol de categorías
  - Badges por nivel (bronce/plata/oro/diamante)
  - Líneas conectoras entre nodos
  - Tooltips con información detallada
  - Animaciones al subir nivel
  - Duración: ~3-4 días

  ---
  📊 TIER 2: Analytics & Insights (Media Prioridad)

  5. Dashboard de Fortalezas 💪

  - Top 3 categorías destacadas
  - Radar chart de skills
  - Pie chart de distribución de tiempo
  - Sugerencias inteligentes de qué trabajar
  - Duración: ~3-4 días

  6. Estadísticas Comparativas Temporales 📈

  - Este mes vs mes anterior (XP, puntos, horas)
  - Esta semana vs semana anterior
  - Gráficas de evolución mensual/trimestral
  - Indicadores de tendencias (↑ +25% más productivo)
  - Duración: ~4-5 días

  7. Reportes Exportables Profesionales 📄

  - Exportar a PDF con diseño profesional
  - Secciones: Resumen ejecutivo, categorías, tareas principales, insights
  - Filtros por fecha y categoría
  - Formato presentable para managers/clientes
  - Duración: ~1 semana

  8. Milestones & Hitos Memorables 📅

  - Timeline de logros importantes
  - Tipos: Primeras veces, niveles, volumen, puntos
  - Celebraciones visuales
  - Galería de recuerdos
  - Duración: ~3-4 días

  ---
  🚀 TIER 3: Advanced Features (Baja Prioridad)

  9. Sistema de Multiplicadores 💪

  - Combo System: +10% XP por cada 5 subtasks en misma categoría
  - Focus Time Bonus: +20% XP por trabajar >2h continuas
  - Weekend Warrior: +15% XP sábados/domingos
  - Indicador de multiplicadores activos
  - Duración: ~4-5 días

  10. Leaderboard Personal 🏅

  - Ranking de records personales:
    - Mejor racha
    - Día más productivo
    - Semana/mes más productivo
    - Subtarea más rápida
    - Más XP en un día
    - Mayor eficiencia
  - Duración: ~2-3 días

  11. Challenges Semanales 🎯

  - Desafíos rotativos cada semana
  - 5 tipos: Volumen, Eficiencia, Categoría, Racha, Multiplicador
  - Recompensas especiales (puntos + badges)
  - Barra de progreso del challenge
  - Duración: ~1 semana

  12. Modo Pomodoro Integrado 🍅

  - Timer 25/5 minutos configurable
  - Bonus: +5 puntos por pomodoro completo
  - +25 puntos por 4 pomodoros consecutivos
  - Estadísticas de pomodoros
  - Integración con subtasks
  - Duración: ~1 semana

  ---
  📋 Resumen por Complejidad

  ✅ Fácil (2-3 días)

  - Leaderboard Personal (#10)
  - Skill Tree Visual (#4)

  🔸 Media (1 semana)

  - Sistema de Nivel Global + Títulos (#1)
  - Sistema de Racha Diaria (#2)
  - Dashboard de Fortalezas (#5)
  - Milestones & Hitos (#8)
  - Modo Pomodoro (#12)

  🔴 Compleja (1-2 semanas)

  - Sistema de Achievements (#3)
  - Estadísticas Comparativas (#6)
  - Reportes Exportables (#7)
  - Sistema de Multiplicadores (#9)
  - Challenges Semanales (#11)
