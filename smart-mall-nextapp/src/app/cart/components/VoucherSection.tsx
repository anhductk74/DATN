"use client";

import React from "react";
import { Button } from "antd";
import { GiftOutlined } from "@ant-design/icons";

interface VoucherSectionProps {
  onVoucherClick: () => void;
}

export default function VoucherSection({ onVoucherClick }: VoucherSectionProps) {
  return (
    <div className="bg-white rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <GiftOutlined className="text-orange-500 mr-2" />
          <span className="text-sm font-medium">SmartMall Voucher</span>
          <span className="ml-2 text-xs text-gray-500">Choose or enter voucher code</span>
        </div>
        <Button type="link" size="small" className="text-blue-500" onClick={onVoucherClick}>
          Select Voucher
        </Button>
      </div>
    </div>
  );
}