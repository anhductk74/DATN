import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { apiService } from '../services/api.service';
import { storageService } from '../services/storage.service';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hoặc số điện thoại');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await apiService.login({
        username: username.trim(),
        password: password,
      });

      if (response.status === 'SUCCESS' || response.status === 200) {
        if (!response.data) {
          Alert.alert('Lỗi', 'Không nhận được dữ liệu từ server');
          setIsLoading(false);
          return;
        }
        
        // Kiểm tra xem user có phải là shipper không
        if (!response.data.userInfo.shipper) {
          Alert.alert(
            'Lỗi đăng nhập',
            'Tài khoản này không phải là tài khoản shipper. Vui lòng sử dụng tài khoản shipper để đăng nhập.'
          );
          setIsLoading(false);
          return;
        }

        // Kiểm tra trạng thái shipper
        const shipperStatus = response.data.userInfo.shipper.status;
        if (shipperStatus === 'SUSPENDED') {
          Alert.alert(
            'Tài khoản bị tạm khóa',
            'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.'
          );
          setIsLoading(false);
          return;
        }

        // Lưu tokens và user info
        console.log('LoginScreen: Saving tokens and user info...');
        console.log('LoginScreen: AccessToken:', response.data.accessToken?.substring(0, 20) + '...');
        
        try {
          await storageService.saveTokens(
            response.data.accessToken,
            response.data.refreshToken
          );
          await storageService.saveUserInfo(response.data.userInfo);
          console.log('LoginScreen: Data saved successfully');
          
          // Verify token was saved
          const savedToken = await storageService.getAccessToken();
          console.log('LoginScreen: Verified token exists:', !!savedToken);
          console.log('LoginScreen: Saved token:', savedToken?.substring(0, 20) + '...');
        } catch (saveError) {
          console.error('LoginScreen: Error saving data:', saveError);
          setIsLoading(false);
          Alert.alert('Lỗi', 'Không thể lưu thông tin đăng nhập');
          return;
        }

        setIsLoading(false);
        
        // Navigate to Home Screen
        console.log('LoginScreen: About to call onLoginSuccess callback');
        console.log('LoginScreen: onLoginSuccess is defined:', !!onLoginSuccess);
        
        if (onLoginSuccess) {
          console.log('LoginScreen: Calling onLoginSuccess NOW');
          onLoginSuccess();
          console.log('LoginScreen: onLoginSuccess called successfully');
        } else {
          console.error('LoginScreen: ERROR - onLoginSuccess callback is NOT provided!');
        }
      } else {
        setIsLoading(false);
        Alert.alert('Lỗi', response.message || 'Đăng nhập không thành công');
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🚚</Text>
          </View>
          <Text style={styles.title}>SmartMall Shipper</Text>
          <Text style={styles.subtitle}>Đăng nhập để bắt đầu giao hàng</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email hoặc Số điện thoại</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập email hoặc số điện thoại"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>Bạn chưa có tài khoản?</Text>
            <TouchableOpacity>
              <Text style={styles.helpLink}> Liên hệ quản trị viên</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2025 SmartMall</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F4FD',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#A0C4E8',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  helpText: {
    color: '#666',
    fontSize: 14,
  },
  helpLink: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#E8F4FD',
    fontSize: 12,
    marginTop: 4,
  },
});
