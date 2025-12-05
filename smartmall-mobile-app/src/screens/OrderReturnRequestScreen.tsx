import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import orderReturnRequestService from '../services/OrderReturnRequestService';

type OrderReturnRequestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderReturnRequest'>;
type OrderReturnRequestScreenRouteProp = RouteProp<RootStackParamList, 'OrderReturnRequest'>;

interface OrderReturnRequestScreenProps {
  navigation: OrderReturnRequestScreenNavigationProp;
  route: OrderReturnRequestScreenRouteProp;
}

const RETURN_REASONS = [
  'Product does not match description',
  'Product is defective/damaged',
  'Wrong size',
  'Wrong color',
  'Received wrong product',
  'Poor product quality',
  'Changed mind',
  'Other reason',
];

export default function OrderReturnRequestScreen({ navigation, route }: OrderReturnRequestScreenProps) {
  const { orderId } = route.params;
  
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showImageOptions = () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images');
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      Alert.alert(
        'Add Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Gallery', onPress: pickImage },
        ],
        { cancelable: true }
      );
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled && result.assets) {
      setImages(prev => [...prev, ...result.assets].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages(prev => [...prev, result.assets[0]].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const finalReason = selectedReason === 'Other reason' ? otherReason : selectedReason;
    
    console.log('[Return Request] Starting submission...');
    console.log('[Return Request] Order ID:', orderId);
    console.log('[Return Request] Selected Reason:', selectedReason);
    console.log('[Return Request] Final Reason:', finalReason);
    console.log('[Return Request] Images Count:', images.length);
    
    if (!finalReason.trim()) {
      Alert.alert('Missing Information', 'Please select or enter a reason for return');
      return;
    }

    if (selectedReason === 'Other reason' && otherReason.trim().length < 10) {
      Alert.alert('Invalid Reason', 'Please provide a detailed reason (at least 10 characters)');
      return;
    }

    const executeSubmit = async () => {
      setIsSubmitting(true);
      try {
        console.log('[Return Request] Fetching user info from AsyncStorage...');
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        console.log('[Return Request] User info string:', userInfoStr ? 'Found' : 'Not found');
        
        if (!userInfoStr) {
          console.error('[Return Request] User info not found in AsyncStorage');
          Alert.alert('Error', 'User not found. Please login again.');
          setIsSubmitting(false);
          return;
        }

        const userInfo = JSON.parse(userInfoStr);
        const userId = userInfo.id;
        console.log('[Return Request] User ID:', userId);

        const imageData = images.map((img, index) => {
        console.log(`[Return Request] Image ${index} original:`, {
          uri: img.uri,
          mimeType: img.mimeType,
          fileName: img.fileName
        });          return {
            uri: img.uri,
            mimeType: img.mimeType || "image/jpeg",
            fileName: img.fileName || `image_${Date.now()}_${index}.jpg`,
          };
        });
        console.log('[Return Request] Image data prepared:', imageData.length, 'images');
        console.log('[Return Request] Image data details:', JSON.stringify(imageData, null, 2));
        console.log('[Return Request] Calling API with params:', { orderId, userId, reason: finalReason, imagesCount: imageData.length });

        const response = await orderReturnRequestService.createReturnRequest(
          orderId,
          userId,
          finalReason,
          imageData
        );

        console.log('[Return Request] API Response:', JSON.stringify(response, null, 2));

        if (response.success) {
          console.log('[Return Request] Success! Request created.');
          Alert.alert(
            'Success',
            'Return request submitted successfully. We will review your request soon.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        } else {
          console.error('[Return Request] API returned error:', response.message);
          Alert.alert('Error', response.message || 'Failed to submit return request');
        }
      } catch (error) {
        console.error('[Return Request] Exception caught:', error);
        console.error('[Return Request] Error details:', JSON.stringify(error, null, 2));
        if (error instanceof Error) {
          console.error('[Return Request] Error message:', error.message);
          console.error('[Return Request] Error stack:', error.stack);
        }
        Alert.alert('Error', 'An unexpected error occurred');
      } finally {
        console.log('[Return Request] Setting isSubmitting to false');
        setIsSubmitting(false);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Submit Return Request',
          message: 'Are you sure you want to submit this return request?',
          options: ['Cancel', 'Submit'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            executeSubmit();
          }
        }
      );
    } else {
      Alert.alert(
        'Submit Return Request',
        'Are you sure you want to submit this return request?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit',
            onPress: executeSubmit,
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color="#2563eb" />
          <Text style={styles.infoBannerText}>
            Please provide a detailed reason for your return request. Our team will review it within 24-48 hours.
          </Text>
        </View>

        {/* Reason Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Return *</Text>
          <Text style={styles.sectionSubtitle}>Select the reason that best describes your situation</Text>
          
          <View style={styles.reasonsList}>
            {RETURN_REASONS.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={styles.reasonOptionLeft}>
                  <Ionicons
                    name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={selectedReason === reason ? '#2563eb' : '#999'}
                  />
                  <Text
                    style={[
                      styles.reasonOptionText,
                      selectedReason === reason && styles.reasonOptionTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Reason Input */}
        {selectedReason === 'Other reason' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Please Specify *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter your reason for return (minimum 10 characters)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={otherReason}
              onChangeText={setOtherReason}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCounter}>{otherReason.length}/500</Text>
          </View>
        )}

        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Add photos to support your return request (up to 5 images)
          </Text>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.uploadedImageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4757" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {images.length < 5 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={showImageOptions}>
              <Ionicons name="camera" size={32} color="#2563eb" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
              <Text style={styles.addPhotoSubtext}>
                {images.length}/5 images
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Return Guidelines</Text>
          <View style={styles.guidelinesList}>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.guidelineText}>
                Items must be unused and in original packaging
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.guidelineText}>
                Return request must be made within 7 days of delivery
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.guidelineText}>
                Include all tags, labels, and accessories
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.guidelineText}>
                Refund will be processed within 5-7 business days
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedReason || isSubmitting || (selectedReason === 'Other reason' && otherReason.trim().length < 10)) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedReason || isSubmitting || (selectedReason === 'Other reason' && otherReason.trim().length < 10)}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Return Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    marginBottom: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1976d2',
    marginLeft: 12,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  reasonsList: {
    gap: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  reasonOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f8ff',
  },
  reasonOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reasonOptionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  reasonOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    backgroundColor: '#fff',
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  uploadedImageContainer: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addPhotoButton: {
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafe',
  },
  addPhotoText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 8,
  },
  addPhotoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  guidelinesList: {
    gap: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guidelineText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
