export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  TEAM_LEAD = 'team_lead',
  TEAM_MEMBER = 'team_member'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  joinedAt: Date;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'calendar', actions: ['create', 'read', 'update', 'delete'] }
  ],
  [UserRole.PROJECT_MANAGER]: [
    { resource: 'projects', actions: ['create', 'read', 'update'] },
    { resource: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'calendar', actions: ['create', 'read', 'update', 'delete'] }
  ],
  [UserRole.TEAM_LEAD]: [
    { resource: 'tasks', actions: ['create', 'read', 'update'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'projects', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'calendar', actions: ['create', 'read', 'update'] }
  ],
  [UserRole.TEAM_MEMBER]: [
    { resource: 'tasks', actions: ['read', 'update'] },
    { resource: 'projects', actions: ['read'] },
    { resource: 'calendar', actions: ['read', 'update'] }
  ]
};
