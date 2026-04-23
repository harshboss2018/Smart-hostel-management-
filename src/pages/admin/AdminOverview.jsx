import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, UserCog, Building, AlertTriangle, ShieldCheck, DownloadCloud, CheckCircle, PackageSearch, ClipboardCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import API from '../../api/axios';

const AdminOverview = () => {
  const [showToast, setShowToast] = useState(false);
  const [alertsCount, setAlertsCount] = useState(2);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const { data } = await API.get('/complaints');
        const highPriority = data.filter(c => c.priority === 'High' || c.priority === 'Emergency');
        setActiveAlerts(highPriority);
        setAlertsCount(highPriority.length);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };
    fetchSystemData();
  }, []);

  const handleReport = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const stats = [
    { label: 'Total Hostels', value: '1 Block', icon: <Building size={20} />, color: '#8b5cf6' },
    { label: 'Total Students', value: '4', icon: <Users size={20} />, color: '#3b82f6' },
    { label: 'Active Wardens', value: '1', icon: <UserCog size={20} />, color: '#10b981' },
    { label: 'System Alerts', value: alertsCount.toString(), icon: <AlertTriangle size={20} />, color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {showToast && (
        <div className="toast" style={{ 
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 100000,
          background: 'var(--bg-accent)', border: '1px solid var(--primary-color)',
          padding: '1rem 2rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)',
          animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <CheckCircle size={18} style={{ color: 'var(--success-color)' }} /> Generating global system report...
        </div>
      )}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>System Dashboard</h2>
          <p>Welcome back, Administrator. Here's a high-level overview of the entire hostel ecosystem.</p>
        </div>
        <button 
          className="submit-btn btn-small" 
          onClick={handleReport}
          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
        >
          <DownloadCloud size={16} /> Generate Master Report
        </button>
      </div>

      <div className="dashboard-widgets">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card stat-card">
            <div className="stat-row">
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <span className="stat-value">{stat.value}</span>
            </div>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Quick Access */}
        <div className="glass-card dashboard-content">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={20} className="primary-glow-text" /> Management Modules
          </h3>
          <div className="action-grid">
            <NavLink to="/admin/wardens" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <UserCog size={22} />
              <span>Wardens</span>
            </NavLink>
            <NavLink to="/admin/data" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <ShieldCheck size={22} />
              <span>System Data</span>
            </NavLink>
            <NavLink to="/admin/feedback" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <ClipboardCheck size={22} />
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/admin/notices" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <AlertTriangle size={22} />
              <span>Broadcasts</span>
            </NavLink>
            <NavLink to="/admin/lost-found" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <PackageSearch size={22} />
              <span>Lost & Found</span>
            </NavLink>
          </div>
        </div>

        {/* System Activity */}
        <div className="glass-card dashboard-content">
          <h3 style={{ marginBottom: '1.5rem' }}>Global Activity Feed</h3>
          <div className="timeline-item">
            <h5 style={{ margin: 0 }}>System Backup</h5>
            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automated DB backup completed successfully.</p>
            <small style={{ color: 'var(--text-muted)' }}>02:00 AM Today</small>
          </div>
          {activeAlerts.slice(0, 2).map((alert) => (
            <div key={alert._id} className="timeline-item">
              <h5 style={{ margin: 0 }}>Priority Complaint</h5>
              <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{alert.title}</p>
              <small style={{ color: 'var(--text-muted)' }}>{alert.priority} priority</small>
            </div>
          ))}
          <div className="timeline-item">
            <h5 style={{ margin: 0 }}>New Warden Registration</h5>
            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Account created for Warden Block D.</p>
            <small style={{ color: 'var(--text-muted)' }}>Yesterday</small>
          </div>
          <div className="timeline-item">
            <h5 style={{ margin: 0 }}>Settings Update</h5>
            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Global curfew rules modified by Admin.</p>
            <small style={{ color: 'var(--text-muted)' }}>Oct 18, 2024</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
