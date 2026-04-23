import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  PackageSearch,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  MapPin,
  Sparkles,
  ClipboardCheck,
  X,
  Send,
} from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const categories = ['Electronics', 'ID Cards', 'Books', 'Accessories', 'Documents', 'Clothing', 'Other'];

const blankReport = {
  type: 'lost',
  itemName: '',
  category: 'Electronics',
  description: '',
  dateLostOrFound: '',
  location: '',
  imageUrl: '',
  imageName: '',
};

const blankClaim = {
  uniqueIdentifiers: '',
  contentsProof: '',
  proofStatement: '',
};

const statusTone = (status = '') => {
  if (['CLOSED', 'APPROVED', 'VERIFIED', 'HANDED_OVER'].includes(status)) return 'success';
  if (['PENDING', 'OPEN', 'REPORTED', 'MATCH_FOUND', 'MATCH_LINKED', 'CLAIM_REQUESTED'].includes(status)) return 'warning';
  if (status === 'REJECTED') return 'danger';
  return 'info';
};

const formatDate = (value) => new Date(value).toLocaleString();

const LostFoundCenter = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(isStudent ? 'lost' : 'claims');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState(blankReport);
  const [claimModal, setClaimModal] = useState({ open: false, lostItemId: '', foundItemId: '', itemName: '' });
  const [claimForm, setClaimForm] = useState(blankClaim);
  const [reviewForm, setReviewForm] = useState({});

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, claimsRes] = await Promise.all([
        API.get('/lost-found/items', { params: { kind: 'all', scope: isStudent ? 'mine' : 'all' } }),
        API.get('/lost-found/claims', { params: { scope: isStudent ? 'mine' : 'review' } }),
      ]);

      setLostItems(itemsRes.data.lostItems || []);
      setFoundItems(itemsRes.data.foundItems || []);
      setClaims(claimsRes.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load lost and found records.');
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLostItems = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return lostItems.filter((item) =>
      item.itemName?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search) ||
      item.uniqueId?.toLowerCase().includes(search),
    );
  }, [lostItems, searchTerm]);

  const filteredFoundItems = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return foundItems.filter((item) =>
      item.itemName?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search) ||
      item.uniqueId?.toLowerCase().includes(search),
    );
  }, [foundItems, searchTerm]);

  const potentialMatches = useMemo(
    () =>
      lostItems.flatMap((item) =>
        (item.matches || []).map((match) => ({
          lostItem: item,
          match,
        })),
      ),
    [lostItems],
  );

  const filteredPotentialMatches = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return potentialMatches.filter(({ lostItem, match }) =>
      lostItem.itemName?.toLowerCase().includes(search) ||
      lostItem.description?.toLowerCase().includes(search) ||
      match.oppositeItem?.itemName?.toLowerCase().includes(search) ||
      match.oppositeItem?.description?.toLowerCase().includes(search) ||
      match.oppositeItem?.location?.toLowerCase().includes(search),
    );
  }, [potentialMatches, searchTerm]);

  const claimPendingItems = useMemo(
    () => filteredPotentialMatches.filter(({ match }) => !match.claimId),
    [filteredPotentialMatches],
  );

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReportForm((current) => ({
        ...current,
        imageUrl: String(reader.result),
        imageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleReportSubmit = async (event) => {
    event.preventDefault();
    try {
      const endpoint = reportForm.type === 'lost' ? '/lost-found/lost-items' : '/lost-found/found-items';
      await API.post(endpoint, reportForm);
      setReportForm(blankReport);
      setIsReportModalOpen(false);
      setActiveTab(reportForm.type === 'lost' ? 'lost' : 'found');
      showToast(`${reportForm.type === 'lost' ? 'Lost' : 'Found'} item report submitted.`);
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not submit report.');
    }
  };

  const openClaimModal = (lostItemId, foundItemId, itemName) => {
    setClaimModal({ open: true, lostItemId, foundItemId, itemName });
    setClaimForm(blankClaim);
  };

  const handleClaimSubmit = async (event) => {
    event.preventDefault();
    try {
      await API.post('/lost-found/claims', {
        lostItemId: claimModal.lostItemId,
        foundItemId: claimModal.foundItemId,
        verificationAnswers: claimForm,
      });
      setClaimModal({ open: false, lostItemId: '', foundItemId: '', itemName: '' });
      setClaimForm(blankClaim);
      showToast('Claim request submitted for review.');
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Claim request failed.');
    }
  };

  const handleReviewAction = async (claimId, status) => {
    const review = reviewForm[claimId] || {};
    try {
      await API.patch(`/lost-found/claims/${claimId}/review`, {
        status,
        reviewNotes: review.reviewNotes || '',
        handoverSchedule: status === 'APPROVED' ? review.handoverSchedule || '' : '',
      });
      showToast(`Claim ${status.toLowerCase()} successfully.`);
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Claim review failed.');
    }
  };

  const handleCompleteHandover = async (claimId) => {
    try {
      await API.patch(`/lost-found/claims/${claimId}/complete`, {});
      showToast('Handover completed and records closed.');
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not complete handover.');
    }
  };

  const renderStudentItemList = (title, items, emptyLabel) => (
    <div className="glass-card dashboard-content">
      <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
      {items.length === 0 ? (
        <div className="empty-state">
          <PackageSearch size={40} />
          <p>{emptyLabel}</p>
        </div>
      ) : (
        <div className="list-group">
          {items.map((item) => (
            <div key={item._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <span className="item-title">{item.itemName}</span>
                  <p className="item-subtitle">{item.uniqueId}</p>
                </div>
                <span className={`badge ${statusTone(item.status)}`}>{item.status}</span>
              </div>
              <p className="item-subtitle" style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>{item.description}</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="item-subtitle"><MapPin size={13} style={{ verticalAlign: 'text-bottom' }} /> {item.location}</span>
                <span className="item-subtitle">{formatDate(item.dateLostOrFound)}</span>
                <span className="badge info">{item.category}</span>
                <span className="badge warning">{item.matches?.length || 0} Matches</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPotentialMatches = (items, title, emptyLabel) => (
    <div className="glass-card dashboard-content">
      <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
      {items.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={40} />
          <p>{emptyLabel}</p>
        </div>
      ) : (
        <div className="list-group">
          {items.map(({ lostItem, match }) => (
            <div key={match._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <span className="item-title">{lostItem.itemName}</span>
                  <p className="item-subtitle">Your lost item matched with a found report.</p>
                </div>
                <span className="badge info">{match.score}% Match</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                  <strong>Your Lost Report</strong>
                  <p className="item-subtitle" style={{ marginTop: '0.5rem' }}>{lostItem.description}</p>
                  <p className="item-subtitle"><MapPin size={13} style={{ verticalAlign: 'text-bottom' }} /> {lostItem.location}</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                  <strong>Found By Someone</strong>
                  <p className="item-subtitle" style={{ marginTop: '0.5rem' }}>{match.oppositeItem?.description}</p>
                  <p className="item-subtitle"><MapPin size={13} style={{ verticalAlign: 'text-bottom' }} /> {match.oppositeItem?.location}</p>
                  <p className="item-subtitle">Reporter: {match.oppositeItem?.reporterLabel}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge success">Category {match.breakdown?.category}%</span>
                <span className="badge info">Keywords {match.breakdown?.keywords}%</span>
                <span className="badge warning">Location {match.breakdown?.location}%</span>
                <span className="badge danger">Date {match.breakdown?.date}%</span>
                {match.claimStatus && <span className={`badge ${statusTone(match.claimStatus)}`}>Claim {match.claimStatus}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderClaimPendings = () => (
    <div className="glass-card dashboard-content">
      <h3 style={{ marginBottom: '1rem' }}>Claim Pendings</h3>
      {claimPendingItems.length === 0 ? (
        <div className="empty-state">
          <ClipboardCheck size={40} />
          <p>No unclaimed matched found items are waiting right now.</p>
        </div>
      ) : (
        <div className="list-group">
          {claimPendingItems.map(({ lostItem, match }) => (
            <div key={match._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <span className="item-title">{match.oppositeItem?.itemName || lostItem.itemName}</span>
                  <p className="item-subtitle">Unclaimed found item matching your lost report.</p>
                </div>
                <span className="badge warning">{match.score}% Confidence</span>
              </div>
              <p className="item-subtitle" style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>{match.oppositeItem?.description}</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="item-subtitle"><MapPin size={13} style={{ verticalAlign: 'text-bottom' }} /> {match.oppositeItem?.location}</span>
                <span className="item-subtitle">{formatDate(match.oppositeItem?.dateLostOrFound)}</span>
                <span className="badge info">{match.oppositeItem?.category}</span>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <button className="submit-btn btn-small" onClick={() => openClaimModal(lostItem._id, match.foundItemId, match.oppositeItem?.itemName || lostItem.itemName)}>
                  Request Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {claims.length > 0 && (
        <>
          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>My Submitted Claims</h4>
          <div className="list-group">
            {claims.map((claim) => (
              <div key={claim._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <span className="item-title">{claim.foundItem?.itemName || claim.lostItem?.itemName}</span>
                    <p className="item-subtitle">Claim submitted on {formatDate(claim.createdAt)}</p>
                  </div>
                  <span className={`badge ${statusTone(claim.status)}`}>{claim.status}</span>
                </div>
                <p className="item-subtitle"><strong>Review Notes:</strong> {claim.reviewNotes || 'No notes yet'}</p>
                <p className="item-subtitle"><strong>Handover:</strong> {claim.handoverSchedule || 'Not scheduled'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderReviewerClaims = () => (
    <div className="glass-card dashboard-content">
      <h3 style={{ marginBottom: '1rem' }}>Claim Review Queue</h3>
      {claims.length === 0 ? (
        <div className="empty-state">
          <ClipboardCheck size={40} />
          <p>No claims available.</p>
        </div>
      ) : (
        <div className="list-group">
          {claims.map((claim) => (
            <div key={claim._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <span className="item-title">{claim.foundItem?.itemName || claim.lostItem?.itemName}</span>
                  <p className="item-subtitle">Claimant: {claim.claimantName}</p>
                </div>
                <span className={`badge ${statusTone(claim.status)}`}>{claim.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                <div>
                  <p className="item-subtitle"><strong>Identifiers:</strong> {claim.verificationAnswers?.uniqueIdentifiers}</p>
                  <p className="item-subtitle"><strong>Contents / Proof:</strong> {claim.verificationAnswers?.contentsProof}</p>
                  <p className="item-subtitle"><strong>Statement:</strong> {claim.verificationAnswers?.proofStatement}</p>
                </div>
                <div>
                  <p className="item-subtitle"><strong>Match Score:</strong> {claim.match?.score || 'N/A'}%</p>
                  <p className="item-subtitle"><strong>Review Notes:</strong> {claim.reviewNotes || 'No notes yet'}</p>
                  <p className="item-subtitle"><strong>Handover:</strong> {claim.handoverSchedule || 'Not scheduled'}</p>
                </div>
              </div>
              {claim.status === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <textarea
                    rows="2"
                    placeholder="Review notes"
                    value={reviewForm[claim._id]?.reviewNotes || ''}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        [claim._id]: { ...current[claim._id], reviewNotes: event.target.value },
                      }))
                    }
                  />
                  <input
                    type="datetime-local"
                    value={reviewForm[claim._id]?.handoverSchedule || ''}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        [claim._id]: { ...current[claim._id], handoverSchedule: event.target.value },
                      }))
                    }
                  />
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="submit-btn btn-small" onClick={() => handleReviewAction(claim._id, 'APPROVED')}>
                      Approve Claim
                    </button>
                    <button className="submit-btn btn-small danger" onClick={() => handleReviewAction(claim._id, 'REJECTED')}>
                      Reject Claim
                    </button>
                  </div>
                </div>
              )}
              {claim.status === 'APPROVED' && !claim.completedAt && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button className="submit-btn btn-small" onClick={() => handleCompleteHandover(claim._id)}>
                    Mark Handover Complete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Lost & Found Management System</h2>
        <p>
          Report lost or found items, track your own reports, and review matched items through a secure claim workflow.
        </p>
      </div>

      {toast && (
        <div className="toast" style={{ zIndex: 100000 }}>
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      <div className="dashboard-widgets" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[
          { label: 'My Lost Reports', value: lostItems.length, icon: <PackageSearch size={20} />, color: '#f59e0b' },
          { label: 'My Found Reports', value: foundItems.length, icon: <ShieldCheck size={20} />, color: '#10b981' },
          { label: 'Potential Matches', value: potentialMatches.length, icon: <Sparkles size={20} />, color: '#3b82f6' },
          { label: 'Pending Claims', value: claimPendingItems.length, icon: <ClipboardCheck size={20} />, color: '#8b5cf6' },
        ].map((card) => (
          <div key={card.label} className="glass-card stat-card">
            <div className="stat-row">
              <div className="stat-icon" style={{ background: `${card.color}15`, color: card.color }}>{card.icon}</div>
              <span className="stat-value">{card.value}</span>
            </div>
            <span className="stat-label">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-card dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="filter-tabs" style={{ marginBottom: 0, flexWrap: 'wrap' }}>
            {(isStudent
              ? [
                  { id: 'lost', label: 'Lost Reports' },
                  { id: 'found', label: 'Found Reports' },
                  { id: 'matches', label: 'Potential Matches' },
                  { id: 'claims', label: 'Claim Pendings' },
                ]
              : [{ id: 'claims', label: 'Review Claims' }]
            ).map((tab) => (
              <button key={tab.id} className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="input-with-icon" style={{ width: '250px' }}>
              <Search size={16} />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search items..." />
            </div>
            <button className="submit-btn btn-small" onClick={() => setIsReportModalOpen(true)} style={{ background: 'var(--primary-color)' }}>
              <PlusCircle size={16} /> Add Lost / Found Complaint
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner">Loading lost and found records...</div>
        </div>
      ) : isStudent ? (
        <>
          {activeTab === 'lost' && renderStudentItemList('My Lost Item Reports', filteredLostItems, 'You have not reported any lost items yet.')}
          {activeTab === 'found' && renderStudentItemList('My Found Item Reports', filteredFoundItems, 'You have not reported any found items yet.')}
          {activeTab === 'matches' && renderPotentialMatches(filteredPotentialMatches, 'Potential Matches', 'No matching found items for your lost reports yet.')}
          {activeTab === 'claims' && renderClaimPendings()}
        </>
      ) : (
        renderReviewerClaims()
      )}

      {isReportModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ width: '560px', maxWidth: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Add Lost / Found Complaint</h3>
              <button className="close-overlay" onClick={() => setIsReportModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Report Type</label>
                <select value={reportForm.type} onChange={(event) => setReportForm({ ...reportForm, type: event.target.value })}>
                  <option value="lost">Lost Item</option>
                  <option value="found">Found Item</option>
                </select>
              </div>
              <div className="input-group">
                <label>Item Name</label>
                <input value={reportForm.itemName} onChange={(event) => setReportForm({ ...reportForm, itemName: event.target.value })} required />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select value={reportForm.category} onChange={(event) => setReportForm({ ...reportForm, category: event.target.value })}>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Date {reportForm.type === 'lost' ? 'Lost' : 'Found'}</label>
                <input type="date" value={reportForm.dateLostOrFound} onChange={(event) => setReportForm({ ...reportForm, dateLostOrFound: event.target.value })} required />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Location</label>
                <input value={reportForm.location} onChange={(event) => setReportForm({ ...reportForm, location: event.target.value })} placeholder="Hostel block, room, campus area" required />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea rows="4" value={reportForm.description} onChange={(event) => setReportForm({ ...reportForm, description: event.target.value })} placeholder="Describe the item carefully so it can match correctly." required />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Image Upload (optional)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {reportForm.imageName && <p className="item-subtitle" style={{ marginTop: '0.5rem' }}>Attached: {reportForm.imageName}</p>}
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                <button type="button" className="submit-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsReportModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <Send size={16} /> Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {claimModal.open && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ width: '560px', maxWidth: '92%' }}>
            <h3 style={{ marginBottom: '1rem' }}>Verification Claim for {claimModal.itemName}</h3>
            <form onSubmit={handleClaimSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Unique Identifiers</label>
                <textarea rows="2" value={claimForm.uniqueIdentifiers} onChange={(event) => setClaimForm({ ...claimForm, uniqueIdentifiers: event.target.value })} placeholder="Color, serial number, marks, initials, special stickers..." required />
              </div>
              <div className="input-group">
                <label>Contents / Internal Proof</label>
                <textarea rows="2" value={claimForm.contentsProof} onChange={(event) => setClaimForm({ ...claimForm, contentsProof: event.target.value })} placeholder="Contents, stored papers, accessories, case details..." required />
              </div>
              <div className="input-group">
                <label>Supporting Proof</label>
                <textarea rows="2" value={claimForm.proofStatement} onChange={(event) => setClaimForm({ ...claimForm, proofStatement: event.target.value })} placeholder="Why you believe this item is yours and what proof you can provide." required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="submit-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setClaimModal({ open: false, lostItemId: '', foundItemId: '', itemName: '' })}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFoundCenter;
