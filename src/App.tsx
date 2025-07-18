import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RBACProvider } from "@/hooks/useRBAC";
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
import { MemberListPage } from "./pages/members/list";
import { MemberCreatePage } from "./pages/members/create";
import { MemberProfilePage } from "./pages/members/[id]/profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <RBACProvider>
          <BranchProvider>
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
                    path="/analytics" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <DashboardLayout>
                          <div className="text-center py-20">
                            <h1 className="text-2xl font-bold">Analytics Page</h1>
                            <p className="text-muted-foreground mt-2">Coming soon...</p>
                          </div>
                        </DashboardLayout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/members" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'team']}>
                        <DashboardLayout>
                          <MemberListPage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/members/create" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'team']}>
                        <DashboardLayout>
                          <MemberCreatePage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/members/:id/profile" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'team']}>
                        <DashboardLayout>
                          <MemberProfilePage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/classes" 
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <div className="text-center py-20">
                            <h1 className="text-2xl font-bold">Classes Page</h1>
                            <p className="text-muted-foreground mt-2">Coming soon...</p>
                          </div>
                        </DashboardLayout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </BranchProvider>
        </RBACProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
