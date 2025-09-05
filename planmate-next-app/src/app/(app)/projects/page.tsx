'use client';

import { useState } from 'react';
import { Button, Input, Select, Card, Statistic, Row, Col, Spin } from 'antd';
import { ProjectCard } from '@/components/project/ProjectCard';
import { TaskBoard } from '@/components/project/TaskBoard';
import { mockTasks } from '@/lib/mockData';
import { Project, Task } from '@/types';
import { 
  PlusOutlined, 
  ArrowLeftOutlined,
  AppstoreOutlined,
  UnorderedListOutlined 
} from '@ant-design/icons';
import { useTheme } from '@/components/ThemeProvider';
import { useProjects } from '@/components/ProjectProvider';

export default function ProjectsPage() {
  const { isDark } = useTheme();
  const { projects, loading, getProjectStats } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const handleProjectView = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setViewMode('board');
    }
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const projectTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject.id)
    : tasks;

  if (selectedProject && viewMode === 'board') {
    return (
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <Button 
                type="default"
                icon={<ArrowLeftOutlined />}
                size="large"
                className={`flex items-center gap-2 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                }`}
                onClick={() => {
                  setSelectedProject(null);
                  setViewMode('grid');
                }}
              >
                Back to Projects
              </Button>
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedProject.name}
              </h1>
              <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedProject.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button type="default" icon={<PlusOutlined />}>
              Add Task
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Progress"
                value={selectedProject.progress}
                suffix="%"
                valueStyle={{ 
                  color: '#f97316',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Tasks"
                value={projectTasks.length}
                valueStyle={{ 
                  color: '#1890ff',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Completed"
                value={projectTasks.filter(t => t.status === 'completed').length}
                valueStyle={{ 
                  color: '#52c41a',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Members"
                value={selectedProject.teamMembers?.length || selectedProject.members?.length || 0}
                valueStyle={{ 
                  color: '#722ed1',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Task Board */}
        <Card title="Task Board" style={{ backgroundColor: isDark ? '#1f1f1f' : '#ffffff' }}>
          <TaskBoard 
            tasks={projectTasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={() => console.log('Create task')}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats.total}
              valueStyle={{ 
                color: '#1890ff',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={stats.active}
              valueStyle={{ 
                color: '#52c41a',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              valueStyle={{ 
                color: '#faad14',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Budget"
              value={`$${(stats.totalBudget / 1000).toFixed(0)}k`}
              valueStyle={{ 
                color: '#722ed1',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Projects
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage and track all company projects
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              type={viewMode === 'grid' ? 'primary' : 'default'}
              size="small"
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('grid')}
            />
            <Button
              type={viewMode === 'board' ? 'primary' : 'default'}
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode('board')}
            />
          </div>
          <Button type="primary" icon={<PlusOutlined />}>
            Create New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select 
            placeholder="All Status" 
            style={{ width: 180 }}
            size="middle"
            options={[
              { value: '', label: 'All Status' },
              { value: 'planning', label: 'Planning' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'on-hold', label: 'On Hold' },
            ]}
          />
          <Select 
            placeholder="All Priority" 
            style={{ width: 180 }}
            size="middle"
            options={[
              { value: '', label: 'All Priority' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[320px]">
          <Input.Search 
            placeholder="Search projects..." 
            size="middle"
            allowClear
            enterButton
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onView={handleProjectView}
            onEdit={(id) => console.log('Edit project', id)}
          />
        ))}
      </div>
    </div>
  );
}
