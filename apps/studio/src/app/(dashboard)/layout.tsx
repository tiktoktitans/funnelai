'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  Home,
  Users,
  Inbox,
  MessageSquare,
  Mail,
  Workflow,
  TrendingUp,
  Settings,
  BarChart3,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  Calendar,
  FileText,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-blue-600' },
  { name: 'Contacts', href: '/contacts', icon: Users, color: 'text-indigo-600' },
  { name: 'Leads', href: '/leads', icon: UserPlus, color: 'text-purple-600' },
  { name: 'Inbox', href: '/inbox', icon: Inbox, color: 'text-pink-600', badge: '3' },
  { name: 'SMS', href: '/sms', icon: Phone, color: 'text-green-600' },
  { name: 'Email', href: '/email', icon: Mail, color: 'text-cyan-600' },
  { name: 'Sequences', href: '/sequences', icon: Workflow, color: 'text-orange-600' },
  { name: 'Pipelines', href: '/pipelines', icon: TrendingUp, color: 'text-yellow-600' },
  { name: 'Templates', href: '/templates', icon: FileText, color: 'text-rose-600' },
  { name: 'Automations', href: '/automations', icon: Zap, color: 'text-violet-600' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'text-teal-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 shadow-xl transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InfoOS
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                    : "hover:bg-gray-50"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? item.color : "text-gray-500 group-hover:" + item.color
                  )}
                />
                {!collapsed && (
                  <>
                    <span
                      className={cn(
                        "font-medium transition-colors",
                        isActive ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                      )}
                    >
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="ml-auto bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </button>
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email || 'User'}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="mt-2 w-full text-left text-sm text-red-600 hover:text-red-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "pl-20" : "pl-64"
      )}>
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">Welcome back! Here&apos;s your overview</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Calendar className="w-5 h-5 text-gray-600" />
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}