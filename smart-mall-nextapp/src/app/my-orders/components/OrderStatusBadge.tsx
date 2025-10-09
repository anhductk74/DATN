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
    }
  };
  return configs[status as keyof typeof configs] || configs.pending;
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