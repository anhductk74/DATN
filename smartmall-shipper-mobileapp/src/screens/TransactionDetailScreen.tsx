import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ShipperTransactionResponseDto } from '../services/ShipperTransactionService';
import { shipmentOrderService, ShipmentOrder } from '../services/ShipmentOrderService';

interface TransactionDetailScreenProps {
  transaction: ShipperTransactionResponseDto;
  onBack: () => void;
}

export default function TransactionDetailScreen({ transaction, onBack }: TransactionDetailScreenProps) {
  const [shipmentOrder, setShipmentOrder] = useState<ShipmentOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShipmentOrder();
  }, []);

  const loadShipmentOrder = async () => {
    try {
      setLoading(true);
      const hasShipmentOrder = ['DELIVERY_FEE', 'COLLECT_COD', 'BONUS'].includes(transaction.transactionType);
      
      if (hasShipmentOrder && transaction.shipmentOrderId) {
        const response = await shipmentOrderService.getShipmentById(transaction.shipmentOrderId);
        if (response.success && response.data) {
          setShipmentOrder(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading shipment order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      DELIVERY_FEE: 'Phí giao hàng',
      COLLECT_COD: 'Thu COD',
      RETURN_COD: 'Trả COD',
      PAY_FEE: 'Thanh toán phí',
      WITHDRAWAL: 'Rút tiền',
      REFUND: 'Hoàn tiền',
      BONUS: 'Thưởng',
      PENALTY: 'Phạt',
      DEPOSIT_COD: 'Nộp COD',
      ADJUSTMENT: 'Điều chỉnh',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      PENDING: 'Chờ xử lý',
      PICKING_UP: 'Đang lấy hàng',
      IN_TRANSIT: 'Đang vận chuyển',
      DELIVERED: 'Đã giao',
      RETURNING: 'Đang hoàn',
      RETURNED: 'Đã hoàn',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: '#FF9800',
      PICKING_UP: '#2196F3',
      IN_TRANSIT: '#9C27B0',
      DELIVERED: '#4CAF50',
      RETURNING: '#F57C00',
      RETURNED: '#607D8B',
      CANCELLED: '#F44336',
    };
    return colors[status] || '#999';
  };

  const isIncome = ['DELIVERY_FEE', 'BONUS', 'REFUND', 'COLLECT_COD'].includes(transaction.transactionType);
  const hasShipmentOrder = ['DELIVERY_FEE', 'COLLECT_COD', 'BONUS'].includes(transaction.transactionType);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết giao dịch</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Transaction Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="receipt" size={20} color="#1976D2" />
            <Text style={styles.cardTitle}>Thông tin giao dịch</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã giao dịch:</Text>
            <Text style={styles.infoValue}>...{transaction.id.substring(transaction.id.length - 8)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Loại giao dịch:</Text>
            <Text style={styles.infoValue}>{getTransactionTypeLabel(transaction.transactionType)}</Text>
          </View>

          {hasShipmentOrder && transaction.shipmentOrderCode && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
              <Text style={styles.infoValueHighlight}>
                ...{transaction.shipmentOrderCode.split('-').pop()}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tiền:</Text>
            <Text style={[styles.amountText, { color: isIncome ? '#4CAF50' : '#F44336' }]}>
              {isIncome ? '+' : '-'}{transaction.amount.toLocaleString('vi-VN')}đ
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian:</Text>
            <Text style={styles.infoValue}>
              {new Date(transaction.createdAt).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shipper:</Text>
            <Text style={styles.infoValue}>{transaction.shipperName}</Text>
          </View>
        </View>

        {/* Shipment Order Details */}
        {hasShipmentOrder && (
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
            </View>
          ) : shipmentOrder ? (
            <>
              {/* Order Info Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="box" size={20} color="#1976D2" />
                <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã vận đơn:</Text>
                <Text style={styles.infoValueHighlight}>
                  ...{shipmentOrder.trackingCode.split('.').pop()}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Trạng thái:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipmentOrder.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(shipmentOrder.status)}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kho:</Text>
                <Text style={styles.infoValue}>{shipmentOrder.warehouseName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Khối lượng:</Text>
                <Text style={styles.infoValue}>{shipmentOrder.weight} kg</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phí vận chuyển:</Text>
                <Text style={styles.infoValue}>{shipmentOrder.shippingFee.toLocaleString('vi-VN')}đ</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tiền COD:</Text>
                <Text style={[styles.infoValue, { color: '#4CAF50', fontWeight: '600' }]}>
                  {shipmentOrder.codAmount.toLocaleString('vi-VN')}đ
                </Text>
              </View>

              {shipmentOrder.estimatedDelivery && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dự kiến giao:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(shipmentOrder.estimatedDelivery).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              )}

              {shipmentOrder.deliveredAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Đã giao lúc:</Text>
                  <Text style={[styles.infoValue, { color: '#4CAF50' }]}>
                    {new Date(shipmentOrder.deliveredAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              )}
            </View>

            {/* Recipient Info Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={22} color="#1976D2" />
                <Text style={styles.cardTitle}>Thông tin người nhận</Text>
              </View>

              <View style={styles.recipientRow}>
                <Ionicons name="person-circle" size={18} color="#666" />
                <Text style={styles.recipientText}>{shipmentOrder.recipientName}</Text>
              </View>

              <View style={styles.recipientRow}>
                <Ionicons name="call" size={18} color="#666" />
                <Text style={styles.recipientText}>{shipmentOrder.recipientPhone}</Text>
              </View>

              <View style={styles.addressContainer}>
                <Ionicons name="location" size={18} color="#F57C00" />
                <Text style={styles.addressText}>{shipmentOrder.deliveryAddress}</Text>
              </View>
            </View>

            {/* Pickup Address Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="business" size={20} color="#1976D2" />
                <Text style={styles.cardTitle}>Địa chỉ lấy hàng</Text>
              </View>

              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.addressText}>{shipmentOrder.pickupAddress}</Text>
              </View>
            </View>
            </>
          ) : (
            <View style={styles.card}>
              <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  infoValueHighlight: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  recipientText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
