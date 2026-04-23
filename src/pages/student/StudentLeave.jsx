import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Clock, CheckCircle2, XCircle, PlusCircle, AlertTriangle } from 'lucide-react';
import API from '../../api/axios';

const StudentLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'Home Visit',
    reason: ''
  });

  const [showToast, setShowToast] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/leave');
      setLeaves(data);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leave', formData);
      setIsModalOpen(false);
      setFormData({ startDate: '', endDate: '', type: 'Home Visit', reason: '' });
      setShowToast('Application submitted successfully!');
      setTimeout(() => setShowToast(null), 3000);
      fetchLeaves();
    } catch (error) {
      const msg = error.response?.data?.message || 'Submission failed';
      setShowToast('Error: ' + msg);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="status resolved"><CheckCircle2 size={14} /> Approved</span>;
      case 'Rejected': return <span className="status danger"><XCircle size={14} /> Rejected</span>;
      default: return <span className="status pending"><Clock size={14} /> Pending</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Leave Applications</h2>
        <p>Apply for out-station leave and track your application status.</p>
      </div>

      {showToast && (
        <div className="toast success" style={{ 
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 100000,
          background: 'var(--bg-accent)', border: '1px solid var(--primary-color)',
          padding: '1rem 2rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)',
          animation: 'slideIn 0.3s ease'
        }}>
          {showToast}
        </div>
      )}

      <div className="glass-card dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>My Applications</h3>
          <button className="submit-btn btn-small" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={16} /> Apply for Leave
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner">Fetching records...</div></div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h4>No leave records</h4>
            <p>You haven't applied for any leaves yet.</p>
          </div>
        ) : (
          <div className="list-group">
            {leaves.map(leave => (
              <div key={leave._id} className="list-item">
                <div style={{ flex: 1 }}>
                  <span className="item-title">{leave.type} - {leave.reason}</span>
                  <p className="item-subtitle">
                    {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(leave.status)}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ width: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Apply for Leave</h3>
              <XCircle size={20} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label>Leave Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  {['Home Visit', 'Medical', 'Academic', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Start Date</label>
                  <input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>End Date</label>
                  <input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label>Reason</label>
                <textarea required rows="3" placeholder="Explain your reason for leave..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="submit-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeave;
