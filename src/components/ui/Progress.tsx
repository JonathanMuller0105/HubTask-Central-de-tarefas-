import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  showValue?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const Progress: React.FC<ProgressProps> = ({
  className,
  value = 0,
  max = 100,
  showValue = false,
  showPercentage,
  size = 'md',
  variant = 'primary',
  ...props
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  const displayPercentage = showPercentage ?? showValue;

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    primary: 'bg-indigo-600 dark:bg-indigo-500',
    success: 'bg-emerald-600 dark:bg-emerald-500',
    warning: 'bg-amber-500 dark:bg-amber-400',
    danger: 'bg-rose-600 dark:bg-rose-500',
  };

  return (
    <div className="w-full space-y-1">
      {displayPercentage && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>Progresso</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden',
          heights[size],
          className
        )}
        {...props}
      >
        <div
          className={cn('h-full transition-all duration-300 rounded-full', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
