import React, { useState, useMemo, useEffect } from 'react';
import { Megaphone, PlusCircle, TrendingUp, Clock, Info, Activity, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import VoiceCard from '../../components/voice/VoiceCard';
import CreateVoiceModal from '../../components/voice/CreateVoiceModal';
import API from '../../api/axios';

const StudentVoiceHub = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';
  const isStudent = userRole === 'student';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'latest'
  const [loading, setLoading] = useState(true);
  const [hubContent, setHubContent] = useState([]);
  const [toast, setToast] = useState('');

  const fetchHubContent = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/voice');
      setHubContent(data);
    } catch (error) {
      console.error('Failed to fetch voice hub content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubContent();
  }, []);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__hostelHubVoiceToast);
    window.__hostelHubVoiceToast = window.setTimeout(() => setToast(''), 2500);
  };

  const handleInteraction = async (id, actionType, payload) => {
    try {
      if (actionType === 'upvote') {
        await API.patch(`/voice/${id}/upvote`);
        fetchHubContent();
        showToast('Vote recorded.');
      } else if (actionType === 'vote') {
        await API.patch(`/voice/${id}/vote`, { optionIndex: payload });
        fetchHubContent();
        showToast('Poll response submitted.');
      } else if (actionType === 'comment') {
        await API.post(`/voice/${id}/comment`, { content: payload });
        fetchHubContent();
        showToast('Comment posted.');
      } else if (actionType === 'share') {
        const item = hubContent.find((entry) => entry._id === id);
        const shareText = item ? `${item.authorName}: ${item.content}` : 'HostelHub Voice entry';
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareText);
        }
        showToast('Entry copied to clipboard.');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Action failed.');
    }
  };

  const handleCreateEntry = async (newEntry) => {
    try {
      await API.post('/voice', {
        type: newEntry.type,
        content: newEntry.content,
        metadata: newEntry.metadata
      });
      fetchHubContent();
      showToast('New voice entry published.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Creation failed.');
    }
  };

  const processedContent = useMemo(() => {
    let sorted = [...hubContent];
    if (sortBy === 'popular') {
      sorted.sort((a, b) => {
        const scoreA = (a.upvotes || 0) + (a.metadata?.options?.reduce((acc,o)=>acc+o.votes,0) || 0) * 1.2;
        const scoreB = (b.upvotes || 0) + (b.metadata?.options?.reduce((acc,o)=>acc+o.votes,0) || 0) * 1.2;
        return scoreB - scoreA;
      });
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  }, [hubContent, sortBy]);

  return (
    <div className="voice-hub-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
      {toast && (
        <div className="toast" style={{ zIndex: 100000 }}>
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}
      <section className="voice-feed">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Megaphone size={32} className="primary-glow-text" /> Student Voice Hub
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Shape hostel life through posts, polls, and feedback.</p>
          </div>
          {isStudent && (
            <button className="submit-btn" onClick={() => setIsModalOpen(true)} style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} /> Create Hub Entry
            </button>
          )}
        </header>

        <div className="feed-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className={`icon-btn ${sortBy === 'popular' ? 'active' : ''}`} 
            onClick={() => setSortBy('popular')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: sortBy === 'popular' ? 'var(--bg-accent)' : 'transparent', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}
          >
            <TrendingUp size={18} /> Trending
          </button>
          <button 
            className={`icon-btn ${sortBy === 'latest' ? 'active' : ''}`} 
            onClick={() => setSortBy('latest')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: sortBy === 'latest' ? 'var(--bg-accent)' : 'transparent', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}
          >
            <Clock size={18} /> Latest
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner">Tuning into the hub...</div>
          </div>
        ) : processedContent.length === 0 ? (
          <div className="empty-state">
            <Info size={48} />
            <h4>The hub is quiet...</h4>
            <p>Be the first to share a thought, poll, or review.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {processedContent.map(item => (
              <VoiceCard 
                key={item._id} 
                item={{
                  ...item,
                  id: item._id,
                  voted: item.upvotedBy?.includes(user?.id || user?._id)
                }} 
                onInteract={handleInteraction}
                userRole={userRole}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="voice-sidebar">
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} /> Engagement Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="stat-row"><span>Total Hub Shares</span><strong>18,432</strong></div>
            <div className="stat-row"><span>Active Discussions</span><strong>{hubContent.filter(c => c.comments?.length > 0).length}</strong></div>
            <div className="stat-row"><span>Community Rating</span><strong style={{ color: '#fbbf24' }}>4.8 ★</strong></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Content Guide</h3>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><strong>Post:</strong> General issues or opinions.</li>
            <li><strong>Poll:</strong> Collective decision making.</li>
            <li><strong>Review:</strong> Direct feedback on services.</li>
            <li><strong>Info:</strong> Campus-wide useful updates.</li>
          </ul>
        </div>
      </aside>

      <CreateVoiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateEntry}
      />
    </div>
  );
};

export default StudentVoiceHub;
