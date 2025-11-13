import { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Image,
  Typography,
  Tooltip,
  App,
  Select,
  Popconfirm,
} from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useProducts, useSoftDeleteProduct } from '../../hooks/useProducts';
import type { Product } from '../../types/product.types';
import { getCloudinaryUrl, DEFAULT_PRODUCT_IMAGE } from '../../config/config';
import './Products.css';

const { Title } = Typography;

export default function Products() {
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Fetch all products with React Query (with cache)
  const { data: productsData, isLoading, refetch } = useProducts(page, pageSize);
  const softDeleteMutation = useSoftDeleteProduct();

  // Client-side filtering from cached data
  const allProducts = productsData?.data?.products || [];
  
  const filteredProducts = allProducts.filter((product) => {
    // Filter by search text
    if (searchText && !product.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    
    // Filter by status
    if (statusFilter && product.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  const products = filteredProducts;
  const loading = isLoading;
  
  const pagination = {
    current: (productsData?.data?.currentPage || 0) + 1,
    pageSize: productsData?.data?.pageSize || 20,
    total: productsData?.data?.totalItems || 0,
  };

  const handleTableChange: TableProps<Product>['onChange'] = (newPagination: TablePaginationConfig) => {
    const newPage = (newPagination.current || 1) - 1;
    const newSize = newPagination.pageSize || 20;
    setPage(newPage);
    setPageSize(newSize);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    // No need to reset page, filtering is client-side
  };

  const handleDelete = async (id: string) => {
    try {
      await softDeleteMutation.mutateAsync(id);
      message.success('Product deleted successfully');
    } catch (error) {
      message.error('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const handleRefresh = () => {
    setSearchText('');
    setStatusFilter('');
    setPage(0);
    refetch();
  };

  // No need for debounce anymore since it's client-side filtering

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      case 'OUT_OF_STOCK':
        return 'orange';
      default:
        return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const columns: TableProps<Product>['columns'] = [
    {
      title: 'No.',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: unknown, __: Product, index: number) => (
        <span style={{ fontWeight: 500 }}>
          {(page * pageSize) + index + 1}
        </span>
      ),
    },
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images: string[]) => {
        const imageUrl = images?.[0] ? getCloudinaryUrl(images[0]) : DEFAULT_PRODUCT_IMAGE;
        return (
          <Image
            width={60}
            height={60}
            src={imageUrl}
            alt="Product"
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback={DEFAULT_PRODUCT_IMAGE}
            preview={{
              src: imageUrl,
            }}
          />
        );
      },
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string, record: Product) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            Brand: {record.brand}
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 150,
    },
    {
      title: 'Shop',
      dataIndex: ['shop', 'name'],
      key: 'shop',
      width: 150,
    },
    {
      title: 'Price Range',
      key: 'price',
      width: 150,
      render: (_, record: Product) => {
        if (!record.variants || record.variants.length === 0) {
          return <span style={{ color: '#999' }}>N/A</span>;
        }
        
        const prices = record.variants.map(v => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (minPrice === maxPrice) {
          return formatPrice(minPrice);
        }
        return (
          <div>
            <div>{formatPrice(minPrice)}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              to {formatPrice(maxPrice)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Stock',
      key: 'stock',
      width: 100,
      render: (_, record: Product) => {
        const totalStock = record.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
        return (
          <Tag color={totalStock > 0 ? 'blue' : 'red'}>
            {totalStock}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Rating',
      key: 'rating',
      width: 100,
      render: (_, record: Product) => (
        <div>
          {record.averageRating ? (
            <>
              <span style={{ color: '#faad14', fontWeight: 500 }}>
                ⭐ {record.averageRating.toFixed(1)}
              </span>
              <div style={{ fontSize: 12, color: '#999' }}>
                ({record.reviewCount} reviews)
              </div>
            </>
          ) : (
            <span style={{ color: '#999' }}>No reviews</span>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record: Product) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete product"
              description="Are you sure you want to delete this product?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="products-page">
      <div className="products-header">
        <Title level={2}>Products Management</Title>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Add Product
        </Button>
      </div>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div className="products-filters">
            <Space wrap>
              <Input
                placeholder="Search products (instant filter)..."
                allowClear
                size="large"
                style={{ width: 350 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined style={{ color: '#999' }} />}
              />
              <Select
                placeholder="Filter by status"
                allowClear
                size="large"
                style={{ width: 200 }}
                value={statusFilter || undefined}
                onChange={handleStatusFilter}
                options={[
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Inactive', value: 'INACTIVE' },
                  { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
                ]}
              />
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </Space>
          </div>

          <Table<Product>
            columns={columns}
            dataSource={products}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} products`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1400 }}
          />
        </Space>
      </Card>
    </div>
  );
}
