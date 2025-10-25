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
    returnRequest: number;
  };
  title?: string;
  orderCount?: number;
}

export default function OrderTabs({ activeTab, onTabChange, orderCounts, title, orderCount }: OrderTabsProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        {title && (
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <Title level={4} className="mb-0 text-gray-800 font-semibold">
              {title}
            </Title>
            {orderCount !== undefined && (
              <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                {orderCount} {orderCount === 1 ? 'order' : 'orders'}
              </div>
            )}
          </div>
        )}
        
        <Tabs 
          activeKey={activeTab} 
          onChange={onTabChange}
          className="order-tabs compact-tabs"
          size="small"
        >
          <TabPane 
            tab={
              <Badge count={orderCounts.all} showZero size="small">
                <span className="text-sm">All</span>
              </Badge>
            } 
            key="all" 
          />
          <TabPane 
            tab={
              <Badge count={orderCounts.pending} showZero size="small">
                <span className="text-sm">Pending</span>
              </Badge>
            } 
            key="pending" 
          />
          <TabPane 
            tab={
              <Badge count={orderCounts.confirmed} showZero size="small">
                <span className="text-sm">Confirmed</span>
              </Badge>
            } 
            key="confirmed" 
          />
          <TabPane 
            tab={
              <Badge count={orderCounts.shipping} showZero size="small">
                <span className="text-sm">Shipping</span>
              </Badge>
            } 
            key="shipping" 
          />
          <TabPane 
            tab={
              <Badge count={orderCounts.delivered} showZero size="small">
                <span className="text-sm">Delivered</span>
              </Badge>
            } 
            key="delivered" 
          />
          <TabPane 
            tab={
              <Badge count={orderCounts.cancelled} showZero size="small">
                <span className="text-sm">Cancelled</span>
              </Badge>
            } 
            key="cancelled" 
          />
          <TabPane 
            tab={
              <Badge count={orderCounts.returnRequest} showZero size="small">
                <span className="text-sm">Return Request</span>
              </Badge>
            } 
            key="return-request" 
          />
        </Tabs>
      </div>

      <style jsx global>{`
        .compact-tabs {
          margin-bottom: 0;
        }
        
        .compact-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        
        .compact-tabs .ant-tabs-tab {
          font-weight: 500;
          padding: 8px 12px !important;
          margin: 0 4px !important;
          color: #64748b;
          transition: all 0.2s ease;
          border-radius: 6px 6px 0 0;
          min-width: auto;
        }
        
        .compact-tabs .ant-tabs-tab:hover {
          color: #3b82f6;
          background: #f8fafc;
        }
        
        .compact-tabs .ant-tabs-tab-active {
          color: #2563eb !important;
          background: #eff6ff;
          border-bottom-color: #2563eb !important;
        }
        
        .compact-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #2563eb !important;
        }
        
        .compact-tabs .ant-tabs-ink-bar {
          background: #2563eb !important;
          height: 2px !important;
        }
        
        .compact-tabs .ant-tabs-content-holder {
          display: none;
        }
      `}</style>
    </div>
  );
}