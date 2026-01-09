"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Card, 
  Button, 
  Space, 
  Descriptions, 
  Image,
  Tag,
  Timeline,
  Divider,
  Spin,
  Empty,
  Alert,
  Steps
} from "antd";
import { 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  GiftOutlined,
  TruckOutlined
} from "@ant-design/icons";
import { orderApiService, OrderStatus, PaymentMethod, type OrderResponseDto } from "@/services/OrderApiService";
import { shopService, type Shop } from "@/services/ShopService";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getCloudinaryUrl, DEFAULT_PRODUCT_IMAGE } from "@/config/config";
import { useAntdApp } from "@/hooks/useAntdApp";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { message, modal } = useAntdApp();
  
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);

  useEffect(() => {
    loadShopData();
  }, [user?.id, userProfile?.id]);

  useEffect(() => {
    if (currentShopId && orderId) {
      loadOrderDetail();
    }
  }, [currentShopId, orderId]);

  const loadShopData = async () => {
    try {
      const userId = user?.id || userProfile?.id;
      if (!userId) return;

      const response = await shopService.getShopsByOwner(userId);
      if (response.data && response.data.length > 0) {
        setCurrentShopId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load shop data:', error);
    }
  };

  const loadOrderDetail = async () => {
    setLoading(true);
    try {
      const orderDetail = await orderApiService.getOrderById(orderId);
      
      // Verify this order belongs to current shop by checking shopId at order level
      if (orderDetail.shopId !== currentShopId) {
        message.error('This order does not belong to your shop');
        router.push('/shop-management/orders/pending-orders');
        return;
      }
      
      setOrder(orderDetail);
    } catch (error: any) {
      message.error('Failed to load order details');
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusTag = (status: OrderStatus) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      [OrderStatus.PENDING]: { color: 'orange', text: 'Pending' },
      [OrderStatus.CONFIRMED]: { color: 'blue', text: 'Confirmed' },
      [OrderStatus.PACKED]: { color: 'cyan', text: 'Packed' },
      [OrderStatus.SHIPPING]: { color: 'geekblue', text: 'Shipping' },
      [OrderStatus.DELIVERED]: { color: 'green', text: 'Delivered' },
      [OrderStatus.CANCELLED]: { color: 'red', text: 'Cancelled' },
      [OrderStatus.RETURN_REQUESTED]: { color: 'volcano', text: 'Return Requested' },
      [OrderStatus.RETURNED]: { color: 'magenta', text: 'Returned' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPaymentMethodTag = (method: PaymentMethod) => {
    const methodConfig: Record<string, { color: string; text: string }> = {
      [PaymentMethod.COD]: { color: 'orange', text: 'Cash on Delivery' },
      [PaymentMethod.CREDIT_CARD]: { color: 'blue', text: 'Credit Card' },
      [PaymentMethod.E_WALLET]: { color: 'purple', text: 'E-Wallet' }
    };
    
    const config = methodConfig[method] || { color: 'default', text: method };
    return <Tag color={config.color} icon={<CreditCardOutlined />}>{config.text}</Tag>;
  };

  const handleConfirmOrder = () => {
    modal.confirm({
      title: 'Confirm Order',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to confirm this order? This action cannot be undone.',
      okText: 'Confirm',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        setProcessing(true);
        try {
          await orderApiService.updateOrderStatus({
            orderId: orderId,
            status: OrderStatus.CONFIRMED
          });
          
          message.success('Order confirmed successfully');
          router.push('/shop-management/orders/pending-orders');
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Failed to confirm order';
          message.error(errorMessage);
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleCancelOrder = () => {
    modal.confirm({
      title: 'Cancel Order',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to cancel this order?',
      okText: 'Cancel Order',
      okType: 'danger',
      cancelText: 'Keep Order',
      onOk: async () => {
        setProcessing(true);
        try {
          await orderApiService.updateOrderStatus({
            orderId: orderId,
            status: OrderStatus.CANCELLED
          });
          
          message.success('Order cancelled successfully');
          router.push('/shop-management/orders/cancelled');
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Failed to cancel order';
          message.error(errorMessage);
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Empty description="Order not found" />
        <div className="text-center mt-4">
          <Button type="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isPending = order.status === OrderStatus.PENDING;
  const orderAge = new Date().getTime() - new Date(order.createdAt).getTime();
  const hoursOld = orderAge / (1000 * 60 * 60);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
            className="mb-2"
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600">Order ID: {order.id}</p>
        </div>
        
        {isPending && (
          <Space size="middle">
            <Button 
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={processing}
              onClick={handleConfirmOrder}
            >
              Confirm Order
            </Button>
            <Button 
              danger
              size="large"
              icon={<CloseCircleOutlined />}
              loading={processing}
              onClick={handleCancelOrder}
            >
              Cancel Order
            </Button>
          </Space>
        )}
      </div>

      {/* Urgent Alert for Pending Orders */}
      {isPending && hoursOld > 1 && (
        <Alert
          message="Urgent Order"
          description={`This order has been pending for ${Math.floor(hoursOld)} hours. Please process it as soon as possible.`}
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
        />
      )}

      {/* Order Status Progress */}
      <Card>
        <Steps
          current={
            order.status === OrderStatus.PENDING ? 0 :
            order.status === OrderStatus.CONFIRMED ? 1 :
            order.status === OrderStatus.PACKED ? 2 :
            order.status === OrderStatus.SHIPPING ? 3 :
            order.status === OrderStatus.DELIVERED ? 4 : 0
          }
          status={order.status === OrderStatus.CANCELLED ? 'error' : 'process'}
          items={[
            { title: 'Pending', icon: <ClockCircleOutlined /> },
            { title: 'Confirmed', icon: <CheckCircleOutlined /> },
            { title: 'Packed', icon: <ShoppingOutlined /> },
            { title: 'Shipping', icon: <TruckOutlined /> },
            { title: 'Delivered', icon: <CheckCircleOutlined /> },
          ]}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card title="Order Items" extra={<ShoppingOutlined />}>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <Image
                    src={item.productImage ? getCloudinaryUrl(item.productImage) : DEFAULT_PRODUCT_IMAGE}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                    fallback={DEFAULT_PRODUCT_IMAGE}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                    {item.variant?.name && (
                      <p className="text-sm text-gray-600">Variant: {item.variant.name}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(item.price)} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Divider />

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <Divider className="my-2" />
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-blue-600">{formatCurrency(order.finalAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Vouchers Applied */}
          {order.vouchers && order.vouchers.length > 0 && (
            <Card title="Vouchers Applied" extra={<GiftOutlined />}>
              <div className="space-y-2">
                {order.vouchers.map((voucher, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <div className="font-semibold text-orange-700">{voucher.voucherCode}</div>
                      <div className="text-sm text-gray-600">Discount applied</div>
                    </div>
                    <Tag color="orange">
                      {formatCurrency(voucher.discountAmount)}
                    </Tag>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info Card */}
          <Card title="Order Information">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Status">
                {getStatusTag(order.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {getPaymentMethodTag(order.paymentMethod)}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Customer Info */}
          <Card title="Customer Information" extra={<UserOutlined />}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">
                {order.userName}
              </Descriptions.Item>
              {order.shippingAddress?.phone && (
                <Descriptions.Item label="Phone">
                  {order.shippingAddress.phone}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="User ID">
                <span className="font-mono text-xs">{order.userId}</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card title="Shipping Address" extra={<EnvironmentOutlined />}>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                <p className="text-gray-700">{order.shippingAddress.phone}</p>
                <p className="text-gray-700">
                  {order.shippingAddress.address}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
                {order.shippingAddress.isDefault && (
                  <Tag color="blue" className="mt-2">Default Address</Tag>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
