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
import { orderService, addressApiService, orderTrackingApiService } from "@/services";

// Define Order interface for this page
interface OrderItem {
  id: string;
  name: string;
  image: string;
  variant: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber?: string;
  shopName: string;
  shopAvatar: string;
  items: OrderItem[];
  status: "PENDING" | "PAID" | "SHIPPING" | "DELIVERED" | "CONFIRMED" | "CANCELLED" | "RETURN_REQUESTED" | "RETURNED";
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  finalAmount?: number;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippingAddress?: any;
  paymentMethod?: string;
  deliveredAt?: string;
  cancelledDate?: string;
  cancelReason?: string;
  addressId?: string;
  vouchers?: any[];
}
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getCloudinaryUrl } from "@/config/config";
import productService from "@/services/productService";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Helper function to enrich shop data from product API (same as in CartContext)
const enrichShopDataFromProducts = async (apiOrder: any): Promise<any> => {
  if (!apiOrder.items || !Array.isArray(apiOrder.items) || apiOrder.items.length === 0) {
    console.log('No items to enrich shop data from');
    return apiOrder;
  }

  try {
    // Get the first item to fetch shop info
    const firstItem = apiOrder.items[0];
    
    // Try different ways to get product ID
    let productId = null;
    if (firstItem.variant?.product?.id) {
      productId = firstItem.variant.product.id;
    } else if (firstItem.productId) {
      productId = firstItem.productId;
    }
    
    if (productId) {
      console.log('Fetching shop data from product:', productId);
      
      const product = await productService.getProductById(productId);
      
      if (product?.shop) {
        console.log('Found shop data from product API:', {
          shopId: product.shop.id,
          shopName: product.shop.name,
          shopAvatar: product.shop.avatar
        });
        
        // Enrich the order with real shop data
        return {
          ...apiOrder,
          shopName: product.shop.name,
          shopAvatar: product.shop.avatar
        };
      }
    }
  } catch (error) {
    console.warn('Failed to fetch shop data from product API:', error);
  }
  
  console.log('Using original shop data:', {
    shopName: apiOrder.shopName,
    shopAvatar: apiOrder.shopAvatar
  });
  return apiOrder;
};

// Helper function to format VND currency
const formatVND = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

