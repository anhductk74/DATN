import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Task } from '@/types';
import { formatDate } from '@/lib/utils';
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';

interface TaskSummaryProps {
  tasks: Task[];
}

export function TaskSummary({ tasks }: TaskSummaryProps) {
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const reviewTasks = tasks.filter(t => t.status === 'review');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const myTasks = tasks.filter(t => t.assignee?.id === '1'); // Current user ID
  const overdueTasks = tasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  );

  const priorityTasks = tasks
    .filter(t => t.priority === 'high' || t.priority === 'urgent')
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Task Status Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Cần làm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{todoTasks.length}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">nhiệm vụ mới</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Đang thực hiện
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{inProgressTasks.length}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">nhiệm vụ đang làm</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Chờ review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{reviewTasks.length}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">cần xem xét</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Hoàn thành
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks.length}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">đã xong</p>
        </CardContent>
      </Card>

      {/* My Tasks */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Nhiệm vụ của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{task.title}</h4>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <UserIcon className="w-3 h-3 mr-1" />
                      {task.reporter.name}
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {formatDate(task.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="status" status={task.status}>
                    {task.status}
                  </Badge>
                  <Badge variant="priority" priority={task.priority}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Tasks & Overdue */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Nhiệm vụ ưu tiên & Quá hạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                  Quá hạn ({overdueTasks.length})
                </h4>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-400">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Hạn: {task.dueDate && formatDate(task.dueDate)}
                        </p>
                      </div>
                      <Badge variant="priority" priority={task.priority}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High Priority Tasks */}
            {priorityTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                  Ưu tiên cao ({priorityTasks.length})
                </h4>
                <div className="space-y-2">
                  {priorityTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {task.assignee?.name || 'Chưa phân công'}
                        </p>
                      </div>
                      <Badge variant="priority" priority={task.priority}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
