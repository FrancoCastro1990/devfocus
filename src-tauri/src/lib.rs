mod commands;
mod db;
mod models;

use commands::AppState;
use std::sync::Mutex;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
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

      // Create tray menu
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

      // Create tray icon
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
            // Double click on tray icon to show/hide window
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
          "show_hide" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = if window.is_visible().unwrap_or(false) {
                window.hide()
              } else {
                window.show().and_then(|_| window.set_focus())
              };
            }
          }
          "open_summary" => {
            // Open or focus the general summary window
            if let Some(window) = app.get_webview_window("general-summary") {
              let _ = window.set_focus();
            } else {
              // Create the summary window if it doesn't exist
              use tauri::webview::WebviewWindowBuilder;
              let summary_url = if cfg!(debug_assertions) {
                "http://localhost:5173?view=summary"
              } else {
                "index.html?view=summary"
              };

              let _ = WebviewWindowBuilder::new(
                app,
                "general-summary",
                tauri::WebviewUrl::App(summary_url.parse().unwrap()),
              )
              .title("General Summary")
              .inner_size(960.0, 680.0)
              .resizable(false)
              .decorations(false)
              .always_on_top(true)
              .build();
            }
          }
          "quit" => {
            app.exit(0);
          }
          _ => {}
        })
        .build(app)?;

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
      commands::minimize_to_tray,
      commands::restore_from_tray,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
