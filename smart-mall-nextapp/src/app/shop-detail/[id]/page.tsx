"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StartChatButton from "@/components/StartChatButton";
import { shopService, productService } from "@/services";
import { App, Tabs, Pagination, Empty, Spin } from "antd";
import { getCloudinaryUrl } from "@/config/config";
import {
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  StarFilled,
  ShoppingOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { Shop } from "@/services/ShopService";
import type { Product } from "@/services/ProductService";

const { TabPane } = Tabs;

export default function ShopDetail() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const shopId = params.id as string;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // Fetch shop details
  const {
    data: shop,
    isLoading: shopLoading,
    isError: shopError,
  } = useQuery<Shop>({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      if (!shopId) throw new Error("Shop ID is required");
      const response = await shopService.getShopById(shopId);
      return response.data;
    },
    enabled: !!shopId,
  });

  // Fetch shop products
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["shopProducts", shopId],
    queryFn: async () => {
      if (!shopId) throw new Error("Shop ID is required");
      
      // Call API /api/products/shop/shopId
      const products = await productService.getProductsByShop(shopId);
      return products;
    },
    enabled: !!shopId,
  });

  // Loading state
  if (shopLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingOutlined className="text-4xl text-blue-600 mb-4" />
            <p className="text-gray-600">Loading shop details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (shopError || !shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🏪</div>
            <div className="text-gray-400 text-xl mb-2">Shop not found</div>
            <div className="text-gray-500 text-sm mb-6">
              The shop you are looking for does not exist
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-md transition-all"
              onClick={() => router.push("/products")}
            >
              Back to Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle pagination on client side since API returns all products
  const allProducts = productsData || [];
  const totalProducts = allProducts.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const products = allProducts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => router.push("/home")}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => router.push("/products")}
              className="hover:text-blue-600 transition-colors"
            >
              Shops
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{shop.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shop Header */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-blue-600"></div>

          {/* Shop Info */}
          <div className="px-8 py-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Shop Avatar */}
              <div className="flex-shrink-0 -mt-20 relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                  {shop.avatar ? (
                    <Image
                      src={getCloudinaryUrl(shop.avatar)}
                      alt={shop.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <ShopOutlined className="text-4xl text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  <CheckCircleOutlined className="mr-1" />
                  ACTIVE
                </div>
              </div>

              {/* Shop Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {shop.name}
                    </h1>
                    <p className="text-gray-600 mb-4">{shop.description}</p>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center space-x-2">
                        <StarFilled className="text-yellow-400" />
                        <span className="text-gray-700 font-medium">
                          5.0 Rating
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ShoppingOutlined className="text-blue-600" />
                        <span className="text-gray-700 font-medium">
                          {totalProducts} Products
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      {shop.address?.street && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <EnvironmentOutlined />
                          <span>
                            {shop.address.street}, {shop.address.commune},{" "}
                            {shop.address.district}, {shop.address.city}
                          </span>
                        </div>
                      )}
                      {shop.numberPhone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <PhoneOutlined />
                          <span>{shop.numberPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-3">
                    <StartChatButton
                      targetUserId={shop.ownerId}
                      targetUserInfo={{
                        name: shop.name,
                        avatar: shop.avatar,
                      }}
                      type="primary"
                      size="large"
                      icon={<MessageOutlined />}
                    >
                      Chat với Shop
                    </StartChatButton>

                    <button
                      onClick={() => router.push(`/shop/${shop.id}/products`)}
                      className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200"
                    >
                      <ShoppingOutlined className="mr-2" />
                      Xem tất cả sản phẩm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <Tabs defaultActiveKey="products" size="large">
            <TabPane
              tab={
                <span className="text-lg">
                  <ShoppingOutlined className="mr-2" />
                  Sản phẩm ({totalProducts})
                </span>
              }
              key="products"
            >
              {productsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Spin size="large" />
                </div>
              ) : products.length === 0 ? (
                <Empty
                  description="Không có sản phẩm nào"
                  className="py-20"
                />
              ) : (
                <>
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {products.map((product: Product) => (
                      <div
                        key={product.id}
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={getCloudinaryUrl(product.images[0])}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingOutlined className="text-4xl text-gray-400" />
                            </div>
                          )}
                          {product.status === "ACTIVE" && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                              ACTIVE
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-red-500">
                                $
                                {product.variants?.[0]?.price?.toLocaleString() ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <StarFilled className="text-yellow-400 text-sm" />
                              <span className="text-sm text-gray-600">
                                {product.averageRating || "5.0"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalProducts > pageSize && (
                    <div className="flex justify-center">
                      <Pagination
                        current={currentPage}
                        total={totalProducts}
                        pageSize={pageSize}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                        showTotal={(total) => `Tổng ${total} sản phẩm`}
                      />
                    </div>
                  )}
                </>
              )}
            </TabPane>

            <TabPane
              tab={
                <span className="text-lg">
                  <ShopOutlined className="mr-2" />
                  Thông tin Shop
                </span>
              }
              key="info"
            >
              <div className="space-y-6 py-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Về Shop
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {shop.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Thông tin liên hệ
                    </h4>
                    {shop.numberPhone && (
                      <div className="flex items-center space-x-3">
                        <PhoneOutlined className="text-blue-600" />
                        <span className="text-gray-700">
                          {shop.numberPhone}
                        </span>
                      </div>
                    )}
                    {shop.ownerName && (
                      <div className="flex items-center space-x-3">
                        <MailOutlined className="text-blue-600" />
                        <span className="text-gray-700">
                          Owner: {shop.ownerName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Địa chỉ
                    </h4>
                    {shop.address && (
                      <div className="flex items-start space-x-3">
                        <EnvironmentOutlined className="text-blue-600 mt-1" />
                        <div className="text-gray-700">
                          <p>{shop.address.street}</p>
                          <p>
                            {shop.address.commune}, {shop.address.district}
                          </p>
                          <p>{shop.address.city}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
