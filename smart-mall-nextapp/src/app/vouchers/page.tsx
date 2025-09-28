"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  GiftOutlined,
  FireOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  TagOutlined,
  CalendarOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

export default function Vouchers() {
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("userEmail");
    
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    
    setIsLoggedIn(true);
    if (email) {
      setUserEmail(email);
    }
  }, [router]);

  const vouchers = [
    {
      id: 1,
      title: "New User Special",
      discount: "50% OFF",
      description: "First purchase discount",
      code: "WELCOME50",
      minOrder: 100,
      expiry: "2025-12-31",
      type: "percentage",
      icon: GiftOutlined,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      claimed: false
    },
    {
      id: 2,
      title: "Flash Sale Voucher",
      discount: "$30 OFF",
      description: "Limited time offer",
      code: "FLASH30",
      minOrder: 200,
      expiry: "2025-10-15",
      type: "fixed",
      icon: ThunderboltOutlined,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      claimed: false
    },
    {
      id: 3,
      title: "VIP Member Exclusive",
      discount: "25% OFF",
      description: "Premium member benefits",
      code: "VIP25",
      minOrder: 150,
      expiry: "2025-11-30",
      type: "percentage",
      icon: CrownOutlined,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      claimed: true
    },
    {
      id: 4,
      title: "Free Shipping",
      discount: "FREE",
      description: "No delivery charges",
      code: "FREESHIP",
      minOrder: 50,
      expiry: "2025-12-25",
      type: "shipping",
      icon: FireOutlined,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      claimed: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GiftOutlined className="text-6xl text-white mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">My Vouchers</h1>
          <p className="text-xl text-white/90">Save more with exclusive deals and discounts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-6 text-center shadow-lg">
            <TagOutlined className="text-4xl text-blue-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">4</div>
            <div className="text-gray-600">Available Vouchers</div>
          </div>
          <div className="bg-white rounded-3xl p-6 text-center shadow-lg">
            <CheckCircleOutlined className="text-4xl text-green-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">1</div>
            <div className="text-gray-600">Used This Month</div>
          </div>
          <div className="bg-white rounded-3xl p-6 text-center shadow-lg">
            <GiftOutlined className="text-4xl text-purple-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">$125</div>
            <div className="text-gray-600">Total Savings</div>
          </div>
        </div>

        {/* Vouchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {vouchers.map((voucher) => {
            const IconComponent = voucher.icon;
            return (
              <div
                key={voucher.id}
                className={`relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                  voucher.claimed ? 'opacity-75' : ''
                }`}
              >
                {/* Background Pattern */}
                <div className={`absolute inset-0 bg-gradient-to-br ${voucher.color} opacity-10`}></div>
                
                {/* Content */}
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${voucher.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <IconComponent className="text-white text-2xl" />
                    </div>
                    
                    {voucher.claimed && (
                      <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        Used
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{voucher.title}</h3>
                    <p className="text-gray-600 mb-4">{voucher.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <TagOutlined />
                        <span>Min. order: ${voucher.minOrder}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarOutlined />
                        <span>Expires: {voucher.expiry}</span>
                      </div>
                    </div>
                  </div>

                  {/* Discount Amount */}
                  <div className="text-center mb-6">
                    <div className={`text-4xl font-black bg-gradient-to-r ${voucher.color} bg-clip-text text-transparent mb-2`}>
                      {voucher.discount}
                    </div>
                    <div className="text-gray-600">Discount</div>
                  </div>

                  {/* Voucher Code */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Voucher Code</div>
                      <div className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                        {voucher.code}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 ${
                      voucher.claimed
                        ? 'bg-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${voucher.color} hover:shadow-lg`
                    }`}
                    disabled={voucher.claimed}
                  >
                    {voucher.claimed ? 'Already Used' : 'Use Now'}
                  </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <GiftOutlined className="text-6xl text-purple-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get More Vouchers</h2>
            <p className="text-xl text-gray-600 mb-8">
              Complete purchases and activities to earn more exclusive vouchers
            </p>
            <button 
              onClick={() => router.push('/home')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}