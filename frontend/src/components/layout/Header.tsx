'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center text-slate-800 font-semibold text-lg">
        {/* Can put page title here later using context or path parsing, for now just a greeting */}
        Welcome back!
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium">
          <UserIcon className="w-4 h-4" />
          <span>{user?.role === 'admin' ? 'Administrator' : 'Staff Member'}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
