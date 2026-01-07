"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Row, 
  Col, 
  Statistic, 
  Image,
  Tag,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Upload,
  Divider,
  Tabs,
  Badge,
  Switch,
  Popconfirm,
  Spin
} from "antd";
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  UploadOutlined,
  StarFilled,
  ExclamationCircleOutlined,
  UndoOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import { getCloudinaryUrl } from "@/config/config";
import { useSession } from "next-auth/react";
import { useAntdApp } from "@/hooks/useAntdApp";
import type { ColumnsType } from 'antd/es/table';
import type { Product, ProductVariant, ProductAttribute, CreateProductData, UpdateProductData, FlashSaleProductDto } from "@/services/ProductService";
import productService from "@/services/ProductService";
import categoryService from "@/services/CategoryService";
import shopService from "@/services/ShopService";
import type { Category } from "@/services/CategoryService";
import AddProductForm, { AddProductFormRef } from "./AddProductForm";
import EditProductForm from "./EditProductForm";
import FlashSaleModal from "./FlashSaleModal";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function ProductManagement() {
  const { data: session } = useSession();
  const { message } = useAntdApp();
  const addFormRef = useRef<AddProductFormRef>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'deleted' | 'flashsale' | 'flashsale-upcoming'>('active'); // Tab mode
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isFlashSaleModalVisible, setIsFlashSaleModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [allProductsCount, setAllProductsCount] = useState({
    total: 0,
    active: 0,
    flashSale: 0,
    deleted: 0,
    totalVariants: 0,
  });

  // Fetch shop ID first, then products/categories
  useEffect(() => {
    if (session?.user?.id) {
      fetchShopId();
    }
  }, [session]);

  const fetchShopId = async () => {
    if (!session?.user?.id) {
      message.warning('Please login to view your products');
      return;
    }

    try {
      // Get shop by owner ID (user ID)
      const response = await shopService.getShopsByOwner(session.user.id);
      const shops = response.data;
      
      if (shops && shops.length > 0) {
        // Assume user has one shop, take the first one
        setShopId(shops[0].id);
      } else {
        message.warning('No shop found for this account. Please create a shop first.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error fetching shop:', error);
      message.error(error.response?.data?.message || 'Failed to load shop information');
      setLoading(false);
    }
  };

  // Fetch products when shopId is available or viewMode changes
  useEffect(() => {
    if (shopId) {
      fetchData();
    }
  }, [shopId, viewMode]);

  const fetchData = async () => {
    if (!shopId) {
      return;
    }

    setLoading(true);
    try {
      // Fetch products based on view mode
      let productsData: Product[];
      
      // Fetch statistics data only once (not dependent on viewMode)
      if (viewMode === 'active' || viewMode === 'flashsale') {
        try {
          const [activeProds, deletedProds, flashSaleResponse] = await Promise.all([
            productService.getProductsByShop(shopId),
            productService.getDeletedProducts(),
            productService.getShopFlashSales(shopId, 0, 1000).catch(() => ({ content: [] }))
          ]);
          
          const deletedByShop = deletedProds.filter(p => p.shopId === shopId || p.shop?.id === shopId);
          
          // Count unique products with flash sale
          let flashSaleProductCount = 0;
          if (flashSaleResponse.content.length > 0) {
            // Use Set with productName since productId might not be in response
            const uniqueProducts = new Set(
              flashSaleResponse.content
                .map(v => (v as any).productName || v.productId)
                .filter(Boolean)
            );
            flashSaleProductCount = uniqueProducts.size;
            console.log('📊 Flash sale stats:', {
              variants: flashSaleResponse.content.length,
              uniqueProducts: flashSaleProductCount,
              productNames: Array.from(uniqueProducts)
            });
          }
          
          setAllProductsCount({
            total: activeProds.length,
            active: activeProds.filter(p => p.status === 'ACTIVE').length,
            flashSale: flashSaleProductCount,
            deleted: deletedByShop.length,
            totalVariants: activeProds.reduce((sum, p) => sum + (p.variants?.length || 0), 0),
          });
        } catch (err) {
          console.warn('Could not fetch stats:', err);
        }
      }
      
      if (viewMode === 'deleted') {
        productsData = await productService.getDeletedProducts();
        // Filter by shop
        productsData = productsData.filter(p => p.shopId === shopId);
      } else if (viewMode === 'all') {
        console.log('📋 Fetching ALL products for shop:', shopId);
        // Get active products by shop first
        const activeProducts = await productService.getProductsByShop(shopId);
        
        // Get deleted products
        const deletedProducts = await productService.getDeletedProducts();
        const deletedByShop = deletedProducts.filter(p => p.shopId === shopId || p.shop?.id === shopId);
        
        // Combine active and deleted
        productsData = [...activeProducts, ...deletedByShop];
        console.log('📦 Total products (active + deleted):', productsData.length);
        console.log('   Active:', activeProducts.length);
        console.log('   Deleted:', deletedByShop.length);
        
        // Enrich with flash sale data (optional, won't break if fails)
        try {
          const flashSaleResponse = await productService.getAllShopFlashSales(shopId, 0, 1000);
          const flashSaleVariants = flashSaleResponse.content;
          
          if (flashSaleVariants.length > 0) {
            const flashSaleMap = new Map<string, ProductVariant>();
            flashSaleVariants.forEach(fsVariant => {
              if (fsVariant.id) {
                flashSaleMap.set(fsVariant.id, fsVariant);
              }
            });
            
            productsData = productsData.map(product => {
              const enrichedVariants = product.variants.map(v => {
                const flashSaleVariant = flashSaleMap.get(v.id || '');
                if (flashSaleVariant) {
                  return {
                    ...v,
                    flashSalePrice: flashSaleVariant.flashSalePrice,
                    flashSaleStartTime: (flashSaleVariant as any).flashSaleStart || flashSaleVariant.flashSaleStartTime,
                    flashSaleEndTime: (flashSaleVariant as any).flashSaleEnd || flashSaleVariant.flashSaleEndTime,
                    flashSaleQuantity: flashSaleVariant.flashSaleQuantity,
                    isFlashSaleActive: flashSaleVariant.isFlashSaleActive,
                    discountPercent: flashSaleVariant.discountPercent,
                  };
                }
                return v;
              });
              return { ...product, variants: enrichedVariants };
            });
            console.log('✅ Enriched all products with flash sale data');
          }
        } catch (enrichError) {
          console.warn('⚠️ Could not enrich all products with flash sale data:', enrichError);
          // Continue with products without flash sale data
        }
      } else if (viewMode === 'flashsale') {
        // Use shop-specific flash sale endpoint as per FLASH_SALE_API_README.md
        // GET /api/products/shops/{shopId}/flash-sales/all
        console.log('📡 Fetching flash sale products for shop:', shopId);
        
        try {
          // Get flash sale variants from shop
          const flashSaleResponse = await productService.getAllShopFlashSales(shopId, 0, 1000);
          console.log('🔍 Full API Response:', JSON.stringify(flashSaleResponse, null, 2));
          
          const flashSaleVariants = flashSaleResponse.content;
          
          console.log('🔍 Flash sale variants from API:', flashSaleVariants.length);
          console.log('📦 Sample flash sale variant:', JSON.stringify(flashSaleVariants[0], null, 2));
          
          if (flashSaleVariants.length === 0) {
            console.warn('⚠️ No flash sale variants returned from API');
            console.log('💡 Make sure:');
            console.log('   1. You have set flash sale for some products');
            console.log('   2. Flash sale is currently ACTIVE (between startTime and endTime)');
            console.log('   3. Backend endpoint /products/shops/' + shopId + '/flash-sales is working');
            productsData = [];
          } else {
            // Check if API returns product info in variants
            const hasProductInfo = flashSaleVariants[0]?.productId && flashSaleVariants[0]?.productName;
            
            if (hasProductInfo) {
              console.log('✅ API returns product info - using optimized path');
              // Group variants by productId to reconstruct products
              const productMap = new Map<string, {
                productInfo: {
                  id: string;
                  name: string;
                  brand: string;
                  images: string[];
                };
                variants: ProductVariant[];
              }>();
              
              flashSaleVariants.forEach(fsVariant => {
                if (!fsVariant.productId) return;
                
                if (!productMap.has(fsVariant.productId)) {
                  productMap.set(fsVariant.productId, {
                    productInfo: {
                      id: fsVariant.productId,
                      name: fsVariant.productName || '',
                      brand: fsVariant.productBrand || '',
                      images: fsVariant.productImages || [],
                    },
                    variants: []
                  });
                }
                
                productMap.get(fsVariant.productId)!.variants.push(fsVariant);
              });
              
              // Fetch full product details for each unique productId
              productsData = [];
              for (const [productId, data] of productMap.entries()) {
                try {
                  const fullProduct = await productService.getProductById(productId);
                  // Merge flash sale info into variants
                  fullProduct.variants = fullProduct.variants.map(v => {
                    const flashSaleVariant = data.variants.find(fsv => fsv.id === v.id);
                    if (flashSaleVariant) {
                      return { ...v, ...flashSaleVariant };
                    }
                    return v;
                  });
                  productsData.push(fullProduct);
                  console.log('✅ Added product:', fullProduct.name);
                } catch (error) {
                  console.error('Error fetching product:', productId, error);
                }
              }
            } else {
              console.log('⚠️ API does not return product info - using fallback path');
              // Fallback: Get all products from shop
              const shopProducts = await productService.getProductsByShop(shopId);
              console.log('🏪 All products from shop:', shopProducts.length);
              
              // Create a map of variantId -> flash sale variant
              const flashSaleMap = new Map<string, ProductVariant>();
              flashSaleVariants.forEach(fsVariant => {
                if (fsVariant.id) {
                  flashSaleMap.set(fsVariant.id, fsVariant);
                }
              });
              
              // Filter and enrich products
              productsData = shopProducts.filter(product => {
                const hasFlashSale = product.variants?.some(v => flashSaleMap.has(v.id || ''));
                
                if (hasFlashSale) {
                  product.variants = product.variants.map(v => {
                    const flashSaleVariant = flashSaleMap.get(v.id || '');
                    if (flashSaleVariant) {
                      return {
                        ...v,
                        flashSalePrice: flashSaleVariant.flashSalePrice,
                        flashSaleStartTime: (flashSaleVariant as any).flashSaleStart || flashSaleVariant.flashSaleStartTime,
                        flashSaleEndTime: (flashSaleVariant as any).flashSaleEnd || flashSaleVariant.flashSaleEndTime,
                        flashSaleQuantity: flashSaleVariant.flashSaleQuantity,
                        isFlashSaleActive: flashSaleVariant.isFlashSaleActive,
                        discountPercent: flashSaleVariant.discountPercent,
                      };
                    }
                    return v;
                  });
                }
                
                return hasFlashSale;
              });
            }
          }
          
          console.log('⚡ Total products with flash sale:', productsData.length);
        } catch (flashSaleError: any) {
          console.error('❌ Error fetching flash sales:', flashSaleError);
          console.error('Response:', flashSaleError.response?.data);
          console.error('Status:', flashSaleError.response?.status);
          // Fallback to empty array
          productsData = [];
        }
      } else {
        // Active products only (default behavior)
        productsData = await productService.getProductsByShop(shopId);
        console.log('📦 Active products fetched:', productsData.length);
        
        // Enrich products with flash sale data (if any)
        try {
          const flashSaleResponse = await productService.getAllShopFlashSales(shopId, 0, 1000);
          const flashSaleVariants = flashSaleResponse.content;
          
          console.log('⚡ Flash sale variants:', flashSaleVariants.length);
          
          if (flashSaleVariants.length > 0) {
            console.log('💎 Enriching active products with flash sale data');
            console.log('Sample flash sale variant:', flashSaleVariants[0]);
            
            // Create a map of variantId -> flash sale variant
            const flashSaleMap = new Map<string, ProductVariant>();
            flashSaleVariants.forEach(fsVariant => {
              if (fsVariant.id) {
                flashSaleMap.set(fsVariant.id, fsVariant);
              }
            });
            
            console.log('📋 Flash sale map size:', flashSaleMap.size);
            
            // Merge flash sale info into products
            productsData = productsData.map(product => {
              const enrichedVariants = product.variants.map(v => {
                const flashSaleVariant = flashSaleMap.get(v.id || '');
                if (flashSaleVariant) {
                  console.log('✅ Enriching variant:', v.sku, 'with flash sale data');
                  return {
                    ...v,
                    flashSalePrice: flashSaleVariant.flashSalePrice,
                    flashSaleStartTime: (flashSaleVariant as any).flashSaleStart || flashSaleVariant.flashSaleStartTime,
                    flashSaleEndTime: (flashSaleVariant as any).flashSaleEnd || flashSaleVariant.flashSaleEndTime,
                    flashSaleQuantity: flashSaleVariant.flashSaleQuantity,
                    isFlashSaleActive: flashSaleVariant.isFlashSaleActive,
                    discountPercent: flashSaleVariant.discountPercent,
                  };
                }
                return v;
              });
              
              return { ...product, variants: enrichedVariants };
            });
            
            console.log('✅ Enriched products with flash sale data');
          }
        } catch (enrichError) {
          console.warn('⚠️ Could not enrich with flash sale data:', enrichError);
          // Continue with products without flash sale data
        }
      }

      const categoriesData = await categoryService.getAllCategories();
      
      setProducts(productsData);
      setCategories(categoriesData);
      
      // Log flash sale statistics
      if (viewMode === 'flashsale') {
        const totalVariants = productsData.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
        const flashSaleVariants = productsData.reduce((sum, p) => 
          sum + (p.variants?.filter(v => v.flashSalePrice != null).length || 0), 0
        );
        console.log('📊 Flash Sale Stats:', {
          totalProducts: productsData.length,
          totalVariants,
          flashSaleVariants,
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      message.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData: CreateProductData, images: File[]) => {
    setSubmitting(true);
    try {
      const newProduct = await productService.createProduct(productData, images);
      message.success('Product created successfully!');
      // Close modal and reset form after success
      setIsAddModalVisible(false);
      addFormRef.current?.resetForm();
      // Refresh products list
      await fetchData();
    } catch (error: any) {
      console.error('Error creating product:', error);
      message.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = async (productId: string, updateData: UpdateProductData, images?: File[]) => {
    setSubmitting(true);
    try {
      await productService.updateProduct(productId, updateData, images);
      message.success('Product updated successfully!');
      setIsEditModalVisible(false);
      setSelectedProduct(null);
      // Refresh products list
      await fetchData();
    } catch (error: any) {
      console.error('Error updating product:', error);
      message.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      if (viewMode === 'deleted') {
        // Hard delete (permanent)
        await productService.deleteProduct(productId);
        message.success('Product permanently deleted!');
      } else {
        // Soft delete
        await productService.softDeleteProduct(productId);
        message.success('Product moved to trash!');
      }
      // Refresh products list
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      message.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleRestoreProduct = async (productId: string) => {
    try {
      await productService.restoreProduct(productId);
      message.success('Product restored successfully!');
      // Refresh products list
      await fetchData();
    } catch (error: any) {
      console.error('Error restoring product:', error);
      message.error(error.response?.data?.message || 'Failed to restore product');
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const duplicateData: CreateProductData = {
        name: `${product.name} (Copy)`,
        description: product.description,
        brand: product.brand,
        categoryId: product.categoryId,
        shopId: product.shopId,
        status: 'INACTIVE', // Set as inactive for review
        variants: (product.variants || []).map(v => ({
          sku: `${v.sku}-COPY`,
          price: v.price,
          stock: 0, // Reset stock for duplicate
          weight: v.weight,
          dimensions: v.dimensions,
          attributes: (v.attributes || []).map(a => ({
            attributeName: a.attributeName,
            attributeValue: a.attributeValue
          }))
        }))
      };
      
      await productService.createProduct(duplicateData);
      message.success('Product duplicated successfully!');
      await fetchData();
    } catch (error: any) {
      console.error('Error duplicating product:', error);
      message.error(error.response?.data?.message || 'Failed to duplicate product');
    }
  };

  // Calculate statistics based on stable counts
  const productStats = [
    {
      title: 'Total Products',
      value: allProductsCount.total,
      color: '#1890ff',
    },
    {
      title: 'Active Products',
      value: allProductsCount.active,
      color: '#52c41a',
    },
    {
      title: 'Flash Sale Products',
      value: allProductsCount.flashSale,
      color: '#ff4d4f',
    },
    {
      title: 'Total Variants',
      value: allProductsCount.totalVariants,
      color: '#722ed1',
    },
  ];

  const statusColors: { [key: string]: string } = {
    ACTIVE: 'green',
    INACTIVE: 'orange',
    OUT_OF_STOCK: 'red',
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase()) ||
      (product.variants || []).some(v => v.sku.toLowerCase().includes(searchText.toLowerCase()));
    
    // Handle both categoryId and nested category.id
    const productCategoryId = product.categoryId || product.category?.id;
    const matchesCategory = categoryFilter === 'all' || productCategoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getTotalStock = (product: Product): number => {
    return (product.variants || []).reduce((sum, variant) => sum + variant.stock, 0);
  };

  const getMinPrice = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) return 0;
    return Math.min(...product.variants.map(v => v.price));
  };

  const getMaxPrice = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) return 0;
    return Math.max(...product.variants.map(v => v.price));
  };

  const hasFlashSale = (product: Product): boolean => {
    return product.variants?.some(v => v.flashSalePrice != null) || false;
  };

  const getActiveFlashSaleCount = (product: Product): number => {
    return product.variants?.filter(v => v.isFlashSaleActive).length || 0;
  };

  // Dynamic columns based on viewMode
  const getColumns = (): ColumnsType<Product> => {
    const baseColumns: ColumnsType<Product> = [
    {
      title: 'Product',
      key: 'product',
      width: viewMode === 'flashsale' ? 250 : 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Image
            width={60}
            height={60}
            src={getCloudinaryUrl(record.images?.[0] || "/api/placeholder/60/60")}
            alt={record.name}
            className="rounded-md object-cover"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG8W+nBz+zLgEP6YaBWFuBpUVgZ0U1QmYrUcCAhIzEToiYzkg4zASbWCk5z8hw8z/n6urq6e7qf877e+pMNZd3/fTp+/7O/X37dM/oN8/oNQonAhV4wQGACJQgGHLPCJTgGT2oABGgAiJQgWH3SAnA7hGBChABKiACFaBtJAJEgAgQASJABCgAbaOxe6QEsHu8fACPn/7jc+sOEfjBn37+u3V3iGD3iAAREIEKEAEiQASIABEgAkSACEABKABto7F7pASweyJABKjAzXarCAYfLcTO4ntaFLKGjh//5ve7vr64iogAESACREAEiAARIAJEgAgQASJABIgAEaCYtI3G7pESgN3j5QN4+PhPN+8OEfxh53VEBChmy5fV2dSmZdGnZkdtP0iJwtfLQ9dCqtm/0623ZrznxbU73PdpydWwbV3ox9LaJ/d8+Z2bGCzk1jVkzcdsSMaXZTSVaXbUl2U0nar9wOYrmx///OZdZITxpxY+v/tzOdB1X1dRu0DayUmz3V9upSY3xb892u15EzXZmkLOLAtVZe8e2ddyi9av57etfSUGLa/L8+dK63uo8sZP75cCNgGATouCoT+bxoCXW6HaAOQNKG8yscfK5wPuhh9LlBBXlOp6lcJaFUas4nj5eNooKo1VoE0qtzM6Y6ShV9fd4CW13XDVZ8HQ1fdKMpfMTSjotlhpwhvxrTAXzJSJzslEaa/s8TW+f+1mfZ4yKjBNXJNznW7F0HnuGj1SDJsj1WmekdquHd1r9+uag2ZWxONWCJo89pqyrF5u2yd/enPzfTXQNczzcdMvv94VMa8ZOL2VKOifgkwC8gBszJdPa8Kq0izzlhnUhOz9lr0SCJvCfLHchGaM2qDSNIvX9DrWSWdzVfBp49nP0mwyh2Y8s6VaqB2tLDLRCjHNYeezK7SO5wi6jlbO2lRq5aUtssarv+02Zt47YaxAqxU6Dw29lutrwdEAz2eubPsqSm9VgtI+p2lsi8WIoqxpTKm+0NIBjdLdMhBaAgAAIABJREFU/o5Lwgxk"
            style={{ opacity: record.isDeleted ? 0.5 : 1 }}
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900 mb-1">
              {record.name}
              {record.isDeleted && (
                <Tag color="red" className="ml-2">DELETED</Tag>
              )}
              {hasFlashSale(record) && (
                <Tag color="volcano" icon={<ThunderboltOutlined />} className="ml-2">
                  FLASH SALE
                </Tag>
              )}
            </div>
            <div className="text-sm text-gray-500 mb-1">{record.brand}</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <StarFilled className="text-yellow-400 text-xs" />
                <span className="text-xs">{record.averageRating}</span>
                <span className="text-xs text-gray-400">({record.reviewCount})</span>
              </div>
              <Badge count={record.variants?.length || 0} showZero color="blue" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => category?.name || 'N/A'
    },
    {
      title: 'Total Stock',
      key: 'totalStock',
      width: 100,
      render: (_, record) => {
        const totalStock = getTotalStock(record);
        return (
          <span 
            className={
              totalStock === 0 ? 'text-red-500 font-medium' :
              totalStock < 10 ? 'text-orange-500 font-medium' :
              'text-green-600 font-medium'
            }
          >
            {totalStock}
          </span>
        );
      },
      sorter: (a, b) => getTotalStock(a) - getTotalStock(b),
    },
    {
      title: 'Flash Sale',
      key: 'flashSale',
      width: 150,
      render: (_, record) => {
        const flashSaleVariants = record.variants?.filter(v => v.flashSalePrice != null) || [];
        const activeCount = getActiveFlashSaleCount(record);
        
        if (flashSaleVariants.length === 0) {
          return <span className="text-gray-400 text-sm">No flash sale</span>;
        }
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <ThunderboltOutlined className="text-red-500" />
              <span className="text-sm font-medium">
                {flashSaleVariants.length} variant{flashSaleVariants.length > 1 ? 's' : ''}
              </span>
            </div>
            {activeCount > 0 && (
              <Tag color="success" className="m-0">
                {activeCount} Active Now
              </Tag>
            )}
            {activeCount === 0 && flashSaleVariants.length > 0 && (
              <Tag color="default" className="m-0">
                Scheduled/Expired
              </Tag>
            )}
          </div>
        );
      },
      filters: [
        { text: 'Has Flash Sale', value: 'has' },
        { text: 'Active Flash Sale', value: 'active' },
        { text: 'No Flash Sale', value: 'none' },
      ],
      onFilter: (value, record) => {
        const hasFS = hasFlashSale(record);
        const activeFS = getActiveFlashSaleCount(record) > 0;
        
        if (value === 'has') return hasFS;
        if (value === 'active') return activeFS;
        if (value === 'none') return !hasFS;
        return true;
      },
    },
    ];

    // Add flash sale specific columns when in flash sale view mode
    if (viewMode === 'flashsale') {
      const flashSaleColumns: ColumnsType<Product> = [
        {
          title: 'Original Price',
          key: 'originalPrice',
          width: 120,
          render: (_, record) => {
            const flashSaleVariants = record.variants?.filter(v => v.flashSalePrice != null) || [];
            if (flashSaleVariants.length === 0) return '-';
            
            const prices = flashSaleVariants.map(v => v.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            return (
              <div className="text-gray-500">
                {minPrice === maxPrice ? (
                  <span className="line-through">${minPrice.toLocaleString()}</span>
                ) : (
                  <span className="line-through">${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}</span>
                )}
              </div>
            );
          },
        },
        {
          title: 'Flash Sale Price',
          key: 'flashSalePrice',
          width: 140,
          render: (_, record) => {
            const flashSaleVariants = record.variants?.filter(v => v.flashSalePrice != null) || [];
            if (flashSaleVariants.length === 0) return '-';
            
            const prices = flashSaleVariants.map(v => v.flashSalePrice!);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const avgDiscount = flashSaleVariants.reduce((sum, v) => sum + (v.discountPercent || 0), 0) / flashSaleVariants.length;
            
            return (
              <div>
                <div className="font-bold text-red-600 text-base">
                  {minPrice === maxPrice ? (
                    <span>${minPrice.toLocaleString()}</span>
                  ) : (
                    <span>${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}</span>
                  )}
                </div>
                <Tag color="red" className="mt-1">
                  -{Math.round(avgDiscount)}%
                </Tag>
              </div>
            );
          },
          sorter: (a, b) => {
            const aMin = Math.min(...(a.variants?.filter(v => v.flashSalePrice).map(v => v.flashSalePrice!) || [Infinity]));
            const bMin = Math.min(...(b.variants?.filter(v => v.flashSalePrice).map(v => v.flashSalePrice!) || [Infinity]));
            return aMin - bMin;
          },
        },
        {
          title: 'Start Time',
          key: 'flashSaleStartTime',
          width: 160,
          render: (_, record) => {
            const flashSaleVariants = record.variants?.filter(v => v.flashSalePrice != null) || [];
            if (flashSaleVariants.length === 0) return '-';
            
            const startTimes = flashSaleVariants.map(v => v.flashSaleStartTime).filter(Boolean);
            if (startTimes.length === 0) return '-';
            
            const earliestStart = new Date(Math.min(...startTimes.map(t => new Date(t!).getTime())));
            
            return (
              <div className="text-sm">
                <div className="text-gray-900">
                  {earliestStart.toLocaleDateString('vi-VN')}
                </div>
                <div className="text-gray-500">
                  {earliestStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          },
        },
        {
          title: 'End Time',
          key: 'flashSaleEndTime',
          width: 160,
          render: (_, record) => {
            const flashSaleVariants = record.variants?.filter(v => v.flashSalePrice != null) || [];
            if (flashSaleVariants.length === 0) return '-';
            
            const endTimes = flashSaleVariants.map(v => v.flashSaleEndTime).filter(Boolean);
            if (endTimes.length === 0) return '-';
            
            const latestEnd = new Date(Math.max(...endTimes.map(t => new Date(t!).getTime())));
            const now = new Date();
            const isExpired = latestEnd < now;
            const isActive = flashSaleVariants.some(v => v.isFlashSaleActive);
            
            return (
              <div className="text-sm">
                <div className={isExpired ? 'text-red-500' : 'text-gray-900'}>
                  {latestEnd.toLocaleDateString('vi-VN')}
                </div>
                <div className={isExpired ? 'text-red-500' : 'text-gray-500'}>
                  {latestEnd.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {isActive && (
                  <Tag color="success" className="mt-1 text-xs">Active</Tag>
                )}
              </div>
            );
          },
        },
        {
          title: 'Flash Sale Qty',
          key: 'flashSaleQuantity',
          width: 130,
          render: (_, record) => {
            const flashSaleVariants = record.variants?.filter(v => v.flashSalePrice != null) || [];
            if (flashSaleVariants.length === 0) return '-';
            
            const variantCount = flashSaleVariants.length;
            
            // Debug: Log để kiểm tra data
            console.log('🔍 Flash Sale Variants:', flashSaleVariants.map(v => ({
              sku: v.sku,
              flashSaleQuantity: v.flashSaleQuantity,
              rawData: v
            })));
            
            // Nếu chỉ có 1 variant flash sale, hiển thị trực tiếp
            if (variantCount === 1) {
              const qty = flashSaleVariants[0].flashSaleQuantity;
              console.log('📊 Single variant qty:', qty, typeof qty);
              return (
                <div className="space-y-1">
                  <div className="font-bold text-orange-600 text-lg flex items-center gap-1">
                    <ThunderboltOutlined />
                    {qty != null && qty > 0 ? qty.toLocaleString() : '∞'}
                  </div>
                  <div className="text-xs text-gray-500">1 variant</div>
                </div>
              );
            }
            
            // Nếu có nhiều variants, hiển thị range
            const quantities = flashSaleVariants
              .map(v => v.flashSaleQuantity)
              .filter(q => q != null) as number[];
            
            if (quantities.length === 0) {
              return (
                <div className="space-y-1">
                  <div className="font-bold text-orange-600 text-lg flex items-center gap-1">
                    <ThunderboltOutlined />
                    ∞
                  </div>
                  <div className="text-xs text-gray-500">{variantCount} variants</div>
                </div>
              );
            }
            
            const minQty = Math.min(...quantities);
            const maxQty = Math.max(...quantities);
            
            return (
              <div className="space-y-1">
                <div className="font-bold text-orange-600 text-base flex items-center gap-1">
                  <ThunderboltOutlined />
                  {minQty === maxQty ? (
                    <span>{minQty > 0 ? minQty.toLocaleString() : '∞'}</span>
                  ) : (
                    <span>{minQty.toLocaleString()} - {maxQty.toLocaleString()}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {variantCount} variants
                </div>
              </div>
            );
          },
        },
      ];

      // Add flash sale columns to baseColumns
      baseColumns.push(...flashSaleColumns);
    }

    // Add Status, Created, and Actions columns
    baseColumns.push(
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: string) => (
          <Tag color={statusColors[status]}>
            {status.replace('_', ' ')}
          </Tag>
        ),
      },
      {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 100,
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 200,
        render: (_, record) => {
          const isDeleted = record.isDeleted;
          
          return (
            <Space size="small">
              <Tooltip title="View Details">
                <Button 
                  type="text" 
                  icon={<EyeOutlined />} 
                  size="small"
                  onClick={() => {
                    setSelectedProduct(record);
                    setIsDetailModalVisible(true);
                  }}
                />
              </Tooltip>
              
              {!isDeleted && (
                <>
                  <Tooltip title="Edit Product">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      size="small"
                      onClick={() => {
                        setSelectedProduct(record);
                        setIsEditModalVisible(true);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Flash Sale">
                    <Button 
                      type="text" 
                      icon={<ThunderboltOutlined />} 
                      size="small"
                      style={{ color: '#ff4d4f' }}
                      onClick={() => {
                        setSelectedProduct(record);
                        setIsFlashSaleModalVisible(true);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Duplicate Product">
                    <Button 
                      type="text" 
                      icon={<CopyOutlined />} 
                      size="small"
                      onClick={() => handleDuplicateProduct(record)}
                    />
                  </Tooltip>
                </>
              )}
              
              {isDeleted ? (
                <>
                  <Tooltip title="Restore Product">
                    <Popconfirm
                      title="Restore Product"
                      description="Do you want to restore this product?"
                      onConfirm={() => handleRestoreProduct(record.id!)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button 
                        type="text" 
                        icon={<UndoOutlined />}
                        size="small"
                        style={{ color: '#52c41a' }}
                      />
                    </Popconfirm>
                  </Tooltip>
                  <Tooltip title="Delete Permanently">
                    <Popconfirm
                      title="Permanently Delete Product"
                      description="Are you sure? This action CANNOT be undone!"
                      onConfirm={() => handleDeleteProduct(record.id!)}
                      okText="Yes, Delete Forever"
                      cancelText="Cancel"
                      icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                      <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        size="small"
                        danger
                      />
                    </Popconfirm>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title="Move to Trash">
                  <Popconfirm
                    title="Move to Trash"
                    description="Move this product to trash? You can restore it later."
                    onConfirm={() => handleDeleteProduct(record.id!)}
                    okText="Yes"
                    cancelText="No"
                    icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
                  >
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      size="small"
                      danger
                    />
                  </Popconfirm>
                </Tooltip>
              )}
            </Space>
          );
        },
      }
    );

    return baseColumns;
  };

  const columns = getColumns();

  const renderProductDetailModal = () => (
    <Modal
      title="Product Details"
      open={isDetailModalVisible}
      onCancel={() => setIsDetailModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
          Close
        </Button>,
        <Button key="edit" type="primary" onClick={() => {
          setIsDetailModalVisible(false);
          setIsEditModalVisible(true);
        }}>
          Edit Product
        </Button>
      ]}
      width={800}
    >
      {selectedProduct && (
        <div className="space-y-6">
          {/* Product Images */}
          <div>
            <h4 className="font-medium mb-3">Product Images</h4>
            <div className="flex gap-2">
              {selectedProduct.images?.map((image, index) => (
                <Image
                  key={index}
                  width={100}
                  height={100}
                  src={getCloudinaryUrl(image)}
                  alt={`${selectedProduct.name} ${index + 1}`}
                  className="rounded-md object-cover"
                />
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedProduct.name}</div>
                  <div><strong>Brand:</strong> {selectedProduct.brand}</div>
                  <div><strong>Category:</strong> {selectedProduct.category?.name}</div>
                  <div><strong>Status:</strong> 
                    <Tag color={statusColors[selectedProduct.status]} className="ml-2">
                      {selectedProduct.status.replace('_', ' ')}
                    </Tag>
                  </div>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="space-y-2">
                  <div><strong>Rating:</strong> 
                    <span className="ml-2 flex items-center gap-1">
                      <StarFilled className="text-yellow-400" />
                      {selectedProduct.averageRating} ({selectedProduct.reviewCount} reviews)
                    </span>
                  </div>
                  <div><strong>Total Stock:</strong> {getTotalStock(selectedProduct)}</div>
                  <div><strong>Variants:</strong> {selectedProduct.variants?.length || 0}</div>
                  <div><strong>Created:</strong> {new Date(selectedProduct.createdAt!).toLocaleDateString()}</div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <div className="text-gray-600">{selectedProduct.description}</div>
          </div>

          {/* Variants */}
          <div>
            <h4 className="font-medium mb-3">Product Variants</h4>
            <Table
              dataSource={selectedProduct.variants || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'SKU',
                  dataIndex: 'sku',
                  key: 'sku',
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => `$${price}`,
                },
                {
                  title: 'Stock',
                  dataIndex: 'stock',
                  key: 'stock',
                },
                {
                  title: 'Attributes',
                  dataIndex: 'attributes',
                  key: 'attributes',
                  render: (attributes: ProductAttribute[]) => (
                    <div className="space-x-1">
                      {(attributes || []).map((attr, index) => (
                        <Tag key={attr.id || index}>
                          {attr.attributeName}: {attr.attributeValue}
                        </Tag>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className="space-y-6">
      <Spin spinning={loading} tip="Loading products...">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          {productStats.map((stat, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  valueStyle={{ color: stat.color, fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters and Actions */}
        <Card>
          {/* View Mode Tabs */}
          <Tabs
            activeKey={viewMode}
            onChange={(key) => setViewMode(key as any)}
            className="mb-4"
            items={[
              {
                key: 'active',
                label: (
                  <span>
                    <Badge count={allProductsCount.total} showZero>
                      Active Products
                    </Badge>
                  </span>
                ),
              },
              {
                key: 'flashsale',
                label: (
                  <span>
                    <ThunderboltOutlined className="text-red-500 mr-1" />
                    <Badge 
                      count={allProductsCount.flashSale} 
                      showZero
                      style={{ backgroundColor: '#ff4d4f' }}
                    >
                      Flash Sale
                    </Badge>
                  </span>
                ),
              },
              {
                key: 'all',
                label: (
                  <span>
                    <Badge count={allProductsCount.total + allProductsCount.deleted} showZero>
                      All Products
                    </Badge>
                  </span>
                ),
              },
              {
                key: 'deleted',
                label: (
                  <span>
                    <Badge count={allProductsCount.deleted} showZero>
                      Trash
                    </Badge>
                  </span>
                ),
              },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Search
                placeholder="Search products, SKU, brand..."
                allowClear
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <Select
                placeholder="Category"
                style={{ width: 150 }}
                value={categoryFilter}
                onChange={setCategoryFilter}
              >
                <Option value="all">All Categories</Option>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
              {viewMode !== 'deleted' && viewMode !== 'flashsale' && (
                <Select
                  placeholder="Status"
                  style={{ width: 150 }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="all">All Status</Option>
                  <Option value="ACTIVE">Active</Option>
                  <Option value="INACTIVE">Inactive</Option>
                  <Option value="OUT_OF_STOCK">Out of Stock</Option>
                </Select>
              )}
            </div>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Add Product
            </Button>
          </div>
        </Card>

        {/* Products Table */}
        <Card 
          title={`Products (${filteredProducts.length})`}
          extra={
            <Space>
              <span className="text-sm text-gray-500">Bulk Actions:</span>
              <Button size="small">Delete Selected</Button>
              <Button size="small">Export Selected</Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} products`,
            }}
            scroll={{ x: 1400 }}
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
              },
            }}
          />
        </Card>
      </Spin>

      {/* Product Detail Modal */}
      {renderProductDetailModal()}

      {/* Add Product Form */}
      <AddProductForm
        ref={addFormRef}
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={handleAddProduct}
        loading={submitting}
        shopId={shopId || undefined}
      />

      {/* Edit Product Form */}
      <EditProductForm
        visible={isEditModalVisible}
        product={selectedProduct}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleEditProduct}
        loading={submitting}
      />

      {/* Flash Sale Modal */}
      <FlashSaleModal
        visible={isFlashSaleModalVisible}
        product={selectedProduct}
        onCancel={() => {
          setIsFlashSaleModalVisible(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          setIsFlashSaleModalVisible(false);
          setSelectedProduct(null);
          fetchData();
        }}
      />
    </div>
  );
}