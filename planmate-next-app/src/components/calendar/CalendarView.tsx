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
  onEventDrop?: (eventId: string, newDate: Date) => void;
  onDragStart?: (event: CalendarEvent, clientX?: number, elementLeft?: number) => void;
  onDragOver?: (date: Date) => void;
  onDragEnd?: () => void;
  isDateHighlighted?: (date: Date) => boolean;
  draggedEvent?: CalendarEvent | null;
}

export function CalendarView({ 
  events, 
  onEventClick, 
  onDateClick, 
  onEventDrop, 
  onDragStart, 
  onDragOver, 
  onDragEnd, 
  isDateHighlighted,
  draggedEvent: parentDraggedEvent 
}: CalendarViewProps) {
  const { isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return date >= eventStart && date <= eventEnd;
    });
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
    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    // Group events by rows to handle multi-day events properly
    const eventRows: { [key: string]: CalendarEvent[] } = {};
    const multiDayEvents = events.filter(event => !isSameDay(new Date(event.start), new Date(event.end)));
    
    multiDayEvents.forEach(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Find an available row for this multi-day event
      let rowIndex = 0;
      while (eventRows[`row-${rowIndex}`]) {
        const rowEvents = eventRows[`row-${rowIndex}`];
        const hasConflict = rowEvents.some(existingEvent => {
          const existingStart = new Date(existingEvent.start);
          const existingEnd = new Date(existingEvent.end);
          return !(eventEnd < existingStart || eventStart > existingEnd);
        });
        
        if (!hasConflict) break;
        rowIndex++;
      }
      
      if (!eventRows[`row-${rowIndex}`]) {
        eventRows[`row-${rowIndex}`] = [];
      }
      eventRows[`row-${rowIndex}`].push(event);
    });

    return (
      <div className="relative">
        <div className={`calendar-grid grid grid-cols-7 gap-0 rounded-lg overflow-hidden ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, index) => (
            <div key={index} className={`p-2 text-center text-xs font-medium border-b ${
              isDark ? 'text-gray-300 border-gray-600 bg-gray-700' : 'text-gray-700 border-gray-200 bg-gray-50'
            }`}>
              {dayName}
            </div>
          ))}
          
          {/* Calendar Days */}
          {days.map((day, dayIdx) => {
            const dayEvents = getEventsForDate(day).filter(event => isSameDay(new Date(event.start), new Date(event.end)));
            
            // Sort events by start time to ensure proper order
            const sortedDayEvents = dayEvents.sort((a, b) => {
              if (a.isAllDay && !b.isAllDay) return -1;
              if (!a.isAllDay && b.isAllDay) return 1;
              if (a.isAllDay && b.isAllDay) return a.title.localeCompare(b.title);
              return new Date(a.start).getTime() - new Date(b.start).getTime();
            });
            
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isHighlighted = isDateHighlighted ? isDateHighlighted(day) : false;

            // Calculate multi-day events affecting this specific day
            const dayMultiDayEvents = events.filter(event => {
              const eventStart = new Date(event.start);
              const eventEnd = new Date(event.end);
              return !isSameDay(eventStart, eventEnd) && 
                     day >= eventStart && day <= eventEnd;
            });
            
            // Get unique row indices for multi-day events affecting this day
            const affectingRows = new Set();
            dayMultiDayEvents.forEach(event => {
              const rowIndex = eventRows[event.id];
              if (rowIndex !== undefined) {
                affectingRows.add(rowIndex);
              }
            });
            const multiDayRowsCount = affectingRows.size;

            // Calculate dynamic height based on number of events
            const baseHeight = 110; // Increased base height
            const eventHeight = 26; // Increased event height for better spacing
            const padding = 32; // Space for date number and margins
            const bottomPadding = 12; // Extra space at bottom for last task
            const multiDaySpace = multiDayRowsCount * 24; // Space for multi-day events overlay
            const dynamicHeight = Math.max(baseHeight, padding + (sortedDayEvents.length * eventHeight) + bottomPadding + multiDaySpace);

            return (
              <div
                key={dayIdx}
                className={`p-1 cursor-pointer transition-all duration-200 border-r border-b relative ${
                  isDark
                    ? `border-gray-600 hover:bg-gray-700 ${
                        !isCurrentMonth ? 'bg-gray-900 text-gray-500' : 'bg-gray-800 text-gray-200'
                      }`
                    : `border-gray-200 hover:bg-gray-50 ${
                        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                      }`
                } ${isSelected ? 'border-2 border-orange-500' : ''}
                ${isHighlighted ? (
                  isDark 
                    ? 'bg-blue-900/50 border-blue-400 ring-1 ring-blue-400' 
                    : 'bg-blue-100/70 border-blue-400 ring-1 ring-blue-400'
                ) : ''}`}
                style={{ minHeight: `${dynamicHeight}px` }}
                onClick={() => {
                  setSelectedDate(day);
                }}
                onDoubleClick={() => {
                  setSelectedDate(day);
                  onDateClick?.(day);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const eventId = e.dataTransfer.getData('text/plain');
                  if (eventId && onEventDrop) {
                    onEventDrop(eventId, day);
                  }
                  setDraggedEvent(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  onDragOver?.(day);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  onDragOver?.(day);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  // Only clear drag over if we're leaving the element entirely
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    // Don't clear immediately to prevent flickering
                  }
                }}
              >
                {/* Date number */}
                <div className="absolute top-2 left-2">
                  <span className={`text-sm font-semibold ${
                    isToday 
                      ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md' 
                      : isCurrentMonth 
                        ? isDark ? 'text-gray-200' : 'text-gray-900'
                        : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Single day events */}
                <div 
                  className="space-y-1.5 mb-3"
                  style={{ 
                    marginTop: `${32 + (multiDayRowsCount * 24)}px` 
                  }}
                >
                  {sortedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`relative cursor-move transition-all duration-200 ${
                        (draggedEvent?.id === event.id || parentDraggedEvent?.id === event.id) ? 'opacity-50 transform scale-95' : ''
                      }`}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDraggedEvent(event);
                        
                        // Get element position for accurate drag calculation
                        const rect = e.currentTarget.getBoundingClientRect();
                        onDragStart?.(event, e.clientX, rect.left);
                        
                        e.dataTransfer.setData('text/plain', event.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDraggedEvent(null);
                        onDragEnd?.();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className={`
                        px-2 py-1.5 text-xs font-medium rounded-md border-l-4 shadow-sm
                        transition-all duration-200 hover:shadow-md cursor-pointer
                        ${event.type === 'meeting' ? 'bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100' :
                        event.type === 'deadline' ? 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100' :
                        event.type === 'milestone' ? 'bg-purple-50 border-purple-500 text-purple-700 hover:bg-purple-100' :
                        'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'}
                        ${isDark ? (
                          event.type === 'meeting' ? 'bg-blue-900/30 border-blue-400 text-blue-300 hover:bg-blue-900/50' :
                          event.type === 'deadline' ? 'bg-red-900/30 border-red-400 text-red-300 hover:bg-red-900/50' :
                          event.type === 'milestone' ? 'bg-purple-900/30 border-purple-400 text-purple-300 hover:bg-purple-900/50' :
                          'bg-green-900/30 border-green-400 text-green-300 hover:bg-green-900/50'
                        ) : ''}
                      `}>
                        <div className="flex items-center">
                          {!event.isAllDay && (
                            <div className="flex-shrink-0 mr-2">
                              <span className="text-xs font-semibold opacity-80">
                                {format(new Date(event.start), 'HH:mm')}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate leading-tight">
                              {event.title}
                            </div>
                            {event.description && (
                              <div className="text-xs opacity-70 truncate mt-0.5">
                                {event.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-day events overlay */}
        {Object.values(eventRows).map((rowEvents, rowIndex) => 
          rowEvents.map(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            
            // Calculate position
            const startDayIndex = days.findIndex(day => isSameDay(day, eventStart));
            const endDayIndex = days.findIndex(day => isSameDay(day, eventEnd));
            
            if (startDayIndex === -1 || endDayIndex === -1) return null;
            
            const startWeek = Math.floor(startDayIndex / 7);
            const endWeek = Math.floor(endDayIndex / 7);
            const startCol = startDayIndex % 7;
            const endCol = endDayIndex % 7;
            
            const baseHeight = 110;
            const eventHeight = 26;
            const headerPadding = 32; // Space for date number
            
            // Handle events spanning multiple weeks
            const weekSpans = [];
            for (let week = startWeek; week <= endWeek; week++) {
              const weekStartCol = week === startWeek ? startCol : 0;
              const weekEndCol = week === endWeek ? endCol : 6;
              const weekSpanWidth = weekEndCol - weekStartCol + 1;
              
              // Calculate height for this specific week
              const currentWeekDays = days.slice(week * 7, (week + 1) * 7);
              const currentWeekMaxEvents = Math.max(...currentWeekDays.map(day => {
                const dayEvents = getEventsForDate(day).filter(event => isSameDay(new Date(event.start), new Date(event.end)));
                
                // Calculate multi-day events affecting this day
                const dayMultiDayEvents = events.filter(event => {
                  const eventStart = new Date(event.start);
                  const eventEnd = new Date(event.end);
                  return !isSameDay(eventStart, eventEnd) && 
                         day >= eventStart && day <= eventEnd;
                });
                
                const affectingRows = new Set();
                dayMultiDayEvents.forEach(event => {
                  const rowIndex = eventRows[event.id];
                  if (rowIndex !== undefined) {
                    affectingRows.add(rowIndex);
                  }
                });
                const multiDayRowsCount = affectingRows.size;
                const multiDaySpace = multiDayRowsCount * 24;
                
                return dayEvents.length * eventHeight + multiDaySpace;
              }));
              const currentWeekHeight = Math.max(baseHeight, headerPadding + currentWeekMaxEvents + 12);
              
              weekSpans.push({
                week,
                startCol: weekStartCol,
                width: weekSpanWidth,
                isFirst: week === startWeek,
                isLast: week === endWeek,
                weekHeight: currentWeekHeight
              });
            }
            
            return weekSpans.map((span, spanIndex) => (
              <div
                key={`${event.id}-${span.week}`}
                className={`absolute cursor-move transition-all duration-200 ${
                  (draggedEvent?.id === event.id || parentDraggedEvent?.id === event.id) ? 'opacity-50' : ''
                }`}
                style={{
                  top: `${56 + span.week * span.weekHeight + 32 + rowIndex * 24}px`, // Header height + week offset + date padding + row offset
                  left: `${(span.startCol * 100) / 7}%`,
                  width: `${(span.width * 100) / 7}%`,
                  height: '20px',
                  zIndex: 10
                }}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDraggedEvent(event);
                  
                  // Get element position for accurate drag calculation
                  const rect = e.currentTarget.getBoundingClientRect();
                  onDragStart?.(event, e.clientX, rect.left);
                  
                  e.dataTransfer.setData('text/plain', event.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => {
                  setDraggedEvent(null);
                  onDragEnd?.();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick?.(event);
                }}
              >
                <div className={`h-full px-2 flex items-center text-xs font-medium border-l-4 shadow-sm
                  transition-all duration-200 hover:shadow-md
                  ${span.isFirst ? 'rounded-l-md' : ''}
                  ${span.isLast ? 'rounded-r-md' : ''}
                  ${event.type === 'meeting' ? 
                    isDark ? 'bg-blue-900/40 border-blue-400 text-blue-200' : 'bg-blue-100 border-blue-500 text-blue-700' :
                  event.type === 'deadline' ? 
                    isDark ? 'bg-red-900/40 border-red-400 text-red-200' : 'bg-red-100 border-red-500 text-red-700' :
                  event.type === 'milestone' ? 
                    isDark ? 'bg-purple-900/40 border-purple-400 text-purple-200' : 'bg-purple-100 border-purple-500 text-purple-700' :
                    isDark ? 'bg-green-900/40 border-green-400 text-green-200' : 'bg-green-100 border-green-500 text-green-700'
                  }
                `}>
                  <div className="flex items-center w-full">
                    {span.isFirst && !event.isAllDay && (
                      <div className="flex-shrink-0 mr-2">
                        <span className="text-xs font-semibold opacity-80">
                          {format(new Date(event.start), 'HH:mm')}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate leading-tight">
                        {span.isFirst || spanIndex === 0 ? event.title : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ));
          })
        )}
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