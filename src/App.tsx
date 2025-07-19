import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient as TanStackQueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { BranchProvider } from "@/hooks/useBranches";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PermissionGate } from "@/components/PermissionGate";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PublicLayout } from "@/layouts/PublicLayout";

// Auth Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Public Pages
import PublicHome from "./pages/public/PublicHome";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import TeamManagement from "./pages/TeamManagement";

// Member Pages
import { MemberListPage as MemberList } from "./pages/members/list";
import { MemberCreatePage as CreateMember } from "./pages/members/create";
import { MemberProfilePage as MemberProfile } from "./pages/members/[id]/profile";

// Trainer Pages
import { TrainerManagementPage as TrainerManagement } from "./pages/trainers/management";

// Class Pages
import { ClassListPage as ClassList } from "./pages/classes/list";

// Finance Pages
import FinanceDashboard from "./pages/finance/dashboard";
import TransactionList from "./pages/finance/transactions";

// Membership Pages
import { MemberDashboardPage as MembershipDashboard } from "./pages/membership/dashboard";
import { MembershipPlansPage as MembershipPlans } from "./pages/membership/plans";

// Lead Pages
import { LeadListPage as LeadList } from "./pages/leads/list";

// System Pages
import SystemSettings from "./pages/system/SystemSettings";
import EmailSettings from "./pages/system/EmailSettings";
import SMSSettings from "./pages/system/SMSSettings";
import WhatsAppSettings from "./pages/system/WhatsAppSettings";
import SystemBackup from "./pages/system/SystemBackup";
import SystemHealth from "./pages/system/SystemHealth";

// Store Pages
import { MemberStore } from "./pages/store/MemberStore";
import { ProductManagement } from "./pages/products/ProductManagement";

// Diet & Workout Pages
import { DietWorkoutPlannerPage as DietWorkoutPlanner } from "./pages/diet-workout/planner";

// Feedback Pages
import { FeedbackManagementPage as FeedbackManagement } from "./pages/feedback/management";

// Task Pages
import { TaskManagementPage as TaskManagement } from "./pages/tasks/management";

// Branch Pages
import BranchManagement from "./pages/branches/BranchManagement";

// Member Dashboard Pages
import { MemberClassesPage as MemberClasses } from "./pages/member/classes";
import { MemberBilling } from "./pages/member/Billing";
import MemberGoals from "./pages/member/Goals";
import MemberCheckIns from "./pages/member/CheckIns";
import { MemberFeedbackPage as MemberFeedback } from "./pages/member/feedback";
import { TrainerChangeRequest } from "./pages/member/TrainerChangeRequest";
import MemberHelp from "./pages/member/Help";
import { MemberProfileSettings } from "./pages/member/ProfileSettings";

// Trainer Dashboard Pages
import TrainerSchedule from "./pages/trainer/schedule";
import TrainerClients from "./pages/trainer/clients";
import TrainerWorkouts from "./pages/trainer/workouts";
import TrainerEarnings from "./pages/trainer/earnings";
import TrainerProgress from "./pages/trainer/progress";

// Staff Dashboard Pages
import StaffCheckin from "./pages/staff/checkin";
import StaffTasks from "./pages/staff/tasks";
import StaffMaintenance from "./pages/staff/maintenance";
import StaffSupport from "./pages/staff/support";

const queryClient = new TanStackQueryClient();

