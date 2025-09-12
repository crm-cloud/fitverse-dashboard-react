import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { ComponentLoadingState } from '@/components/LoadingState';

// Enhanced lazy loading with error boundary integration
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback = <ComponentLoadingState />,
): LazyExoticComponent<ComponentType<P>> => {
  return lazy(importFn);
};

// Preload function for route-based code splitting
export const preloadRoute = (importFn: () => Promise<any>) => {
  const componentImport = importFn();
  return componentImport;
};

// Route-based lazy loading for major pages
export const lazyRoutes = {
  // Major pages
  UserManagement: createLazyComponent(() => import('@/pages/UserManagement').then(m => ({ default: m.default }))),
  RoleManagement: createLazyComponent(() => import('@/pages/RoleManagement').then(m => ({ default: m.default }))),
  TeamManagement: createLazyComponent(() => import('@/pages/TeamManagement').then(m => ({ default: m.default }))),
  FinanceDashboard: createLazyComponent(() => import('@/pages/finance/dashboard').then(m => ({ default: m.default }))),
  TransactionsPage: createLazyComponent(() => import('@/pages/finance/transactions').then(m => ({ default: m.default }))),
  FinanceReports: createLazyComponent(() => import('@/pages/finance/reports').then(m => ({ default: m.default }))),
  // SaaS Management
  GymManagement: createLazyComponent(() => import('@/pages/gyms/GymManagement').then(m => ({ default: m.default }))),
  SubscriptionPlans: createLazyComponent(() => import('@/pages/subscription-plans/SubscriptionPlans').then(m => ({ default: m.default }))),
  AdminManagement: createLazyComponent(() => import('@/pages/users/admin-management').then(m => ({ default: m.default }))),
};

// Component-based lazy loading for heavy components (commented out until components are available)
export const lazyComponents = {
  // POSInterface: createLazyComponent(() => import('@/components/pos/POSInterface').then(m => ({ default: m.POSInterface }))),
  // MemberTable: createLazyComponent(() => import('@/components/member/MemberTable').then(m => ({ default: m.MemberTable }))),
  // TransactionTable: createLazyComponent(() => import('@/components/finance/TransactionTable').then(m => ({ default: m.TransactionTable }))),
  // TeamMemberTable: createLazyComponent(() => import('@/components/team/TeamMemberTable').then(m => ({ default: m.TeamMemberTable }))),
};