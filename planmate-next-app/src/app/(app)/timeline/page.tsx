'use client';

import { ProjectTimeline } from '@/components/project/ProjectTimeline';
import { mockProjects } from '@/lib/mockData';

export default function TimelinePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Timeline dự án</h1>
        <p className="mt-2 text-gray-600">
          Visualize tiến độ và lịch trình của tất cả các dự án
        </p>
      </div>

      {/* Timeline */}
      <ProjectTimeline projects={mockProjects} />
    </div>
  );
}