// Safe date formatting to prevent hydration mismatch
const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}) => {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder or basic format
    return new Date(dateString).toISOString().split('T')[0];
  }
  // Client-side: use full formatting
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatDateTime = (dateString: string) => {
  if (typeof window === 'undefined') {
    return new Date(dateString).toISOString().split('T')[0];
  }
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Transform API order to local format
const transformApiOrderToLocal = (apiOrder: any): Order => {
  // Default images to prevent empty string src errors
  const defaultShopAvatar = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=40&fit=crop&crop=center";
  const defaultProductImage = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=center";
  
  // Helper function to get proper image URL
  const getImageUrl = (imagePath: string | null | undefined, fallback: string): string => {
    if (!imagePath || imagePath.trim() === '') return fallback;
    
    // If it's already a full URL (starts with http), return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it's a Cloudinary path, convert to full URL
    if (imagePath.startsWith('/')) {
      return getCloudinaryUrl(imagePath);
    }
    
    // Otherwise use fallback
    return fallback;
  };

  // Format address from shippingAddress object
  const address = apiOrder.shippingAddress 
    ? `${apiOrder.shippingAddress.addressLine}, ${apiOrder.shippingAddress.ward}, ${apiOrder.shippingAddress.district}, ${apiOrder.shippingAddress.city}`
    : "";



  // Calculate subtotal from items
  const itemsSubtotal = apiOrder.items?.reduce((sum: number, item: any) => sum + (item.subtotal || item.price * item.quantity), 0) || 0;
  
  // Calculate discount (difference between items subtotal and total amount)
  const discountAmount = Math.max(0, itemsSubtotal + (apiOrder.shippingFee || 0) - apiOrder.totalAmount);



  return {
    id: apiOrder.id.toString(),
    orderNumber: apiOrder.orderNumber || apiOrder.id.toString(),
    shopName: apiOrder.shopName || "Smart Mall",
    shopAvatar: getImageUrl(apiOrder.shopAvatar, defaultShopAvatar),
    items: apiOrder.items?.map((item: any) => {
      const rawImageUrl = item.productImage || item.variant?.product?.imageUrl || "";
      
      
      return {
        id: item.id.toString(),
        name: item.productName || item.variant?.product?.name || "Unknown Product",
        image: getImageUrl(rawImageUrl, defaultProductImage),
        variant: item.variant?.attributes?.map((attr: any) => `${attr.name}: ${attr.value}`).join(', ') || "",
        quantity: item.quantity,
        price: item.price
      };
    }) || [],
    status: apiOrder.status || "PENDING",
    totalAmount: apiOrder.totalAmount || 0,
    shippingFee: apiOrder.shippingFee || 0, // Use actual shipping fee from API
    discountAmount: discountAmount > 0 ? discountAmount : undefined, // Only set if there's a discount
    finalAmount: apiOrder.totalAmount, // Final amount is the totalAmount from API
    createdAt: apiOrder.createdAt || new Date().toISOString(),
    estimatedDelivery: apiOrder.estimatedDelivery,
    trackingNumber: apiOrder.trackingNumber || apiOrder.orderNumber,
    shippingAddress: apiOrder.shippingAddress,
    paymentMethod: apiOrder.paymentMethod || 'COD',
    deliveredAt: apiOrder.deliveredAt,
    cancelledDate: apiOrder.cancelledAt,
    cancelReason: apiOrder.cancelReason,
    addressId: apiOrder.addressId,
    vouchers: apiOrder.vouchers
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [trackingLogs, setTrackingLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackForm] = Form.useForm();
  const [isClient, setIsClient] = useState(false);
  const { session, status, user } = useAuth();
  const { userProfile } = useUserProfile();

  const orderId = params.id as string;

  // Fix hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

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
        console.log('Loading order detail for ID:', orderId);
        
        let apiOrder;
        
        // Always use user context method for consistency with my-orders
        const currentUserId = userProfile?.id || user?.id;
        if (!currentUserId) {
          throw new Error('User ID not available for order lookup');
        }
        
        try {
          // Use same data source as my-orders for consistency
          apiOrder = await orderService.getOrderWithUserContext(orderId, currentUserId);
          
        } catch (userContextError: any) {
          console.warn('User context method failed, trying direct:', userContextError);
          
          // Fallback to direct order endpoint only if user context fails
          apiOrder = await orderService.getOrder(orderId);
          console.log('API Order response (direct fallback):', apiOrder);
        }
        
        // Enrich shop data from product API if shopAvatar is missing
        if (!apiOrder.shopAvatar || apiOrder.shopAvatar.trim() === '') {
          console.log('Shop avatar missing, trying to enrich from product API...');
          apiOrder = await enrichShopDataFromProducts(apiOrder);
        }
        
        const transformedOrder = transformApiOrderToLocal(apiOrder);
       
        setOrder(transformedOrder);

        // Fetch shipping address if addressId exists
        if (apiOrder.addressId) {
          try {
          
            const addressResponse = await addressApiService.getAddressById(apiOrder.addressId);
           
            
            // Handle different response formats
            let addressData;
            if (addressResponse && typeof addressResponse === 'object') {
              // If response has 'data' property (wrapped response)
              addressData = (addressResponse as any).data || addressResponse;
            } else {
              addressData = addressResponse;
            }
            
            
            setShippingAddress(addressData);
          } catch (error) {
            console.error('Failed to fetch shipping address:', error);
            // Don't fail the whole order fetch if address fails
          }
        }

        // Fetch tracking logs if order is in shipping status
        if (['SHIPPING', 'DELIVERED'].includes(apiOrder.status)) {
          try {
            console.log('Fetching tracking logs for order:', orderId);
            const trackingResponse = await orderTrackingApiService.getTrackingLogs(orderId);
            console.log('Tracking logs response:', trackingResponse);
            setTrackingLogs(trackingResponse);
          } catch (error) {
            console.error('Failed to fetch tracking logs:', error);
            // Don't fail if tracking logs fetch fails
          }
        }

      } catch (error: any) {
        console.error("Failed to load order:", error);
        console.error("Error details:", {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data
        });
        message.error(error?.response?.data?.message || "Không thể tải chi tiết đơn hàng");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && status === "authenticated") {
      loadOrderDetail();
    }
  }, [orderId, status, userProfile, user]);

  const getOrderSteps = () => {
    const steps: Array<{title: string, status: "finish" | "error" | "wait" | "process"}> = [
      { title: "Order Placed", status: "finish" },
      { title: "Confirmed", status: order?.status === "PENDING" ? "wait" : "finish" },
      { title: "Shipping", status: ["SHIPPING", "DELIVERED"].includes(order?.status || "") ? "finish" : "wait" },
      { title: "Delivered", status: order?.status === "DELIVERED" ? "finish" : "wait" }
    ];

    if (order?.status === "CANCELLED") {
      return [
        { title: "Order Placed", status: "finish" as const },
        { title: "Cancelled", status: "error" as const }
      ];
    }

    if (["RETURN_REQUESTED", "RETURNED"].includes(order?.status || "")) {
      return [
        { title: "Order Placed", status: "finish" as const },
        { title: "Delivered", status: "finish" as const },
        { title: order?.status === "RETURN_REQUESTED" ? "Return Requested" : "Returned", status: "error" as const }
      ];
    }

    return steps;
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    Modal.confirm({
      title: "Hủy đơn hàng",
      content: "Bạn có chắc chắn muốn hủy đơn hàng này?",
      okText: "Hủy đơn hàng",
      cancelText: "Không",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await orderService.cancelOrder(order.id);
          
          // Reload order details
          const apiOrder = await orderService.getOrder(order.id);
          const transformedOrder = transformApiOrderToLocal(apiOrder);
          setOrder(transformedOrder);
          
          message.success("Đã hủy đơn hàng thành công");
        } catch (error: any) {
          console.error("Failed to cancel order:", error);
          message.error(error?.response?.data?.message || "Không thể hủy đơn hàng");
        }
      }
    });
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

  // Debug log for shipping address state
 

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
                    width: order?.status === "PENDING" ? "0%" :
                           ["CONFIRMED", "PAID"].includes(order?.status || "") ? "25%" :
                           order?.status === "SHIPPING" ? "50%" :
                           order?.status === "DELIVERED" ? "75%" :
                           ["SHIPPING", "DELIVERED"].includes(order?.status || "") ? "50%" : "25%"
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
                      ["CONFIRMED", "PAID", "SHIPPING", "DELIVERED"].includes(order?.status || "") 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <CheckCircleOutlined className="text-lg" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Confirmed</div>
                    <div className="text-xs text-gray-500">
                      {["CONFIRMED", "PAID", "SHIPPING", "DELIVERED"].includes(order?.status || "") 
                        ? '08:32 01-10-2025' : ''}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      ["SHIPPING", "DELIVERED"].includes(order?.status || "") 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <TruckOutlined className="text-lg" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Shipping</div>
                    <div className="text-xs text-gray-500">
                      {["SHIPPING", "DELIVERED"].includes(order?.status || "") 
                        ? '08:58 01-10-2025' : ''}
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      ["DELIVERED"].includes(order?.status || "") 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Delivered</div>
                    <div className="text-xs text-gray-500">
                      {["DELIVERED"].includes(order?.status || "") 
                        ? '18:41 06-10-2025' : ''}
                    </div>
                  </div>

                  {/* Review */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 border-gray-300 text-gray-400`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.05 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.953z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Review</div>
                    <div className="text-xs text-gray-500"></div>
                  </div>
                </div>
              </div>
              
              {order.status === "SHIPPING" && order.trackingNumber && (
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
                  <Avatar 
                    src={order.shopAvatar && order.shopAvatar.trim() !== '' ? order.shopAvatar : null} 
                    size="large" 
                    icon={<ShopOutlined />} 
                  />
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
                      src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center'}
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
                        ₫{formatVND(item.price)}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Package Tracking Timeline */}
            {order.trackingNumber && (
              <Card title="Package Tracking" className="shadow-sm">
                <div className="space-y-4">
                  {/* Tracking Number */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <TruckOutlined className="text-blue-600" />
                    <div>
                      <Text strong>Tracking Number: {order.trackingNumber}</Text>
                      {order.estimatedDelivery && (
                        <div className="text-sm text-gray-600">
                          Expected delivery: {isClient ? new Date(order.estimatedDelivery).toLocaleString('en-US') : 'Loading...'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  {trackingLogs.length > 0 ? (
                    <div className="space-y-3">
                      <div className="font-medium text-gray-700">Tracking History:</div>
                      <Timeline
                        items={trackingLogs.map((log, index) => ({
                          color: index === 0 ? 'green' : 'blue',
                          children: (
                            <div className="space-y-1">
                              <div className="font-medium">{log.statusDescription}</div>
                              <div className="text-sm text-gray-600">{log.currentLocation}</div>
                              <div className="text-xs text-gray-500">
                                {isClient ? new Date(log.updatedAt).toLocaleString('en-US') : 'Loading...'}
                              </div>
                              <div className="text-xs text-gray-400">Carrier: {log.carrier}</div>
                            </div>
                          )
                        }))}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <TruckOutlined className="text-2xl mb-2" />
                      <div>Tracking information will be updated once package is shipped</div>
                    </div>
                  )}
                </div>
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
                  <span>₫{formatVND(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span>{(order.shippingFee || 0) === 0 ? 'Free' : `₫${formatVND(order.shippingFee || 0)}`}</span>
                </div>
                {/* Show discount if available */}
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher Discount:</span>
                    <span>-₫{formatVND(order.discountAmount)}</span>
                  </div>
                )}
                <Divider className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-red-600">₫{formatVND(order.finalAmount || order.totalAmount)}</span>
                </div>
                
                {/* Payment Method */}
                <Divider className="my-3" />
                <div className="pt-2">
                  <div className="text-sm font-medium text-gray-900 mb-2">Payment Method</div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const paymentMethod = order.paymentMethod || 'COD';
                      
                      // Define payment method configurations
                      const paymentConfigs = {
                        'COD': {
                          icon: (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          ),
                          bgColor: 'bg-green-600',
                          label: 'Cash on Delivery',
                          subtitle: 'Pay when you receive'
                        },
                        'CREDIT_CARD': {
                          icon: (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          ),
                          bgColor: 'bg-blue-600',
                          label: 'Credit Card',
                          subtitle: '**** **** **** 1234'
                        },
                        'E_WALLET': {
                          icon: (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                            </svg>
                          ),
                          bgColor: 'bg-purple-600',
                          label: 'E-Wallet',
                          subtitle: 'Digital payment'
                        }
                      };
                      
                      const config = paymentConfigs[paymentMethod as keyof typeof paymentConfigs] || paymentConfigs['COD'];
                      
                      return (
                        <>
                          <div className={`w-8 h-8 ${config.bgColor} rounded flex items-center justify-center`}>
                            {config.icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{config.label}</div>
                            <div className="text-xs text-gray-500">{config.subtitle}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Information */}
            <Card title="Order Information" className="shadow-sm">
              <div className="space-y-3 text-sm">
                <div>
                  <Text type="secondary">Order Date:</Text>
                  <div>{isClient ? formatDateTime(order.createdAt) : 'Loading...'}</div>
                </div>
                
                {/* Shipping Address */}
                {shippingAddress ? (
                  <div>
                    <Text type="secondary">Shipping Address:</Text>
                    <div className="mt-1">
                      <div className="font-medium">{shippingAddress.recipient || 'N/A'}</div>
                      <div>{shippingAddress.phoneNumber || 'N/A'}</div>
                      <div className="text-gray-600">
                        {shippingAddress.fullAddress || 
                         `${shippingAddress.street || ''}${shippingAddress.commune ? `, ${shippingAddress.commune}` : ''}${shippingAddress.district ? `, ${shippingAddress.district}` : ''}${shippingAddress.city ? `, ${shippingAddress.city}` : ''}`
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Text type="secondary">Shipping Address:</Text>
                    <div className="mt-1 text-gray-500">Loading address...</div>
                  </div>
                )}
                
                {order.estimatedDelivery && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                  <div>
                    <Text type="secondary">Expected Delivery:</Text>
                    <div>{isClient ? formatDate(order.estimatedDelivery) : 'Loading...'}</div>
                  </div>
                )}

                {order.deliveredAt && (
                  <div>
                    <Text type="secondary">Delivered Date:</Text>
                    <div className="text-green-600 font-medium">
                      {isClient ? formatDateTime(order.deliveredAt) : 'Loading...'}
                    </div>
                  </div>
                )}

                {order.cancelledDate && (
                  <div>
                    <Text type="secondary">Cancelled Date:</Text>
                    <div className="text-red-600">
                      {isClient ? formatDate(order.cancelledDate) : 'Loading...'}
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
                {order.status === "PENDING" && (
                  <Button 
                    danger 
                    onClick={handleCancelOrder}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3"
                  >
                    Cancel Order
                  </Button>
                )}
                
                {order.status === "DELIVERED" && (
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

                {false && ( // Removed review status since it's not in API
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

                {["CONFIRMED", "PAID", "SHIPPING"].includes(order.status) && (
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
              <Avatar 
                src={order?.shopAvatar && order?.shopAvatar.trim() !== '' ? order?.shopAvatar : null} 
                size="small" 
                icon={<ShopOutlined />} 
              />
              <Text strong className="text-gray-800">{order?.shopName}</Text>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {order?.items.map(item => (
                <div key={item.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                  <Image
                    src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop&crop=center'}
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
