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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productService, ProductDetail } from '../services/productService';
import CartService from '../services/CartService';
import wishlistService from '../services/wishlistService';
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
  const [expandDescription, setExpandDescription] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [modalAction, setModalAction] = useState<'cart' | 'buy'>('cart');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  useEffect(() => {
    loadProductDetail();
    loadRelatedProducts();
    checkWishlistStatus();
  }, [productId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkWishlistStatus();
    });
    return unsubscribe;
  }, [navigation, productId]);

  const checkWishlistStatus = async () => {
    const inWishlist = await wishlistService.checkIsInWishlist(productId);
    setIsInWishlist(inWishlist);
  };

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

  const loadRelatedProducts = async () => {
    try {
      setIsLoadingRelated(true);
      const response = await productService.getProducts({ page: 0, size: 10 });
      
      if (response.success && response.data) {
        const related = response.data.content
          .filter((p: any) => p.id !== productId)
          .slice(0, 10);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
    } finally {
      setIsLoadingRelated(false);
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
        setShowVariantModal(false);
        Alert.alert(
          'Added to Cart',
          `${product?.name} has been added to your cart`,
          [
            { text: 'Continue Shopping', style: 'cancel' },
            { 
              text: 'View Cart', 
              onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' })
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

  const handleBuyNow = async () => {
    if (!selectedVariantId) {
      Alert.alert('Select Variant', 'Please select a product variant first');
      return;
    }

    await handleAddToCart();
    if (selectedVariantId) {
      navigation.navigate('MainTabs', { screen: 'Cart' });
    }
  };

  const openVariantModal = (action: 'cart' | 'buy') => {
    setModalAction(action);
    if (!selectedVariantId && product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
    setQuantity(1);
    setShowVariantModal(true);
  };

  const handleToggleWishlist = async () => {
    setIsTogglingWishlist(true);
    try {
      if (isInWishlist) {
        const response = await wishlistService.removeFromWishlist(productId);
        if (response.success) {
          setIsInWishlist(false);
          Alert.alert('Removed', 'Product removed from wishlist');
        } else {
          Alert.alert('Error', response.message || 'Failed to remove from wishlist');
        }
      } else {
        const response = await wishlistService.addToWishlist(productId);
        if (response.success) {
          setIsInWishlist(true);
          Alert.alert('Added', 'Product added to wishlist');
        } else {
          Alert.alert('Error', response.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
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
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
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
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {selectedVariant?.price.toLocaleString('vi-VN') || (product.variants && product.variants.length > 0 
                  ? product.variants[0].price.toLocaleString('vi-VN') 
                  : '0')}đ
              </Text>
              {selectedVariant && selectedVariant.price < (product.variants?.[0]?.price || 0) * 1.2 && (
                <View style={styles.discountBadgeSmall}>
                  <Text style={styles.discountBadgeText}>-17%</Text>
                </View>
              )}
            </View>
            <View style={styles.salesInfo}>
              <Text style={styles.salesText}>Sold: {product.reviewCount * 5}</Text>
              <Text style={styles.separator}>|</Text>
              <Text style={styles.salesText}>⭐ {product.averageRating?.toFixed(1)} ({product.reviewCount} ratings)</Text>
            </View>
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

        {/* Shipping Info */}
        <View style={styles.shippingSection}>
          <View style={styles.shippingRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <View style={styles.shippingInfo}>
              <Text style={styles.shippingLabel}>Delivery to</Text>
              <Text style={styles.shippingValue}>District 1, Ho Chi Minh City</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
          <View style={styles.divider} />
          <View style={styles.shippingRow}>
            <Ionicons name="cube-outline" size={20} color="#666" />
            <View style={styles.shippingInfo}>
              <Text style={styles.shippingLabel}>Shipping fee</Text>
              <Text style={styles.shippingValue}>Free shipping</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.shippingRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.shippingInfo}>
              <Text style={styles.shippingLabel}>Estimated delivery</Text>
              <Text style={styles.shippingValue}>2-3 days</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.descriptionContainer}>
            <Text 
              style={styles.description}
              numberOfLines={expandDescription ? undefined : 3}
            >
              {product.description}
            </Text>
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => setExpandDescription(!expandDescription)}
            >
              <Text style={styles.expandButtonText}>
                {expandDescription ? 'Show less' : 'Show more'}
              </Text>
              <Ionicons 
                name={expandDescription ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#2563eb" 
              />
            </TouchableOpacity>
          </View>
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

        {/* Related Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Similar Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductList', { categoryId: product.category?.id })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {isLoadingRelated ? (
            <View style={styles.loadingRelated}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedProductsContainer}
            >
              {relatedProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedProductCard}
                  onPress={() => {
                    navigation.push('ProductDetail', { productId: item.id });
                  }}
                >
                  <Image
                    source={{ uri: getCloudinaryUrl(item.images?.[0] || '') }}
                    style={styles.relatedProductImage}
                    defaultSource={require('../../assets/icon.png')}
                  />
                  <View style={styles.relatedProductInfo}>
                    <Text style={styles.relatedProductName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.relatedProductRating}>
                      <Text style={styles.relatedProductStar}>⭐</Text>
                      <Text style={styles.relatedProductRatingText}>
                        {item.averageRating?.toFixed(1) || '0.0'}
                      </Text>
                      <Text style={styles.relatedProductSold}>
                        | Sold {item.reviewCount * 5}
                      </Text>
                    </View>
                    <Text style={styles.relatedProductPrice}>
                      {item.variants?.[0]?.price?.toLocaleString('vi-VN') || '0'}đ
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

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
        <View style={styles.bottomActionsLeft}>
          <TouchableOpacity style={styles.iconActionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#2563eb" />
            <Text style={styles.iconActionText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconActionButton}
            onPress={handleToggleWishlist}
            disabled={isTogglingWishlist}
          >
            <Ionicons 
              name={isInWishlist ? "heart" : "heart-outline"} 
              size={24} 
              color="#ff4757" 
            />
            <Text style={styles.iconActionText}>Favorite</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomActionsRight}>
          <TouchableOpacity 
            style={styles.addToCartButtonNew}
            onPress={() => openVariantModal('cart')}
          >
            <Text style={styles.addToCartTextNew}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.buyNowButtonNew}
            onPress={() => openVariantModal('buy')}
          >
            <Text style={styles.buyNowTextNew}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Variant Selection Modal */}
      <Modal
        visible={showVariantModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVariantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalProductInfo}>
                <Image
                  source={{ uri: getCloudinaryUrl(product.images?.[0] || '') }}
                  style={styles.modalProductImage}
                  defaultSource={require('../../assets/icon.png')}
                />
                <View style={styles.modalProductDetails}>
                  <Text style={styles.modalPrice}>
                    {selectedVariant?.price.toLocaleString('vi-VN') || 
                      (product.variants && product.variants.length > 0 
                        ? product.variants[0].price.toLocaleString('vi-VN') 
                        : '0')}đ
                  </Text>
                  <Text style={styles.modalStock}>
                    Stock: {selectedVariant?.stock || 0}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setShowVariantModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Select Options</Text>
                  <View style={styles.variantsContainer}>
                    {product.variants.map((variant) => {
                      const isSelected = selectedVariantId === variant.id;
                      const isOutOfStock = variant.stock === 0;
                      const attributesText = variant.attributes
                        ?.map(attr => attr.attributeValue)
                        .join(' / ');
                      
                      return (
                        <TouchableOpacity
                          key={variant.id}
                          style={[
                            styles.variantChip,
                            isSelected && styles.variantChipSelected,
                            isOutOfStock && styles.variantChipDisabled,
                          ]}
                          onPress={() => !isOutOfStock && setSelectedVariantId(variant.id)}
                          disabled={isOutOfStock}
                        >
                          <Text style={[
                            styles.variantChipText,
                            isSelected && styles.variantChipTextSelected,
                            isOutOfStock && styles.variantChipTextDisabled,
                          ]}>
                            {attributesText || variant.sku}
                          </Text>
                          {isOutOfStock && (
                            <Text style={styles.outOfStockLabel}>Sold out</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Quantity Selection */}
              {selectedVariant && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Quantity</Text>
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
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.modalBottomActions}>
              {modalAction === 'cart' ? (
                <TouchableOpacity 
                  style={[
                    styles.modalActionButton,
                    !selectedVariantId && styles.modalActionButtonDisabled,
                  ]}
                  onPress={handleAddToCart}
                  disabled={!selectedVariantId || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalActionButtonText}>Add to Cart</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[
                    styles.modalActionButton,
                    !selectedVariantId && styles.modalActionButtonDisabled,
                  ]}
                  onPress={handleBuyNow}
                  disabled={!selectedVariantId || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalActionButtonText}>Buy Now</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  iconButton: {
    padding: 6,
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
    paddingTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  discountBadgeSmall: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  salesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salesText: {
    fontSize: 13,
    color: '#666',
  },
  separator: {
    color: '#ddd',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  shippingSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  shippingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  shippingLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  shippingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
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
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 4,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
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
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bottomActionsLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  bottomActionsRight: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  iconActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconActionText: {
    fontSize: 10,
    color: '#666',
  },
  addToCartButtonNew: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ff4757',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addToCartTextNew: {
    color: '#ff4757',
    fontSize: 14,
    fontWeight: '600',
  },
  buyNowButtonNew: {
    flex: 1,
    backgroundColor: '#ff4757',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  buyNowTextNew: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantChip: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  variantChipSelected: {
    borderColor: '#2563eb',
    borderWidth: 2,
    backgroundColor: '#eff6ff',
  },
  variantChipDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.5,
  },
  variantChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  variantChipTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  variantChipTextDisabled: {
    color: '#999',
  },
  outOfStockLabel: {
    fontSize: 10,
    color: '#ff4757',
    marginTop: 2,
  },
  selectedVariantInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedVariantPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  selectedVariantStock: {
    fontSize: 13,
    color: '#10b981',
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
  addToCartButtonDisabled: {
    opacity: 0.5,
  },
  loadingRelated: {
    padding: 20,
    alignItems: 'center',
  },
  relatedProductsContainer: {
    paddingRight: 16,
  },
  relatedProductCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  relatedProductImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  relatedProductInfo: {
    padding: 8,
  },
  relatedProductName: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    height: 36,
  },
  relatedProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  relatedProductStar: {
    fontSize: 12,
  },
  relatedProductRatingText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  relatedProductSold: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  relatedProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4757',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  modalProductInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  modalProductDetails: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4757',
    marginBottom: 4,
  },
  modalStock: {
    fontSize: 13,
    color: '#666',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modalBottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalActionButton: {
    backgroundColor: '#ff4757',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalActionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
