'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Project } from '@/types';
import { format, endOfMonth, isWithinInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ProjectTimelineProps {
  projects: Project[];
  selectedProject?: Project | null;
}

export function ProjectTimeline({ projects, selectedProject }: ProjectTimelineProps) {
  const displayProjects = selectedProject ? [selectedProject] : projects.slice(0, 5);
  
  const getProjectProgress = (project: Project, currentDate: Date) => {
    if (currentDate < project.startDate) return 0;
    if (currentDate > project.endDate) return 100;
    
    const totalDuration = project.endDate.getTime() - project.startDate.getTime();
    const elapsed = currentDate.getTime() - project.startDate.getTime();
    return Math.min((elapsed / totalDuration) * 100, project.progress);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline dự án</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Timeline Header */}
          <div className="min-w-[800px]">
            <div className="grid grid-cols-12 gap-1 mb-4 text-xs text-gray-500">
              {Array.from({ length: 12 }, (_, i) => {
                const month = new Date(2024, i, 1);
                return (
                  <div key={i} className="text-center">
                    {format(month, 'MMM', { locale: vi })}
                  </div>
                );
              })}
            </div>
            
            {/* Project Rows */}
            <div className="space-y-4">
              {displayProjects.map((project) => (
                <div key={project.id} className="flex items-center space-x-4">
                  {/* Project Info */}
                  <div className="w-48 flex-shrink-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {project.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="status" status={project.status}>
                        {project.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Timeline Bar */}
                  <div className="flex-1 relative">
                    <div className="grid grid-cols-12 gap-1 h-8">
                      {Array.from({ length: 12 }, (_, monthIndex) => {
                        const monthStart = new Date(2024, monthIndex, 1);
                        const monthEnd = endOfMonth(monthStart);
                        const isProjectActive = isWithinInterval(monthStart, {
                          start: project.startDate,
                          end: project.endDate
                        }) || isWithinInterval(monthEnd, {
                          start: project.startDate,
                          end: project.endDate
                        }) || (project.startDate <= monthStart && project.endDate >= monthEnd);
                        
                        if (!isProjectActive) {
                          return <div key={monthIndex} className="bg-gray-100 rounded"></div>;
                        }
                        
                        const progress = getProjectProgress(project, monthEnd);
                        const isCompleted = project.status === 'completed';
                        const isOverdue = new Date() > project.endDate && !isCompleted;
                        
                        return (
                          <div 
                            key={monthIndex} 
                            className={`rounded flex items-center justify-center text-xs font-medium text-white ${
                              isCompleted ? 'bg-green-500' :
                              isOverdue ? 'bg-red-500' :
                              progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          >
                            {progress > 0 && monthIndex === Math.floor((project.startDate.getMonth() + project.endDate.getMonth()) / 2) && (
                              <span>{Math.round(progress)}%</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Project Duration Labels */}
                    <div className="absolute top-10 left-0 right-0 flex justify-between text-xs text-gray-500">
                      <span>{format(project.startDate, 'dd/MM/yyyy')}</span>
                      <span>{format(project.endDate, 'dd/MM/yyyy')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span>Chưa bắt đầu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Đang thực hiện</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Hoàn thành</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Quá hạn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
