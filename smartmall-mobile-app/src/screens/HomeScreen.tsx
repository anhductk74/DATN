import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { categoryService, Category } from '../services/categoryService';
import { productService, Product, FlashSaleProduct } from '../services/productService';
import CartService from '../services/CartService';
import { getCloudinaryUrl } from '../config/config';

interface HomeScreenProps {
  navigation: any;
}

// use local banner images from assets
const banners = [
  { id: '1', title: '', subtitle: '', image: require('../../assets/banner2.jpg') },
  { id: '2', title: '', subtitle: '', image: require('../../assets/banner1.jpg') },
  { id: '3', title: '', subtitle: '', image: require('../../assets/banner3.jpg') },
];

const featuredProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    originalPrice: 149.99,
    rating: 4.5,
    image: 'https://via.placeholder.com/150',
    discount: 33,
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    originalPrice: 299.99,
    rating: 4.8,
    image: 'https://via.placeholder.com/150',
    discount: 33,
  },
  {
    id: '3',
    name: 'Laptop Backpack',
    price: 49.99,
    originalPrice: 79.99,
    rating: 4.3,
    image: 'https://via.placeholder.com/150',
    discount: 38,
  },
  {
    id: '4',
    name: 'USB-C Cable',
    price: 19.99,
    originalPrice: 29.99,
    rating: 4.6,
    image: 'https://via.placeholder.com/150',
    discount: 33,
  },
];

