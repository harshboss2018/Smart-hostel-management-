import React from 'react';

const StatCard = ({ title, value, status, icon }) => {
  // Map logic statuses to semantic CSS variables
  const colorMap = {
    good: 'var(--success)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    alert: 'var(--danger)',
    info: 'var(--primary)'
  };

  const statusColor = colorMap[status] || 'var(--primary)';

  return (
    <div className="stat-card-component glass-card hover-card">
      <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div 
          className="stat-icon" 
          style={{ 
            background: `${statusColor}20`, // 20 adds opacity in hex
            color: statusColor,
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}
        >
          {icon}
        </div>
        <span className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 700, color: statusColor }}>
          {value}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
        <span className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 500 }}>
          {title}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
