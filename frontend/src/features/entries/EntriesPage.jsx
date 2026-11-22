import { useEffect, useState, useCallback, useRef } from 'react';
import { getEntries, createEntry, updateEntry, deleteEntry } from '../../api/entries';
import { getActiveMaterials } from '../../api/materials';
import { getActiveParties, createParty } from '../../api/parties';

const emptyForm = {
  manifest_date: '', received_date: '', manifest_no: '', truck_number: '',
  material_id: '', manifest_weight: '', actual_weight: '', received_weight: '',
  rate: '', transport_cost: '', material_cost: '', party_id: '', station: '', remark: ''
};

/* ── Party Autocomplete Input ───────────────────────────────────────── */
function PartyAutocomplete({ parties, value, onChange, onPartyCreated }) {
  const [inputVal, setInputVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrapRef = useRef(null);

  // Sync inputVal when editing an existing entry
  useEffect(() => {
    if (value) {
      const found = parties.find(p => p.id === Number(value));
      setInputVal(found ? found.name : '');
    } else {
      setInputVal('');
    }
  }, [value, parties]);

  const handleInput = (e) => {
    const v = e.target.value;
    setInputVal(v);
    onChange(''); // clear party_id while typing
    if (v.trim().length === 0) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const matches = parties.filter(p =>
      p.name.toLowerCase().includes(v.toLowerCase())
    );
    setSuggestions(matches);
    setOpen(true);
  };

  const selectParty = (party) => {
    setInputVal(party.name);
    onChange(party.id);
    setOpen(false);
  };

  const handleBlur = async (e) => {
    // Delay so click on suggestion registers first
    setTimeout(async () => {
      setOpen(false);
      const trimmed = inputVal.trim();
      if (!trimmed) { onChange(''); return; }
      // Check if already selected
      const matched = parties.find(p => p.name.toLowerCase() === trimmed.toLowerCase());
      if (matched) {
        setInputVal(matched.name);
        onChange(matched.id);
        return;
      }
      // Auto-create new party
      setCreating(true);
      try {
        const { data: newParty } = await createParty({ name: trimmed });
        onPartyCreated(newParty);
        setInputVal(newParty.name);
        onChange(newParty.id);
      } catch {
        // Party might already exist (race), try to find it
        const existing = parties.find(p => p.name.toLowerCase() === trimmed.toLowerCase());
        if (existing) { selectParty(existing); }
      } finally {
        setCreating(false);
      }
    }, 150);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const trimmed = inputVal.trim();
  const isNew = trimmed.length > 0 && !parties.find(p => p.name.toLowerCase() === trimmed.toLowerCase());

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        className="form-input"
        type="text"
        placeholder="Type party name..."
        value={inputVal}
        onChange={handleInput}
        onFocus={() => { if (inputVal.trim()) setOpen(true); }}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {creating && (
        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
          <span className="spinner" style={{ width: 14, height: 14 }} />
        </div>
      )}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', marginTop: 4,
          maxHeight: 200, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          {suggestions.length > 0 ? suggestions.map(p => (
            <div
              key={p.id}
              onMouseDown={() => selectParty(p)}
              style={{
                padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                color: 'var(--text-primary)', borderBottom: '1px solid var(--border)',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              🏢 {p.name}
            </div>
          )) : null}
          {isNew && (
            <div
              onMouseDown={() => { setOpen(false); }}
              style={{
                padding: '9px 14px', fontSize: 13, cursor: 'default',
                color: 'var(--accent)', fontStyle: 'italic'
              }}
            >
              ✨ Save as new party: "{trimmed}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Entry Modal ────────────────────────────────────────────────────── */
function EntryModal({ entry, materials, parties, onClose, onSave, onPartyCreated }) {
  const [form, setForm] = useState(entry ? {
    manifest_date: entry.manifest_date || '',
    received_date: entry.received_date || '',
    manifest_no: entry.manifest_no || '',
    truck_number: entry.truck_number || '',
    material_id: entry.material_id || '',
    manifest_weight: entry.manifest_weight ?? '',
    actual_weight: entry.actual_weight ?? '',
    received_weight: entry.received_weight ?? '',
    rate: entry.rate ?? '',
    transport_cost: entry.transport_cost ?? '',
    material_cost: entry.material_cost ?? '',
    party_id: entry.party_id || '',
    station: entry.station || '',
    remark: entry.remark || ''
  } : { ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
      );
      if (entry) await updateEntry(entry.id, payload);
      else await createEntry(payload);
      onSave();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{entry ? `✏️ Edit Entry #${entry.entry_no}` : '➕ New Inward Entry'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

          {/* Row 1: Dates & IDs */}
          <div className="form-grid form-grid-3" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Manifest Date</label>
              <input className="form-input" type="date" value={form.manifest_date} onChange={e => set('manifest_date', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Received Date</label>
              <input className="form-input" type="date" value={form.received_date} onChange={e => set('received_date', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Manifest No</label>
              <input className="form-input" type="text" placeholder="e.g. MNF-001" value={form.manifest_no} onChange={e => set('manifest_no', e.target.value)} />
            </div>
          </div>

          {/* Row 2: Truck, Material, Party */}
          <div className="form-grid form-grid-3" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Truck Number</label>
              <input className="form-input" type="text" placeholder="e.g. GJ01AB1234" value={form.truck_number} onChange={e => set('truck_number', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Material</label>
              <select className="form-select" value={form.material_id} onChange={e => set('material_id', e.target.value)}>
                <option value="">— Select Material —</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Party Name</label>
              <PartyAutocomplete
                parties={parties}
                value={form.party_id}
                onChange={(id) => set('party_id', id)}
                onPartyCreated={onPartyCreated}
              />
            </div>
          </div>

          {/* Row 3: Weights */}
          <div className="form-grid form-grid-3" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Manifest Weight</label>
              <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.manifest_weight} onChange={e => set('manifest_weight', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Actual Weight</label>
              <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.actual_weight} onChange={e => set('actual_weight', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Received Weight</label>
              <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.received_weight} onChange={e => set('received_weight', e.target.value)} />
            </div>
          </div>

          {/* Row 4: Costs */}
          <div className="form-grid form-grid-3" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Rate</label>
              <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.rate} onChange={e => set('rate', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Transport Cost</label>
              <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.transport_cost} onChange={e => set('transport_cost', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Material Cost</label>
              <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.material_cost} onChange={e => set('material_cost', e.target.value)} />
            </div>
          </div>

          {/* Row 5: Station & Remark */}
          <div className="form-grid form-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Station</label>
              <input className="form-input" type="text" placeholder="Station / Location" value={form.station} onChange={e => set('station', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Remark</label>
              <input className="form-input" type="text" placeholder="Optional notes" value={form.remark} onChange={e => set('remark', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : entry ? '💾 Update Entry' : '➕ Add Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Entries Page ───────────────────────────────────────────────────── */
export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeMaterial) params.material_id = activeMaterial;
      if (search) params.search = search;
      const { data } = await getEntries(params);
      setEntries(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [activeMaterial, search]);

  useEffect(() => {
    getActiveMaterials().then(r => setMaterials(r.data));
    getActiveParties().then(r => setParties(r.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchEntries, 300);
    return () => clearTimeout(timer);
  }, [fetchEntries]);

  const handleDelete = async () => {
    await deleteEntry(deleteId);
    setDeleteId(null);
    fetchEntries();
  };

  // When a new party is auto-created from the autocomplete, add it to local list
  const handlePartyCreated = (newParty) => {
    setParties(prev => [...prev, newParty]);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
  const fmtNum = (n) => n != null ? Number(n).toLocaleString('en-IN') : '—';

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Inward Entries</h1>
          <p>{total} total records</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              id="search-entries"
              placeholder="Search manifest, truck, station..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button id="add-entry-btn" className="btn btn-primary" onClick={() => setModal('add')}>
            ➕ Add Entry
          </button>
        </div>
      </div>

      {/* Material Filter Chips — horizontally scrollable */}
      <div className="filter-chips-scroll">
        <div className="filter-chips-inner">
          <div
            className={`chip ${!activeMaterial ? 'active' : ''}`}
            onClick={() => setActiveMaterial(null)}
          >
            All Materials
          </div>
          {materials.map(m => (
            <div
              key={m.id}
              className={`chip ${activeMaterial === m.id ? 'active' : ''}`}
              onClick={() => setActiveMaterial(activeMaterial === m.id ? null : m.id)}
            >
              {m.name}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-screen"><div className="spinner" /> Loading entries...</div>
      ) : entries.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No entries found</h3>
            <p>{search || activeMaterial ? 'Try adjusting your filters' : 'Click "Add Entry" to create your first inward record'}</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Manifest Date</th>
                <th>Received Date</th>
                <th>Manifest No</th>
                <th>Truck No</th>
                <th>Material</th>
                <th>Manifest Wt</th>
                <th>Actual Wt</th>
                <th>Received Wt</th>
                <th>Rate</th>
                <th>Transport</th>
                <th>Mat. Cost</th>
                <th>Party</th>
                <th>Station</th>
                <th>Remark</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td className="font-medium">{e.entry_no}</td>
                  <td>{fmtDate(e.manifest_date)}</td>
                  <td>{fmtDate(e.received_date)}</td>
                  <td>{e.manifest_no || '—'}</td>
                  <td>{e.truck_number || '—'}</td>
                  <td>
                    {e.material
                      ? <span className="badge badge-primary">{e.material.name}</span>
                      : '—'}
                  </td>
                  <td>{fmtNum(e.manifest_weight)}</td>
                  <td>{fmtNum(e.actual_weight)}</td>
                  <td>{fmtNum(e.received_weight)}</td>
                  <td>{fmtNum(e.rate)}</td>
                  <td>{fmtNum(e.transport_cost)}</td>
                  <td>{fmtNum(e.material_cost)}</td>
                  <td>{e.party?.name || '—'}</td>
                  <td>{e.station || '—'}</td>
                  <td style={{ maxWidth: 120 }} className="truncate">{e.remark || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal(e)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(e.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <EntryModal
          entry={modal === 'add' ? null : modal}
          materials={materials}
          parties={parties}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchEntries(); }}
          onPartyCreated={handlePartyCreated}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">🗑️ Delete Entry</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Are you sure you want to delete this entry? This action cannot be undone.
              </p>
            </div>
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
