import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TimelineEvent } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  FlagIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

interface RecentActivityProps {
  events: TimelineEvent[];
}

export function RecentActivity({ events }: RecentActivityProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'project-start':
        return <PlayIcon className="w-4 h-4 text-blue-600" />;
      case 'task-completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'milestone':
        return <FlagIcon className="w-4 h-4 text-purple-600" />;
      case 'meeting':
        return <ChatBubbleLeftRightIcon className="w-4 h-4 text-orange-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'project-start':
        return 'Bắt đầu dự án';
      case 'project-end':
        return 'Kết thúc dự án';
      case 'task-completed':
        return 'Hoàn thành nhiệm vụ';
      case 'milestone':
        return 'Cột mốc quan trọng';
      case 'meeting':
        return 'Cuộc họp';
      default:
        return 'Hoạt động';
    }
  };

  const sortedEvents = events
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <div key={event.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(event.date)}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {getEventTypeText(event.type)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
