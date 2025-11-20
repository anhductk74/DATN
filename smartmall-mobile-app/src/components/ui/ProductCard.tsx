import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  horizontal?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress,
  horizontal = false 
}) => {
  const variant = product.variants?.[0];
  const imageUrl = product.images?.[0] || 'https://via.placeholder.com/200';

  if (horizontal) {
    return (
      <TouchableOpacity 
        style={styles.horizontalCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.horizontalImage}
        />
        <View style={styles.horizontalInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productBrand} numberOfLines={1}>
            {product.brand}
          </Text>
          {variant && (
            <Text style={styles.productPrice}>
              {variant.price.toLocaleString('vi-VN')} đ
            </Text>
          )}
          <View style={styles.productFooter}>
            {product.averageRating ? (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.ratingText}>
                  {product.averageRating.toFixed(1)}
                </Text>
              </View>
            ) : null}
            {variant && variant.stock > 0 ? (
              <Text style={styles.stockText}>Còn hàng</Text>
            ) : (
              <Text style={styles.outOfStock}>Hết hàng</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.card, { width: CARD_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productBrand} numberOfLines={1}>
          {product.brand}
        </Text>
        {variant && (
          <Text style={styles.productPrice}>
            {variant.price.toLocaleString('vi-VN')} đ
          </Text>
        )}
        <View style={styles.productFooter}>
          {product.averageRating ? (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.ratingText}>
                {product.averageRating.toFixed(1)}
              </Text>
            </View>
          ) : null}
          {variant && variant.stock > 0 ? (
            <Text style={styles.stockText}>Còn hàng</Text>
          ) : (
            <Text style={styles.outOfStock}>Hết hàng</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  horizontalCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
  },
  horizontalImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
  },
  productInfo: {
    padding: 12,
  },
  horizontalInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  stockText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
  outOfStock: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '500',
  },
});
