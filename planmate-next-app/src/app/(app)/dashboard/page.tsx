'use client';

import React from 'react';
import { Card, Row, Col, Progress, Avatar, Tag, Typography, Spin } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/components/ThemeProvider';
import { useProjects } from '@/components/ProjectProvider';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { isDark } = useTheme();
  const { projects, loading, getProjectStats } = useProjects();
  
  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const projectStats = [
    {
      title: 'Total Projects',
      value: stats.total,
      icon: <ProjectOutlined className="text-blue-500" />,
      color: 'blue',
    },
    {
      title: 'Active Projects',
      value: stats.active,
      icon: <CheckCircleOutlined className="text-green-500" />,
      color: 'green',
    },
    {
      title: 'Completed Projects',
      value: stats.completed,
      percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      icon: <TrophyOutlined className="text-yellow-500" />,
      color: 'yellow',
      suffix: '%',
    },
    {
      title: 'Total Budget',
      value: `$${(stats.totalBudget / 1000).toFixed(0)}k`,
      icon: <DollarOutlined className="text-purple-500" />,
      color: 'purple',
    },
  ];

  // Get recent projects (sorted by updatedAt)
  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'in-progress': return 'blue';
      case 'completed': return 'green';
      case 'planning': return 'orange';
      case 'on-hold': return 'red';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': 
      case 'urgent': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
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
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Tag>
                        <Tag 
                          color={getPriorityColor(project.priority)}
                          className="px-3 py-1 rounded-full"
                        >
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </Tag>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Due: {project.endDate.toLocaleDateString()}
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
                      {project.teamMembers && project.teamMembers.map((member) => (
                        <Avatar key={member.id} src={member.avatar} className="bg-orange-500">
                          {member.name[0]}
                        </Avatar>
                      ))}
                    </Avatar.Group>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {project.teamMembers?.length || 0} team members
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Project Budget Overview */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Budget Overview
                </span>
              </div>
            }
            className={`h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            styles={{ body: { padding: '24px' } }}
          >
            <div className="space-y-4">
              {projects.slice(0, 4).map((project) => (
                <div 
                  key={project.id} 
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    isDark ? 'bg-gray-750 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="mb-3">
                    <Text 
                      className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                      style={{ fontSize: '14px' }}
                    >
                      {project.name}
                    </Text>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Budget: ${project.budget?.toLocaleString() || 0}
                      </Text>
                      <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Spent: ${project.spent?.toLocaleString() || 0}
                      </Text>
                    </div>
                    
                    <Progress 
                      percent={project.budget ? Math.round((project.spent || 0) / project.budget * 100) : 0}
                      size="small"
                      strokeColor={
                        project.budget && project.spent && (project.spent / project.budget) > 0.8 
                          ? '#ff4d4f' 
                          : '#f97316'
                      }
                      showInfo={false}
                    />
                  </div>
                </div>
              ))}
              
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="text-center">
                  <Text className={`text-lg font-bold currency-value ${isDark ? 'text-white' : 'text-blue-900'}`}>
                    ${stats.totalBudget.toLocaleString()}
                  </Text>
                  <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                    Total Budget Allocated
                  </div>
                </div>
              </div>
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
