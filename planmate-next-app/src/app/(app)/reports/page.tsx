"use client";

import { Card, Progress, Tag, Typography, Row, Col } from "antd";
import { formatDate } from "@/lib/utils";
import { mockProjects, mockTasks, mockUsers } from "@/lib/mockData";
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
  BarChartOutlined,
  DragOutlined,
} from "@ant-design/icons";
import { useTheme } from '@/components/ThemeProvider';
import { useState, useEffect } from 'react';

const { Title, Text } = Typography;

// DashboardCard interface
interface DashboardCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

// 🔹 Draggable Card Component
const DraggableCard = ({
  card,
  index,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDark,
}: {
  card: DashboardCard;
  index: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDark: boolean;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, index);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragEnd();
      }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={`cursor-grab active:cursor-grabbing transition-all duration-300 ${
        isDragging ? "opacity-60 rotate-2 scale-105" : "hover:scale-[1.02]"
      }`}
    >
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  isDark ? "bg-blue-500/20" : "bg-blue-100"
                }`}
              >
                {card.icon}
              </div>
              <span
                className={`text-lg font-bold transition-colors ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {card.title}
              </span>
            </div>
            <DragOutlined
              className={`text-xl cursor-grab transition-colors ${
                isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            />
          </div>
        }
        className={`h-full shadow-xl border-0 transition-all duration-300 ${
          isDragging ? "shadow-2xl" : "hover:shadow-2xl hover:-translate-y-1"
        } ${
          isDark
            ? "bg-gray-800 border border-gray-600 shadow-gray-900/50"
            : "bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200"
        }`}
        styles={{
          body: {
            height: "400px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            color: isDark ? "#f3f4f6" : "#1f2937",
            border: "none",
          },
        }}
      >
        <div className="flex-1 flex flex-col justify-between">
          {card.component}
        </div>
      </Card>
    </div>
  );
};

export default function ReportsPage() {
  const { isDark } = useTheme();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render khi theme thay đổi với delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate(prev => prev + 1);
    }, 100); // Delay 100ms để đảm bảo DOM đã update
    
    return () => clearTimeout(timer);
  }, [isDark]);

  // CSS override cho Ant Design dark mode - chỉ khi dark mode
  const overrideStyles = isDark ? `
    .ant-card {
      background: #1f2937 !important;
      border: 1px solid #374151 !important;
    }
    .ant-card-head {
      background: #1f2937 !important;
      border-bottom: 1px solid #374151 !important;
      color: #f9fafb !important;
    }
    .ant-card-head-title {
      color: #f9fafb !important;
    }
    .ant-card-body {
      background: #1f2937 !important;
      color: #f3f4f6 !important;
    }
    .ant-typography {
      color: #f3f4f6 !important;
    }
    .ant-typography-title {
      color: #f9fafb !important;
    }
    .ant-tag {
      border-color: transparent !important;
    }
    .ant-progress-bg, .ant-progress-inner {
      background: #374151 !important;
    }
  ` : '';

  const totalProjects = mockProjects.length;
  const completedProjects = mockProjects.filter(
    (p) => p.status === "completed"
  ).length;
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(
    (t) => t.status === "completed"
  ).length;
  const overdueTasks = mockTasks.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed"
  ).length;

  const projectCompletionRate = Math.round(
    (completedProjects / totalProjects) * 100
  );
  const taskCompletionRate = Math.round((completedTasks / totalTasks) * 100);

  // Team performance data
  const teamPerformance = mockUsers.map((user) => {
    const userTasks = mockTasks.filter((t) => t.assignee?.id === user.id);
    const userCompletedTasks = userTasks.filter(
      (t) => t.status === "completed"
    );
    const completionRate =
      userTasks.length > 0
        ? Math.round((userCompletedTasks.length / userTasks.length) * 100)
        : 0;

    return {
      ...user,
      totalTasks: userTasks.length,
      completedTasks: userCompletedTasks.length,
      completionRate,
    };
  });

  // Project status distribution
  const projectStatusData = [
    {
      status: "Completed",
      count: mockProjects.filter((p) => p.status === "completed").length,
      color: "green",
    },
    {
      status: "In Progress",
      count: mockProjects.filter((p) => p.status === "in-progress").length,
      color: "blue",
    },
    {
      status: "Planning",
      count: mockProjects.filter((p) => p.status === "planning").length,
      color: "orange",
    },
    {
      status: "On Hold",
      count: mockProjects.filter((p) => p.status === "on-hold").length,
      color: "red",
    },
  ];

  // Initialize dashboard cards
  const initialDashboardCards: DashboardCard[] = [
    {
      id: "project-status",
      title: "Project Status Distribution",
      icon: <FlagOutlined className="text-xl" />,
      component: (
        <div className="h-full flex flex-col space-y-4">
          <div className="flex-1 space-y-3">
            {projectStatusData.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isDark
                    ? "bg-gray-600/50 border border-gray-500/30"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Tag
                    color={item.color}
                    className="px-3 py-1 text-sm font-medium"
                  >
                    {item.status}
                  </Tag>
                </div>
                <div className="flex items-center space-x-4">
                  <Text
                    className={`font-semibold ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {item.count}
                  </Text>
                  <div className="w-20">
                    <Progress
                      percent={(item.count / totalProjects) * 100}
                      showInfo={false}
                      size="small"
                      strokeWidth={6}
                      strokeColor={
                        {
                          green: "#52c41a",
                          blue: "#1890ff",
                          orange: "#fa8c16",
                          red: "#ff4d4f",
                        }[item.color]
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className={`mt-auto text-center p-3 rounded-xl ${
              isDark
                ? "bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500/30"
                : "bg-gradient-to-r from-blue-50 to-purple-50"
            }`}
          >
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-blue-300" : "text-blue-600"
              }`}
            >
              Total: {totalProjects} Projects
            </Text>
          </div>
        </div>
      ),
    },
    {
      id: "team-performance",
      title: "Team Performance",
      icon: <TeamOutlined className="text-xl" />,
      component: (
        <div className="h-full flex flex-col space-y-4">
          <div className="flex-1 space-y-3">
            {teamPerformance.map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-md ${
                  isDark
                    ? "bg-gray-600/50 border-gray-500/30 hover:bg-gray-600/70"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <Text
                      strong
                      className={`text-sm ${
                        isDark ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {member.name}
                    </Text>
                    <div>
                      <Text
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {member.department}
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Text
                    strong
                    className={`text-lg ${
                      isDark ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {member.completionRate}%
                  </Text>
                  <div className="w-16">
                    <Progress
                      percent={member.completionRate}
                      size="small"
                      strokeWidth={4}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className={`mt-auto text-center p-3 rounded-xl ${
              isDark
                ? "bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500/30"
                : "bg-gradient-to-r from-purple-50 to-blue-50"
            }`}
          >
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-purple-300" : "text-purple-600"
              }`}
            >
              Team Efficiency:{" "}
              {Math.round(
                teamPerformance.reduce(
                  (acc, member) => acc + member.completionRate,
                  0
                ) / teamPerformance.length
              )}
              %
            </Text>
          </div>
        </div>
      ),
    },
    {
      id: "recent-projects",
      title: "Recent Projects",
      icon: <ProjectOutlined className="text-xl" />,
      component: (
        <div className="space-y-3">
          {mockProjects.slice(0, 5).map((project) => (
            <div
              key={project.id}
              className={`p-4 border rounded-xl transition-all hover:shadow-md ${
                isDark
                  ? "border-gray-500/30 bg-gray-600/50 hover:bg-gray-600/70"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Text
                  strong
                  className={`text-base ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {project.name}
                </Text>
                <Tag
                  color={
                    project.status === "completed"
                      ? "green"
                      : project.status === "in-progress"
                      ? "blue"
                      : project.status === "planning"
                      ? "orange"
                      : "red"
                  }
                  className="px-2 py-1"
                >
                  {project.status}
                </Tag>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <UserOutlined
                      className={`mr-1 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <Text
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      {project.members?.length || 0} members
                    </Text>
                  </div>
                  <div className="flex items-center">
                    <CalendarOutlined
                      className={`mr-1 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <Text
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      {formatDate(project.endDate)}
                    </Text>
                  </div>
                </div>
                <div className="w-20">
                  <Progress
                    percent={project.progress}
                    size="small"
                    strokeWidth={6}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "task-analytics",
      title: "Task Analytics",
      icon: <FileTextOutlined className="text-xl" />,
      component: (
        <div className="space-y-6">
          <Row gutter={16}>
            <Col span={12}>
              <div
                className={`text-center p-6 rounded-xl shadow-md ${
                  isDark
                    ? "bg-gradient-to-br from-gray-700 to-gray-600 border border-gray-500/30"
                    : "bg-gradient-to-br from-blue-50 to-blue-100"
                }`}
              >
                <div
                  className={`text-3xl font-bold mb-2 ${
                    isDark ? "text-blue-300" : "text-blue-600"
                  }`}
                >
                  {totalTasks}
                </div>
                <Text
                  className={`font-medium ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Total Tasks
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div
                className={`text-center p-6 rounded-xl shadow-md ${
                  isDark
                    ? "bg-gradient-to-br from-gray-700 to-gray-600 border border-gray-500/30"
                    : "bg-gradient-to-br from-green-50 to-green-100"
                }`}
              >
                <div
                  className={`text-3xl font-bold mb-2 ${
                    isDark ? "text-green-300" : "text-green-600"
                  }`}
                >
                  {completedTasks}
                </div>
                <Text
                  className={`font-medium ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Completed
                </Text>
              </div>
            </Col>
          </Row>

          <div className="space-y-3">
            {[
              {
                label: "To Do",
                count: mockTasks.filter((t) => t.status === "todo").length,
                color: "text-blue-600",
              },
              {
                label: "In Progress",
                count: mockTasks.filter((t) => t.status === "in-progress")
                  .length,
                color: "text-orange-600",
              },
              {
                label: "Under Review",
                count: mockTasks.filter((t) => t.status === "review").length,
                color: "text-purple-600",
              },
              {
                label: "Overdue",
                count: overdueTasks,
                color: isDark ? "text-red-400" : "text-red-600",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  isDark
                    ? "bg-gray-600/50 border border-gray-500/30"
                    : "bg-gray-50"
                }`}
              >
                <Text
                  className={`font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Text>
                <Text strong className={`text-lg ${item.color}`}>
                  {item.count}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>(
    initialDashboardCards
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newCards = [...dashboardCards];
    const draggedCard = newCards[draggedIndex];

    // Remove dragged card from its original position
    newCards.splice(draggedIndex, 1);

    // Insert dragged card at new position
    newCards.splice(dropIndex, 0, draggedCard);

    setDashboardCards(newCards);
  };

  return (
    <>
      {isDark && <style key={forceUpdate} dangerouslySetInnerHTML={{ __html: overrideStyles }} />}
      <div
        className={`min-h-screen p-6 space-y-8 transition-all duration-300 ${
          isDark ? "bg-gray-900 dark" : "bg-gray-50"
        }`}
      >
        {/* Page Header */}
        <div
          className={`p-6 rounded-xl ${
            isDark
              ? "bg-gray-800"
              : "bg-gradient-to-r from-blue-50 to-indigo-100"
          }`}
        >
          <Title
            level={1}
            className={`mb-2 transition-colors ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <DashboardOutlined className="mr-3" />
            Analytics & Reports
          </Title>
          <Text
            className={`text-lg transition-colors ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Monitor performance and analyze project data with comprehensive
            insights
          </Text>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          <Title
            level={3}
            className={`mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            <TrophyOutlined className="mr-2" />
            Key Performance Metrics
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${
                  isDark
                    ? "bg-gray-800 border border-gray-600 shadow-gray-900/30"
                    : "bg-gradient-to-br from-white to-blue-50"
                }`}
                styles={{
                  body: {
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    color: isDark ? "#f3f4f6" : "#1f2937",
                    border: "none",
                  },
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                    <ProjectOutlined className="text-white text-2xl" />
                  </div>
                  <div>
                    <Text
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Projects
                    </Text>
                    <div
                      className={`text-3xl font-bold mt-1 ${
                        isDark ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {totalProjects}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${
                  isDark
                    ? "bg-gray-800 border border-gray-600 shadow-gray-900/30"
                    : "bg-gradient-to-br from-white to-green-50"
                }`}
                hoverable
                styles={{
                  body: {
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    color: isDark ? "#f3f4f6" : "#1f2937",
                    border: "none",
                  },
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                    <TrophyOutlined className="text-white text-2xl" />
                  </div>
                  <div>
                    <Text
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
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
                  isDark
                    ? "bg-gray-800 border border-gray-600 shadow-gray-900/30"
                    : "bg-gradient-to-br from-white to-purple-50"
                }`}
                hoverable
                styles={{
                  body: {
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    color: isDark ? "#f3f4f6" : "#1f2937",
                    border: "none",
                  },
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                    <CheckCircleOutlined className="text-white text-2xl" />
                  </div>
                  <div>
                    <Text
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
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
                  isDark
                    ? "bg-gray-800 border border-gray-600 shadow-gray-900/30"
                    : "bg-gradient-to-br from-white to-red-50"
                }`}
                hoverable
                styles={{
                  body: {
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    color: isDark ? "#f3f4f6" : "#1f2937",
                    border: "none",
                  },
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                    <ExclamationCircleOutlined className="text-white text-2xl" />
                  </div>
                  <div>
                    <Text
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
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

        {/* Dashboard Cards - Draggable */}
        <div className="space-y-4">
          <Title
            level={3}
            className={`mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            <BarChartOutlined className="mr-2" />
            Comprehensive Dashboard
            <Text
              className={`ml-3 text-sm font-normal ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              (Drag cards to reorder)
            </Text>
          </Title>
          <Row gutter={[32, 32]} className="h-full">
            {dashboardCards.map((card, index) => (
              <Col key={card.id} xs={24} xl={12} className="flex">
                <div className="w-full">
                  <DraggableCard
                    card={card}
                    index={index}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDark={isDark}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </>
  );
}
