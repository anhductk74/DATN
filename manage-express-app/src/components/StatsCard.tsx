import { Card, Statistic } from 'antd';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  color?: string;
  formatter?: (value: number | string) => string;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  prefix,
  suffix,
  color,
  formatter,
  loading = false
}: StatsCardProps) {
  return (
    <Card loading={loading} bordered={false}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ color }}
        formatter={formatter}
      />
    </Card>
  );
}