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

    // Categories table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            color TEXT NOT NULL,
            created_at TEXT NOT NULL
        )",
        [],
    )?;

    // Category experience table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS category_experience (
            id TEXT PRIMARY KEY,
            category_id TEXT UNIQUE NOT NULL,
            total_xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Subtasks table (with category support)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS subtasks (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            completed_at TEXT,
            category_id TEXT,
            FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
        )",
        [],
    )?;

    // Migrate existing subtasks table to add category_id if it doesn't exist
    migrate_add_category_to_subtasks(conn)?;

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
        "CREATE INDEX IF NOT EXISTS idx_subtasks_category_id ON subtasks(category_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_time_sessions_subtask_id ON time_sessions(subtask_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_category_experience_category_id ON category_experience(category_id)",
        [],
    )?;

    // Insert default categories if they don't exist
    seed_default_categories(conn)?;

    Ok(())
}

fn migrate_add_category_to_subtasks(conn: &Connection) -> Result<()> {
    // Check if category_id column exists in subtasks table
    let column_exists: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM pragma_table_info('subtasks') WHERE name='category_id'",
            [],
            |row| row.get::<_, i32>(0),
        )
        .unwrap_or(0)
        > 0;

    if !column_exists {
        // Add category_id column to existing subtasks table
        conn.execute(
            "ALTER TABLE subtasks ADD COLUMN category_id TEXT",
            [],
        )?;
        println!("Migration: Added category_id column to subtasks table");
    }

    Ok(())
}

fn seed_default_categories(conn: &Connection) -> Result<()> {
    let default_categories = vec![
        ("frontend", "#3b82f6"),
        ("backend", "#10b981"),
        ("architecture", "#8b5cf6"),
        ("css", "#ec4899"),
        ("tailwind", "#06b6d4"),
    ];

    let now = chrono::Utc::now().to_rfc3339();

    for (name, color) in default_categories {
        let id = uuid::Uuid::new_v4().to_string();

        // Try to insert, ignore if already exists
        conn.execute(
            "INSERT OR IGNORE INTO categories (id, name, color, created_at) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![id, name, color, &now],
        )?;

        // Get the category id (either newly inserted or existing)
        let category_id: String = conn.query_row(
            "SELECT id FROM categories WHERE name = ?1",
            [name],
            |row| row.get(0),
        )?;

        // Create category_experience entry if it doesn't exist
        let exp_id = uuid::Uuid::new_v4().to_string();
        conn.execute(
            "INSERT OR IGNORE INTO category_experience (id, category_id, total_xp, level, updated_at)
             VALUES (?1, ?2, 0, 1, ?3)",
            rusqlite::params![exp_id, &category_id, &now],
        )?;
    }

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
