use crate::models::*;
use chrono::{Duration, NaiveDate, Utc};
use rusqlite::{params, Result as SqlResult};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

pub struct AppState {
    pub db: Mutex<rusqlite::Connection>,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/// Calculate level from total XP
/// Formula: level = floor(sqrt(xp / 100)) + 1
fn calculate_level(xp: i64) -> i64 {
    if xp <= 0 {
        return 1;
    }
    let level = ((xp as f64 / 100.0).sqrt().floor() as i64) + 1;
    level.max(1)
}

/// Calculate XP required for a specific level
/// Formula: xp = (level - 1)^2 * 100
fn calculate_xp_for_level(level: i64) -> i64 {
    ((level - 1).pow(2)) * 100
}

/// Get XP needed for next level
fn get_xp_for_next_level(current_level: i64) -> i64 {
    calculate_xp_for_level(current_level + 1)
}

/// Calculate progress percentage to next level
fn calculate_progress_percentage(total_xp: i64, current_level: i64) -> f64 {
    let xp_current_level = calculate_xp_for_level(current_level);
    let xp_next_level = get_xp_for_next_level(current_level);
    let xp_in_current_level = total_xp - xp_current_level;
    let xp_needed_for_next = xp_next_level - xp_current_level;

    if xp_needed_for_next <= 0 {
        return 100.0;
    }

    ((xp_in_current_level as f64 / xp_needed_for_next as f64) * 100.0).min(100.0).max(0.0)
}

// ============================================================================
// TASK COMMANDS
// ============================================================================

#[tauri::command]
pub fn create_task(
    title: String,
    description: Option<String>,
    state: State<AppState>,
) -> Result<Task, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    let task = Task {
        id: Uuid::new_v4().to_string(),
        title,
        description,
        status: TaskStatus::Todo,
        created_at: now.clone(),
        updated_at: now,
        completed_at: None,
    };

    conn.execute(
        "INSERT INTO tasks (id, title, description, status, created_at, updated_at, completed_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            &task.id,
            &task.title,
            &task.description,
            task.status.as_str(),
            &task.created_at,
            &task.updated_at,
            &task.completed_at,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(task)
}

#[tauri::command]
pub fn list_tasks_with_active_subtasks(
    status_filter: Option<String>,
    state: State<AppState>,
) -> Result<Vec<TaskWithActiveSubtask>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let query = if let Some(status) = status_filter {
        format!("SELECT id, title, description, status, created_at, updated_at, completed_at FROM tasks WHERE status = '{}' ORDER BY created_at DESC", status)
    } else {
        "SELECT id, title, description, status, created_at, updated_at, completed_at FROM tasks ORDER BY created_at DESC".to_string()
    };

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let task_rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?, // id
                row.get::<_, String>(1)?, // title
                row.get::<_, Option<String>>(2)?, // description
                row.get::<_, String>(3)?, // status
                row.get::<_, String>(4)?, // created_at
                row.get::<_, String>(5)?, // updated_at
                row.get::<_, Option<String>>(6)?, // completed_at
            ))
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<(String, String, Option<String>, String, String, String, Option<String>)>>>()
        .map_err(|e| e.to_string())?;

    let mut tasks_with_active = Vec::new();

    for (task_id, title, description, status_str, created_at, updated_at, completed_at) in task_rows {
        // Get active subtask for this task
        let mut active_stmt = conn
            .prepare(
                "SELECT s.id, s.title,
                        COALESCE(SUM(CASE WHEN ts.ended_at IS NOT NULL THEN ts.duration_seconds ELSE 0 END), 0) as total_time,
                        CASE WHEN sess.id IS NOT NULL THEN 
                            CAST((julianday('now') - julianday(sess.started_at)) * 86400 AS INTEGER)
                        ELSE 0 END as current_session
                 FROM subtasks s
                 LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
                 LEFT JOIN time_sessions sess ON s.id = sess.subtask_id AND sess.ended_at IS NULL
                 WHERE s.task_id = ?1 AND s.status = 'in_progress'
                 GROUP BY s.id, sess.id, sess.started_at
                 LIMIT 1"
            )
            .map_err(|e| e.to_string())?;

        let active_subtask = active_stmt
            .query_row([&task_id], |row| {
                Ok(ActiveSubtaskInfo {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    total_time_seconds: row.get(2)?,
                    current_session_time: row.get(3)?,
                })
            })
            .ok(); // Convert to None if no active subtask

        let task = TaskWithActiveSubtask {
            id: task_id,
            title,
            description,
            status: TaskStatus::from_str(&status_str),
            created_at,
            updated_at,
            completed_at,
            active_subtask,
        };

        tasks_with_active.push(task);
    }

    Ok(tasks_with_active)
}

