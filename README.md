# DevFocus

A modern desktop task management application with integrated time tracking and gamification, built with Tauri, React, and TypeScript.

![DevFocus](https://img.shields.io/badge/Tauri-2.8-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38bdf8)

## ✨ Features

- 📋 **Task Management**: Create, organize, and track tasks with subtasks
- ⏱️ **Real-time Tracking**: Integrated timer with pause/resume functionality
- 🎯 **Gamification**: Points system rewarding efficiency and productivity
- 📊 **Visual Metrics**: Detailed statistics with interactive charts
- 💾 **Offline First**: All data stored locally in SQLite
- 🎨 **Modern UI**: Clean interface with animated status indicators
- ⚡ **Performance**: Native desktop app with minimal resource usage

## 🎮 Points System

### Earning Points

- **Base Points**: 10 points per completed subtask
- **Efficiency Bonus**: +5 points for subtasks completed in < 25 minutes
- **Complexity Bonus**: +20 points for tasks with 5+ subtasks

### Metrics Tracked

- Total time invested
- Average time per subtask
- Efficiency rate (% of subtasks completed quickly)
- Time distribution visualization
- Points earned breakdown

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Rust** (latest stable version)
- **Cargo** (comes with Rust)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devfocus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri:dev
   ```

4. **Build for production**
   ```bash
   npm run tauri:build
   ```

   Built application will be in `src-tauri/target/release/`

## 📖 Usage Guide

### Creating Tasks

1. Click the **"+ New Task"** button in the main view
2. Enter a task title (required) and description (optional)
3. Click **"Create Task"**

### Working with Subtasks

1. Click on any task to open the detail view
2. Click **"+ Add Subtask"** to break down the task
3. **Start** - Begin tracking time for a subtask
4. **Pause** - Temporarily stop the timer (preserves accumulated time)
5. **Resume** - Continue tracking from where you paused
6. **Done** - Complete the subtask and stop tracking

### Active Subtask Indicator

In the main task list, tasks with active subtasks display:
- Blue background matching "In Progress" tasks
- Animated pulsing circle indicator
- "Working on: [subtask name]" label

### Viewing Metrics

When all subtasks in a task are completed:
1. A metrics modal automatically appears
2. Review your performance:
   - Total time spent
   - Points earned with breakdown
   - Efficiency rate
   - Time distribution chart
3. Click **"Mark Task as Done"** to complete the entire task

## 🏗️ Tech Stack

### Frontend

- **React 19.1** - UI framework with latest features
- **TypeScript 5.9** - Type-safe development
- **Vite 7.1** - Lightning-fast build tool
- **Tailwind CSS 4.1** - Utility-first styling with modern features
- **Zustand 5.0** - Lightweight state management
- **Recharts 3.2** - Data visualization library

### Backend

- **Tauri 2.8** - Rust-based desktop framework
- **Rust** - High-performance backend
- **SQLite (rusqlite)** - Embedded database
- **UUID** - Unique identifier generation
- **Chrono** - Date/time handling

### Development Tools

- **ESLint 9** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **React Hooks ESLint** - React best practices

## 📁 Project Structure

```
devfocus/
├── src/                              # React frontend
│   ├── features/                     # Feature-based modules
│   │   ├── tasks/
│   │   │   ├── components/          # TaskList, TaskCard, TaskForm
│   │   │   ├── hooks/               # useTasks, useTaskActions
│   │   │   └── store/               # taskStore (Zustand)
│   │   ├── subtasks/
│   │   │   ├── components/          # SubtaskList, SubtaskItem
│   │   │   └── store/               # subtaskStore (Zustand)
│   │   ├── timer/
│   │   │   └── hooks/               # useTimer
│   │   └── metrics/
│   │       └── components/          # MetricsModal
│   ├── shared/
│   │   ├── components/              # Button, Input, Modal
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # formatTime, formatDate
│   ├── lib/
│   │   └── tauri/                   # Tauri command wrappers
│   ├── App.tsx                      # Main application component
│   └── main.tsx                     # Application entry point
│
├── src-tauri/                        # Rust backend
│   ├── src/
│   │   ├── commands.rs              # Tauri command handlers
│   │   ├── db.rs                    # Database initialization
│   │   ├── models.rs                # Rust data structures
│   │   └── lib.rs                   # Application entry point
│   └── Cargo.toml                   # Rust dependencies
│
├── package.json                      # Node dependencies
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
└── tailwind.config.js                # Tailwind configuration
```

## 🗄️ Database Schema

### Tasks
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

### Subtasks
```sql
CREATE TABLE subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,           -- 'todo', 'in_progress', 'paused', 'done'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

### Time Sessions
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

## 🛠️ Development

### Available Scripts

```bash
# Start Vite dev server only
npm run dev

# Build frontend for production
npm run build

# Run Tauri app in development (recommended)
npm run tauri:dev

# Build production desktop app
npm run tauri:build

# Lint code with ESLint
npm run lint

# Preview production build
npm run preview
```

### Architecture Patterns

**Feature-based Architecture**
- Each feature is self-contained with its own components, hooks, and stores
- Promotes modularity and easier testing
- Clear separation of concerns

**State Management Strategy**
- Zustand stores for global state (tasks, subtasks, active sessions)
- React hooks for local component state
- Tauri commands for backend communication
- SQLite for persistent storage

**Timer Implementation**
- Client-side intervals using `setInterval`
- Duration tracked in seconds
- Database persistence on pause/complete
- Automatic session recovery on app restart

## 📍 Data Location

The SQLite database file is stored at:

- **Windows**: `%LOCALAPPDATA%\devfocus\devfocus.db`
- **macOS**: `~/Library/Application Support/devfocus/devfocus.db`
- **Linux**: `~/.local/share/devfocus/devfocus.db`

To reset all data, delete this file and restart the application.

## 🔧 Troubleshooting

### Build Issues

**Rust compilation errors:**
```bash
# Update Rust toolchain
rustup update stable
```

**Node dependency issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Runtime Issues

**Database locked:**
- Close any other instances of the app
- Check task manager for orphaned processes

**Timer not updating:**
- Check browser console for errors
- Verify active session exists in database

## 🚧 Roadmap

### Planned Features

- [ ] **Desktop notifications** when subtasks complete
- [ ] **Tray icon** with quick actions
- [ ] **Floating timer widget** for always-on-top display
- [ ] **Dark mode** theme support
- [ ] **Keyboard shortcuts** for power users
- [ ] **Data export** (CSV, JSON)
- [ ] **Task categories/tags** for better organization
- [ ] **Priority levels** for tasks
- [ ] **Historical analytics** with trends
- [ ] **Weekly/monthly reports**
- [ ] **Pomodoro mode** integration
- [ ] **Break reminders**
- [ ] **Goal setting** and tracking

### Performance Optimizations

- [ ] Virtual scrolling for large task lists
- [ ] Lazy loading for metrics charts
- [ ] Database query optimization
- [ ] Bundle size reduction

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code style (use ESLint)
- Write descriptive commit messages
- Update documentation as needed
- Test thoroughly before submitting PR

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Tauri Team** - For the amazing desktop framework
- **React Team** - For the powerful UI library
- **Tailwind CSS** - For the utility-first CSS framework
- **Zustand** - For lightweight state management

---

**Built with ❤️ using Tauri, React, and TypeScript**

*DevFocus - Stay focused, track progress, earn rewards*
