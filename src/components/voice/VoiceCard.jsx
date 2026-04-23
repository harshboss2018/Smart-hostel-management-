import React from 'react';
import { ThumbsUp, MessageCircle, User, Share2, BarChart3, Star, Info, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VoiceCard = ({ item, onInteract, userRole }) => {
  const { user } = useAuth();
  const isStudent = userRole === 'student';
  const { type, metadata } = item;

  const renderContentBody = () => {
    switch (type) {
      case 'poll': {
        const totalVotes = metadata?.options?.reduce((acc, opt) => acc + opt.votes, 0) || 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>{item.content}</h3>
            {metadata?.options?.map((opt, idx) => {
              const perc = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isVoted = item.voters?.includes(user?.id || user?._id); // Assuming backend stores voters
              return (
                <button
                  key={idx}
                  disabled={!isStudent || isVoted}
                  onClick={() => onInteract(item._id, 'vote', idx)}
                  style={{
                    width: '100%', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-lg)', background: '#0f172a', position: 'relative', overflow: 'hidden',
                    textAlign: 'left', cursor: isStudent && !isVoted ? 'pointer' : 'default', zIndex: 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${perc}%`, background: 'rgba(96, 165, 250, 0.25)', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: -1 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{opt.label}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.1rem' }}>{perc}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        );
      }

      case 'review':
        return (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={20} fill={s <= metadata.rating ? '#fbbf24' : 'none'} color={s <= metadata.rating ? '#fbbf24' : 'var(--text-muted)'} />
              ))}
              <span style={{ marginLeft: '1rem', fontWeight: 'bold', color: '#fbbf24' }}>{metadata.rating}/5 Rating</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>"{item.content}"</p>
          </div>
        );

      case 'info':
        return (
          <div style={{ marginTop: '1rem', padding: '1rem', background: metadata.isHighPriority ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', borderLeft: metadata.isHighPriority ? '4px solid var(--danger-color)' : '4px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: metadata.isHighPriority ? 'var(--danger-color)' : 'var(--primary-color)' }}>
              {metadata.isHighPriority ? <Info size={18} /> : <Info size={18} />}
              <strong style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>{metadata.isHighPriority ? 'High Priority Update' : 'Information Sharing'}</strong>
            </div>
            <p style={{ margin: 0 }}>{item.content}</p>
          </div>
        );

      default:
        return <p style={{ fontSize: '1.1rem', marginTop: '1rem', lineHeight: '1.5' }}>{item.content}</p>;
    }
  };

  const getBorderColor = () => {
    if (type === 'review') return '4px solid #fbbf24';
    if (type === 'info' && metadata.isHighPriority) return '4px solid var(--danger-color)';
    if (type === 'info') return '4px solid var(--primary-color)';
    if (item.isTrending) return '4px solid var(--warning-color)';
    return '1px solid var(--border-color)';
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'poll': return <BarChart3 size={18} />;
      case 'review': return <Star size={18} />;
      case 'info': return <Info size={18} />;
      default: return <MessageSquare size={18} />;
    }
  };

  const [commentText, setCommentText] = React.useState('');
  const [showComments, setShowComments] = React.useState(item.comments?.length > 0);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onInteract(item._id, 'comment', commentText);
    setCommentText('');
  };

  return (
    <div className="glass-card voice-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: getBorderColor() }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="avatar-small" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0 }}>{item.authorName} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.8rem' }}>• {item.hostelName}</span></h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {getTypeIcon()} <span style={{ textTransform: 'capitalize' }}>{type}</span> • {item.timeAgo}
            </div>
          </div>
        </div>
        {item.isTrending && <span className="badge warning">Trending</span>}
      </div>

      {renderContentBody()}

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <button 
          onClick={isStudent ? () => onInteract(item._id, 'upvote') : undefined}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', 
            color: item.voted ? 'var(--primary-color)' : 'var(--text-secondary)',
            cursor: isStudent ? 'pointer' : 'default'
          }}
        >
          <ThumbsUp size={18} fill={item.voted ? 'currentColor' : 'none'} />
          <span>{item.upvotes || 0}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <MessageCircle size={18} />
          <span>{item.comments?.length || 0}</span>
        </button>

        <button
          onClick={() => onInteract(item._id, 'share')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 'auto' }}
        >
          <Share2 size={18} />
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
            {item.comments && item.comments.length > 0 ? (
              item.comments.map((comment, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: comment.role === 'admin' ? 'var(--danger-color)' : comment.role === 'warden' ? 'var(--warning-color)' : 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white' }}>
                        {comment.authorName?.charAt(0) || 'U'}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{comment.authorName}</span>
                      <span className="badge" style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.1rem 0.4rem', 
                        background: comment.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : comment.role === 'warden' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(var(--primary-rgb), 0.1)', 
                        color: comment.role === 'admin' ? 'var(--danger-color)' : comment.role === 'warden' ? 'var(--warning-color)' : 'var(--primary-color)',
                        textTransform: 'capitalize'
                      }}>
                        {comment.role || 'Student'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{comment.content}</p>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', margin: '1rem 0' }}>No comments yet. Start the conversation!</p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <input 
              type="text" 
              placeholder="Write a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="edit-input"
              style={{ flex: 1, marginTop: 0, background: 'transparent', border: 'none' }}
            />
            <button type="submit" className="submit-btn btn-small" style={{ width: 'auto', padding: '0.5rem 1.25rem' }}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VoiceCard;
