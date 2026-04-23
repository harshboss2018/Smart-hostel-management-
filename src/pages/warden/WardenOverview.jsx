import React from 'react';
import { Users, Calendar, ShieldCheck, MessageSquare, Megaphone, UserCog, PackageSearch } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const WardenOverview = () => {
  const { user } = useAuth();
  const [data, setData] = React.useState({
    complaints: 0,
    students: 0,
    onLeave: 0
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, studentsRes, leaveRes] = await Promise.all([
          API.get('/complaints'),
          API.get('/users/students'),
          API.get('/leave')
        ]);
        
        setData({
          complaints: complaintsRes.data.filter(c => c.status !== 'Resolved').length,
          students: studentsRes.data.length,
          onLeave: leaveRes.data.filter(l => l.status === 'Approved').length
        });
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Students', value: data.students.toString(), icon: <Users size={20} />, color: '#3b82f6', path: '/warden/students' },
    { label: 'Active Complaints', value: data.complaints.toString(), icon: <MessageSquare size={20} />, color: '#f59e0b', path: '/warden/complaints' },
    { label: 'On Leave', value: data.onLeave.toString(), icon: <Calendar size={20} />, color: '#10b981', path: '/warden/leave' },
  ];

  const recentActivities = [
    { id: 1, type: 'System', task: `Connected to ${user?.hostelId || 'Hostel'} Database`, time: 'Just now' },
    { id: 2, type: 'Maintenance', task: `${data.complaints} pending issues detected`, time: 'Real-time' },
    { id: 3, type: 'Security', task: 'Roll call data synchronized', time: 'Today' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <h2>Welcome, {user?.name || 'Warden'} 🛡️</h2>
        <p>Hostel management overview and command center.</p>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-widgets">
        {stats.map((stat, i) => {
          const cardContent = (
            <div key={i} className="glass-card stat-card" style={{ cursor: stat.path ? 'pointer' : 'default' }}>
              <div className="stat-row">
                <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <span className="stat-value">{stat.value}</span>
              </div>
              <span className="stat-label">{stat.label}</span>
            </div>
          );

          return stat.path ? (
            <NavLink key={i} to={stat.path} style={{ textDecoration: 'none' }}>
              {cardContent}
            </NavLink>
          ) : cardContent;
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Command Center */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} className="primary-glow-text" /> Command Center
          </h3>
          <div className="action-grid">
            <NavLink to="/warden/complaints" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <MessageSquare size={22} className="primary-glow-text" />
              <span>Active Complaints</span>
            </NavLink>
            <NavLink to="/warden/announcements" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <Megaphone size={22} />
              <span>Notices</span>
            </NavLink>
            <NavLink to="/warden/students" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <UserCog size={22} />
              <span>Students</span>
            </NavLink>
            <NavLink to="/warden/leave" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <Calendar size={22} />
              <span>Manage Leave</span>
            </NavLink>
            <NavLink to="/warden/lost-found" className="quick-action-btn" style={{ textDecoration: 'none' }}>
              <PackageSearch size={22} />
              <span>Lost & Found</span>
            </NavLink>
          </div>
        </div>

        {/* Activity Feed */}
        <aside className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Activity Feed</h3>
          <div>
            {recentActivities.map(activity => (
              <div key={activity.id} className="timeline-item">
                <h5 style={{ margin: 0 }}>{activity.type}</h5>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activity.task}</p>
                <small style={{ color: 'var(--text-muted)' }}>{activity.time}</small>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WardenOverview;
