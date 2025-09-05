import { cn, getStatusColor, getPriorityColor } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'status' | 'priority';
  status?: string;
  priority?: string;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ 
  variant = 'default', 
  status, 
  priority, 
  className, 
  children 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  let variantClasses = 'bg-gray-100 text-gray-800';
  
  if (variant === 'status' && status) {
    variantClasses = getStatusColor(status);
  } else if (variant === 'priority' && priority) {
    variantClasses = getPriorityColor(priority);
  }
  
  return (
    <span className={cn(baseClasses, variantClasses, className)}>
      {children}
    </span>
  );
}
