import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Building, KeyRound, Mail, Hash, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState('student'); // Default to student
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setIdentifier(''); // Clear identifier when switching roles
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic numeric validation for students
    if (role === 'student' && !/^\d+$/.test(identifier)) {
      setError('Roll number must be numeric characters only.');
      setIsSubmitting(false);
      return;
    }

    const res = await login(identifier, password, role);
    
    if (res.success && res.user && res.user.role) {
      // Step 4: Role-Based Redirect Logic
      if (res.user.role === 'admin') navigate('/admin/overview');
      else if (res.user.role === 'warden') navigate('/warden/overview');
      else navigate('/student/overview');
    } else {
      setError(res.message);
      setIsSubmitting(false);
    }
  };

  const getRoleConfig = () => {
    switch(role) {
      case 'admin':
        return {
          label: 'Administrator ID',
          placeholder: 'Enter Admin ID',
          icon: <Shield size={18} />,
          btnText: 'Admin Login',
          format: 'Format: Alphanumeric ID'
        };
      case 'warden':
        return {
          label: 'Warden ID',
          placeholder: 'Enter Warden ID',
          icon: <Building size={18} />,
          btnText: 'Warden Login',
          format: 'Format: Alphanumeric ID'
        };
      default: // student
        return {
          label: 'Roll Number',
          placeholder: 'Enter 6-digit Roll Number',
          icon: <Hash size={18} />,
          btnText: 'Student Login',
          format: 'Format: Numeric digits only'
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="login-container">
      <div className="login-glass-panel">
        <div className="login-header">
          <h1>HostelHub</h1>
          <p>Institutional Management Portal</p>
        </div>

        {/* Role Switcher */}
        <div className="role-selector">
          <button 
            type="button"
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleChange('student')}
          >
            <User size={20} />
            <span>Student</span>
          </button>
          <button 
            type="button"
            className={`role-btn ${role === 'warden' ? 'active' : ''}`}
            onClick={() => handleRoleChange('warden')}
          >
            <Shield size={20} />
            <span>Warden</span>
          </button>
          <button 
            type="button"
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            <KeyRound size={20} />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label style={{ margin: 0 }}>{config.label}</label>
              <span className="format-badge">{config.format}</span>
            </div>
            <div className="input-with-icon">
              {config.icon}
              <input 
                type={role === 'student' ? 'number' : 'text'} 
                placeholder={config.placeholder}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Secure Password</label>
            <div className="input-with-icon">
              <KeyRound size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ marginTop: '2rem' }}>
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Loader2 size={18} className="animate-spin" /> Verifying...
              </span>
            ) : (
              config.btnText
            )}
          </button>

          <div className="institutional-hint">
            <p>Accessing the portal implies agreement with the <a href="#">institutional security policy</a>. For account issues, contact System Administration.</p>
          </div>
        </form>
      </div>
    </div>
  );
};



export default Login;
