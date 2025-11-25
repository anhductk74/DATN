import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryService, Category } from '../services/categoryService';
import { productService, Product } from '../services/productService';
import { getCloudinaryUrl } from '../config/config';

interface HomeScreenProps {
  navigation: any;
}

// Mock data
const categories = [
  { id: '1', name: 'Electronics', icon: '📱' },
  { id: '2', name: 'Fashion', icon: '👕' },
  { id: '3', name: 'Home', icon: '🏠' },
  { id: '4', name: 'Beauty', icon: '💄' },
  { id: '5', name: 'Sports', icon: '⚽' },
  { id: '6', name: 'Books', icon: '📚' },
];

const banners = [
  { id: '1', title: 'Summer Sale', subtitle: 'Up to 50% off', color: '#ff6b6b' },
  { id: '2', title: 'New Arrivals', subtitle: 'Check out latest products', color: '#4ecdc4' },
  { id: '3', title: 'Flash Deal', subtitle: 'Limited time offer', color: '#f9ca24' },
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const screenWidth = 380;
  const bannerSpacing = 12;
  const bannerWidth = screenWidth - bannerSpacing;
  
  const [realCategories, setRealCategories] = useState<Category[]>([]);
  const [featuredProductsReal, setFeaturedProductsReal] = useState<Product[]>([]);
  const [flashDealsReal, setFlashDealsReal] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      const [categoriesRes, featuredRes, dealsRes] = await Promise.all([
        categoryService.getAllCategories(),
        productService.getProducts({ page: 0, size: 8, sort: 'createdAt,desc' }),
        productService.getProductsOnSale(0, 4, 10)
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        const cats = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
        setRealCategories(cats.slice(0, 8));
      }

      if (featuredRes.success && featuredRes.data) {
        const products = featuredRes.data.content || featuredRes.data || [];
        setFeaturedProductsReal(products);
      }

      if (dealsRes.success && dealsRes.data) {
        const deals = dealsRes.data.content || dealsRes.data || [];
        setFlashDealsReal(deals);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategory = ({ item }: any) => {
    const isRealCategory = item.image !== undefined;
    return (
      <TouchableOpacity 
        style={styles.categoryItem}
        onPress={() => navigation.navigate('ProductList', { categoryId: item.id, categoryName: item.name })}
      >
        <View style={styles.categoryIcon}>
          {isRealCategory && item.image ? (
            <Image 
              source={{ uri: getCloudinaryUrl(item.image) }} 
              style={styles.categoryIconImage}
            />
          ) : (
            <Text style={styles.categoryEmoji}>{item.icon || '📋'}</Text>
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
              <Text style={styles.productImageText}>📦</Text>
            </View>
          )}
          {product.discount && product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {price ? `${price.toLocaleString('vi-VN')}đ` : 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFlashDeal = (deal: any, index: number) => (
    <TouchableOpacity 
      key={`deal-${deal.id}-${index}`} 
      style={styles.flashDealCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: deal.id })}
    >
      <View style={styles.flashDealImageContainer}>
        <View style={styles.flashDealImagePlaceholder}>
          <Text style={styles.flashDealImageText}>⚡</Text>
        </View>
      </View>
      <View style={styles.flashDealInfo}>
        <Text style={styles.flashDealName} numberOfLines={2}>
          {deal.name}
        </Text>
        <View style={styles.flashDealPriceContainer}>
          <Text style={styles.flashDealPrice}>${deal.price}</Text>
          <Text style={styles.flashDealOriginalPrice}>${deal.originalPrice}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${deal.soldPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.soldText}>{deal.soldPercentage}% sold</Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerIcon}>⏱️</Text>
          <Text style={styles.timerText}>{deal.timeLeft}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>Smart Mall</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.cartButton}>
            <Text style={styles.cartIcon}>🛒</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              <View
                key={banner.id}
                style={[styles.banner, { backgroundColor: banner.color, width: bannerWidth, marginRight: bannerSpacing }]}
              >
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                <TouchableOpacity style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>Shop Now</Text>
                </TouchableOpacity>
              </View>
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
          ) : (
            <FlatList
              data={realCategories.length > 0 ? realCategories : categories as any}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id.toString()}
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
              <Text style={styles.flashDealIcon}>⚡</Text>
              <Text style={styles.sectionTitle}>Flash Deals</Text>
            </View>
            <TouchableOpacity>
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
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ padding: 20 }} />
          ) : (
            <View style={styles.productsGrid}>
              {(featuredProductsReal.length > 0 ? featuredProductsReal : featuredProducts).map((product, index) => renderProduct(product, index))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.navIcon}>📂</Text>
          <Text style={styles.navLabel}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navLabel}>Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
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
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
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
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  },
  flashDealImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8f9fa',
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    paddingBottom: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
  },
  navLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
