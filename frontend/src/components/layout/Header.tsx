'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-border-main flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center text-text-primary font-semibold text-lg font-fraunces">
        Welcome back{user?.email && user.email !== 'user' ? `, ${user.email}` : ''}!
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-text-secondary bg-bg-main px-3 py-1.5 rounded-full text-xs font-medium border border-border-main/60">
          {user?.role === 'admin' ? (
            <ShieldCheck className="w-4 h-4 text-primary" />
          ) : (
            <UserIcon className="w-4 h-4 text-tertiary" />
          )}
          <span className="font-semibold text-text-primary">
            {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-text-secondary hover:text-status-error transition-colors p-2 rounded-md hover:bg-status-error-soft cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