#[tauri::command]
pub fn get_task_with_subtasks(
    task_id: String,
    state: State<AppState>,
) -> Result<TaskWithSubtasks, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Get task
    let mut stmt = conn
        .prepare("SELECT id, title, description, status, created_at, updated_at, completed_at FROM tasks WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let task = stmt
        .query_row([&task_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: TaskStatus::from_str(&row.get::<_, String>(3)?),
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                completed_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    // Get subtasks with total time (excluding active sessions)
    let mut stmt = conn
        .prepare(
            "SELECT s.id, s.task_id, s.title, s.status, s.created_at, s.updated_at, s.completed_at,
                    COALESCE(SUM(CASE WHEN ts.ended_at IS NOT NULL THEN ts.duration_seconds ELSE 0 END), 0) as total_time,
                    s.category_id, c.id, c.name, c.color, c.created_at
             FROM subtasks s
             LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
             LEFT JOIN categories c ON s.category_id = c.id
             WHERE s.task_id = ?1
             GROUP BY s.id
             ORDER BY s.created_at"
        )
        .map_err(|e| e.to_string())?;

    let subtasks = stmt
        .query_map([&task_id], |row| {
            let category_id: Option<String> = row.get(8)?;
            let category = if row.get::<_, Option<String>>(9)?.is_some() {
                Some(Category {
                    id: row.get(9)?,
                    name: row.get(10)?,
                    color: row.get(11)?,
                    created_at: row.get(12)?,
                })
            } else {
                None
            };

            Ok(Subtask {
                id: row.get(0)?,
                task_id: row.get(1)?,
                title: row.get(2)?,
                status: SubtaskStatus::from_str(&row.get::<_, String>(3)?),
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                completed_at: row.get(6)?,
                total_time_seconds: Some(row.get(7)?),
                category_id,
                category,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<Subtask>>>()
        .map_err(|e| e.to_string())?;

    Ok(TaskWithSubtasks {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        created_at: task.created_at,
        updated_at: task.updated_at,
        completed_at: task.completed_at,
        subtasks,
    })
}

#[tauri::command]
pub fn update_task_status(
    task_id: String,
    status: String,
    state: State<AppState>,
) -> Result<Task, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    let completed_at = if status == "done" { Some(now.clone()) } else { None };

    conn.execute(
        "UPDATE tasks SET status = ?1, updated_at = ?2, completed_at = ?3 WHERE id = ?4",
        params![&status, &now, &completed_at, &task_id],
    )
    .map_err(|e| e.to_string())?;

    // Query task in same scope
    let mut stmt = conn
        .prepare("SELECT id, title, description, status, created_at, updated_at, completed_at FROM tasks WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row([&task_id], |row| {
        Ok(Task {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            status: TaskStatus::from_str(&row.get::<_, String>(3)?),
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
            completed_at: row.get(6)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_task(task_id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks WHERE id = ?1", [&task_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}


// ============================================================================
// CATEGORY COMMANDS
// ============================================================================

#[tauri::command]
pub fn create_category(
    name: String,
    color: String,
    state: State<AppState>,
) -> Result<Category, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    let category = Category {
        id: Uuid::new_v4().to_string(),
        name: name.to_lowercase(),
        color,
        created_at: now.clone(),
    };

    conn.execute(
        "INSERT INTO categories (id, name, color, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![&category.id, &category.name, &category.color, &category.created_at],
    )
    .map_err(|e| e.to_string())?;

    // Create initial experience entry
    let exp_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO category_experience (id, category_id, total_xp, level, updated_at)
         VALUES (?1, ?2, 0, 1, ?3)",
        params![exp_id, &category.id, &now],
    )
    .map_err(|e| e.to_string())?;

    Ok(category)
}

#[tauri::command]
pub fn list_categories(state: State<AppState>) -> Result<Vec<Category>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, color, created_at FROM categories ORDER BY name")
        .map_err(|e| e.to_string())?;

    let categories = stmt
        .query_map([], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<Category>>>()
        .map_err(|e| e.to_string())?;

    Ok(categories)
}

#[tauri::command]
pub fn get_category_experience(
    category_id: String,
    state: State<AppState>,
) -> Result<CategoryExperience, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, category_id, total_xp, level, updated_at FROM category_experience WHERE category_id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row([&category_id], |row| {
        Ok(CategoryExperience {
            id: row.get(0)?,
            category_id: row.get(1)?,
            total_xp: row.get(2)?,
            level: row.get(3)?,
            updated_at: row.get(4)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_category_stats(state: State<AppState>) -> Result<Vec<CategoryStats>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT c.id, c.name, c.color, c.created_at, ce.total_xp, ce.level
             FROM categories c
             LEFT JOIN category_experience ce ON c.id = ce.category_id
             ORDER BY ce.level DESC, ce.total_xp DESC, c.name"
        )
        .map_err(|e| e.to_string())?;

    let stats = stmt
        .query_map([], |row| {
            let category = Category {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            };
            let total_xp: i64 = row.get(4)?;
            let level: i64 = row.get(5)?;
            let xp_for_next = get_xp_for_next_level(level);
            let progress = calculate_progress_percentage(total_xp, level);

            Ok(CategoryStats {
                category,
                total_xp,
                level,
                xp_for_next_level: xp_for_next,
                progress_percentage: progress,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<CategoryStats>>>()
        .map_err(|e| e.to_string())?;

    Ok(stats)
}

// ============================================================================
// SUBTASK COMMANDS
// ============================================================================

#[tauri::command]
pub fn create_subtask(
    task_id: String,
    title: String,
    category_id: Option<String>,
    state: State<AppState>,
) -> Result<Subtask, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    let subtask_id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO subtasks (id, task_id, title, status, created_at, updated_at, completed_at, category_id)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            &subtask_id,
            &task_id,
            &title,
            SubtaskStatus::Todo.as_str(),
            &now,
            &now,
            None::<String>,
            &category_id,
        ],
    )
    .map_err(|e| e.to_string())?;

    // Fetch category if exists
    let category = if let Some(ref cat_id) = category_id {
        conn.query_row(
            "SELECT id, name, color, created_at FROM categories WHERE id = ?1",
            [cat_id],
            |row| {
                Ok(Category {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    created_at: row.get(3)?,
                })
            },
        )
        .ok()
    } else {
        None
    };

    Ok(Subtask {
        id: subtask_id,
        task_id,
        title,
        status: SubtaskStatus::Todo,
        created_at: now.clone(),
        updated_at: now,
        completed_at: None,
        total_time_seconds: Some(0),
        category_id,
        category,
    })
}

#[tauri::command]
pub fn delete_subtask(subtask_id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM subtasks WHERE id = ?1", [&subtask_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================================
// STATE MANAGEMENT COMMANDS
// ============================================================================

#[tauri::command]
pub fn update_session_duration(
    subtask_id: String,
    duration_seconds: i64,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE time_sessions SET duration_seconds = ?1
         WHERE subtask_id = ?2 AND ended_at IS NULL",
        params![duration_seconds, &subtask_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn start_subtask(
    subtask_id: String,
    state: State<AppState>,
) -> Result<TimeSession, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    // Update subtask status
    conn.execute(
        "UPDATE subtasks SET status = ?1, updated_at = ?2 WHERE id = ?3",
        params!["in_progress", &now, &subtask_id],
    )
    .map_err(|e| e.to_string())?;

    // Create time session
    let session = TimeSession {
        id: Uuid::new_v4().to_string(),
        subtask_id: subtask_id.clone(),
        started_at: now,
        paused_at: None,
        resumed_at: None,
        ended_at: None,
        duration_seconds: 0,
    };

    conn.execute(
        "INSERT INTO time_sessions (id, subtask_id, started_at, paused_at, resumed_at, ended_at, duration_seconds)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            &session.id,
            &session.subtask_id,
            &session.started_at,
            &session.paused_at,
            &session.resumed_at,
            &session.ended_at,
            &session.duration_seconds,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(session)
}

#[tauri::command]
pub fn pause_subtask(
    subtask_id: String,
    duration_seconds: i64,
    state: State<AppState>,
) -> Result<TimeSession, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    // Update subtask status
    conn.execute(
        "UPDATE subtasks SET status = ?1, updated_at = ?2 WHERE id = ?3",
        params!["paused", &now, &subtask_id],
    )
    .map_err(|e| e.to_string())?;

    // Update time session
    conn.execute(
        "UPDATE time_sessions SET paused_at = ?1, duration_seconds = ?2
         WHERE subtask_id = ?3 AND ended_at IS NULL",
        params![&now, duration_seconds, &subtask_id],
    )
    .map_err(|e| e.to_string())?;

    // Get active session in same scope
    let mut stmt = conn
        .prepare("SELECT id, subtask_id, started_at, paused_at, resumed_at, ended_at, duration_seconds FROM time_sessions WHERE subtask_id = ?1 AND ended_at IS NULL")
        .map_err(|e| e.to_string())?;

    stmt.query_row([&subtask_id], |row| {
        Ok(TimeSession {
            id: row.get(0)?,
            subtask_id: row.get(1)?,
            started_at: row.get(2)?,
            paused_at: row.get(3)?,
            resumed_at: row.get(4)?,
            ended_at: row.get(5)?,
            duration_seconds: row.get(6)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn resume_subtask(
    subtask_id: String,
    state: State<AppState>,
) -> Result<TimeSession, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    // Update subtask status
    conn.execute(
        "UPDATE subtasks SET status = ?1, updated_at = ?2 WHERE id = ?3",
        params!["in_progress", &now, &subtask_id],
    )
    .map_err(|e| e.to_string())?;

    // Update time session
    conn.execute(
        "UPDATE time_sessions SET resumed_at = ?1
         WHERE subtask_id = ?2 AND ended_at IS NULL",
        params![&now, &subtask_id],
    )
    .map_err(|e| e.to_string())?;

    // Get active session in same scope
    let mut stmt = conn
        .prepare("SELECT id, subtask_id, started_at, paused_at, resumed_at, ended_at, duration_seconds FROM time_sessions WHERE subtask_id = ?1 AND ended_at IS NULL")
        .map_err(|e| e.to_string())?;

    stmt.query_row([&subtask_id], |row| {
        Ok(TimeSession {
            id: row.get(0)?,
            subtask_id: row.get(1)?,
            started_at: row.get(2)?,
            paused_at: row.get(3)?,
            resumed_at: row.get(4)?,
            ended_at: row.get(5)?,
            duration_seconds: row.get(6)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn complete_subtask(
    subtask_id: String,
    duration_seconds: i64,
    state: State<AppState>,
) -> Result<SubtaskCompletion, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    // Get category_id before updating subtask
    let category_id: Option<String> = conn
        .query_row(
            "SELECT category_id FROM subtasks WHERE id = ?1",
            [&subtask_id],
            |row| row.get(0),
        )
        .ok();

    // Update subtask status
    conn.execute(
        "UPDATE subtasks SET status = ?1, updated_at = ?2, completed_at = ?3 WHERE id = ?4",
        params!["done", &now, &now, &subtask_id],
    )
    .map_err(|e| e.to_string())?;

    // Update time session
    conn.execute(
        "UPDATE time_sessions SET ended_at = ?1, duration_seconds = ?2
         WHERE subtask_id = ?3 AND ended_at IS NULL",
        params![&now, duration_seconds, &subtask_id],
    )
    .map_err(|e| e.to_string())?;

    // Calculate points
    let base_points = 10;
    let efficiency_bonus = if duration_seconds < 1500 { 5 } else { 0 }; // < 25 min
    let points = base_points + efficiency_bonus;

    // Calculate XP (1 XP per second)
    let xp_gained = duration_seconds;

    // Update category experience if category exists
    let category = if let Some(cat_id) = category_id {
        // Get current XP
        let current_xp: i64 = conn
            .query_row(
                "SELECT total_xp FROM category_experience WHERE category_id = ?1",
                [&cat_id],
                |row| row.get(0),
            )
            .unwrap_or(0);

        let new_xp = current_xp + xp_gained;
        let new_level = calculate_level(new_xp);

        // Update experience
        conn.execute(
            "UPDATE category_experience SET total_xp = ?1, level = ?2, updated_at = ?3
             WHERE category_id = ?4",
            params![new_xp, new_level, &now, &cat_id],
        )
        .map_err(|e| e.to_string())?;

        // Fetch category info
        conn.query_row(
            "SELECT id, name, color, created_at FROM categories WHERE id = ?1",
            [&cat_id],
            |row| {
                Ok(Category {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    created_at: row.get(3)?,
                })
            },
        )
        .ok()
    } else {
        None
    };

    // Get subtask with total time and category
    let mut stmt = conn
        .prepare(
            "SELECT s.id, s.task_id, s.title, s.status, s.created_at, s.updated_at, s.completed_at,
                    COALESCE(SUM(ts.duration_seconds), 0) as total_time, s.category_id
             FROM subtasks s
             LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
             WHERE s.id = ?1
             GROUP BY s.id"
        )
        .map_err(|e| e.to_string())?;

    let subtask = stmt
        .query_row([&subtask_id], |row| {
            Ok(Subtask {
                id: row.get(0)?,
                task_id: row.get(1)?,
                title: row.get(2)?,
                status: SubtaskStatus::from_str(&row.get::<_, String>(3)?),
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                completed_at: row.get(6)?,
                total_time_seconds: Some(row.get(7)?),
                category_id: row.get(8)?,
                category: category.clone(),
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(SubtaskCompletion {
        subtask,
        points_earned: points,
        time_spent_seconds: duration_seconds,
        xp_gained,
        category,
    })
}


// ============================================================================
// METRICS COMMANDS
// ============================================================================

#[tauri::command]
pub fn get_task_metrics(
    task_id: String,
    state: State<AppState>,
) -> Result<TaskMetrics, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Get task
    let mut stmt = conn
        .prepare("SELECT title, completed_at FROM tasks WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let (task_title, completed_at): (String, Option<String>) = stmt
        .query_row([&task_id], |row| Ok((row.get(0)?, row.get(1)?)))
        .map_err(|e| e.to_string())?;

    // Get subtasks with time
    let mut stmt = conn
        .prepare(
            "SELECT s.id, s.task_id, s.title, s.status, s.created_at, s.updated_at, s.completed_at,
                    COALESCE(SUM(ts.duration_seconds), 0) as total_time,
                    s.category_id, c.id, c.name, c.color, c.created_at
             FROM subtasks s
             LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
             LEFT JOIN categories c ON s.category_id = c.id
             WHERE s.task_id = ?1
             GROUP BY s.id
             ORDER BY s.created_at"
        )
        .map_err(|e| e.to_string())?;

    let subtasks_with_time: Vec<SubtaskWithTime> = stmt
        .query_map([&task_id], |row| {
            let category_id: Option<String> = row.get(8)?;
            let category = if row.get::<_, Option<String>>(9)?.is_some() {
                Some(Category {
                    id: row.get(9)?,
                    name: row.get(10)?,
                    color: row.get(11)?,
                    created_at: row.get(12)?,
                })
            } else {
                None
            };

            Ok(SubtaskWithTime {
                subtask: Subtask {
                    id: row.get(0)?,
                    task_id: row.get(1)?,
                    title: row.get(2)?,
                    status: SubtaskStatus::from_str(&row.get::<_, String>(3)?),
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                    completed_at: row.get(6)?,
                    total_time_seconds: Some(row.get(7)?),
                    category_id,
                    category,
                },
                total_time_seconds: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<SubtaskWithTime>>>()
        .map_err(|e| e.to_string())?;

    let subtasks_total = subtasks_with_time.len() as i64;
    let subtasks_completed = subtasks_with_time.iter().filter(|s| matches!(s.subtask.status, SubtaskStatus::Done)).count() as i64;
    let total_time_seconds: i64 = subtasks_with_time.iter().map(|s| s.total_time_seconds).sum();

    // Calculate points
    let mut total_points: i64 = 0;
    let mut efficient_count = 0;

    for subtask in &subtasks_with_time {
        if matches!(subtask.subtask.status, SubtaskStatus::Done) {
            total_points += 10; // Base points
            if subtask.total_time_seconds < 1500 {
                total_points += 5; // Efficiency bonus
                efficient_count += 1;
            }
        }
    }

    // Complexity bonus
    if subtasks_total >= 5 {
        total_points += 20;
    }

    let average_time_per_subtask = if subtasks_completed > 0 {
        total_time_seconds as f64 / subtasks_completed as f64
    } else {
        0.0
    };

    let efficiency_rate = if subtasks_completed > 0 {
        (efficient_count as f64 / subtasks_completed as f64) * 100.0
    } else {
        0.0
    };

    Ok(TaskMetrics {
        task_id,
        task_title,
        total_time_seconds,
        total_points,
        subtasks_completed,
        subtasks_total,
        average_time_per_subtask,
        efficiency_rate,
        completed_at: completed_at.unwrap_or_else(|| Utc::now().to_rfc3339()),
        subtasks_with_time,
    })
}

#[tauri::command]
pub fn get_general_metrics(state: State<AppState>) -> Result<GeneralMetrics, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    #[derive(Debug)]
    struct CompletedSubtaskData {
        completed_at: Option<String>,
        total_time: i64,
    }

    let mut stmt = conn
        .prepare(
            "SELECT s.completed_at,
                    COALESCE(SUM(ts.duration_seconds), 0) as total_time
             FROM subtasks s
             LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
             WHERE s.status = 'done'
             GROUP BY s.id",
        )
        .map_err(|e| e.to_string())?;

    let completed_subtasks = stmt
        .query_map([], |row| {
            Ok(CompletedSubtaskData {
                completed_at: row.get(0)?,
                total_time: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<CompletedSubtaskData>>>()
        .map_err(|e| e.to_string())?;

    #[derive(Default, Clone, Copy)]
    struct DailyAggregate {
        points: i64,
        subtasks: i64,
    }

    let mut daily_totals: HashMap<NaiveDate, DailyAggregate> = HashMap::new();
    let mut total_points: i64 = 0;
    let mut total_duration: i64 = 0;

    for data in &completed_subtasks {
        let duration = data.total_time;
        let base_points: i64 = 10;
        let efficiency_bonus: i64 = if duration < 1_500 { 5 } else { 0 };
        let points = base_points + efficiency_bonus;

        total_points += points;
        total_duration += duration;

        if let Some(completed_at) = &data.completed_at {
            if let Ok(parsed) = chrono::DateTime::parse_from_rfc3339(completed_at) {
                let date = parsed.with_timezone(&Utc).date_naive();
                let entry = daily_totals.entry(date).or_insert_with(DailyAggregate::default);
                entry.points += points;
                entry.subtasks += 1;
            }
        }
    }

    let mut task_stmt = conn
        .prepare(
            "SELECT t.completed_at,
                    COUNT(s.id) as total_subtasks,
                    SUM(CASE WHEN s.status = 'done' THEN 1 ELSE 0 END) as done_subtasks
             FROM tasks t
             LEFT JOIN subtasks s ON t.id = s.task_id
             GROUP BY t.id",
        )
        .map_err(|e| e.to_string())?;

    let task_rows = task_stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, Option<String>>(0)?,
                row.get::<_, i64>(1)?,
                row.get::<_, Option<i64>>(2)?,
            ))
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<(Option<String>, i64, Option<i64>)>>>()
        .map_err(|e| e.to_string())?;

    for (completed_at, total_subtasks, done_subtasks_opt) in task_rows {
        let done_subtasks = done_subtasks_opt.unwrap_or(0);
        if total_subtasks >= 5 && total_subtasks > 0 && done_subtasks == total_subtasks {
            total_points += 20;
            if let Some(completed_at) = completed_at {
                if let Ok(parsed) = chrono::DateTime::parse_from_rfc3339(&completed_at) {
                    let date = parsed.with_timezone(&Utc).date_naive();
                    let entry = daily_totals.entry(date).or_insert_with(DailyAggregate::default);
                    entry.points += 20;
                }
            }
        }
    }

    let total_tasks_completed: i64 = conn
        .query_row("SELECT COUNT(*) FROM tasks WHERE status = 'done'", [], |row| row.get(0))
        .unwrap_or(0);

    let total_subtasks_completed = completed_subtasks.len() as i64;

    let today = Utc::now().date_naive();
    let start_date = today - Duration::days(6);

    let mut points_last_7_days = Vec::new();
    let mut points_this_week: i64 = 0;
    let mut best_day: Option<DailyPoints> = None;

    for offset in 0..7 {
        let date = start_date + Duration::days(offset as i64);
        let entry = daily_totals.get(&date).copied().unwrap_or_default();
        let date_str = date.format("%Y-%m-%d").to_string();
        let daily_points = DailyPoints {
            date: date_str,
            points: entry.points,
            subtasks_completed: entry.subtasks,
        };

        points_this_week += entry.points;

        if entry.points > 0 {
            match &best_day {
                Some(current_best) if current_best.points >= entry.points => {}
                _ => best_day = Some(daily_points.clone()),
            }
        }

        points_last_7_days.push(daily_points);
    }

    let points_today = daily_totals.get(&today).map(|d| d.points).unwrap_or(0);

    let average_completion_time_seconds = if total_subtasks_completed > 0 {
        total_duration as f64 / total_subtasks_completed as f64
    } else {
        0.0
    };

    Ok(GeneralMetrics {
        total_points,
        points_today,
        points_this_week,
        points_last_7_days,
        best_day,
        total_tasks_completed,
        total_subtasks_completed,
        average_completion_time_seconds,
    })
}

#[tauri::command]
pub fn get_subtask_with_session(
    subtask_id: String,
    state: State<AppState>,
) -> Result<(Subtask, Option<TimeSession>), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Get subtask with total time
    let mut stmt = conn
        .prepare(
            "SELECT s.id, s.task_id, s.title, s.status, s.created_at, s.updated_at, s.completed_at,
                    COALESCE(SUM(CASE WHEN ts.ended_at IS NOT NULL THEN ts.duration_seconds ELSE 0 END), 0) as total_time,
                    s.category_id, c.id, c.name, c.color, c.created_at
             FROM subtasks s
             LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
             LEFT JOIN categories c ON s.category_id = c.id
             WHERE s.id = ?1
             GROUP BY s.id"
        )
        .map_err(|e| e.to_string())?;

    let subtask = stmt
        .query_row([&subtask_id], |row| {
            let category_id: Option<String> = row.get(8)?;
            let category = if row.get::<_, Option<String>>(9)?.is_some() {
                Some(Category {
                    id: row.get(9)?,
                    name: row.get(10)?,
                    color: row.get(11)?,
                    created_at: row.get(12)?,
                })
            } else {
                None
            };

            Ok(Subtask {
                id: row.get(0)?,
                task_id: row.get(1)?,
                title: row.get(2)?,
                status: SubtaskStatus::from_str(&row.get::<_, String>(3)?),
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                completed_at: row.get(6)?,
                total_time_seconds: Some(row.get(7)?),
                category_id,
                category,
            })
        })
        .map_err(|e| e.to_string())?;

    // Get active session if exists
    let mut session_stmt = conn
        .prepare("SELECT id, subtask_id, started_at, paused_at, resumed_at, ended_at, duration_seconds FROM time_sessions WHERE subtask_id = ?1 AND ended_at IS NULL")
        .map_err(|e| e.to_string())?;

    let session = session_stmt
        .query_row([&subtask_id], |row| {
            Ok(TimeSession {
                id: row.get(0)?,
                subtask_id: row.get(1)?,
                started_at: row.get(2)?,
                paused_at: row.get(3)?,
                resumed_at: row.get(4)?,
                ended_at: row.get(5)?,
                duration_seconds: row.get(6)?,
            })
        })
        .ok(); // Convert to None if no active session

    Ok((subtask, session))
}

#[tauri::command]
pub fn get_task_with_subtasks_and_sessions(
    task_id: String,
    state: State<AppState>,
) -> Result<TaskWithSubtasksAndSessions, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Get task
    let mut stmt = conn
        .prepare("SELECT id, title, description, status, created_at, updated_at, completed_at FROM tasks WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let task = stmt
        .query_row([&task_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: TaskStatus::from_str(&row.get::<_, String>(3)?),
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                completed_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    // Get subtasks with total time and active sessions
    let mut stmt = conn
        .prepare(
            "SELECT s.id, s.task_id, s.title, s.status, s.created_at, s.updated_at, s.completed_at,
                    COALESCE(SUM(CASE WHEN ts.ended_at IS NOT NULL THEN ts.duration_seconds ELSE 0 END), 0) as total_time,
                    sess.id as session_id, sess.started_at, sess.paused_at, sess.resumed_at, sess.ended_at, sess.duration_seconds,
                    s.category_id, c.id, c.name, c.color, c.created_at
             FROM subtasks s
             LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
             LEFT JOIN time_sessions sess ON s.id = sess.subtask_id AND sess.ended_at IS NULL
             LEFT JOIN categories c ON s.category_id = c.id
             WHERE s.task_id = ?1
             GROUP BY s.id, sess.id, sess.started_at, sess.paused_at, sess.resumed_at, sess.ended_at, sess.duration_seconds
             ORDER BY s.created_at"
        )
        .map_err(|e| e.to_string())?;

    let subtasks_with_sessions = stmt
        .query_map([&task_id], |row| {
            let session = if row.get::<_, Option<String>>(8)?.is_some() {
                Some(TimeSession {
                    id: row.get(8)?,
                    subtask_id: row.get(0)?,
                    started_at: row.get(9)?,
                    paused_at: row.get(10)?,
                    resumed_at: row.get(11)?,
                    ended_at: row.get(12)?,
                    duration_seconds: row.get(13)?,
                })
            } else {
                None
            };

            let category_id: Option<String> = row.get(14)?;
            let category = if row.get::<_, Option<String>>(15)?.is_some() {
                Some(Category {
                    id: row.get(15)?,
                    name: row.get(16)?,
                    color: row.get(17)?,
                    created_at: row.get(18)?,
                })
            } else {
                None
            };

            Ok(SubtaskWithSession {
                subtask: Subtask {
                    id: row.get(0)?,
                    task_id: row.get(1)?,
                    title: row.get(2)?,
                    status: SubtaskStatus::from_str(&row.get::<_, String>(3)?),
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                    completed_at: row.get(6)?,
                    total_time_seconds: Some(row.get(7)?),
                    category_id,
                    category,
                },
                session,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<SubtaskWithSession>>>()
        .map_err(|e| e.to_string())?;

    Ok(TaskWithSubtasksAndSessions {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        created_at: task.created_at,
        updated_at: task.updated_at,
        completed_at: task.completed_at,
        subtasks_with_sessions,
    })
}
