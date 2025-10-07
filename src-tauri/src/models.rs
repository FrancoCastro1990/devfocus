use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskStatus {
    Todo,
    InProgress,
    Done,
}

impl TaskStatus {
    pub fn as_str(&self) -> &str {
        match self {
            TaskStatus::Todo => "todo",
            TaskStatus::InProgress => "in_progress",
            TaskStatus::Done => "done",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "in_progress" => TaskStatus::InProgress,
            "done" => TaskStatus::Done,
            _ => TaskStatus::Todo,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SubtaskStatus {
    Todo,
    InProgress,
    Paused,
    Done,
}

impl SubtaskStatus {
    pub fn as_str(&self) -> &str {
        match self {
            SubtaskStatus::Todo => "todo",
            SubtaskStatus::InProgress => "in_progress",
            SubtaskStatus::Paused => "paused",
            SubtaskStatus::Done => "done",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "in_progress" => SubtaskStatus::InProgress,
            "paused" => SubtaskStatus::Paused,
            "done" => SubtaskStatus::Done,
            _ => SubtaskStatus::Todo,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: TaskStatus,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Subtask {
    pub id: String,
    pub task_id: String,
    pub title: String,
    pub status: SubtaskStatus,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
    pub total_time_seconds: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimeSession {
    pub id: String,
    pub subtask_id: String,
    pub started_at: String,
    pub paused_at: Option<String>,
    pub resumed_at: Option<String>,
    pub ended_at: Option<String>,
    pub duration_seconds: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskWithSubtasks {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: TaskStatus,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
    pub subtasks: Vec<Subtask>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskWithActiveSubtask {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: TaskStatus,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
    pub active_subtask: Option<ActiveSubtaskInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActiveSubtaskInfo {
    pub id: String,
    pub title: String,
    pub total_time_seconds: i64,
    pub current_session_time: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubtaskWithTime {
    pub subtask: Subtask,
    pub total_time_seconds: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskMetrics {
    pub task_id: String,
    pub task_title: String,
    pub total_time_seconds: i64,
    pub total_points: i64,
    pub subtasks_completed: i64,
    pub subtasks_total: i64,
    pub average_time_per_subtask: f64,
    pub efficiency_rate: f64,
    pub completed_at: String,
    pub subtasks_with_time: Vec<SubtaskWithTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubtaskCompletion {
    pub subtask: Subtask,
    pub points_earned: i64,
    pub time_spent_seconds: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubtaskWithSession {
    pub subtask: Subtask,
    pub session: Option<TimeSession>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskWithSubtasksAndSessions {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: TaskStatus,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
    pub subtasks_with_sessions: Vec<SubtaskWithSession>,
}
