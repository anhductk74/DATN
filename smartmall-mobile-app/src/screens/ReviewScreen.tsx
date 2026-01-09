import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/AppNavigator';
import { reviewService, Review } from '../services/ReviewService';
import { orderService, Order, OrderItem } from '../services/OrderService';
import { getCloudinaryUrl } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ReviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Review'>;
type ReviewScreenRouteProp = RouteProp<RootStackParamList, 'Review'>;

interface ReviewScreenProps {
  navigation: ReviewScreenNavigationProp;
  route: ReviewScreenRouteProp;
}

interface ProductReviewState {
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  images: ImagePicker.ImagePickerAsset[];
}

export default function ReviewScreen({ navigation, route }: ReviewScreenProps) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [productReviews, setProductReviews] = useState<ProductReviewState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrder(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
        
        // Initialize review states for each product
        const initialReviews = response.data.items.map((item: OrderItem) => ({
          productId: item.productId || item.variant.id,
          productName: item.productName,
          productImage: item.productImage,
          rating: 5,
          comment: '',
          images: [],
        }));
        setProductReviews(initialReviews);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRating = (productId: string, rating: number) => {
    setProductReviews(prev =>
      prev.map(review =>
        review.productId === productId ? { ...review, rating } : review
      )
    );
  };

  const updateComment = (productId: string, comment: string) => {
    setProductReviews(prev =>
      prev.map(review =>
        review.productId === productId ? { ...review, comment } : review
      )
    );
  };

  const pickImage = async (productId: string) => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      setProductReviews(prev =>
        prev.map(review => {
          if (review.productId === productId) {
            const newImages = [...review.images, ...result.assets].slice(0, 5);
            return { ...review, images: newImages };
          }
          return review;
        })
      );
    }
  };

  const takePhoto = async (productId: string) => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access camera');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setProductReviews(prev =>
        prev.map(review => {
          if (review.productId === productId) {
            const newImages = [...review.images, result.assets[0]].slice(0, 5);
            return { ...review, images: newImages };
          }
          return review;
        })
      );
    }
  };

  const removeImage = (productId: string, imageIndex: number) => {
    setProductReviews(prev =>
      prev.map(review => {
        if (review.productId === productId) {
          const newImages = review.images.filter((_, idx) => idx !== imageIndex);
          return { ...review, images: newImages };
        }
        return review;
      })
    );
  };

  const showImageOptions = (productId: string) => {
    if (Platform.OS === 'ios') {
      // iOS: Use native ActionSheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto(productId);
          } else if (buttonIndex === 2) {
            pickImage(productId);
          }
        }
      );
    } else {
      // Android: Use Alert
      Alert.alert(
        'Add Photo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: () => takePhoto(productId),
          },
          {
            text: 'Choose from Gallery',
            onPress: () => pickImage(productId),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleSubmitReviews = async () => {
    // Validate all reviews have comments
    const emptyComments = productReviews.filter(r => !r.comment.trim());
    if (emptyComments.length > 0) {
      Alert.alert('Required', 'Please write a review for all products');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get userId from AsyncStorage
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('Error', 'User not found');
        return;
      }
      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo.id;
      
      // Submit all reviews
      const promises = productReviews.map(review => {
        const form = {
          userId,
          productId: review.productId,
          orderId,
          rating: review.rating,
          comment: review.comment.trim(),
          images: review.images.map(img => ({
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: img.fileName || `review_${Date.now()}.jpg`,
          })),
        };
        return reviewService.createReview(form);
      });

      const results = await Promise.all(promises);
      
      // Check if all succeeded
      const allSuccess = results.every(r => r.success);
      
      if (allSuccess) {
        Alert.alert(
          'Success',
          'Thank you for your reviews!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Some reviews failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting reviews:', error);
      Alert.alert('Error', 'Failed to submit reviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (productId: string, currentRating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => updateRating(productId, star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={32}
              color={star <= currentRating ? '#ffc107' : '#e0e0e0'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderProductReview = (item: ProductReviewState, index: number) => {
    return (
      <View style={styles.reviewCard} key={item.productId}>
        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productImageContainer}>
            {item.productImage ? (
              <Image
                source={{ uri: getCloudinaryUrl(item.productImage) }}
                style={styles.productImage}
              />
            ) : (
              <View style={[styles.productImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={32} color="#ccc" />
              </View>
            )}
          </View>
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.productName}
            </Text>
            <Text style={styles.productLabel}>Product {index + 1} of {productReviews.length}</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionLabel}>Rate this product</Text>
          {renderStars(item.productId, item.rating)}
          <Text style={styles.ratingText}>
            {item.rating === 5 && '⭐ Excellent!'}
            {item.rating === 4 && '😊 Great!'}
            {item.rating === 3 && '🙂 Good'}
            {item.rating === 2 && '😐 Fair'}
            {item.rating === 1 && '😕 Poor'}
          </Text>
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionLabel}>Share your experience</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us what you think about this product..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={item.comment}
            onChangeText={(text) => updateComment(item.productId, text)}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{item.comment.length}/500</Text>
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionLabel}>Add Photos (Optional)</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
            {/* Uploaded Images */}
            {item.images.map((image, idx) => (
              <View key={idx} style={styles.uploadedImageContainer}>
                <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(item.productId, idx)}
                >
                  <Ionicons name="close-circle" size={24} color="#f44336" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Photo Button */}
            {item.images.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => showImageOptions(item.productId)}
              >
                <Ionicons name="camera" size={32} color="#999" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
                <Text style={styles.photoCountText}>{item.images.length}/5</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Write Review</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Review</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Order Info Banner */}
      <View style={styles.orderBanner}>
        <Ionicons name="cube-outline" size={20} color="#2563eb" />
        <Text style={styles.orderBannerText}>
          Order #{order?.id.substring(0, 8).toUpperCase()}
        </Text>
      </View>

      {/* Products List */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {productReviews.map((item, index) => renderProductReview(item, index))}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitReviews}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Reviews</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  orderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e3f2fd',
    gap: 8,
  },
  orderBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  content: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productLabel: {
    fontSize: 12,
    color: '#999',
  },
  ratingSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  commentSection: {
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  photosSection: {
    marginBottom: 8,
  },
  photosScroll: {
    marginTop: 8,
  },
  uploadedImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  photoCountText: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 2,
  },
  submitContainer: {
    padding: 16,
    backgroundColor: '#fff',
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
