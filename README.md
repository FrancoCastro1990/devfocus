# DevFocus

A modern desktop task management application with integrated time tracking and gamification, built with Tauri, React, and TypeScript.

![DevFocus](https://img.shields.io/badge/Tauri-2.8-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38bdf8)

## ✨ Features

- 📋 **Task Management**: Create, organize, and track tasks with subtasks
- ⏱️ **Real-time Tracking**: Integrated timer with pause/resume functionality
- 🏷️ **Category System**: Tag subtasks with customizable categories (frontend, backend, etc.)
- ⭐ **Experience & Levels**: Earn XP in each category and level up your skills
- 🏆 **Global Level System**: Track your overall progress with 7 progressive titles (Novice → Legend)
- 🔥 **Daily Streak System**: Maintain consecutive work days and earn XP bonuses up to +50%
- 🎯 **Gamification**: Points system rewarding efficiency and productivity
- 📊 **Visual Metrics**: Detailed statistics with interactive charts and category progress
- 🔔 **System Tray Integration**: Minimize to tray, quick access menu, and tray notifications
- 💾 **Offline First**: All data stored locally in SQLite
- 🎨 **Modern UI**: Clean interface with animated status indicators and XP notifications
- 🌟 **Splash Screen**: Professional startup screen with smooth transition
- 🎭 **Theme System**: Dual themes (Glass & Retro Terminal) with instant switching
- ⚡ **Performance**: Native desktop app with minimal resource usage

## 🎮 Gamification System

### Points System

**Earning Points:**
- **Base Points**: 10 points per completed subtask
- **Efficiency Bonus**: +5 points for subtasks completed in < 25 minutes
- **Complexity Bonus**: +20 points for tasks with 5+ subtasks

### Global Level & Titles System ⭐ NEW

**Global Level:**
- Represents your **overall progress** across all categories
- Automatically calculated from total XP earned
- More generous progression than individual categories
- Displayed in a dynamic header with beautiful gradients

**Level Formula:**
```
Global Level = floor(sqrt(total_xp / 500)) + 1
XP for Next Level = (current_level)² × 500
```

**7 Progressive Titles:**

| Title | Level | Description |
|-------|-------|-------------|
| 🌱 Novice | 1-4 | Starting your journey |
| 💼 Junior Developer | 5-9 | Gaining experience |
| 🚀 Mid Developer | 10-14 | Solidifying skills |
| 💎 Senior Developer | 15-19 | Technical mastery |
| 🏅 Expert Developer | 20-24 | Multi-area expert |
| 👑 Master Developer | 25-29 | Technical elite |
| ⭐ Legend | 30+ | Living legend |

Each title has its own unique color gradient displayed in the Global Level Header.

### Daily Streak System 🔥 NEW

**Stay Consistent, Get Rewarded:**
- **Streak Counter**: Track consecutive days of completing at least 1 subtask
- **XP Bonuses**: Earn +5% XP bonus for every 7 days of streak (max +50%)
- **Smart Tracking**: Automatically updates when you complete subtasks
- **Visual Indicator**: See your current streak with animated flame icon
- **At-Risk Alerts**: Get notified if your streak is about to break

**Streak Bonus Formula:**
```
Bonus = floor(streak_days / 7) × 5%
Max Bonus = 50% (at 70+ day streak)

Examples:
- 7-day streak → +5% XP
- 14-day streak → +10% XP
- 28-day streak → +20% XP
- 70-day streak → +50% XP (maximum)
```

**How It Works:**
- Complete at least 1 subtask daily to maintain your streak
- Bonus XP is automatically applied to all subtask completions
- Your longest streak is saved and displayed
- Visual feedback shows next milestone (7, 14, 30, 60, 100 days)

**Streak Display:**
The streak indicator appears in the Global Level Header when active, showing:
- Current streak count with flame animation
- Current bonus percentage
- Next milestone target
- Alert if you haven't worked today

### Experience & Leveling System

**How XP Works:**
- **1 XP per second** of work on a categorized subtask
- XP is tied to specific categories (frontend, backend, architecture, etc.)
- **Total XP contributes to your global level**
- Each category has its own level and XP progression
- Visual XP gain notifications every 5 seconds while working

**Category Level Formula:**
```
Category Level = floor(sqrt(total_xp / 100)) + 1
XP for Next Level = (current_level)² × 100
```

**Example Category Progression:**
- Level 1: 0-99 XP
- Level 2: 100-399 XP (100 XP needed)
- Level 3: 400-899 XP (400 XP needed)
- Level 4: 900-1599 XP (900 XP needed)
- Level 5: 1600-2499 XP (1600 XP needed)

**Default Categories:**
- 🎨 Frontend (`#3b82f6` - Blue)
- ⚙️ Backend (`#10b981` - Green)
- 🏗️ Architecture (`#8b5cf6` - Purple)
- 💅 CSS (`#ec4899` - Pink)
- 🌊 Tailwind (`#06b6d4` - Cyan)

### Metrics Tracked

- Total time invested
- Average time per subtask
- Efficiency rate (% of subtasks completed quickly)
- Time distribution visualization
- Points earned breakdown
- **Global level and title** ⭐
- **Category XP and levels**
- **Progress to next level per category**
- **Progress to next global level** ⭐
- **Current streak and longest streak** 🔥 NEW
- **Streak bonus percentage** 🔥 NEW

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
3. **Optional**: Select or create a category for the subtask
   - Choose from existing categories
   - Click "Create new category" to add a custom one
   - Pick a color for your new category
4. **Start** - Begin tracking time for a subtask
   - Opens a floating tracker window with clean timer display
   - Shows real-time XP accumulation with subtle pulse animation
   - Subtask card displays animated border sweep effect every 5 seconds
5. **Pause** - Temporarily stop the timer (preserves accumulated time)
6. **Resume** - Continue tracking from where you paused
7. **Done** - Complete the subtask and earn XP (if categorized)

### Using Categories

**Assigning Categories:**
- When creating a subtask, select a category from the dropdown
- Categories are optional but enable the XP system
- Create custom categories with your preferred colors

**Earning XP:**
- Start a subtask with a category assigned
- Earn 1 XP per second of active work
- See live XP counter in the floating tracker window
- Watch animated "+5 XP" notifications every 5 seconds
- XP is awarded when you complete the subtask

**Tracking Progress:**
- Open **"General Summary"** to view all category stats
- See your level and total XP for each category
- Monitor progress bars showing advancement to next level
- Categories display in colorful cards with progress indicators

### System Tray

**Minimizing to Tray:**
- Click **"Minimize to Tray"** button in the main task list view
- The app will hide from taskbar and remain in system tray
- Click the tray icon to show/hide the main window

**Tray Menu Options:**
- **Show/Hide**: Toggle visibility of the main window
- **Open Summary**: Quick access to General Summary window
- **Quit**: Exit the application completely

**Tray Icon Features:**
- Left-click the tray icon to quickly show/hide the main window
- Right-click to access the context menu with all options
- App continues running in background when minimized to tray

### Active Subtask Indicator

In the main task list, tasks with active subtasks display:
- Purple gradient background matching "In Progress" tasks
- Animated pulsing circle indicator
- "Working on: [subtask name]" label
- **Animated border sweep effect** every 5 seconds (subtle light moving across the border)

### Splash Screen

When launching DevFocus:
- Professional startup screen displays during initialization
- Clean, minimalist design with app branding
- Smooth spinner animation indicates loading progress
- Automatically transitions to main window after 2 seconds
- Consistent with the liquid glass theme aesthetic

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
│   │   ├── categories/              # ⭐ Category & XP system
│   │   │   ├── components/          # CategoryBadge, CategorySelector,
│   │   │   │                        # CategoryCard, XpGainPopup
│   │   │   ├── hooks/               # useCategories
│   │   │   └── store/               # categoryStore (Zustand)
│   │   ├── user-profile/            # 🔥 Global Level & Streak system
│   │   │   ├── components/          # GlobalLevelHeader, StreakIndicator
│   │   │   ├── hooks/               # useUserProfile
│   │   │   └── store/               # userProfileStore (Zustand)
│   │   ├── timer/
│   │   │   ├── components/          # SubtaskTrackerWindow
│   │   │   └── hooks/               # useTimer
│   │   ├── metrics/
│   │   │   └── components/          # MetricsModal, GeneralSummaryWindow
│   │   └── splash/                  # 🌟 Splash Screen
│   │       └── components/          # SplashScreen
│   ├── shared/
│   │   ├── components/              # Button, Input, Modal, ThemeToggle
│   │   ├── contexts/                # ThemeContext
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # formatTime, formatDate
│   ├── lib/
│   │   └── tauri/                   # Tauri command wrappers
│   ├── App.tsx                      # Main application component
│   └── main.tsx                     # Application entry point
│
├── src-tauri/                        # Rust backend
│   ├── src/
│   │   ├── commands.rs              # Tauri command handlers (includes XP logic)
│   │   ├── db.rs                    # Database initialization (with migrations)
│   │   ├── models.rs                # Rust data structures (Category, XP models)
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
  category_id TEXT,               -- ⭐ NEW: Links to categories table
  FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### Categories ⭐ NEW
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,      -- Category name (e.g., 'frontend', 'backend')
  color TEXT NOT NULL,            -- Hex color code (e.g., '#3b82f6')
  created_at TEXT NOT NULL
);
```

### Category Experience ⭐
```sql
CREATE TABLE category_experience (
  id TEXT PRIMARY KEY,
  category_id TEXT UNIQUE NOT NULL,
  total_xp INTEGER DEFAULT 0,     -- Total XP earned in this category
  level INTEGER DEFAULT 1,        -- Current level (calculated from total_xp)
  updated_at TEXT NOT NULL,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### User Profile 🔥 NEW
```sql
CREATE TABLE user_profile (
  id TEXT PRIMARY KEY,
  level INTEGER DEFAULT 1,        -- Global level across all categories
  total_xp INTEGER DEFAULT 0,     -- Sum of XP from all categories
  current_title TEXT DEFAULT 'novice', -- Current title (novice, junior, mid, senior, expert, master, legend)
  current_streak INTEGER DEFAULT 0,    -- Current consecutive days streak
  longest_streak INTEGER DEFAULT 0,    -- Longest streak achieved
  last_work_date TEXT,                 -- Last date user completed a subtask (ISO 8601)
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
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

### Recently Completed ✅

- [x] **Category system** with customizable colors
- [x] **Experience & leveling system** for skill progression
- [x] **Global Level System** with 7 progressive titles
- [x] **Daily Streak System** with XP bonuses up to +50%
- [x] **XP gain animations** with visual feedback
- [x] **Floating timer widget** with category and XP display
- [x] **Category statistics** in dashboard
- [x] **System tray integration** with quick actions menu
- [x] **Dual theme system** (Glass & Retro Terminal) with instant switching
- [x] **Professional splash screen** with smooth startup transition

### Planned Features

- [ ] **Desktop notifications** when subtasks complete or level up
- [ ] **Additional themes** expansion
- [ ] **Keyboard shortcuts** for power users
- [ ] **Data export** (CSV, JSON)
- [ ] **Priority levels** for tasks
- [ ] **Historical analytics** with XP trends per category
- [ ] **Weekly/monthly reports** with category breakdown
- [ ] **Pomodoro mode** integration
- [ ] **Break reminders**
- [ ] **Goal setting** for category levels
- [ ] **Achievements system** (reach level 10, earn 10000 XP, etc.)
- [ ] **Category leaderboard** (personal best tracking)

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

## 🎯 Category & XP System Deep Dive

### How It Works

**1. Create Categories**
- 5 default categories included: Frontend, Backend, Architecture, CSS, Tailwind
- Create custom categories with your own names and colors
- Each category tracks its own XP and level independently

**2. Assign to Subtasks**
- When creating a subtask, optionally select a category
- Categories help organize work and enable XP earning
- Subtasks without categories don't earn XP

**3. Earn Experience**
- Start working on a categorized subtask
- Earn **1 XP per second** of active work time
- See real-time XP counter in the floating tracker window
- Visual "+5 XP" notifications appear every 5 seconds
- XP is awarded when completing the subtask

**4. Level Up**
- XP requirements increase quadratically: Level 2 needs 100 XP, Level 3 needs 400 XP
- Each category levels up independently
- Progress bars show advancement to next level

**5. Track Progress**
- View all category stats in the General Summary dashboard
- See total XP, current level, and progress percentage
- Category cards display with their custom colors

### Technical Implementation

**Frontend Components:**
- `CategorySelector` - Dropdown with inline category creation
- `CategoryBadge` - Colored tag showing category name
- `CategoryCard` - Dashboard card with level, XP, and progress bar
- `XpGainPopup` - Animated floating notifications

**Backend Logic:**
- XP calculated on subtask completion: `xp = duration_seconds`
- Level formula: `level = floor(sqrt(total_xp / 100)) + 1`
- Database stores total XP and auto-calculates level
- Foreign key relationships with CASCADE DELETE

**State Management:**
- Zustand store for categories and XP animations
- Real-time updates via Tauri events
- Optimistic UI updates for smooth experience

## 🙏 Acknowledgments

- **Tauri Team** - For the amazing desktop framework
- **React Team** - For the powerful UI library
- **Tailwind CSS** - For the utility-first CSS framework
- **Zustand** - For lightweight state management

---

**Built with ❤️ using Tauri, React, and TypeScript**

*DevFocus - Stay focused, track progress, earn rewards, level up your skills* 🚀
