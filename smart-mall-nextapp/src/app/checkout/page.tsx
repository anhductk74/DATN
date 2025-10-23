"use client";

import { voucherApiService, VoucherResponseDto, VoucherType, DiscountType, calculateVoucherDiscount, isVoucherApplicable, filterApplicableVouchers } from '@/services/voucherApiService';
import { orderVoucherApiService } from '@/services/orderVoucherApiService';
import { orderApiService, PaymentMethod } from '@/services/orderApiService';
import { integratedOrderService } from '@/services/integratedOrderService';
import { vnPayService, paymentStatusService } from "@/services";
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAntdApp } from '@/hooks/useAntdApp';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Radio, Checkbox, Divider, Modal, message, Card, Spin } from "antd";
import { 
  LeftOutlined, 
  GiftOutlined, 
  TruckOutlined,
  CreditCardOutlined,
  WalletOutlined,
  BankOutlined,
  SafetyOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { useCart } from "@/contexts/CartContext";
import { DeliveryAddress, type DeliveryAddressType } from "./components";
import { getCloudinaryUrl } from "@/config/config";

const { TextArea } = Input;

// Utility function to format numbers consistently to prevent hydration issues
const formatCurrency = (amount: number): string => {
  if (typeof window === 'undefined') {
    // Server-side: use simple formatting
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  // Client-side: use toLocaleString
  return amount.toLocaleString();
};

// Mock shipping options
const shippingOptions = [
  {
    id: "standard",
    name: "Standard Delivery",
    price: 25000,
    time: "3-5 days",
    description: "Delivered by our shipping partners"
  },
  {
    id: "fast",
    name: "Fast Delivery",
    price: 35000,
    time: "1-2 days", 
    description: "Priority shipping"
  },
  {
    id: "express",
    name: "Express Delivery",
    price: 50000,
    time: "Same day",
    description: "Delivered within 24 hours"
  }
];

// Mock payment methods
const paymentMethods = [
  {
    id: "cod",
    name: "Cash on Delivery",
    icon: <WalletOutlined />,
    description: "Pay when you receive your order"
  },
  {
    id: "vnpay",
    name: "VNPay",
    icon: <CreditCardOutlined />,
    description: "Pay securely with VNPay gateway"
  },
  {
    id: "card",
    name: "Credit Card",
    icon: <CreditCardOutlined />,
    description: "Visa, Mastercard, JCB"
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: <BankOutlined />,
    description: "Transfer via online banking"
  },
  {
    id: "wallet",
    name: "E-Wallet",
    icon: <SafetyOutlined />,
    description: "MoMo, ZaloPay, ShopeePay"
  }
];

// We'll fetch vouchers from the API instead of using mock data

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart, removeItem } = useCart();
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { message } = useAntdApp();
  const [items, setItems] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Voucher states
  const [availableVouchers, setAvailableVouchers] = useState<VoucherResponseDto[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  
  // Delivery address states - let DeliveryAddress component manage its own state
  const [addresses, setAddresses] = useState<DeliveryAddressType[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    // Get selected items from sessionStorage
    try {
      const checkoutItems = sessionStorage.getItem('checkout_items');
      if (checkoutItems) {
        setItems(JSON.parse(checkoutItems));
      }
    } catch (error) {
      console.error('Failed to parse checkout items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch available vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
      setVouchersLoading(true);
      try {
        const vouchers = await voucherApiService.getAllVouchers();
        // Calculate subtotal for filtering
        const currentSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Filter vouchers applicable to the current checkout items
        const applicableVouchers = filterApplicableVouchers(vouchers, currentSubtotal, items);
        setAvailableVouchers(applicableVouchers);
      } catch (error) {
        console.error('Failed to fetch vouchers:', error);
        message.error('Failed to load vouchers');
      } finally {
        setVouchersLoading(false);
      }
    };

    if (mounted && items.length > 0) {
      fetchVouchers();
    }
  }, [mounted, items]);

  // Redirect if no items selected for checkout
  useEffect(() => {
    if (mounted && !isLoading && items.length === 0) {
      message.warning("No items selected for checkout!");
      router.push("/cart");
    }
  }, [mounted, isLoading, items.length, router]);

  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const selectedVoucherData = availableVouchers.filter(voucher => selectedVouchers.includes(voucher.id));
  
  // Calculate totals - only calculate when items are loaded to prevent hydration mismatch
  const subtotal = mounted && items.length > 0 ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  let shippingFee = selectedShippingOption?.price || 0;
  
  // Calculate voucher discounts
  let voucherDiscount = 0;
  let shippingDiscount = 0;
  
  if (selectedVoucherData.length > 0 && subtotal > 0) {
    selectedVoucherData.forEach(voucher => {
      if (isVoucherApplicable(voucher, subtotal, items)) {
        const discount = calculateVoucherDiscount(voucher, subtotal);
        if (voucher.type === VoucherType.SHIPPING) {
          // Shipping vouchers reduce shipping fee
          shippingDiscount += Math.min(discount, shippingFee);
        } else {
          // Product/system vouchers reduce subtotal
          voucherDiscount += discount;
        }
      }
    });
  }
  
  // Apply shipping discount to shipping fee
  const finalShippingFee = Math.max(0, shippingFee - shippingDiscount);
  const total = Math.max(0, subtotal + finalShippingFee - voucherDiscount);

  const handlePlaceOrder = async () => {
    // Validate required fields
    if (!selectedAddressId) {
      message.error("Please select a delivery address");
      return;
    }

    if (items.length === 0) {
      message.error("No items in your order");
      return;
    }

    // Get current user ID
    const currentUserId = userProfile?.id || user?.id;
    if (!currentUserId) {
      message.error("Please login to place order");
      return;
    }

    setLoading(true);
    try {
      // Log data for debugging
      console.log('Items data:', items);
      console.log('User data:', { userProfile, user, currentUserId });
      
      // Check if items have real shopId
      items.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          title: item.title,
          shopId: item.shopId,
          shopName: item.shopName,
          variantId: item.variantId,
          cartItemId: item.cartItemId
        });
      });

      // Group items by shopId to create separate orders for each shop
      const itemsByShop = items.reduce((groups: { [shopId: string]: typeof items }, item) => {
        const shopId = item.shopId || "unknown-shop";
        if (!groups[shopId]) {
          groups[shopId] = [];
        }
        groups[shopId].push(item);
        return groups;
      }, {});

      console.log('Items grouped by shop:', itemsByShop);

      // Create orders for each shop
      const orderResults = [];
      let allOrdersSucceeded = true;
      let failedShops: string[] = [];

      for (const [shopId, shopItems] of Object.entries(itemsByShop)) {
        // Calculate shipping fee per shop (for now, use the selected shipping for each)
        const shopShippingFee = Math.round(finalShippingFee / Object.keys(itemsByShop).length);
        
        // Filter vouchers applicable to this shop
        const applicableVouchers = selectedVouchers.filter(voucherId => {
          const voucher = availableVouchers.find(v => v.id === voucherId);
          return !voucher?.shopId || voucher.shopId === shopId;
        });

        // Use shopId directly from cart items (should be real shopId from product API now)
        const actualShopId = shopId;
        
        console.log('Processing shop for order:', {
          originalShopId: shopId,
          isRealShopId: !shopId.startsWith('shop-') && shopId !== 'unknown-shop',
          shopName: shopItems[0]?.shopName,
          itemCount: shopItems.length
        });

        // Map UI payment method to backend PaymentMethod enum
        const paymentMethodMapping: { [key: string]: string } = {
          'cod': 'COD',
          'vnpay': 'CREDIT_CARD', // VNPay will be processed as CREDIT_CARD in backend
          'card': 'CREDIT_CARD', 
          'bank': 'CREDIT_CARD', // Map bank to CREDIT_CARD
          'wallet': 'E_WALLET'
        };
        const finalPaymentMethod = paymentMethodMapping[selectedPayment.toLowerCase()] || 'COD';

        const orderData = {
          userId: currentUserId,
          shopId: actualShopId,
          shippingAddressId: selectedAddressId,
          paymentMethod: finalPaymentMethod as PaymentMethod,
          shippingFee: shopShippingFee,
          items: shopItems.map(item => ({
            variantId: item.variantId || item.id, // Use variantId or fallback to item.id
            quantity: item.quantity
          })),
          voucherIds: applicableVouchers
        };

        // Validate required fields
        if (!currentUserId || !actualShopId || !selectedAddressId) {
          console.error('Missing required fields:', { 
            userId: currentUserId, 
            shopId: actualShopId, 
            shippingAddressId: selectedAddressId 
          });
          orderResults.push({ 
            shopId, 
            success: false, 
            errors: ['Missing required fields: userId, shopId, or shippingAddressId'] 
          });
          allOrdersSucceeded = false;
          failedShops.push(shopItems[0]?.shopName || shopId);
          continue;
        }

        // Validate items have valid variantIds
        const hasInvalidVariants = shopItems.some(item => !item.variantId && !item.id);
        if (hasInvalidVariants) {
          console.error('Some items missing variantId:', shopItems);
          orderResults.push({ 
            shopId, 
            success: false, 
            errors: ['Some items are missing variant IDs'] 
          });
          allOrdersSucceeded = false;
          failedShops.push(shopItems[0]?.shopName || shopId);
          continue;
        }

        console.log(`Creating order for shop ${shopId}:`);
        console.log('Order data:', JSON.stringify(orderData, null, 2));
        console.log('Shop items:', shopItems);

        try {
          // Create order using integratedOrderService
          const result = await integratedOrderService.createCompleteOrder(orderData);

          if (result.success && result.order) {
            orderResults.push({ shopId, success: true, order: result.order });
            console.log(`Order created successfully for shop ${shopId}:`, result.order.id);
          } else {
            orderResults.push({ shopId, success: false, errors: result.errors });
            allOrdersSucceeded = false;
            failedShops.push(shopItems[0]?.shopName || shopId);
            console.error(`Order creation failed for shop ${shopId}:`, result.errors);
          }
        } catch (error) {
          orderResults.push({ shopId, success: false, error });
          allOrdersSucceeded = false;
          failedShops.push(shopItems[0]?.shopName || shopId);
          console.error(`Error creating order for shop ${shopId}:`, error);
        }
      }

      if (allOrdersSucceeded) {
        // Handle different payment methods
        if (selectedPayment === 'vnpay') {
          // For VNPay, redirect to payment gateway
          const paymentSuccess = await handleVnPayPayment(orderResults);
          if (paymentSuccess) {
            // Clear checkout items from sessionStorage before redirect
            sessionStorage.removeItem('checkout_items');
            
            // Remove only the ordered items from cart (not clear all)
            try {
              for (const item of items) {
                if (item.cartItemId) {
                  await removeItem(item.cartItemId);
                }
              }
            } catch (error) {
              console.warn('Failed to remove some items from cart:', error);
            }
            // VNPay will handle redirect after payment completion
            return;
          }
        } else {
          // For other payment methods (COD, etc.)
          message.success(`${orderResults.length} order(s) placed successfully!`);
          
          // Clear checkout items from sessionStorage
          sessionStorage.removeItem('checkout_items');
          
          // Remove only the ordered items from cart (not clear all)
          try {
            for (const item of items) {
              if (item.cartItemId) {
                await removeItem(item.cartItemId);
              }
            }
          } catch (error) {
            console.warn('Failed to remove some items from cart:', error);
          }
          
          // Navigate to orders page
          router.push("/my-orders");
        }
      } else {
        const successCount = orderResults.filter(r => r.success).length;
        if (successCount > 0) {
          message.warning(`${successCount} order(s) succeeded, but failed to create orders for: ${failedShops.join(', ')}`);
        } else {
          message.error(`Failed to place orders for all shops: ${failedShops.join(', ')}`);
        }
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      message.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherSelect = (voucherId: string) => {
    if (selectedVouchers.includes(voucherId)) {
      setSelectedVouchers(prev => prev.filter(id => id !== voucherId));
    } else {
      setSelectedVouchers(prev => [...prev, voucherId]);
    }
  };

  // Handle VNPay payment
  const handleVnPayPayment = async (orderResults: any[]) => {
    const currentUserId = userProfile?.id || user?.id;
    if (!currentUserId) {
      message.error("Please login to make payment");
      return false;
    }

    try {
      // Get the first successful order for payment (assuming single payment for all orders)
      const successfulOrder = orderResults.find(result => result.success && result.order);
      if (!successfulOrder) {
        message.error("No valid order found for payment");
        return false;
      }

      const orderId = successfulOrder.order.id;
      
      // Lưu thông tin đơn hàng vào sessionStorage để theo dõi trạng thái
      const paymentInfo = {
        orderIds: orderResults.filter(r => r.success).map(r => r.order.id),
        totalAmount: total,
        timestamp: Date.now(),
        paymentMethod: 'vnpay'
      };
      paymentStatusService.savePendingPayment(paymentInfo);

      // Create payment URL with VNPay - format orderInfo theo yêu cầu
      const orderInfo = `OrderId:${orderId}|Thanh toan don hang #${orderId}`;
      const paymentUrl = await vnPayService.createPaymentUrl({
        amount: total, // Use total checkout amount
        orderInfo: orderInfo,
        userId: currentUserId,
        orderId: orderId // Truyền orderId trực tiếp để backend liên kết
      });

      // Redirect to VNPay payment page
      window.location.href = paymentUrl;
      return true;
    } catch (error) {
      console.error('VNPay payment failed:', error);
      message.error("Failed to initialize VNPay payment. Please try again.");
      return false;
    }
  };

  // Delivery address handlers
  const handleAddressesChange = (newAddresses: DeliveryAddressType[]) => {
    setAddresses(newAddresses);
  };

  const handleSelectedAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  // Show loading state during initial mount to prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show loading if no items after mount to prevent flash
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button 
              type="text" 
              icon={<LeftOutlined />} 
              onClick={() => router.push("/cart")}
              className="mr-4"
            />
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors"
                onClick={() => router.push("/")}
              >
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span 
                className="text-xl font-bold text-gray-800 cursor-pointer hover:text-orange-500 transition-colors"
                onClick={() => router.push("/")}
              >
                SmartMall
              </span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-lg text-gray-600">Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <DeliveryAddress
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onAddressesChange={handleAddressesChange}
              onSelectedAddressChange={handleSelectedAddressChange}
            />

            {/* Products grouped by Shop */}
            <Card title="Products Ordered" className="overflow-hidden">
              <div className="space-y-6">
                {Object.entries(items.reduce((groups: { [shopId: string]: typeof items }, item) => {
                  const shopId = item.shopId || "unknown-shop";
                  if (!groups[shopId]) {
                    groups[shopId] = [];
                  }
                  groups[shopId].push(item);
                  return groups;
                }, {})).map(([shopId, shopItems]) => (
                  <div key={shopId} className="border rounded-lg p-4 bg-gray-50">
                    {/* Shop Header */}
                    <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs">S</span>
                        </div>
                        <span className="font-medium text-gray-800">
                          {shopItems[0]?.shopName || `Shop ${shopId}`}
                        </span>
                        <span className="text-xs text-gray-500">({shopItems.length} items)</span>
                      </div>
                    </div>
                    
                    {/* Shop Products */}
                    <div className="space-y-4">
                      {shopItems.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={getCloudinaryUrl(item.image)} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                                {item.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">{item.variant}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-400 line-through">
                                    {(item as any).originalPrice ? formatCurrency((item as any).originalPrice) : ''} VND
                                  </span>
                                  <span className="text-sm font-medium text-orange-600">
                                    {formatCurrency(item.price)} VND
                                  </span>
                                </div>
                                <span className="text-sm text-gray-600">x{item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-800">
                                {formatCurrency(item.price * item.quantity)} VND
                              </div>
                            </div>
                          </div>
                          {index < shopItems.length - 1 && <Divider />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Vouchers */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <GiftOutlined className="text-orange-500 text-lg mr-2" />
                  <span className="text-lg font-medium">Vouchers</span>
                </div>
                <Button 
                  type="link"
                  onClick={() => setVoucherModalVisible(true)}
                  className="text-blue-500"
                >
                  Select Voucher
                </Button>
              </div>
              {selectedVoucherData.length > 0 ? (
                <div className="space-y-3">
                  {selectedVoucherData.map(voucher => {
                    const discount = isVoucherApplicable(voucher, subtotal, items) 
                      ? calculateVoucherDiscount(voucher, subtotal) 
                      : 0;
                    return (
                      <div key={voucher.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center mr-3">
                            <GiftOutlined className="text-white text-sm" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{voucher.description}</div>
                            <div className="text-sm text-gray-600">Code: {voucher.code}</div>
                            <div className="text-xs text-gray-500">
                              {voucher.type === VoucherType.SHIPPING ? 'Shipping' : 
                               voucher.type === VoucherType.SYSTEM ? 'System' : 'Shop'} voucher
                            </div>
                          </div>
                        </div>
                        <div className="text-green-600 font-medium">
                          -{formatCurrency(discount)} VND
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GiftOutlined className="text-4xl mb-2" />
                  <p>No vouchers selected</p>
                </div>
              )}
            </Card>

            {/* Shipping Options */}
            <Card title="Shipping Options" className="overflow-hidden">
              <Radio.Group 
                value={selectedShipping} 
                onChange={(e) => setSelectedShipping(e.target.value)}
                className="w-full"
              >
                <div className="space-y-3">
                  {shippingOptions.map(option => (
                    <Radio key={option.id} value={option.id} className="w-full">
                      <div className="flex items-center justify-between w-full pr-6">
                        <div className="flex items-center">
                          <TruckOutlined className="text-orange-500 mr-2" />
                          <div>
                            <div className="font-medium">{option.name}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                            <div className="text-xs text-gray-400">{option.time}</div>
                          </div>
                        </div>
                        <div className="text-orange-600 font-medium">
                          {formatCurrency(option.price)} VND
                        </div>
                      </div>
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </Card>

            {/* Payment Methods */}
            <Card title="Payment Method" className="overflow-hidden">
              <Radio.Group 
                value={selectedPayment} 
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="w-full"
              >
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <Radio key={method.id} value={method.id} className="w-full">
                      <div className="flex items-center w-full pr-6">
                        <div className="text-orange-500 text-lg mr-3">
                          {method.icon}
                        </div>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-500">{method.description}</div>
                        </div>
                      </div>
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </Card>

            {/* Order Notes */}
            <Card title="Order Notes" className="overflow-hidden">
              <TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Note to seller (optional)"
                rows={3}
                maxLength={500}
                showCount
              />
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card title="Order Summary" className="sticky top-24">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({mounted ? items.length : 0} items)</span>
                  <span className="font-medium">{formatCurrency(subtotal)} VND</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping fee</span>
                  <span className="font-medium">{formatCurrency(finalShippingFee)} VND</span>
                </div>

                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Shipping discount</span>
                    <span>-{formatCurrency(shippingDiscount)} VND</span>
                  </div>
                )}

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher discount</span>
                    <span>-{formatCurrency(voucherDiscount)} VND</span>
                  </div>
                )}

                <Divider className="my-4" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">{formatCurrency(total)} VND</span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600 border-orange-500 h-12 text-lg font-medium"
                  onClick={handlePlaceOrder}
                  loading={loading}
                >
                  Place Order
                </Button>

                <div className="text-xs text-gray-500 text-center mt-3">
                  By clicking "Place Order", you agree to SmartMall's Terms of Service
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      <Modal
        title="Select Vouchers"
        open={voucherModalVisible}
        onCancel={() => setVoucherModalVisible(false)}
        footer={
          <Button 
            type="primary" 
            onClick={() => setVoucherModalVisible(false)}
            className="bg-orange-500 hover:bg-orange-600 border-orange-500"
          >
            Apply Selected Vouchers
          </Button>
        }
        width={600}
      >
        {vouchersLoading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <p className="mt-4 text-gray-500">Loading vouchers...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableVouchers.map(voucher => {
              const isApplicable = isVoucherApplicable(voucher, subtotal, items);
              const discount = isApplicable ? calculateVoucherDiscount(voucher, subtotal) : 0;
              const discountText = voucher.discountType === 'PERCENTAGE' 
                ? `${voucher.discountValue}% off${voucher.maxDiscountAmount ? ` (max ${formatCurrency(voucher.maxDiscountAmount)} VND)` : ''}`
                : `${formatCurrency(voucher.discountValue)} VND off`;

              return (
                <div 
                  key={voucher.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    !isApplicable 
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : selectedVouchers.includes(voucher.id) 
                        ? 'border-orange-300 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-200'
                  }`}
                  onClick={() => isApplicable && handleVoucherSelect(voucher.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <Checkbox 
                        checked={selectedVouchers.includes(voucher.id)}
                        disabled={!isApplicable}
                        className="mr-3 mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-800 mb-1">
                          {voucher.description}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          Code: {voucher.code}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {discountText}
                        </div>
                        {voucher.minOrderValue && (
                          <div className="text-xs text-gray-500 mb-1">
                            Min order: {formatCurrency(voucher.minOrderValue)} VND
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Type: {voucher.type === VoucherType.SHIPPING ? 'Free Shipping' : 
                                voucher.type === VoucherType.SYSTEM ? 'System Discount' : 'Shop Discount'}
                        </div>
                        {!isApplicable && (
                          <div className="text-xs text-red-500 mt-1">
                            {voucher.minOrderValue && subtotal < voucher.minOrderValue
                              ? `Min order ${formatCurrency(voucher.minOrderValue)} VND required`
                              : 'Not applicable to current order'
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-orange-600 font-bold">
                      {isApplicable ? `-${formatCurrency(discount)} VND` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
            {availableVouchers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <GiftOutlined className="text-4xl mb-2" />
                <p>No vouchers available at the moment</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
