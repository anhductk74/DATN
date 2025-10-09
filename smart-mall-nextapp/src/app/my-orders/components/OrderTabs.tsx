import { Tabs, Card, Badge, Typography } from "antd";
import { useState, useEffect } from "react";

const { TabPane } = Tabs;
const { Title } = Typography;

interface OrderTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  orderCounts: {
    all: number;
    pending: number;
    confirmed: number;
    shipping: number;
    delivered: number;
    cancelled: number;
  };
  title?: string;
  orderCount?: number;
}

export default function OrderTabs({ activeTab, onTabChange, orderCounts, title, orderCount }: OrderTabsProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Khi scroll xuống 200px thì bắt đầu show sticky effect
      setIsSticky(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky top-16 z-10 transition-all duration-300 ${
      isSticky ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    } pt-4 pb-2`}>
      <Card className={`mb-4 border-0 rounded-2xl overflow-hidden transition-all duration-300 ${
        isSticky ? 'shadow-xl bg-white/95' : 'shadow-lg bg-white'
      }`}>
        {title && (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <Title level={3} className="mb-0 text-gray-800">
              {title}
            </Title>
            {orderCount !== undefined && (
              <div className="text-sm text-gray-500">
                {orderCount} {orderCount === 1 ? 'order' : 'orders'} total
              </div>
            )}
          </div>
        )}
        <Tabs 
          activeKey={activeTab} 
          onChange={onTabChange}
          className="order-tabs"
          size="large"
        >
        <TabPane 
          tab={
            <Badge count={orderCounts.all} showZero>
              <span className="px-2">All Orders</span>
            </Badge>
          } 
          key="all" 
        />
        <TabPane 
          tab={
            <Badge count={orderCounts.pending} showZero>
              <span className="px-2">Pending</span>
            </Badge>
          } 
          key="pending" 
        />
        <TabPane 
          tab={
            <Badge count={orderCounts.confirmed} showZero>
              <span className="px-2">Confirmed</span>
            </Badge>
          } 
          key="confirmed" 
        />
        <TabPane 
          tab={
            <Badge count={orderCounts.shipping} showZero>
              <span className="px-2">Shipping</span>
            </Badge>
          } 
          key="shipping" 
        />
        <TabPane 
          tab={
            <Badge count={orderCounts.delivered} showZero>
              <span className="px-2">Delivered</span>
            </Badge>
          } 
          key="delivered" 
        />
        <TabPane 
          tab={
            <Badge count={orderCounts.cancelled} showZero>
              <span className="px-2">Cancelled</span>
            </Badge>
          } 
          key="cancelled" 
        />
      </Tabs>

      <style jsx global>{`
        .order-tabs .ant-tabs-tab {
          font-weight: 500;
          padding: 12px 16px;
          color: #64748b;
          transition: all 0.3s ease;
        }
        
        .order-tabs .ant-tabs-tab:hover {
          color: #3b82f6;
        }
        
        .order-tabs .ant-tabs-tab-active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      </Card>
    </div>
  );
}