"use client";

import React from "react";
import { Button } from "antd";
import { GiftOutlined } from "@ant-design/icons";

interface VoucherSectionProps {
  onVoucherClick: () => void;
}

export default function VoucherSection({ onVoucherClick }: VoucherSectionProps) {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <GiftOutlined className="text-white text-xl" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg">🎁 SmartMall Voucher</div>
            <div className="text-sm text-gray-600 mt-1">Apply discount codes and save more on your order</div>
          </div>
        </div>
        <Button 
          type="primary"
          size="large"
          onClick={onVoucherClick}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-none font-semibold px-6 py-2 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          Select Voucher
        </Button>
      </div>
    </div>
  );
}