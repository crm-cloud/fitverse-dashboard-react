import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Shield, 
  Building, 
  Calendar, 
  Dumbbell, 
  CreditCard, 
  DollarSign, 
  BarChart3, 
  UserCheck, 
  Briefcase, 
  ClipboardList, 
  MessageSquare, 
  ShoppingBag, 
  Package, 
  Settings, 
  FileText, 
  Activity, 
  MapPin, 
  Clock, 
  PieChart, 
  TrendingUp,
  CheckSquare,
  ShoppingCart,
  Car,
  Wrench,
  HelpCircle,
  Target,
  Mail,
  Smartphone,
  Database,
  Monitor,
  LifeBuoy,
  BrainCircuit
} from 'lucide-react';
import { UserRole } from '@/types/auth';
import { Permission } from '@/types/rbac';

export interface NavigationItem {
  id: string;
  title: string;
  url: string;
  icon: any;
  group: string;
  // Role-based access control
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  teamRole?: string;
  memberOnly?: boolean;
  // UI behavior
  exactMatch?: boolean;
  badge?: string;
  disabled?: boolean;
}

export interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
  // Group-level access control
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  teamRole?: string;
  priority?: number;
}

// Centralized navigation configuration with complete RBAC metadata
export const navigationConfig: NavigationGroup[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    priority: 1,
    items: [
      {
        id: 'dashboard-main',
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        group: 'dashboard',
        exactMatch: true,
      }
    ]
  },
  {
    id: 'user-management',
    title: 'User Management',
    allowedRoles: ['super-admin', 'admin'],
    requiredPermissions: ['users.view'],
    priority: 2,
    items: [
      {
        id: 'users-list',
        title: 'Users',
        url: '/users',
        icon: Users,
        group: 'user-management',
        requiredPermissions: ['users.view'],
      },
      {
        id: 'users-create',
        title: 'Add User',
        url: '/users/create',
        icon: UserPlus,
        group: 'user-management',
        requiredPermissions: ['users.create'],
      },
      {
        id: 'roles',
        title: 'Roles',
        url: '/roles',
        icon: Shield,
        group: 'user-management',
        allowedRoles: ['super-admin', 'admin'],
        requiredPermissions: ['roles.view'],
      },
      {
        id: 'roles-create',
        title: 'Add Role',
        url: '/roles/create',
        icon: Shield,
        group: 'user-management',
        allowedRoles: ['super-admin', 'admin'],
        requiredPermissions: ['roles.create'],
      },
      {
        id: 'team',
        title: 'Team',
        url: '/team',
        icon: Briefcase,
        group: 'user-management',
        requiredPermissions: ['team.view'],
      }
    ]
  },
  {
    id: 'saas-management',
    title: 'SaaS Management',
    allowedRoles: ['super-admin'],
    priority: 2,
    items: [
      {
        id: 'gyms',
        title: 'Gyms',
        url: '/gyms',
        icon: Building,
        group: 'saas-management',
        allowedRoles: ['super-admin'],
      },
      {
        id: 'subscription-plans',
        title: 'Subscription Plans',
        url: '/subscription-plans',
        icon: CreditCard,
        group: 'saas-management',
        allowedRoles: ['super-admin'],
      }
    ]
  },
  {
    id: 'branch-management',
    title: 'Branch Management',
    allowedRoles: ['admin', 'manager'],
    requiredPermissions: ['branches.view'],
    priority: 3,
    items: [
      {
        id: 'branches',
        title: 'Branches',
        url: '/branches',
        icon: Building,
        group: 'branch-management',
        allowedRoles: ['admin', 'manager'],
        requiredPermissions: ['branches.view'],
      },
      {
        id: 'branches-create',
        title: 'Add Branch',
        url: '/branches/create',
        icon: Building,
        group: 'branch-management',
        allowedRoles: ['admin', 'manager'],
        requiredPermissions: ['branches.create'],
      }
    ]
  },
  {
    id: 'members',
    title: 'Member Management',
    allowedRoles: ['super-admin', 'admin', 'team'],
    requiredPermissions: ['members.view'],
    priority: 4,
    items: [
      {
        id: 'members-list',
        title: 'Members',
        url: '/members',
        icon: Users,
        group: 'members',
        requiredPermissions: ['members.view'],
      },
      {
        id: 'members-create',
        title: 'Add Member',
        url: '/members/create',
        icon: UserPlus,
        group: 'members',
        requiredPermissions: ['members.create'],
      },
      {
        id: 'leads',
        title: 'Leads',
        url: '/leads',
        icon: UserCheck,
        group: 'members',
        requiredPermissions: ['leads.view'],
      }
    ]
  },
  {
    id: 'membership',
    title: 'Membership',
    allowedRoles: ['super-admin', 'admin', 'team'],
    priority: 5,
    items: [
      {
        id: 'membership-dashboard',
        title: 'Membership',
        url: '/membership',
        icon: CreditCard,
        group: 'membership',
        requiredPermissions: ['members.view'],
      },
      {
        id: 'membership-plans',
        title: 'Plans',
        url: '/membership/plans',
        icon: ClipboardList,
        group: 'membership',
        requiredPermissions: ['members.view'],
      },
      {
        id: 'membership-add',
        title: 'Add Membership',
        url: '/membership/add',
        icon: CreditCard,
        group: 'membership',
        requiredPermissions: ['members.edit'],
      }
    ]
  },
  {
    id: 'classes',
    title: 'Classes & Training',
    allowedRoles: ['super-admin', 'admin', 'team'],
    priority: 6,
    items: [
      {
        id: 'classes-list',
        title: 'Classes',
        url: '/classes',
        icon: Calendar,
        group: 'classes',
        requiredPermissions: ['classes.view'],
      },
      {
        id: 'classes-create',
        title: 'Create Class',
        url: '/classes/create',
        icon: Calendar,
        group: 'classes',
        allowedRoles: ['super-admin', 'admin', 'team'],
        teamRole: 'trainer',
        requiredPermissions: ['classes.create'],
      },
      {
        id: 'trainers',
        title: 'Trainers',
        url: '/trainers',
        icon: Dumbbell,
        group: 'classes',
        allowedRoles: ['super-admin', 'admin', 'team'],
        requiredPermissions: ['team.view'],
      },
      {
        id: 'diet-workout',
        title: 'Diet & Workout',
        url: '/diet-workout',
        icon: Dumbbell,
        group: 'classes',
      }
    ]
  },
  {
    id: 'finance',
    title: 'Finance',
    allowedRoles: ['super-admin', 'admin'],
    requiredPermissions: ['finance.view'],
    priority: 7,
    items: [
      {
        id: 'finance-dashboard',
        title: 'Finance',
        url: '/finance',
        icon: DollarSign,
        group: 'finance',
        requiredPermissions: ['finance.view'],
      },
      {
        id: 'transactions',
        title: 'Transactions',
        url: '/finance/transactions',
        icon: ClipboardList,
        group: 'finance',
        requiredPermissions: ['finance.view'],
      },
      {
        id: 'reports',
        title: 'Reports',
        url: '/finance/reports',
        icon: BarChart3,
        group: 'finance',
        requiredPermissions: ['reports.view'],
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    allowedRoles: ['super-admin', 'admin', 'team'],
    priority: 8,
    items: [
      {
        id: 'attendance',
        title: 'Attendance',
        url: '/attendance',
        icon: UserCheck,
        group: 'operations',
        requiredPermissions: ['attendance.view'],
      },
      {
        id: 'attendance-devices',
        title: 'Devices',
        url: '/attendance/devices',
        icon: Monitor,
        group: 'operations',
        allowedRoles: ['super-admin', 'admin'],
        requiredPermissions: ['devices.view'],
      },
      {
        id: 'lockers',
        title: 'Lockers',
        url: '/lockers',
        icon: Package,
        group: 'operations',
        requiredPermissions: ['lockers.view'],
      },
      {
        id: 'equipment',
        title: 'Equipment',
        url: '/equipment',
        icon: Wrench,
        group: 'operations',
        requiredPermissions: ['equipment.view'],
      }
    ]
  },
  {
    id: 'store',
    title: 'Store & POS',
    allowedRoles: ['super-admin', 'admin', 'team'],
    priority: 9,
    items: [
      {
        id: 'store',
        title: 'Store',
        url: '/store',
        icon: ShoppingBag,
        group: 'store',
        memberOnly: true,
      },
      {
        id: 'products',
        title: 'Products',
        url: '/products',
        icon: Package,
        group: 'store',
        requiredPermissions: ['products.view'],
      }
    ]
  },
  {
    id: 'feedback',
    title: 'Feedback & Support',
    priority: 10,
    items: [
      {
        id: 'feedback',
        title: 'Feedback',
        url: '/feedback',
        icon: MessageSquare,
        group: 'feedback',
        requiredPermissions: ['feedback.view'],
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    allowedRoles: ['super-admin', 'admin'],
    requiredPermissions: ['analytics.view'],
    priority: 11,
    items: [
      {
        id: 'analytics',
        title: 'Analytics',
        url: '/analytics',
        icon: BarChart3,
        group: 'analytics',
        requiredPermissions: ['analytics.view'],
      },
      {
        id: 'reports',
        title: 'Reports',
        url: '/reports',
        icon: FileText,
        group: 'analytics',
        requiredPermissions: ['reports.view'],
      }
    ]
  },
  {
    id: 'system',
    title: 'System & Settings',
    allowedRoles: ['super-admin', 'admin'],
    priority: 12,
    items: [
      {
        id: 'ai-settings',
        title: 'AI Settings',
        url: '/system/ai-settings',
        icon: BrainCircuit,
        group: 'system',
        allowedRoles: ['super-admin', 'admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'system-settings',
        title: 'System Settings',
        url: '/system/settings',
        icon: Settings,
        group: 'system',
        allowedRoles: ['super-admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'email-settings',
        title: 'Email Settings',
        url: '/system/email',
        icon: Mail,
        group: 'system',
        allowedRoles: ['super-admin', 'admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'sms-settings',
        title: 'SMS Settings',
        url: '/system/sms',
        icon: Smartphone,
        group: 'system',
        allowedRoles: ['super-admin', 'admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'system-health',
        title: 'System Health',
        url: '/system/health',
        icon: Activity,
        group: 'system',
        allowedRoles: ['super-admin'],
        requiredPermissions: ['system.view'],
      },
      {
        id: 'system-backup',
        title: 'Backup',
        url: '/system/backup',
        icon: Database,
        group: 'system',
        allowedRoles: ['super-admin'],
        requiredPermissions: ['system.backup'],
      }
    ]
  },
  // Member-specific navigation
  {
    id: 'member-fitness',
    title: 'Fitness',
    allowedRoles: ['member'],
    priority: 1,
    items: [
      {
        id: 'member-classes',
        title: 'My Classes',
        url: '/member/classes',
        icon: Calendar,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-checkins',
        title: 'Check-ins',
        url: '/member/checkins',
        icon: UserCheck,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-goals',
        title: 'My Goals',
        url: '/member/goals',
        icon: Target,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-trainer-request',
        title: 'Trainer Request',
        url: '/member/trainer-request',
        icon: Dumbbell,
        group: 'member',
        memberOnly: true,
      }
    ]
  },
  {
    id: 'member-account',
    title: 'Account',
    allowedRoles: ['member'],
    priority: 2,
    items: [
      {
        id: 'member-billing',
        title: 'Billing & Payments',
        url: '/member/billing',
        icon: CreditCard,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-feedback',
        title: 'Feedback',
        url: '/member/feedback',
        icon: MessageSquare,
        group: 'member',
        memberOnly: true,
      }
    ]
  },
  {
    id: 'member-support',
    title: 'Support',
    allowedRoles: ['member'],
    priority: 3,
    items: [
      {
        id: 'member-help',
        title: 'Help Center',
        url: '/member/help',
        icon: HelpCircle,
        group: 'member',
        memberOnly: true,
      }
    ]
  },
  // Trainer-specific navigation
  {
    id: 'trainer-dashboard',
    title: 'Trainer Dashboard',
    teamRole: 'trainer',
    priority: 1,
    items: [
      {
        id: 'trainer-schedule',
        title: 'Schedule',
        url: '/trainer/schedule',
        icon: Calendar,
        group: 'trainer',
        teamRole: 'trainer',
      },
      {
        id: 'trainer-clients',
        title: 'Clients',
        url: '/trainer/clients',
        icon: Users,
        group: 'trainer',
        teamRole: 'trainer',
      },
      {
        id: 'trainer-workouts',
        title: 'Workouts',
        url: '/trainer/workouts',
        icon: Dumbbell,
        group: 'trainer',
        teamRole: 'trainer',
      },
      {
        id: 'trainer-progress',
        title: 'Progress',
        url: '/trainer/progress',
        icon: TrendingUp,
        group: 'trainer',
        teamRole: 'trainer',
      },
      {
        id: 'trainer-earnings',
        title: 'Earnings',
        url: '/trainer/earnings',
        icon: DollarSign,
        group: 'trainer',
        teamRole: 'trainer',
      }
    ]
  },
  // Staff-specific navigation
  {
    id: 'staff-operations',
    title: 'Staff Operations',
    teamRole: 'staff',
    priority: 1,
    items: [
      {
        id: 'staff-checkin',
        title: 'Check-in',
        url: '/staff/checkin',
        icon: UserCheck,
        group: 'staff',
        teamRole: 'staff',
      },
      {
        id: 'staff-tasks',
        title: 'Tasks',
        url: '/staff/tasks',
        icon: CheckSquare,
        group: 'staff',
        teamRole: 'staff',
      },
      {
        id: 'staff-maintenance',
        title: 'Maintenance',
        url: '/staff/maintenance',
        icon: Wrench,
        group: 'staff',
        teamRole: 'staff',
      },
      {
        id: 'staff-support',
        title: 'Support',
        url: '/staff/support',
        icon: LifeBuoy,
        group: 'staff',
        teamRole: 'staff',
      }
    ]
  }
];

// Role-specific default routes
export const roleDefaultRoutes: Record<UserRole, string> = {
  'super-admin': '/dashboard',
  'admin': '/dashboard',
  'manager': '/dashboard',
  'staff': '/dashboard',
  'trainer': '/dashboard',
  'team': '/dashboard', 
  'member': '/dashboard'
};

// Helper functions for navigation filtering
export const getNavigationForUser = (
  userRole: UserRole,
  userPermissions: Permission[],
  teamRole?: string
): NavigationGroup[] => {
  return navigationConfig
    .filter(group => {
      // Check group-level access
      if (group.allowedRoles && !group.allowedRoles.includes(userRole)) {
        return false;
      }
      if (group.requiredPermissions && !group.requiredPermissions.some(p => userPermissions.includes(p))) {
        return false;
      }
      if (group.teamRole && group.teamRole !== teamRole) {
        return false;
      }
      return true;
    })
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        // Check item-level access
        if (item.allowedRoles && !item.allowedRoles.includes(userRole)) {
          return false;
        }
        if (item.requiredPermissions && !item.requiredPermissions.some(p => userPermissions.includes(p))) {
          return false;
        }
        if (item.teamRole && item.teamRole !== teamRole) {
          return false;
        }
        if (item.memberOnly && userRole !== 'member') {
          return false;
        }
        return true;
      })
    }))
    .filter(group => group.items.length > 0) // Remove empty groups
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

export const getDefaultRouteForUser = (userRole: UserRole): string => {
  return roleDefaultRoutes[userRole] || '/dashboard';
};

export const isRouteAccessible = (
  route: string,
  userRole: UserRole,
  userPermissions: Permission[],
  teamRole?: string
): boolean => {
  const allItems = navigationConfig.flatMap(group => group.items);
  const item = allItems.find(item => item.url === route || route.startsWith(item.url));
  
  if (!item) return false;
  
  if (item.allowedRoles && !item.allowedRoles.includes(userRole)) {
    return false;
  }
  if (item.requiredPermissions && !item.requiredPermissions.some(p => userPermissions.includes(p))) {
    return false;
  }
  if (item.teamRole && item.teamRole !== teamRole) {
    return false;
  }
  if (item.memberOnly && userRole !== 'member') {
    return false;
  }
  
  return true;
};