import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { orderTrackingService, OrderTrackingLogResponse } from '../services/orderTrackingService';
import { orderStatusHistoryService, OrderStatusHistory } from '../services/OrderStatusHistory';
import { shipmentOrderService, ShipmentOrder } from '../services/ShipmentOrderService';
import { subShipmentOrderService, SubShipmentOrderResponseDto } from '../services/SubShipmentOrderService';
import { shopService, Shop } from '../services/ShopService';
import { orderService, Order } from '../services/OrderService';
import { warehouseService, WarehouseResponseDto } from '../services/WarehouseService';
import { GOONG_API_KEY } from '../config/config';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

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
  const [shipmentOrder, setShipmentOrder] = useState<ShipmentOrder | null>(null);
  const [subShipments, setSubShipments] = useState<SubShipmentOrderResponseDto[]>([]);
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number; longitude: number}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    loadTrackingData();
  }, [orderId]);

  // Geocode address to coordinates using expo-location
  const geocodeAddress = async (address: string): Promise<{latitude: number; longitude: number} | null> => {
    try {
      const geocoded = await Location.geocodeAsync(address);
      if (geocoded && geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        console.log(`Geocoded "${address}" to:`, { latitude, longitude });
        return { latitude, longitude };
      }
    } catch (error) {
      console.error('Geocoding error for address:', address, error);
    }
    return null;
  };

  // Decode polyline from Goong API response
  const decodePolyline = (encoded: string): Array<{latitude: number; longitude: number}> => {
    const points: Array<{latitude: number; longitude: number}> = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  // Get route from Goong Directions API
  const getGoongDirectionsRoute = async (
    waypoints: Array<{latitude: number; longitude: number}>
  ): Promise<Array<{latitude: number; longitude: number}>> => {
    if (waypoints.length < 2) return waypoints;
    if (!GOONG_API_KEY) {
      console.warn('GOONG_API_KEY not configured, using straight line');
      return waypoints;
    }

    try {
      // Build route with all waypoints
      const origin = `${waypoints[0].latitude},${waypoints[0].longitude}`;
      const destination = `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`;
      
      // Add intermediate waypoints if any
      let url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${GOONG_API_KEY}`;
      
      if (waypoints.length > 2) {
        const intermediatePoints = waypoints.slice(1, -1)
          .map(p => `${p.latitude},${p.longitude}`)
          .join('|');
        url += `&waypoints=${intermediatePoints}`;
      }

      console.log('🗺️ Calling Goong Directions API...');
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        if (route.overview_polyline && route.overview_polyline.points) {
          const decodedPoints = decodePolyline(route.overview_polyline.points);
          console.log(`✅ Goong API returned ${decodedPoints.length} route points`);
          return decodedPoints;
        }
      }

      console.warn('No routes found in Goong API response, using straight line');
      return waypoints;
    } catch (error) {
      console.error('Error calling Goong Directions API:', error);
      return waypoints;
    }
  };

  // Handle call support hotline
  const handleCallSupport = () => {
    const supportHotline = '1900-1234'; // Số hotline tổng đài
    const phoneNumber = `tel:${supportHotline}`;

    Alert.alert(
      'Gọi hỗ trợ',
      `Bạn có muốn gọi đến tổng đài hỗ trợ ${supportHotline}?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Gọi ngay',
          onPress: () => {
            Linking.canOpenURL(phoneNumber)
              .then((supported) => {
                if (supported) {
                  return Linking.openURL(phoneNumber);
                } else {
                  Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi');
                }
              })
              .catch((err) => {
                console.error('Error opening phone dialer:', err);
                Alert.alert('Lỗi', 'Không thể mở ứng dụng gọi điện');
              });
          },
        },
      ]
    );
  };

  // Calculate initial region from route coordinates
  const initialRegion = routeCoordinates.length > 0 ? {
    latitude: routeCoordinates[0].latitude,
    longitude: routeCoordinates[0].longitude,
    latitudeDelta: 2,
    longitudeDelta: 2,
  } : {
    latitude: 16.0544,
    longitude: 108.2022,
    latitudeDelta: 2,
    longitudeDelta: 2,
  };

  const loadTrackingData = async () => {
    try {
      setIsLoading(true);
      
      // Load order data first
      const orderResponse = await orderService.getOrder(orderId);
      if (orderResponse.success && orderResponse.data) {
        setOrderData(orderResponse.data);
        
        // Load shop data using shopId from order
        if (orderResponse.data.shopId) {
          const shopResponse = await shopService.getShopById(orderResponse.data.shopId);
          if (shopResponse.success && shopResponse.data) {
            setShopData(shopResponse.data);
          }
        }
      }

      // Load tracking logs
      const trackingResponse = await orderTrackingService.getTrackingLogs(orderId);
      if (trackingResponse.success && trackingResponse.data) {
        const sortedLogs = [...trackingResponse.data].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setTrackingLogs(sortedLogs);
      }

      // Load status history
      const historyResponse = await orderStatusHistoryService.getOrderHistory(orderId);
      if (historyResponse.success && historyResponse.data) {
        const sortedHistory = [...historyResponse.data].sort((a, b) => 
          new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
        );
        setStatusHistory(sortedHistory);
      }

      // Load shipment order
      const shipmentResponse = await shipmentOrderService.getShipmentByOrderId(orderId);
      if (shipmentResponse.success && shipmentResponse.data) {
        setShipmentOrder(shipmentResponse.data);

        // Load sub-shipments using shipment ID
        const subShipmentsResponse = await subShipmentOrderService.getByShipmentOrder(shipmentResponse.data.id);
        if (subShipmentsResponse.success && subShipmentsResponse.data) {
          const sortedSubShipments = [...subShipmentsResponse.data].sort((a, b) => a.sequence - b.sequence);
          setSubShipments(sortedSubShipments);

          // Build route coordinates
          await buildRouteCoordinates(sortedSubShipments, shipmentResponse.data, orderResponse.data);
        } else {
          // If no sub-shipments, build simple route from pickup to delivery
          await buildSimpleRoute(shipmentResponse.data, orderResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildSimpleRoute = async (shipment: ShipmentOrder, order: Order | null) => {
    try {
      const waypoints: Array<{latitude: number; longitude: number}> = [];

      // Start: Shop/Pickup address
      if (shipment.pickupAddress) {
        const pickupCoords = await geocodeAddress(shipment.pickupAddress);
        if (pickupCoords) waypoints.push(pickupCoords);
      }

      // End: Customer delivery address
      if (shipment.deliveryAddress) {
        const deliveryCoords = await geocodeAddress(shipment.deliveryAddress);
        if (deliveryCoords) waypoints.push(deliveryCoords);
      } else if (order?.shippingAddress) {
        const fullAddress = `${order.shippingAddress.addressLine}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`;
        const deliveryCoords = await geocodeAddress(fullAddress);
        if (deliveryCoords) waypoints.push(deliveryCoords);
      }

      // Get actual route from Goong API
      const routePoints = await getGoongDirectionsRoute(waypoints);
      setRouteCoordinates(routePoints);
      fitMapToCoordinates(routePoints);
    } catch (error) {
      console.error('Error building simple route:', error);
    }
  };

  const buildRouteCoordinates = async (
    subShipments: SubShipmentOrderResponseDto[],
    shipment: ShipmentOrder,
    order: Order | null
  ) => {
    try {
      const coordinates: Array<{latitude: number; longitude: number}> = [];

      // Chặng 1: Shop location (pickup) to first warehouse
      if (shopData?.address) {
        const shopAddress = `${shopData.address.street}, ${shopData.address.commune}, ${shopData.address.district}, ${shopData.address.city}`;
        const shopCoords = await geocodeAddress(shopAddress);
        if (shopCoords) {
          console.log('📍 Shop location:', shopAddress);
          coordinates.push(shopCoords);
        }
      } else if (shipment.pickupAddress) {
        const pickupCoords = await geocodeAddress(shipment.pickupAddress);
        if (pickupCoords) {
          console.log('📍 Pickup location:', shipment.pickupAddress);
          coordinates.push(pickupCoords);
        }
      }

      // Chặng 2, 3, ...: Warehouses from sub-shipments
      for (const subShipment of subShipments) {
        // Get detailed warehouse information using toWarehouseId
        if (subShipment.toWarehouseId) {
          const warehouseResponse = await warehouseService.getById(subShipment.toWarehouseId);
          if (warehouseResponse.success && warehouseResponse.data) {
            const warehouse = warehouseResponse.data;
            // Build full warehouse address
            const warehouseAddress = `${warehouse.address}, ${warehouse.ward}, ${warehouse.district}, ${warehouse.province}`;
            const warehouseCoords = await geocodeAddress(warehouseAddress);
            if (warehouseCoords) {
              console.log(`📍 Warehouse (${warehouse.name}):`, warehouseAddress);
              coordinates.push(warehouseCoords);
            }
          } else {
            // Fallback to warehouse name if API call fails
            console.warn(`Failed to get warehouse details for ID: ${subShipment.toWarehouseId}`);
            if (subShipment.toWarehouseName) {
              const warehouseCoords = await geocodeAddress(subShipment.toWarehouseName);
              if (warehouseCoords) {
                console.log(`📍 Warehouse (fallback):`, subShipment.toWarehouseName);
                coordinates.push(warehouseCoords);
              }
            }
          }
        }
      }

      // Final chặng: Customer delivery address
      if (shipment.deliveryAddress) {
        const deliveryCoords = await geocodeAddress(shipment.deliveryAddress);
        if (deliveryCoords) {
          console.log('📍 Delivery location:', shipment.deliveryAddress);
          coordinates.push(deliveryCoords);
        }
      } else if (order?.shippingAddress) {
        const fullAddress = `${order.shippingAddress.addressLine}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`;
        const deliveryCoords = await geocodeAddress(fullAddress);
        if (deliveryCoords) {
          console.log('📍 Delivery location:', fullAddress);
          coordinates.push(deliveryCoords);
        }
      }

      console.log('✅ Built route with', coordinates.length, 'waypoints');
      
      // Get actual route from Goong API
      const routePoints = await getGoongDirectionsRoute(coordinates);
      setRouteCoordinates(routePoints);
      fitMapToCoordinates(routePoints);
    } catch (error) {
      console.error('Error building route coordinates:', error);
    }
  };

  const fitMapToCoordinates = (coordinates: Array<{latitude: number; longitude: number}>) => {
    if (coordinates.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }, 1000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Tính progress dựa trên order status
  const getProgressSteps = () => {
    const status = orderStatus?.toUpperCase() || '';
    
    return {
      packed: ['PACKED', 'SHIPPING', 'DELIVERED'].includes(status),
      shipping: ['SHIPPING', 'DELIVERED'].includes(status),
      delivered: status === 'DELIVERED',
    };
  };

  const progressSteps = getProgressSteps();

  // Get status name for header
  const getHeaderTitle = () => {
    const status = orderStatus?.toUpperCase() || '';
    
    switch(status) {
      case 'PACKED':
        return 'Packed';
      case 'SHIPPING':
        return 'In Transit';
      case 'DELIVERED':
        return 'Delivered';
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Order Tracking';
    }
  };

  // Format tracking code - get last part
  const formatTrackingCode = (code: string) => {
    if (!code) return '';
    
    // Split by dot and get last part
    // Example: S23017939.SGP02-N10.1387355742 -> 1387355742
    const parts = code.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1]; // Get last part
    }
    
    // If too long, truncate to first 15 characters
    if (code.length > 15) {
      return code.substring(0, 15);
    }
    
    return code;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleCallSupport}>
            <Ionicons name="headset-outline" size={24} color="#ee4d2d" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="help-circle-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        {showMap && (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={initialRegion}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              {/* Route line */}
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#ee4d2d"
                strokeWidth={4}
              />
              
              {/* Markers */}
              <Marker
                coordinate={routeCoordinates[routeCoordinates.length - 1]}
                title="Da Nang"
                description="Current location"
              >
                <View style={styles.markerContainer}>
                  <MaterialCommunityIcons name="truck-delivery" size={32} color="#ee4d2d" />
                </View>
              </Marker>

              <Marker
                coordinate={routeCoordinates[0]}
                title="Ho Chi Minh City"
                description="Starting point"
                pinColor="#4caf50"
              />
            </MapView>
          </View>
        )}

        {/* Delivery Status Card */}
        <View style={styles.deliveryStatusCard}>
          <View style={styles.deliveryDateRow}>
            <Text style={styles.deliveryDateLabel}>Dự kiến giao:</Text>
            <Text style={styles.deliveryDate}>
              {trackingLogs.length > 0 ? formatDateFull(trackingLogs[0].updatedAt) : '03 Tháng 10'}
            </Text>
          </View>

          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[
                styles.progressDot, 
                progressSteps.packed ? styles.progressDotCompleted : styles.progressDotInactive
              ]}>
                {progressSteps.packed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.progressLabel}>Packed</Text>
            </View>
            <View style={[
              styles.progressLine,
              progressSteps.shipping && styles.progressLineCompleted
            ]} />
            <View style={styles.progressStep}>
              <View style={[
                styles.progressDot, 
                progressSteps.shipping ? styles.progressDotCompleted : styles.progressDotInactive
              ]}>
                {progressSteps.shipping && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.progressLabel}>In{'\n'}Transit</Text>
            </View>
            <View style={[
              styles.progressLine,
              progressSteps.delivered && styles.progressLineCompleted
            ]} />
            <View style={styles.progressStep}>
              <View style={[
                styles.progressDot, 
                progressSteps.delivered ? styles.progressDotCompleted : styles.progressDotInactive
              ]}>
                {progressSteps.delivered && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.progressLabel}>Delivered</Text>
            </View>
          </View>

          {/* Carrier Info */}
          <View style={styles.carrierInfoCard}>
            <View style={styles.carrierIconContainer}>
              <MaterialCommunityIcons name="package-variant" size={32} color="#ee4d2d" />
            </View>
            <View style={styles.carrierInfo}>
              <Text style={styles.carrierName}>GHTK Express</Text>
              <Text style={styles.carrierCode}>
                {formatTrackingCode(shipmentOrder?.trackingCode || trackingNumber || '')}
              </Text>
            </View>
            <TouchableOpacity style={styles.orderInfoButton} onPress={() => navigation.goBack()}>
              <Text style={styles.orderInfoButtonText}>Order Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.timelineSection}>
          {trackingLogs.length > 0 ? (
            trackingLogs.map((log, index) => (
              <View key={log.id} style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>{formatDate(log.updatedAt).split(' ')[0]}</Text>
                  <Text style={styles.timelineTime}>{formatDate(log.updatedAt).split(' ')[1]}</Text>
                </View>
                
                <View style={styles.timelineCenter}>
                  <View style={[
                    styles.timelineDot,
                    index === 0 ? styles.timelineDotActive : styles.timelineDotInactive
                  ]}>
                    {index === 0 && <View style={styles.timelineDotInner} />}
                  </View>
                  {index < trackingLogs.length - 1 && (
                    <View style={styles.timelineConnector} />
                  )}
                </View>

                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineTitle,
                    index === 0 && styles.timelineTitleActive
                  ]}>
                    {log.statusDescription}
                  </Text>
                  {log.currentLocation && (
                    <Text style={styles.timelineSubtitle}>
                      {log.currentLocation}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            // Mock data
            <>
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>03/10</Text>
                  <Text style={styles.timelineTime}>15:27</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotActive]}>
                    <View style={styles.timelineDotInner} />
                  </View>
                  <View style={styles.timelineConnector} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, styles.timelineTitleActive]}>
                    Giao hàng thành công
                  </Text>
                  <Text style={styles.timelineLink}>Xem ảnh giao hàng</Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>03/10</Text>
                  <Text style={styles.timelineTime}>07:39</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotInactive]} />
                  <View style={styles.timelineConnector} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    Đơn hàng sẽ sớm được giao, vui lòng để ý điện thoại
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>03/10</Text>
                  <Text style={styles.timelineTime}>06:59</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotInactive]} />
                  <View style={styles.timelineConnector} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    Hàng đã đến bưu cục phát và sẽ được giao trong 12h tới
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>02/10</Text>
                  <Text style={styles.timelineTime}>23:39</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotInactive]} />
                  <View style={styles.timelineConnector} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Hàng đã về kho</Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>01/10</Text>
                  <Text style={styles.timelineTime}>18:36</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotInactive]} />
                  <View style={styles.timelineConnector} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Hàng đã về kho</Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>01/10</Text>
                  <Text style={styles.timelineTime}>18:36</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotInactive]} />
                  <View style={styles.timelineConnector} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Hàng đã về bưu cục</Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>01/10</Text>
                  <Text style={styles.timelineTime}>11:00</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotInactive]} />
                  <View style={styles.timelineConnector} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    Hàng đã về bưu cục phường Hiệp Thành, Quận 12, TP Hồ Chí Minh
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>01/10</Text>
                  <Text style={styles.timelineTime}>08:58</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotInactive]} />
                  <View style={styles.timelineConnector} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    Đơn vị vận chuyển đã lấy hàng thành công
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>01/10</Text>
                  <Text style={styles.timelineTime}>08:51</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotInactive]} />
                  <View style={styles.timelineConnector} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    Người bán đang chuẩn bị hàng
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <Text style={styles.timelineDate}>01/10</Text>
                  <Text style={styles.timelineTime}>08:27</Text>
                </View>
                <View style={styles.timelineCenter}>
                  <View style={[styles.timelineDot, styles.timelineDotInactive]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    Đơn hàng đã được đặt
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

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
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    padding: 4,
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
  content: {
    flex: 1,
  },
  
  // Map styles
  mapContainer: {
    height: height * 0.4,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Delivery Status Card
  deliveryStatusCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  deliveryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  deliveryDateLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  deliveryDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#05a75b',
  },

  // Progress Steps
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotCompleted: {
    backgroundColor: '#05a75b',
  },
  progressDotInactive: {
    backgroundColor: '#e0e0e0',
  },
  progressLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  progressLine: {
    height: 2,
    backgroundColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: -10,
    marginBottom: 32,
  },
  progressLineCompleted: {
    backgroundColor: '#05a75b',
  },

  // Carrier Info Card
  carrierInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  carrierIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  carrierInfo: {
    flex: 1,
  },
  carrierName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  carrierCode: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  orderInfoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ee4d2d',
    borderRadius: 4,
  },
  orderInfoButtonText: {
    fontSize: 12,
    color: '#ee4d2d',
    fontWeight: '500',
  },

  // Timeline Section
  timelineSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  timelineLeftColumn: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#999',
  },
  timelineCenter: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginTop: 6,
    position: 'relative',
  },
  timelineDotActive: {
    backgroundColor: '#05a75b',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3,
  },
  timelineDotInactive: {
    backgroundColor: '#e0e0e0',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  timelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 2,
    minHeight: 40,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  timelineTitleActive: {
    color: '#05a75b',
    fontWeight: '500',
  },
  timelineSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  timelineLink: {
    fontSize: 13,
    color: '#ee4d2d',
    marginTop: 4,
  },
});
