import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productService, Product } from '../services/productService';
import { categoryService, Category } from '../services/categoryService';
import { getCloudinaryUrl } from '../config/config';

interface AllProductsScreenProps {
  navigation: any;
}

export default function AllProductsScreen({ navigation }: AllProductsScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] = useState(true);
  const [productTimers, setProductTimers] = useState<{ [key: string]: string }>({});
  const pageSize = 8;

  useEffect(() => {
    loadCategories();
    loadProducts(0, null);
  }, []);

  // Update flash sale timers
  useEffect(() => {
    if (products.length === 0) return;

    const updateTimers = () => {
      const newTimers: { [key: string]: string } = {};
      const now = new Date();
      
      products.forEach((product) => {
        if (product.hasDiscount && product.variants) {
          const flashSaleVariant = product.variants.find(v => v.isFlashSaleActive && v.flashSaleEnd);
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
                newTimers[product.id] = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              } else {
                newTimers[product.id] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              }
            } else {
              newTimers[product.id] = 'Ended';
            }
          }
        }
      });
      
      setProductTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [products]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async (page: number, categoryId: string | null, append = false) => {
    try {
      if (page === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      let response;
      
      // Use category-specific endpoint if categoryId is provided
      if (categoryId) {
        response = await productService.getProductsByCategory(categoryId, page, pageSize);
      } else {
        response = await productService.getProducts({ page, size: pageSize });
      }

      if (response.success && response.data) {
        const newProducts = response.data.content;
        
        if (append) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        setHasMore(!response.data.last);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setProducts([]);
    setCurrentPage(0);
    setHasMore(true);
    loadProducts(0, categoryId);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !onEndReachedCalledDuringMomentum && products.length > 0) {
      setOnEndReachedCalledDuringMomentum(true);
      loadProducts(currentPage + 1, selectedCategory, true);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setProducts([]);
    setCurrentPage(0);
    setHasMore(true);
    await loadProducts(0, selectedCategory);
    setIsRefreshing(false);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUrl = item.images?.[0] 
      ? getCloudinaryUrl(item.images[0]) 
      : null;

    const hasFlashSale = item.hasDiscount;
    const displayPrice = hasFlashSale && item.minDiscountPrice ? item.minDiscountPrice : item.minPrice;
    const originalPrice = item.minPrice || 0;
    const discountPercent = item.maxDiscountPercent;
    const timeLeft = productTimers[item.id] || '';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
          {hasFlashSale && discountPercent && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.brandText} numberOfLines={1}>
            {item.brand}
          </Text>
          {hasFlashSale && timeLeft && (
            <View style={styles.flashSaleTimer}>
              <Ionicons name="flash" size={10} color="#ff4757" />
              <Text style={styles.flashSaleTimerText}>⏱️ {timeLeft}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            {hasFlashSale && displayPrice ? (
              <>
                <Text style={styles.price}>
                  {displayPrice.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.originalPrice}>
                  {originalPrice.toLocaleString('vi-VN')}đ
                </Text>
              </>
            ) : (
              <Text style={styles.price}>
                {originalPrice.toLocaleString('vi-VN')}đ
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item.id && styles.categoryChipTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Products</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
        >
          <Ionicons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterList}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === null && styles.categoryChipActive
            ]}
            onPress={() => handleCategorySelect(null)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === null && styles.categoryChipTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => setOnEndReachedCalledDuringMomentum(false)}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
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
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryFilterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '47%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  flashSaleTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    gap: 3,
    marginBottom: 6,
  },
  flashSaleTimerText: {
    fontSize: 10,
    color: '#ff4757',
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
