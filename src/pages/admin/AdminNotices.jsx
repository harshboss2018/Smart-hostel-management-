import React, { useState } from 'react';
import { Pin, Send, Globe, Trash2, CheckCircle } from 'lucide-react';

const initialNotices = [
  { id: 1, title: 'Semester Break Guidelines', scope: 'Global', date: 'Apr 22, 2026', author: 'System Admin', pinned: true, priority: 'Standard' },
  { id: 2, title: 'Maintenance Schedule Q4', scope: 'Wardens Only', date: 'Apr 20, 2026', author: 'System Admin', pinned: false, priority: 'High' },
  { id: 3, title: 'Emergency Contact Update', scope: 'Global', date: 'Apr 18, 2026', author: 'Super Admin', pinned: false, priority: 'Critical' },
];

const AdminNotices = () => {
  const [notices, setNotices] = useState(initialNotices);
  const [toast, setToast] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    scope: 'Global',
    priority: 'Standard',
    message: '',
    pinned: false,
  });

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const notice = {
      id: Date.now(),
      title: formData.title,
      scope: formData.scope,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: 'System Admin',
      pinned: formData.pinned,
      priority: formData.priority,
      message: formData.message,
    };
    setNotices((current) => [notice, ...current]);
    setFormData({ title: '', scope: 'Global', priority: 'Standard', message: '', pinned: false });
    showToast('Global broadcast published.');
  };

  const removeNotice = (id) => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
    showToast('Broadcast removed from noticeboard.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Global Broadcasts</h2>
        <p>Publish announcements across the entire hostel ecosystem.</p>
      </div>

      {toast && (
        <div className="toast">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-card dashboard-content">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Globe size={20} className="primary-glow-text" /> System Wide Broadcast
          </h3>
          <form className="form-section" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Broadcast Title</label>
              <input type="text" placeholder="Enter title..." required value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Target Scope</label>
                <select value={formData.scope} onChange={(event) => setFormData({ ...formData, scope: event.target.value })}>
                  <option value="Global">Global (All Users)</option>
                  <option value="Students">All Students</option>
                  <option value="Wardens Only">All Wardens</option>
                </select>
              </div>
              <div className="form-field">
                <label>Priority Level</label>
                <select value={formData.priority} onChange={(event) => setFormData({ ...formData, priority: event.target.value })}>
                  <option value="Standard">Standard</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical / Emergency</option>
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Message Content</label>
              <textarea placeholder="Write the global message here..." rows="5" required value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <input type="checkbox" id="pin_global" style={{ width: 'auto' }} checked={formData.pinned} onChange={(event) => setFormData({ ...formData, pinned: event.target.checked })} />
              <label htmlFor="pin_global" style={{ margin: 0 }}><Pin size={14} style={{ verticalAlign: 'middle' }} /> Pin to top for all users</label>
            </div>
            <button className="submit-btn" type="submit" style={{ marginTop: '1rem', background: 'var(--primary-color)' }}>
              <Send size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Send Broadcast
            </button>
          </form>
        </div>

        <div className="glass-card dashboard-content">
          <h3 style={{ marginBottom: '1.25rem' }}>Active Broadcasts</h3>
          <div className="list-group">
            {notices.map((notice) => (
              <div key={notice.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <span className="item-title">
                      {notice.pinned && <Pin size={14} style={{ color: 'var(--warning-color)' }} />}
                      {notice.title}
                    </span>
                    <p className="item-subtitle">Posted by {notice.author} • {notice.date}</p>
                    {notice.message && <p className="item-subtitle" style={{ marginTop: '0.5rem', color: 'var(--text-primary)' }}>{notice.message}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className={`badge ${notice.scope === 'Global' ? 'info' : 'warning'}`}>{notice.scope}</span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '0.2rem' }} onClick={() => removeNotice(notice.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotices;
