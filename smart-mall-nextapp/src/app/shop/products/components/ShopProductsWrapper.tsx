import { Suspense } from 'react';
import ShopProductsContent from './components/ShopProductsContent';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading products...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your shop data</p>
      </div>
    </div>
  );
}

export default function ShopProductsWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ShopProductsContent />
    </Suspense>
  );
}
