import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import DashboardPage from '../features/dashboard/DashboardPage';
import EntriesPage from '../features/entries/EntriesPage';
import PartiesPage from '../features/parties/PartiesPage';
import MaterialsPage from '../features/materials/MaterialsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'entries', element: <EntriesPage /> },
      { path: 'parties', element: <PartiesPage /> },
      { path: 'materials', element: <MaterialsPage /> },
    ]
  },
  // Redirect /login to dashboard too
  { path: '/login', element: <Navigate to="/dashboard" replace /> },
]);
