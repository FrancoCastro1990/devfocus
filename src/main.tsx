import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import GeneralSummaryWindow from './features/metrics/components/GeneralSummaryWindow.tsx';
import TaskSummaryWindow from './features/metrics/components/TaskSummaryWindow.tsx';
import SubtaskTrackerWindow from './features/timer/components/SubtaskTrackerWindow.tsx';

const params = new URLSearchParams(window.location.search);
const view = params.get('view');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {{
      summary: <GeneralSummaryWindow />,
      'task-summary': <TaskSummaryWindow />,
      'subtask-tracker': <SubtaskTrackerWindow />,
    }[view ?? ''] ?? <App />}
  </StrictMode>,
);
