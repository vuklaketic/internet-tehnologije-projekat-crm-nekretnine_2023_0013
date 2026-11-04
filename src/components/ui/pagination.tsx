import React from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import { Button } from './button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Prikazano <span className="font-medium">{(page - 1) * pageSize + 1}</span> do{' '}
            <span className="font-medium">{Math.min(page * pageSize, total)}</span> od ukupno{' '}
            <span className="font-medium">{total}</span> rezultata
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <RiArrowLeftSLine className="w-4 h-4" />
            Prethodna
          </Button>
          <span className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Sledeća
            <RiArrowRightSLine className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
