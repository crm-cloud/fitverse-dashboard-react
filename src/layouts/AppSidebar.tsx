
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
  Store,
  Apple,
  MessageSquare,
  CheckSquare,
  Building2,
  MapPin
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
import { BranchSelector } from '@/components/BranchSelector';
import { Badge } from '@/components/ui/badge';

// Updated navigation items for 4-role system
const navigationItems: Record<UserRole, Array<{
  title: string;
  url: string;
  icon: any;
  group: string;
}>> = {
  'super-admin': [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'System Health', url: '/system-health', icon: BarChart3, group: 'Overview' },
    { title: 'Branch Management', url: '/branches', icon: Building2, group: 'System Management' },
    { title: 'User Management', url: '/users', icon: UserCog, group: 'System Management' },
    { title: 'Role Management', url: '/roles', icon: Shield, group: 'System Management' },
    { title: 'System Settings', url: '/system-settings', icon: Settings, group: 'System Management' },
    { title: 'Global Analytics', url: '/analytics', icon: BarChart3, group: 'Insights' },
    { title: 'System Backup', url: '/backup', icon: HelpCircle, group: 'System Management' },
  ],
  admin: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'Analytics', url: '/analytics', icon: BarChart3, group: 'Overview' },
    { title: 'Branch Overview', url: '/branches', icon: Building2, group: 'Management' },
    { title: 'User Management', url: '/users', icon: UserCog, group: 'Management' },
    { title: 'Members', url: '/members', icon: Users, group: 'Operations' },
    { title: 'Team', url: '/team', icon: UserCheck, group: 'Operations' },
    { title: 'Classes', url: '/classes', icon: Calendar, group: 'Operations' },
    { title: 'Equipment', url: '/equipment', icon: Dumbbell, group: 'Operations' },
    { title: 'Finance', url: '/finance', icon: CreditCard, group: 'Business' },
    { title: 'Leads', url: '/leads', icon: Users, group: 'Business' },
    { title: 'Referrals', url: '/referrals', icon: Trophy, group: 'Business' },
    { title: 'Products', url: '/products', icon: Package, group: 'Store' },
    { title: 'POS System', url: '/pos', icon: Monitor, group: 'Store' },
    { title: 'Diet & Workout', url: '/diet-workout', icon: Apple, group: 'Services' },
    { title: 'Feedback', url: '/feedback', icon: MessageSquare, group: 'Management' },
    { title: 'Tasks', url: '/tasks', icon: CheckSquare, group: 'Management' },
    { title: 'Settings', url: '/settings', icon: Settings, group: 'System' },
  ],
  team: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'Members', url: '/members', icon: Users, group: 'Daily Operations' },
    { title: 'Check-ins', url: '/checkins', icon: UserCheck, group: 'Daily Operations' },
    { title: 'Classes', url: '/classes', icon: Calendar, group: 'Daily Operations' },
    { title: 'Tasks', url: '/tasks', icon: CheckSquare, group: 'Daily Operations' },
    { title: 'Leads', url: '/leads', icon: Users, group: 'Sales & Marketing' },
    { title: 'Referrals', url: '/referrals', icon: Trophy, group: 'Sales & Marketing' },
    { title: 'POS System', url: '/pos', icon: Monitor, group: 'Store Operations' },
    { title: 'Equipment', url: '/equipment', icon: Dumbbell, group: 'Facility' },
    { title: 'Diet & Workout', url: '/diet-workout', icon: Apple, group: 'Member Services' },
    { title: 'Feedback', url: '/feedback', icon: MessageSquare, group: 'Member Services' },
    { title: 'Finance', url: '/finance', icon: CreditCard, group: 'Reports' },
    { title: 'Reports', url: '/reports', icon: BarChart3, group: 'Reports' },
  ],
  member: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { title: 'My Workouts', url: '/workouts', icon: Dumbbell, group: 'Fitness' },
    { title: 'Diet Plans', url: '/diet-workout', icon: Apple, group: 'Fitness' },
    { title: 'Classes', url: '/member/classes', icon: Calendar, group: 'Fitness' },
    { title: 'Goals & Progress', url: '/goals', icon: Trophy, group: 'Fitness' },
    { title: 'Store', url: '/store', icon: Store, group: 'Shopping' },
    { title: 'Refer Friends', url: '/referrals', icon: Trophy, group: 'Rewards' },
    { title: 'Billing', url: '/billing', icon: CreditCard, group: 'Account' },
    { title: 'Give Feedback', url: '/member/feedback', icon: MessageSquare, group: 'Support' },
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

  const getRoleDisplayName = (role: UserRole, teamRole?: string) => {
    if (role === 'team' && teamRole) {
      return `${teamRole.charAt(0).toUpperCase() + teamRole.slice(1)} Panel`;
    }
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Panel`;
  };

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
              <div className="flex-1">
                <h2 className="font-bold text-sidebar-foreground">GymFit Pro</h2>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-sidebar-foreground/60">
                    {getRoleDisplayName(authState.user.role, authState.user.teamRole)}
                  </p>
                  {authState.user.teamRole && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {authState.user.teamRole}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Branch Selector for non-global roles */}
        {!collapsed && (authState.user.role === 'team' || authState.user.role === 'member') && (
          <div className="px-4 py-2 border-b border-sidebar-border">
            <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{authState.user.branchName || 'No Branch'}</span>
            </div>
          </div>
        )}

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