const flashDeals = [
  {
    id: '1',
    name: 'Gaming Mouse',
    price: 39.99,
    originalPrice: 79.99,
    timeLeft: '02:45:30',
    image: 'https://via.placeholder.com/150',
    soldPercentage: 65,
  },
  {
    id: '2',
    name: 'Bluetooth Speaker',
    price: 59.99,
    originalPrice: 99.99,
    timeLeft: '02:45:30',
    image: 'https://via.placeholder.com/150',
    soldPercentage: 45,
  },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const screenWidth = 380;
  const bannerSpacing = 12;
  const bannerWidth = screenWidth - bannerSpacing;
  
  const [realCategories, setRealCategories] = useState<Category[]>([]);
  const [featuredProductsReal, setFeaturedProductsReal] = useState<Product[]>([]);
  const [flashDealsReal, setFlashDealsReal] = useState<FlashSaleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flashSaleTimers, setFlashSaleTimers] = useState<{ [key: string]: string }>({});
  const [featuredProductTimers, setFeaturedProductTimers] = useState<{ [key: string]: string }>({});
  const [cartCount, setCartCount] = useState(0);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [hasMoreFeatured, setHasMoreFeatured] = useState(true);
  const [isLoadingMoreFeatured, setIsLoadingMoreFeatured] = useState(false);
  const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] = useState(true);
  const [categoryImageErrors, setCategoryImageErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadHomeData();
    loadCartCount();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCartCount();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (flashDealsReal.length === 0 && featuredProductsReal.length === 0) return;

    const updateTimers = () => {
      const newFlashTimers: { [key: string]: string } = {};
      const newFeaturedTimers: { [key: string]: string } = {};
      const now = new Date();
      
      // Update flash deals timers
      flashDealsReal.forEach((deal) => {
        const endTime = new Date(deal.flashSaleEnd);
        const timeLeftMs = endTime.getTime() - now.getTime();
        const timeLeftSeconds = Math.floor(timeLeftMs / 1000);
        
        if (timeLeftSeconds > 0) {
          const days = Math.floor(timeLeftSeconds / 86400);
          const hours = Math.floor((timeLeftSeconds % 86400) / 3600);
          const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
          const seconds = timeLeftSeconds % 60;
          
          if (days > 0) {
            newFlashTimers[deal.id] = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          } else {
            newFlashTimers[deal.id] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          }
        } else {
          newFlashTimers[deal.id] = 'Ended';
        }
      });
      
      // Update featured products timers (for products with flash sales)
      featuredProductsReal.forEach((product) => {
        if (product.hasDiscount && product.variants && product.variants.length > 0) {
          // Find variant with active flash sale
          const flashSaleVariant = product.variants.find((v: any) => v.isFlashSaleActive && v.flashSaleEnd);
          
          if (flashSaleVariant && flashSaleVariant.flashSaleEnd) {
            const endTime = new Date(flashSaleVariant.flashSaleEnd);
            const timeLeftMs = endTime.getTime() - now.getTime();
            const timeLeftSeconds = Math.floor(timeLeftMs / 1000);
            
            if (timeLeftSeconds > 0) {
              const days = Math.floor(timeLeftSeconds / 86400);
              const hours = Math.floor((timeLeftSeconds % 86400) / 3600);
              const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
              const seconds = timeLeftSeconds % 60;
              
              if (days > 0) {
                newFeaturedTimers[product.id] = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              } else {
                newFeaturedTimers[product.id] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              }
            } else {
              newFeaturedTimers[product.id] = 'Ended';
            }
          }
        }
      });
      
      setFlashSaleTimers(newFlashTimers);
      setFeaturedProductTimers(newFeaturedTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [flashDealsReal, featuredProductsReal]);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      const [categoriesRes, featuredRes, dealsRes] = await Promise.all([
        categoryService.getAllCategories(),
        productService.getProducts({ page: 0, size: 8, sort: 'createdAt,desc' }),
        productService.getActiveFlashSales(0, 10)
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        const cats = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
        // Flatten all categories including subcategories
        const allCategories: Category[] = [];
        cats.forEach((cat: Category) => {
          allCategories.push(cat);
          if (cat.subCategories && cat.subCategories.length > 0) {
            allCategories.push(...cat.subCategories);
          }
        });
        setRealCategories(allCategories);
      }

      if (featuredRes.success && featuredRes.data) {
        const products = featuredRes.data.content || [];
        setFeaturedProductsReal(products);
        setHasMoreFeatured(!featuredRes.data.last);
        setFeaturedPage(0);
      }

      if (dealsRes.success && dealsRes.data) {
        const deals = dealsRes.data.content || [];
        setFlashDealsReal(deals);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const response = await CartService.getCartCount();
      if (response.success && response.data !== null) {
        setCartCount(response.data);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const loadMoreFeaturedProducts = async () => {
    if (!isLoadingMoreFeatured && hasMoreFeatured && !onEndReachedCalledDuringMomentum && featuredProductsReal.length > 0) {
      setOnEndReachedCalledDuringMomentum(true);
      setIsLoadingMoreFeatured(true);
      
      try {
        const nextPage = featuredPage + 1;
        const response = await productService.getProducts({ page: nextPage, size: 8, sort: 'createdAt,desc' });
        
        if (response.success && response.data) {
          const newProducts = response.data.content || [];
          
          if (newProducts.length > 0) {
            setFeaturedProductsReal(prev => {
              const existingIds = new Set(prev.map((p: Product) => p.id));
              const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id));
              return [...prev, ...uniqueNewProducts];
            });
          }
          
          setHasMoreFeatured(!response.data.last && newProducts.length > 0);
          setFeaturedPage(nextPage);
        }
      } catch (error) {
        console.error('Error loading more featured products:', error);
      } finally {
        setIsLoadingMoreFeatured(false);
      }
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !onEndReachedCalledDuringMomentum) {
      setOnEndReachedCalledDuringMomentum(true);
      loadMoreFeaturedProducts();
    }
  };

  const renderCategory = ({ item }: any) => {
    const hasImage = item.image && !categoryImageErrors[item.id];
    
    return (
      <TouchableOpacity 
        style={styles.categoryItem}
        onPress={() => navigation.navigate('ProductList', { categoryId: item.id, categoryName: item.name })}
      >
        <View style={styles.categoryIcon}>
          {hasImage ? (
            <Image 
              source={{ uri: getCloudinaryUrl(item.image) }} 
              style={styles.categoryIconImage}
              onError={() => {
                setCategoryImageErrors(prev => ({ ...prev, [item.id]: true }));
              }}
            />
          ) : (
            <MaterialCommunityIcons name="shape-outline" size={32} color="#2563eb" />
          )}
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = (product: any, index: number) => {
    const isRealProduct = product.variants !== undefined;
    const price = isRealProduct && product.variants?.length > 0 ? product.variants[0].price : product.price;
    const rating = product.averageRating || product.rating || 0;
    
    // Check if product has active flash sale from API fields
    const hasFlashSale = product.hasDiscount || false;
    const flashSalePrice = product.minDiscountPrice;
    const discountPercent = product.maxDiscountPercent || product.discount;
    
    // Get flash sale end time from first variant with active flash sale
    let flashSaleEnd = null;
    if (hasFlashSale && product.variants && product.variants.length > 0) {
      const flashSaleVariant = product.variants.find((v: any) => v.isFlashSaleActive);
      if (flashSaleVariant && flashSaleVariant.flashSaleEnd) {
        flashSaleEnd = flashSaleVariant.flashSaleEnd;
      }
    }
    
    // Get time remaining from state
    const timeLeft = featuredProductTimers[product.id] || '';
    
    return (
      <TouchableOpacity 
        key={`product-${product.id}-${index}`} 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
      >
        <View style={styles.productImageContainer}>
          {isRealProduct && product.images && product.images.length > 0 ? (
            <Image 
              source={{ uri: getCloudinaryUrl(product.images[0]) }} 
              style={styles.productImage}
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="cube-outline" size={48} color="#999" />
            </View>
          )}
          {hasFlashSale && discountPercent && discountPercent > 0 ? (
            <View style={styles.flashSaleBadge}>
              <Ionicons name="flash" size={12} color="#fff" />
              <Text style={styles.flashSaleBadgeText}>-{discountPercent}%</Text>
            </View>
          ) : (
            product.discount && product.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            )
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.ratingContainer}>
            <AntDesign name="star" size={12} color="#f59e0b" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          {hasFlashSale && flashSalePrice ? (
            <>
              <View style={styles.priceContainer}>
                <Text style={styles.flashDealPrice}>
                  {flashSalePrice.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.flashDealOriginalPrice}>
                  {price ? `${price.toLocaleString('vi-VN')}đ` : ''}
                </Text>
              </View>
              {timeLeft && (
                <View style={styles.timerContainer}>
                  <MaterialCommunityIcons name="timer-outline" size={12} color="#ff4757" />
                  <Text style={styles.timerText}>{timeLeft}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {price ? `${price.toLocaleString('vi-VN')}đ` : 'N/A'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFlashDeal = (deal: FlashSaleProduct | any, index: number) => {
    // Real flash sale has 'productName' field, fallback has 'name'
    const isRealFlashSale = deal.productName !== undefined;
    const variantId = deal.id;
    const productName = isRealFlashSale ? deal.productName : deal.name;
    const flashPrice = deal.flashSalePrice || deal.price;
    const originalPrice = deal.price;
    const discount = deal.discountPercent;
    const productImage = deal.productImage;
    const timeLeft = isRealFlashSale && deal.id ? flashSaleTimers[deal.id] || '00:00:00' : deal.timeLeft;
    const soldPercentage = deal.soldPercentage || 0;
    const flashSaleQuantity = deal.flashSaleQuantity;
    const stock = deal.stock;
    
    // Calculate sold percentage if we have flashSaleQuantity and stock
    let calculatedSoldPercentage = soldPercentage;
    if (flashSaleQuantity && stock !== null) {
      const sold = flashSaleQuantity - stock;
      calculatedSoldPercentage = Math.max(0, Math.round((sold / flashSaleQuantity) * 100));
    }

    // Safety check for prices
    if (!flashPrice || !originalPrice) {
      return null;
    }

    return (
      <TouchableOpacity 
        key={`deal-${variantId}-${index}`} 
        style={styles.flashDealCard}
        onPress={() => {
          // Use productId directly if available
          if (deal.productId) {
            navigation.navigate('ProductDetail', { productId: deal.productId });
          } else {
            // Fallback: search for product by name
            productService.searchProducts(productName, 0, 1).then(searchRes => {
              if (searchRes.success && searchRes.data?.content && searchRes.data.content.length > 0) {
                const product = searchRes.data.content[0];
                navigation.navigate('ProductDetail', { productId: product.id });
              }
            }).catch(error => {
              console.error('Error finding product:', error);
            });
          }
        }}
      >
        {isRealFlashSale && discount && (
          <View style={styles.flashSaleBadge}>
            <Ionicons name="flash" size={12} color="#fff" />
            <Text style={styles.flashSaleBadgeText}>-{discount}%</Text>
          </View>
        )}
        <View style={styles.flashDealImageContainer}>
          {isRealFlashSale && productImage ? (
            <Image 
              source={{ uri: getCloudinaryUrl(productImage) }} 
              style={styles.flashDealImage}
            />
          ) : (
            <View style={styles.flashDealImagePlaceholder}>
              <Ionicons name="flash" size={48} color="#f59e0b" />
            </View>
          )}
        </View>
        <View style={styles.flashDealInfo}>
          <Text style={styles.flashDealName} numberOfLines={2}>
            {productName}
          </Text>
          <View style={styles.flashDealPriceContainer}>
            <Text style={styles.flashDealPrice}>
              {flashPrice.toLocaleString('vi-VN')}đ
            </Text>
            <Text style={styles.flashDealOriginalPrice}>
              {originalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          {flashSaleQuantity && (
            <View style={styles.stockContainer}>
              <Ionicons name="cube-outline" size={12} color="#666" />
              <Text style={styles.stockText}>
                Only {flashSaleQuantity} left
              </Text>
            </View>
          )}
          <View style={styles.timerContainer}>
            <MaterialCommunityIcons name="timer-outline" size={14} color="#ff4757" />
            <Text style={styles.timerText}>{timeLeft}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
          <Text style={styles.searchPlaceholder}>Search products...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollBegin={() => setOnEndReachedCalledDuringMomentum(false)}
        scrollEventThrottle={400}
      >
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16 }}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const index = Math.round(x / screenWidth);
              setCurrentBanner(index);
            }}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={screenWidth}
            snapToAlignment="center"
          >
            {banners.map((banner) => (
              <ImageBackground
                key={banner.id}
                source={banner.image}
                style={[styles.banner, { width: bannerWidth, marginRight: bannerSpacing }]}
                imageStyle={{ borderRadius: 12 }}
              >
                <View style={styles.bannerOverlay} />
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                  
                </View>
              </ImageBackground>
            ))}
          </ScrollView>
          <View style={styles.bannerDots}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentBanner === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ padding: 20 }} />
          ) : realCategories.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#666' }}>No categories available</Text>
            </View>
          ) : (
            <FlatList
              data={realCategories}
              renderItem={renderCategory}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          )}
        </View>

        {/* Flash Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.flashDealHeader}>
              <Ionicons name="flash" size={22} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Flash Deals</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('FlashSales')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ padding: 20 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flashDealsList}
            >
              {(flashDealsReal.length > 0 ? flashDealsReal : flashDeals).map((deal, index) => renderFlashDeal(deal, index))}
            </ScrollView>
          )}
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllProducts')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ padding: 20 }} />
          ) : (
            <View>
              <View style={styles.productsGrid}>
                {(featuredProductsReal.length > 0 ? featuredProductsReal : featuredProducts).map((product, index) => renderProduct(product, index))}
              </View>
              {isLoadingMoreFeatured && hasMoreFeatured && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.loadingMoreText}>Loading more products...</Text>
                </View>
              )}
              {!hasMoreFeatured && featuredProductsReal.length > 8 && (
                <View style={styles.endOfList}>
                  <Text style={styles.endOfListText}>No more products</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#999',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cartButton: {
    padding: 6,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
    marginBottom: 20,
    marginTop: 16,
  },
  banner: {
    height: 160,
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
  },
  bannerContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 70,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  categoryIconImage: {
    width: '75%',
    height: '75%',
    resizeMode: 'contain',
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  flashDealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flashDealIcon: {
    fontSize: 20,
  },
  flashDealsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  flashDealCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative',
  },
  flashSaleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  flashSaleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  flashDealImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8f9fa',
  },
  flashDealImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  flashDealImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashDealImageText: {
    fontSize: 40,
  },
  flashDealInfo: {
    padding: 12,
  },
  flashDealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  flashDealPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  flashDealPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  flashDealOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  stockText: {
    fontSize: 11,
    color: '#ff4757',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff4757',
  },
  soldText: {
    fontSize: 10,
    color: '#999',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerIcon: {
    fontSize: 12,
  },
  timerText: {
    fontSize: 12,
    color: '#ff4757',
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f8f9fa',
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 40,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    height: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingStar: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  bottomSpacing: {
    height: 20,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666',
  },
  endOfList: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: '#999',
  },
});
