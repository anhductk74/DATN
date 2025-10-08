"use client";

import React from "react";
import { Modal, Button } from "antd";
import { GiftOutlined } from "@ant-design/icons";

// Mock voucher data
const mockVouchers = [
  {
    id: "v1",
    title: "New User Discount",
    description: "Get 90,000 VND off on orders over 500,000 VND",
    discount: "90K",
    minOrder: 500000,
    code: "NEWUSER90",
    type: "discount",
    expiry: "Valid until Dec 31, 2024"
  },
  {
    id: "v2", 
    title: "Flash Sale Voucher",
    description: "Special discount for flash sale items only",
    discount: "50K",
    minOrder: 200000,
    code: "FLASH50",
    type: "discount",
    expiry: "Valid until Oct 15, 2024"
  },
  {
    id: "v3",
    title: "Free Shipping Voucher",
    description: "Free shipping for orders over 0 VND",
    discount: "Free Ship",
    minOrder: 0,
    code: "FREESHIP",
    type: "shipping",
    expiry: "Valid until Nov 30, 2024"
  },
  {
    id: "v4",
    title: "Premium Member Discount",
    description: "Exclusive discount for premium members",
    discount: "150K",
    minOrder: 1000000,
    code: "PREMIUM150",
    type: "discount",
    expiry: "Valid until Dec 31, 2024"
  }
];

interface VoucherModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function VoucherModal({ visible, onClose }: VoucherModalProps) {
  return (
    <Modal
      title={
        <div className="flex items-center">
          <GiftOutlined className="text-orange-500 mr-2" />
          <span>Available Vouchers</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="voucher-modal"
    >
      <div className="space-y-4">
        {mockVouchers.map((voucher) => (
          <div key={voucher.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className={`px-3 py-1 rounded text-white text-sm font-medium mr-3 ${
                    voucher.type === 'shipping' ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {voucher.discount}
                  </div>
                  <span className="font-medium text-gray-800">{voucher.title}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-4">Code: {voucher.code}</span>
                  <span>{voucher.expiry}</span>
                </div>
                {voucher.minOrder > 0 && (
                  <div className="text-xs text-orange-600 mt-1">
                    Minimum order: {voucher.minOrder.toLocaleString()} VND
                  </div>
                )}
              </div>
              <Button type="primary" size="small" className="bg-orange-500 hover:bg-orange-600 border-orange-500">
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}