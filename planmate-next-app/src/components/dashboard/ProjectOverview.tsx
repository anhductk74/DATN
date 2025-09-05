import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Project } from '@/types';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { CalendarIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ProjectOverviewProps {
  projects: Project[];
}

export function ProjectOverview({ projects }: ProjectOverviewProps) {
  const activeProjects = projects.filter(p => p.status === 'in-progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const upcomingDeadlines = projects
    .filter(p => getDaysRemaining(p.endDate) <= 7 && p.status !== 'completed')
    .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Dự án đang thực hiện
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeProjects.length}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {projects.length} tổng số dự án
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Dự án hoàn thành
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedProjects.length}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round((completedProjects.length / projects.length) * 100)}% tỷ lệ hoàn thành
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Deadline sắp tới
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{upcomingDeadlines.length}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trong 7 ngày tới
          </p>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Dự án đang thực hiện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeProjects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      {project.members?.length || 0} thành viên
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {formatDate(project.endDate)}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {getDaysRemaining(project.endDate)} ngày
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <span>Tiến độ</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </div>
                <Badge 
                  variant="priority"
                  priority={project.priority}
                  className="ml-4"
                >
                  {project.priority === 'high' ? 'Cao' : 
                   project.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Deadline sắp tới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 4).map((project) => (
              <div key={project.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {project.name}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {getDaysRemaining(project.endDate)} ngày
                  </div>
                </div>
                <Badge 
                  variant="default"
                  className="text-xs"
                >
                  {formatDate(project.endDate)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
