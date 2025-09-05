'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { formatDate } from '@/lib/utils';
import { mockProjects, mockTasks, mockUsers } from '@/lib/mockData';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const totalProjects = mockProjects.length;
  const completedProjects = mockProjects.filter(p => p.status === 'completed').length;
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
  const overdueTasks = mockTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  ).length;

  const projectCompletionRate = Math.round((completedProjects / totalProjects) * 100);
  const taskCompletionRate = Math.round((completedTasks / totalTasks) * 100);

  // Team performance data
  const teamPerformance = mockUsers.map(user => {
    const userTasks = mockTasks.filter(t => t.assignee?.id === user.id);
    const userCompletedTasks = userTasks.filter(t => t.status === 'completed');
    const completionRate = userTasks.length > 0 ? Math.round((userCompletedTasks.length / userTasks.length) * 100) : 0;
    
    return {
      ...user,
      totalTasks: userTasks.length,
      completedTasks: userCompletedTasks.length,
      completionRate
    };
  });

  // Project status distribution
  const projectStatusData = [
    { status: 'Hoàn thành', count: mockProjects.filter(p => p.status === 'completed').length, color: 'bg-green-500' },
    { status: 'Đang thực hiện', count: mockProjects.filter(p => p.status === 'in-progress').length, color: 'bg-blue-500' },
    { status: 'Lên kế hoạch', count: mockProjects.filter(p => p.status === 'planning').length, color: 'bg-yellow-500' },
    { status: 'Tạm dừng', count: mockProjects.filter(p => p.status === 'on-hold').length, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
        <p className="mt-2 text-gray-600">
          Theo dõi hiệu suất và phân tích dữ liệu dự án
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng dự án</p>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành dự án</p>
                <p className="text-2xl font-bold text-green-600">{projectCompletionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành task</p>
                <p className="text-2xl font-bold text-purple-600">{taskCompletionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Task quá hạn</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố trạng thái dự án</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.count / totalProjects) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất làm việc nhóm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{member.completionRate}%</p>
                    <p className="text-sm text-gray-600">
                      {member.completedTasks}/{member.totalTasks} hoàn thành
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Dự án gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        {project.members.length}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDate(project.endDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="status" status={project.status}>
                      {project.status}
                    </Badge>
                    <div className="w-16">
                      <Progress value={project.progress} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chi tiết về nhiệm vụ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
                  <p className="text-sm text-gray-600">Tổng nhiệm vụ</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                  <p className="text-sm text-gray-600">Đã hoàn thành</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cần làm</span>
                  <span className="font-medium">{mockTasks.filter(t => t.status === 'todo').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Đang thực hiện</span>
                  <span className="font-medium">{mockTasks.filter(t => t.status === 'in-progress').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Chờ review</span>
                  <span className="font-medium">{mockTasks.filter(t => t.status === 'review').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Quá hạn</span>
                  <span className="font-medium text-red-600">{overdueTasks}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
