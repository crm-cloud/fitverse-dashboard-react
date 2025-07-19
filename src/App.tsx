import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RBACProvider } from "@/hooks/useRBAC";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <RBACProvider>
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
                    <Route 
                      path="/users" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <DashboardLayout>
                            <UserManagement />
                          </DashboardLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/roles" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <DashboardLayout>
                            <RoleManagement />
                          </DashboardLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/leads" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'staff', 'trainer']}>
                          <DashboardLayout>
                            <LeadListPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/members" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
                          <DashboardLayout>
                            <MemberListPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/members/create" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
                          <DashboardLayout>
                            <MemberCreatePage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/membership/plans" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
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
                    <Route 
                      path="/members/:id/profile" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
                          <DashboardLayout>
                            <MemberProfilePage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/classes" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
                          <DashboardLayout>
                            <ClassListPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      } 
                    />
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
                      path="/team" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <DashboardLayout>
                            <TeamManagement />
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
                      path="/pos" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
                          <DashboardLayout>
                            <POSInterface />
                          </DashboardLayout>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/products" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <DashboardLayout>
                            <ProductManagement />
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
        </RBACProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
