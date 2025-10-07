use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub fn get_db_path() -> PathBuf {
    let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("devfocus");
    std::fs::create_dir_all(&path).ok();
    path.push("devfocus.db");
    path
}

pub fn init_db() -> Result<Connection> {
    let db_path = get_db_path();
    let conn = Connection::open(db_path)?;

    create_tables(&conn)?;

    Ok(conn)
}

fn create_tables(conn: &Connection) -> Result<()> {
    // Tasks table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            completed_at TEXT
        )",
        [],
    )?;

    // Subtasks table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS subtasks (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            completed_at TEXT,
            FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Time sessions table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS time_sessions (
            id TEXT PRIMARY KEY,
            subtask_id TEXT NOT NULL,
            started_at TEXT NOT NULL,
            paused_at TEXT,
            resumed_at TEXT,
            ended_at TEXT,
            duration_seconds INTEGER DEFAULT 0,
            FOREIGN KEY(subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Create indices for better performance
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_time_sessions_subtask_id ON time_sessions(subtask_id)",
        [],
    )?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_db_creation() {
        let conn = init_db().unwrap();
        assert!(conn.is_autocommit());
    }
}
