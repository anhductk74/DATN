import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CartService, { Cart, CartItem } from '../services/CartService';
import { getCloudinaryUrl } from '../config/config';

interface CartScreenProps {
  navigation: any;
}

export default function CartScreen({ navigation }: CartScreenProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [flashSaleTimers, setFlashSaleTimers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadCart();
  }, []);

  // Update flash sale timers
  useEffect(() => {
    if (!cart || cart.items.length === 0) return;

    const updateTimers = () => {
      const newTimers: { [key: string]: string } = {};
      const now = new Date();
      
      cart.items.forEach((item) => {
        if (item.variant.isFlashSaleActive && item.variant.flashSaleEnd) {
          const endTime = new Date(item.variant.flashSaleEnd);
          const timeLeftMs = endTime.getTime() - now.getTime();
          const timeLeftSeconds = Math.floor(timeLeftMs / 1000);
          
          if (timeLeftSeconds > 0) {
            const days = Math.floor(timeLeftSeconds / 86400);
            const hours = Math.floor((timeLeftSeconds % 86400) / 3600);
            const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
            const seconds = timeLeftSeconds % 60;
            
            if (days > 0) {
              newTimers[item.id] = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
              newTimers[item.id] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
          } else {
            newTimers[item.id] = 'Ended';
          }
        }
      });
      
      setFlashSaleTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [cart]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await CartService.getCart();
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        // If error is authentication related, show empty cart
        if (response.message?.includes('401') || response.message?.includes('authentication')) {
          setCart(null);
        } else {
          console.error('Cart load error:', response.message);
          // Don't show error alert for server errors, just show empty cart
          setCart(null);
        }
      }
    } catch (error: any) {
      console.error('Error loading cart:', error);
      // Don't show error alert, just show empty cart
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (!cart || !cart.items || cart.items.length === 0) return;
    
    if (selectedItems.size === cart.items.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(cart.items.map(item => item.id)));
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    
    try {
      const response = await CartService.updateItem({
        cartItemId,
        quantity: newQuantity,
      });

      if (response.success && response.data) {
        setCart(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = (cartItemId: string) => {
    const executeRemove = async () => {
      setUpdatingItems(prev => new Set(prev).add(cartItemId));
      try {
        const response = await CartService.removeItem(cartItemId);
        if (response.success) {
          await loadCart();
        } else {
          Alert.alert('Error', response.message || 'Failed to remove item');
        }
      } catch (error) {
        console.error('Error removing item:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(cartItemId);
          return newSet;
        });
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Remove Item',
          message: 'Are you sure you want to remove this item from cart?',
          options: ['Cancel', 'Remove'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            executeRemove();
          }
        }
      );
    } else {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: executeRemove,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleClearCart = () => {
    const executeClear = async () => {
      setIsLoading(true);
      try {
        const response = await CartService.clearCart();
        if (response.success) {
          await loadCart();
        } else {
          Alert.alert('Error', response.message || 'Failed to clear cart');
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Clear Cart',
          message: 'Are you sure you want to remove all items from cart?',
          options: ['Cancel', 'Clear All'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            executeClear();
          }
        }
      );
    } else {
      Alert.alert(
        'Clear Cart',
        'Are you sure you want to remove all items from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: executeClear,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before checkout');
      return;
    }
    if (selectedItems.size === 0) {
      Alert.alert('No Items Selected', 'Please select items to checkout');
      return;
    }
    const selectedCartItems = cart.items.filter(item => selectedItems.has(item.id));
    // Navigate to checkout screen
    navigation.navigate('Checkout', { items: selectedCartItems });
  };

  const renderCartItem = (item: CartItem) => {
    const isUpdating = updatingItems.has(item.id);
    const isSelected = selectedItems.has(item.id);
    const attributesText = item.variant.attributes
      .map(attr => `${attr.name}: ${attr.value}`)
      .join(', ');
    
    const hasFlashSale = item.variant.isFlashSaleActive;
    const flashSalePrice = item.variant.flashSalePrice;
    const originalPrice = item.variant.price;
    const discountPercent = item.variant.discountPercent;
    const timeLeft = flashSaleTimers[item.id] || '';

    return (
      <View key={item.id} style={styles.cartItem}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleSelectItem(item.id)}
        >
          <Ionicons 
            name={isSelected ? "checkbox" : "square-outline"} 
            size={24} 
            color={isSelected ? "#2563eb" : "#999"} 
          />
        </TouchableOpacity>
        
        <View style={styles.itemImageContainer}>
          {item.productImage ? (
            <Image
              source={{ uri: getCloudinaryUrl(item.productImage) }}
              style={styles.itemImage}
            />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="cube-outline" size={40} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.productName}
          </Text>
          {item.productShopName && (
            <View style={styles.shopInfo}>
              <Ionicons name="storefront-outline" size={12} color="#666" />
              <Text style={styles.shopName}>{item.productShopName}</Text>
            </View>
          )}
          {attributesText && (
            <Text style={styles.itemAttributes} numberOfLines={1}>
              {attributesText}
            </Text>
          )}
          
          {hasFlashSale && (
            <View style={styles.flashSaleBadge}>
              <Ionicons name="flash" size={10} color="#fff" />
              <Text style={styles.flashSaleBadgeText}>FLASH SALE -{discountPercent}%</Text>
              {timeLeft && (
                <Text style={styles.flashSaleTimer}>⏱️ {timeLeft}</Text>
              )}
            </View>
          )}
          
          <View style={styles.itemFooter}>
            {hasFlashSale && flashSalePrice ? (
              <View style={styles.priceContainer}>
                <Text style={styles.itemFlashPrice}>
                  {flashSalePrice.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.itemOriginalPrice}>
                  {originalPrice.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            ) : (
              <Text style={styles.itemPrice}>
                {item.variant.price.toLocaleString('vi-VN')}đ
              </Text>
            )}
            
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, isUpdating && styles.quantityButtonDisabled]}
                onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={isUpdating}
              >
                <Ionicons name="remove" size={16} color={isUpdating ? '#ccc' : '#333'} />
              </TouchableOpacity>
              
              {isUpdating ? (
                <ActivityIndicator size="small" color="#2563eb" style={styles.quantityValue} />
              ) : (
                <Text style={styles.quantityValue}>{item.quantity}</Text>
              )}
              
              <TouchableOpacity
                style={[styles.quantityButton, isUpdating && styles.quantityButtonDisabled]}
                onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                disabled={isUpdating || item.quantity >= item.variant.stock}
              >
                <Ionicons name="add" size={16} color={isUpdating || item.quantity >= item.variant.stock ? '#ccc' : '#333'} />
              </TouchableOpacity>
            </View>
          </View>

          {item.variant.stock < 10 && (
            <Text style={styles.stockWarning}>
              Only {item.variant.stock} left in stock
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
          disabled={isUpdating}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4757" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        {!isEmpty && (
          <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="#ff4757" />
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-outline" size={100} color="#ddd" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items to get started</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Select All Header */}
            <View style={styles.selectAllContainer}>
              <TouchableOpacity 
                style={styles.selectAllButton}
                onPress={toggleSelectAll}
              >
                <Ionicons 
                  name={selectedItems.size === (cart?.items?.length || 0) ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={selectedItems.size === (cart?.items?.length || 0) ? "#2563eb" : "#999"} 
                />
                <Text style={styles.selectAllText}>Select All</Text>
              </TouchableOpacity>
              <Text style={styles.itemCount}>
                {selectedItems.size}/{cart?.items?.length || 0} selected
              </Text>
            </View>

            <View style={styles.itemsContainer}>
              {cart?.items?.map(item => renderCartItem(item))}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerSummary}>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Subtotal ({selectedItems.size} items):</Text>
                <Text style={styles.footerSubtotal}>
                  {cart.items
                    .filter(item => selectedItems.has(item.id))
                    .reduce((sum, item) => sum + item.subtotal, 0)
                    .toLocaleString('vi-VN')}đ
                </Text>
              </View>
              {/* <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Shipping:</Text>
                <Text style={styles.footerShipping}>Free</Text>
              </View> */}
              <View style={styles.footerDivider} />
              <View style={styles.footerRow}>
                <Text style={styles.footerTotalLabel}>Total:</Text>
                <Text style={styles.footerTotal}>
                  {cart.items
                    .filter(item => selectedItems.has(item.id))
                    .reduce((sum, item) => sum + item.subtotal, 0)
                    .toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[
                styles.checkoutButton,
                selectedItems.size === 0 && styles.checkoutButtonDisabled,
              ]}
              onPress={handleCheckout}
              disabled={selectedItems.size === 0}
            >
              <Text style={styles.checkoutButtonText}>
                Checkout ({selectedItems.size})
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  shopButton: {
    marginTop: 24,
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
  content: {
    flex: 1,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  itemsContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  checkbox: {
    paddingTop: 4,
    paddingRight: 8,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  shopName: {
    fontSize: 11,
    color: '#666',
  },
  itemAttributes: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  flashSaleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  flashSaleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  flashSaleTimer: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemFlashPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  itemOriginalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  quantityValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  stockWarning: {
    fontSize: 11,
    color: '#ff4757',
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  footerSummary: {
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerLabel: {
    fontSize: 13,
    color: '#666',
  },
  footerSubtotal: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  footerShipping: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  footerTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  checkoutButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
