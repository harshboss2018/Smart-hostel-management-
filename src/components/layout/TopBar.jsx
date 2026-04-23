import { SunDim, MoonStar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopBar = ({ onProfileClick }) => {
  const { user, theme, toggleTheme } = useAuth();

  return (
    <header className="dashboard-header glass-card">
      <div className="header-left">
        <div className="utility-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="icon-btn theme-toggle-btn" 
            onClick={toggleTheme}
            title="Toggle Theme"
            style={{ marginRight: '0.25rem' }}
          >
            {theme === 'dark' ? <SunDim size={20} /> : <MoonStar size={20} />}
          </button>
          
          <button 
            className="icon-btn profile-trigger" 
            onClick={onProfileClick}
            title="Student Identity"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(var(--primary-rgb), 0.1)', border: '1px solid var(--primary-color)', padding: '0.4rem 0.8rem', borderRadius: '20px' }}
          >
            <ShieldCheck size={18} style={{ color: 'var(--primary-color)' }} />
            <span className="profile-name" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Identity</span>
          </button>

          <div className="header-separator" style={{ height: '20px', width: '1px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>

          <span className="date-display" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>

          <span className="date-display" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {user?.name || 'Portal User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
