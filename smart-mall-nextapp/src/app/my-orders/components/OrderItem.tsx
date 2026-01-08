import { Card, Avatar, Button, Typography, Popconfirm, Divider } from "antd";
import { 
  ShopOutlined,
  MessageOutlined,
  CalendarOutlined,
  EyeOutlined,
  DeleteOutlined,
  CopyOutlined,
  StarOutlined,
  ReloadOutlined,
  TruckOutlined
} from "@ant-design/icons";
import Image from "next/image";
import OrderStatusBadge from "./OrderStatusBadge";
import type { Order } from "@/types/order";

const { Text } = Typography;

interface OrderItemProps {
  order: Order;
  onCancelOrder: (orderId: string) => void;
  onViewOrder: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  onReview?: (orderId: string, itemId: string) => void;
}

export default function OrderItem({ 
  order, 
  onCancelOrder, 
  onViewOrder, 
  onReorder,
  onReview 
}: OrderItemProps) {
  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
  };

  return (
    <Card 
      className="shadow-md border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mb-4"
    >
      {/* Order Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-3 ">
          <Avatar 
            src={order.shopAvatar && order.shopAvatar.trim() !== '' ? order.shopAvatar : null} 
            size="default" 
            icon={<ShopOutlined />} 
          />
          <div className="">
            <div className="flex items-center space-x-2">
              <Text strong className="text-base">{order.shopName}</Text>
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <Text className="text-gray-500 text-xs">
                <CalendarOutlined className="mr-1" />
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              <Text className="text-gray-500 text-xs">
                Order ID: <Text code className="text-xs">{order.id}</Text>
                <Button 
                  type="link" 
                  size="small" 
                  icon={<CopyOutlined />}
                  onClick={copyOrderId}
                  className="ml-1 p-0 text-gray-400 hover:text-blue-500"
                />
              </Text>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <OrderStatusBadge status={order.status} />
          {order.trackingNumber && (
            <div className="mt-2">
              <Text className="text-xs text-gray-500">
                Tracking: <Text code className="text-xs">{order.trackingNumber}</Text>
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-3 mb-3">
        {order.items.map(item => (
          <div key={item.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
            <div className="w-16 h-16 bg-white rounded-md overflow-hidden shadow-sm flex-shrink-0">
              <img 
                src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=center'} 
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Use fallback image if original fails
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=center';
                  // Prevent infinite loop by removing the onError handler after first error
                  e.currentTarget.onerror = null;
                }}
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Text strong className="text-sm block mb-1 truncate">{item.name}</Text>
              <Text className="text-gray-500 text-xs block mb-1">
                Variant: {item.variant}
              </Text>
              <div className="flex items-center justify-between">
                <Text className="text-gray-600 text-xs">Qty: {item.quantity}</Text>
                <Text strong className="text-red-600 text-sm">
                  ₫{item.price.toLocaleString('vi-VN')}
                </Text>
              </div>
            </div>

            {order.status === "DELIVERED" && order.canReview && onReview && (
              <Button
                size="small"
                icon={<StarOutlined />}
                onClick={() => onReview(order.id, item.id)}
                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 flex-shrink-0"
              >
                Review
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-3 rounded-lg mb-3">
        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
          <span>Subtotal:</span>
          <span>₫{(order.totalAmount - order.shippingFee).toLocaleString('vi-VN')}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
          <span>Shipping (Standard):</span>
          <span>{order.shippingFee === 0 ? 'Free' : `₫${order.shippingFee.toLocaleString('vi-VN')}`}</span>
        </div>
        <Divider className="my-1" />
        <div className="flex justify-between items-center text-sm font-bold">
          <span>Total Amount:</span>
          <span className="text-red-600">₫{order.totalAmount.toLocaleString('vi-VN')}</span>
        </div>
        {order.estimatedDelivery && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
          <div className="text-xs text-blue-600 mt-1">
            <TruckOutlined className="mr-1" />
            Expected delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US')}
          </div>
        )}
      </div>

      {/* Order Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex space-x-1">
          {order.status === "PENDING" && (
            <Popconfirm
              title="Cancel Order"
              description="Are you sure you want to cancel this order?"
              onConfirm={() => onCancelOrder(order.id)}
              okText="Yes, Cancel"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button 
                size="small"
                icon={<DeleteOutlined />}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel
              </Button>
            </Popconfirm>
          )}

          {(order.status === "DELIVERED" || order.status === "CANCELLED") && onReorder && (
            <Button 
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => onReorder(order.id)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Reorder
            </Button>
          )}
        </div>

        <div className="flex space-x-1">
          <Button 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewOrder(order.id)}
          >
            Details
          </Button>
          
          {order.status === "DELIVERED" && (
            <Button 
              size="small"
              type="primary"
              icon={<MessageOutlined />}
              className="bg-gradient-to-r from-green-500 to-blue-500 border-0"
            >
              Contact
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}