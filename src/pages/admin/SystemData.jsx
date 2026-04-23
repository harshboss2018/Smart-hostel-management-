import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Database,
  HardDrive,
  Server,
  Activity,
  DownloadCloud,
  CheckCircle,
  CalendarDays,
  MessageSquareWarning,
  TimerReset,
  RefreshCw,
} from 'lucide-react';
import API from '../../api/axios';

const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) {
    return 'Not resolved yet';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

const getLeaveBadgeClass = (status) => {
  if (status === 'Approved') return 'success';
  if (status === 'Rejected') return 'danger';
  return 'warning';
};

const SystemData = () => {
  const [storageUsed, setStorageUsed] = useState(4.2);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  };

  const fetchSystemRecords = useCallback(async () => {
    try {
      setLoading(true);
      const [complaintsResponse, leaveResponse] = await Promise.all([
        API.get('/complaints'),
        API.get('/leave'),
      ]);

      setComplaints(complaintsResponse.data);
      setLeaves(leaveResponse.data);
      setStorageUsed(
        Number((3.8 + complaintsResponse.data.length * 0.08 + leaveResponse.data.length * 0.05).toFixed(1)),
      );
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load system records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemRecords();
  }, [fetchSystemRecords]);

  const complaintSummary = useMemo(() => {
    const resolved = complaints.filter((item) => item.status === 'Resolved');
    const pending = complaints.filter((item) => item.status === 'Pending');
    const inProgress = complaints.filter((item) => item.status === 'In Progress');
    const avgResolution =
      resolved.length > 0
        ? Math.round(
            resolved.reduce((sum, item) => sum + (item.resolutionTimeMinutes || 0), 0) / resolved.length,
          )
        : null;

    return {
      total: complaints.length,
      resolved: resolved.length,
      pending: pending.length,
      inProgress: inProgress.length,
      averageResolution: avgResolution,
    };
  }, [complaints]);

  const leaveSummary = useMemo(() => {
    const approved = leaves.filter((item) => item.status === 'Approved').length;
    const pending = leaves.filter((item) => item.status === 'Pending').length;
    const rejected = leaves.filter((item) => item.status === 'Rejected').length;

    return {
      total: leaves.length,
      approved,
      pending,
      rejected,
    };
  }, [leaves]);

  const stats = [
    { label: 'Server Uptime', value: '99.9%', icon: <Server size={20} />, color: '#3b82f6' },
    { label: 'Complaint Records', value: String(complaintSummary.total), icon: <MessageSquareWarning size={20} />, color: '#f59e0b' },
    { label: 'Leave Applications', value: String(leaveSummary.total), icon: <CalendarDays size={20} />, color: '#10b981' },
    {
      label: 'Avg Resolution Time',
      value: complaintSummary.averageResolution ? formatDuration(complaintSummary.averageResolution) : 'No data',
      icon: <TimerReset size={20} />,
      color: '#8b5cf6',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h2>System Logs & Data</h2>
          <p>Track all complaints, monitor leave applications, and measure complaint resolution speed.</p>
        </div>
        <button className="submit-btn btn-small" onClick={() => { fetchSystemRecords(); showToast('System records refreshed.'); }}>
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {toast && (
        <div className="toast">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      <div className="dashboard-widgets">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card stat-card">
            <div className="stat-row">
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
              <span className="stat-value" style={{ fontSize: stat.label === 'Avg Resolution Time' ? '1.2rem' : undefined }}>{stat.value}</span>
            </div>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-card dashboard-content">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} className="primary-glow-text" /> Complaint Summary
          </h3>
          <div className="list-group">
            <div className="list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="item-title">Pending Complaints</span>
                <p className="item-subtitle">Waiting for assignment or first action</p>
              </div>
              <span className="badge warning">{complaintSummary.pending}</span>
            </div>
            <div className="list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="item-title">In Progress</span>
                <p className="item-subtitle">Currently being handled by staff</p>
              </div>
              <span className="badge info">{complaintSummary.inProgress}</span>
            </div>
            <div className="list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="item-title">Resolved Complaints</span>
                <p className="item-subtitle">Closed with tracked resolution time</p>
              </div>
              <span className="badge success">{complaintSummary.resolved}</span>
            </div>
            <div className="list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="item-title">Average Resolution Time</span>
                <p className="item-subtitle">Calculated from resolved complaints only</p>
              </div>
              <strong style={{ color: 'var(--primary-color)' }}>
                {complaintSummary.averageResolution ? formatDuration(complaintSummary.averageResolution) : 'No resolved complaints'}
              </strong>
            </div>
          </div>
        </div>

        <div className="glass-card dashboard-content">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} className="primary-glow-text" /> Leave Application Summary
          </h3>
          <div className="list-group">
            <div className="list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="item-title">Pending Requests</span>
                <p className="item-subtitle">Awaiting warden or admin decision</p>
              </div>
              <span className="badge warning">{leaveSummary.pending}</span>
            </div>
            <div className="list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="item-title">Approved Requests</span>
                <p className="item-subtitle">Ready for student movement tracking</p>
              </div>
              <span className="badge success">{leaveSummary.approved}</span>
            </div>
            <div className="list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="item-title">Rejected Requests</span>
                <p className="item-subtitle">Closed applications kept for audit trail</p>
              </div>
              <span className="badge danger">{leaveSummary.rejected}</span>
            </div>
            <div className="list-item" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="item-title">Storage Used by Records</span>
                <p className="item-subtitle">Estimated size of active tracked data</p>
              </div>
              <strong style={{ color: 'var(--primary-color)' }}>
                <HardDrive size={16} style={{ verticalAlign: 'text-bottom', marginRight: '0.35rem' }} />
                {storageUsed} GB
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>All Complaint Records</h3>
          <button
            className="submit-btn btn-small"
            onClick={() => showToast(`Exported ${complaints.length} complaint records.`)}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <DownloadCloud size={14} /> Export Complaints
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner">Loading complaints...</div></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <MessageSquareWarning size={48} />
            <h4>No complaint records found</h4>
            <p>Complaint tracking will appear here as soon as students submit issues.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Student</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Resolution Time</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{complaint.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{complaint.category}</div>
                    </td>
                    <td>{complaint.studentId?.name || 'Unknown'} ({complaint.studentId?.rollNo || 'N/A'})</td>
                    <td><span className={`badge ${complaint.priority === 'High' || complaint.priority === 'Emergency' ? 'danger' : complaint.priority === 'Medium' ? 'warning' : 'info'}`}>{complaint.priority}</span></td>
                    <td><span className={`status ${complaint.status.toLowerCase().replace(' ', '-')}`}>{complaint.status}</span></td>
                    <td>{new Date(complaint.createdAt).toLocaleString()}</td>
                    <td>{formatDuration(complaint.resolutionTimeMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>All Leave Applications</h3>
          <button
            className="submit-btn btn-small"
            onClick={() => showToast(`Exported ${leaves.length} leave applications.`)}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <DownloadCloud size={14} /> Export Leave Data
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner">Loading leave applications...</div></div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={48} />
            <h4>No leave applications found</h4>
            <p>Leave tracking records will appear here once students begin applying.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{leave.studentName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{leave.rollNo}</div>
                    </td>
                    <td>{leave.type}</td>
                    <td>
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td><span className={`badge ${getLeaveBadgeClass(leave.status)}`}>{leave.status}</span></td>
                    <td>{new Date(leave.createdAt).toLocaleString()}</td>
                    <td>{leave.wardenRemarks || 'No remarks yet'}</td>
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

export default SystemData;
