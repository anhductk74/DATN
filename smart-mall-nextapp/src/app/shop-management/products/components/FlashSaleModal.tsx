"use client";

import { useState, useEffect } from "react";
import { Modal, Form, InputNumber, DatePicker, Button, Space, Tag, Divider, Alert } from "antd";
import { ThunderboltOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { Product, ProductVariant } from "@/services/ProductService";
import productService from "@/services/ProductService";
import { useAntdApp } from "@/hooks/useAntdApp";

interface FlashSaleModalProps {
  visible: boolean;
  product: Product | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function FlashSaleModal({ visible, product, onCancel, onSuccess }: FlashSaleModalProps) {
  const [form] = Form.useForm();
  const { message } = useAntdApp();
  const [loading, setLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (visible && product) {
      // Select first variant by default
      if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];
        setSelectedVariantId(firstVariant.id || null);
        setSelectedVariant(firstVariant);
        
        // If variant has flash sale, pre-fill the form
        if (firstVariant.flashSalePrice) {
          form.setFieldsValue({
            flashSalePrice: firstVariant.flashSalePrice,
            startTime: firstVariant.flashSaleStartTime ? dayjs(firstVariant.flashSaleStartTime) : null,
            endTime: firstVariant.flashSaleEndTime ? dayjs(firstVariant.flashSaleEndTime) : null,
            flashSaleQuantity: firstVariant.flashSaleQuantity || undefined,
          });
        } else {
          form.resetFields();
        }
      }
    }
  }, [visible, product, form]);

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id || null);
    setSelectedVariant(variant);
    
    // Pre-fill form if variant has flash sale
    if (variant.flashSalePrice) {
      form.setFieldsValue({
        flashSalePrice: variant.flashSalePrice,
        startTime: variant.flashSaleStartTime ? dayjs(variant.flashSaleStartTime) : null,
        endTime: variant.flashSaleEndTime ? dayjs(variant.flashSaleEndTime) : null,
        flashSaleQuantity: variant.flashSaleQuantity || undefined,
      });
    } else {
      form.resetFields();
    }
  };

  const handleSetFlashSale = async (values: any) => {
    if (!selectedVariantId) {
      message.error("Please select a variant");
      return;
    }

    if (!selectedVariant) {
      message.error("No variant selected");
      return;
    }

    setLoading(true);
    try {
      // Validate according to FLASH_SALE_API_README.md spec
      const flashSalePrice = Number(values.flashSalePrice);
      const startTime = values.startTime.format("YYYY-MM-DDTHH:mm:ss");
      const endTime = values.endTime.format("YYYY-MM-DDTHH:mm:ss");
      const flashSaleQuantity = values.flashSaleQuantity ? Number(values.flashSaleQuantity) : undefined;

      // Client-side validation (matching backend validation)
      if (flashSalePrice >= selectedVariant.price) {
        message.error("Flash sale price must be less than original price");
        return;
      }

      if (values.endTime.isBefore(values.startTime)) {
        message.error("End time must be after start time");
        return;
      }

      if (flashSaleQuantity && flashSaleQuantity > selectedVariant.stock) {
        message.error(`Flash sale quantity cannot exceed available stock (${selectedVariant.stock})`);
        return;
      }

      if (values.startTime.isBefore(dayjs())) {
        message.warning("Start time is in the past. Flash sale will start immediately.");
      }

      const requestData: any = {
        flashSalePrice: flashSalePrice,
        startTime: startTime,
        endTime: endTime,
      };

      // Only add flashSaleQuantity if provided (it's optional)
      if (flashSaleQuantity) {
        requestData.flashSaleQuantity = flashSaleQuantity;
      }
      
      console.log("🔥 Setting flash sale for variant:", selectedVariantId);
      console.log("📦 Request data (matching API spec):", requestData);
      console.log("💰 Flash Sale Price:", requestData.flashSalePrice, "(original:", selectedVariant.price, ")");
      console.log("📦 Flash Sale Quantity:", requestData.flashSaleQuantity || "unlimited");
      console.log("📅 Start time (ISO):", requestData.startTime);
      console.log("📅 End time (ISO):", requestData.endTime);
      console.log("🎯 API Endpoint: PUT /products/variants/" + selectedVariantId + "/flash-sale");
      
      const response = await productService.setFlashSale(selectedVariantId, requestData);
      console.log("✅ Flash sale set successfully! Response:", response);
      
      message.success("Flash sale set successfully!");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error("❌ Flash Sale Error Details:");
      console.error("   Status:", error.response?.status);
      console.error("   Message:", error.response?.data?.message);
      console.error("   Data:", error.response?.data);
      console.error("   Full Error:", error);
      
      // Display detailed error message based on API error responses
      let errorMessage = "Failed to set flash sale";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "Product variant not found. Please refresh the page.";
      } else if (error.response?.status === 409) {
        errorMessage = "This variant already has an active flash sale. Remove it first.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data. Check: price < original, endTime > startTime, quantity >= 1";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please check backend logs or contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage, 6);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFlashSale = async () => {
    if (!selectedVariantId) {
      message.error("Please select a variant");
      return;
    }

    setLoading(true);
    try {
      await productService.removeFlashSale(selectedVariantId);
      message.success("Flash sale removed successfully!");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error("Error removing flash sale:", error);
      message.error(error.response?.data?.message || "Failed to remove flash sale");
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    const flashPrice = form.getFieldValue("flashSalePrice");
    if (selectedVariant && flashPrice && flashPrice < selectedVariant.price) {
      const discount = ((selectedVariant.price - flashPrice) / selectedVariant.price * 100).toFixed(0);
      return `${discount}%`;
    }
    return null;
  };

  const disabledDate = (current: Dayjs, type: 'start' | 'end') => {
    if (!current) return false;
    
    // Cannot select dates before today
    if (current.isBefore(dayjs(), 'day')) {
      return true;
    }
    
    // For end time, must be after start time
    if (type === 'end') {
      const startTime = form.getFieldValue('startTime');
      if (startTime && current.isBefore(startTime, 'minute')) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ThunderboltOutlined className="text-red-500" />
          <span>Manage Flash Sale</span>
        </div>
      }
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={700}
    >
      {product && (
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-semibold text-lg mb-1">{product.name}</div>
            <div className="text-sm text-gray-600">{product.brand}</div>
          </div>

          {/* Variant Selection */}
          <div>
            <div className="font-medium mb-3">Select Variant</div>
            <div className="grid grid-cols-1 gap-2">
              {product.variants?.map((variant) => {
                const isSelected = variant.id === selectedVariantId;
                const hasFlashSale = variant.flashSalePrice != null;
                
                return (
                  <div
                    key={variant.id}
                    onClick={() => handleVariantSelect(variant)}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{variant.sku}</div>
                        <div className="text-sm text-gray-600">
                          {variant.attributes?.map((attr) => (
                            <Tag key={attr.id}>{attr.attributeName}: {attr.attributeValue}</Tag>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${variant.price.toLocaleString('en-US')}</div>
                        {hasFlashSale && (
                          <div className="flex flex-col items-end gap-1">
                            <Tag color="red" icon={<ThunderboltOutlined />}>
                              ${variant.flashSalePrice?.toLocaleString('en-US')}
                            </Tag>
                            {variant.discountPercent && (
                              <Tag color="orange">-{variant.discountPercent}%</Tag>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">Stock: {variant.stock.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    {hasFlashSale && (
                      <div className="mt-2 text-xs text-gray-600">
                        <div>Start: {variant.flashSaleStartTime ? dayjs(variant.flashSaleStartTime).format("MMM DD, YYYY HH:mm") : "N/A"}</div>
                        <div>End: {variant.flashSaleEndTime ? dayjs(variant.flashSaleEndTime).format("MMM DD, YYYY HH:mm") : "N/A"}</div>
                        {variant.isFlashSaleActive ? (
                          <Tag color="success" className="mt-1">Active Now</Tag>
                        ) : (
                          <Tag color="default" className="mt-1">
                            {dayjs().isBefore(dayjs(variant.flashSaleStartTime)) ? "Upcoming" : "Expired"}
                          </Tag>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedVariant && (
            <>
              <Divider />
              
              {/* Flash Sale Form */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSetFlashSale}
              >
                <Alert
                  message="Flash Sale Tips"
                  description={
                    <ul className="list-disc list-inside text-sm">
                      <li>Flash sale price must be lower than original price</li>
                      <li>Choose appropriate time duration to create urgency</li>
                      <li>Set quantity limit (optional) to create scarcity effect</li>
                      <li>Ensure sufficient stock before setting flash sale</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  className="mb-4"
                />

                <Form.Item
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span>Flash Sale Price</span>
                      {calculateDiscount() && (
                        <Tag color="red">Discount: {calculateDiscount()}</Tag>
                      )}
                    </div>
                  }
                  name="flashSalePrice"
                  rules={[
                    { required: true, message: "Please enter flash sale price" },
                    { type: "number", message: "Must be a valid number" },
                    { 
                      validator: (_, value) => {
                        if (!value || value <= 0) {
                          return Promise.reject(new Error("Flash sale price must be greater than 0"));
                        }
                        if (selectedVariant && value >= selectedVariant.price) {
                          return Promise.reject(
                            new Error(`Must be less than original price ($${selectedVariant.price.toLocaleString('en-US')})`)
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  tooltip="Flash sale price must be less than the original price"
                >
                  <InputNumber
                    prefix="$"
                    style={{ width: "100%" }}
                    min={1}
                    max={selectedVariant.price - 1}
                    placeholder={`Original price: $${selectedVariant.price.toLocaleString('vi-VN')}`}
                    formatter={(value) => {
                      if (!value) return '';
                      // Convert to string and remove all non-digits
                      const str = String(value).replace(/[^\d]/g, '');
                      if (!str) return '';
                      // Add commas: 1234567 -> 1,234,567
                      return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }}
                    parser={(value) => {
                      if (!value) return '' as any;
                      // Remove everything except digits
                      const parsed = value.replace(/[^\d]/g, '');
                      return parsed as any;
                    }}
                    step={1000}
                    precision={0}
                  />
                </Form.Item>

                <Form.Item
                  label="Start Time"
                  name="startTime"
                  rules={[
                    { required: true, message: "Please select start time" },
                  ]}
                  tooltip="Flash sale start time in ISO format (YYYY-MM-DDTHH:mm:ss)"
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    style={{ width: "100%" }}
                    disabledDate={(current) => disabledDate(current, 'start')}
                    placeholder="Select start time"
                    showNow={false}
                  />
                </Form.Item>

                <Form.Item
                  label="End Time"
                  name="endTime"
                  rules={[
                    { required: true, message: "Please select end time" },
                    {
                      validator: (_, value) => {
                        const startTime = form.getFieldValue("startTime");
                        if (value && startTime && (value.isBefore(startTime) || value.isSame(startTime))) {
                          return Promise.reject(new Error("End time must be after start time"));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  tooltip="Flash sale end time (must be after start time)"
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    style={{ width: "100%" }}
                    disabledDate={(current) => disabledDate(current, 'end')}
                    placeholder="Select end time"
                    showNow={false}
                  />
                </Form.Item>

                <Form.Item
                  label="Flash Sale Quantity (Optional)"
                  name="flashSaleQuantity"
                  rules={[
                    { type: "number", message: "Must be a valid number" },
                    { 
                      validator: (_, value) => {
                        if (value && value < 1) {
                          return Promise.reject(new Error("Quantity must be at least 1"));
                        }
                        if (value && selectedVariant && value > selectedVariant.stock) {
                          return Promise.reject(
                            new Error(`Cannot exceed available stock (${selectedVariant.stock})`)
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  tooltip="Limit the number of items available for flash sale. Leave empty for unlimited."
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    max={selectedVariant.stock}
                    placeholder={`Max: ${selectedVariant.stock.toLocaleString()} (available stock)`}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                  />
                </Form.Item>

                <div className="flex gap-2 justify-end">
                  {selectedVariant.flashSalePrice && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveFlashSale}
                      loading={loading}
                    >
                      Remove Flash Sale
                    </Button>
                  )}
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<ThunderboltOutlined />}>
                    {selectedVariant.flashSalePrice ? "Update Flash Sale" : "Set Flash Sale"}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
