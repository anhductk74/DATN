'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Space, Typography } from 'antd';
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2} className={isDark ? 'text-white' : 'text-gray-900'}>
          Dashboard
        </Title>
        <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          Welcome back! Here&apos;s what&apos;s happening with your projects.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {projectStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="h-full">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={stat.suffix}
                valueStyle={{ color: isDark ? '#ffffff' : '#1f2937' }}
              />
              {stat.percentage && (
                <Progress percent={stat.percentage} showInfo={false} size="small" />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Projects */}
        <Col xs={24} lg={14}>
          <Card 
            title="Recent Projects" 
            extra={<a href="/projects">View All</a>}
            className="h-full"
          >
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Text strong className={isDark ? 'text-white' : 'text-gray-900'}>
                        {project.name}
                      </Text>
                      <div className="flex items-center space-x-2 mt-1">
                        <Tag color={getStatusColor(project.status)}>{project.status}</Tag>
                        <Text className={isDark ? 'text-gray-400' : 'text-gray-500'} type="secondary">
                          Due: {project.dueDate}
                        </Text>
                      </div>
                    </div>
                    <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {project.progress}%
                    </Text>
                  </div>
                  <Progress percent={project.progress} size="small" />
                  <div className="flex items-center justify-between mt-2">
                    <Avatar.Group size="small" maxCount={3}>
                      {project.team.map((member, idx) => (
                        <Avatar key={idx}>{member[0]}</Avatar>
                      ))}
                    </Avatar.Group>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Recent Tasks */}
        <Col xs={24} lg={10}>
          <Card 
            title="My Tasks" 
            extra={<a href="/tasks">View All</a>}
            className="h-full"
          >
            <List
              dataSource={recentTasks}
              renderItem={(task) => (
                <List.Item className="border-b-0">
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-1">
                      <Text strong className={isDark ? 'text-white' : 'text-gray-900'}>
                        {task.title}
                      </Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <Space size="small">
                        <Tag color={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Tag>
                        <Tag color={getStatusColor(task.status)}>
                          {task.status}
                        </Tag>
                      </Space>
                      <Text 
                        className={isDark ? 'text-gray-400' : 'text-gray-500'} 
                        type="secondary" 
                        style={{ fontSize: '12px' }}
                      >
                        {task.dueDate}
                      </Text>
                    </div>
                    <Text 
                      className={isDark ? 'text-gray-400' : 'text-gray-600'} 
                      style={{ fontSize: '12px' }}
                    >
                      Assigned to: {task.assignee}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
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
