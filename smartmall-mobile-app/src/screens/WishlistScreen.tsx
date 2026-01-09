import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import wishlistService, { WishlistItem } from '../services/wishlistService';
import { getCloudinaryUrl } from '../config/config';

interface WishlistScreenProps {
  navigation: any;
}

export default function WishlistScreen({ navigation }: WishlistScreenProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWishlist();
    });
    return unsubscribe;
  }, [navigation]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await wishlistService.getWishlist();
      
      if (response.success && response.data) {
        setWishlistItems(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load wishlist');
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWishlist();
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await wishlistService.removeFromWishlist(productId);
              
              if (response.success) {
                setWishlistItems(prevItems => 
                  prevItems.filter(item => item.product.id !== productId)
                );
                Alert.alert('Success', 'Item removed from wishlist');
              } else {
                Alert.alert('Error', response.message || 'Failed to remove item');
              }
            } catch (error) {
              console.error('Error removing from wishlist:', error);
              Alert.alert('Error', 'Failed to remove item from wishlist');
            }
          },
        },
      ]
    );
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const imageUrl = item.product.images?.[0] 
      ? getCloudinaryUrl(item.product.images[0]) 
      : null;

    return (
      <TouchableOpacity
        style={styles.wishlistItem}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.product.id })}
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
            {item.product.name}
          </Text>
          <Text style={styles.brandText}>{item.product.brand}</Text>
          {item.product.shopName && (
            <Text style={styles.shopText}>
              <Ionicons name="storefront-outline" size={12} color="#666" /> {item.product.shopName}
            </Text>
          )}
          {item.note && (
            <Text style={styles.noteText} numberOfLines={1}>
              📝 {item.note}
            </Text>
          )}
          <Text style={styles.dateText}>
            Added {new Date(item.addedAt).toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(item.product.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptyText}>
        Add items you love to your wishlist and shop them later
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('MainTabs')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={styles.headerRight}>
          <Text style={styles.itemCount}>{wishlistItems.length} items</Text>
        </View>
      </View>

      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.wishlistId}
        contentContainerStyle={
          wishlistItems.length === 0 
            ? styles.emptyListContainer 
            : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
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
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 12,
  },
  emptyListContainer: {
    flex: 1,
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  shopText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 12,
    color: '#2563eb',
    fontStyle: 'italic',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
