import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Megaphone, Users, Activity, Settings, LogOut, Search, BarChart3, Database, Calendar, PackageSearch, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { path: '/admin/overview', label: 'Overview', icon: <Activity size={18}/> },
          { path: '/admin/wardens', label: 'Manage Wardens', icon: <Users size={18}/> },
          { path: '/admin/data', label: 'System Data', icon: <Database size={18}/> },
          { path: '/admin/feedback', label: 'Feedback Review', icon: <ClipboardCheck size={18}/> },
          { path: '/admin/lost-found', label: 'Lost & Found', icon: <PackageSearch size={18}/> },
          { path: '/admin/notices', label: 'College Notices', icon: <Megaphone size={18}/> },
          { path: '/admin/voice-hub', label: 'Voice Hub', icon: <BarChart3 size={18}/> },
          { path: '/admin/settings', label: 'Settings', icon: <Settings size={18}/> },
        ];
      case 'warden':
        return [
          { path: '/warden/overview', label: 'Hostel Overview', icon: <Home size={18}/> },
          { path: '/warden/complaints', label: 'Active Complaints', icon: <MessageSquare size={18}/> },
          { path: '/warden/announcements', label: 'Announcements', icon: <Megaphone size={18}/> },
          { path: '/warden/students', label: 'Manage Students', icon: <Users size={18}/> },
          { path: '/warden/feedback', label: 'Feedback Forms', icon: <ClipboardCheck size={18}/> },
          { path: '/warden/leave', label: 'Manage Leave', icon: <Calendar size={18}/> },
          { path: '/warden/lost-found', label: 'Lost & Found', icon: <PackageSearch size={18}/> },
          { path: '/warden/voice-hub', label: 'Voice Hub', icon: <BarChart3 size={18}/> },
        ];
      case 'student':
        return [
          { path: '/student/overview', label: 'Dashboard', icon: <Home size={18}/> },
          { path: '/student/complaints', label: 'My Complaints', icon: <MessageSquare size={18}/> },
          { path: '/student/feedback', label: 'My Feedback', icon: <ClipboardCheck size={18}/> },
          { path: '/student/voice-hub', label: 'Voice Hub', icon: <BarChart3 size={18}/> },
          { path: '/student/lostfound', label: 'Lost & Found', icon: <Search size={18}/> },
          { path: '/student/leave', label: 'Leave Apply', icon: <Calendar size={18}/> },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="sidebar glass-card">
      <div className="sidebar-header">
        <h2>HostelHub <span className={`badge ${role}`}>{role.charAt(0).toUpperCase() + role.slice(1)}</span></h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {getLinks().map((link) => (
            <li key={link.path}>
              <NavLink 
                to={link.path} 
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {link.icon} {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sidebar Enhancement: Clear separation for logout */}
      <div className="sidebar-footer">
        <hr className="sidebar-divider" />
        <button className="logout-btn hover-card" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
