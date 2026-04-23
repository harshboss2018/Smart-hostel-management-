import React, { useState } from 'react';
import { Megaphone, Pin, Send, Trash2, CheckCircle } from 'lucide-react';

const initialAnnouncements = [
  { id: 1, title: 'Water supply maintenance tomorrow', scope: 'Hostel Wide', date: 'Apr 22, 2026', pinned: true, content: 'Water supply will pause between 10 AM and 1 PM.' },
  { id: 2, title: 'Curfew timing update for weekends', scope: 'Block A', date: 'Apr 20, 2026', pinned: false, content: 'Weekend return timing extended to 10:30 PM.' },
  { id: 3, title: 'Room inspection next Monday', scope: 'All Floors', date: 'Apr 18, 2026', pinned: false, content: 'Please keep rooms ready for the inspection round.' },
];

const WardenAnnouncements = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showToast, setShowToast] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    scope: 'Hostel Wide',
    content: '',
    pinned: false,
  });

  const notify = (message) => {
    setShowToast(message);
    window.setTimeout(() => setShowToast(''), 2500);
  };

  const handleBroadcast = (event) => {
    event.preventDefault();
    setAnnouncements((current) => [
      {
        id: Date.now(),
        title: formData.title,
        scope: formData.scope,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        pinned: formData.pinned,
        content: formData.content,
      },
      ...current,
    ]);
    setFormData({ title: '', scope: 'Hostel Wide', content: '', pinned: false });
    notify('Announcement broadcasted successfully.');
  };

  const handleDelete = (id) => {
    setAnnouncements((current) => current.filter((announcement) => announcement.id !== id));
    notify('Announcement removed.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Announcements & Notices</h2>
        <p>Create and manage announcements for hostel residents.</p>
      </div>

      {showToast && (
        <div className="toast" style={{ zIndex: 100000 }}>
          <CheckCircle size={18} style={{ color: 'var(--success-color)' }} /> {showToast}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-card dashboard-content">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Megaphone size={20} className="primary-glow-text" /> Post a Notice
          </h3>
          <form className="form-section" onSubmit={handleBroadcast}>
            <div className="form-field">
              <label>Notice Title</label>
              <input type="text" placeholder="Enter notice title..." required value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} />
            </div>
            <div className="form-field">
              <label>Target Audience</label>
              <select value={formData.scope} onChange={(event) => setFormData({ ...formData, scope: event.target.value })}>
                <option value="Hostel Wide">Hostel Wide</option>
                <option value="Block A">Block A</option>
                <option value="Staff Only">Staff Only</option>
                <option value="Emergency Alert">Emergency Alert</option>
              </select>
            </div>
            <div className="form-field">
              <label>Notice Content</label>
              <textarea placeholder="Write the notice details here..." rows="4" required value={formData.content} onChange={(event) => setFormData({ ...formData, content: event.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <input type="checkbox" id="pin" style={{ width: 'auto' }} checked={formData.pinned} onChange={(event) => setFormData({ ...formData, pinned: event.target.checked })} />
              <label htmlFor="pin" style={{ margin: 0 }}><Pin size={14} style={{ verticalAlign: 'middle' }} /> Pin to top of noticeboard</label>
            </div>
            <button className="submit-btn" type="submit" style={{ marginTop: '0.5rem' }}>
              <Send size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Broadcast Notice
            </button>
          </form>
        </div>

        <div className="glass-card dashboard-content">
          <h3 style={{ marginBottom: '1.25rem' }}>Recent Announcements</h3>
          <div className="list-group">
            {announcements.map((ann) => (
              <div key={ann.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="item-title">
                    {ann.pinned && <Pin size={14} style={{ color: 'var(--warning-color)' }} />}
                    {ann.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge info">{ann.scope}</span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }} onClick={() => handleDelete(ann.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <small style={{ color: 'var(--text-muted)' }}>{ann.date}</small>
                <p className="item-subtitle" style={{ color: 'var(--text-primary)' }}>{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenAnnouncements;
