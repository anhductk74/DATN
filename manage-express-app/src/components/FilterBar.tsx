import { Button, Space, Input, Select, DatePicker } from 'antd';
import { SearchOutlined, FilterOutlined, ExportOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

const { RangePicker } = DatePicker;

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusOptions?: Array<{ label: string; value: string }>;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  showDateRange?: boolean;
  onDateRangeChange?: (dates: any) => void;
  extraFilters?: ReactNode;
  actions?: ReactNode;
  onExport?: () => void;
  showExport?: boolean;
}

export default function FilterBar({
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  statusOptions = [],
  statusValue,
  onStatusChange,
  showDateRange = false,
  onDateRangeChange,
  extraFilters,
  actions,
  onExport,
  showExport = true
}: FilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <Space wrap>
          {/* Search Input */}
          {onSearchChange && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              allowClear
            />
          )}

          {/* Status Filter */}
          {statusOptions.length > 0 && (
            <Select
              style={{ width: 150 }}
              value={statusValue}
              onChange={onStatusChange}
              placeholder="Trạng thái"
            >
              {statusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          )}

          {/* Date Range */}
          {showDateRange && (
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={onDateRangeChange}
            />
          )}

          {/* Extra Filters */}
          {extraFilters}
        </Space>

        <Space>
          {/* Custom Actions */}
          {actions}

          {/* Export Button */}
          {showExport && onExport && (
            <Button icon={<ExportOutlined />} onClick={onExport}>
              Xuất Excel
            </Button>
          )}

          {/* Advanced Filter Button */}
          <Button icon={<FilterOutlined />}>
            Lọc nâng cao
          </Button>
        </Space>
      </div>
    </div>
  );
}