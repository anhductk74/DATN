'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Result, Button, Card, Spin } from 'antd';
import { CheckCircleOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import { vnPayService, VnPayPaymentResponseDto } from "@/services/vnPayService";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<VnPayPaymentResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Get all query parameters from VNPay callback
        const params: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        console.log('VNPay callback params:', params);

        if (Object.keys(params).length === 0) {
          // If no params, show default success page
          setPaymentResult({ 
            status: 1, 
            message: 'Payment completed successfully',
            transactionCode: '',
            responseCode: '00'
          });
          setLoading(false);
          return;
        }

        // Process payment result with VNPay service
        const result = await vnPayService.handlePaymentReturn(params);
        console.log('VNPay payment result:', result);
        
        setPaymentResult(result);

        if (!vnPayService.isPaymentSuccessful(result)) {
          const errorMsg = vnPayService.getErrorMessage(result.responseCode);
          setError(errorMsg);
        } else {
          // Thanh toán thành công - xóa thông tin pending payment
          sessionStorage.removeItem('pending_payment');
          sessionStorage.removeItem('checkout_items');
        }
      } catch (error) {
        console.error('Failed to process payment result:', error);
        // Show success anyway if we can't verify
        setPaymentResult({ 
          status: 1, 
          message: 'Payment completed successfully',
          transactionCode: '',
          responseCode: '00'
        });
        // Xóa thông tin thanh toán nếu có lỗi (coi như thành công)
        sessionStorage.removeItem('pending_payment');
        sessionStorage.removeItem('checkout_items');
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-500">Processing payment result...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    // Redirect to failed page if there's an error
    router.push('/orders/failed');
    return null;
  }

  const isSuccess = paymentResult && (paymentResult.status === 1 || vnPayService.isPaymentSuccessful(paymentResult));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-6">
        <div className="max-w-2xl mx-auto px-4">
          <Result
            status="success"
            title="Payment Successful!"
            subTitle="Your payment has been processed successfully. Your order is being prepared."
            extra={[
              <Button 
                type="primary" 
                key="orders"
                icon={<ShoppingOutlined />}
                onClick={() => router.push('/my-orders')}
                className="bg-blue-600 hover:bg-blue-700 border-blue-600"
              >
                View My Orders
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
                <CheckCircleOutlined className="text-green-500 text-4xl mb-4" />
                <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Transaction Code:</strong> {paymentResult.transactionCode}</p>
                  <p><strong>Status:</strong> <span className="text-green-600">Successful</span></p>
                  <p><strong>Message:</strong> {paymentResult.message}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}