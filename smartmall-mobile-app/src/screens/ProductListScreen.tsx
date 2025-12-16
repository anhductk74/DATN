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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productService, Product } from '../services/productService';
import { getCloudinaryUrl } from '../config/config';

interface ProductListScreenProps {
  navigation: any;
  route: any;
}

export default function ProductListScreen({ navigation, route }: ProductListScreenProps) {
  const { categoryId, categoryName } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (pageNum = 0) => {
    try {
      if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await productService.getProductsByCategory(categoryId, pageNum, 20);
      
      if (response.success && response.data) {
        const newProducts = response.data.content || [];
        
        if (pageNum === 0) {
          setProducts(newProducts);
        } else {
          // Chỉ append nếu có products mới và loại bỏ trùng lặp
          if (newProducts.length > 0) {
            setProducts(prev => {
              const existingIds = new Set(prev.map((p: Product) => p.id));
              const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id));
              return [...prev, ...uniqueNewProducts];
            });
          }
        }
        
        // Kiểm tra xem còn trang tiếp theo không
        const isLast = response.data.last || newProducts.length === 0;
        setHasMore(!isLast);
        setPage(pageNum);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore && !onEndReachedCalledDuringMomentum && products.length > 0) {
      setOnEndReachedCalledDuringMomentum(true);
      loadProducts(page + 1);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const price = item.variants && item.variants.length > 0 ? item.variants[0].price : 0;
    const stock = item.variants && item.variants.length > 0 ? item.variants[0].stock : 0;
    const rating = item.averageRating || 0;
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.productImageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image 
              source={{ uri: getCloudinaryUrl(item.images[0]) }} 
              style={styles.productImage}
              defaultSource={require('../../assets/icon.png')}
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productImageText}>📦</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{price.toLocaleString('vi-VN')}đ</Text>
          </View>
          <Text style={styles.stockText}>
            {stock > 0 ? `Stock: ${stock}` : 'Out of stock'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{categoryName}</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => setOnEndReachedCalledDuringMomentum(false)}
        ListFooterComponent={
          isLoadingMore && hasMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : !hasMore && products.length > 0 ? (
            <View style={styles.endOfList}>
              <Text style={styles.endOfListText}>No more products</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48.5%',
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
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
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
  reviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  soldText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  stockText: {
    fontSize: 11,
    color: '#666',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfList: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
