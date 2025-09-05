"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ThemeProvider";
import { 
  ChartBarIcon, 
  FolderIcon, 
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? "bg-gradient-to-br from-gray-900 to-gray-800" 
        : "bg-gradient-to-br from-blue-50 to-indigo-100"
    }`}>
      {/* Hero Section */}
      <div className="relative px-6 lg:px-8">
        <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
          <div className="text-center">
            <h1 className={`text-4xl font-bold tracking-tight sm:text-6xl transition-colors duration-300 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <span className={`${isDark ? "text-blue-400" : "text-blue-600"} transition-colors duration-300`}>
                PlanMate
              </span>
              <br />
              Smart Work Management
            </h1>
            <p className={`mt-6 text-lg leading-8 transition-colors duration-300 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Modern project and task management system that helps businesses optimize workflows,
              track progress, and enhance team productivity.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/dashboard">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/projects" className={`text-sm font-semibold leading-6 transition-colors duration-300 ${
                isDark ? "text-gray-200 hover:text-white" : "text-gray-900 hover:text-gray-700"
              }`}>
                View Projects <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-24 sm:py-32 transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl transition-colors duration-300 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              Key Features
            </h2>
            <p className={`mt-6 text-lg leading-8 transition-colors duration-300 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Everything you need to manage projects effectively in one unified platform
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className={`flex flex-col p-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                isDark 
                  ? "hover:bg-gray-700/50 hover:shadow-xl" 
                  : "hover:bg-gray-50 hover:shadow-lg"
              }`}>
                <dt className={`text-base font-semibold leading-7 transition-colors duration-300 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300 ${
                    isDark ? "bg-blue-500" : "bg-blue-600"
                  }`}>
                    <FolderIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Project Management
                </dt>
                <dd className={`mt-1 flex flex-auto flex-col text-base leading-7 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  <p className="flex-auto">
                    Create, track and manage projects systematically. Divide tasks, 
                    assign responsibilities and monitor progress in real-time.
                  </p>
                </dd>
              </div>
              <div className={`flex flex-col p-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                isDark 
                  ? "hover:bg-gray-700/50 hover:shadow-xl" 
                  : "hover:bg-gray-50 hover:shadow-lg"
              }`}>
                <dt className={`text-base font-semibold leading-7 transition-colors duration-300 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 ${
                    isDark ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}>
                    <CalendarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Work Calendar
                </dt>
                <dd className={`mt-1 flex flex-auto flex-col text-base leading-7 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  <p className="flex-auto">
                    Manage schedules, deadlines and important events. 
                    Integrated notifications so you never miss any tasks.
                  </p>
                </dd>
              </div>
              <div className={`flex flex-col p-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                isDark 
                  ? "hover:bg-gray-700/50 hover:shadow-xl" 
                  : "hover:bg-gray-50 hover:shadow-lg"
              }`}>
                <dt className={`text-base font-semibold leading-7 transition-colors duration-300 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 ${
                    isDark ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}>
                    <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Reports & Analytics
                </dt>
                <dd className={`mt-1 flex flex-auto flex-col text-base leading-7 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  <p className="flex-auto">
                    View detailed reports on work performance, project progress 
                    and important KPI metrics.
                  </p>
                </dd>
              </div>
              <div className={`flex flex-col p-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                isDark 
                  ? "hover:bg-gray-700/50 hover:shadow-xl" 
                  : "hover:bg-gray-50 hover:shadow-lg"
              }`}>
                <dt className={`text-base font-semibold leading-7 transition-colors duration-300 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 ${
                    isDark ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}>
                    <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Team Management
                </dt>
                <dd className={`mt-1 flex flex-auto flex-col text-base leading-7 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  <p className="flex-auto">
                    Organize work teams, manage access permissions and track 
                    activities of each member.
                  </p>
                </dd>
              </div>
              <div className={`flex flex-col p-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                isDark 
                  ? "hover:bg-gray-700/50 hover:shadow-xl" 
                  : "hover:bg-gray-50 hover:shadow-lg"
              }`}>
                <dt className={`text-base font-semibold leading-7 transition-colors duration-300 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 ${
                    isDark ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}>
                    <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Project Timeline
                </dt>
                <dd className={`mt-1 flex flex-auto flex-col text-base leading-7 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  <p className="flex-auto">
                    Visualize project progress with intuitive timeline, 
                    track milestones and dependencies.
                  </p>
                </dd>
              </div>
              <div className={`flex flex-col p-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                isDark 
                  ? "hover:bg-gray-700/50 hover:shadow-xl" 
                  : "hover:bg-gray-50 hover:shadow-lg"
              }`}>
                <dt className={`text-base font-semibold leading-7 transition-colors duration-300 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 ${
                    isDark ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}>
                    <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Task Management
                </dt>
                <dd className={`mt-1 flex flex-auto flex-col text-base leading-7 transition-colors duration-300 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  <p className="flex-auto">
                    Manage tasks with kanban board, drag & drop, 
                    priority management and automated workflows.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`transition-colors duration-300 ${
        isDark ? "bg-gradient-to-r from-blue-700 to-blue-800" : "bg-blue-600"
      }`}>
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to boost your productivity?
            </h2>
            <p className={`mx-auto mt-6 max-w-xl text-lg leading-8 transition-colors duration-300 ${
              isDark ? "text-blue-200" : "text-blue-100"
            }`}>
              Try PlanMate today and discover how to manage projects effectively.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/dashboard">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className={`transition-all duration-300 ${
                    isDark 
                      ? "bg-white text-blue-700 hover:bg-gray-100" 
                      : "bg-white text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  Explore Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
