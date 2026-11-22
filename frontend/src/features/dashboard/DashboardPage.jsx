import { useEffect, useState } from 'react';
import { getDashboard } from '../../api/dashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /> Loading dashboard...</div>;
  if (!data) return <div className="empty-state"><div>⚠️ Failed to load dashboard</div></div>;

  const { summary, material_stats, monthly_stats, party_stats } = data;

  const statCards = [
    { label: 'Total Entries', value: summary.total_entries, icon: '📋', color: 'purple', sub: 'All inward records' },
    { label: 'Received Weight', value: summary.total_received_weight.toLocaleString('en-IN'), icon: '⚖️', color: 'cyan', sub: 'Total received' },
    { label: 'Material Cost', value: `₹ ${summary.total_material_cost.toLocaleString('en-IN')}`, icon: '💰', color: 'green', sub: 'Total cost' },
    { label: 'Transport Cost', value: `₹ ${summary.total_transport_cost.toLocaleString('en-IN')}`, icon: '🚚', color: 'orange', sub: 'Freight charges' },
    { label: 'Actual Weight', value: summary.total_actual_weight.toLocaleString('en-IN'), icon: '📏', color: 'red', sub: 'Measured weight' },
  ];

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        {/* Bar Chart - Material Distribution */}
        <div className="chart-card">
          <div className="chart-title">📦 Entries by Material Type</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={material_stats} margin={{ top: 4, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Entries" radius={[4, 4, 0, 0]}>
                {material_stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Monthly Trend */}
        <div className="chart-card">
          <div className="chart-title">📈 Monthly Entry Trend</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly_stats} margin={{ top: 4, right: 10, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Entries" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        {/* Pie Chart - Weight by Material */}
        <div className="chart-card">
          <div className="chart-title">🥧 Weight Distribution by Material</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={material_stats.filter(m => m.total_weight > 0)} dataKey="total_weight" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {material_stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Parties */}
        <div className="chart-card">
          <div className="chart-title">🏢 Top Parties by Entries</div>
          {party_stats.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div style={{ fontSize: 32 }}>🏢</div>
              <p>No party data yet</p>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              {party_stats.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < party_stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 28, height: 28, background: `${COLORS[i]}22`, border: `1px solid ${COLORS[i]}44`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: COLORS[i] }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS[i] }}>{p.count} entries</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
