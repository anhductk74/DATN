# Admin Smart Mall React

Admin dashboard for Smart Mall built with React, TypeScript, Ant Design, and React Router.

## Features

- ✅ Admin authentication with JWT
- ✅ Role-based access control (Admin only)
- ✅ Protected routes
- ✅ Automatic token refresh
- ✅ Responsive design with Ant Design
- ✅ TypeScript support
- ✅ State management with Zustand

## Prerequisites

- Node.js 18+ or Bun
- Backend API running on `http://localhost:8080`

## Installation

```bash
# Install dependencies
pnpm install
```

## Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Development

```bash
# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

## Default Credentials

- **Username**: `admin`
- **Password**: `admin`

## Project Structure

```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.tsx
├── pages/              # Page components
│   ├── Login/
│   │   ├── Login.tsx
│   │   └── Login.css
│   └── Dashboard/
│       ├── Dashboard.tsx
│       └── Dashboard.css
├── router/             # React Router configuration
│   └── index.tsx
├── services/           # API services
│   ├── api.ts         # Axios instance with interceptors
│   └── auth.service.ts
├── stores/            # Zustand state management
│   └── authStore.ts
├── types/             # TypeScript type definitions
│   └── auth.types.ts
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Routes

- `/` - Login page (public)
- `/dashboard` - Dashboard (protected, admin only)

## Features Details

### Authentication
- JWT-based authentication
- Access token stored in localStorage
- Automatic token refresh when expired
- Logout functionality

### Authorization
- Only users with ADMIN role can access the dashboard
- Protected routes check authentication and role
- Automatic redirect to login if unauthorized

### API Integration
- Axios interceptors for token management
- Automatic retry on 401 errors
- Error handling with user-friendly messages

## Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Technologies Used

- **React 19** - UI library
- **TypeScript** - Type safety
- **Ant Design 5** - UI component library
- **React Router 7** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Vite** - Build tool
- **TailwindCSS** - Utility-first CSS

## License

MIT
