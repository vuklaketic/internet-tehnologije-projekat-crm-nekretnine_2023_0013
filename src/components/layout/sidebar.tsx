'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  RiDashboardLine,
  RiBuildingLine,
  RiUserFollowLine,
  RiKanbanView,
  RiCalendarLine,
  RiLogoutBoxRLine,
  RiShieldUserLine,
  RiUser3Line,
} from '@remixicon/react';

interface SidebarProps {
  user: {
    fullName: string;
    email: string;
    role: string;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { href: '/', label: 'Kontrolna tabla', icon: RiDashboardLine },
    { href: '/nekretnine', label: 'Nekretnine', icon: RiBuildingLine },
    { href: '/klijenti', label: 'Klijenti', icon: RiUserFollowLine },
    { href: '/leadovi', label: 'Prodajne prilike (Leads)', icon: RiKanbanView },
    { href: '/razgledanja', label: 'Razgledanja', icon: RiCalendarLine },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 text-slate-300">
      <div>
        {/* Brand / Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <RiBuildingLine className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">CRM Nekretnine</h1>
              <p className="text-[11px] text-slate-400">FON • Internet Tehnologije</p>
            </div>
          </div>
        </div>

        {/* Navigacija */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
              {user.role === 'admin' ? (
                <RiShieldUserLine className="w-5 h-5 text-amber-400" />
              ) : (
                <RiUser3Line className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                    user.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {user.role}
                </span>
                <span className="text-[11px] text-slate-500 truncate">{user.email}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/30 rounded-lg transition-colors cursor-pointer"
        >
          <RiLogoutBoxRLine className="w-4 h-4" />
          Odjava
        </button>
      </div>
    </aside>
  );
}
