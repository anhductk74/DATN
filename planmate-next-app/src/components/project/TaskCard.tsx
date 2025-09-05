'use client';

import { Card, Badge } from 'antd';
import { Task } from '@/types';
import { 
  CalendarOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  CommentOutlined 
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '../ThemeProvider';

interface TaskCardProps {
  task: Task;
  onUpdate?: (updates: Partial<Task>) => void;
  isDragging?: boolean;
}

const formatDate = (dateInput: string | Date) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-US');
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'red';
    case 'high': return 'red';
    case 'medium': return 'orange';
    default: return 'blue';
  }
};

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const { isDark } = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isDueSoon = task.dueDate && 
    new Date(task.dueDate).getTime() - new Date().getTime() <= 3 * 24 * 60 * 60 * 1000 &&
    task.status !== 'completed';

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'rotate-3 shadow-lg' : ''
      }`}
    >
      <Card 
        size="small"
        className="w-full"
        style={{
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          borderColor: isDark ? '#404040' : '#d9d9d9',
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <div className="space-y-3">
          {/* Task Title and Priority */}
          <div className="flex items-start justify-between">
            <h4 className={`font-medium text-sm leading-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            <Badge 
              color={getPriorityColor(task.priority)} 
              text={task.priority}
              style={{ marginLeft: '8px', flexShrink: 0 }}
            />
          </div>

          {/* Description */}
          {task.description && (
            <p className={`text-xs leading-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {task.description.length > 80 ? `${task.description.substring(0, 80)}...` : task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  color="blue"
                  text={tag}
                  style={{ fontSize: '10px' }}
                />
              ))}
              {task.tags.length > 3 && (
                <span className={`text-xs metric-value ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Task Meta */}
          <div className="space-y-2">
            {/* Assignee */}
            {task.assignee && (
              <div className={`flex items-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <UserOutlined className="mr-2" />
                <span>{task.assignee.name}</span>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center text-xs ${
                isOverdue ? 'text-red-500' : isDueSoon ? 'text-orange-500' : isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <CalendarOutlined className="mr-2" />
                <span>{formatDate(task.dueDate)}</span>
                {isOverdue && <span className="ml-1 font-medium">(Overdue)</span>}
                {isDueSoon && !isOverdue && <span className="ml-1 font-medium">(Due Soon)</span>}
              </div>
            )}

            {/* Estimated Hours */}
            {task.estimatedHours && (
              <div className={`flex items-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <ClockCircleOutlined className="mr-2" />
                <span><span className="metric-value">{task.estimatedHours}</span>h estimated</span>
                {task.actualHours && (
                  <span className="ml-1">/ <span className="metric-value">{task.actualHours}</span>h actual</span>
                )}
              </div>
            )}

            {/* Comments Count */}
            {task.comments && task.comments.length > 0 && (
              <div className={`flex items-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <CommentOutlined className="mr-2" />
                <span><span className="metric-value">{task.comments.length}</span> comments</span>
              </div>
            )}
          </div>

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
              <div className={`flex items-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Dependencies: {task.dependencies.length} tasks</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
