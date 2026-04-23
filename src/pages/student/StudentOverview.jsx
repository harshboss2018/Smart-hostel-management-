import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import NoticeCard from '../../components/dashboard/NoticeCard';

const StudentOverview = () => {
  const { user } = useAuth();

  const noticeBoardData = [
    { id: 1, type: 'priority', title: 'Elevator Maintenance', time: '2 hours ago', desc: 'Elevator in Block B will be down for servicing.' },
    { id: 2, type: 'general', title: 'Mess Menu Update', time: '5 hours ago', desc: 'New menu effective from Monday.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <h2>Welcome back, {user?.name || 'Student'}</h2>
        <p>Here is your hostel dashboard overview for today.</p>
      </div>

      <div className="dashboard-widgets" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="glass-card stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', minHeight: '140px', border: '1px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Need Help?</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.2rem' }}>Raise a Complaint</h3>
            </div>
            <span style={{ fontSize: '1.5rem' }}>Ticket</span>
          </div>
          <NavLink to="/student/complaints" className="submit-btn btn-small" style={{ textAlign: 'center', textDecoration: 'none', background: 'var(--primary-color)' }}>
            Report Issue
          </NavLink>
        </div>

        <StatCard
          title="Voice Hub"
          value="Community Active"
          status="good"
          icon="Feed"
        />

        <div className="glass-card stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', minHeight: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Feedback Queue</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.2rem' }}>Check New Forms</h3>
            </div>
            <span style={{ fontSize: '1.5rem' }}>Form</span>
          </div>
          <NavLink to="/student/feedback" className="submit-btn btn-small" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Open Feedback
          </NavLink>
        </div>
      </div>

      <div className="dashboard-grid-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card hover-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Profile Summary</h3>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{user?.name || 'Student Name'}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Roll No: <span style={{ color: 'var(--success)' }}>{user?.rollNo || 'N/A'}</span></p>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status: Active</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Room Info</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user?.hostelId || 'Not Assigned'}</p>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hostel Management System</p>
            </div>
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Notice Board</h3>
            <div className="list-group">
              {noticeBoardData.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  type={notice.type}
                  title={notice.title}
                  time={notice.time}
                  description={notice.desc}
                />
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Voice Hub Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)' }}>Trending Poll</p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>Should library hours be extended?</p>
              </div>
              <NavLink to="/student/voice-hub" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>View all discussions</NavLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentOverview;
