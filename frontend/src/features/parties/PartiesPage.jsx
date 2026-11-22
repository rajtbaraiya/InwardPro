import { useEffect, useState } from 'react';
import { getParties, createParty, updateParty, deleteParty } from '../../api/parties';

function PartyModal({ party, onClose, onSave }) {
  const [form, setForm] = useState({ name: party?.name || '', contact: party?.contact || '', address: party?.address || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Party name is required'); return; }
    setSaving(true); setError('');
    try {
      if (party) await updateParty(party.id, form);
      else await createParty(form);
      onSave();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save party');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">{party ? '✏️ Edit Party' : '➕ Add Party'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}
          <div className="form-group">
            <label className="form-label">Party Name *</label>
            <input className="form-input" type="text" placeholder="Enter party / supplier name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input className="form-input" type="text" placeholder="Phone number (optional)" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" placeholder="Address (optional)" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : party ? '💾 Update' : '➕ Add Party'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const fetch = () => {
    setLoading(true);
    getParties().then(r => { setParties(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(fetch, []);

  const filtered = parties.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    await deleteParty(deleteId);
    setDeleteId(null);
    fetch();
  };

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Party Management</h1>
          <p>{parties.length} parties registered</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input id="search-parties" placeholder="Search parties..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button id="add-party-btn" className="btn btn-primary" onClick={() => setModal('add')}>➕ Add Party</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /> Loading parties...</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3>No parties found</h3>
            <p>{search ? 'Try a different search' : 'Add your first party / supplier'}</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Party Name</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.contact || '—'}</td>
                  <td style={{ maxWidth: 200 }} className="truncate">{p.address || '—'}</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-success' : 'badge-muted'}`}>
                      {p.is_active ? '✓ Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal(p)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <PartyModal party={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetch(); }} />}

      {deleteId && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">🗑️ Delete Party</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body"><p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Delete this party? This cannot be undone.</p></div>
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
