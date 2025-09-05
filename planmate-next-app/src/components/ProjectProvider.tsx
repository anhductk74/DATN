'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectStatus } from '@/types';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectsByStatus: (status: ProjectStatus) => Project[];
  getProjectStats: () => {
    total: number;
    active: number;
    completed: number;
    onHold: number;
    totalBudget: number;
    completionRate: number;
  };
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

// Mock projects data - in real app this would come from API
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Website Redesign',
    description: 'Complete redesign of the company e-commerce platform with modern UI/UX',
    status: 'active',
    priority: 'high',
    progress: 65,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-04-30'),
    budget: 50000,
    spent: 32500,
    teamMembers: [
      { id: '1', name: 'John Smith', role: 'Project Manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' },
      { id: '2', name: 'Sarah Johnson', role: 'UI/UX Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
      { id: '3', name: 'Mike Wilson', role: 'Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' }
    ],
    tags: ['web', 'design', 'e-commerce'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    status: 'active',
    priority: 'high',
    progress: 40,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-06-15'),
    budget: 75000,
    spent: 30000,
    teamMembers: [
      { id: '4', name: 'Emily Davis', role: 'Mobile Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily' },
      { id: '5', name: 'David Brown', role: 'Backend Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david' }
    ],
    tags: ['mobile', 'ios', 'android'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: '3',
    name: 'Data Analytics Dashboard',
    description: 'Business intelligence dashboard for real-time data visualization',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    startDate: new Date('2023-10-01'),
    endDate: new Date('2024-01-31'),
    budget: 35000,
    spent: 34500,
    teamMembers: [
      { id: '6', name: 'Lisa Wang', role: 'Data Analyst', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa' },
      { id: '7', name: 'James Miller', role: 'Frontend Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james' }
    ],
    tags: ['analytics', 'dashboard', 'data'],
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '4',
    name: 'Marketing Campaign Platform',
    description: 'Automated marketing campaign management system',
    status: 'planning',
    priority: 'medium',
    progress: 15,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-07-30'),
    budget: 45000,
    spent: 6750,
    teamMembers: [
      { id: '8', name: 'Anna Taylor', role: 'Marketing Manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna' },
      { id: '9', name: 'Tom Anderson', role: 'Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom' }
    ],
    tags: ['marketing', 'automation', 'campaigns'],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: '5',
    name: 'Security Audit & Compliance',
    description: 'Comprehensive security audit and compliance implementation',
    status: 'on-hold',
    priority: 'high',
    progress: 25,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-05-30'),
    budget: 60000,
    spent: 15000,
    teamMembers: [
      { id: '10', name: 'Robert Chen', role: 'Security Expert', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert' }
    ],
    tags: ['security', 'compliance', 'audit'],
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-02-20')
  }
];

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState(false);

  // Simulate API call
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter(project => project.status === status);
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold = projects.filter(p => p.status === 'on-hold').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const completionRate = projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0;

    return {
      total,
      active,
      completed,
      onHold,
      totalBudget,
      completionRate
    };
  };

  const contextValue: ProjectContextType = {
    projects,
    loading,
    error: null,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByStatus,
    getProjectStats
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};
