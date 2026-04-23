import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, UserCircle, MessageSquare, X, CheckCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../../context/AuthContext';

const buildProfileForm = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  hostelId: user?.hostelId || '',
  referenceId: user?.referenceId || '',
});

const DashboardLayout = ({ role }) => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileOverlay, setShowProfileOverlay] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(buildProfileForm(user));
  const [toast, setToast] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  };

  const handleUpdate = async () => {
    const res = await updateProfile(editForm);
    if (res.success) {
      setIsEditing(false);
      setEditForm(buildProfileForm(res.user || user));
      showToast('Profile updated successfully.');
    } else {
      showToast(res.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openProfile = () => {
    setEditForm(buildProfileForm(user));
    setShowProfileOverlay(true);
    setShowNotifications(false);
  };

  const cancelEditing = () => {
    setEditForm(buildProfileForm(user));
    setIsEditing(false);
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('Enter current and new password.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast('New password and confirm password do not match.');
      return;
    }

    const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (res.success) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      showToast(res.message || 'Password updated successfully.');
    } else {
      showToast(res.message);
    }
  };

  const renderField = (label, key, fallback, options = {}) => (
    <div className="detail-box">
      <label>{label}</label>
      {isEditing && !options.readOnly ? (
        <input
          type={options.type || 'text'}
          value={editForm[key]}
          onChange={(event) => setEditForm({ ...editForm, [key]: event.target.value })}
          className="edit-input"
        />
      ) : (
        <p style={options.valueStyle}>{fallback}</p>
      )}
    </div>
  );

  const renderProfileDetails = () => {
    switch (role) {
      case 'student':
        return (
          <div className="detail-grid">
            {renderField('Full Name', 'name', user?.name || 'N/A')}
            {renderField('Roll Number', 'rollNo', user?.rollNo || 'N/A', { readOnly: true })}
            {renderField('Hostel Block / Room', 'hostelId', user?.hostelId || 'Assigned Block')}
            {renderField('Email Address', 'email', user?.email || 'N/A', { type: 'email' })}
            {renderField('Account Type', 'role', 'STUDENT PORTAL', { readOnly: true, valueStyle: { color: 'var(--primary-color)' } })}
            {renderField('Last Login', 'lastLogin', new Date().toLocaleDateString(), { readOnly: true })}
          </div>
        );
      case 'warden':
        return (
          <div className="detail-grid">
            {renderField('Full Name', 'name', user?.name || 'N/A')}
            {renderField('Staff ID', 'referenceId', user?.referenceId || 'N/A')}
            {renderField('Assigned Block', 'hostelId', user?.hostelId || 'All Blocks')}
            {renderField('Official Email', 'email', user?.email || 'N/A', { type: 'email' })}
            {renderField('Auth Level', 'authLevel', 'Senior Warden', { readOnly: true })}
            {renderField('Session Status', 'sessionStatus', 'ACTIVE', { readOnly: true, valueStyle: { color: 'var(--success-color)' } })}
          </div>
        );
      case 'admin':
        return (
          <div className="detail-grid">
            {renderField('Administrator Name', 'name', user?.name || 'Root')}
            {renderField('System Email', 'email', user?.email || 'admin@hostelhub.edu', { type: 'email' })}
            {renderField('Access Level', 'accessLevel', 'Superuser / Root', { readOnly: true })}
            {renderField('Reference ID', 'referenceId', user?.referenceId || '123')}
            {renderField('2FA Status', 'twoFactor', 'ENABLED (Biometric)', { readOnly: true, valueStyle: { color: 'var(--success-color)' } })}
            {renderField('Last Server Access', 'serverAccess', 'Just now', { readOnly: true })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar role={role} />

      <main className="dashboard-main">
        <TopBar onProfileClick={openProfile} />

        <div className="dashboard-content-scroll">
          <Outlet />
        </div>
      </main>

      {toast && (
        <div className="toast" style={{ zIndex: 100000 }}>
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      <div className="floating-notification-container">
        <button
          className="fab-notification"
          onClick={() => { setShowNotifications(!showNotifications); setShowProfileOverlay(false); }}
          title="Notifications"
        >
          <Bell size={24} />
          <span className="dot"></span>
        </button>

        <div className={`dropdown-menu ${showNotifications ? 'active' : ''}`}>
          <div className="dropdown-header">
            <h4>{role.charAt(0).toUpperCase() + role.slice(1)} Alerts</h4>
            <span className="badge warning">2 New</span>
          </div>
          <div className="dropdown-content">
            <div className="dropdown-item">
              <MessageSquare size={18} style={{ color: 'var(--warning-color)' }} />
              <div>
                <h5>System Update</h5>
                <p>New features available in your dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`profile-overlay ${showProfileOverlay ? 'active' : ''}`}>
        <div className="profile-card">
          <button className="close-overlay" onClick={() => { setShowProfileOverlay(false); setIsEditing(false); }}>
            <X size={24} />
          </button>

          <div className="profile-card-header">
            <div className="avatar-large">
              <UserCircle size={60} />
            </div>
            <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Identity</h2>
            <p style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{role.toUpperCase()} VERIFIED</p>
          </div>

          {renderProfileDetails()}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            {isEditing ? (
              <>
                <button className="submit-btn success" onClick={handleUpdate} style={{ flex: 1 }}>Save Changes</button>
                <button className="submit-btn" onClick={cancelEditing} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)' }}>Cancel</button>
              </>
            ) : (
              <>
                <button className="submit-btn" onClick={() => setIsEditing(true)} style={{ flex: 1 }}>Update Info</button>
                <button className="submit-btn danger" onClick={handleLogout} style={{ flex: 1 }}>Logout Session</button>
              </>
            )}
          </div>

          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Change Password</h3>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="input-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                  autoComplete="current-password"
                />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                  autoComplete="new-password"
                />
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, confirmNewPassword: event.target.value })}
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="submit-btn" style={{ marginTop: '0.25rem' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
