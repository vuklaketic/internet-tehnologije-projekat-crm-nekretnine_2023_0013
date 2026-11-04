import React from 'react';
import { RiInboxLine } from '@remixicon/react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl my-6">
      <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-full text-blue-600 dark:text-blue-400 mb-3">
        <RiInboxLine className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
