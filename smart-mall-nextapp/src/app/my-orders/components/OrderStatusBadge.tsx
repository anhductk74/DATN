import { 
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";

interface OrderStatusBadgeProps {
  status: string;
}

const getStatusConfig = (status: string) => {
  // Map database ENUM to config keys
  const statusMap: Record<string, string> = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'PAID': 'paid', 
    'SHIPPING': 'shipping',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
    'RETURN_REQUESTED': 'return_requested',
    'RETURNED': 'returned'
  };

  const configs = {
    pending: {
      icon: <ClockCircleOutlined />,
      text: "Pending Confirmation",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-200"
    },
    confirmed: {
      icon: <CheckCircleOutlined />,
      text: "Confirmed",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    paid: {
      icon: <CheckCircleOutlined />,
      text: "Paid",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200"
    },
    shipping: {
      icon: <TruckOutlined />,
      text: "Shipping", 
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
      borderColor: "border-cyan-200"
    },
    delivered: {
      icon: <CheckCircleOutlined />,
      text: "Delivered",
      bgColor: "bg-green-50", 
      textColor: "text-green-600",
      borderColor: "border-green-200"
    },
    cancelled: {
      icon: <CloseCircleOutlined />,
      text: "Cancelled",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200"
    },
    return_requested: {
      icon: <ClockCircleOutlined />,
      text: "Return Requested",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600", 
      borderColor: "border-yellow-200"
    },
    returned: {
      icon: <CheckCircleOutlined />,
      text: "Returned",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
      borderColor: "border-gray-200"
    }
  };
  
  const configKey = statusMap[status] || 'pending';
  return configs[configKey as keyof typeof configs] || configs.pending;
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = getStatusConfig(status);

  return (
    <div 
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} shadow-sm`}
    >
      <span className="mr-2">{statusConfig.icon}</span>
      <span>{statusConfig.text}</span>
    </div>
  );
}