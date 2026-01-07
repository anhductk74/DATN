import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { productService, FlashSaleProduct } from '../services/productService';
import { getCloudinaryUrl } from '../config/config';

interface FlashSalesScreenProps {
  navigation: any;
}

export default function FlashSalesScreen({ navigation }: FlashSalesScreenProps) {
  const [flashSales, setFlashSales] = useState<FlashSaleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [flashSaleTimers, setFlashSaleTimers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadFlashSales();
  }, []);

  useEffect(() => {
    if (flashSales.length === 0) return;

    const updateTimers = () => {
      const newTimers: { [key: string]: string } = {};
      const now = new Date();
      
      flashSales.forEach((deal) => {
        const endTime = new Date(deal.flashSaleEnd);
        const timeLeftMs = endTime.getTime() - now.getTime();
        const timeLeftSeconds = Math.floor(timeLeftMs / 1000);
        
        if (timeLeftSeconds > 0) {
          const days = Math.floor(timeLeftSeconds / 86400);
          const hours = Math.floor((timeLeftSeconds % 86400) / 3600);
          const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
          const seconds = timeLeftSeconds % 60;
          
          if (days > 0) {
            newTimers[deal.id] = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          } else {
            newTimers[deal.id] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          }
        } else {
          newTimers[deal.id] = 'Ended';
        }
      });
      setFlashSaleTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [flashSales]);

  const loadFlashSales = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getActiveFlashSales(0, 8);
      
      if (response.success && response.data) {
        const deals = response.data.content || [];
        setFlashSales(deals);
        setHasMore(deals.length === 8);
        setPage(0);
      }
    } catch (error) {
      console.error('Error loading flash sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreFlashSales = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const response = await productService.getActiveFlashSales(nextPage, 8);
      
      if (response.success && response.data) {
        const newDeals = response.data.content || [];
        
        if (newDeals.length > 0) {
          setFlashSales(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewDeals = newDeals.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNewDeals];
          });
          setHasMore(newDeals.length === 8);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more flash sales:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const navigateToProduct = (deal: FlashSaleProduct) => {
    if (deal.productId) {
      navigation.navigate('ProductDetail', { productId: deal.productId });
    } else {
      productService.searchProducts(deal.productName, 0, 1).then(searchRes => {
        if (searchRes.success && searchRes.data?.content && searchRes.data.content.length > 0) {
          const product = searchRes.data.content[0];
          navigation.navigate('ProductDetail', { productId: product.id });
        }
      }).catch(error => {
        console.error('Error finding product:', error);
      });
    }
  };

  const renderFlashSaleItem = ({ item }: { item: FlashSaleProduct }) => {
    const timeLeft = flashSaleTimers[item.id] || '00:00:00';

    return (
      <TouchableOpacity 
        style={styles.flashSaleCard}
        onPress={() => navigateToProduct(item)}
      >
        <View style={styles.flashSaleBadge}>
          <Ionicons name="flash" size={12} color="#fff" />
          <Text style={styles.flashSaleBadgeText}>-{item.discountPercent}%</Text>
        </View>
        
        <View style={styles.imageContainer}>
          {item.productImage ? (
            <Image 
              source={{ uri: getCloudinaryUrl(item.productImage) }} 
              style={styles.productImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="flash" size={48} color="#f59e0b" />
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.flashPrice}>
              {item.flashSalePrice.toLocaleString('vi-VN')}đ
            </Text>
            <Text style={styles.originalPrice}>
              {item.price.toLocaleString('vi-VN')}đ
            </Text>
          </View>

          {item.flashSaleQuantity && (
            <View style={styles.stockContainer}>
              <Ionicons name="cube-outline" size={12} color="#666" />
              <Text style={styles.stockText}>
                Only {item.flashSaleQuantity} left
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

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#ff4757" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="flash-outline" size={64} color="#ddd" />
        <Text style={styles.emptyText}>No flash sales available</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name="flash" size={22} color="#f59e0b" />
          <Text style={styles.title}>Flash Sales</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4757" />
          <Text style={styles.loadingText}>Loading flash sales...</Text>
        </View>
      ) : (
        <FlatList
          data={flashSales}
          renderItem={renderFlashSaleItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          onEndReached={loadMoreFlashSales}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  flashSaleCard: {
    flex: 1,
    maxWidth: '48%',
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
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f8f9fa',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
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
    marginBottom: 8,
    minHeight: 36,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  flashPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  originalPrice: {
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    color: '#ff4757',
    fontWeight: '600',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
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
    marginTop: 12,
  },
});
