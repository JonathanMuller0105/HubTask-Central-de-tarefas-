import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando dados...',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center text-slate-500 dark:text-slate-400',
        className
      )}
    >
      <Loader2 className="w-8 h-8 animate-spin text-brand-accent dark:text-sky-400 mb-3" />
      <p className="text-xs font-medium">{message}</p>
    </div>
  );
};
