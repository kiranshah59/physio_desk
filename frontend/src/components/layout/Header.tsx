'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-border-main flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center text-text-primary font-semibold text-lg">
        Welcome back!
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-text-secondary bg-bg-main px-3 py-1.5 rounded-full text-sm font-medium">
          <UserIcon className="w-4 h-4" />
          <span>{user?.role === 'admin' ? 'Administrator' : 'Staff Member'}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-text-secondary hover:text-status-error transition-colors p-2 rounded-md hover:bg-status-error-soft"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
