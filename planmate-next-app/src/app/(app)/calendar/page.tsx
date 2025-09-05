'use client';

import { useState } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import { mockCalendarEvents } from '@/lib/mockData';
import { CalendarEvent } from '@/types';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@/components/ThemeProvider';
import dayjs, { Dayjs } from 'dayjs';
import { isSameDay } from 'date-fns';

export default function CalendarPage() {
  const { isDark } = useTheme();
  const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [form] = Form.useForm();

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    // In a real app, you might open a modal or navigate to event details
    console.log('Event clicked:', event);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
    console.log('Date double clicked:', date);
  };

  const handleCreateTask = async (values: { 
    title: string; 
    description?: string; 
    status: 'meeting' | 'deadline' | 'milestone' | 'task';
    endDate?: Dayjs;
  }) => {
    if (!selectedDate) return;

    const endDate = values.endDate ? values.endDate.toDate() : selectedDate;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: values.title,
      description: values.description || '',
      start: selectedDate,
      end: endDate,
      type: values.status,
      isAllDay: true,
      attendees: [],
      location: '',
    };

    setEvents(prev => [...prev, newEvent]);
    setIsCreateModalOpen(false);
    form.resetFields();
    setSelectedDate(null);
  };

  const handleEventDrop = (eventId: string, newDate: Date) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const originalStart = new Date(event.start);
        const originalEnd = new Date(event.end);
        const duration = originalEnd.getTime() - originalStart.getTime();
        
        let finalStartDate = newDate;
        
        // For multi-day events, adjust the start date based on where the user grabbed the task
        if (!isSameDay(originalStart, originalEnd)) {
          // Subtract the offset days to get the actual start position
          finalStartDate = new Date(newDate.getTime() - (dragOffset * 24 * 60 * 60 * 1000));
        }
        
        // Calculate new end date maintaining the same duration
        const newEndDate = new Date(finalStartDate.getTime() + duration);
        
        return { 
          ...event, 
          start: finalStartDate, 
          end: newEndDate 
        };
      }
      return event;
    }));
    
    // Reset drag states
    setDraggedEvent(null);
    setDragOverDate(null);
    setDragOffset(0);
  };

  const handleDragStart = (event: CalendarEvent, clientX?: number, elementLeft?: number) => {
    setDraggedEvent(event);
    
    // For multi-day events, calculate which day of the task was clicked
    if (clientX !== undefined && elementLeft !== undefined) {
      // Get the calendar container to calculate day width
      const calendarElement = document.querySelector('.calendar-grid');
      if (calendarElement) {
        const calendarRect = calendarElement.getBoundingClientRect();
        const dayWidth = calendarRect.width / 7;
        const relativeX = clientX - elementLeft;
        const dayOffset = Math.floor(relativeX / dayWidth);
        setDragOffset(dayOffset);
      } else {
        setDragOffset(0);
      }
    } else {
      setDragOffset(0);
    }
  };

  const handleDragOver = (date: Date) => {
    setDragOverDate(date);
  };

  const handleDragEnd = () => {
    setDraggedEvent(null);
    setDragOverDate(null);
    setDragOffset(0);
  };

  // Helper function to check if a date should be highlighted during drag
  const isDateHighlighted = (date: Date): boolean => {
    if (!draggedEvent || !dragOverDate) return false;
    
    const originalStart = new Date(draggedEvent.start);
    const originalEnd = new Date(draggedEvent.end);
    const duration = originalEnd.getTime() - originalStart.getTime();
    
    // Calculate the actual start date based on where user clicked on the task
    let newStartDate = dragOverDate;
    
    // For multi-day events, adjust based on where the user grabbed the task
    if (!isSameDay(originalStart, originalEnd)) {
      // Subtract the offset days from the drop position to get the real start
      newStartDate = new Date(dragOverDate.getTime() - (dragOffset * 24 * 60 * 60 * 1000));
    }
    
    // Calculate what the new end date would be
    const newEndDate = new Date(newStartDate.getTime() + duration);
    
    // Check if this date falls within the new range
    return date >= newStartDate && date <= newEndDate;
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
        onEventDrop={handleEventDrop}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        isDateHighlighted={isDateHighlighted}
        draggedEvent={draggedEvent}
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

      {/* Create Task Modal */}
      <Modal
        title="Create New Task"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
          setSelectedDate(null);
        }}
        footer={null}
        className={isDark ? 'dark-modal' : ''}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTask}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              placeholder="Enter task description (optional)" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select task status">
              <Select.Option value="task">Task</Select.Option>
              <Select.Option value="meeting">Meeting</Select.Option>
              <Select.Option value="deadline">Deadline</Select.Option>
              <Select.Option value="milestone">Milestone</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date (Optional)"
            help="Leave empty for single day task"
          >
            <DatePicker 
              placeholder="Select end date"
              format="YYYY-MM-DD"
              disabledDate={(date) => date && date.isBefore(dayjs(selectedDate))}
            />
          </Form.Item>

          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
                setSelectedDate(null);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Task
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
