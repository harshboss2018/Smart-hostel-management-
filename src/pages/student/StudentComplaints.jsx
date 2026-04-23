import React, { useState, useEffect } from 'react';
import { PlusCircle, MessageSquare, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import API from '../../api/axios';

const StudentComplaints = () => {
  const [filter, setFilter] = useState('all');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Maintenance',
    priority: 'Medium'
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/complaints', formData);
      setShowToast('Grievance submitted successfully!');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: 'Maintenance', priority: 'Medium' });
      fetchComplaints();
      setTimeout(() => setShowToast(null), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Submission failed';
      setShowToast('Submission failed: ' + errorMsg);
      setTimeout(() => setShowToast(null), 5000);
    }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={14} />;
      case 'in-progress': return <AlertCircle size={14} />;
      case 'resolved': return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Complaint Center</h2>
        <p>Raise a new issue or track the status of your existing complaints.</p>
      </div>

      {showToast && (
        <div className="toast" style={{ 
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 100000,
          background: 'var(--bg-accent)', border: '1px solid var(--primary-color)',
          padding: '1rem 2rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)',
          animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--success-color)' }} /> {showToast}
        </div>
      )}

      <div className="glass-card dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="filter-tabs">
            {['all', 'pending', 'in-progress', 'resolved'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button 
            className="submit-btn btn-small" 
            style={{ background: 'var(--primary-color)' }}
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={16} /> Raise Complaint
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner">Loading complaints...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h4>No complaints found</h4>
            <p>No complaints match the selected filter.</p>
          </div>
        ) : (
          <div className="list-group">
            {filtered.map(complaint => (
              <div key={complaint._id} className="list-item">
                <div style={{ flex: 1 }}>
                  <span className="item-title">{complaint.title}</span>
                  <p className="item-subtitle">{complaint.category} • Submitted {new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`status ${complaint.status.toLowerCase().replace(' ', '-')}`}>
                  {getStatusIcon(complaint.status.toLowerCase().replace(' ', '-'))}
                  {complaint.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise Complaint Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Raise New Complaint</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label>Issue Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Brief summary of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {['Maintenance', 'Plumbing', 'Electrical', 'WiFi', 'Cleanliness', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    {['Low', 'Medium', 'High', 'Emergency'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  required 
                  rows="4" 
                  placeholder="Provide more details about the problem..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="submit-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" style={{ flex: 1 }}>
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentComplaints;
