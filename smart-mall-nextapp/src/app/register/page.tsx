"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { signIn } from "next-auth/react";
import { 
  UserOutlined, 
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  GoogleOutlined,
  FacebookOutlined,
  ShopOutlined,
  MailOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import { useAntdApp } from "@/hooks/useAntdApp";

// Validation schema
const registerSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least 1 uppercase, 1 lowercase and 1 number"
    ),
  confirmPassword: yup
    .string()
    .required("Password confirmation is required")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  agreeTerms: yup
    .boolean()
    .required("You must agree to the terms of service")
    .oneOf([true], "You must agree to the terms of service")
});

type RegisterFormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = useAntdApp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.email,
          password: data.password,
          fullName: data.fullName,
          phoneNumber: data.phone,
        }),
      });

      const result = await response.json();

      if (result.status === 200) {
        // Show intermediate message
        message.loading("Registration successful! Logging you in...", 1);
        
        // Small delay to show the message
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Automatically log in the user after successful registration
        const loginResult = await signIn("credentials", {
          username: data.email,
          password: data.password,
          redirect: false,
        });

        if (loginResult?.error) {
          message.error("Registration successful but login failed. Please login manually.");
          router.push("/login");
        } else {
          message.success("Welcome to SmartMall! 🎉");
          router.push("/home");
        }
      } else {
        message.error(result.message || "Registration failed. Please try again!");
      }
    } catch (error) {
      console.error("Registration error:", error);
      message.error("Registration failed. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signIn("google", {
        redirect: false,
      });

      if (result?.error) {
        message.error("Google signup failed. Please try again!");
        return;
      }

      message.success("Welcome to SmartMall! 🎉");
      router.push("/home");
    } catch (error) {
      console.error("Google signup error:", error);
      message.error("Google signup failed. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Creating your account...</p>
          </div>
        </div>
      )}
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo và Title */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <ShopOutlined className="text-white text-4xl transform -rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                SmartMall
              </span>
              <span className="text-sm text-gray-500 font-medium">Shopping Made Smart</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Create New Account</h2>
          <p className="text-gray-600 text-lg">Join our smart shopping community and start exploring!</p>
        </div>

        {/* Form đăng ký */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50 hover:shadow-3xl transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name field */}
            <div className="group">
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  {...register("fullName")}
                  className={`appearance-none relative block w-full px-4 py-4 pl-14 pr-12 border-2 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                    errors.fullName 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 animate-shake" 
                      : "border-gray-200 focus:border-indigo-500 hover:border-gray-300 focus:ring-indigo-500/20"
                  }`}
                  placeholder="Enter your full name"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <UserOutlined className={`text-lg transition-colors ${
                    errors.fullName ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-500"
                  }`} />
                </div>
                {/* Success/Error Icon */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {errors.fullName ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {errors.fullName && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 animate-fade-in">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 leading-5">{errors.fullName.message}</p>
                </div>
              )}
            </div>

            {/* Email field */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className={`appearance-none relative block w-full px-4 py-4 pl-14 pr-12 border-2 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                    errors.email 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 animate-shake" 
                      : "border-gray-200 focus:border-indigo-500 hover:border-gray-300 focus:ring-indigo-500/20"
                  }`}
                  placeholder="example@email.com"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <MailOutlined className={`text-lg transition-colors ${
                    errors.email ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-500"
                  }`} />
                </div>
                {/* Success/Error Icon */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {errors.email ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {errors.email && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 animate-fade-in">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 leading-5">{errors.email.message}</p>
                </div>
              )}
            </div>

            {/* Phone field */}
            <div className="group">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className={`appearance-none relative block w-full px-4 py-4 pl-14 pr-12 border-2 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                    errors.phone 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 animate-shake" 
                      : "border-gray-200 focus:border-indigo-500 hover:border-gray-300 focus:ring-indigo-500/20"
                  }`}
                  placeholder="Enter your phone number"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <PhoneOutlined className={`text-lg transition-colors ${
                    errors.phone ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-500"
                  }`} />
                </div>
                {/* Success/Error Icon */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {errors.phone ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {errors.phone && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 animate-fade-in">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 leading-5">{errors.phone.message}</p>
                </div>
              )}
            </div>

            {/* Password field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                  className={`appearance-none relative block w-full px-4 py-4 pl-14 pr-14 border-2 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                    errors.password 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-indigo-500 hover:border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <LockOutlined className={`text-lg transition-colors ${
                    errors.password ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-500"
                  }`} />
                </div>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeInvisibleOutlined className="text-lg" /> : <EyeOutlined className="text-lg" />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 animate-fade-in">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 leading-5">{errors.password.message}</p>
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className={`appearance-none relative block w-full px-4 py-4 pl-14 pr-14 border-2 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                    errors.confirmPassword 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-indigo-500 hover:border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <LockOutlined className={`text-lg transition-colors ${
                    errors.confirmPassword ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-500"
                  }`} />
                </div>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeInvisibleOutlined className="text-lg" /> : <EyeOutlined className="text-lg" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 animate-fade-in">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 leading-5">{errors.confirmPassword.message}</p>
                </div>
              )}
            </div>

            {/* Terms and conditions */}
            <div className="py-2">
              <div className="flex items-start">
                <input
                  id="agree-terms"
                  type="checkbox"
                  {...register("agreeTerms")}
                  className={`h-5 w-5 mt-0.5 focus:ring-2 border-2 rounded-lg transition-colors ${
                    errors.agreeTerms 
                      ? "text-red-600 focus:ring-red-500 border-red-500" 
                      : "text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  }`}
                />
                <label htmlFor="agree-terms" className="ml-3 block text-sm font-medium text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.agreeTerms && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 animate-fade-in">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 leading-5">{errors.agreeTerms.message}</p>
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-2xl text-white transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
                  loading || isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-2xl active:scale-95"
                }`}
              >
                {loading || isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-pulse-ring absolute"></div>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="ml-3">Creating Account...</span>
                  </div>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <div className="w-5 h-5 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors"></div>
                    </span>
                    Create Account
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-white/80 text-gray-500 font-medium rounded-full">Or sign up with</span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-2xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                ) : (
                  <GoogleOutlined className="text-red-500 text-xl" />
                )}
                <span className="ml-2">{loading ? "Processing..." : "Google"}</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-2xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 opacity-50 cursor-not-allowed"
                disabled
              >
                <FacebookOutlined className="text-blue-600 text-xl" />
                <span className="ml-2">Facebook</span>
              </button>
            </div>

            {/* Login link */}
            <div className="text-center pt-4">
              <span className="text-gray-600 text-base">Already have an account? </span>
              <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-800 transition-all duration-200 hover:underline text-base">
                Sign in now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}