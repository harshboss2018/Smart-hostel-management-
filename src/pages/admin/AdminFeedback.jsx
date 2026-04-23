import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, MessageSquareText, Star } from 'lucide-react';
import API from '../../api/axios';

const getTypeLabel = (type) => {
  if (type === 'cleaning') return 'Cleaning';
  if (type === 'complaint-resolution') return 'Complaint';
  return 'Custom';
};

const AdminFeedback = () => {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

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
      showToast(error.response?.data?.message || 'Failed to load feedback data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const summary = useMemo(() => {
    const submitted = feedbackItems.filter((item) => item.status === 'Submitted');
    const pending = feedbackItems.filter((item) => item.status === 'Pending');
    const complaintFeedback = feedbackItems.filter((item) => item.type === 'complaint-resolution');
    const cleaningFeedback = feedbackItems.filter((item) => item.type === 'cleaning');
    const customFeedback = feedbackItems.filter((item) => item.type === 'custom');
    const averageRating = submitted.length
      ? (submitted.reduce((sum, item) => sum + (item.response?.rating || 0), 0) / submitted.length).toFixed(1)
      : '0.0';

    return {
      submitted: submitted.length,
      pending: pending.length,
      complaintFeedback: complaintFeedback.length,
      cleaningFeedback: cleaningFeedback.length,
      customFeedback: customFeedback.length,
      averageRating,
    };
  }, [feedbackItems]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h2>Feedback Review</h2>
          <p>Admin-only visibility for cleaning feedback and complaint-resolution feedback across the hostel system.</p>
        </div>
        <button className="submit-btn btn-small" onClick={() => { fetchFeedback(); showToast('Feedback data refreshed.'); }}>
          <CheckCircle2 size={16} /> Refresh
        </button>
      </div>

      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      <div className="dashboard-widgets">
        <div className="glass-card stat-card">
          <span className="stat-label">Submitted</span>
          <span className="stat-value">{summary.submitted}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{summary.pending}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Cleaning Forms</span>
          <span className="stat-value">{summary.cleaningFeedback}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Custom Forms</span>
          <span className="stat-value">{summary.customFeedback}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Average Rating</span>
          <span className="stat-value">{summary.averageRating}</span>
        </div>
      </div>

      <div className="glass-card dashboard-content">
        <h3 style={{ marginBottom: '1rem' }}>All Feedback Records</h3>
        {loading ? (
          <div className="empty-state"><div className="spinner">Loading feedback records...</div></div>
        ) : feedbackItems.length === 0 ? (
          <div className="empty-state">
            <ClipboardCheck size={48} />
            <h4>No feedback records found</h4>
            <p>Feedback requests and responses will appear here once wardens start pushing forms.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Type</th>
                  <th>Trigger</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {feedbackItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.student?.name || item.studentId?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.student?.rollNo || item.studentId?.rollNo || 'N/A'} • {item.student?.hostelId || item.studentId?.hostelId || 'Unassigned'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.type === 'complaint-resolution' ? 'warning' : 'info'}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.targetLabel || item.complaintTitle || '-'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.title}</div>
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'Submitted' ? 'success' : 'warning'}`}>{item.status}</span>
                    </td>
                    <td>
                      {item.response?.rating ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Star size={14} /> {item.response.rating}/5
                        </span>
                      ) : 'Not submitted'}
                    </td>
                    <td style={{ minWidth: '240px' }}>
                      <div style={{ fontSize: '0.9rem' }}>{item.response?.comment || 'Awaiting student response.'}</div>
                      {item.response?.satisfaction && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          <MessageSquareText size={12} style={{ verticalAlign: 'text-bottom', marginRight: '0.25rem' }} />
                          {item.response.satisfaction}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
