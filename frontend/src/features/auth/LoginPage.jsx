import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { setCredentials } from '../../store/auth';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // If already logged in, skip login page
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(form);
      // Save token first, then dispatch to Redux
      localStorage.setItem('token', data.access_token);
      dispatch(setCredentials({ token: data.access_token, user: { username: form.username } }));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏭</div>
          <div>
            <div className="login-logo-text">InwardPro</div>
            <div className="login-logo-sub">Goods Inward Management</div>
          </div>
        </div>

        <div className="login-heading">Welcome back</div>
        <div className="login-sub">Sign in to access your dashboard</div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="username"
              className="form-input"
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: 8, padding: '12px', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in...</> : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Default Credentials
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Username: <strong style={{ color: 'var(--primary-light)' }}>admin</strong> &nbsp;|&nbsp; Password: <strong style={{ color: 'var(--primary-light)' }}>admin123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
