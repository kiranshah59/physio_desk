'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, UserRoundCog, Calendar, CreditCard } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const routes = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
  ];

  // Admin only routes
  if (user?.role === 'admin') {
    routes.push({ name: 'Therapists', href: '/therapists', icon: UserRoundCog });
  }
  
  // Both can see billing but staff is read-only (enforced via API, here we just show the link)
  routes.push({ name: 'Billing', href: '/billing', icon: CreditCard });

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wider text-teal-400">PhysioDesk</h1>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          // Special case for dashboard to not highlight on every route
          const actuallyActive = route.href === '/' ? pathname === '/' : isActive;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
                actuallyActive
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{route.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-400 text-center">
        &copy; 2026 PhysioDesk
      </div>
    </div>
  );
}
