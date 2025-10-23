// Utility để quản lý trạng thái thanh toán
export interface PendingPaymentInfo {
  orderIds: string[];
  totalAmount: number;
  timestamp: number;
  paymentMethod: string;
}

export const paymentStatusService = {
  /**
   * Lưu thông tin thanh toán đang chờ xử lý
   */
  savePendingPayment(info: PendingPaymentInfo) {
    sessionStorage.setItem('pending_payment', JSON.stringify(info));
  },

  /**
   * Lấy thông tin thanh toán đang chờ xử lý
   */
  getPendingPayment(): PendingPaymentInfo | null {
    try {
      const saved = sessionStorage.getItem('pending_payment');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  /**
   * Xóa thông tin thanh toán đang chờ
   */
  clearPendingPayment() {
    sessionStorage.removeItem('pending_payment');
  },

  /**
   * Kiểm tra có thanh toán đang chờ xử lý không
   */
  hasPendingPayment(): boolean {
    return !!this.getPendingPayment();
  },

  /**
   * Kiểm tra thanh toán có quá hạn không (30 phút)
   */
  isPaymentExpired(info: PendingPaymentInfo): boolean {
    const THIRTY_MINUTES = 30 * 60 * 1000;
    return Date.now() - info.timestamp > THIRTY_MINUTES;
  },

  /**
   * Xóa các thanh toán quá hạn
   */
  cleanupExpiredPayments() {
    const pending = this.getPendingPayment();
    if (pending && this.isPaymentExpired(pending)) {
      this.clearPendingPayment();
    }
  }
};