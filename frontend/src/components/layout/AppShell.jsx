import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/entries': 'Inward Entries',
  '/parties': 'Party Management',
  '/materials': 'Material Types',
};

export default function AppShell() {
  const { pathname } = useLocation();
  const title = Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1] || 'InwardPro';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <header className="top-header">
          <div className="header-title">{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
