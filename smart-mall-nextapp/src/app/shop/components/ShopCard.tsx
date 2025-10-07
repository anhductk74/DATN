"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ShopOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  HeartOutlined,
  StarOutlined
} from "@ant-design/icons";
import { Shop } from "@/services";
import { CLOUDINARY_API_URL } from "@/config/config";

interface ShopCardProps {
  shop: Shop;
  onEdit: (shop: Shop) => void;
  onDelete: (shop: Shop) => void;
  onViewProducts?: (shop: Shop) => void;
}

export default function ShopCard({ shop, onEdit, onDelete }: ShopCardProps) {
  const router = useRouter();

  const handleViewProducts = () => {
    // Điều hướng đến trang quản lý sản phẩm với shopId và shopName
    router.push(`/shop/products?shopId=${shop.id}&shopName=${encodeURIComponent(shop.name)}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 relative">
        
        {/* Shop Header */}
        <div className="relative h-72 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden rounded-t-3xl">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
            <div className="absolute top-20 right-10 w-20 h-20 bg-white rounded-full animate-pulse delay-700"></div>
            <div className="absolute bottom-10 left-20 w-16 h-16 bg-white rounded-full animate-pulse delay-1000"></div>
          </div>
          
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Action Buttons */}
          <div className="absolute top-6 right-6 z-10">
            <div className="flex space-x-3">
              <button
                onClick={() => onEdit(shop)}
                className="group flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-md text-gray-700 rounded-xl hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <EditOutlined className="group-hover:text-blue-600 transition-colors" />
                <span className="font-medium">Edit</span>
              </button>
              <button
                onClick={() => onDelete(shop)}
                className="group flex items-center space-x-2 px-4 py-2 bg-red-600/90 backdrop-blur-md text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <DeleteOutlined className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Delete</span>
              </button>
            </div>
          </div>

          {/* Shop Stats */}
          <div className="absolute bottom-6 right-6 flex space-x-4">
            <div className="text-center">
              <div className="text-white font-bold text-lg">4.8</div>
              <div className="text-white/80 text-xs flex items-center">
                <StarOutlined className="mr-1" />
                Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-lg">150+</div>
              <div className="text-white/80 text-xs flex items-center">
                <HeartOutlined className="mr-1" />
                Followers
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Shop Avatar (positioned to overlap header beautifully) */}
        <div className="absolute left-8 top-56 z-20">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-2xl ring-4 ring-white">
              <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {shop.avatar ? (
                  <Image 
                    src={shop.avatar.startsWith('http') ? shop.avatar : `${CLOUDINARY_API_URL}${shop.avatar}`} 
                    alt={shop.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShopOutlined className="text-4xl text-gray-400" />
                )}
              </div>
            </div>

            {/* Status Indicator */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Shop Information */}
        <div className="pt-20 pb-8 px-8 pl-8">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{shop.name}</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Active Now</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <UserOutlined />
                    <span>Shop Owner</span>
                  </div>
                </div>
              </div>
            </div>
            
            {shop.description && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
                <p className="text-gray-700 text-lg leading-relaxed">{shop.description}</p>
              </div>
            )}
          </div>

          {/* Shop Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full mr-3"></div>
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <PhoneOutlined className="text-white text-xl" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Phone Number</div>
                    <div className="font-bold text-gray-900 text-lg">{shop.numberPhone}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mt-1">
                    <EnvironmentOutlined className="text-white text-xl" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium mb-1">Address</div>
                    <div className="font-medium text-gray-900 leading-relaxed">
                      <div>{shop.address.street}</div>
                      <div className="text-gray-600">{shop.address.commune}, {shop.address.district}</div>
                      <div className="text-gray-600">{shop.address.city}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner & Actions */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full mr-3"></div>
                Shop Management
              </h3>
              
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <UserOutlined className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Shop Owner</div>
                  <div className="font-bold text-gray-900 text-lg">{shop.ownerName}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleViewProducts}
                    className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  >
                    <EyeOutlined className="text-xl" />
                    <span>View Products</span>
                  </button>
                  
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
