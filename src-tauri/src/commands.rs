use crate::models::*;
use chrono::Utc;
use rusqlite::{params, Result as SqlResult};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

pub struct AppState {
    pub db: Mutex<rusqlite::Connection>,
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
                    COALESCE(SUM(CASE WHEN ts.ended_at IS NOT NULL THEN ts.duration_seconds ELSE 0 END), 0) as total_time
             FROM subtasks s
             LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
             WHERE s.task_id = ?1
             GROUP BY s.id
             ORDER BY s.created_at"
        )
        .map_err(|e| e.to_string())?;

    let subtasks = stmt
        .query_map([&task_id], |row| {
            Ok(Subtask {
                id: row.get(0)?,
                task_id: row.get(1)?,
                title: row.get(2)?,
                status: SubtaskStatus::from_str(&row.get::<_, String>(3)?),
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                completed_at: row.get(6)?,
                total_time_seconds: Some(row.get(7)?),
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
// SUBTASK COMMANDS
// ============================================================================

#[tauri::command]
pub fn create_subtask(
    task_id: String,
    title: String,
    state: State<AppState>,
) -> Result<Subtask, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    let subtask = Subtask {
        id: Uuid::new_v4().to_string(),
        task_id,
        title,
        status: SubtaskStatus::Todo,
        created_at: now.clone(),
        updated_at: now,
        completed_at: None,
        total_time_seconds: Some(0),
    };

    conn.execute(
        "INSERT INTO subtasks (id, task_id, title, status, created_at, updated_at, completed_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            &subtask.id,
            &subtask.task_id,
            &subtask.title,
            subtask.status.as_str(),
            &subtask.created_at,
            &subtask.updated_at,
            &subtask.completed_at,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(subtask)
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

    // Get subtask with total time
    let mut stmt = conn
        .prepare(
            "SELECT s.id, s.task_id, s.title, s.status, s.created_at, s.updated_at, s.completed_at,
                    COALESCE(SUM(ts.duration_seconds), 0) as total_time
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
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(SubtaskCompletion {
        subtask,
        points_earned: points,
        time_spent_seconds: duration_seconds,
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
                    COALESCE(SUM(ts.duration_seconds), 0) as total_time
             FROM subtasks s
             LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
             WHERE s.task_id = ?1
             GROUP BY s.id
             ORDER BY s.created_at"
        )
        .map_err(|e| e.to_string())?;

    let subtasks_with_time: Vec<SubtaskWithTime> = stmt
        .query_map([&task_id], |row| {
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
pub fn get_subtask_with_session(
    subtask_id: String,
    state: State<AppState>,
) -> Result<(Subtask, Option<TimeSession>), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Get subtask with total time
    let mut stmt = conn
        .prepare(
            "SELECT s.id, s.task_id, s.title, s.status, s.created_at, s.updated_at, s.completed_at,
                    COALESCE(SUM(CASE WHEN ts.ended_at IS NOT NULL THEN ts.duration_seconds ELSE 0 END), 0) as total_time
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
                    sess.id as session_id, sess.started_at, sess.paused_at, sess.resumed_at, sess.ended_at, sess.duration_seconds
             FROM subtasks s
             LEFT JOIN time_sessions ts ON s.id = ts.subtask_id
             LEFT JOIN time_sessions sess ON s.id = sess.subtask_id AND sess.ended_at IS NULL
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