const QueryClient = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <BranchProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-background">
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/not-found" element={<NotFound />} />
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<PublicHome />} />
                  </Route>
                  
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Member Routes */}
                    <Route path="/members">
                      <Route index element={<Navigate to="list" replace />} />
                      <Route path="list" element={<MemberList />} />
                      <Route path="create" element={<CreateMember />} />
                      <Route path=":id/profile" element={<MemberProfile />} />
                    </Route>

                    {/* Trainer Routes */}
                    <Route path="/trainers">
                      <Route index element={<Navigate to="management" replace />} />
                      <Route path="management" element={<TrainerManagement />} />
                    </Route>

                    {/* Classes Routes */}
                    <Route path="/classes">
                      <Route index element={<Navigate to="list" replace />} />
                      <Route path="list" element={<ClassList />} />
                    </Route>

                    {/* Finance Routes */}
                    <Route path="/finance">
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<FinanceDashboard />} />
                      <Route path="transactions" element={<TransactionList />} />
                    </Route>

                    {/* Membership Routes */}
                    <Route path="/membership">
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<MembershipDashboard />} />
                      <Route path="plans" element={<MembershipPlans />} />
                    </Route>

                    {/* Leads Routes */}
                    <Route path="/leads">
                      <Route index element={<Navigate to="list" replace />} />
                      <Route path="list" element={<LeadList />} />
                    </Route>

                    {/* System Routes */}
                    <Route path="/system">
                      <Route path="settings" element={<SystemSettings />} />
                      <Route path="email" element={<EmailSettings />} />
                      <Route path="sms" element={<SMSSettings />} />
                      <Route path="whatsapp" element={<WhatsAppSettings />} />
                      <Route path="backup" element={<SystemBackup />} />
                      <Route path="health" element={<SystemHealth />} />
                    </Route>

                    {/* Store Routes */}
                    <Route path="/store">
                      <Route index element={<Navigate to="member" replace />} />
                      <Route path="member" element={<MemberStore />} />
                      <Route path="products" element={<ProductManagement />} />
                    </Route>

                    {/* Diet & Workout Routes */}
                    <Route path="/diet-workout">
                      <Route index element={<Navigate to="planner" replace />} />
                      <Route path="planner" element={<DietWorkoutPlanner />} />
                    </Route>

                    {/* Feedback Routes */}
                    <Route path="/feedback">
                      <Route index element={<Navigate to="management" replace />} />
                      <Route path="management" element={<FeedbackManagement />} />
                    </Route>

                    {/* Task Routes */}
                    <Route path="/tasks">
                      <Route index element={<Navigate to="management" replace />} />
                      <Route path="management" element={<TaskManagement />} />
                    </Route>

                    {/* Branch Routes */}
                    <Route path="/branches">
                      <Route index element={<Navigate to="management" replace />} />
                      <Route path="management" element={<BranchManagement />} />
                    </Route>

                    {/* User Management Routes */}
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/roles" element={<RoleManagement />} />
                    <Route path="/team" element={<TeamManagement />} />
                    <Route path="/profile" element={<ProfileSettings />} />

                    {/* Member Dashboard Routes */}
                    <Route path="/member">
                      <Route path="classes" element={<MemberClasses />} />
                      <Route path="billing" element={<MemberBilling />} />
                      <Route path="goals" element={<MemberGoals />} />
                      <Route path="checkins" element={<MemberCheckIns />} />
                      <Route path="feedback" element={<MemberFeedback />} />
                      <Route path="trainer-change" element={<TrainerChangeRequest />} />
                      <Route path="help" element={<MemberHelp />} />
                      <Route path="profile" element={<MemberProfileSettings />} />
                    </Route>

                    {/* Trainer Dashboard Routes */}
                    <Route path="/trainer">
                      <Route path="schedule" element={<TrainerSchedule />} />
                      <Route path="clients" element={<TrainerClients />} />
                      <Route path="workouts" element={<TrainerWorkouts />} />
                      <Route path="earnings" element={<TrainerEarnings />} />
                      <Route path="progress" element={<TrainerProgress />} />
                    </Route>

                    {/* Staff Dashboard Routes */}
                    <Route path="/staff">
                      <Route path="checkin" element={<StaffCheckin />} />
                      <Route path="tasks" element={<StaffTasks />} />
                      <Route path="maintenance" element={<StaffMaintenance />} />
                      <Route path="support" element={<StaffSupport />} />
                    </Route>
                    </Route>
                  </Route>

                  <Route path="*" element={<Navigate to="/not-found" replace />} />
                </Routes>
              </BrowserRouter>
            </div>
          </ThemeProvider>
        </BranchProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
