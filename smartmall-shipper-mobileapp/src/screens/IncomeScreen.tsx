import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { shipperTransactionService, ShipperTransactionResponseDto } from '../services/ShipperTransactionService';
import { shipperSubOrderService, ShipperDashboardResponseDto } from '../services/ShipperSubOrderService';
import { storageService } from '../services/storage.service';

const { width } = Dimensions.get('window');

interface IncomeScreenProps {
  onBack: () => void;
  onNavigateToDetail?: (transaction: ShipperTransactionResponseDto) => void;
}

type TabType = 'transactions' | 'deposit';

export default function IncomeScreen({ onBack, onNavigateToDetail }: IncomeScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [transactions, setTransactions] = useState<ShipperTransactionResponseDto[]>([]);
  const [dashboard, setDashboard] = useState<ShipperDashboardResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shipperId, setShipperId] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    loadShipperData();
  }, []);

  useEffect(() => {
    if (shipperId) {
      loadData();
    }
  }, [shipperId, activeTab]);

  const loadShipperData = async () => {
    const userInfo = await storageService.getUserInfo();
    if (userInfo?.shipper?.shipperId) {
      setShipperId(userInfo.shipper.shipperId);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTransactions(),
        loadDashboard(),
      ]);
    } catch (error) {
      console.error('Error loading income data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await shipperTransactionService.getByShipper(shipperId);
      
      if (response.success && response.data) {
        const sortedTransactions = [...response.data].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setTransactions(sortedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await shipperSubOrderService.getDashboard(shipperId);
      
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (value: string): string => {
    // Xóa tất cả ký tự không phải số
    const numbers = value.replace(/[^0-9]/g, '');
    if (!numbers) return '';
    
    // Thêm dấu chấm phân cách hàng nghìn
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseCurrency = (value: string): number => {
    // Xóa dấu chấm và chuyển thành số
    return parseFloat(value.replace(/\./g, '')) || 0;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setDepositAmount(formatted);
  };

  const handleDepositCOD = async () => {
    const amount = parseCurrency(depositAmount);
    
    if (!depositAmount || isNaN(amount) || amount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    const totalCollected = dashboard?.cod?.totalCollected || 0;
    const totalPaid = dashboard?.cod?.totalPaid || 0;
    const availableBalance = totalCollected - totalPaid;

    if (amount > availableBalance) {
      Alert.alert(
        'Số dư không đủ',
        `Bạn chỉ có thể nộp tối đa ${availableBalance.toLocaleString('vi-VN')}đ`
      );
      return;
    }

    Alert.alert(
      'Xác nhận nộp COD',
      `Bạn có chắc muốn nộp ${amount.toLocaleString('vi-VN')}đ?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setDepositLoading(true);
              
              const response = await shipperTransactionService.create({
                shipperId: shipperId,
                shipmentOrderId: '00000000-0000-0000-0000-000000000000', // Dummy ID for deposit
                amount: amount,
                transactionType: 'DEPOSIT_COD',
              });

              if (response.success) {
                Alert.alert('Thành công', 'Nộp COD thành công');
                setDepositAmount('');
                await loadData(); // Reload data
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể nộp COD');
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi nộp COD');
            } finally {
              setDepositLoading(false);
            }
          },
        },
      ]
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY_FEE':
        return { name: 'motorcycle', color: '#4CAF50', bg: '#E8F5E9' };
      case 'COLLECT_COD':
        return { name: 'hand-holding-usd', color: '#4CAF50', bg: '#E8F5E9' };
      case 'RETURN_COD':
        return { name: 'undo', color: '#FF9800', bg: '#FFF3E0' };
      case 'PAY_FEE':
        return { name: 'money-bill-wave', color: '#F44336', bg: '#FFEBEE' };
      case 'WITHDRAWAL':
        return { name: 'wallet', color: '#9C27B0', bg: '#F3E5F5' };
      case 'BONUS':
        return { name: 'gift', color: '#00BCD4', bg: '#E0F7FA' };
      case 'PENALTY':
        return { name: 'exclamation-triangle', color: '#F44336', bg: '#FFEBEE' };
      case 'DEPOSIT_COD':
        return { name: 'piggy-bank', color: '#607D8B', bg: '#ECEFF1' };
      default:
        return { name: 'exchange-alt', color: '#9E9E9E', bg: '#F5F5F5' };
    }
  };

  const getTransactionLabel = (type: string) => {
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

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <View style={[styles.summaryIconContainer, { backgroundColor: '#E8F5E9' }]}>
          <FontAwesome5 name="arrow-down" size={20} color="#4CAF50" />
        </View>
        <Text style={styles.summaryLabel}>Đã thu</Text>
        <Text style={[styles.summaryValue, { color: '#4CAF50' }]} numberOfLines={1} adjustsFontSizeToFit>
          {(dashboard?.cod?.totalCollected || 0).toLocaleString('vi-VN')}đ
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={[styles.summaryIconContainer, { backgroundColor: '#FFEBEE' }]}>
          <FontAwesome5 name="arrow-up" size={20} color="#F44336" />
        </View>
        <Text style={styles.summaryLabel}>Đã trả</Text>
        <Text style={[styles.summaryValue, { color: '#F44336' }]} numberOfLines={1} adjustsFontSizeToFit>
          {(dashboard?.cod?.totalPaid || 0).toLocaleString('vi-VN')}đ
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={[styles.summaryIconContainer, { backgroundColor: '#F3E5F5' }]}>
          <FontAwesome5 name="wallet" size={20} color="#9C27B0" />
        </View>
        <Text style={styles.summaryLabel}>Thu nhập</Text>
        <Text style={[styles.summaryValue, { color: '#9C27B0' }]} numberOfLines={1} adjustsFontSizeToFit>
          {(dashboard?.cod?.netIncome || 0).toLocaleString('vi-VN')}đ
        </Text>
      </View>
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.listContainer}>
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="inbox" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
        </View>
      ) : (
        transactions.map((transaction) => {
          const icon = getTransactionIcon(transaction.transactionType);
          const isIncome = ['DELIVERY_FEE', 'BONUS', 'REFUND', 'COLLECT_COD'].includes(transaction.transactionType);

          return (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionCard}
              onPress={() => onNavigateToDetail?.(transaction)}
              activeOpacity={0.7}
            >
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: icon.bg }]}>
                  <FontAwesome5 name={icon.name} size={18} color={icon.color} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>
                    {getTransactionLabel(transaction.transactionType)}
                  </Text>
                  <Text style={styles.transactionOrder}>
                    <Ionicons name="cube-outline" size={12} color="#999" />
                    {' '}{transaction.shipmentOrderCode && transaction.shipmentOrderCode.length > 15
                      ? transaction.shipmentOrderCode.substring(0, 15) + '...'
                      : transaction.shipmentOrderCode || 'N/A'}
                  </Text>
                  <Text style={styles.transactionId}>
                    ID: {transaction.id.substring(0, 8)}...
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.createdAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: isIncome ? '#4CAF50' : '#F44336' },
                  ]}
                >
                  {isIncome ? '+' : '-'}{transaction.amount.toLocaleString('vi-VN')}đ
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" style={{ marginTop: 4 }} />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const renderDepositForm = () => {
    const totalCollected = dashboard?.cod?.totalCollected || 0;
    const totalPaid = dashboard?.cod?.totalPaid || 0;
    const availableBalance = totalCollected - totalPaid;

    return (
      <View style={styles.depositContainer}>
        {/* Balance Info Card */}
        <View style={styles.balanceInfoCard}>
          <View style={styles.balanceInfoHeader}>
            <FontAwesome5 name="wallet" size={24} color="#1976D2" />
            <Text style={styles.balanceInfoTitle}>Số dư hiện tại</Text>
          </View>
          
          <Text style={styles.balanceAmount}>
            {availableBalance.toLocaleString('vi-VN')}đ
          </Text>

          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailRow}>
              <Text style={styles.balanceDetailLabel}>Đã thu:</Text>
              <Text style={[styles.balanceDetailValue, { color: '#4CAF50' }]}>
                {totalCollected.toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.balanceDetailRow}>
              <Text style={styles.balanceDetailLabel}>Đã trả:</Text>
              <Text style={[styles.balanceDetailValue, { color: '#F44336' }]}>
                {totalPaid.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>
        </View>

        {/* Deposit Form Card */}
        <View style={styles.depositFormCard}>
          <View style={styles.depositFormHeader}>
            <FontAwesome5 name="piggy-bank" size={20} color="#1976D2" />
            <Text style={styles.depositFormTitle}>Nộp tiền COD</Text>
          </View>

          <Text style={styles.depositLabel}>Số tiền nộp</Text>
          <View style={styles.inputContainer}>
            <FontAwesome5 name="dollar-sign" size={16} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.amountInput}
              placeholder="Nhập số tiền"
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={handleAmountChange}
              editable={!depositLoading}
            />
            <Text style={styles.currencyText}>đ</Text>
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountContainer}>
            <Text style={styles.quickAmountLabel}>Chọn nhanh:</Text>
            <View style={styles.quickAmountButtons}>
              <TouchableOpacity
                style={styles.quickAmountButton}
                onPress={() => setDepositAmount(formatCurrency('1000000'))}
              >
                <Text style={styles.quickAmountButtonText}>1 triệu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAmountButton}
                onPress={() => setDepositAmount(formatCurrency('3000000'))}
              >
                <Text style={styles.quickAmountButtonText}>3 triệu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAmountButton}
                onPress={() => setDepositAmount(formatCurrency('5000000'))}
              >
                <Text style={styles.quickAmountButtonText}>5 triệu</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Deposit Button */}
          <TouchableOpacity
            style={[
              styles.depositButton,
              (depositLoading || !depositAmount) && styles.depositButtonDisabled,
            ]}
            onPress={handleDepositCOD}
            disabled={depositLoading || !depositAmount}
          >
            {depositLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome5 name="check-circle" size={18} color="#fff" />
                <Text style={styles.depositButtonText}>Xác nhận nộp COD</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#FF9800" />
          <Text style={styles.depositInfoText}>
            Sau khi nộp COD, số tiền sẽ được chuyển về công ty. Bạn có thể xem lịch sử nộp tại tab Giao dịch.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thu nhập</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <FontAwesome5
            name="exchange-alt"
            size={16}
            color={activeTab === 'transactions' ? '#1976D2' : '#999'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'transactions' && styles.activeTabText,
            ]}
          >
            Giao dịch
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'deposit' && styles.activeTab]}
          onPress={() => setActiveTab('deposit')}
        >
          <FontAwesome5
            name="piggy-bank"
            size={16}
            color={activeTab === 'deposit' ? '#1976D2' : '#999'}
          />
          <Text
            style={[styles.tabText, activeTab === 'deposit' && styles.activeTabText]}
          >
            Nộp COD
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'transactions' ? renderTransactions() : renderDepositForm()}
        </ScrollView>
      )}
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 0,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionOrder: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  transactionId: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
  },
  sequenceTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sequenceTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  deliveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  deliveryTimeText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  deliveryInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  separator: {
    fontSize: 13,
    color: '#ccc',
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  balanceDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  balanceItem: {
    width: '50%',
    paddingVertical: 8,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  balanceItemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  balanceFinalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  balanceFinalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  depositContainer: {
    padding: 16,
    paddingTop: 0,
  },
  balanceInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  balanceInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  balanceInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
    textAlign: 'center',
  },
  balanceDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    gap: 8,
  },
  balanceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceDetailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  depositFormCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  depositFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  depositFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  depositLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 14,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  quickAmountContainer: {
    marginBottom: 20,
  },
  quickAmountLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  quickAmountButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  depositButton: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  depositButtonDisabled: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
  depositButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  depositInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
