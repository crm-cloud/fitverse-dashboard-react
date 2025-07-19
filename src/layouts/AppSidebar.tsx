
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
  MapPin,
  Database,
  Target,
  Activity
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
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/types/auth';
import { Badge } from '@/components/ui/badge';

// Navigation items with permission requirements
const navigationItems = [
  // Dashboard - All roles
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, group: 'Overview', permission: null },
  
  // System Management - Super Admin only
  { title: 'System Health', url: '/system-health', icon: BarChart3, group: 'System Management', permission: 'system.view' },
  { title: 'Branch Management', url: '/branches', icon: Building2, group: 'System Management', permission: 'branches.view' },
  { title: 'User Management', url: '/users', icon: UserCog, group: 'System Management', permission: 'users.view' },
  { title: 'Role Management', url: '/roles', icon: Shield, group: 'System Management', permission: 'roles.view' },
  { title: 'System Settings', url: '/system-settings', icon: Settings, group: 'System Management', permission: 'system.manage' },
  { title: 'System Backup', url: '/backup', icon: Database, group: 'System Management', permission: 'system.backup' },
  
  // Analytics & Reports
  { title: 'Analytics', url: '/analytics', icon: BarChart3, group: 'Insights', permission: 'analytics.view' },
  { title: 'Reports', url: '/reports', icon: BarChart3, group: 'Insights', permission: 'reports.view' },
  
  // Operations
  { title: 'Members', url: '/members', icon: Users, group: 'Operations', permission: 'members.view' },
  { title: 'Trainers', url: '/trainers', icon: UserCheck, group: 'Operations', permission: 'team.view' },
  { title: 'Team', url: '/team', icon: UserCheck, group: 'Operations', permission: 'team.view' },
  { title: 'Classes', url: '/classes', icon: Calendar, group: 'Operations', permission: 'classes.view' },
  { title: 'Equipment', url: '/equipment', icon: Dumbbell, group: 'Operations', permission: 'equipment.view' },
  { title: 'Check-ins', url: '/checkins', icon: UserCheck, group: 'Operations', permission: null },
  
  // Business
  { title: 'Finance', url: '/finance', icon: CreditCard, group: 'Business', permission: 'finance.view' },
  { title: 'Leads', url: '/leads', icon: Users, group: 'Business', permission: 'leads.view' },
  { title: 'Referrals', url: '/referrals', icon: Trophy, group: 'Business', permission: 'referrals.view' },
  
  // Store
  { title: 'Products', url: '/products', icon: Package, group: 'Store', permission: 'products.view' },
  { title: 'POS System', url: '/pos', icon: Monitor, group: 'Store', permission: 'pos.view' },
  { title: 'Store', url: '/store', icon: Store, group: 'Store', permission: 'products.view', memberOnly: true },
  
  // Services
  { title: 'Diet & Workout', url: '/diet-workout', icon: Apple, group: 'Services', permission: 'diet-workout.view' },
  { title: 'My Workouts', url: '/workouts', icon: Dumbbell, group: 'Fitness', permission: null, memberOnly: true },
  { title: 'Goals & Progress', url: '/goals', icon: Target, group: 'Fitness', permission: null, memberOnly: true },
  
  // Member Classes
  { title: 'My Classes', url: '/member/classes', icon: Calendar, group: 'Fitness', permission: null, memberOnly: true },
  
  // Management
  { title: 'Feedback', url: '/feedback', icon: MessageSquare, group: 'Management', permission: 'feedback.view' },
  { title: 'Give Feedback', url: '/member/feedback', icon: MessageSquare, group: 'Support', permission: null, memberOnly: true },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare, group: 'Management', permission: 'tasks.view' },
  
  // Membership Management
  { title: 'Membership Plans', url: '/membership/plans', icon: CreditCard, group: 'Membership', permission: 'members.view' },
  { title: 'My Membership', url: '/membership/dashboard', icon: CreditCard, group: 'Account', permission: null, memberOnly: true },
  
  // Account
  { title: 'Billing', url: '/billing', icon: CreditCard, group: 'Account', permission: null, memberOnly: true },
  { title: 'Help', url: '/help', icon: HelpCircle, group: 'Support', permission: null, memberOnly: true },
  { title: 'Settings', url: '/settings', icon: Settings, group: 'System', permission: 'settings.view' }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { authState } = useAuth();
  const { hasPermission } = useRBAC();
  const currentPath = location.pathname;
  
  const collapsed = state === 'collapsed';

  if (!authState.user) return null;

  // Filter navigation items based on permissions and role
  const filteredItems = navigationItems.filter(item => {
    // Check if item is member-only and user is not a member
    if (item.memberOnly && authState.user?.role !== 'member') {
      return false;
    }
    
    // Check if item is not for members and user is a member
    if (!item.memberOnly && authState.user?.role === 'member' && item.permission) {
      return false;
    }
    
    // Check permission if required
    if (item.permission && !hasPermission(item.permission as any)) {
      return false;
    }
    
    return true;
  });

  // Group filtered items
  const groupedItems = filteredItems.reduce((groups, item) => {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }
    groups[item.group].push(item);
    return groups;
  }, {} as Record<string, typeof filteredItems>);

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
