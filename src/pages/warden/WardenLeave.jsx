import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import API from '../../api/axios';

const WardenLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/leave/${id}/status`, { status, remarks: 'Processed by Warden' });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      fetchLeaves();
    } catch (error) {
      console.error('Failed to update leave status:', error);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const search = searchTerm.toLowerCase();
    return (
      leave.studentName?.toLowerCase().includes(search) ||
      leave.rollNo?.toLowerCase().includes(search) ||
      leave.type?.toLowerCase().includes(search)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Leave Management</h2>
        <p>Review and approve student leave requests for your hostel block.</p>
      </div>

      {showToast && (
        <div className="toast">
          <CheckCircle size={18} /> Leave Status Updated Successfully
        </div>
      )}

      <div className="glass-card dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Pending Requests</h3>
          <div className="utility-bar">
            <div className="input-with-icon" style={{ width: '250px' }}>
              <Search size={16} />
              <input type="text" placeholder="Search student..." style={{ height: '40px' }} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner">Loading requests...</div></div>
        ) : filteredLeaves.filter(l => l.status === 'Pending').length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={48} />
            <h4>No pending requests</h4>
            <p>All leave applications have been processed.</p>
          </div>
        ) : (
          <div className="list-group">
            {filteredLeaves.filter(l => l.status === 'Pending').map(leave => (
              <div key={leave._id} className="list-item" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <span className="item-title">{leave.studentName} ({leave.rollNo})</span>
                  <p className="item-subtitle">
                    <strong>Type:</strong> {leave.type} | <strong>Dates:</strong> {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                  <p className="item-subtitle" style={{ marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                    <strong>Reason:</strong> {leave.reason}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="submit-btn btn-small" onClick={() => handleStatusUpdate(leave._id, 'Approved')}>
                    Approve
                  </button>
                  <button className="submit-btn btn-small danger" onClick={() => handleStatusUpdate(leave._id, 'Rejected')}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredLeaves.filter(l => l.status !== 'Pending').length > 0 && (
          <>
            <h3 style={{ marginTop: '2.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>History</h3>
            <div className="list-group">
              {filteredLeaves.filter(l => l.status !== 'Pending').map(leave => (
                <div key={leave._id} className="list-item" style={{ opacity: 0.7 }}>
                  <div style={{ flex: 1 }}>
                    <span className="item-title">{leave.studentName} - {leave.type}</span>
                    <p className="item-subtitle">{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`status ${leave.status.toLowerCase()}`}>
                    {leave.status === 'Approved' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WardenLeave;
