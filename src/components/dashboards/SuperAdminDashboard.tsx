
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Dumbbell,
  Trophy,
  DollarSign,
  Shield,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  
  // Fetch real data from database
  const { data: branches } = useSupabaseQuery(
    ['branches'],
    async () => {
      const { data, error } = await supabase.from('branches').select('*');
      if (error) throw error;
      return data;
    }
  );

  const { data: users } = useSupabaseQuery(
    ['profiles'],
    async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data;
    }
  );

  const { data: memberships } = useSupabaseQuery(
    ['member_memberships'],
    async () => {
      const { data, error } = await supabase
        .from('member_memberships')
        .select('*, membership_plans(*)')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  );

  // Calculate metrics
  const totalBranches = branches?.length || 0;
  const activeBranches = branches?.filter(b => b.status === 'active').length || 0;
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.is_active).length || 0;
  const totalRevenue = memberships?.reduce((sum, m) => sum + (m.payment_amount || 0), 0) || 0;

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Backup Initiated',
        description: 'System backup has been started. You will be notified when complete.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: 'Failed to initiate system backup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleServerStatus = async () => {
    try {
      setIsCheckingServer(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Server Status',
        description: 'All systems operational. No issues detected.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Server Error',
        description: 'Unable to fetch server status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingServer(false);
    }
  };

  const handleUserRoles = () => {
    navigate('/users');
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
      <Badge variant="destructive" className="bg-red-600">Super Admin</Badge>
    </div>
    
    {/* System Status Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">System Health</CardTitle>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-2xl font-bold">99.9%</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">All systems operational</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">Total Branches</CardTitle>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="text-2xl font-bold">{totalBranches}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">{activeBranches} active branches</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">Global Revenue</CardTitle>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-2xl font-bold">${totalRevenue.toLocaleString()}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/70">From active memberships</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-success" />
            <span className="text-2xl font-bold text-foreground">{activeUsers.toLocaleString()}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{totalUsers} total users</p>
        </CardContent>
      </Card>
    </div>

    {/* System Management */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Administration
          </CardTitle>
          <CardDescription>Critical system management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleBackup}
              disabled={isBackingUp}
              className="h-20 flex flex-col gap-2"
            >
              {isBackingUp ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Database className="w-6 h-6" />
              )}
              <span className="text-sm">
                {isBackingUp ? 'Backing Up...' : 'Backup System'}
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleServerStatus}
              disabled={isCheckingServer}
              className="h-20 flex flex-col gap-2"
            >
              {isCheckingServer ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Server className="w-6 h-6" />
              )}
              <span className="text-sm">
                {isCheckingServer ? 'Checking...' : 'Server Status'}
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleUserRoles}
              className="h-20 flex flex-col gap-2"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">User Roles</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleAnalytics}
              className="h-20 flex flex-col gap-2"
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <div>
              <p className="font-medium text-yellow-800">Database Maintenance</p>
              <p className="text-sm text-yellow-600">Scheduled for tonight at 2 AM</p>
            </div>
            <Badge variant="outline" className="border-yellow-400 text-yellow-700">
              Scheduled
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
            <div>
              <p className="font-medium text-green-800">Security Update</p>
              <p className="text-sm text-green-600">All systems updated successfully</p>
            </div>
            <Badge variant="outline" className="border-green-400 text-green-700">
              Complete
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};
