"use client";

import { Result, Button, Card, Spin } from "antd";
import { CloseCircleOutlined, ShoppingOutlined, HomeOutlined } from "@ant-design/icons";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { vnPayService } from "@/services";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { VnPayPaymentResponseDto } from "@/services/vnPayService";

function FailedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<VnPayPaymentResponseDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleVnPayCallback = async () => {
      try {
        // Lấy tất cả query parameters từ VNPay callback
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        if (Object.keys(params).length > 0) {
          // Gọi service để xử lý callback từ VNPay
          const result = await vnPayService.handlePaymentReturn(params);
          setPaymentResult(result);
          
          // Thanh toán thất bại - có thể giữ lại thông tin để user thử lại
          console.log('Payment failed with result:', result);
        } else {
          // Trường hợp không có parameters (người dùng truy cập trực tiếp)
          setErrorMessage("Payment failed or was cancelled. No payment information found.");
        }
      } catch (error) {
        console.error('Error processing payment callback:', error);
        setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    handleVnPayCallback();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <main className="py-6">
      <div className="max-w-2xl mx-auto px-4">
        <Result
          status="error"
          title="Payment Failed!"
          subTitle={paymentResult?.message || errorMessage || "Your payment could not be processed. Please try again."}
          extra={[
            <Button 
              type="primary" 
              key="retry"
              icon={<ShoppingOutlined />}
              onClick={() => {
                // Kiểm tra có checkout_items trong sessionStorage không
                const checkoutItems = sessionStorage.getItem('checkout_items');
                if (checkoutItems) {
                  router.push('/checkout');
                } else {
                  router.push('/cart');
                }
              }}
              className="bg-red-500 hover:bg-red-600 border-red-500"
            >
              Try Again
            </Button>,
            <Button 
              key="home"
              icon={<HomeOutlined />}
              onClick={() => router.push('/')}
            >
              Continue Shopping
            </Button>
          ]}
        />

        {paymentResult && paymentResult.transactionCode && (
          <Card className="mt-6">
            <div className="text-center">
              <CloseCircleOutlined className="text-red-500 text-4xl mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Transaction Code:</strong> {paymentResult.transactionCode}</p>
                <p><strong>Response Code:</strong> {paymentResult.responseCode}</p>
                <p><strong>Status:</strong> <span className="text-red-600">Failed</span></p>
                <p><strong>Message:</strong> {paymentResult.message}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

export default function FailedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      }>
        <FailedPageContent />
      </Suspense>
      
      <Footer />
    </div>
  );
}
