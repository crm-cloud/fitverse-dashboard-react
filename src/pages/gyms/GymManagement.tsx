import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus, MoreVertical, Settings, Users, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { GymForm } from '@/components/gyms/GymForm';

interface Gym {
  id: string;
  name: string;
  subscription_plan: string;
  status: string;
  max_branches: number;
  max_trainers: number;
  max_members: number;
  billing_email: string;
  created_at: string;
}

export default function GymManagement() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const queryClient = useQueryClient();

  const { data: gyms, isLoading } = useQuery({
    queryKey: ['gyms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Gym[];
    }
  });

  const { data: usage } = useQuery({
    queryKey: ['gym-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_usage')
        .select('gym_id, branch_count, trainer_count, member_count')
        .eq('month_year', new Date().toISOString().slice(0, 7) + '-01');
      
      if (error) throw error;
      return data;
    }
  });

  const deleteGym = useMutation({
    mutationFn: async (gymId: string) => {
      const { error } = await supabase
        .from('gyms')
        .update({ status: 'inactive' })
        .eq('id', gymId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gym has been deactivated successfully."
      });
      const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['gyms', 'gym-usage'] });
        setIsDrawerOpen(false);
        setSelectedGym(null);
      };
      handleSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getUsageForGym = (gymId: string) => {
    return usage?.find(u => u.gym_id === gymId) || {
      branch_count: 0,
      trainer_count: 0,
      member_count: 0
    };
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'destructive';
      case 'suspended': return 'secondary';
      default: return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'basic': return 'outline';
      case 'professional': return 'default';
      case 'enterprise': return 'secondary';
      default: return 'outline';
    }
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['gyms', 'gym-usage'] });
    setIsDrawerOpen(false);
    setSelectedGym(null);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gym Management</h1>
          <p className="text-muted-foreground">
            Manage all gyms in your network
          </p>
        </div>
        <Button onClick={() => {
          setSelectedGym(null);
          setIsDrawerOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Gym
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gyms?.map((gym) => {
          const gymUsage = getUsageForGym(gym.id);
          
          return (
            <Card key={gym.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{gym.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Created {new Date(gym.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedGym(gym);
                          setIsDrawerOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.location.href = '/users/admin-management'}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Admins
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteGym.mutate(gym.id)}
                        className="text-destructive"
                      >
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Badge variant={getStatusBadgeVariant(gym.status)}>
                    {gym.status}
                  </Badge>
                  <Badge variant={getPlanBadgeVariant(gym.subscription_plan)}>
                    {gym.subscription_plan}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Branches: {gymUsage.branch_count} / {gym.max_branches}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Trainers: {gymUsage.trainer_count} / {gym.max_trainers}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Members: {gymUsage.member_count} / {gym.max_members}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Contact: {gym.billing_email || 'Not set'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedGym ? 'Edit Gym' : 'Add New Gym'}
              </h2>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <GymForm 
              gym={selectedGym}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}