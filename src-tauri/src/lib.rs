mod commands;
mod db;
mod models;

use commands::AppState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Initialize database
      let conn = db::init_db().expect("Failed to initialize database");
      app.manage(AppState { db: Mutex::new(conn) });

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::create_task,
      commands::list_tasks_with_active_subtasks,
      commands::get_task_with_subtasks,
      commands::get_task_with_subtasks_and_sessions,
      commands::update_task_status,
      commands::delete_task,
      commands::create_subtask,
      commands::delete_subtask,
      commands::start_subtask,
      commands::pause_subtask,
      commands::resume_subtask,
      commands::complete_subtask,
      commands::get_task_metrics,
      commands::get_general_metrics,
      commands::get_subtask_with_session,
      commands::create_category,
      commands::list_categories,
      commands::get_category_experience,
      commands::get_all_category_stats,
      commands::get_user_profile,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
