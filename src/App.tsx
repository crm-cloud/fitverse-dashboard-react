import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { RBACProvider } from "@/hooks/useRBAC";
import { BranchContextProvider } from "@/hooks/useBranchContext";
import { CartProvider } from "@/hooks/useCart";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PermissionGate } from "@/components/PermissionGate";
import { EnhancedRouteGuard } from "@/components/EnhancedRouteGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoadingState } from "@/components/LoadingState";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { lazyRoutes } from "@/utils/lazyLoad";
import withPagePreservation from "@/hocs/withPagePreservation";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import PublicHome from "./pages/public/PublicHome";
import ProfileSettings from "./pages/ProfileSettings";
import { MemberListPage } from "./pages/members/list";
import { MemberCreatePage } from "./pages/members/create";
import { MemberProfilePage } from "./pages/members/[id]/profile";
import { MembershipPlansPage } from "./pages/membership/plans";
import { MemberDashboardPage } from "./pages/membership/dashboard";
import { AddMembershipWorkflowPage } from "./pages/membership/add-membership";
import { MembershipPlanCreatePage } from "./pages/membership/plans/create";
import { ClassListPage } from "./pages/classes/list";
import { ClassCreatePage } from "./pages/classes/create";
import { MemberClassesPage } from "./pages/member/classes";
import TeamManagement from "./pages/TeamManagement";
import { MemberStore } from "./pages/store/MemberStore";
import { POSInterface } from "./components/pos/POSInterface";
import { ProductManagement } from "./pages/products/ProductManagement";
import { LeadListPage } from "./pages/leads/list";
import { DietWorkoutPlannerPage } from "./pages/diet-workout/planner";
import { FeedbackManagementPage } from "./pages/feedback/management";
import { TaskManagementPage } from "./pages/tasks/management";
import { MemberFeedbackPage } from "./pages/member/feedback";
import { TrainerManagementPage } from "./pages/trainers/management";
import { MemberProfileSettings } from "./pages/member/ProfileSettings";
import { TrainerChangeRequest } from "./pages/member/TrainerChangeRequest";
import { MemberDietWorkoutPage } from "./pages/member/diet-workout";
import LockerManagement from "./pages/lockers/management";
// New system pages
import SystemHealth from "./pages/system/SystemHealth";
import SystemSettings from "./pages/system/SystemSettings";
// Communication & Marketing pages
import AnnouncementManagement from "./pages/announcements/AnnouncementManagement";
import ReferralManagement from "./pages/referrals/ReferralManagement";
import MemberReferralsPage from "./pages/member/referrals";
import EmailSettings from "./pages/system/EmailSettings";
import SMSSettings from "./pages/system/SMSSettings";
import WhatsAppSettings from "./pages/system/WhatsAppSettings";
import SystemBackup from "./pages/system/SystemBackup";
import AISettings from "./pages/system/AISettings";
import BranchManagement from "./pages/branches/BranchManagement";
// New member pages
import Goals from "./pages/member/Goals";
import Help from "./pages/member/Help";
import CheckIns from "./pages/member/CheckIns";
import { MemberBilling } from "./pages/member/Billing";
import { MemberProgress } from "./pages/member/Progress";
import { MemberAnnouncements } from "./pages/member/Announcements";
// New trainer pages
import TrainerSchedulePage from "./pages/trainer/schedule";
import TrainerClientsPage from "./pages/trainer/clients";
import TrainerWorkoutsPage from "./pages/trainer/workouts";
import TrainerProgressPage from "./pages/trainer/progress";
import TrainerEarningsPage from "./pages/trainer/earnings";
import TrainerAttendancePage from "./pages/trainer/attendance";
import PaymentGatewaySettings from './pages/system/PaymentGatewaySettings';
// New staff pages
import StaffCheckinPage from "./pages/staff/checkin";
import StaffSupportPage from "./pages/staff/support";
import StaffTasksPage from "./pages/staff/tasks";
import StaffMaintenancePage from "./pages/staff/maintenance";
// New missing pages
import EquipmentListPage from "./pages/equipment/list";
import AnalyticsPage from "./pages/analytics/index";
import ReportsPage from "./pages/reports/index";
// New create pages
import { BranchCreatePage } from "./pages/branches/create";
import { UserCreatePage } from "./pages/users/create";
import { RoleCreatePage } from "./pages/roles/create";
import AttendanceDashboard from "./pages/attendance/dashboard";
import AttendanceDevicesPage from "./pages/attendance/devices";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404 || error?.response?.status === 401) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (increased from 10)
      keepPreviousData: true,
      retryOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Add this to prevent React from recreating the query client on re-renders
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return new QueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = queryClient;
  }
  return browserQueryClient;
}

