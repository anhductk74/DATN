"use client";

import { Card, Skeleton } from "antd";

export default function FormSkeleton() {
  return (
    <Card className="shadow-lg" bordered={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 1 }} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <Skeleton.Avatar active size={128} shape="square" className="mb-4" />
            <Skeleton.Button active size="default" />
          </div>
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 1 }} />
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
        <Skeleton.Button active size="large" />
        <Skeleton.Button active size="large" />
      </div>
    </Card>
  );
}
