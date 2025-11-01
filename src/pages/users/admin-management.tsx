import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, Mail, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AdminAccountWizard } from '@/components/users/AdminAccountWizard';
import { SuperAdminAdvancedAnalytics } from '@/components/dashboards/SuperAdminAdvancedAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminProfile {
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  organization_id?: string;
  is_active: boolean;
  created_at: string;
  organizations?: {
    name: string;
    subscription_plan_id: string;
  };
  subscription_plans?: {
    name: string;
  };
}

export default function AdminManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: adminProfiles = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      // Query user_roles table for admins
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (rolesError) throw rolesError;
      if (!adminRoles || adminRoles.length === 0) return [];
      
      const adminUserIds = adminRoles.map(r => r.user_id);
      
      // Get profiles for these admins
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', adminUserIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!profiles) return [];
      
      // Fetch gym data
      const adminProfiles = await Promise.all(profiles.map(async (profile) => {
        let organization = null;
        
        if ((profile as any).gym_id) {
          const { data: orgData } = await supabase
            .from('gyms' as any)
            .select('name')
            .eq('id', (profile as any).gym_id)
            .single();
            
          if (orgData) {
            organization = orgData;
          }
        }
        
        return {
          ...(profile as any),
          organizations: organization ? { 
            name: organization.name
          } : null
        };
      }));
      
      return adminProfiles as any;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data: gyms, error: gymsError } = await supabase
        .from('gyms' as any)
        .select('id')
        .eq('status', 'active');

      const { data: branches, error: branchesError } = await supabase
        .from('branches')
        .select('id, organization_id')
        .eq('status', 'active');

      if (gymsError || branchesError) throw gymsError || branchesError;

      return {
        totalOrganizations: gyms?.length || 0,
        totalBranches: branches?.length || 0,
        totalAdmins: adminProfiles.length,
      };
    },
    enabled: adminProfiles.length > 0
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground">Create and manage gym admin accounts with advanced analytics</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Admin Account
        </Button>

        <AdminAccountWizard 
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            refetch(); // Refetch admin list after success
          }}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="accounts">Admin Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Admins</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{adminProfiles.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active admin accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Organizations</CardTitle>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{stats?.totalOrganizations || 0}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active organization accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Branches</CardTitle>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">{stats?.totalBranches || 0}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coverage</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {stats?.totalOrganizations ? Math.round((adminProfiles.length / stats.totalOrganizations) * 100) : 0}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Organizations with admins</p>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="analytics">
          <SuperAdminAdvancedAnalytics />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          {/* Admin Profiles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminProfiles.map((admin) => (
          <Card key={admin.user_id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{admin.full_name}</CardTitle>
                  <CardDescription className="text-sm">
                    Admin • Created {new Date(admin.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                  {admin.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{admin.email}</span>
                </div>
                {admin.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{admin.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{(admin.organizations as any)?.name || 'No organization assigned'}</span>
                </div>
              </div>

              {(admin.organizations as any) && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Subscription</span>
                    <Badge variant="outline" className="text-xs">
                      {(admin.subscription_plans as any)?.[0]?.subscription_plan_id?.name || 'N/A'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {adminProfiles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No Admin Accounts</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Get started by creating your first gym admin account. Admins can manage their gym's branches and operations.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create First Admin Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}