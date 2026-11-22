import { useEffect, useState } from 'react';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../../api/materials';

function MaterialModal({ material, onClose, onSave }) {
  const [name, setName] = useState(material?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Material name is required'); return; }
    setSaving(true); setError('');
    try {
      if (material) await updateMaterial(material.id, { name });
      else await createMaterial({ name });
      onSave();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save material');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div className="modal-title">{material ? '✏️ Edit Material' : '➕ Add Material'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}
          <div className="form-group">
            <label className="form-label">Material Name *</label>
            <input className="form-input" type="text" placeholder="e.g. Plastic Waste" value={name} onChange={e => setName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleSave()} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            This material will appear in the dropdown when creating inward entries.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : material ? '💾 Update' : '➕ Add Material'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetch = () => {
    setLoading(true);
    getMaterials().then(r => { setMaterials(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(fetch, []);

  const handleDelete = async () => {
    await deleteMaterial(deleteId);
    setDeleteId(null);
    fetch();
  };

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Material Types</h1>
          <p>Manage dropdown options for inward entries</p>
        </div>
        <button id="add-material-btn" className="btn btn-primary" onClick={() => setModal('add')}>➕ Add Material</button>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /> Loading materials...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {materials.map((m, i) => (
            <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              <div style={{ width: 36, height: 36, background: `rgba(99,102,241,0.15)`, border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary-light)', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>
                  <span className={`badge ${m.is_active ? 'badge-success' : 'badge-muted'}`} style={{ fontSize: 10 }}>
                    {m.is_active ? '✓ Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(m)}>✏️</button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(m.id)}>🗑️</button>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <div
            className="card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', border: '1px dashed var(--border)', background: 'transparent', minHeight: 70, color: 'var(--text-muted)', fontSize: 13, transition: 'all 0.2s' }}
            onClick={() => setModal('add')}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ➕ Add New Material
          </div>
        </div>
      )}

      {modal && <MaterialModal material={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetch(); }} />}

      {deleteId && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">🗑️ Delete Material</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body"><p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Delete this material type? Existing entries with this material will not be affected.</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
