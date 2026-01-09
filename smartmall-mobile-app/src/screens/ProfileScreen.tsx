import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { userService, UserProfile } from '../services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getCloudinaryUrl } from '../config/config';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showFullAvatar, setShowFullAvatar] = useState(false);
  
  // Edit form
  const [editFullName, setEditFullName] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editGender, setEditGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const currentPasswordInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await userService.getProfile(token);
      
      if (response.success && response.data) {
        setProfile(response.data);
        setEditFullName(response.data.fullName || '');
        setEditPhoneNumber(response.data.phoneNumber || '');
        setEditGender(response.data.gender || 'MALE');
        setEditDateOfBirth(response.data.dateOfBirth || '');
        if (response.data.dateOfBirth) {
          setSelectedDate(new Date(response.data.dateOfBirth));
        }
        setAvatarUri(response.data.avatar ? getCloudinaryUrl(response.data.avatar) : null);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editFullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!editPhoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!editDateOfBirth) {
      Alert.alert('Error', 'Please select your date of birth');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const response = await userService.updateProfile(
        token,
        {
          fullName: editFullName,
          phoneNumber: editPhoneNumber,
          gender: editGender,
          dateOfBirth: editDateOfBirth,
        },
        avatarUri && !avatarUri.startsWith('http') ? avatarUri : undefined
      );

      if (response.success && response.data) {
        setProfile(response.data);
        if (response.data.avatar) {
          setAvatarUri(getCloudinaryUrl(response.data.avatar));
        }
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickFromLibrary = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'We need photo library access to select an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Library error:', error);
      Alert.alert('Error', 'Failed to pick image: ' + (error as Error).message);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera access to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo: ' + (error as Error).message);
    }
  };

  const handleUploadAvatar = async (uri: string) => {
    try {
      setIsUploadingAvatar(true);
      const token = await AsyncStorage.getItem('accessToken');
      if (!token || !profile) return;

      // API requires profileData even when only updating avatar
      const response = await userService.updateProfile(
        token,
        {
          fullName: profile.fullName || '',
          phoneNumber: profile.phoneNumber || '',
          gender: profile.gender || 'MALE',
          dateOfBirth: profile.dateOfBirth || '',
        },
        uri
      );

      if (response.success && response.data) {
        setProfile(response.data);
        if (response.data.avatar) {
          setAvatarUri(getCloudinaryUrl(response.data.avatar));
        }
        Alert.alert('Success', 'Avatar updated successfully');
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setEditDateOfBirth(formattedDate);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const response = await userService.changePassword(token, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.success) {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Success', 'Password changed successfully');
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadProfile}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => setShowAvatarOptions(true)}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{profile?.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{profile?.username}</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editFullName}
                  onChangeText={setEditFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={editPhoneNumber}
                  onChangeText={setEditPhoneNumber}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Gender *</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      editGender === 'MALE' && styles.genderButtonActive,
                    ]}
                    onPress={() => setEditGender('MALE')}
                  >
                    <Ionicons
                      name="male"
                      size={20}
                      color={editGender === 'MALE' ? '#fff' : '#666'}
                    />
                    <Text
                      style={[
                        styles.genderButtonText,
                        editGender === 'MALE' && styles.genderButtonTextActive,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      editGender === 'FEMALE' && styles.genderButtonActive,
                    ]}
                    onPress={() => setEditGender('FEMALE')}
                  >
                    <Ionicons
                      name="female"
                      size={20}
                      color={editGender === 'FEMALE' ? '#fff' : '#666'}
                    />
                    <Text
                      style={[
                        styles.genderButtonText,
                        editGender === 'FEMALE' && styles.genderButtonTextActive,
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      editGender === 'OTHER' && styles.genderButtonActive,
                    ]}
                    onPress={() => setEditGender('OTHER')}
                  >
                    <Ionicons
                      name="transgender"
                      size={20}
                      color={editGender === 'OTHER' ? '#fff' : '#666'}
                    />
                    <Text
                      style={[
                        styles.genderButtonText,
                        editGender === 'OTHER' && styles.genderButtonTextActive,
                      ]}
                    >
                      Other
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of Birth *</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={editDateOfBirth ? styles.dateText : styles.datePlaceholder}>
                    {editDateOfBirth || 'Select date of birth'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}
              </View>

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsEditing(false);
                    setEditFullName(profile?.fullName || '');
                    setEditPhoneNumber(profile?.phoneNumber || '');
                    setEditGender(profile?.gender || 'MALE');
                    setEditDateOfBirth(profile?.dateOfBirth || '');
                    if (profile?.dateOfBirth) {
                      setSelectedDate(new Date(profile.dateOfBirth));
                    }
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleUpdateProfile}
                  disabled={isLoading}
                >
                  <Text style={styles.saveButtonText}>
                    {isLoading ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile?.username}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>
                  {profile?.phoneNumber || 'Not set'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>
                  {profile?.gender === 'MALE' ? 'Male' : profile?.gender === 'FEMALE' ? 'Female' : profile?.gender === 'OTHER' ? 'Other' : 'Not set'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {profile?.dateOfBirth || 'Not set'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Addresses')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="location" size={20} color="#2563eb" />
              </View>
              <Text style={styles.menuText}>My Addresses</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="lock-closed" size={20} color="#2563eb" />
              </View>
              <Text style={styles.menuText}>Change Password</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="notifications" size={20} color="#2563eb" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="help-circle" size={20} color="#2563eb" />
              </View>
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Current Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={currentPasswordInputRef}
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showCurrentPassword}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => {
                    setShowCurrentPassword(!showCurrentPassword);
                    setTimeout(() => currentPasswordInputRef.current?.focus(), 0);
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.eyeIcon}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={newPasswordInputRef}
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => {
                    setShowNewPassword(!showNewPassword);
                    setTimeout(() => newPasswordInputRef.current?.focus(), 0);
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => {
                    setShowConfirmPassword(!showConfirmPassword);
                    setTimeout(() => confirmPasswordInputRef.current?.focus(), 0);
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Changing...' : 'Change'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Avatar Options Modal */}
      <Modal
        visible={showAvatarOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatarOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAvatarOptions(false)}
        >
          <Pressable style={styles.avatarOptionsModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.avatarOptionsTitle}>Avatar Options</Text>
            
            {avatarUri && (
              <TouchableOpacity
                style={styles.avatarOptionButton}
                onPress={() => {
                  setShowAvatarOptions(false);
                  setShowFullAvatar(true);
                }}
              >
                <Ionicons name="eye-outline" size={24} color="#2563eb" />
                <Text style={styles.avatarOptionText}>View Image</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.avatarOptionButton}
              onPress={() => {
                setShowAvatarOptions(false);
                setTimeout(() => handleTakePhoto(), 600);
              }}
            >
              <Ionicons name="camera-outline" size={24} color="#2563eb" />
              <Text style={styles.avatarOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarOptionButton}
              onPress={() => {
                setShowAvatarOptions(false);
                setTimeout(() => handlePickFromLibrary(), 600);
              }}
            >
              <Ionicons name="images-outline" size={24} color="#2563eb" />
              <Text style={styles.avatarOptionText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.avatarOptionButton, styles.avatarOptionCancel]}
              onPress={() => setShowAvatarOptions(false)}
            >
              <Text style={styles.avatarOptionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Full Avatar View Modal */}
      <Modal
        visible={showFullAvatar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullAvatar(false)}
      >
        <Pressable
          style={styles.fullAvatarOverlay}
          onPress={() => setShowFullAvatar(false)}
        >
          <View style={styles.fullAvatarContainer}>
            {avatarUri && (
              <Image source={{ uri: avatarUri }} style={styles.fullAvatar} />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFullAvatar(false)}
            >
              <Ionicons name="close-circle" size={40} color="#fff" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  editForm: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  genderButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  genderButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  datePlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 14,
    color: '#333',
  },
  menuArrow: {
    fontSize: 24,
    color: '#999',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ff4757',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    paddingRight: 50,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  avatarOptionsModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  avatarOptionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  avatarOptionCancel: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 8,
  },
  avatarOptionCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  fullAvatarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullAvatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullAvatar: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});
