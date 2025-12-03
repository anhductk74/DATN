import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { CartItem } from '../services/CartService';
import addressService, { Address } from '../services/addressService';
import voucherService, { VoucherResponseDto } from '../services/voucherService';
import { orderService } from '../services/OrderService';
import CartService from '../services/CartService';
import { productService } from '../services/productService';
import { getCloudinaryUrl } from '../config/config';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;
type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

interface CheckoutScreenProps {
  navigation: CheckoutScreenNavigationProp;
  route: CheckoutScreenRouteProp;
}

export default function CheckoutScreen({ navigation, route }: CheckoutScreenProps) {
  const { items } = route.params;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [vouchers, setVouchers] = useState<VoucherResponseDto[]>([]);
  const [allVouchers, setAllVouchers] = useState<VoucherResponseDto[]>([]);
  const [selectedVouchers, setSelectedVouchers] = useState<VoucherResponseDto[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [shippingMethod, setShippingMethod] = useState<{ id: string; name: string; cost: number } | null>({ id: 'standard', name: 'Giao Hàng Tiêu Chuẩn', cost: 30000 });
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    setIsLoading(true);
    try {
      // Load addresses
      const addressResponse = await addressService.getAddresses();
      if (addressResponse.success && addressResponse.data) {
        setAddresses(addressResponse.data);
        const defaultAddr = addressResponse.data.find(addr => addr.isDefault) || addressResponse.data[0];
        setSelectedAddress(defaultAddr || null);
      }

      // Load vouchers
      const voucherResponse = await voucherService.getAllVouchers();
      if (voucherResponse.success && voucherResponse.data) {
        setAllVouchers(voucherResponse.data || []);
        const orderTotal = calculateSubtotal();
        const applicableVouchers = voucherService.filterApplicableVouchers(
          voucherResponse.data,
          orderTotal,
          items
        );
        setVouchers(applicableVouchers);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0);
  };

  const calculateShipping = () => {
    return shippingMethod ? shippingMethod.cost : 0;
  };

  const shippingMethods = [
    { id: 'express', name: 'Giao Hàng Nhanh', cost: 40000 },
    { id: 'economy', name: 'Giao Hàng Tiết Kiệm', cost: 25000 },
    { id: 'standard', name: 'Giao Hàng Tiêu Chuẩn', cost: 30000 },
  ];

  const calculateDiscountBreakdown = () => {
    if (!selectedVouchers || selectedVouchers.length === 0) {
      return { productDiscount: 0, shippingDiscount: 0, totalDiscount: 0 };
    }

    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    let productDiscount = 0;
    let shippingDiscount = 0;

    for (const v of selectedVouchers) {
      if (v.type === 'SHOP' && (v as any).shopId) {
        const shopId = (v as any).shopId;
        const shopSubtotal = items
          .filter((it: any) => it.shopId === shopId)
          .reduce((s: number, it: any) => s + (it.subtotal || 0), 0);
        productDiscount += voucherService.calculateVoucherDiscount(v, shopSubtotal);
      } else if (v.type === 'SHIPPING') {
        if (shipping > 0) {
          let discount = 0;
          if (v.discountType === 'PERCENTAGE') {
            discount = (shipping * v.discountValue) / 100;
            if (v.maxDiscountAmount && discount > v.maxDiscountAmount) {
              discount = v.maxDiscountAmount;
            }
          } else if (v.discountType === 'FIXED_AMOUNT') {
            discount = v.discountValue;
            if (v.maxDiscountAmount && discount > v.maxDiscountAmount) {
              discount = v.maxDiscountAmount;
            }
          }
          const capped = Math.min(discount, shipping);
          shippingDiscount += capped;
        }
      } else {
        productDiscount += voucherService.calculateVoucherDiscount(v, subtotal);
      }
    }

    productDiscount = Math.min(productDiscount, subtotal);
    shippingDiscount = Math.min(shippingDiscount, shipping);

    return {
      productDiscount,
      shippingDiscount,
      totalDiscount: productDiscount + shippingDiscount
    };
  };

  const calculateDiscount = () => {
    const breakdown = calculateDiscountBreakdown();
    return breakdown.totalDiscount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const discount = calculateDiscount();
    return subtotal + shipping - discount;
  };

  const handleApplyVoucherCode = async () => {
    if (!voucherCode.trim()) {
      Alert.alert('Error', 'Please enter voucher code');
      return;
    }

    try {
      const response = await voucherService.getVoucherByCode(voucherCode.trim());
      if (response.success && response.data) {
        const orderTotal = calculateSubtotal();
        const isApplicable = voucherService.isVoucherApplicable(response.data, orderTotal, items);
        
        if (isApplicable && response.data) {
          const newVoucher = response.data as VoucherResponseDto;
          setSelectedVouchers(prev => {
            const exists = prev.find(v => v.id === newVoucher.id);
            if (exists) return prev;
            return [...prev, newVoucher];
          });
          setVoucherCode('');
          Alert.alert('Success', 'Voucher applied successfully');
        } else {
          Alert.alert('Invalid Voucher', 'This voucher cannot be applied to your order');
        }
      } else {
        Alert.alert('Error', response.message || 'Voucher not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply voucher');
    }
  };

  const handleSelectVoucher = (voucher: VoucherResponseDto) => {
    // Toggle selection (multi-select). Do not auto-close modal to allow multiple picks.
    setSelectedVouchers(prev => {
      const exists = prev.find(v => v.id === voucher.id);
      if (exists) return prev.filter(v => v.id !== voucher.id);
      return [...prev, voucher];
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    const executePlaceOrder = async () => {
      setIsPlacingOrder(true);
      try {
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
        
        if (!userInfo?.id) {
          Alert.alert('Error', 'User not found. Please login again.');
          setIsPlacingOrder(false);
          return;
        }

        const shopId = items[0]?.productShopId;
        
        if (!shopId) {
          Alert.alert('Error', 'Shop information not found');
          setIsPlacingOrder(false);
          return;
        }

        const orderData = {
          userId: userInfo.id,
          shopId: shopId,
          shippingAddressId: selectedAddress.id,
          paymentMethod: paymentMethod,
          shippingFee: calculateShipping(),
          items: items.map((item: CartItem) => ({
            variantId: item.variant.id,
            quantity: item.quantity,
          })),
          voucherIds: selectedVouchers.map(v => v.id),
        };

        const response = await orderService.createOrder(orderData);
        
        if (response.success && response.data) {
          for (const item of items) {
            await CartService.removeItem(item.id);
          }

          Alert.alert(
            'Order Placed Successfully',
            `Order #${response.data.orderNumber} has been placed`,
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert('Error', response.message || 'Failed to place order');
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred');
      } finally {
        setIsPlacingOrder(false);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Confirm Order',
          message: `Place order with ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'VNPay'}?`,
          options: ['Cancel', 'Confirm'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            executePlaceOrder();
          }
        }
      );
    } else {
      Alert.alert(
        'Confirm Order',
        `Place order with ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'VNPay'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: executePlaceOrder,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const renderAddressSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="location" size={20} color="#333" />
        <Text style={styles.sectionTitle}>Delivery Address</Text>
      </View>

      {selectedAddress ? (
        <TouchableOpacity
          style={styles.addressCard}
          onPress={() => navigation.navigate('Addresses')}
        >
          <View style={styles.addressInfo}>
            <Text style={styles.addressRecipient}>{selectedAddress.recipient}</Text>
            <Text style={styles.addressPhone}>{selectedAddress.phoneNumber}</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {selectedAddress.fullAddress}
            </Text>
            {selectedAddress.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={() => navigation.navigate('Addresses')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#2563eb" />
          <Text style={styles.addAddressText}>Add Delivery Address</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItemsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="cart" size={20} color="#333" />
        <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
      </View>

      {items.map((item: CartItem) => {
        const attributesText = item.variant.attributes
          .map((attr: any) => `${attr.name}: ${attr.value}`)
          .join(', ');

        return (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.itemImageContainer}>
              {item.productImage ? (
                <Image
                  source={{ uri: getCloudinaryUrl(item.productImage) }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.itemImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={24} color="#ccc" />
                </View>
              )}
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.productName}
              </Text>
              {attributesText && (
                <Text style={styles.itemVariant} numberOfLines={1}>
                  {attributesText}
                </Text>
              )}
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>
                  {item.variant.price.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
            </View>

            <Text style={styles.itemSubtotal}>
              {item.subtotal.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderVoucherSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="ticket-percent" size={20} color="#333" />
        <Text style={styles.sectionTitle}>Voucher</Text>
      </View>

      {/* Always show apply-by-code input */}
      <View style={styles.voucherInput}>
        <TextInput
          style={styles.input}
          placeholder="Enter voucher code"
          value={voucherCode}
          onChangeText={setVoucherCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApplyVoucherCode}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* If any vouchers selected, show them (with remove) */}
      {selectedVouchers && selectedVouchers.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          {selectedVouchers.map(v => {
            let displayDiscount = 0;
            if (v.type === 'SHOP' && (v as any).shopId) {
              const shopSubtotal = items.filter((it: any) => it.shopId === (v as any).shopId).reduce((s: number, it: any) => s + (it.subtotal || 0), 0);
              displayDiscount = voucherService.calculateVoucherDiscount(v, shopSubtotal);
            } else if (v.type === 'SHIPPING') {
              const shippingCost = shippingMethod?.cost || 0;
              
              if (shippingCost > 0) {
                let discount = 0;
                if (v.discountType === 'PERCENTAGE') {
                  discount = (shippingCost * v.discountValue) / 100;
                  if (v.maxDiscountAmount && discount > v.maxDiscountAmount) {
                    discount = v.maxDiscountAmount;
                  }
                } else if (v.discountType === 'FIXED_AMOUNT') {
                  discount = v.discountValue;
                  if (v.maxDiscountAmount && discount > v.maxDiscountAmount) {
                    discount = v.maxDiscountAmount;
                  }
                }
                displayDiscount = Math.min(discount, shippingCost);
              }
            } else {
              displayDiscount = voucherService.calculateVoucherDiscount(v, calculateSubtotal());
            }

            return (
              <View key={v.id} style={styles.voucherCard}>
                <View style={styles.voucherIcon}>
                  <MaterialCommunityIcons name="ticket-percent" size={24} color="#2563eb" />
                </View>
                <View style={styles.voucherInfo}>
                  <Text style={styles.voucherCode}>{v.code}</Text>
                  <Text style={styles.voucherDesc} numberOfLines={1}>{v.description}</Text>
                  <Text style={styles.voucherDiscount}>-{displayDiscount.toLocaleString('vi-VN')}đ</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedVouchers(prev => prev.filter(x => x.id !== v.id))}>
                  <Ionicons name="close-circle" size={24} color="#999" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* Always allow selecting from available vouchers */}
      {vouchers.length > 0 && (
        <TouchableOpacity
          style={styles.selectVoucherButton}
          onPress={() => setShowVoucherModal(true)}
        >
          <Text style={styles.selectVoucherText}>
            Select from {vouchers.length} available vouchers
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#2563eb" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPaymentSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="card" size={20} color="#333" />
        <Text style={styles.sectionTitle}>Payment Method</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === 'COD' && styles.paymentOptionSelected,
        ]}
        onPress={() => setPaymentMethod('COD')}
      >
        <View style={styles.paymentOptionLeft}>
          <Ionicons name="cash" size={24} color="#333" />
          <View style={styles.paymentOptionInfo}>
            <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
            <Text style={styles.paymentOptionDesc}>Pay when you receive</Text>
          </View>
        </View>
        <Ionicons
          name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'}
          size={24}
          color={paymentMethod === 'COD' ? '#2563eb' : '#999'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === 'VNPAY' && styles.paymentOptionSelected,
        ]}
        onPress={() => setPaymentMethod('VNPAY')}
      >
        <View style={styles.paymentOptionLeft}>
          <MaterialCommunityIcons name="credit-card" size={24} color="#333" />
          <View style={styles.paymentOptionInfo}>
            <Text style={styles.paymentOptionTitle}>VNPay</Text>
            <Text style={styles.paymentOptionDesc}>Pay online via VNPay</Text>
          </View>
        </View>
        <Ionicons
          name={paymentMethod === 'VNPAY' ? 'radio-button-on' : 'radio-button-off'}
          size={24}
          color={paymentMethod === 'VNPAY' ? '#2563eb' : '#999'}
        />
      </TouchableOpacity>
    </View>
  );

  const renderShippingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="bicycle" size={20} color="#333" />
        <Text style={styles.sectionTitle}>Shipping Method</Text>
      </View>

      {shippingMethods.map((m) => (
        <TouchableOpacity
          key={m.id}
          style={[
            styles.paymentOption,
            shippingMethod?.id === m.id && styles.paymentOptionSelected,
          ]}
          onPress={() => setShippingMethod(m)}
        >
          <View style={styles.paymentOptionLeft}>
            <Ionicons name={m.id === 'express' ? 'flash' : m.id === 'economy' ? 'leaf' : 'cube'} size={24} color="#333" />
            <View style={styles.paymentOptionInfo}>
              <Text style={styles.paymentOptionTitle}>{m.name}</Text>
              <Text style={styles.paymentOptionDesc}>{m.cost.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
          <Ionicons
            name={shippingMethod?.id === m.id ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={shippingMethod?.id === m.id ? '#2563eb' : '#999'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSummarySection = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const discount = calculateDiscount();
    const total = calculateTotal();

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="receipt" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Order Summary</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({items.length} items):</Text>
          <Text style={styles.summaryValue}>{subtotal.toLocaleString('vi-VN')}đ</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping:</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'Free' : `${shipping.toLocaleString('vi-VN')}đ`}
          </Text>
        </View>

        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Voucher Discount:</Text>
            <Text style={styles.summaryDiscount}>-{discount.toLocaleString('vi-VN')}đ</Text>
          </View>
        )}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotal}>Total:</Text>
          <Text style={styles.summaryTotalValue}>{total.toLocaleString('vi-VN')}đ</Text>
        </View>
      </View>
    );
  };

  const renderVoucherModal = () => {
    if (!showVoucherModal) return null;

    // Filter out expired vouchers and SHOP vouchers for shops not present in the cart
    const now = new Date();
    const filtered = allVouchers.filter(v => {
      if (!v.active) return false;
      const end = new Date(v.endDate);
      if (end < now) return false; // expired
      if (v.type === 'SHOP' && (v as any).shopId) {
        const hasShopItem = items.some((it: any) => it.shopId === (v as any).shopId);
        if (!hasShopItem) return false; // don't show shop vouchers for other shops
      }
      return true;
    });

    const orderTotal = calculateSubtotal();
    const applicable = filtered.filter(v => voucherService.isVoucherApplicable(v, orderTotal, items));
    const notApplicable = filtered.filter(v => !voucherService.isVoucherApplicable(v, orderTotal, items));

    return (
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Voucher</Text>
            <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {applicable.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: '600', marginBottom: 8 }}>Available for this order</Text>
                {applicable.map((voucher) => {
                  const discount = voucherService.calculateVoucherDiscount(voucher, orderTotal);
                  return (
                    <TouchableOpacity
                      key={voucher.id}
                      style={styles.voucherItem}
                      onPress={() => handleSelectVoucher(voucher)}
                    >
                      <View style={styles.voucherItemIcon}>
                        <MaterialCommunityIcons name="ticket-percent" size={32} color="#2563eb" />
                      </View>
                      <View style={styles.voucherItemInfo}>
                        <Text style={styles.voucherItemCode}>{voucher.code}</Text>
                        <Text style={styles.voucherItemDesc} numberOfLines={2}>{voucher.description}</Text>
                        <Text style={styles.voucherItemDiscount}>Save {discount.toLocaleString('vi-VN')}đ</Text>
                      </View>
                      {selectedVouchers.find(sv => sv.id === voucher.id) ? (
                        <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                      ) : (
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {notApplicable.length > 0 && (
              <View>
                <Text style={{ fontWeight: '600', marginBottom: 8 }}>Other vouchers</Text>
                {notApplicable.map((voucher) => (
                  <View key={voucher.id} style={[styles.voucherItem, { opacity: 0.5 }]}> 
                    <View style={styles.voucherItemIcon}>
                      <MaterialCommunityIcons name="ticket-percent" size={32} color="#999" />
                    </View>
                    <View style={styles.voucherItemInfo}>
                      <Text style={styles.voucherItemCode}>{voucher.code}</Text>
                      <Text style={styles.voucherItemDesc} numberOfLines={2}>{voucher.description}</Text>
                      <Text style={[styles.voucherItemDiscount, { color: '#999' }]}>Not applicable</Text>
                    </View>
                    <Ionicons name="close" size={20} color="#999" />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderAddressSection()}
        {renderItemsSection()}
        {renderVoucherSection()}
        {renderShippingSection()}
        {renderPaymentSection()}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {(() => {
          const breakdown = calculateDiscountBreakdown();
          const subtotal = calculateSubtotal();
          const shipping = calculateShipping();
          const total = calculateTotal();

          return (
            <>
              <View style={styles.footerSummarySingle}>
                <Text style={styles.footerLabel}>Subtotal:</Text>
                <Text style={[styles.footerAmountRed, { fontSize: 14 }]}>{subtotal.toLocaleString('vi-VN')}đ</Text>
              </View>
{/* 
              <View style={styles.footerSummarySingle}>
                <Text style={styles.footerLabel}>Shipping:</Text>
                <Text style={styles.footerAmountRed}>{shipping.toLocaleString('vi-VN')}đ</Text>
              </View> */}

              {breakdown.totalDiscount > 0 && (
                <View style={styles.footerSummarySingle}>
                  <Text style={styles.footerLabel}>Discounted:</Text>
                  <Text style={[styles.footerAmountRed, { textDecorationLine: 'line-through', fontSize: 14 }]}>-{breakdown.totalDiscount.toLocaleString('vi-VN')}đ</Text>
                </View>
              )}

              <View style={[styles.footerSummarySingle, { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' }]}>
                <Text style={[styles.footerLabel, { fontSize: 16, fontWeight: '700' }]}>Total:</Text>
                <Text style={styles.footerAmountRedLarge}>{total.toLocaleString('vi-VN')}đ</Text>
              </View>
            </>
          );
        })()}

        <TouchableOpacity
          style={[styles.placeOrderButton, isPlacingOrder && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || !selectedAddress}
        >
          {isPlacingOrder ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {renderVoucherModal()}
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  addressInfo: {
    flex: 1,
  },
  addressRecipient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 8,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  itemImage: {
    width: 60,
    height: 60,
    objectFit: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  voucherIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  voucherInfo: {
    flex: 1,
    marginLeft: 12,
  },
  voucherCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  voucherDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  voucherDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  voucherInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  applyButton: {
    marginLeft: 8,
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  selectVoucherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  selectVoucherText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f8ff',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentOptionInfo: {
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentOptionDesc: {
    fontSize: 12,
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDiscount: {
    fontSize: 14,
    color: '#ff4757',
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  footerSummarySingle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  footerLabel: {
    fontSize: 14,
    color: '#666',
  },
  footerAmountRed: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff4757',
  },
  footerAmountRedLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ff4757',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  voucherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  voucherItemIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  voucherItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  voucherItemCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  voucherItemDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  voucherItemDiscount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
});
