import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import API from '../../api/axios';

const WardenComplaints = () => {
  const [showToast, setShowToast] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/complaints');
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.patch(`/complaints/${id}/status`, { status: newStatus });
      setShowToast(
        newStatus === 'Resolved'
          ? 'Complaint marked resolved and feedback form pushed to the student.'
          : 'Status updated successfully!',
      );
      setTimeout(() => setShowToast(null), 3000);
      fetchComplaints();
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      setShowToast('Failed to update status');
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Active Complaints</h2>
        <p>Review, update, and resolve student complaints for your hostel block.</p>
      </div>

      {showToast && (
        <div className="toast" style={{ 
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 100000,
          background: 'var(--bg-accent)', border: '1px solid var(--primary-color)',
          padding: '1rem 2rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)',
          animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <CheckCircle size={18} style={{ color: 'var(--success-color)' }} /> {showToast}
        </div>
      )}

      <div className="glass-card dashboard-content">
        {loading ? (
          <div className="empty-state">
            <div className="spinner">Loading complaints...</div>
          </div>
        ) : (
          <div className="list-group">
            {complaints.filter(c => c.status !== 'Resolved').map(complaint => (
              <div key={complaint._id} className="list-item complaint-card">
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="item-title" style={{ fontSize: '1.1rem' }}>{complaint.title}</span>
                    {complaint.priority !== 'Medium' && (
                      <span className={`badge ${complaint.priority === 'Emergency' ? 'danger' : 'warning'}`}>
                        {complaint.priority}
                      </span>
                    )}
                  </div>
                  <p className="item-subtitle" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    By: {complaint.studentId?.name || 'Unknown Student'} ({complaint.studentId?.rollNo || 'N/A'})
                  </p>
                  <p className="item-subtitle" style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {complaint.description || 'No additional details provided.'}
                  </p>
                  <p className="item-subtitle" style={{ fontSize: '0.8rem' }}>
                    Category: <strong>{complaint.category}</strong> • Submitted {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="complaint-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span className="dot" style={{ background: complaint.status === 'Pending' ? 'var(--warning-color)' : 'var(--primary-color)' }}></span>
                    Status: {complaint.status}
                  </div>
                  <select
                    value={complaint.status}
                    onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                    className="status-select-btn"
                  >
                    <option value="Pending">🟡 Pending</option>
                    <option value="In Progress">🔵 In-Progress</option>
                    <option value="Resolved">🟢 Resolved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {complaints.filter(c => c.status === 'Resolved').length > 0 && (
          <>
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Resolved</h3>
            <div className="list-group">
              {complaints.filter(c => c.status === 'Resolved').map(complaint => (
                <div key={complaint._id} className="list-item" style={{ opacity: 0.6 }}>
                  <div style={{ flex: 1 }}>
                    <span className="item-title">{complaint.title}</span>
                    <p className="item-subtitle">
                      {complaint.category} • Resolved {new Date(complaint.resolvedAt).toLocaleDateString()}
                    </p>
                    {complaint.resolutionTimeMinutes && (
                      <p className="item-subtitle" style={{ color: 'var(--success-color)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        ⏱️ Time taken: {
                          complaint.resolutionTimeMinutes > 60 
                            ? `${Math.floor(complaint.resolutionTimeMinutes / 60)}h ${complaint.resolutionTimeMinutes % 60}m` 
                            : `${complaint.resolutionTimeMinutes}m`
                        }
                      </p>
                    )}
                  </div>
                  <span className="badge success">Resolved</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WardenComplaints;
