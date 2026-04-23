import React from 'react';

const NoticeCard = ({ type, title, time, description }) => {
  const getBadgeClass = (type) => {
    switch (type.toLowerCase()) {
      case 'priority': return 'danger'; // Maps to --danger
      case 'warning': return 'warning'; // Maps to --warning
      default: return 'success'; // Maps to --success for general
    }
  };

  return (
    <div className="list-item hover-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', background: 'var(--card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <span className={`badge ${getBadgeClass(type)}`} style={{ textTransform: 'capitalize' }}>
          {type === 'priority' ? '🔴 Priority' : type === 'warning' ? '🟡 Warning' : '🟢 General'}
        </span>
        <small style={{ color: 'var(--text-muted)' }}>{time}</small>
      </div>
      <h5 style={{ margin: '0.2rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>{title}</h5>
      {description && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default NoticeCard;
