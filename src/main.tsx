import { createRoot } from 'react-dom/client';
import type { ReactElement } from 'react';
import './index.css';
import App from './App.tsx';
import GeneralSummaryWindow from './features/metrics/components/GeneralSummaryWindow.tsx';
import TaskSummaryWindow from './features/metrics/components/TaskSummaryWindow.tsx';
import SubtaskTrackerWindow from './features/timer/components/SubtaskTrackerWindow.tsx';

const params = new URLSearchParams(window.location.search);
const view = params.get('view');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const viewComponents: Record<string, ReactElement> = {
  summary: <GeneralSummaryWindow />,
  'task-summary': <TaskSummaryWindow />,
  'subtask-tracker': <SubtaskTrackerWindow />,
};

createRoot(rootElement).render(
  view ? viewComponents[view] ?? <App /> : <App />
);
