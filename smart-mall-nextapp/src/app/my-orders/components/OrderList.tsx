import { Empty, Spin, Button } from "antd";
import { useRouter } from "next/navigation";
import OrderItem from "./OrderItem";
import type { Order } from "@/types/order";

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  onCancelOrder: (orderId: string) => void;
  onViewOrder: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  onReview?: (orderId: string, itemId: string) => void;
}

export default function OrderList({ 
  orders, 
  loading, 
  onCancelOrder, 
  onViewOrder,
  onReorder,
  onReview 
}: OrderListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="text-center py-16">
        <Spin size="large" />
        <p className="mt-4 text-gray-500 text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Empty 
        description={
          <div className="text-center py-8">
            <p className="text-lg text-gray-500 mb-2">No orders found</p>
            <p className="text-sm text-gray-400">Start shopping to see your orders here</p>
          </div>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-16"
      >
        <Button 
          type="primary" 
          size="large"
          onClick={() => router.push('/products')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 border-0 px-8"
        >
          Start Shopping
        </Button>
      </Empty>
    );
  }

  return (
    <div className="space-y-0">
      {orders.map(order => (
        <OrderItem
          key={order.id}
          order={order}
          onCancelOrder={onCancelOrder}
          onViewOrder={onViewOrder}
          onReorder={onReorder}
          onReview={onReview}
        />
      ))}
    </div>
  );
}