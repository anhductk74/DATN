import { Card, Empty, Spin } from 'antd';
import { ReactNode } from 'react';

interface DataTableProps {
  title?: string;
  extra?: ReactNode;
  loading?: boolean;
  children: ReactNode;
  empty?: boolean;
  emptyDescription?: string;
}

export default function DataTable({
  title,
  extra,
  loading = false,
  children,
  empty = false,
  emptyDescription = 'Không có dữ liệu'
}: DataTableProps) {
  return (
    <Card
      title={title}
      extra={extra}
      bordered={false}
      style={{ marginBottom: '16px' }}
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : empty ? (
        <Empty description={emptyDescription} />
      ) : (
        children
      )}
    </Card>
  );
}