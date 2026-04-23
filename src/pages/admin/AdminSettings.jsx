import React, { useState } from 'react';
import { Save, Bell, Shield, Sliders } from 'lucide-react';

const defaultSettings = {
  organizationName: 'Central University Hostels',
  academicYear: '2026-2027',
  curfew: '22:30',
  leaveApproval: 'yes',
  maxComplaints: 5,
  sessionTimeout: 60,
  emailNotif: true,
  smsNotif: false,
};

const AdminSettings = () => {
  const [formData, setFormData] = useState(defaultSettings);
  const [savedData, setSavedData] = useState(defaultSettings);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSavedData(formData);
    showToast('Settings applied successfully.');
  };

  const handleDiscard = () => {
    setFormData(savedData);
    showToast('Unsaved changes discarded.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>System Settings</h2>
          <p>Configure global parameters and security rules for the organization.</p>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <Save size={18} /> {toast}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-card dashboard-content form-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <Sliders size={20} className="primary-glow-text" /> General Preferences
          </h3>
          <div className="form-row">
            <div className="form-field">
              <label>Organization Name</label>
              <input type="text" value={formData.organizationName} onChange={(event) => setFormData({ ...formData, organizationName: event.target.value })} />
            </div>
            <div className="form-field">
              <label>Academic Year</label>
              <select value={formData.academicYear} onChange={(event) => setFormData({ ...formData, academicYear: event.target.value })}>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card dashboard-content form-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <Shield size={20} className="primary-glow-text" /> Security & Rules
          </h3>
          <div className="form-row">
            <div className="form-field">
              <label>Default Curfew Time (Students)</label>
              <input type="time" value={formData.curfew} onChange={(event) => setFormData({ ...formData, curfew: event.target.value })} />
            </div>
            <div className="form-field">
              <label>Require Warden Approval for Leave</label>
              <select value={formData.leaveApproval} onChange={(event) => setFormData({ ...formData, leaveApproval: event.target.value })}>
                <option value="yes">Yes, Mandatory</option>
                <option value="no">No, Auto-Approve</option>
              </select>
            </div>
            <div className="form-field">
              <label>Max Complaints per Student/Month</label>
              <input type="number" min="1" max="20" value={formData.maxComplaints} onChange={(event) => setFormData({ ...formData, maxComplaints: Number(event.target.value) })} />
            </div>
            <div className="form-field">
              <label>Session Timeout (Minutes)</label>
              <input type="number" min="15" value={formData.sessionTimeout} onChange={(event) => setFormData({ ...formData, sessionTimeout: Number(event.target.value) })} />
            </div>
          </div>
        </div>

        <div className="glass-card dashboard-content form-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <Bell size={20} className="primary-glow-text" /> Notifications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="checkbox" id="email_notif" checked={formData.emailNotif} onChange={(event) => setFormData({ ...formData, emailNotif: event.target.checked })} style={{ width: 'auto' }} />
              <label htmlFor="email_notif" style={{ margin: 0, fontSize: '0.9rem' }}>Send email digest to wardens daily</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="checkbox" id="sms_notif" checked={formData.smsNotif} onChange={(event) => setFormData({ ...formData, smsNotif: event.target.checked })} style={{ width: 'auto' }} />
              <label htmlFor="sms_notif" style={{ margin: 0, fontSize: '0.9rem' }}>Enable SMS alerts for emergency broadcasts</label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
          <button type="button" className="submit-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', width: 'auto' }} onClick={handleDiscard}>Discard Changes</button>
          <button type="submit" className="submit-btn" style={{ background: 'var(--primary-color)', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
