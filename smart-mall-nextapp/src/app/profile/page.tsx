"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {CLOUDINARY_API_URL} from "@/config/config";
import { 
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useAntdApp } from "@/hooks/useAntdApp";
import { userService } from "@/services";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const router = useRouter();
  const { session,status } = useAuth();
  const { message } = useAntdApp();

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "OTHER" as "MALE" | "FEMALE" | "OTHER",
    avatar: "",
    active: false
  });

  const loadUserProfile = useCallback(async () => {
    try {
      const response = await userService.getUserProfile();
      
      if (response.status === 200 && response.data) {
        const userData = response.data;
        
        setProfileData({
          fullName: userData.fullName || "",
          email: userData.username || "",
          phoneNumber: userData.phoneNumber || "",
          dateOfBirth: userData.dateOfBirth || "",
          gender: userData.gender || "OTHER",
          avatar: userData.avatar || "",
          active: userData.isActive || false
        });
      }
    } catch (error) {
      console.error("Load profile error:", error);
      console.log("Falling back to session data");
      
      // Fallback to session data if API fails
      if (session?.user) {
        setProfileData({
          fullName: session.user?.fullName || "",
          email: session.user?.email || "",
          phoneNumber: session.user?.phoneNumber || "",
          dateOfBirth: session.user?.dateOfBirth || "",
          gender: session.user?.gender || "OTHER",
          avatar: session.user?.avatar || "",
          active: session.user?.isActive || false
        });
      }
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user) {
      // First try to load complete profile from API
      loadUserProfile();
    }
  }, [session, status, router, loadUserProfile,profileData.avatar]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

  };

  const handleSaveProfile = async () => {
    if (!profileData.fullName.trim()) {
      message.error("Full name is required!");
      return;
    }

    setIsLoading(true);
    try {
      
      await userService.updateUserProfile({
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber, // Backend expects 'phone' not 'phoneNumber'
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender
      });

      message.success("Profile updated successfully!");
      setIsEditing(false);
      // Reload profile data after successful update
      loadUserProfile();
    } catch (error) {
      console.error("Update profile error:", error);
      message.error("Failed to update profile!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error("Please select an image file!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error("File size must be less than 5MB!");
      return;
    }

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('profileData', JSON.stringify({}));
      formData.append('avatar', file);

      const response = await userService.uploadAvatar(formData);
      setProfileData(prev => ({
        ...prev,
        avatar: response.data.avatarUrl
      }));

      message.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Upload avatar error:", error);
      message.error("Failed to upload avatar!");
    } finally {
      setAvatarLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingOutlined className="text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={() => router.push("/home")} className="hover:text-blue-600 transition-colors">
              Home
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">My Profile</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute -bottom-16 left-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    {profileData.avatar ? (
                      <Image 
                        src={`${CLOUDINARY_API_URL}${profileData.avatar}`} 
                        alt="Avatar" 
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserOutlined className="text-4xl text-gray-500" />
                    )}
                  </div>
                </div>
                
                {/* Avatar Upload Button */}
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg group-hover:scale-110 transform duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={avatarLoading}
                  />
                  {avatarLoading ? (
                    <LoadingOutlined className="text-white text-sm animate-spin" />
                  ) : (
                    <CameraOutlined className="text-white text-sm" />
                  )}
                </label>
              </div>
            </div>
            
            {/* Edit Button */}
            <div className="absolute top-6 right-6">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-200 shadow-md"
                >
                  <EditOutlined />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-200"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <LoadingOutlined className="animate-spin" />
                    ) : (
                      <SaveOutlined />
                    )}
                    <span>{isLoading ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 pb-8 px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profileData.fullName || "User Profile"}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
                <span>Member since 2024</span>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <UserOutlined className="text-blue-600" />
                  <span>Full Name</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {profileData.fullName || "Not provided"}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <MailOutlined className="text-blue-600" />
                  <span>Email</span>
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center justify-between">
                  <span>{profileData.email}</span>
                  <CheckCircleOutlined className="text-green-500" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <PhoneOutlined className="text-blue-600" />
                  <span>Phone Number</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {profileData.phoneNumber || "Not provided"}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <CalendarOutlined className="text-blue-600" />
                  <span>Date of Birth</span>
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {profileData.dateOfBirth || "Not provided"}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <UserOutlined className="text-blue-600" />
                  <span>Gender</span>
                </label>
                {isEditing ? (
                  <select
                    value={profileData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="OTHER">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center space-x-2">
                    {profileData.gender === "MALE" && <ManOutlined className="text-blue-500" />}
                    {profileData.gender === "FEMALE" && <WomanOutlined className="text-pink-500" />}
                    <span>
                      {profileData.gender === "MALE" ? "Male" : 
                       profileData.gender === "FEMALE" ? "Female" : "Prefer not to say"}
                    </span>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <span>Account Status</span>
                </label>
                <div className="px-4 py-3 bg-green-50 rounded-xl text-green-900 flex items-center space-x-2">
                  <CheckCircleOutlined className="text-green-500" />
                  <span>Verified Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Account Security */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Password</div>
                  <div className="text-sm text-gray-500">Last changed 30 days ago</div>
                </div>
                <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-500">Not enabled</div>
                </div>
                <button className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-bold text-blue-600">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Wishlist Items</span>
                <span className="font-bold text-pink-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reviews Written</span>
                <span className="font-bold text-green-600">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-bold text-purple-600">2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}