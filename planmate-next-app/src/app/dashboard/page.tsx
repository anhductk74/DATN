'use client';

import React from 'react';
import { Card, Row, Col, Progress, Avatar, Tag, Typography } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../components/ThemeProvider';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { isDark } = useTheme();

  const projectStats = [
    {
      title: 'Active Projects',
      value: 12,
      total: 18,
      icon: <ProjectOutlined className="text-blue-500" />,
      suffix: '/ 18',
    },
    {
      title: 'Completed Projects',
      value: 6,
      percentage: 75,
      icon: <CheckCircleOutlined className="text-green-500" />,
      suffix: '%',
    },
    {
      title: 'Overdue Tasks',
      value: 3,
      icon: <AlertOutlined className="text-red-500" />,
    },
    {
      title: 'Team Members',
      value: 24,
      icon: <TeamOutlined className="text-purple-500" />,
    },
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Website Redesign',
      progress: 85,
      status: 'In Progress',
      team: ['John', 'Sarah', 'Mike'],
      dueDate: '2025-09-15',
    },
    {
      id: 2,
      name: 'Mobile App Development',
      progress: 60,
      status: 'In Progress',
      team: ['Alice', 'Bob', 'Carol'],
      dueDate: '2025-10-01',
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      progress: 40,
      status: 'Planning',
      team: ['David', 'Emma'],
      dueDate: '2025-09-30',
    },
  ];

  const recentTasks = [
    {
      title: 'Review design mockups',
      assignee: 'John Doe',
      priority: 'High',
      dueDate: 'Today',
      status: 'In Progress',
    },
    {
      title: 'Update project documentation',
      assignee: 'Sarah Wilson',
      priority: 'Medium',
      dueDate: 'Tomorrow',
      status: 'Todo',
    },
    {
      title: 'Code review for feature X',
      assignee: 'Mike Johnson',
      priority: 'High',
      dueDate: '2 days',
      status: 'Review',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'blue';
      case 'Review': return 'purple';
      case 'Todo': return 'default';
      case 'Completed': return 'green';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="mb-8">
        <Title level={1} className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '2.5rem', fontWeight: 700 }}>
          Good morning, John! 👋
        </Title>
        <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Here&apos;s what&apos;s happening with your projects today.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        {projectStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              className={`h-full hover:shadow-lg transition-all duration-300 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
              }`}
              styles={{ body: { padding: '24px' } }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.title}
                  </Text>
                  <div className="flex items-center mt-2">
                    <span className={`text-2xl font-bold stat-number ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className={`text-lg ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  {stat.percentage && (
                    <Progress 
                      percent={stat.percentage} 
                      showInfo={false} 
                      size="small" 
                      className="mt-3"
                      strokeColor="#f97316"
                    />
                  )}
                </div>
                <div className="text-3xl">
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Recent Projects */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Projects
                </span>
                <a 
                  href="/projects" 
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  View All →
                </a>
              </div>
            }
            className={`h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            styles={{ body: { padding: '24px' } }}
          >
            <div className="space-y-6">
              {recentProjects.map((project) => (
                <div 
                  key={project.id} 
                  className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    isDark ? 'bg-gray-750 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Title 
                        level={4} 
                        className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ margin: 0, fontSize: '1.1rem' }}
                      >
                        {project.name}
                      </Title>
                      <div className="flex items-center space-x-3">
                        <Tag 
                          color={getStatusColor(project.status)}
                          className="px-3 py-1 rounded-full"
                        >
                          {project.status}
                        </Tag>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Due: {project.dueDate}
                        </Text>
                      </div>
                    </div>
                    <div className="text-right">
                      <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {project.progress}%
                      </Text>
                    </div>
                  </div>
                  
                  <Progress 
                    percent={project.progress} 
                    strokeColor="#f97316"
                    className="mb-4"
                    strokeWidth={8}
                  />
                  
                  <div className="flex items-center justify-between">
                    <Avatar.Group size="default" max={{ count: 3 }}>
                      {project.team.map((member, idx) => (
                        <Avatar key={idx} className="bg-orange-500">
                          {member[0]}
                        </Avatar>
                      ))}
                    </Avatar.Group>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {project.team.length} team members
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* My Tasks */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  My Tasks
                </span>
                <a 
                  href="/tasks" 
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  View All →
                </a>
              </div>
            }
            className={`h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            styles={{ body: { padding: '24px' } }}
          >
            <div className="space-y-4">
              {recentTasks.map((task, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    isDark ? 'bg-gray-750 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="mb-3">
                    <Text 
                      className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                      style={{ fontSize: '15px' }}
                    >
                      {task.title}
                    </Text>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Tag 
                      color={getPriorityColor(task.priority)}
                      className="px-2 py-1 rounded"
                    >
                      {task.priority}
                    </Tag>
                    <Tag 
                      color={getStatusColor(task.status)}
                      className="px-2 py-1 rounded"
                    >
                      {task.status}
                    </Tag>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.assignee}
                    </Text>
                    <Text 
                      className={`text-xs font-medium ${
                        task.dueDate === 'Today' ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {task.dueDate}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Quick Actions">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card.Meta
                  avatar={<ProjectOutlined className="text-blue-500 text-xl" />}
                  title="Create New Project"
                  description="Start a new project and invite team members"
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded"
                />
              </Col>
              <Col xs={24} sm={8}>
                <Card.Meta
                  avatar={<TeamOutlined className="text-green-500 text-xl" />}
                  title="Invite Team Member"
                  description="Add new members to your workspace"
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded"
                />
              </Col>
              <Col xs={24} sm={8}>
                <Card.Meta
                  avatar={<TrophyOutlined className="text-orange-500 text-xl" />}
                  title="View Reports"
                  description="Check team performance and project analytics"
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
