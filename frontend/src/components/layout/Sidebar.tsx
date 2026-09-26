'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, UserRoundCog, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const routes = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Schedule', href: '/appointments', icon: Calendar },
  ];

  // Admin only routes
  if (user?.role === 'admin') {
    routes.push({ name: 'Therapists', href: '/therapists', icon: UserRoundCog });
    routes.push({ name: 'Staff Access', href: '/users', icon: ShieldCheck });
  }
  
  // Both can see billing but staff is read-only
  routes.push({ name: 'Billing', href: '/billing', icon: CreditCard });

  return (
    <div className="w-64 bg-secondary text-surface flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center justify-center border-b border-secondary-light">
        <h1 className="text-xl font-bold tracking-wider text-primary-soft">PhysioDesk</h1>
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
                  ? 'bg-primary text-surface'
                  : 'text-primary-soft hover:bg-secondary-light hover:text-surface'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{route.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-secondary-light text-xs text-primary-soft text-center opacity-70">
        &copy; 2026 PhysioDesk
      </div>
    </div>
  );
}
