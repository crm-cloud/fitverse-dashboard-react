import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RBACProvider } from "@/hooks/useRBAC";
import { BranchContextProvider } from "@/hooks/useBranchContext";
import { CartProvider } from "@/hooks/useCart";
import { ThemeProvider } from "@/hooks/useTheme";
import { BranchProvider } from "@/hooks/useBranches";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import PublicHome from "./pages/public/PublicHome";
import ProfileSettings from "./pages/ProfileSettings";
import { MemberListPage } from "./pages/members/list";
import { MemberCreatePage } from "./pages/members/create";
import { MemberProfilePage } from "./pages/members/[id]/profile";
import { MembershipPlansPage } from "./pages/membership/plans";
import { MemberDashboardPage } from "./pages/membership/dashboard";
import { ClassListPage } from "./pages/classes/list";
import { MemberClassesPage } from "./pages/member/classes";
import TeamManagement from "./pages/TeamManagement";
import { MemberStore } from "./pages/store/MemberStore";
import { POSInterface } from "./components/pos/POSInterface";
import { ProductManagement } from "./pages/products/ProductManagement";
import { LeadListPage } from "./pages/leads/list";
import { DietWorkoutPlannerPage } from "./pages/diet-workout/planner";
import FinanceDashboard from "./pages/finance/dashboard";
import { FeedbackManagementPage } from "./pages/feedback/management";
import { TaskManagementPage } from "./pages/tasks/management";
import { MemberFeedbackPage } from "./pages/member/feedback";
import { TrainerManagementPage } from "./pages/trainers/management";
// New system pages
import SystemHealth from "./pages/system/SystemHealth";
import SystemSettings from "./pages/system/SystemSettings";
import EmailSettings from "./pages/system/EmailSettings";
import SMSSettings from "./pages/system/SMSSettings";
import SystemBackup from "./pages/system/SystemBackup";
import BranchManagement from "./pages/branches/BranchManagement";
// New member pages
import Goals from "./pages/member/Goals";
import Help from "./pages/member/Help";
import CheckIns from "./pages/member/CheckIns";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <RBACProvider>
          <BranchContextProvider>
            <BranchProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<PublicHome />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
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
                      
                      {/* System Management Routes - Super Admin only */}
                      <Route 
                        path="/system-health" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin']}>
                            <DashboardLayout>
                              <SystemHealth />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/system-settings" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin']}>
                            <DashboardLayout>
                              <SystemSettings />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/email-settings" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin']}>
                            <DashboardLayout>
                              <EmailSettings />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/sms-settings" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin']}>
                            <DashboardLayout>
                              <SMSSettings />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/backup" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin']}>
                            <DashboardLayout>
                              <SystemBackup />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* User & Role Management Routes - Super Admin & Admin */}
                      <Route 
                        path="/users" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
                            <DashboardLayout>
                              <UserManagement />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/roles" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
                            <DashboardLayout>
                              <RoleManagement />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Business Operations Routes - Super Admin, Admin, Team */}
                      <Route 
                        path="/finance" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <FinanceDashboard />
                            </DashboardLayout>
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
                              <MemberDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/referrals" 
                        element={
                          <ProtectedRoute>
                            <DashboardLayout>
                              <MemberDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/analytics" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin']}>
                            <DashboardLayout>
                              <Dashboard />
                            </DashboardLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/reports" 
                        element={
                          <ProtectedRoute allowedRoles={['super-admin', 'admin', 'team']}>
                            <DashboardLayout>
                              <Dashboard />
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
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </BranchProvider>
          </BranchContextProvider>
        </RBACProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
