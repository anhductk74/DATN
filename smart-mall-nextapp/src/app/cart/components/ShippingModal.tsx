"use client";

import React from "react";
import { Modal } from "antd";
import { TruckOutlined } from "@ant-design/icons";

// Mock shipping info
const shippingInfo = {
  freeShipping: {
    title: "Free Shipping",
    description: "Free standard shipping on orders over 500,000 VND. Delivery in 3-5 business days.",
    terms: [
      "Applies to standard shipping only",
      "Excludes remote areas",
      "Cannot be combined with other shipping discounts"
    ]
  },
  expressShipping: {
    title: "Express Shipping Discount", 
    description: "Get 50% off express shipping (normally 50,000 VND) on orders over 500,000 VND.",
    terms: [
      "Next day delivery in major cities",
      "2-3 days delivery in other areas", 
      "Order before 2 PM for same day processing"
    ]
  }
};

interface ShippingModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ShippingModal({ visible, onClose }: ShippingModalProps) {
  return (
    <Modal
      title={
        <div className="flex items-center">
          <TruckOutlined className="text-orange-500 mr-2" />
          <span>Shipping Information</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div className="space-y-6">
        {/* Free Shipping */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded mr-3">
              FREE
            </div>
            <span className="font-medium text-gray-800">{shippingInfo.freeShipping.title}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{shippingInfo.freeShipping.description}</p>
          <div className="text-sm text-gray-500">
            <strong>Terms & Conditions:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {shippingInfo.freeShipping.terms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Express Shipping */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded mr-3">
              50% OFF
            </div>
            <span className="font-medium text-gray-800">{shippingInfo.expressShipping.title}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{shippingInfo.expressShipping.description}</p>
          <div className="text-sm text-gray-500">
            <strong>Express Delivery Details:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {shippingInfo.expressShipping.terms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}