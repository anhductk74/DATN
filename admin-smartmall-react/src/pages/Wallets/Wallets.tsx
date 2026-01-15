import { useState } from 'react';
import { useWithdrawalRequests, useProcessWithdrawal } from '../../hooks/useWallets';
import { WithdrawalStatus } from '../../types/wallet.types';
import type { WithdrawalRequest } from '../../types/wallet.types';
import './Wallets.css';

const TABS = [
  { key: 'PENDING' as WithdrawalStatus, label: 'Pending', color: 'pending' },
  { key: 'APPROVED' as WithdrawalStatus, label: 'Approved', color: 'approved' },
  { key: 'COMPLETED' as WithdrawalStatus, label: 'Completed', color: 'completed' },
  { key: 'REJECTED' as WithdrawalStatus, label: 'Rejected', color: 'rejected' },
];

export default function Wallets() {
  const [activeTab, setActiveTab] = useState<WithdrawalStatus>(WithdrawalStatus.PENDING);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processAction, setProcessAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // Fetch data cho tab hiện tại
  const { data, isLoading, error } = useWithdrawalRequests(activeTab, currentPage, 10);
  
  // Fetch badge counts cho tất cả các tabs (chỉ trang đầu tiên để lấy totalElements)
  const { data: pendingData } = useWithdrawalRequests(WithdrawalStatus.PENDING, 0, 1);
  const { data: approvedData } = useWithdrawalRequests(WithdrawalStatus.APPROVED, 0, 1);
  const { data: completedData } = useWithdrawalRequests(WithdrawalStatus.COMPLETED, 0, 1);
  const { data: rejectedData } = useWithdrawalRequests(WithdrawalStatus.REJECTED, 0, 1);
  
  const processWithdrawal = useProcessWithdrawal();

  // Get badge count cho từng tab
  const getBadgeCount = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.PENDING:
        return pendingData?.totalElements ?? 0;
      case WithdrawalStatus.APPROVED:
        return approvedData?.totalElements ?? 0;
      case WithdrawalStatus.COMPLETED:
        return completedData?.totalElements ?? 0;
      case WithdrawalStatus.REJECTED:
        return rejectedData?.totalElements ?? 0;
      default:
        return 0;
    }
  };

  const handleTabChange = (tab: WithdrawalStatus) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const handleProcessClick = (request: WithdrawalRequest, action: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(request);
    setProcessAction(action);
    setShowProcessModal(true);
    setAdminNote('');
  };

  const handleProcessSubmit = async () => {
    if (!selectedRequest || !processAction) return;

    try {
      await processWithdrawal.mutateAsync({
        requestId: selectedRequest.id,
        data: {
          status: processAction,
          adminNote: adminNote.trim() || undefined,
        },
      });
      setShowProcessModal(false);
      setSelectedRequest(null);
      setProcessAction(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('An error occurred while processing the request. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN'),
    };
  };

  const getStatusBadgeClass = (status: WithdrawalStatus) => {
    return `status-badge ${status.toLowerCase()}`;
  };

  const getStatusLabel = (status: WithdrawalStatus) => {
    const labels: Record<WithdrawalStatus, string> = {
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
    };
    return labels[status];
  };

  return (
    <div className="wallets-container">
      <div className="wallets-header">
        <h1>Withdrawal Requests Management</h1>
      </div>

      <div className="wallets-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
            <span className="badge">{getBadgeCount(tab.key)}</span>
          </button>
        ))}
      </div>

      <div className="requests-table-container">
        {isLoading ? (
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>An error occurred while loading data. Please try again.</p>
          </div>
        ) : !data?.content || data.content.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No withdrawal requests found</p>
          </div>
        ) : (
          <>
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  {activeTab !== WithdrawalStatus.PENDING && <th>Processed By</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((request) => {
                  const createdDate = formatDateTime(request.createdAt);
                  return (
                    <tr key={request.id}>
                      <td>
                        <div className="shop-info">
                          <span className="shop-name">{request.shopName}</span>
                          <span className="shop-id">ID: {request.shopId.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td>
                        <span className="amount">{formatCurrency(request.amount)}</span>
                      </td>
                      <td>
                        <div className="bank-info">
                          <span className="bank-name">{request.bankName}</span>
                          <span className="bank-account">
                            {request.bankAccountNumber} - {request.bankAccountName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(request.status)}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td>
                        <div className="date-time">
                          <span className="date">{createdDate.date}</span>
                          <span className="time">{createdDate.time}</span>
                        </div>
                      </td>
                      {activeTab !== WithdrawalStatus.PENDING && (
                        <td>
                          {request.processedBy ? (
                            <div className="date-time">
                              <span className="date">{request.processedBy}</span>
                              {request.processedAt && (
                                <span className="time">
                                  {formatDateTime(request.processedAt).date}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      )}
                      <td>
                        <div className="action-buttons">
                          {activeTab === WithdrawalStatus.PENDING ? (
                            <>
                              <button
                                className="btn btn-approve"
                                onClick={() => handleProcessClick(request, 'APPROVED')}
                                disabled={processWithdrawal.isPending}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-reject"
                                onClick={() => handleProcessClick(request, 'REJECTED')}
                                disabled={processWithdrawal.isPending}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-view"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowProcessModal(true);
                                setProcessAction(null);
                              }}
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {data.totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Page {currentPage + 1} / {data.totalPages} ({data.totalElements} requests)
                </div>
                <div className="pagination-buttons">
                  <button
                    className="pagination-button"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 0}
                  >
                    ← Previous
                  </button>
                  <button
                    className="pagination-button"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage >= data.totalPages - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Process Modal */}
      {showProcessModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowProcessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {processAction === 'APPROVED'
                  ? 'Approve Withdrawal Request'
                  : processAction === 'REJECTED'
                  ? 'Reject Withdrawal Request'
                  : 'Withdrawal Request Details'}
              </h2>
              <button className="modal-close" onClick={() => setShowProcessModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Shop</span>
                  <span className="info-value">{selectedRequest.shopName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Amount</span>
                  <span className="info-value">{formatCurrency(selectedRequest.amount)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Bank</span>
                  <span className="info-value">{selectedRequest.bankName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Number</span>
                  <span className="info-value">{selectedRequest.bankAccountNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Holder</span>
                  <span className="info-value">{selectedRequest.bankAccountName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className={getStatusBadgeClass(selectedRequest.status)}>
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </div>
              </div>

              {selectedRequest.note && (
                <div className="form-group">
                  <label>Shop Note</label>
                  <div className="note-box">{selectedRequest.note}</div>
                </div>
              )}

              {selectedRequest.adminNote && (
                <div className="form-group">
                  <label>Admin Note</label>
                  <div className="note-box">{selectedRequest.adminNote}</div>
                </div>
              )}

              {processAction && (
                <div className="form-group">
                  <label>
                    Admin Note {processAction === 'REJECTED' && '(Required when rejecting)'}
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={
                      processAction === 'APPROVED'
                        ? 'e.g.: Information verified. Transfer scheduled for 01/10/2026 at 3:00 PM...'
                        : 'e.g.: Account number does not exist. Please verify the information...'
                    }
                  />
                </div>
              )}
            </div>

            {processAction && (
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowProcessModal(false)}>
                  Cancel
                </button>
                <button
                  className={`btn-submit ${processAction === 'APPROVED' ? 'approve' : 'reject'}`}
                  onClick={handleProcessSubmit}
                  disabled={
                    processWithdrawal.isPending ||
                    (processAction === 'REJECTED' && !adminNote.trim())
                  }
                >
                  {processWithdrawal.isPending
                    ? 'Processing...'
                    : processAction === 'APPROVED'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
