import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productService, Product } from '../services/productService';
import { getCloudinaryUrl } from '../config/config';

interface SearchScreenProps {
  navigation: any;
  route: any;
}

export default function SearchScreen({ navigation, route }: SearchScreenProps) {
  const initialQuery = route.params?.query || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchIntent, setSearchIntent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (query: string, page: number = 0, append: boolean = false) => {
    if (!query.trim()) {
      setProducts([]);
      setSearchIntent(null);
      return;
    }

    try {
      if (page === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await productService.smartSearch(query.trim(), page, pageSize);

      if (response.success && response.data) {
        const newProducts = response.data.products || [];
        
        if (append) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        // Store search intent from AI
        if (response.data.searchIntent) {
          setSearchIntent(response.data.searchIntent);
        }

        setHasMore(response.data.hasNext);
        setCurrentPage(response.data.currentPage);
      }
    } catch (error) {
      console.error('[SearchScreen] Error searching products:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !onEndReachedCalledDuringMomentum && products.length > 0 && searchQuery.trim()) {
      setOnEndReachedCalledDuringMomentum(true);
      handleSearch(searchQuery, currentPage + 1, true);
    }
  };

  const handleRefresh = async () => {
    if (!searchQuery.trim()) return;
    
    setIsRefreshing(true);
    setProducts([]);
    setSearchIntent(null);
    setCurrentPage(0);
    setHasMore(true);
    await handleSearch(searchQuery, 0, false);
    setIsRefreshing(false);
  };

  const onSearchSubmit = () => {
    setProducts([]);
    setSearchIntent(null);
    setCurrentPage(0);
    setHasMore(true);
    handleSearch(searchQuery, 0, false);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUrl = item.images?.[0] 
      ? getCloudinaryUrl(item.images[0]) 
      : null;

    // Use minPrice from API, fallback to price or calculate from variants
    let minPrice = 0;
    if (item.minPrice) {
      minPrice = item.minPrice;
    } else if (item.variants && item.variants.length > 0) {
      minPrice = Math.min(...item.variants.map(v => v.price));
    } else if (item.price) {
      minPrice = item.price;
    }

    const rating = item.averageRating || 0;

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
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.brandText} numberOfLines={1}>
            {item.brand}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {minPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    
    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Enter keywords to search</Text>
          <Text style={styles.emptySubtext}>e.g., Samsung phone under $500</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No products found</Text>
        <Text style={styles.emptySubtext}>Try different keywords or broaden your search</Text>
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
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Smart search (e.g., cheap Samsung phone)..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={onSearchSubmit}
            autoFocus={!initialQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setProducts([]);
            }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {searchIntent && !isLoading && (
        <View style={styles.searchIntentContainer}>
          <View style={styles.searchIntentHeader}>
            <Ionicons name="bulb" size={16} color="#f59e0b" />
            <Text style={styles.searchIntentTitle}>Result search:</Text>
          </View>
          <View style={styles.searchIntentContent}>
            {searchIntent.brand && (
              <View style={styles.intentChip}>
                <Text style={styles.intentChipText}>Brand: {searchIntent.brand}</Text>
              </View>
            )}
            {searchIntent.price_range && (searchIntent.price_range.min || searchIntent.price_range.max) && (
              <View style={styles.intentChip}>
                <Text style={styles.intentChipText}>
                  Price: 
                  {searchIntent.price_range.min && ` from ${(searchIntent.price_range.min / 1000000).toFixed(1)}M`}
                  {searchIntent.price_range.max && ` to ${(searchIntent.price_range.max / 1000000).toFixed(1)}M`}
                </Text>
              </View>
            )}
            {searchIntent.color && (
              <View style={styles.intentChip}>
                <Text style={styles.intentChipText}>Color: {searchIntent.color}</Text>
              </View>
            )}
            {searchIntent.product_keywords && searchIntent.product_keywords.length > 0 && (
              <View style={styles.intentChip}>
                <Text style={styles.intentChipText}>
                  Keywords: {searchIntent.product_keywords.join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Search Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Searching...</Text>
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
          ListEmptyComponent={renderEmpty}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  searchIntentContainer: {
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIntentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  searchIntentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  searchIntentContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intentChip: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  intentChipText: {
    fontSize: 12,
    color: '#78350f',
    fontWeight: '500',
  },
});
