import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { orderTrackingService, OrderTrackingLogResponse } from '../services/orderTrackingService';
import { orderStatusHistoryService, OrderStatusHistory } from '../services/OrderStatusHistory';

type OrderTrackingDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderTrackingDetail'>;
type OrderTrackingDetailScreenRouteProp = RouteProp<RootStackParamList, 'OrderTrackingDetail'>;

interface OrderTrackingDetailScreenProps {
  navigation: OrderTrackingDetailScreenNavigationProp;
  route: OrderTrackingDetailScreenRouteProp;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#ff9800',
  CONFIRMED: '#2196f3',
  SHIPPING: '#9c27b0',
  DELIVERED: '#4caf50',
  CANCELLED: '#f44336',
  RETURN_REQUESTED: '#ff5722',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Order Confirmed',
  SHIPPING: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return Requested',
};

export default function OrderTrackingDetailScreen({ navigation, route }: OrderTrackingDetailScreenProps) {
  const { orderId, orderStatus, trackingNumber } = route.params;
  const [trackingLogs, setTrackingLogs] = useState<OrderTrackingLogResponse[]>([]);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tracking' | 'history'>('tracking');

  useEffect(() => {
    loadTrackingData();
  }, [orderId]);

  const loadTrackingData = async () => {
    try {
      setIsLoading(true);
      
      // Load tracking logs
      const trackingResponse = await orderTrackingService.getTrackingLogs(orderId);
      if (trackingResponse.success && trackingResponse.data) {
        setTrackingLogs(trackingResponse.data);
      }

      // Load status history
      const historyResponse = await orderStatusHistoryService.getOrderHistory(orderId);
      if (historyResponse.success && historyResponse.data) {
        setStatusHistory(historyResponse.data);
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tracking Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading tracking information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tracking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Card */}
      <View style={[styles.statusCard, { backgroundColor: `${STATUS_COLORS[orderStatus] || '#2196f3'}15` }]}>
        <View style={styles.statusCardContent}>
          <Ionicons 
            name="cube" 
            size={48} 
            color={STATUS_COLORS[orderStatus] || '#2196f3'} 
          />
          <View style={styles.statusCardText}>
            <Text style={styles.statusCardLabel}>Current Status</Text>
            <Text style={[styles.statusCardValue, { color: STATUS_COLORS[orderStatus] || '#2196f3' }]}>
              {STATUS_LABELS[orderStatus] || orderStatus}
            </Text>
            {trackingNumber && (
              <Text style={styles.trackingNumberText}>
                Tracking: {trackingNumber}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tracking' && styles.tabActive]}
          onPress={() => setActiveTab('tracking')}
        >
          <Ionicons 
            name="location" 
            size={20} 
            color={activeTab === 'tracking' ? '#2563eb' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'tracking' && styles.tabTextActive]}>
            Delivery Tracking
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons 
            name="time" 
            size={20} 
            color={activeTab === 'history' ? '#2563eb' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Status History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'tracking' ? (
          // Tracking Logs Timeline
          <View style={styles.timelineContainer}>
            {trackingLogs.length > 0 ? (
              trackingLogs.map((log, index) => (
                <View key={log.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      index === 0 && styles.timelineDotActive
                    ]}>
                      <View style={[
                        styles.timelineDotInner,
                        index === 0 && styles.timelineDotInnerActive
                      ]} />
                    </View>
                    {index < trackingLogs.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <View style={[
                      styles.timelineCard,
                      index === 0 && styles.timelineCardActive
                    ]}>
                      <View style={styles.timelineCardHeader}>
                        <Ionicons 
                          name="location" 
                          size={18} 
                          color={index === 0 ? '#2563eb' : '#666'} 
                        />
                        <Text style={[
                          styles.timelineLocation,
                          index === 0 && styles.timelineLocationActive
                        ]}>
                          {log.currentLocation}
                        </Text>
                      </View>
                      <Text style={styles.timelineDescription}>
                        {log.statusDescription}
                      </Text>
                      <View style={styles.timelineFooter}>
                        <Ionicons name="time-outline" size={14} color="#999" />
                        <Text style={styles.timelineTime}>
                          {formatDate(log.updatedAt)}
                        </Text>
                      </View>
                      {log.carrier && (
                        <View style={styles.carrierBadge}>
                          <MaterialCommunityIcons name="truck-delivery" size={14} color="#2563eb" />
                          <Text style={styles.carrierText}>{log.carrier}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="package-variant" size={80} color="#ccc" />
                <Text style={styles.emptyStateText}>No tracking information available yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Tracking details will appear here once the order is shipped
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Status History Timeline
          <View style={styles.timelineContainer}>
            {statusHistory.length > 0 ? (
              statusHistory.map((history, index) => (
                <View key={history.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      index === 0 && styles.timelineDotActive
                    ]}>
                      <View style={[
                        styles.timelineDotInner,
                        index === 0 && styles.timelineDotInnerActive
                      ]} />
                    </View>
                    {index < statusHistory.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <View style={[
                      styles.timelineCard,
                      index === 0 && styles.timelineCardActive
                    ]}>
                      <View style={styles.statusHistoryHeader}>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: `${STATUS_COLORS[history.toStatus] || '#2196f3'}15` }
                        ]}>
                          <Text style={[
                            styles.statusBadgeText,
                            { color: STATUS_COLORS[history.toStatus] || '#2196f3' }
                          ]}>
                            {STATUS_LABELS[history.toStatus] || history.toStatus}
                          </Text>
                        </View>
                        {history.fromStatus && (
                          <View style={styles.statusChange}>
                            <Text style={styles.fromStatusText}>
                              from {STATUS_LABELS[history.fromStatus] || history.fromStatus}
                            </Text>
                          </View>
                        )}
                      </View>
                      {history.note && (
                        <Text style={styles.historyNote}>
                          <Ionicons name="information-circle-outline" size={14} color="#666" />
                          {' '}{history.note}
                        </Text>
                      )}
                      <View style={styles.timelineFooter}>
                        <Ionicons name="time-outline" size={14} color="#999" />
                        <Text style={styles.timelineTime}>
                          {formatDate(history.changedAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="history" size={80} color="#ccc" />
                <Text style={styles.emptyStateText}>No status history available</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 30 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  statusCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  statusCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCardText: {
    marginLeft: 16,
    flex: 1,
  },
  statusCardLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  statusCardValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackingNumberText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  timelineContainer: {
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 32,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: '#2563eb',
  },
  timelineDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  timelineDotInnerActive: {
    backgroundColor: '#fff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
    minHeight: 60,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  timelineCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f7ff',
  },
  timelineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  timelineLocationActive: {
    color: '#2563eb',
  },
  timelineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  timelineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#999',
  },
  carrierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  carrierText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  statusHistoryHeader: {
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fromStatusText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  historyNote: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
