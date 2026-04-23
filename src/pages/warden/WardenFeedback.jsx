import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, MessageSquareText, Send, Star, Users } from 'lucide-react';
import API from '../../api/axios';

const typeOptions = [
  { value: 'custom', label: 'Custom Form' },
  { value: 'cleaning', label: 'Room Cleaning' },
];

const getTypeLabel = (type) => {
  if (type === 'cleaning') return 'Room Cleaning';
  if (type === 'complaint-resolution') return 'Complaint Resolution';
  return 'Custom';
};

const buildForm = () => ({
  type: 'custom',
  title: 'Feedback request',
  prompt: 'Please share your feedback.',
  targetLabel: '',
  audience: 'all',
});

const WardenFeedback = () => {
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [form, setForm] = useState(buildForm());

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const fetchStudents = useCallback(async () => {
    try {
      const { data } = await API.get('/users/students');
      setStudents(data || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load students.');
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/feedback');
      setFeedbackItems(data || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load feedback forms.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchFeedback();
  }, [fetchStudents, fetchFeedback]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) => (
      student.name?.toLowerCase().includes(q) ||
      student.rollNo?.toLowerCase().includes(q) ||
      student.hostelId?.toLowerCase().includes(q) ||
      student.email?.toLowerCase().includes(q)
    ));
  }, [studentSearch, students]);

  const summary = useMemo(() => {
    const pending = feedbackItems.filter((item) => item.status === 'Pending').length;
    const submitted = feedbackItems.filter((item) => item.status === 'Submitted').length;
    const avgRating = submitted
      ? (
        feedbackItems
          .filter((item) => item.status === 'Submitted')
          .reduce((sum, item) => sum + (item.response?.rating || 0), 0) / submitted
      ).toFixed(1)
      : '0.0';

    return { pending, submitted, avgRating };
  }, [feedbackItems]);

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((prev) => (
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    ));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    const finalStudentIds = form.audience === 'all'
      ? students.map((student) => student._id)
      : selectedStudentIds;

    if (!finalStudentIds.length) {
      showToast('Select at least one student.');
      return;
    }

    try {
      await API.post('/feedback/requests', {
        type: form.type,
        title: form.title,
        prompt: form.prompt,
        targetLabel: form.targetLabel,
        studentIds: finalStudentIds,
      });

      showToast(`Feedback form sent to ${finalStudentIds.length} student(s).`);
      setForm(buildForm());
      setSelectedStudentIds([]);
      setStudentSearch('');
      fetchFeedback();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to push feedback request.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Feedback Forms</h2>
        <p>Create feedback forms and review student responses (including automatic complaint-resolution feedback).</p>
      </div>

      {toast && (
        <div className="toast" style={{ zIndex: 100000 }}>
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      <div className="dashboard-widgets">
        <div className="glass-card stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{summary.pending}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Submitted</span>
          <span className="stat-value">{summary.submitted}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Average Rating</span>
          <span className="stat-value">{summary.avgRating}</span>
        </div>
      </div>

      <div className="glass-card dashboard-content">
        <h3 style={{ marginBottom: '1rem' }}>Create Form</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-row">
            <div className="form-field">
              <label>Form Type</label>
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Send To</label>
              <select
                value={form.audience}
                onChange={(event) => setForm({ ...form, audience: event.target.value })}
              >
                <option value="all">All students</option>
                <option value="selected">Selected students</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Title</label>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </div>

          <div className="input-group">
            <label>Prompt</label>
            <textarea rows="4" value={form.prompt} onChange={(event) => setForm({ ...form, prompt: event.target.value })} required />
          </div>

          <div className="input-group">
            <label>Target Label (optional)</label>
            <input
              value={form.targetLabel}
              onChange={(event) => setForm({ ...form, targetLabel: event.target.value })}
              placeholder="Example: Block A cleaning round"
            />
          </div>

          {form.audience === 'selected' && (
            <div className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Users size={16} /> Select Students ({selectedStudentIds.length})
                </div>
                <input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Search students..."
                  style={{ minWidth: '240px', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ marginTop: '0.75rem', maxHeight: '220px', overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                {filteredStudents.length === 0 ? (
                  <div className="empty-state" style={{ padding: '1rem' }}>
                    <ClipboardCheck size={28} />
                    <p style={{ marginTop: '0.5rem' }}>No students found.</p>
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <label
                      key={student._id}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.9rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student._id)}
                        onChange={() => toggleStudent(student._id)}
                        style={{ width: 'auto' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{student.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {student.rollNo || 'N/A'} • {student.hostelId || 'Unassigned'}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={16} /> Send Form
          </button>
        </form>
      </div>

      <div className="glass-card dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ marginBottom: 0 }}>Responses</h3>
          <button className="submit-btn btn-small" onClick={() => { fetchFeedback(); showToast('Feedback refreshed.'); }}>
            <CheckCircle2 size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner">Loading feedback...</div></div>
        ) : feedbackItems.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <ClipboardCheck size={48} />
            <h4>No feedback yet</h4>
            <p>Sent forms and automatic complaint-resolution forms will show up here once created.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {feedbackItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.studentId?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.studentId?.rollNo || 'N/A'} • {item.studentId?.hostelId || 'Unassigned'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.type === 'complaint-resolution' ? 'warning' : 'info'}`}>
                        {getTypeLabel(item.type)}
                      </span>
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
                    <td style={{ minWidth: '260px' }}>
                      <div style={{ fontSize: '0.9rem' }}>
                        {item.response?.comment || 'Awaiting student response.'}
                      </div>
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

export default WardenFeedback;

