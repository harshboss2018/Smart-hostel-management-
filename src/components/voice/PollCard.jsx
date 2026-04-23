import React from 'react';
import { CheckCircle2, BarChart3 } from 'lucide-react';

const PollCard = ({ poll, onVote, userRole }) => {
  const isStudent = userRole === 'student';
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

  return (
    <div className="glass-card voice-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
        <BarChart3 size={20} />
        <h4 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hostel Poll</h4>
      </div>

      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>{poll.question}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {poll.options.map((option, index) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isVoted = poll.userVote === index;

          return (
            <div key={index} style={{ position: 'relative' }}>
              <button
                disabled={!isStudent || poll.userVote !== null}
                onClick={() => onVote(poll.id, index)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'var(--bg-accent)',
                  border: isVoted ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: isStudent && poll.userVote === null ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  zIndex: 1
                }}
              >
                {/* Visual Progress Bar */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${percentage}%`,
                    background: isVoted ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    transition: 'width 1s var(--transition-bounce)',
                    zIndex: -1
                  }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: isVoted ? 'bold' : 'normal', color: 'var(--text-primary)' }}>
                    {option.label}
                    {isVoted && <CheckCircle2 size={16} style={{ marginLeft: '0.5rem', display: 'inline', color: 'var(--primary-color)' }} />}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>{percentage}%</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{totalVotes} total votes</span>
        {isStudent && poll.userVote === null && <span style={{ color: 'var(--primary-color)' }}>Select an option to vote</span>}
      </div>
    </div>
  );
};

export default PollCard;
