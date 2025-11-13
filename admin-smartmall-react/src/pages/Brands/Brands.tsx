import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Input, Card, Typography } from 'antd';
import { SearchOutlined, ShopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useBrands } from '../../hooks/useBrands';
import type { Brand } from '../../types/brand.types';
import './Brands.css';

const { Title } = Typography;

function Brands() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const { data: brands, isLoading } = useBrands();

  // Filter brands based on search
  const filteredBrands = brands?.filter((brand) =>
    brand.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle brand click - navigate to products page with brand filter
  const handleBrandClick = (brandName: string) => {
    navigate(`/dashboard/products?brand=${encodeURIComponent(brandName)}`);
  };

  const columns: ColumnsType<Brand> = [
    {
      title: 'No.',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: unknown, __: Brand, index: number) => (
        <span style={{ fontWeight: 500 }}>{index + 1}</span>
      ),
    },
    {
      title: 'Brand Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span
          className="brand-name-link"
          onClick={() => handleBrandClick(name)}
        >
          <ShopOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {name}
        </span>
      ),
    },
    {
      title: 'Product Count',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 150,
      align: 'center',
      sorter: (a: Brand, b: Brand) => a.productCount - b.productCount,
      render: (count: number) => (
        <span style={{ fontWeight: 500, color: '#52c41a' }}>
          {count.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="brands-container">
      <Card>
        <div className="brands-header">
          <Title level={2}>Brand Management</Title>
          <div className="brands-actions">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search brands..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBrands}
          rowKey="name"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} brands`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>
    </div>
  );
}

export default Brands;
