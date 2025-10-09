'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Card, 
  Typography, 
  Button, 
  Steps, 
  Timeline, 
  Divider, 
  Space,
  Avatar,
  Tag,
  message,
  Spin,
  Result,
  Modal,
  Rate,
  Input,
  Upload,
  Form
} from "antd";
import Image from "next/image";
import {
  ArrowLeftOutlined,
  ShopOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  HomeOutlined,
  PlusOutlined,
  StarFilled,
  CameraOutlined
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import useAutoLogout from "@/hooks/useAutoLogout";
import OrderStatusBadge from "../../my-orders/components/OrderStatusBadge";
import type { Order } from "@/types/order";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Mock order detail - replace with actual API call
const mockOrderDetail: Order = {
  id: "ORD001",
  shopName: "Tech Store Premium",
  shopAvatar: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=60&h=60&fit=crop&crop=center",
  items: [
    {
      id: "ITEM001",
      name: "iPhone 15 Pro Max",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=120&h=120&fit=crop&crop=center",
      variant: "256GB, Deep Purple",
      quantity: 1,
      price: 1299.99
    },
    {
      id: "ITEM002", 
      name: "AirPods Pro (2nd gen)",
      image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=120&h=120&fit=crop&crop=center",
      variant: "White",
      quantity: 1,
      price: 249.99
    }
  ],
  status: "shipping",
  totalAmount: 1549.98,
  shippingFee: 0,
  createdAt: "2024-01-15T10:30:00Z",
  estimatedDelivery: "2024-01-20T15:00:00Z",
  trackingNumber: "TN123456789"
};

const trackingEvents = [
  {
    time: "2024-01-15T10:30:00Z",
    status: "Order placed",
    description: "Your order has been placed successfully"
  },
  {
    time: "2024-01-15T14:20:00Z", 
    status: "Order confirmed",
    description: "Seller confirmed your order"
  },
  {
    time: "2024-01-16T09:15:00Z",
    status: "Package prepared",
    description: "Your package is being prepared for shipping"
  },
  {
    time: "2024-01-16T16:45:00Z",
    status: "In transit",
    description: "Package picked up by courier and on the way"
  }
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackForm] = Form.useForm();
  const { session, status } = useAuth();

  const orderId = params.id as string;

  // Auto logout after 30 minutes of inactivity
  useAutoLogout({
    timeout: 30 * 60 * 1000, // 30 minutes
    onLogout: () => {
      router.push("/login");
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const loadOrderDetail = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (orderId === "ORD001") {
          setOrder(mockOrderDetail);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        message.error("Failed to load order details");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && status === "authenticated") {
      loadOrderDetail();
    }
  }, [orderId, status]);

  const getOrderSteps = () => {
    const steps: Array<{title: string, status: "finish" | "error" | "wait" | "process"}> = [
      { title: "Order Placed", status: "finish" },
      { title: "Confirmed", status: order?.status === "pending" ? "wait" : "finish" },
      { title: "Shipping", status: ["shipping", "delivered"].includes(order?.status || "") ? "finish" : "wait" },
      { title: "Delivered", status: order?.status === "delivered" ? "finish" : "wait" }
    ];

    if (order?.status === "cancelled") {
      return [
        { title: "Order Placed", status: "finish" as const },
        { title: "Cancelled", status: "error" as const }
      ];
    }

    return steps;
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOrder(prev => prev ? {
        ...prev,
        status: "cancelled",
        cancelledDate: new Date().toISOString(),
        cancelReason: "Cancelled by customer"
      } : null);
      
      message.success("Order cancelled successfully");
    } catch (error) {
      message.error("Failed to cancel order");
    }
  };

  const handleSubmitFeedback = async (values: any) => {
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success("Feedback submitted successfully!");
      setFeedbackModalOpen(false);
      feedbackForm.resetFields();
    } catch (error) {
      message.error("Failed to submit feedback");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-6">
          <div className="max-w-6xl mx-auto px-4">
            <Result
              status="404"
              title="Order Not Found"
              subTitle="The order you're looking for doesn't exist or has been removed."
              extra={
                <Button 
                  type="primary" 
                  onClick={() => router.push('/my-orders')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 font-semibold text-white shadow-lg"
                >
                  Back to My Orders
              </Button>
              }
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-6">
        <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/my-orders')}
            className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 font-semibold shadow-lg px-6 py-2"
          >
            Back to My Orders
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="mb-0">Order Details</Title>
              <Text type="secondary">Order ID: {order.id}</Text>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Progress */}
            <Card title="Order Progress" className="shadow-sm">
              <div className="relative px-4 py-6">
                {/* Progress Line Background */}
                <div className="absolute top-12 left-16 right-16 h-1 bg-gray-300 rounded-full"></div>
                
                {/* Progress Line Active */}
                <div 
                  className="absolute top-12 left-16 h-1 bg-green-500 rounded-full transition-all duration-500"
                  style={{
                    width: order?.status === "pending" ? "0%" :
                           order?.status === "confirmed" ? "25%" :
                           order?.status === "shipping" ? "50%" :
                           order?.status === "delivered" ? "75%" :
                           order?.status === "reviewed" ? "100%" : 
                           ["shipping", "delivered"].includes(order?.status || "") ? "50%" : "25%"
                  }}
                ></div>

                <div className="flex justify-between items-start relative">
                  {/* Order Placed */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-green-500 bg-white flex items-center justify-center text-green-500 z-10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Order Placed</div>
                    <div className="text-xs text-gray-500">08:27 01-10-2025</div>
                  </div>

                  {/* Confirmed */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      ["confirmed", "shipping", "delivered", "reviewed"].includes(order?.status || "") 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <CheckCircleOutlined className="text-lg" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Confirmed</div>
                    <div className="text-xs text-gray-500">
                      {["confirmed", "shipping", "delivered", "reviewed"].includes(order?.status || "") 
                        ? '08:32 01-10-2025' : ''}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      ["shipping", "delivered", "reviewed"].includes(order?.status || "") 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <TruckOutlined className="text-lg" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Shipping</div>
                    <div className="text-xs text-gray-500">
                      {["shipping", "delivered", "reviewed"].includes(order?.status || "") 
                        ? '08:58 01-10-2025' : ''}
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      ["delivered", "reviewed"].includes(order?.status || "") 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Delivered</div>
                    <div className="text-xs text-gray-500">
                      {["delivered", "reviewed"].includes(order?.status || "") 
                        ? '18:41 06-10-2025' : ''}
                    </div>
                  </div>

                  {/* Review */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      order?.status === "reviewed" 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.05 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.953z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Review</div>
                    <div className="text-xs text-gray-500">
                      {order?.status === "reviewed" ? '' : ''}
                    </div>
                  </div>
                </div>
              </div>
              
              {order.status === "shipping" && order.trackingNumber && (
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TruckOutlined className="text-blue-600" />
                    <Text strong>Tracking Number: {order.trackingNumber}</Text>
                  </div>
                  <Text type="secondary">Your package is on the way!</Text>
                </div>
              )}
            </Card>

            {/* Shop Information */}
            <Card title="Shop Information" className="shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar src={order.shopAvatar} size="large" icon={<ShopOutlined />} />
                  <div>
                    <Text strong className="text-lg">{order.shopName}</Text>
                    <div className="text-sm text-gray-500">Official Store</div>
                  </div>
                </div>
                <Space>
                  <Button 
                    icon={<MessageOutlined />}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 font-semibold shadow-lg px-4 py-2"
                  >
                    Chat
                  </Button>
                  <Button 
                    icon={<HomeOutlined />}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 font-semibold shadow-lg px-4 py-2"
                  >
                    View Shop
                  </Button>
                </Space>
              </div>
            </Card>

            {/* Order Items */}
            <Card title="Order Items" className="shadow-sm">
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center';
                      }}
                      priority={false}
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <Text strong className="text-base">{item.name}</Text>
                      <div className="text-sm text-gray-500 mt-1">{item.variant}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <Text strong className="text-lg text-red-600">
                        ${item.price.toLocaleString()}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Timeline */}
            {order.status === "shipping" && (
              <Card title="Package Tracking" className="shadow-sm">
                <Timeline>
                  {trackingEvents.map((event, index) => (
                    <Timeline.Item
                      key={index}
                      dot={
                        index === trackingEvents.length - 1 ? 
                        <TruckOutlined className="text-blue-600" /> : 
                        <CheckCircleOutlined className="text-green-600" />
                      }
                    >
                      <div className="pb-2">
                        <Text strong>{event.status}</Text>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(event.time).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card title="Order Summary" className="shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({order.items.length} items):</span>
                  <span>${(order.totalAmount + 50).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Voucher Discount:</span>
                  <span>-$50.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span>{order.shippingFee === 0 ? 'Free' : `$${order.shippingFee.toLocaleString()}`}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-red-600">${order.totalAmount.toLocaleString()}</span>
                </div>
                
                {/* Payment Method */}
                <Divider className="my-3" />
                <div className="pt-2">
                  <div className="text-sm font-medium text-gray-900 mb-2">Payment Method</div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Credit Card</div>
                      <div className="text-xs text-gray-500">**** **** **** 1234</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Information */}
            <Card title="Order Information" className="shadow-sm">
              <div className="space-y-3 text-sm">
                <div>
                  <Text type="secondary">Order Date:</Text>
                  <div>{new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
                
                {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
                  <div>
                    <Text type="secondary">Expected Delivery:</Text>
                    <div>{new Date(order.estimatedDelivery).toLocaleDateString('en-US')}</div>
                  </div>
                )}

                {order.deliveredAt && (
                  <div>
                    <Text type="secondary">Delivered Date:</Text>
                    <div className="text-green-600 font-medium">
                      {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}

                {order.cancelledDate && (
                  <div>
                    <Text type="secondary">Cancelled Date:</Text>
                    <div className="text-red-600">
                      {new Date(order.cancelledDate).toLocaleDateString('en-US')}
                    </div>
                    {order.cancelReason && (
                      <div className="text-xs text-gray-500 mt-1">
                        Reason: {order.cancelReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card title="Actions" className="shadow-sm">
              <Space direction="vertical" className="w-full">
                {order.status === "pending" && (
                  <Button 
                    danger 
                    onClick={handleCancelOrder}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3"
                  >
                    Cancel Order
                  </Button>
                )}
                
                {order.status === "delivered" && (
                  <>
                    {/* <Button 
                      type="primary" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3"
                    >
                      Write Review
                    </Button> */}
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3"
                      onClick={() => setFeedbackModalOpen(true)}
                    >
                      💬 Send Feedback
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3">
                      Order Again
                    </Button>
                  </>
                )}

                {order.status === "reviewed" && (
                  <>
                    <Button 
                      type="primary" 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3" 
                      disabled
                    >
                      ✓ Review Completed
                    </Button>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3"
                      onClick={() => setFeedbackModalOpen(true)}
                    >
                      💬 Send Feedback
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3">
                      Order Again
                    </Button>
                  </>
                )}

                {["confirmed", "shipping"].includes(order.status) && (
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3">
                    Contact Seller
                  </Button>
                )}
              </Space>
            </Card>
          </div>
        </div>
        </div>
      </main>
      
      <Footer />

      {/* Feedback Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3 pb-4 border-b">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageOutlined className="text-white text-xl" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Send Feedback</div>
              <div className="text-sm text-gray-500">Help us improve your shopping experience</div>
            </div>
          </div>
        }
        open={feedbackModalOpen}
        onCancel={() => setFeedbackModalOpen(false)}
        footer={null}
        width={600}
        className="feedback-modal"
      >
        <Form
          form={feedbackForm}
          layout="vertical"
          onFinish={handleSubmitFeedback}
          className="mt-6"
        >
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar src={order?.shopAvatar} size="small" icon={<ShopOutlined />} />
              <Text strong className="text-gray-800">{order?.shopName}</Text>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {order?.items.map(item => (
                <div key={item.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop&crop=center';
                    }}
                  />
                  <div className="flex-1">
                    <Text className="text-sm font-medium text-gray-800">{item.name}</Text>
                    <div className="text-xs text-gray-500">{item.variant}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Overall Experience</span>}
            name="rating"
            rules={[{ required: true, message: 'Please rate your experience!' }]}
          >
            <div className="text-center py-4">
              <Rate 
                allowHalf 
                style={{ fontSize: '32px' }}
                character={<StarFilled />}
                onChange={(value) => {
                  const ratingTexts = {
                    0: '',
                    1: 'Terrible',
                    2: 'Dissatisfied', 
                    3: 'Normal',
                    4: 'Satisfied',
                    5: 'Excellent'
                  };
                  const currentRating = Math.ceil(value || 0);
                  const ratingText = ratingTexts[currentRating as keyof typeof ratingTexts] || '';
                  
                  // Update rating text display
                  const ratingTextElement = document.querySelector('.rating-text');
                  if (ratingTextElement) {
                    ratingTextElement.textContent = ratingText;
                    ratingTextElement.className = `rating-text mt-2 text-sm font-medium ${
                      currentRating <= 2 ? 'text-red-500' :
                      currentRating === 3 ? 'text-yellow-500' :
                      'text-green-500'
                    }`;
                  }
                }}
              />
              <div className="rating-text mt-2 text-gray-500 text-sm">Tap to rate your experience</div>
            </div>
          </Form.Item>

          {/* Feedback Categories */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">What would you like to feedback about?</span>}
            name="categories"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'product', label: '📦 Product Quality', color: 'blue' },
                { key: 'delivery', label: '🚚 Delivery Speed', color: 'green' },
                { key: 'packaging', label: '📋 Packaging', color: 'orange' },
                { key: 'service', label: '🤝 Customer Service', color: 'purple' },
                { key: 'price', label: '💰 Price Value', color: 'red' },
                { key: 'website', label: '💻 Website/App', color: 'cyan' }
              ].map(category => (
                <Button
                  key={category.key}
                  className={`h-auto py-3 px-2 text-xs border-gray-300 hover:border-${category.color}-400 hover:text-${category.color}-600 hover:bg-${category.color}-50 rounded-lg transition-all duration-200`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </Form.Item>

          {/* Feedback Text */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Your Feedback</span>}
            name="feedback"
            rules={[{ required: true, message: 'Please share your feedback!' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Tell us about your experience... What did you like? What could be improved?"
              className="resize-none"
            />
          </Form.Item>

          {/* Photo Upload */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Add Photos (Optional)</span>}
            name="photos"
          >
            <Upload
              listType="picture-card"
              maxCount={3}
              beforeUpload={() => false}
            >
              <div className="text-center">
                <CameraOutlined className="text-2xl text-gray-400 mb-2" />
                <div className="text-sm text-gray-500">Add Photo</div>
              </div>
            </Upload>
            <div className="text-xs text-gray-400 mt-2">
              📸 Add up to 3 photos to help us understand your feedback better
            </div>
          </Form.Item>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={() => setFeedbackModalOpen(false)}
              className="flex-1 h-12 text-gray-600 border-gray-300 hover:border-gray-400"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 border-0 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🚀 Submit Feedback
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
