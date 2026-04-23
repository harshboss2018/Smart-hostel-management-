import React, { useEffect, useState } from 'react';
import { UserPlus, Shield, Edit, Trash2, CheckCircle, X } from 'lucide-react';
import API from '../../api/axios';

const emptyForm = {
  name: '',
  email: '',
  referenceId: '',
  hostelId: '',
};

const ManageWardens = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const fetchWardens = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/users/wardens');
      setWardens(data);
    } catch (error) {
      setToast(error.response?.data?.message || 'Failed to fetch wardens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardens();
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openCreate = () => {
    setEditingId('');
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (warden) => {
    setEditingId(warden._id);
    setFormData({
      name: warden.name || '',
      email: warden.email || '',
      referenceId: warden.referenceId || '',
      hostelId: warden.hostelId || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (editingId) {
      setWardens((current) =>
        current.map((warden) =>
          warden._id === editingId ? { ...warden, ...formData } : warden,
        ),
      );
      setToast('Warden details updated.');
    } else {
      setWardens((current) => [
        {
          _id: `local_${Date.now()}`,
          ...formData,
          role: 'warden',
        },
        ...current,
      ]);
      setToast('New warden added to the dashboard.');
    }

    setIsModalOpen(false);
    setFormData(emptyForm);
    setEditingId('');
  };

  const handleDelete = (wardenId, name) => {
    setWardens((current) => current.filter((warden) => warden._id !== wardenId));
    setToast(`${name} removed from active roster.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Warden Management</h2>
          <p>Add, edit, or remove hostel warden accounts and assignments.</p>
        </div>
        <button className="submit-btn btn-small" onClick={openCreate} style={{ background: 'var(--primary-color)' }}>
          <UserPlus size={16} /> Add Warden
        </button>
      </div>

      {toast && (
        <div className="toast success">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      <div className="glass-card dashboard-content">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Warden ID</th>
                <th>Name</th>
                <th>Assigned Block</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner">Fetching authorized staff...</div></td></tr>
              ) : wardens.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No wardens registered in the system.</td></tr>
              ) : wardens.map((w) => (
                <tr key={w._id}>
                  <td><span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{w.referenceId || 'W-REF'}</span></td>
                  <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={14} style={{ color: 'var(--primary-color)' }} /> {w.name}
                  </td>
                  <td>{w.hostelId || 'All Blocks'}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{w.email}</div>
                  </td>
                  <td>
                    <span className="badge success">Active</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="submit-btn btn-small"
                        onClick={() => openEdit(w)}
                        style={{ padding: '0.4rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)' }}
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="submit-btn btn-small"
                        onClick={() => handleDelete(w._id, w.name)}
                        style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)' }}
                        title="Revoke Access"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{editingId ? 'Edit Warden' : 'Add New Warden'}</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Name</label>
                <input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required />
              </div>
              <div className="input-group">
                <label>Reference ID</label>
                <input value={formData.referenceId} onChange={(event) => setFormData({ ...formData, referenceId: event.target.value })} required />
              </div>
              <div className="input-group">
                <label>Assigned Block</label>
                <input value={formData.hostelId} onChange={(event) => setFormData({ ...formData, hostelId: event.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="submit-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" style={{ flex: 1 }}>
                  {editingId ? 'Save Changes' : 'Create Warden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWardens;
