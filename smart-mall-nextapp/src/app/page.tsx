"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { 
  MobileOutlined,
  LaptopOutlined,
  SkinOutlined,
  HomeOutlined,
  TrophyOutlined,
  BookOutlined,
  ShopOutlined,
  StarFilled,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined
} from "@ant-design/icons";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("userEmail");
    if (loggedIn) {
      setIsLoggedIn(true);
    }
    if (email) {
      setUserEmail(email);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Smart Shopping
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Discover millions of quality products at the best prices. 
                  Fast delivery, secure payment.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  Shop Now
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:border-blue-500 hover:text-blue-500 transition-all duration-200">
                  Learn More
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">10M+</div>
                  <div className="text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">50K+</div>
                  <div className="text-gray-600">Brands</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">5M+</div>
                  <div className="text-gray-600">Customers</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-white/80 rounded-full flex items-center justify-center shadow-2xl">
                    <ShopOutlined className="w-32 h-32 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Product Categories</h2>
            <p className="text-xl text-gray-600">Explore popular categories</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "Smartphones", icon: MobileOutlined, color: "from-blue-500 to-blue-600" },
              { name: "Laptops", icon: LaptopOutlined, color: "from-purple-500 to-purple-600" },
              { name: "Fashion", icon: SkinOutlined, color: "from-pink-500 to-pink-600" },
              { name: "Home & Living", icon: HomeOutlined, color: "from-green-500 to-green-600" },
              { name: "Sports", icon: TrophyOutlined, color: "from-orange-500 to-orange-600" },
              { name: "Books", icon: BookOutlined, color: "from-indigo-500 to-indigo-600" },
            ].map((category, index) => {
              const IconComponent = category.icon;
              return (
              <div
                key={index}
                className="group cursor-pointer"
              >
                <div className={`w-full h-32 bg-gradient-to-br ${category.color} rounded-2xl flex flex-col items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 transform group-hover:scale-105`}>
                  <IconComponent className="text-4xl mb-2" />
                  <span className="font-semibold text-sm">{category.name}</span>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="py-16 bg-gradient-to-r from-red-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Flash Sale</h2>
            <div className="flex items-center justify-center space-x-4 text-white">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">02</div>
                <div className="text-sm">Hours</div>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">45</div>
                <div className="text-sm">Minutes</div>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">30</div>
                <div className="text-sm">Seconds</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Product Image</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Product {item}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl font-bold text-red-500">$299</span>
                  <span className="text-gray-500 line-through">$599</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                </div>
                <p className="text-sm text-gray-600">Sold {Math.floor(Math.random() * 100)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600">Most loved products</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Product Image</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Featured Product {item}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl font-bold text-blue-600">$1,299</span>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarFilled key={star} className="w-4 h-4 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600">(128)</span>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="text-xl font-bold">SmartMall</span>
              </div>
              <p className="text-gray-400">
                Leading e-commerce platform in Vietnam, delivering exceptional shopping experience.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">About SmartMall</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">News</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Customer Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shopping Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Return Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <FacebookOutlined className="text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">
                  <InstagramOutlined className="text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <TwitterOutlined className="text-white" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SmartMall. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
