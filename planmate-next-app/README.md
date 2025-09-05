# PlanMate - Hệ thống quản lý công việc doanh nghiệp

## Giới thiệu

PlanMate là một hệ thống quản lý dự án và công việc hiện đại được xây dựng với Next.js 15, TypeScript và Tailwind CSS. Ứng dụng được thiết kế đặc biệt cho các doanh nghiệp muốn tối ưu hóa quy trình làm việc, theo dõi tiến độ dự án và nâng cao hiệu suất nhóm.

## Tính năng chính

### 🏠 Dashboard (Tổng quan)
- Hiển thị overview về tình hình dự án
- Thống kê nhiệm vụ theo trạng thái
- Hiển thị hoạt động gần đây
- Thống kê nhanh về hiệu suất

### 📁 Quản lý dự án
- Danh sách dự án với filtering và search
- Project cards hiển thị thông tin chi tiết
- Kanban board để quản lý nhiệm vụ
- Drag & drop để thay đổi trạng thái task
- Theo dõi tiến độ với progress bar

### 📅 Lịch làm việc
- Calendar view với các sự kiện
- Quản lý meetings, deadlines, milestones
- Event details với thông tin người tham gia
- Upcoming events sidebar

### 📊 Timeline dự án
- Visualize tiến độ dự án theo tháng
- Hiển thị duration và completion status
- Color coding cho các trạng thái khác nhau
- Project timeline overview

### 📈 Báo cáo & Phân tích
- Key metrics và KPIs
- Phân bố trạng thái dự án
- Hiệu suất làm việc nhóm
- Task insights và statistics

## Cách chạy dự án

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Công nghệ sử dụng

- **Frontend Framework**: Next.js 15 với App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Icons**: Heroicons
- **Drag & Drop**: @dnd-kit
- **Date Handling**: date-fns