// Create preserved versions of page components
const PreservedDashboard = withPagePreservation(Dashboard);
const PreservedProfileSettings = withPagePreservation(ProfileSettings);
const PreservedUnauthorized = withPagePreservation(Unauthorized);
const PreservedLogin = withPagePreservation(Login);
const PreservedForgotPassword = withPagePreservation(ForgotPassword);
const PreservedResetPassword = withPagePreservation(ResetPassword);
const PreservedPublicHome = withPagePreservation(PublicHome);
const PreservedMemberListPage = withPagePreservation(MemberListPage);
const PreservedMemberCreatePage = withPagePreservation(MemberCreatePage);
const PreservedMemberProfilePage = withPagePreservation(MemberProfilePage);
const PreservedMembershipPlansPage = withPagePreservation(MembershipPlansPage);
const PreservedMemberDashboardPage = withPagePreservation(MemberDashboardPage);
const PreservedAddMembershipWorkflowPage = withPagePreservation(AddMembershipWorkflowPage);
const PreservedMembershipPlanCreatePage = withPagePreservation(MembershipPlanCreatePage);
const PreservedClassListPage = withPagePreservation(ClassListPage);
const PreservedClassCreatePage = withPagePreservation(ClassCreatePage);
const PreservedMemberClassesPage = withPagePreservation(MemberClassesPage);
const PreservedTeamManagement = withPagePreservation(TeamManagement);
const PreservedMemberStore = withPagePreservation(MemberStore);
const PreservedPOSInterface = withPagePreservation(POSInterface);
const PreservedProductManagement = withPagePreservation(ProductManagement);
const PreservedLeadListPage = withPagePreservation(LeadListPage);
const PreservedDietWorkoutPlannerPage = withPagePreservation(DietWorkoutPlannerPage);
const PreservedFeedbackManagementPage = withPagePreservation(FeedbackManagementPage);
const PreservedTaskManagementPage = withPagePreservation(TaskManagementPage);
const PreservedMemberFeedbackPage = withPagePreservation(MemberFeedbackPage);
const PreservedTrainerManagementPage = withPagePreservation(TrainerManagementPage);
const PreservedMemberProfileSettings = withPagePreservation(MemberProfileSettings);
const PreservedTrainerChangeRequest = withPagePreservation(TrainerChangeRequest);
const PreservedMemberDietWorkoutPage = withPagePreservation(MemberDietWorkoutPage);
const PreservedLockerManagement = withPagePreservation(LockerManagement);
const PreservedSystemHealth = withPagePreservation(SystemHealth);
const PreservedSystemSettings = withPagePreservation(SystemSettings);
const PreservedAnnouncementManagement = withPagePreservation(AnnouncementManagement);
const PreservedReferralManagement = withPagePreservation(ReferralManagement);
const PreservedMemberReferralsPage = withPagePreservation(MemberReferralsPage);
const PreservedEmailSettings = withPagePreservation(EmailSettings);
const PreservedSMSSettings = withPagePreservation(SMSSettings);
const PreservedWhatsAppSettings = withPagePreservation(WhatsAppSettings);
const PreservedSystemBackup = withPagePreservation(SystemBackup);
const PreservedAISettings = withPagePreservation(AISettings);
const PreservedBranchManagement = withPagePreservation(BranchManagement);
const PreservedGoals = withPagePreservation(Goals);
const PreservedHelp = withPagePreservation(Help);
const PreservedCheckIns = withPagePreservation(CheckIns);
const PreservedMemberBilling = withPagePreservation(MemberBilling);
const PreservedMemberProgress = withPagePreservation(MemberProgress);
const PreservedMemberAnnouncements = withPagePreservation(MemberAnnouncements);
const PreservedTrainerSchedulePage = withPagePreservation(TrainerSchedulePage);
const PreservedTrainerClientsPage = withPagePreservation(TrainerClientsPage);
const PreservedTrainerWorkoutsPage = withPagePreservation(TrainerWorkoutsPage);
const PreservedTrainerProgressPage = withPagePreservation(TrainerProgressPage);
const PreservedTrainerEarningsPage = withPagePreservation(TrainerEarningsPage);
const PreservedTrainerAttendancePage = withPagePreservation(TrainerAttendancePage);
const PreservedPaymentGatewaySettings = withPagePreservation(PaymentGatewaySettings);
const PreservedStaffCheckinPage = withPagePreservation(StaffCheckinPage);
const PreservedStaffSupportPage = withPagePreservation(StaffSupportPage);
const PreservedStaffTasksPage = withPagePreservation(StaffTasksPage);
const PreservedStaffMaintenancePage = withPagePreservation(StaffMaintenancePage);
const PreservedEquipmentListPage = withPagePreservation(EquipmentListPage);
const PreservedAnalyticsPage = withPagePreservation(AnalyticsPage);
const PreservedReportsPage = withPagePreservation(ReportsPage);
const PreservedBranchCreatePage = withPagePreservation(BranchCreatePage);
const PreservedUserCreatePage = withPagePreservation(UserCreatePage);
const PreservedRoleCreatePage = withPagePreservation(RoleCreatePage);
const PreservedAttendanceDashboard = withPagePreservation(AttendanceDashboard);
const PreservedAttendanceDevicesPage = withPagePreservation(AttendanceDevicesPage);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={getQueryClient()}>
      <ThemeProvider>
        <AuthProvider>
          <RBACProvider>
            <BranchContextProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner position="top-right" />
                  <BrowserRouter>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<PreservedPublicHome />} />
                      <Route path="/login" element={<PreservedLogin />} />
                      <Route path="/forgot-password" element={<PreservedForgotPassword />} />
                      <Route path="/reset-password" element={<PreservedResetPassword />} />
                      <Route path="/unauthorized" element={<PreservedUnauthorized />} />

                      {/* Protected Routes */}
                      <Route element={
                        <EnhancedRouteGuard>
                          <DashboardLayout />
                        </EnhancedRouteGuard>
                      }>
                        <Route path="/dashboard" element={<PreservedDashboard />} />
                        <Route path="/profile" element={<PreservedProfileSettings />} />
                        <Route path="/members" element={<PreservedMemberListPage />} />
                        <Route path="/members/create" element={<PreservedMemberCreatePage />} />
                        <Route path="/members/:id/profile" element={<PreservedMemberProfilePage />} />
                        <Route path="/membership/plans" element={<PreservedMembershipPlansPage />} />
                        <Route path="/membership/dashboard" element={<PreservedMemberDashboardPage />} />
                        <Route path="/membership/add-membership" element={<PreservedAddMembershipWorkflowPage />} />
                        <Route path="/membership/plans/create" element={<PreservedMembershipPlanCreatePage />} />
                        <Route path="/classes" element={<PreservedClassListPage />} />
                        <Route path="/classes/create" element={<PreservedClassCreatePage />} />
                        <Route path="/member/classes" element={<PreservedMemberClassesPage />} />
                        <Route path="/team-management" element={<PreservedTeamManagement />} />
                        <Route path="/store/member-store" element={<PreservedMemberStore />} />
                        <Route path="/pos/interface" element={<PreservedPOSInterface />} />
                        <Route path="/products/product-management" element={<PreservedProductManagement />} />
                        <Route path="/leads/list" element={<PreservedLeadListPage />} />
                        <Route path="/diet-workout/planner" element={<PreservedDietWorkoutPlannerPage />} />
                        <Route path="/feedback/management" element={<PreservedFeedbackManagementPage />} />
                        <Route path="/tasks/management" element={<PreservedTaskManagementPage />} />
                        <Route path="/member/feedback" element={<PreservedMemberFeedbackPage />} />
                        <Route path="/trainers/management" element={<PreservedTrainerManagementPage />} />
                        <Route path="/member/profile-settings" element={<PreservedMemberProfileSettings />} />
                        <Route path="/member/trainer-change-request" element={<PreservedTrainerChangeRequest />} />
                        <Route path="/member/diet-workout" element={<PreservedMemberDietWorkoutPage />} />
                        <Route path="/lockers/management" element={<PreservedLockerManagement />} />
                        <Route path="/system/health" element={<PreservedSystemHealth />} />
                        <Route path="/system/settings" element={<PreservedSystemSettings />} />
                        <Route path="/announcements/announcement-management" element={<PreservedAnnouncementManagement />} />
                        <Route path="/referrals/referral-management" element={<PreservedReferralManagement />} />
                        <Route path="/member/referrals" element={<PreservedMemberReferralsPage />} />
                        <Route path="/system/email" element={<PreservedEmailSettings />} />
                        <Route path="/system/sms" element={<PreservedSMSSettings />} />
                        <Route path="/system/whatsapp" element={<PreservedWhatsAppSettings />} />
                        <Route path="/system/backup" element={<PreservedSystemBackup />} />
                        <Route path="/system/ai-settings" element={<PreservedAISettings />} />
                        <Route path="/branches/management" element={<PreservedBranchManagement />} />
                        <Route path="/member/goals" element={<PreservedGoals />} />
                        <Route path="/member/help" element={<PreservedHelp />} />
                        <Route path="/member/check-ins" element={<PreservedCheckIns />} />
                        <Route path="/member/billing" element={<PreservedMemberBilling />} />
                        <Route path="/member/progress" element={<PreservedMemberProgress />} />
                        <Route path="/member/announcements" element={<PreservedMemberAnnouncements />} />
                        <Route path="/trainer/schedule" element={<PreservedTrainerSchedulePage />} />
                        <Route path="/trainer/clients" element={<PreservedTrainerClientsPage />} />
                        <Route path="/trainer/workouts" element={<PreservedTrainerWorkoutsPage />} />
                        <Route path="/trainer/progress" element={<PreservedTrainerProgressPage />} />
                        <Route path="/trainer/earnings" element={<PreservedTrainerEarningsPage />} />
                        <Route path="/trainer/attendance" element={<PreservedTrainerAttendancePage />} />
                        <Route path="/system/payment-gateway" element={<PreservedPaymentGatewaySettings />} />
                        <Route path="/staff/checkin" element={<PreservedStaffCheckinPage />} />
                        <Route path="/staff/support" element={<PreservedStaffSupportPage />} />
                        <Route path="/staff/tasks" element={<PreservedStaffTasksPage />} />
                        <Route path="/staff/maintenance" element={<PreservedStaffMaintenancePage />} />
                        <Route path="/equipment/list" element={<PreservedEquipmentListPage />} />
                        <Route path="/analytics/index" element={<PreservedAnalyticsPage />} />
                        <Route path="/reports/index" element={<PreservedReportsPage />} />
                        <Route path="/branches/create" element={<PreservedBranchCreatePage />} />
                        <Route path="/users/create" element={<PreservedUserCreatePage />} />
                        <Route path="/roles/create" element={<PreservedRoleCreatePage />} />
                        <Route path="/attendance/dashboard" element={<PreservedAttendanceDashboard />} />
                        <Route path="/attendance/devices" element={<PreservedAttendanceDevicesPage />} />
                      </Route>
                      <Route
                        path="/system/settings"
                        element={
                          <EnhancedRouteGuard allowedRoles={['super-admin']}>
                            <DashboardLayout>
                              <SystemSettings />
                            </DashboardLayout>
                          </EnhancedRouteGuard>
                        }
                      />
                        <Route 
                          path="/system/email" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin', 'admin']}>
                              <DashboardLayout>
                                <EmailSettings />
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />
                        <Route 
                          path="/system/sms" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin', 'admin']}>
                              <DashboardLayout>
                                <SMSSettings />
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />
          <Route 
            path="/system/whatsapp" 
            element={
              <EnhancedRouteGuard allowedRoles={['super-admin', 'admin']}>
                <DashboardLayout>
                  <WhatsAppSettings />
                </DashboardLayout>
              </EnhancedRouteGuard>
            } 
          />
          <Route 
            path="/system/payment-gateway" 
            element={
              <EnhancedRouteGuard allowedRoles={['super-admin', 'admin']}>
                <DashboardLayout>
                  <PaymentGatewaySettings />
                </DashboardLayout>
              </EnhancedRouteGuard>
            } 
          />
                        <Route 
                          path="/system/ai-settings" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin', 'admin']}>
                              <DashboardLayout>
                                <AISettings />
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />
                        <Route 
                          path="/system/backup" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin']}>
                              <DashboardLayout>
                                <SystemBackup />
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />
                        
                         {/* SaaS Management Routes - Super Admin only */}
                       <Route 
                         path="/gyms" 
                         element={
                           <EnhancedRouteGuard allowedRoles={['super-admin']}>
                            <DashboardLayout>
                              <Suspense fallback={<PageLoadingState />}>
                                <lazyRoutes.GymManagement />
                              </Suspense>
                            </DashboardLayout>
                          </EnhancedRouteGuard>
                         } 
                       />
                        <Route 
                          path="/subscription-plans" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin']}>
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.SubscriptionPlans />
                                </Suspense>
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />
                        <Route 
                          path="/platform-analytics" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin']}>
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.PlatformAnalytics />
                                </Suspense>
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />
                        <Route 
                          path="/platform-reports" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin']}>
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.PlatformReports />
                                </Suspense>
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />
                        <Route 
                          path="/gym-dashboard" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['admin']}>
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.AdminGymDashboard />
                                </Suspense>
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />

                         {/* Branch Management Routes - Gym Admins */}
                       <Route 
                         path="/branches" 
                         element={
                           <ProtectedRoute allowedRoles={['admin', 'manager']}>
                             <DashboardLayout>
                               <BranchManagement />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                       
                        {/* User & Role Management Routes - Super Admin & Admin */}
                       <Route 
                         path="/users" 
                         element={
                           <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
                             <Navigate to="/users/user-management" replace />
                           </ProtectedRoute>
                         }
                       />
                        <Route 
                          path="/users/user-management" 
                          element={
                            <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.UserManagement />
                                </Suspense>
                              </DashboardLayout>
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/users/user-management/:userId" 
                          element={
                            <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.UserManagement />
                                </Suspense>
                              </DashboardLayout>
                            </ProtectedRoute>
                          } 
                        />
                         <Route 
                           path="/branches/create" 
                           element={
                             <ProtectedRoute allowedRoles={['admin', 'manager']}>
                               <DashboardLayout>
                                 <BranchCreatePage />
                               </DashboardLayout>
                             </ProtectedRoute>
                           } 
                         />
                          <Route 
                            path="/users/create" 
                            element={
                              <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
                                <DashboardLayout>
                                  <UserCreatePage />
                                </DashboardLayout>
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/users/edit/:userId" 
                            element={
                              <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
                                <DashboardLayout>
                                  <Suspense fallback={<PageLoadingState />}>
                                    <lazyRoutes.UserEdit />
                                  </Suspense>
                                </DashboardLayout>
                              </ProtectedRoute>
                            } 
                          />
                         <Route 
                           path="/users/admin-management" 
                           element={
                             <EnhancedRouteGuard allowedRoles={['super-admin']}>
                               <DashboardLayout>
                                 <Suspense fallback={<PageLoadingState />}>
                                   <lazyRoutes.AdminManagement />
                                 </Suspense>
                               </DashboardLayout>
                             </EnhancedRouteGuard>
                           } 
                         />
                        <Route 
                          path="/roles" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin', 'admin']}>
                              <Suspense fallback={<PageLoadingState />}>
                                <lazyRoutes.RoleManagement />
                              </Suspense>
                            </EnhancedRouteGuard>
                          } 
                        />
                        <Route 
                          path="/permissions" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin', 'admin']}>
                              <Suspense fallback={<PageLoadingState />}>
                                <lazyRoutes.RoleManagement />
                              </Suspense>
                            </EnhancedRouteGuard>
                          } 
                        />
                        <Route 
                          path="/membership/plans/create" 
                          element={
                            <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                              <DashboardLayout>
                                <MembershipPlanCreatePage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          } 
                        />
                       
                       {/* Business Operations Routes - Super Admin, Admin, Team */}
                      <Route 
                        path="/finance" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <PermissionGate permission="finance.view">
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.FinanceDashboard />
                                </Suspense>
                              </DashboardLayout>
                            </PermissionGate>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/finance/reports" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <PermissionGate permission="finance.view">
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.FinanceReports />
                                </Suspense>
                              </DashboardLayout>
                            </PermissionGate>
                          </ProtectedRoute>
                        } 
                      />
                       <Route 
                         path="/finance/transactions" 
                         element={
                           <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                             <PermissionGate permission="finance.view">
                               <DashboardLayout>
                                 <Suspense fallback={<PageLoadingState />}>
                                   <lazyRoutes.TransactionsPage />
                                 </Suspense>
                               </DashboardLayout>
                             </PermissionGate>
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/finance/invoices" 
                         element={
                           <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                             <PermissionGate permission="finance.view">
                               <DashboardLayout>
                                 <Suspense fallback={<PageLoadingState />}>
                                   <lazyRoutes.InvoicesPage />
                                 </Suspense>
                               </DashboardLayout>
                             </PermissionGate>
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/feedback"
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <FeedbackManagementPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/tasks" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <TaskManagementPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/leads" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <LeadListPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/members" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <MemberListPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/members/create" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <MemberCreatePage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/members/:id/profile" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <MemberProfilePage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/classes" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <ClassListPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/classes/create" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <ClassCreatePage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/team" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <TeamManagement />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                       <Route 
                         path="/trainers" 
                         element={
                           <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                             <DashboardLayout>
                               <TrainerManagementPage />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/attendance" 
                         element={
                           <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                             <DashboardLayout>
                               <AttendanceDashboard />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/attendance/devices" 
                         element={
                           <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                             <DashboardLayout>
                               <AttendanceDevicesPage />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                      <Route 
                        path="/pos" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <POSInterface />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/products" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <ProductManagement />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                       <Route 
                         path="/equipment" 
                         element={
                           <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                             <DashboardLayout>
                               <EquipmentListPage />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/lockers" 
                         element={
                           <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                             <DashboardLayout>
                               <LockerManagement />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                      
                      {/* Trainer-specific Routes */}
                      <Route 
                        path="/trainer/schedule" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <TrainerSchedulePage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/trainer/clients" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <TrainerClientsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/trainer/workouts" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <TrainerWorkoutsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/trainer/progress" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <TrainerProgressPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/trainer/earnings" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <TrainerEarningsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/trainer/attendance" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <TrainerAttendancePage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Staff-specific Routes */}
                      <Route 
                        path="/staff/checkin" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <StaffCheckinPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/support" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <StaffSupportPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/tasks" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <StaffTasksPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/maintenance" 
                        element={
                          <ProtectedRoute allowedRoles={['team']}>
                            <DashboardLayout>
                              <StaffMaintenancePage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Membership Management Routes */}
                      <Route 
                        path="/membership/plans" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <MembershipPlansPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/membership/add" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <AddMembershipWorkflowPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/membership/dashboard" 
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <MemberDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Fitness & Services Routes - All roles */}
                      <Route 
                        path="/diet-workout" 
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <DietWorkoutPlannerPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Member-specific Routes */}
                      <Route 
                        path="/member/classes" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <MemberClassesPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/feedback" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <MemberFeedbackPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/referrals" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <MemberReferralsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/trainer-request" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <TrainerChangeRequest />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/help" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <Help />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/billing" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <MemberBilling />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/progress" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <MemberProgress />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/announcements" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <MemberAnnouncements />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/diet-workout" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <MemberDietWorkoutPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/checkins"
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <CheckIns />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/member/goals" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <Goals />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/store" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <MemberStore />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/goals" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <Goals />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/help" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <Help />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/checkins" 
                        element={
                          <ProtectedRoute allowedRoles={['team', 'member']}>
                            <DashboardLayout>
                              <CheckIns />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/workouts" 
                        element={
                          <ProtectedRoute allowedRoles={['member']}>
                            <DashboardLayout>
                              <DietWorkoutPlannerPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                       <Route 
                         path="/billing" 
                         element={
                           <ProtectedRoute allowedRoles={['member']}>
                             <DashboardLayout>
                               <MemberBilling />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/trainer-change-request" 
                         element={
                           <ProtectedRoute allowedRoles={['member']}>
                             <DashboardLayout>
                               <TrainerChangeRequest />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/referrals" 
                         element={
                           <ProtectedRoute allowedRoles={['admin', 'team']}>
                             <DashboardLayout>
                               <ReferralManagement />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/announcements" 
                         element={
                           <ProtectedRoute allowedRoles={['admin', 'team']}>
                             <DashboardLayout>
                               <AnnouncementManagement />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                        <Route 
                          path="/platform-analytics" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin']}>
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.PlatformAnalytics />
                                </Suspense>
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />
                        <Route 
                          path="/platform-reports" 
                          element={
                            <EnhancedRouteGuard allowedRoles={['super-admin']}>
                              <DashboardLayout>
                                <Suspense fallback={<PageLoadingState />}>
                                  <lazyRoutes.PlatformReports />
                                </Suspense>
                              </DashboardLayout>
                            </EnhancedRouteGuard>
                          } 
                        />
                        <Route 
                          path="/analytics" 
                          element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <DashboardLayout>
                                <AnalyticsPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          } 
                        />
                      <Route 
                        path="/reports" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <ReportsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
                            <DashboardLayout>
                              <ProfileSettings />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/equipment" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <Dashboard />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      
                      <Route 
                         path="/profile" 
                         element={
                           <ProtectedRoute>
                             <DashboardLayout>
                               <ProfileSettings />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/member/profile-settings" 
                         element={
                           <ProtectedRoute allowedRoles={['member']}>
                             <DashboardLayout>
                               <MemberProfileSettings />
                             </DashboardLayout>
                           </ProtectedRoute>
                         } 
                       />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </BranchContextProvider>
          </RBACProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
