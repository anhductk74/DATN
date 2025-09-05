import { Card, Badge, Progress, Button, Avatar } from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  EditOutlined 
} from '@ant-design/icons';
import { useTheme } from '../ThemeProvider';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onView?: (projectId: string) => void;
  onEdit?: (projectId: string) => void;
}

const formatDate = (dateInput: string | Date) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-US');
};

const getDaysRemaining = (endDate: string | Date) => {
  const today = new Date();
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const timeDiff = end.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export function ProjectCard({ project, onView, onEdit }: ProjectCardProps) {
  const { isDark } = useTheme();
  const daysRemaining = getDaysRemaining(project.endDate);
  const isOverdue = daysRemaining < 0 && project.status !== 'completed';
  const isDueSoon = daysRemaining <= 7 && daysRemaining >= 0 && project.status !== 'completed';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'processing';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'red';
      case 'medium': return 'orange';
      default: return 'blue';
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow"
      styles={{ body: { padding: '24px' } }}
      style={{
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        borderColor: isDark ? '#404040' : '#d9d9d9',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {project.name}
          </h3>
          <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {project.description}
          </p>
        </div>
        <div className="flex space-x-2 ml-4">
          <Badge color={getStatusColor(project.status)} text={project.status} />
          <Badge color={getPriorityColor(project.priority)} text={project.priority} />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Progress
          </span>
          <span className={`text-sm progress-number ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {project.progress}%
          </span>
        </div>
        <Progress percent={project.progress} strokeColor="#f97316" />
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`flex items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <TeamOutlined className="mr-2" />
          <span className="metric-value">{project.teamMembers?.length || project.members?.length || 0}</span> members
        </div>
        <div className={`flex items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <CalendarOutlined className="mr-2" />
          {formatDate(project.endDate)}
        </div>
        <div className={`flex items-center text-sm ${
          isOverdue ? 'text-red-500' : isDueSoon ? 'text-orange-500' : isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <ClockCircleOutlined className="mr-2" />
          {isOverdue ? (
            <>Overdue <span className="metric-value mx-1">{Math.abs(daysRemaining)}</span> days</>
          ) : (
            <><span className="metric-value mr-1">{daysRemaining}</span> days left</>
          )}
        </div>
        {project.budget && (
          <div className={`flex items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <DollarOutlined className="mr-2" />
            <span className="currency-value">{formatCurrency(project.budget)}</span>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Project Manager
          </span>
        </div>
        <div className="flex items-center">
          <Avatar size="small" style={{ backgroundColor: '#f97316' }}>
            {project.manager?.name?.charAt(0) || 'M'}
          </Avatar>
          <span className={`ml-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {project.manager?.name || 'No Manager'}
          </span>
        </div>
      </div>

      {/* Task Summary */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Tasks
          </span>
        </div>
        <div className={`flex space-x-4 text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <span><span className="metric-value">{project.tasks?.filter(t => t.status === 'todo').length || 0}</span> To Do</span>
          <span><span className="metric-value">{project.tasks?.filter(t => t.status === 'in-progress').length || 0}</span> In Progress</span>
          <span><span className="metric-value">{project.tasks?.filter(t => t.status === 'completed').length || 0}</span> Completed</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button 
          type="default"
          size="small"
          className="flex-1"
          icon={<EyeOutlined />}
          onClick={() => onView?.(project.id)}
        >
          View Details
        </Button>
        <Button 
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit?.(project.id)}
        />
      </div>
    </Card>
  );
}
