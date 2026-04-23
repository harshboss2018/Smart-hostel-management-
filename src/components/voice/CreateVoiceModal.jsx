import React, { useState } from 'react';
import { X, MessageSquare, BarChart3, Star, Info, Plus, Trash2, Send } from 'lucide-react';

const CreateVoiceModal = ({ isOpen, onClose, onCreate }) => {
  const [activeType, setActiveType] = useState('post');
  const [content, setContent] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [rating, setRating] = useState(0);
  const [isHighPriority, setIsHighPriority] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
  };

  const handleRemoveOption = (index) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      type: activeType,
      content: content,
      metadata: {
        options: activeType === 'poll' ? pollOptions.filter(o => o.trim()).map(opt => ({ label: opt, votes: 0 })) : [],
        rating: activeType === 'review' ? rating : 0,
        isHighPriority: activeType === 'info' ? isHighPriority : false
      }
    };
    onCreate(newEntry);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setContent('');
    setPollOptions(['', '']);
    setRating(0);
    setIsHighPriority(false);
  };

  return (
    <div className="overlay-backdrop" style={{ zIndex: 30000 }}>
      <div className="glass-card profile-card" style={{ maxWidth: '600px', width: '90%', padding: '2rem' }}>
        <button className="close-overlay" onClick={onClose}><X size={24} /></button>
        
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageSquare className="primary-glow-text" /> Create Voice Entry
        </h2>

        {/* Type Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-accent)', padding: '0.4rem', borderRadius: 'var(--radius-lg)' }}>
          {[
            { id: 'post', label: 'Post', icon: <MessageSquare size={16}/> },
            { id: 'poll', label: 'Poll', icon: <BarChart3 size={16}/> },
            { id: 'review', label: 'Review', icon: <Star size={16}/> },
            { id: 'info', label: 'Info', icon: <Info size={16}/> }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: activeType === type.id ? 'var(--bg-primary)' : 'transparent',
                color: activeType === type.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: activeType === type.id ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Unified Content Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              {activeType === 'poll' ? 'Poll Question' : activeType === 'review' ? 'Service/Staff Review' : 'Content'}
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={activeType === 'post' ? "What's on your mind?" : activeType === 'poll' ? "Ask a question..." : "Enter details..."}
              rows={4}
              style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'white' }}
            />
          </div>

          {/* Type-Specific Fields */}
          {activeType === 'poll' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Options (Max 5)</label>
              {pollOptions.map((opt, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    required
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollOptions];
                      newOpts[index] = e.target.value;
                      setPollOptions(newOpts);
                    }}
                    placeholder={`Option ${index + 1}`}
                    style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'white' }}
                  />
                  {pollOptions.length > 2 && (
                    <button type="button" onClick={() => handleRemoveOption(index)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 5 && (
                <button type="button" onClick={handleAddOption} style={{ background: 'none', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Plus size={16} /> Add Option
                </button>
              )}
            </div>
          )}

          {activeType === 'review' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Rating Score</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    onMouseEnter={() => setRating(num)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: num <= rating ? '#fbbf24' : 'var(--bg-accent)' }}
                  >
                    <Star size={32} fill={num <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeType === 'info' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input 
                type="checkbox" 
                id="priority" 
                checked={isHighPriority} 
                onChange={(e) => setIsHighPriority(e.target.checked)} 
                style={{ width: 'auto' }}
              />
              <label htmlFor="priority" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mark as High Priority / Emergency</label>
            </div>
          )}

          <button type="submit" className="submit-btn" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <Send size={18} /> Publish Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateVoiceModal;
