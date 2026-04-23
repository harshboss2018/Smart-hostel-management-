import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Download, FileText, CheckCircle } from 'lucide-react';
import API from '../../api/axios';

const WardenStudents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/users/students');
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setToast(error.response?.data?.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.hostelId?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, students],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Student Directory</h2>
        <p>View and manage your hostel student directory. Use “Feedback Forms” to send feedback requests.</p>
      </div>

      {toast && (
        <div className="toast success">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      <div className="glass-card dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%', padding: '0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="submit-btn btn-small" onClick={() => setToast('Generating attendance report...')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              <FileText size={16} /> Reports
            </button>
            <button className="submit-btn btn-small" onClick={() => setToast('Exporting student list to CSV...')} style={{ background: 'var(--primary-color)' }}>
              <Download size={16} /> Export List
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Hostel/Room</th>
                <th>Institutional Email</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner">Syncing students...</div></td></tr>
              ) : filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td><span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{student.rollNo || 'N/A'}</span></td>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td>{student.hostelId || 'Unassigned'}</td>
                  <td>{student.email}</td>
                  <td>
                    <span className="badge success">Verified</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="submit-btn btn-small"
                        onClick={() => setToast(`Viewing profile of ${student.name}`)}
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'var(--bg-accent)' }}
                      >
                        View Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredStudents.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Users size={32} />
              <p style={{ marginTop: '0.5rem' }}>No students found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardenStudents;
