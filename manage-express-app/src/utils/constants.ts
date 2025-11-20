

/**
 * Status configurations for shipments
 */
export const SHIPMENT_STATUS_CONFIG = {
  pending: {
    label: 'Chờ lấy hàng',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  'picked-up': {
    label: 'Đã lấy hàng',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  'in-transit': {
    label: 'Đang vận chuyển',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
  delivered: {
    label: 'Đã giao',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  failed: {
    label: 'Giao thất bại',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  returned: {
    label: 'Hoàn về',
    color: 'volcano',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
  },
};

/**
 * Shipper status configurations
 */
export const SHIPPER_STATUS_CONFIG = {
  active: {
    label: 'Sẵn sàng',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  busy: {
    label: 'Đang giao hàng',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  inactive: {
    label: 'Không hoạt động',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
};

/**
 * Warehouse status configurations
 */
export const WAREHOUSE_STATUS_CONFIG = {
  active: {
    label: 'Hoạt động',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  inactive: {
    label: 'Không hoạt động',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  maintenance: {
    label: 'Bảo trì',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
};

/**
 * COD transaction status configurations
 */
export const COD_STATUS_CONFIG = {
  pending: {
    label: 'Chờ thu',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  collected: {
    label: 'Đã thu',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  remitted: {
    label: 'Đã chuyển',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  failed: {
    label: 'Thu thất bại',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
};

/**
 * Vehicle type configurations
 */
export const VEHICLE_TYPE_CONFIG = {
  motorbike: {
    label: 'Xe máy',
    icon: '🏍️',
    capacity: '50kg',
  },
  car: {
    label: 'Ô tô',
    icon: '🚗',
    capacity: '200kg',
  },
  truck: {
    label: 'Xe tải',
    icon: '🚛',
    capacity: '1000kg',
  },
};

/**
 * Priority levels
 */
export const PRIORITY_CONFIG = {
  low: {
    label: 'Thấp',
    color: 'default',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
  },
  normal: {
    label: 'Bình thường',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  high: {
    label: 'Cao',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
  urgent: {
    label: 'Khẩn cấp',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
  },
};

/**
 * Get status configuration by type and status
 */
export const getStatusConfig = (type: string, status: string) => {
  const configs: Record<string, any> = {
    shipment: SHIPMENT_STATUS_CONFIG,
    shipper: SHIPPER_STATUS_CONFIG,
    warehouse: WAREHOUSE_STATUS_CONFIG,
    cod: COD_STATUS_CONFIG,
  };
  
  return configs[type]?.[status] || {
    label: status,
    color: 'default',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
  };
};

/**
 * Common color palette
 */
export const COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  text: {
    primary: '#262626',
    secondary: '#8c8c8c',
    disabled: '#bfbfbf',
  },
  background: {
    light: '#fafafa',
    white: '#ffffff',
    gray: '#f5f5f5',
  },
  border: {
    light: '#f0f0f0',
    default: '#d9d9d9',
  },
};

/**
 * Common spacing
 */
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

/**
 * Common breakpoints
 */
export const BREAKPOINTS = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
};