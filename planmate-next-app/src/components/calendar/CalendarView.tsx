'use client';

import { useState } from 'react';
import { Card, Button, Typography, Tag } from 'antd';
import { CalendarEvent } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { 
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useTheme } from '../ThemeProvider';

const { Title, Text } = Typography;

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export function CalendarView({ events, onEventClick, onDateClick }: CalendarViewProps) {
  const { isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start), date)
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'blue';
      case 'deadline':
        return 'red';
      case 'milestone':
        return 'purple';
      case 'task':
        return 'green';
      default:
        return 'default';
    }
  };

  const renderCalendarGrid = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className={`grid grid-cols-7 gap-1 rounded-lg p-4 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, index) => (
          <div key={index} className={`p-2 text-center text-sm font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {dayName}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={dayIdx}
              className={`p-2 min-h-[120px] cursor-pointer transition-colors border rounded ${
                isDark
                  ? `border-gray-600 hover:bg-gray-700 ${
                      !isCurrentMonth ? 'bg-gray-900 text-gray-500' : 'bg-gray-800 text-gray-200'
                    }`
                  : `border-gray-200 hover:bg-gray-50 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    }`
              } ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
              onClick={() => {
                setSelectedDate(day);
                onDateClick?.(day);
              }}
            >
              <div className={`text-sm font-medium mb-2 ${
                isToday 
                  ? 'bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                  : ''
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded cursor-pointer hover:shadow-sm`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <Tag color={getEventTypeColor(event.type)} className="text-xs">
                      {event.title}
                    </Tag>
                    {!event.isAllDay && (
                      <div className={`text-xs mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {format(new Date(event.start), 'HH:mm')}
                      </div>
                    )}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className={`text-xs text-center ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-3">
        <Card className={isDark ? 'bg-gray-800 border-gray-600' : ''}>
          <div className="flex items-center justify-between mb-4">
            <Title level={3} className={isDark ? 'text-white' : ''}>
              {format(currentDate, 'MMMM yyyy')}
            </Title>
            <div className="flex space-x-2">
              <Button
                type="default"
                size="small"
                icon={<LeftOutlined />}
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className={isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
              />
              <Button
                type="default"
                size="small"
                onClick={() => setCurrentDate(new Date())}
                className={isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
              >
                Today
              </Button>
              <Button
                type="default"
                size="small"
                icon={<RightOutlined />}
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className={isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
              />
            </div>
          </div>
          {renderCalendarGrid()}
        </Card>
      </div>

      {/* Event Details */}
      <div className="space-y-6">
        {/* Selected Date Events */}
        {selectedDate && (
          <Card className={isDark ? 'bg-gray-800 border-gray-600' : ''}>
            <Title level={4} className={isDark ? 'text-white' : ''}>
              {formatDate(selectedDate)}
            </Title>
            {selectedDateEvents.length === 0 ? (
              <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                No events
              </Text>
            ) : (
              <div className="space-y-3 mt-4">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} 
                       className={`border rounded-lg p-3 hover:shadow-sm cursor-pointer transition-colors ${
                         isDark 
                           ? 'border-gray-600 hover:bg-gray-700' 
                           : 'border-gray-200 hover:bg-gray-50'
                       }`}
                       onClick={() => onEventClick?.(event)}>
                    <div className="flex items-start justify-between mb-2">
                      <Text strong className={isDark ? 'text-gray-200' : 'text-gray-900'}>
                        {event.title}
                      </Text>
                      <Tag color={getEventTypeColor(event.type)}>
                        {event.type}
                      </Tag>
                    </div>
                    
                    {event.description && (
                      <Text className={`block mb-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {event.description}
                      </Text>
                    )}
                    
                    <div className={`space-y-1 text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center">
                        <ClockCircleOutlined className="mr-2" />
                        {event.isAllDay ? 'All day' : formatDateTime(new Date(event.start))}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center">
                          <EnvironmentOutlined className="mr-2" />
                          {event.location}
                        </div>
                      )}
                      
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center">
                          <TeamOutlined className="mr-2" />
                          {event.attendees.length} attendees
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Upcoming Events */}
        <Card className={isDark ? 'bg-gray-800 border-gray-600' : ''}>
          <Title level={4} className={isDark ? 'text-white' : ''}>
            Upcoming Events
          </Title>
          <div className="space-y-3 mt-4">
            {events
              .filter(event => new Date(event.start) >= new Date())
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} 
                     className={`flex items-start space-x-3 p-2 rounded cursor-pointer transition-colors ${
                       isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                     }`}
                     onClick={() => onEventClick?.(event)}>
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    event.type === 'meeting' ? 'bg-blue-500' :
                    event.type === 'deadline' ? 'bg-red-500' :
                    event.type === 'milestone' ? 'bg-purple-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <Text strong className={isDark ? 'text-gray-200' : 'text-gray-900'}>
                      {event.title}
                    </Text>
                    <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      <Text className="text-xs">
                        {formatDateTime(new Date(event.start))}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Event Legend */}
        <Card className={isDark ? 'bg-gray-800 border-gray-600' : ''}>
          <Title level={4} className={isDark ? 'text-white' : ''}>
            Legend
          </Title>
          <div className="space-y-2 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Meeting
              </Text>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Deadline
              </Text>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Milestone
              </Text>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Task
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}