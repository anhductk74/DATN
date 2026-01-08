"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { signIn, getSession } from "next-auth/react";
import { 
  UserOutlined, 
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  GoogleOutlined,
  FacebookOutlined,
  ShopOutlined
} from "@ant-design/icons";
import { useAntdApp } from "@/hooks/useAntdApp";

// Validation schema
const loginSchema = yup.object({
  username: yup
    .string()
    .required("Username/Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: yup.boolean().default(false)
});

type LoginFormData = {
  username: string;
  password: string;
  rememberMe: boolean;
};

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/home';
  const { message } = useAntdApp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        message.error("Username/Email or Password is incorrect. Please try again!");
        return;
      }

      message.success("Login successful!");
      router.push(callbackUrl);
    } catch (error) {
      console.error("Login error:", error);
      message.error("Login failed. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        message.error("Google login failed. Please try again!");
        setLoading(false);
        return;
      }

      // Only show success and redirect if login was successful
      if (result?.ok) {
        message.success("Login successful!");
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Google login error:", error);
      message.error("Google login failed. Please try again!");
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo và Title */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
              <ShopOutlined className="text-white text-4xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-blue-600">
                SmartMall
              </span>
              <span className="text-sm text-gray-500 font-medium">Shopping Made Smart</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome Back!</h2>
          <p className="text-gray-600 text-lg">Sign in to continue your shopping journey</p>
        </div>

        {/* Form đăng nhập */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50 hover:shadow-3xl transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Username field */}
            <div className="group">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors">
                Username/Email Address
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  {...register("username")}
                  className={`appearance-none relative block w-full px-4 py-4 pl-14 pr-12 border-2 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                    errors.username 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 animate-shake" 
                      : "border-gray-200 focus:border-indigo-500 hover:border-gray-300 focus:ring-indigo-500/20"
                  }`}
                  placeholder="example@email.com or username"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <UserOutlined className={`text-lg transition-colors ${
                    errors.username ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-500"
                  }`} />
                </div>
                {/* Success/Error Icon */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {errors.username ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {errors.username && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 animate-fade-in">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 leading-5">{errors.username.message}</p>
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
                  autoComplete="current-password"
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

            {/* Remember me và Forgot password */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 focus:ring-2 border-2 border-gray-300 rounded-lg transition-colors"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-800 transition-all hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-2xl text-white transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                  loading || isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                }`}
              >
                {loading || isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-pulse-ring absolute"></div>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="ml-3">Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <div className="w-5 h-5 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors"></div>
                    </span>
                    Sign In
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
                <span className="px-6 bg-white/80 text-gray-500 font-medium rounded-full">Or sign in with</span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full inline-flex justify-center items-center py-3 px-4 border-2 rounded-2xl bg-white text-sm font-semibold transition-all duration-200 transform ${
                  loading 
                    ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-70" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:scale-105 active:scale-95"
                }`}
              >
                {loading ? (
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <GoogleOutlined className="text-red-500 text-xl" />
                )}
                <span className="ml-2">{loading ? "Processing..." : "Google"}</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-2xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <FacebookOutlined className="text-blue-600 text-xl" />
                <span className="ml-2">Facebook</span>
              </button>
            </div>

            {/* Sign up link */}
            <div className="text-center pt-4">
              <span className="text-gray-600 text-base">Don&apos;t have an account? </span>
              <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-all duration-200 hover:underline text-base">
                Sign up now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}