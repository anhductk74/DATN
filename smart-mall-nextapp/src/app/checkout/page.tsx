"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Radio, Checkbox, Divider, Modal, message, Card } from "antd";
import { 
  LeftOutlined, 
  GiftOutlined, 
  TruckOutlined,
  CreditCardOutlined,
  WalletOutlined,
  BankOutlined,
  SafetyOutlined
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
    id: "card",
    name: "Credit/Debit Card",
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

// Mock vouchers
const availableVouchers = [
  {
    id: "v1",
    title: "New User Discount",
    discount: 50000,
    code: "NEWUSER50",
    minOrder: 200000,
    type: "discount"
  },
  {
    id: "v2",
    title: "Free Shipping",
    discount: 25000,
    code: "FREESHIP",
    minOrder: 100000,
    type: "shipping"
  }
];

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
  const shippingFee = selectedShippingOption?.price || 0;
  const voucherDiscount = selectedVoucherData.reduce((sum, voucher) => sum + voucher.discount, 0);
  const total = subtotal + shippingFee - voucherDiscount;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success("Order placed successfully!");
      // Clear checkout items from sessionStorage
      sessionStorage.removeItem('checkout_items');
      // Remove ordered items from cart
      items.forEach(item => {
        // You could call removeItem here if needed
      });
      router.push("/orders");
    } catch (error) {
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
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-xl font-bold text-gray-800">SmartMall</span>
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

            {/* Products */}
            <Card title="Products Ordered" className="overflow-hidden">
              <div className="space-y-4">
                {items.map((item, index) => (
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
                    {index < items.length - 1 && <Divider />}
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
                  {selectedVoucherData.map(voucher => (
                    <div key={voucher.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center mr-3">
                          <GiftOutlined className="text-white text-sm" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{voucher.title}</div>
                          <div className="text-sm text-gray-600">Code: {voucher.code}</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-medium">
                        -{formatCurrency(voucher.discount)} VND
                      </div>
                    </div>
                  ))}
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
                  <span className="font-medium">{formatCurrency(shippingFee)} VND</span>
                </div>

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
        <div className="space-y-4">
          {availableVouchers.map(voucher => (
            <div 
              key={voucher.id} 
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedVouchers.includes(voucher.id) 
                  ? 'border-orange-300 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-200'
              }`}
              onClick={() => handleVoucherSelect(voucher.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Checkbox 
                    checked={selectedVouchers.includes(voucher.id)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{voucher.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Discount: {formatCurrency(voucher.discount)} VND
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Min order: {formatCurrency(voucher.minOrder)} VND
                    </div>
                  </div>
                </div>
                <div className="text-orange-600 font-bold">
                  {formatCurrency(voucher.discount)} VND
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
