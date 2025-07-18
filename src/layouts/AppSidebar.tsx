
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  BarChart3,
  Dumbbell,
  UserCheck,
  Trophy,
  HelpCircle,
  Shield,
  UserCog,
  Monitor,
  Package,
  Store
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

// Role-based navigation items
const navigationItems: Record<UserRole, Array<{
  title: string;
  url: string;
  icon: any;
  group: string;
}>> = {
  'super-admin': [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'System Health', url: '/system-health', icon: BarChart3, group: 'Overview' },
    { title: 'User Management', url: '/users', icon: UserCog, group: 'Administration' },
    { title: 'Role Management', url: '/roles', icon: Shield, group: 'Administration' },
    { title: 'Branch Management', url: '/branches', icon: Settings, group: 'Administration' },
    { title: 'System Backup', url: '/backup', icon: HelpCircle, group: 'System' },
    { title: 'Analytics', url: '/analytics', icon: BarChart3, group: 'Insights' },
  ],
  admin: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'Analytics', url: '/analytics', icon: BarChart3, group: 'Overview' },
    { title: 'User Management', url: '/users', icon: UserCog, group: 'Administration' },
    { title: 'Role Management', url: '/roles', icon: Shield, group: 'Administration' },
    { title: 'Leads', url: '/leads', icon: Users, group: 'Sales' },
    { title: 'Referrals', url: '/referrals', icon: Trophy, group: 'Sales' },
    { title: 'Members', url: '/members', icon: Users, group: 'Management' },
    { title: 'Team', url: '/team', icon: UserCheck, group: 'Management' },
    { title: 'Equipment', url: '/equipment', icon: Dumbbell, group: 'Management' },
    { title: 'Products', url: '/products', icon: Package, group: 'Store' },
    { title: 'POS System', url: '/pos', icon: Monitor, group: 'Store' },
    { title: 'Classes', url: '/classes', icon: Calendar, group: 'Services' },
    { title: 'Billing', url: '/billing', icon: CreditCard, group: 'Services' },
    { title: 'Settings', url: '/settings', icon: Settings, group: 'System' },
  ],
  manager: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'Leads', url: '/leads', icon: Users, group: 'Sales' },
    { title: 'Referrals', url: '/referrals', icon: Trophy, group: 'Sales' },
    { title: 'Team Management', url: '/team', icon: UserCheck, group: 'Management' },
    { title: 'Members', url: '/members', icon: Users, group: 'Management' },
    { title: 'Products', url: '/products', icon: Package, group: 'Store' },
    { title: 'POS System', url: '/pos', icon: Monitor, group: 'Store' },
    { title: 'Classes', url: '/classes', icon: Calendar, group: 'Operations' },
    { title: 'Equipment', url: '/equipment', icon: Dumbbell, group: 'Operations' },
    { title: 'Reports', url: '/reports', icon: BarChart3, group: 'Analytics' },
    { title: 'Schedule', url: '/schedule', icon: Calendar, group: 'Planning' },
  ],
  staff: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'Leads', url: '/leads', icon: Users, group: 'Daily Tasks' },
    { title: 'Members', url: '/members', icon: Users, group: 'Daily Tasks' },
    { title: 'Check-ins', url: '/checkins', icon: UserCheck, group: 'Daily Tasks' },
    { title: 'POS System', url: '/pos', icon: Monitor, group: 'Store' },
    { title: 'Classes', url: '/classes', icon: Calendar, group: 'Support' },
    { title: 'Reports', url: '/reports', icon: BarChart3, group: 'Reports' },
  ],
  trainer: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'My Leads', url: '/leads', icon: Users, group: 'Training' },
    { title: 'My Classes', url: '/my-classes', icon: Calendar, group: 'Classes' },
    { title: 'Members', url: '/members', icon: Users, group: 'Training' },
    { title: 'Schedule', url: '/schedule', icon: Calendar, group: 'Planning' },
    { title: 'Equipment', url: '/equipment', icon: Dumbbell, group: 'Resources' },
  ],
  member: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'My Workouts', url: '/workouts', icon: Dumbbell, group: 'Fitness' },
    { title: 'Classes', url: '/member/classes', icon: Calendar, group: 'Fitness' },
    { title: 'Store', url: '/store', icon: Store, group: 'Shopping' },
    { title: 'Goals', url: '/goals', icon: Trophy, group: 'Fitness' },
    { title: 'Refer Friends', url: '/referrals', icon: Trophy, group: 'Rewards' },
    { title: 'Billing', url: '/billing', icon: CreditCard, group: 'Account' },
    { title: 'Help', url: '/help', icon: HelpCircle, group: 'Support' },
  ]
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { authState } = useAuth();
  const currentPath = location.pathname;
  
  const collapsed = state === 'collapsed';

  if (!authState.user) return null;

  const userNavItems = navigationItems[authState.user.role];
  const groupedItems = userNavItems.reduce((groups, item) => {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }
    groups[item.group].push(item);
    return groups;
  }, {} as Record<string, typeof userNavItems>);

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="px-0">
        {/* Brand */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-sidebar-foreground">GymFit Pro</h2>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{authState.user.role} Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {Object.entries(groupedItems).map(([group, items]) => (
          <SidebarGroup key={group}>
            {!collapsed && <SidebarGroupLabel>{group}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => 
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
