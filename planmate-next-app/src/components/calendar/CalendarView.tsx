'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CalendarEvent } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useTheme } from '../ThemeProvider';

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
        return isDark 
          ? 'bg-blue-900 text-blue-200 border-blue-700' 
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline':
        return isDark 
          ? 'bg-red-900 text-red-200 border-red-700' 
          : 'bg-red-100 text-red-800 border-red-200';
      case 'milestone':
        return isDark 
          ? 'bg-purple-900 text-purple-200 border-purple-700' 
          : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'task':
        return isDark 
          ? 'bg-green-900 text-green-200 border-green-700' 
          : 'bg-green-100 text-green-800 border-green-200';
      default:
        return isDark 
          ? 'bg-gray-800 text-gray-200 border-gray-600' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className={`grid grid-cols-7 gap-px rounded-lg overflow-hidden ${
        isDark ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, index) => (
          <div key={index} className={`p-2 text-center text-sm font-medium ${
            isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'
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
              className={`p-2 min-h-[120px] cursor-pointer transition-colors ${
                isDark
                  ? `bg-gray-800 hover:bg-gray-700 ${
                      !isCurrentMonth ? 'bg-gray-900 text-gray-500' : 'text-gray-200'
                    }`
                  : `bg-white hover:bg-gray-50 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
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
                    className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm ${getEventTypeColor(event.type)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    {!event.isAllDay && (
                      <div className="text-xs opacity-75">
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderCalendarGrid()}
          </CardContent>
        </Card>
      </div>

      {/* Event Details */}
      <div className="space-y-6">
        {/* Selected Date Events */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No events
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} 
                         className={`border rounded-lg p-3 hover:shadow-sm cursor-pointer transition-colors ${
                           isDark 
                             ? 'border-gray-600 hover:bg-gray-700' 
                             : 'border-gray-200 hover:bg-gray-50'
                         }`}
                         onClick={() => onEventClick?.(event)}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium text-sm ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {event.title}
                        </h4>
                        <Badge variant="default" className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      
                      {event.description && (
                        <p className={`text-xs mb-2 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {event.description}
                        </p>
                      )}
                      
                      <div className={`space-y-1 text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <div className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-2" />
                          {event.isAllDay ? 'All day' : formatDateTime(new Date(event.start))}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="w-3 h-3 mr-2" />
                            {event.location}
                          </div>
                        )}
                        
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center">
                            <UsersIcon className="w-3 h-3 mr-2" />
                            {event.attendees.length} attendees
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                      <p className={`font-medium text-sm ${
                        isDark ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {event.title}
                      </p>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatDateTime(new Date(event.start))}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Meeting
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Deadline
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Milestone
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Task
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
