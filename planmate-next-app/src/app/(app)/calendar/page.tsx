'use client';

import { useState } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Button } from 'antd';
import { mockCalendarEvents } from '@/lib/mockData';
import { CalendarEvent } from '@/types';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@/components/ThemeProvider';

export default function CalendarPage() {
  const { isDark } = useTheme();
  const [events] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    // In a real app, you might open a modal or navigate to event details
    console.log('Event clicked:', event);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // In a real app, you might open a "create event" form
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Calendar
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage schedules, meetings and project deadlines
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button type="primary" icon={<PlusOutlined />}>
            Create New Event
          </Button>
        </div>
      </div>

      {/* Calendar Component */}
      <CalendarView
        events={events}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
      />

      {/* Event Details Modal would go here */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className={`transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {selectedEvent.description && (
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {selectedEvent.description}
                </p>
              )}
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>Type: {selectedEvent.type}</p>
                <p>Time: {selectedEvent.start.toLocaleString('en-US')}</p>
                {selectedEvent.location && (
                  <p>Location: {selectedEvent.location}</p>
                )}
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <p>Attendees: {selectedEvent.attendees.map(a => a.name).join(', ')}</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              <Button type="primary">
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
