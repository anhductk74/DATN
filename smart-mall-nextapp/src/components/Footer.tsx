"use client";

import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  HeartFilled,
} from "@ant-design/icons";

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-blue-100">
      {/* ================= NEWSLETTER ================= */}
      <div className="border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-6 py-14 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Stay Updated
          </h3>
          <p className="text-blue-300 max-w-2xl mx-auto mb-8">
            Subscribe to receive new arrivals, exclusive offers and tech updates.
          </p>

          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-blue-900 border border-blue-800
                         rounded-l-lg focus:outline-none focus:ring-2
                         focus:ring-blue-500 text-white placeholder-blue-400"
            />
            <button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500
                         rounded-r-lg font-semibold transition"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN FOOTER ================= */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* ===== Brand ===== */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl">
                S
              </div>
              <span className="text-2xl font-bold">
                SmartMall
              </span>
            </div>

            <p className="text-blue-300 leading-relaxed">
              A modern technology marketplace delivering quality products,
              reliable service, and long-term value.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <EnvironmentOutlined className="text-blue-400" />
                <span>123 Tech Street, Innovation City</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneOutlined className="text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MailOutlined className="text-blue-400" />
                <span>support@smartmall.com</span>
              </div>
            </div>
          </div>

          {/* ===== Quick Links ===== */}
          <div>
            <h4 className="text-lg font-semibold mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3 text-blue-300">
              {[
                "About Us",
                "Careers",
                "Press",
                "Sustainability",
                "Affiliate Program",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-white transition"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== Customer Care ===== */}
          <div>
            <h4 className="text-lg font-semibold mb-6">
              Customer Care
            </h4>
            <ul className="space-y-3 text-blue-300">
              {[
                "Help Center",
                "Order Tracking",
                "Shipping Information",
                "Returns & Exchanges",
                "Payment Methods",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-white transition"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== Connect ===== */}
          <div>
            <h4 className="text-lg font-semibold mb-6">
              Connect With Us
            </h4>

            <div className="flex gap-4 mb-8">
              {[
                { icon: FacebookOutlined },
                { icon: InstagramOutlined },
                { icon: TwitterOutlined },
                { icon: YoutubeOutlined },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <a
                    key={i}
                    href="#"
                    className="w-12 h-12 flex items-center justify-center
                               rounded-full bg-blue-900 border border-blue-800
                               hover:bg-blue-700 hover:border-blue-600
                               hover:-translate-y-1 hover:shadow-lg
                               transition-all duration-300"
                  >
                    <Icon className="text-xl text-blue-300 hover:text-white transition" />
                  </a>
                );
              })}
            </div>

            <p className="text-sm text-blue-300 mb-3">
              Download Our App
            </p>

            <div className="space-y-2">
              <button
                className="w-full bg-blue-900 hover:bg-blue-800
                           border border-blue-800 rounded-lg
                           px-4 py-2 text-left transition"
              >
                <div className="text-xs text-blue-300">
                  Download on the
                </div>
                <div className="font-semibold">
                  App Store
                </div>
              </button>

              <button
                className="w-full bg-blue-900 hover:bg-blue-800
                           border border-blue-800 rounded-lg
                           px-4 py-2 text-left transition"
              >
                <div className="text-xs text-blue-300">
                  Get it on
                </div>
                <div className="font-semibold">
                  Google Play
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="border-t border-blue-900 bg-blue-950">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-400">
          <div className="flex items-center gap-2">
            © 2025 SmartMall
            <HeartFilled className="text-red-500" />
            Built with care
          </div>

          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms
            </a>
            <a href="#" className="hover:text-white transition">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
