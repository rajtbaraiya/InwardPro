import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/auth';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/entries', icon: '📋', label: 'Inward Entries' },
  { to: '/parties', icon: '🏢', label: 'Parties' },
  { to: '/materials', icon: '📦', label: 'Materials' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="logo-icon">🏭</div>
          <div>
            <div className="logo-text">InwardPro</div>
            <div className="logo-sub">Goods Management</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Main Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Logged in as</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.full_name || user?.username || 'User'}
          </div>
        </div>
        <button className="btn btn-secondary w-full" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
