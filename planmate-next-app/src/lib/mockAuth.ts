import { User, UserRole } from '@/types/auth';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@planmate.com',
    name: 'System Administrator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: UserRole.ADMIN,
    department: 'IT',
    joinedAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: '2',
    email: 'pm@planmate.com',
    name: 'John Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    role: UserRole.PROJECT_MANAGER,
    department: 'Development',
    joinedAt: new Date('2024-02-15'),
    isActive: true
  },
  {
    id: '3',
    email: 'lead@planmate.com',
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    role: UserRole.TEAM_LEAD,
    department: 'Development',
    joinedAt: new Date('2024-03-10'),
    isActive: true
  },
  {
    id: '4',
    email: 'member@planmate.com',
    name: 'Mike Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    role: UserRole.TEAM_MEMBER,
    department: 'Development',
    joinedAt: new Date('2024-04-20'),
    isActive: true
  }
];

export const mockCredentials = [
  { email: 'admin@planmate.com', password: 'admin123' },
  { email: 'pm@planmate.com', password: 'pm123' },
  { email: 'lead@planmate.com', password: 'lead123' },
  { email: 'member@planmate.com', password: 'member123' }
];

// Mock API simulation
export const mockLogin = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const credential = mockCredentials.find(cred => cred.email === email && cred.password === password);
      
      if (credential) {
        const user = mockUsers.find(u => u.email === email);
        if (user) {
          resolve(user);
        } else {
          reject(new Error('User not found'));
        }
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000); // Simulate API delay
  });
};
