import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, MessageSquare, Star, X } from 'lucide-react';
import API from '../../api/axios';

const satisfactionOptions = [
  'Very Satisfied',
  'Satisfied',
  'Neutral',
  'Unsatisfied',
  'Very Unsatisfied',
];

const getTypeLabel = (type) => {
  if (type === 'cleaning') return 'Room Cleaning';
  if (type === 'complaint-resolution') return 'Complaint Resolution';
  return 'Custom';
};

const StudentFeedback = () => {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    satisfaction: 'Satisfied',
    comment: '',
  });

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/feedback');
      setFeedbackItems(data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load feedback forms.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const pendingFeedback = feedbackItems.filter((item) => item.status === 'Pending');
  const submittedFeedback = feedbackItems.filter((item) => item.status === 'Submitted');

  const openFeedbackForm = (item) => {
    setActiveFeedback(item);
    setFormData({
      rating: 5,
      satisfaction: 'Satisfied',
      comment: '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await API.patch(`/feedback/${activeFeedback._id}/submit`, formData);
      setActiveFeedback(null);
      showToast('Feedback submitted successfully.');
      fetchFeedback();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit feedback.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Feedback Inbox</h2>
        <p>Fill feedback forms shared after room cleaning or once your complaint gets resolved.</p>
      </div>

      {toast && (
        <div className="toast" style={{ zIndex: 100000 }}>
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      <div className="dashboard-widgets">
        <div className="glass-card stat-card">
          <span className="stat-label">Pending Forms</span>
          <span className="stat-value">{pendingFeedback.length}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Submitted Forms</span>
          <span className="stat-value">{submittedFeedback.length}</span>
        </div>
      </div>

      <div className="glass-card dashboard-content">
        <h3>Pending Feedback</h3>
        {loading ? (
          <div className="empty-state"><div className="spinner">Loading feedback...</div></div>
        ) : pendingFeedback.length === 0 ? (
          <div className="empty-state">
            <ClipboardCheck size={48} />
            <h4>No pending feedback</h4>
            <p>New feedback forms from the warden will appear here.</p>
          </div>
        ) : (
          <div className="list-group">
            {pendingFeedback.map((item) => (
              <div key={item._id} className="list-item" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <span className="item-title">{item.title}</span>
                  <p className="item-subtitle" style={{ marginTop: '0.35rem' }}>{item.prompt}</p>
                  <p className="item-subtitle" style={{ marginTop: '0.5rem' }}>
                    Type: <strong>{getTypeLabel(item.type)}</strong>
                    {' '}• Target: <strong>{item.targetLabel || item.studentId?.hostelId || 'Assigned room'}</strong>
                  </p>
                </div>
                <button className="submit-btn btn-small" style={{ width: 'auto', minWidth: '150px' }} onClick={() => openFeedbackForm(item)}>
                  <MessageSquare size={16} /> Give Feedback
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card dashboard-content">
        <h3>Submitted Feedback</h3>
        {loading ? (
          <div className="empty-state"><div className="spinner">Loading feedback history...</div></div>
        ) : submittedFeedback.length === 0 ? (
          <div className="empty-state">
            <Star size={48} />
            <h4>No submissions yet</h4>
            <p>Your submitted feedback will appear here after you complete a form.</p>
          </div>
        ) : (
          <div className="list-group">
            {submittedFeedback.map((item) => (
              <div key={item._id} className="list-item" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <span className="item-title">{item.title}</span>
                  <p className="item-subtitle" style={{ marginTop: '0.35rem' }}>
                    Rating: <strong>{item.response?.rating || '-'}/5</strong>
                    {' '}• {item.response?.satisfaction || 'No satisfaction choice'}
                  </p>
                  <p className="item-subtitle" style={{ marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                    {item.response?.comment || 'No written comment provided.'}
                  </p>
                </div>
                <span className="badge success">Submitted</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeFeedback && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ width: '560px', maxWidth: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3>{activeFeedback.title}</h3>
                <p className="item-subtitle">{activeFeedback.prompt}</p>
              </div>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveFeedback(null)} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Rating</label>
                <select value={formData.rating} onChange={(event) => setFormData({ ...formData, rating: Number(event.target.value) })}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} / 5</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Satisfaction</label>
                <select value={formData.satisfaction} onChange={(event) => setFormData({ ...formData, satisfaction: event.target.value })}>
                  {satisfactionOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Comment</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tell us what went well or what still needs improvement..."
                  value={formData.comment}
                  onChange={(event) => setFormData({ ...formData, comment: event.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="submit-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setActiveFeedback(null)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" style={{ flex: 1 }}>
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeedback;
