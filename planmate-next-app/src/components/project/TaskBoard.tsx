'use client';

import React, { useState } from 'react';
import { Button } from 'antd';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '../ThemeProvider';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate?: () => void;
}

const columns = [
  { id: 'todo', title: 'To Do', status: 'todo' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress' },
  { id: 'review', title: 'Review', status: 'review' },
  { id: 'completed', title: 'Completed', status: 'completed' },
] as const;

export function TaskBoard({ tasks, onTaskUpdate, onTaskCreate }: TaskBoardProps) {
  const { isDark } = useTheme();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    // If dropped on a column, update task status
    if (columns.some(col => col.id === newStatus)) {
      onTaskUpdate?.(taskId, { status: newStatus as Task['status'] });
    }
    
    setActiveTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  // Droppable Column Component
  const DroppableColumn = ({ column, children }: { column: (typeof columns)[number], children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: column.id,
    });

    return (
      <div 
        ref={setNodeRef}
        className={`rounded-lg p-4 transition-colors ${
          isOver 
            ? isDark 
              ? 'bg-gray-700 border-orange-500' 
              : 'bg-orange-50 border-orange-300'
            : isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
        } border-2 ${isOver ? 'border-dashed' : ''}`}
      >
        {children}
      </div>
    );
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          
          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <DroppableColumn column={column}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {column.title}
                    </h3>
                    <span 
                      className={`text-xs rounded-full px-2 py-1 metric-value ${
                        isDark 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                  <Button 
                    type="text"
                    size="small"
                    onClick={onTaskCreate}
                    icon={<PlusOutlined />}
                    className={`${
                      isDark 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  />
                </div>

                {/* Task List */}
                <SortableContext 
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[200px]">
                    {columnTasks.map((task) => (
                      <TaskCard 
                        key={task.id} 
                        task={task}
                        onUpdate={(updates) => onTaskUpdate?.(task.id, updates)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard 
            task={activeTask} 
            isDragging 
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
