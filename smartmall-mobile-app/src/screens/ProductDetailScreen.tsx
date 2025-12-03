import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productService, ProductDetail } from '../services/productService';
import CartService from '../services/CartService';
import { getCloudinaryUrl } from '../config/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductDetailScreenProps {
  navigation: any;
  route: any;
}

export default function ProductDetailScreen({ navigation, route }: ProductDetailScreenProps) {
  const { productId } = route.params;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    loadProductDetail();
  }, [productId]);

  const loadProductDetail = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getProductById(productId);
      
      if (response.success && response.data) {
        setProduct(response.data);
        // Auto-select first variant if available
        if (response.data.variants && response.data.variants.length > 0) {
          setSelectedVariantId(response.data.variants[0].id);
        }
      } else {
        Alert.alert('Error', response.message);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading product detail:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      Alert.alert('Select Variant', 'Please select a product variant first');
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await CartService.addItem({
        variantId: selectedVariantId,
        quantity: quantity,
      });

      if (response.success) {
        Alert.alert(
          'Added to Cart',
          `${product?.name} has been added to your cart`,
          [
            { text: 'Continue Shopping', style: 'cancel' },
            { 
              text: 'View Cart', 
              onPress: () => navigation.navigate('Cart')
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to add item to cart');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const selectedVariant = product?.variants?.find(v => v.id === selectedVariantId);

  if (isLoading || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.icon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.icon}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const index = Math.round(x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image 
                  source={{ uri: getCloudinaryUrl(image) }} 
                  style={styles.productImage}
                  defaultSource={require('../../assets/icon.png')}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.imageDots}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{product.averageRating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>
              {product.variants && product.variants.length > 0 
                ? product.variants[0].price.toLocaleString('vi-VN') 
                : '0'}đ
            </Text>
          </View>
        </View>

        {/* Shop Info */}
        <TouchableOpacity style={styles.shopSection}>
          <View style={styles.shopInfo}>
            <View style={styles.shopAvatar}>
              {product.shop?.avatar ? (
                <Image 
                  source={{ uri: getCloudinaryUrl(product.shop.avatar) }} 
                  style={styles.shopAvatarImage}
                  defaultSource={require('../../assets/icon.png')}
                />
              ) : (
                <Text style={styles.shopAvatarText}>🏪</Text>
              )}
            </View>
            <View style={styles.shopDetails}>
              <Text style={styles.shopName}>{product.shop?.name || 'Unknown Shop'}</Text>
              <Text style={styles.shopStatus}>Active now</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewShopButton}>
            <Text style={styles.viewShopText}>View Shop</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Variant Selection */}
        {product.variants && product.variants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Variant</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantsList}>
              {product.variants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;
                const isOutOfStock = variant.stock === 0;
                const attributesText = variant.attributes
                  ?.map(attr => `${attr.attributeName}: ${attr.attributeValue}`)
                  .join(', ');
                
                return (
                  <TouchableOpacity
                    key={variant.id}
                    style={[
                      styles.variantCard,
                      isSelected && styles.variantCardSelected,
                      isOutOfStock && styles.variantCardDisabled,
                    ]}
                    onPress={() => !isOutOfStock && setSelectedVariantId(variant.id)}
                    disabled={isOutOfStock}
                  >
                    <Text style={[
                      styles.variantSku,
                      isSelected && styles.variantSkuSelected,
                    ]}>
                      {variant.sku}
                    </Text>
                    {attributesText && (
                      <Text style={[
                        styles.variantAttributes,
                        isSelected && styles.variantAttributesSelected,
                      ]} numberOfLines={1}>
                        {attributesText}
                      </Text>
                    )}
                    <Text style={[
                      styles.variantPrice,
                      isSelected && styles.variantPriceSelected,
                    ]}>
                      {variant.price.toLocaleString('vi-VN')}đ
                    </Text>
                    <Text style={[
                      styles.variantStock,
                      isOutOfStock && styles.variantStockOut,
                    ]}>
                      {isOutOfStock ? 'Out of stock' : `Stock: ${variant.stock}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Quantity Selection */}
        {selectedVariant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                disabled={quantity >= selectedVariant.stock}
              >
                <Text style={[
                  styles.quantityBtnText,
                  quantity >= selectedVariant.stock && styles.quantityBtnTextDisabled,
                ]}>
                  +
                </Text>
              </TouchableOpacity>
              <Text style={styles.stockInfo}>
                {selectedVariant.stock} available
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            {Object.entries(product.specifications).map(([key, value]) => (
              <View key={key} style={styles.specRow}>
                <Text style={styles.specKey}>{key}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews ({product.reviewCount})</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {product.reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerAvatarText}>
                        {review.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.reviewerName}>{review.userName}</Text>
                      <View style={styles.reviewRating}>
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Text key={i} style={styles.reviewStar}>⭐</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.chatButton}>
          <Text style={styles.chatIcon}>💬</Text>
          <Text style={styles.chatText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            (!selectedVariantId || isAddingToCart) && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={!selectedVariantId || isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addToCartText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  icon: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#f8f9fa',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  dotActive: {
    backgroundColor: '#2563eb',
    width: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStar: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  soldText: {
    fontSize: 14,
    color: '#666',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  shopSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shopAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  shopAvatarText: {
    fontSize: 24,
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  shopStatus: {
    fontSize: 12,
    color: '#4ecdc4',
  },
  viewShopButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewShopText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specKey: {
    fontSize: 14,
    color: '#666',
    width: '40%',
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  reviewCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  reviewerAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewStar: {
    fontSize: 12,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
  },
  chatIcon: {
    fontSize: 16,
  },
  chatText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  addToCartButton: {
    flex: 1.5,
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  variantsList: {
    flexDirection: 'row',
  },
  variantCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 140,
    backgroundColor: '#fff',
  },
  variantCardSelected: {
    borderColor: '#2563eb',
    borderWidth: 2,
    backgroundColor: '#eff6ff',
  },
  variantCardDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  variantSku: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  variantSkuSelected: {
    color: '#2563eb',
  },
  variantAttributes: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  variantAttributesSelected: {
    color: '#2563eb',
  },
  variantPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4757',
    marginBottom: 4,
  },
  variantPriceSelected: {
    color: '#2563eb',
  },
  variantStock: {
    fontSize: 11,
    color: '#10b981',
  },
  variantStockOut: {
    color: '#ff4757',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityBtnTextDisabled: {
    color: '#ccc',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  stockInfo: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1.5,
    backgroundColor: '#ff4757',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
