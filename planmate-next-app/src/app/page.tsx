import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  ChartBarIcon, 
  FolderIcon, 
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative px-6 lg:px-8">
        <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              <span className="text-blue-600">PlanMate</span>
              <br />
              Quản lý công việc thông minh
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Hệ thống quản lý dự án và công việc hiện đại, giúp doanh nghiệp tối ưu hóa quy trình làm việc,
              theo dõi tiến độ và nâng cao hiệu suất làm việc nhóm.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/dashboard">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Bắt đầu ngay
                </Button>
              </Link>
              <Link href="/projects" className="text-sm font-semibold leading-6 text-gray-900">
                Xem dự án <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tính năng nổi bật
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Tất cả những gì bạn cần để quản lý dự án hiệu quả trong một nền tảng duy nhất
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <FolderIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Quản lý dự án
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Tạo, theo dõi và quản lý dự án một cách có hệ thống. Phân chia công việc, 
                    giao nhiệm vụ và theo dõi tiến độ realtime.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <CalendarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Lịch làm việc
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Quản lý lịch trình, deadline và các sự kiện quan trọng. 
                    Tích hợp thông báo để không bỏ lỡ công việc nào.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Báo cáo & Phân tích
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Xem báo cáo chi tiết về hiệu suất làm việc, tiến độ dự án 
                    và các chỉ số KPI quan trọng.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Quản lý nhóm
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Tổ chức nhóm làm việc, phân quyền truy cập và theo dõi 
                    hoạt động của từng thành viên.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Timeline dự án
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Visualize tiến độ dự án với timeline trực quan, 
                    theo dõi mốc thời gian và dependencies.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Task Management
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Quản lý nhiệm vụ với kanban board, drag & drop, 
                    priority management và workflow tự động.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Sẵn sàng nâng cao hiệu suất làm việc?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Hãy trải nghiệm PlanMate ngay hôm nay và khám phá cách quản lý dự án hiệu quả.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Khám phá Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
