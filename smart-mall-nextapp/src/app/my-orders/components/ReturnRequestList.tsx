import { Empty, Spin, Card, Typography, Button, Tag, Space } from "antd";
import { useRouter } from "next/navigation";
import { OrderReturnResponseDto } from "@/services/orderReturnRequestApiService";
import { OrderResponseDto } from "@/services/OrderApiService";
import { getCloudinaryUrl } from "@/config/config";
import Image from "next/image";
import { ArrowRightOutlined, CalendarOutlined, FileTextOutlined, ShopOutlined, DollarOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

// Extended type for return requests with order details
interface ReturnRequestWithOrderDetails extends OrderReturnResponseDto {
  orderDetails?: OrderResponseDto;
}

interface ReturnRequestListProps {
  returnRequests: ReturnRequestWithOrderDetails[];
  loading: boolean;
  onViewOrder: (orderId: string) => void;
}

export default function ReturnRequestList({ 
  returnRequests, 
  loading,
  onViewOrder
}: ReturnRequestListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="text-center py-16">
        <Spin size="large" />
        <p className="mt-4 text-gray-500 text-lg">Loading return requests...</p>
      </div>
    );
  }

  if (returnRequests.length === 0) {
    return (
      <Empty 
        description={
          <div className="text-center py-8">
            <p className="text-lg text-gray-500 mb-2">No return requests found</p>
            <p className="text-sm text-gray-400">Return requests will appear here when you submit them</p>
          </div>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-16"
      >
        <Button 
          type="primary" 
          size="large"
          onClick={() => router.push('/my-orders?tab=delivered')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 border-0 px-8"
        >
          View Delivered Orders
        </Button>
      </Empty>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'orange';
      case 'approved': return 'blue';
      case 'rejected': return 'red';
      case 'completed': return 'green';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      {returnRequests.map(request => (
        <Card 
          key={request.id}
          className="shadow-md border-0 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FileTextOutlined className="text-red-600" />
              </div>
              <div>
                <Text strong className="text-base">Return Request #{request.id.slice(-8)}</Text>
                <div className="flex items-center space-x-2 mt-1">
                  <Text className="text-gray-500 text-xs">
                    <CalendarOutlined className="mr-1" />
                    {new Date(request.requestDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Tag color={getStatusColor(request.status)} className="mb-2">
                {getStatusText(request.status)}
              </Tag>
              {request.processedDate && (
                <div className="text-xs text-gray-500">
                  Processed: {new Date(request.processedDate).toLocaleDateString('en-US')}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* Order Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">Order ID: {request.orderId}</Text>
                <Button 
                  size="small"
                  icon={<ArrowRightOutlined />}
                  onClick={() => onViewOrder(request.orderId)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  View Order
                </Button>
              </div>
              
              {/* Order Details if available */}
              {request.orderDetails && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShopOutlined className="text-gray-500" />
                      <Text className="text-sm text-gray-700">{request.orderDetails.shopName}</Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarOutlined className="text-gray-500" />
                      <Text className="text-sm font-medium text-gray-700">
                        {request.orderDetails.finalAmount.toLocaleString()}đ
                      </Text>
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  {request.orderDetails.items && request.orderDetails.items.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Text className="text-xs text-gray-500">Items:</Text>
                      <div className="flex space-x-1">
                        {request.orderDetails.items.slice(0, 3).map((item, index) => (
                          <div key={item.id} className="flex-shrink-0">
                            {item.productImage ? (
                              <Image
                                src={getCloudinaryUrl(item.productImage)}
                                alt={item.productName}
                                width={24}
                                height={24}
                                className="rounded object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=24&h=24&fit=crop&crop=center';
                                }}
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">?</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {request.orderDetails.items.length > 3 && (
                          <Text className="text-xs text-gray-400">+{request.orderDetails.items.length - 3} more</Text>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <Text className="text-sm font-medium text-gray-700">Reason:</Text>
              <div className="mt-1 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Text className="text-sm text-gray-700">{request.reason}</Text>
              </div>
            </div>

            {/* Evidence Images */}
            {request.imageUrls && request.imageUrls.length > 0 && (
              <div>
                <Text className="text-sm font-medium text-gray-700">Evidence Photos:</Text>
                <div className="mt-2 flex space-x-2 overflow-x-auto">
                  {request.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="flex-shrink-0">
                      <Image
                        src={getCloudinaryUrl(imageUrl)}
                        alt={`Evidence ${index + 1}`}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100">
              <Space>
                <Button 
                  size="small"
                  onClick={() => onViewOrder(request.orderId)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  View Original Order
                </Button>
                {request.status.toLowerCase() === 'pending' && (
                  <Button 
                    size="small"
                    type="text"
                    className="text-red-500 hover:text-red-600"
                  >
                    Cancel Request
                  </Button>
                )}
              </Space>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}