import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
              {/* Placeholder routes for navigation items */}
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
                      <div className="text-center py-20">
                        <h1 className="text-2xl font-bold">Members Page</h1>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
