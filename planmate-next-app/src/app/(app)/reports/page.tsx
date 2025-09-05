'use client';

import { Card, Progress, Tag, Typography, Row, Col } from 'antd';
import { formatDate } from '@/lib/utils';
import { mockProjects, mockTasks, mockUsers } from '@/lib/mockData';
import { 
  ProjectOutlined,
  DashboardOutlined,
  UserOutlined,
  FlagOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useTheme } from '@/components/ThemeProvider';

const { Title, Text } = Typography;

export default function ReportsPage() {
  const { isDark } = useTheme();
  
  const totalProjects = mockProjects.length;
  const completedProjects = mockProjects.filter(p => p.status === 'completed').length;
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
  const overdueTasks = mockTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  ).length;

  const projectCompletionRate = Math.round((completedProjects / totalProjects) * 100);
  const taskCompletionRate = Math.round((completedTasks / totalTasks) * 100);

  // Team performance data
  const teamPerformance = mockUsers.map(user => {
    const userTasks = mockTasks.filter(t => t.assignee?.id === user.id);
    const userCompletedTasks = userTasks.filter(t => t.status === 'completed');
    const completionRate = userTasks.length > 0 ? Math.round((userCompletedTasks.length / userTasks.length) * 100) : 0;
    
    return {
      ...user,
      totalTasks: userTasks.length,
      completedTasks: userCompletedTasks.length,
      completionRate
    };
  });

  // Project status distribution
  const projectStatusData = [
    { status: 'Completed', count: mockProjects.filter(p => p.status === 'completed').length, color: 'green' },
    { status: 'In Progress', count: mockProjects.filter(p => p.status === 'in-progress').length, color: 'blue' },
    { status: 'Planning', count: mockProjects.filter(p => p.status === 'planning').length, color: 'orange' },
    { status: 'On Hold', count: mockProjects.filter(p => p.status === 'on-hold').length, color: 'red' },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Page Header */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-100'}`}>
        <Title level={1} className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <DashboardOutlined className="mr-3" />
          Analytics & Reports
        </Title>
        <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Monitor performance and analyze project data with comprehensive insights
        </Text>
      </div>

      {/* Key Metrics */}
      <div className="space-y-4">
        <Title level={3} className={`mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          <TrophyOutlined className="mr-2" />
          Key Performance Metrics
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${
                isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-blue-50'
              }`}
              hoverable
            >
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                  <ProjectOutlined className="text-white text-2xl" />
                </div>
                <div>
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Projects
                  </Text>
                  <div className={`text-3xl font-bold mt-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {totalProjects}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${
                isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-green-50'
              }`}
              hoverable
            >
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                  <TrophyOutlined className="text-white text-2xl" />
                </div>
                <div>
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Project Completion Rate
                  </Text>
                  <div className="text-3xl font-bold text-green-600 mt-1">
                    {projectCompletionRate}%
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${
                isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-purple-50'
              }`}
              hoverable
            >
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                  <CheckCircleOutlined className="text-white text-2xl" />
                </div>
                <div>
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Task Completion Rate
                  </Text>
                  <div className="text-3xl font-bold text-purple-600 mt-1">
                    {taskCompletionRate}%
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${
                isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-red-50'
              }`}
              hoverable
            >
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                  <ExclamationCircleOutlined className="text-white text-2xl" />
                </div>
                <div>
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overdue Tasks
                  </Text>
                  <div className="text-3xl font-bold text-red-600 mt-1">
                    {overdueTasks}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Dashboard Cards */}
      <div className="space-y-4">
        <Title level={3} className={`mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          <BarChartOutlined className="mr-2" />
          Comprehensive Dashboard
        </Title>
        <Row gutter={[24, 24]}>
          {/* Project Status Distribution */}
          <Col xs={24} xl={12}>
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <FlagOutlined className="text-xl" />
                  <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Project Status Distribution
                  </span>
                </div>
              }
              className={`h-full shadow-lg border-0 ${
                isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'
              }`}
            >
              <div className="space-y-4">
                {projectStatusData.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Tag color={item.color} className="px-3 py-1 text-sm font-medium">
                        {item.status}
                      </Tag>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Text className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.count}
                      </Text>
                      <div className="w-24">
                        <Progress 
                          percent={(item.count / totalProjects) * 100} 
                          showInfo={false} 
                          size="small"
                          strokeWidth={6}
                          strokeColor={{
                            green: '#52c41a',
                            blue: '#1890ff', 
                            orange: '#fa8c16',
                            red: '#ff4d4f'
                          }[item.color]}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Team Performance */}
          <Col xs={24} xl={12}>
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <TeamOutlined className="text-xl" />
                  <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Team Performance
                  </span>
                </div>
              }
              className={`h-full shadow-lg border-0 ${
                isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'
              }`}
            >
              <div className="space-y-4">
                {teamPerformance.map((member) => (
                  <div key={member.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <Text strong className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          {member.name}
                        </Text>
                        <div>
                          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {member.department}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Text strong className={`text-lg ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {member.completionRate}%
                      </Text>
                      <div>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {member.completedTasks}/{member.totalTasks} completed
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Recent Projects */}
          <Col xs={24} xl={12}>
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <ProjectOutlined className="text-xl" />
                  <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Recent Projects
                  </span>
                </div>
              }
              className={`h-full shadow-lg border-0 ${
                isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'
              }`}
            >
              <div className="space-y-3">
                {mockProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className={`p-4 border rounded-xl transition-all hover:shadow-md ${
                    isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <Text strong className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {project.name}
                      </Text>
                      <Tag color={
                        project.status === 'completed' ? 'green' :
                        project.status === 'in-progress' ? 'blue' :
                        project.status === 'planning' ? 'orange' : 'red'
                      } className="px-2 py-1">
                        {project.status}
                      </Tag>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <UserOutlined className={`mr-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                            {project.members?.length || 0} members
                          </Text>
                        </div>
                        <div className="flex items-center">
                          <CalendarOutlined className={`mr-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                            {formatDate(project.endDate)}
                          </Text>
                        </div>
                      </div>
                      <div className="w-20">
                        <Progress percent={project.progress} size="small" strokeWidth={6} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Task Insights */}
          <Col xs={24} xl={12}>
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <FileTextOutlined className="text-xl" />
                  <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Task Analytics
                  </span>
                </div>
              }
              className={`h-full shadow-lg border-0 ${
                isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'
              }`}
            >
              <div className="space-y-6">
                <Row gutter={16}>
                  <Col span={12}>
                    <div className={`text-center p-6 rounded-xl shadow-md ${
                      isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'
                    }`}>
                      <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        {totalTasks}
                      </div>
                      <Text className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Total Tasks
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={`text-center p-6 rounded-xl shadow-md ${
                      isDark ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100'
                    }`}>
                      <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                        {completedTasks}
                      </div>
                      <Text className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Completed
                      </Text>
                    </div>
                  </Col>
                </Row>
                
                <div className="space-y-3">
                  {[
                    { label: 'To Do', count: mockTasks.filter(t => t.status === 'todo').length, color: 'text-blue-600' },
                    { label: 'In Progress', count: mockTasks.filter(t => t.status === 'in-progress').length, color: 'text-orange-600' },
                    { label: 'Under Review', count: mockTasks.filter(t => t.status === 'review').length, color: 'text-purple-600' },
                    { label: 'Overdue', count: overdueTasks, color: isDark ? 'text-red-400' : 'text-red-600' }
                  ].map((item, index) => (
                    <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${
                      isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                    }`}>
                      <Text className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.label}
                      </Text>
                      <Text strong className={`text-lg ${item.color}`}>
                        {item.count}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
