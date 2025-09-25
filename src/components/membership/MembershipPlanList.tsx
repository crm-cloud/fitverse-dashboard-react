import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/useCurrency';

export const MembershipPlanList = () => {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [viewingPlan, setViewingPlan] = useState<any | null>(null);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  const { data: plans = [], isLoading, error, refetch } = useSupabaseQuery(
    ['membership_plans'],
    async () => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  );

  // Fetch member counts per plan
  const { data: memberCounts = {} } = useQuery({
    queryKey: ['membership-plan-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_memberships')
        .select('membership_plan_id')
        .eq('status', 'active');
      if (error) throw error;
      
      const counts = {};
      data?.forEach(membership => {
        const planId = membership.membership_plan_id;
        counts[planId] = (counts[planId] || 0) + 1;
      });
      return counts;
    }
  });

  // Calculate stats
  const stats = {
    totalPlans: plans.length,
    activePlans: plans.filter(p => p.is_active).length,
    mostPopularPlan: Object.keys(memberCounts).length > 0 ? 
      plans.find(p => p.id === Object.keys(memberCounts).reduce((a, b) => memberCounts[a] > memberCounts[b] ? a : b)) 
      : null,
    totalMembers: Object.values(memberCounts).reduce((sum: number, count: number) => sum + count, 0) as number
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      // Check if any members are assigned to this plan
      const { data: assignedMembers, error: checkError } = await supabase
        .from('member_memberships')
        .select('id')
        .eq('membership_plan_id', planId)
        .eq('status', 'active')
        .limit(1);

      if (checkError) throw checkError;

      if (assignedMembers && assignedMembers.length > 0) {
        toast({
          title: 'Cannot Delete Plan',
          description: 'This plan has active members assigned to it. Please reassign or expire their memberships first.',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('membership_plans')
        .update({ is_active: false })
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: 'Plan Deleted',
        description: 'Membership plan has been successfully deleted.',
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete membership plan.',
        variant: 'destructive'
      });
    }
  };

  const formatDuration = (months: number) => {
    if (months === 1) return '1 Month';
    if (months === 3) return '3 Months';
    if (months === 6) return '6 Months';
    if (months === 12) return '1 Year';
    return `${months} Months`;
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading membership plans...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-destructive">Error loading membership plans.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-200">Total Plans</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0116 8H4a5 5 0 014.5 2.67A6.97 6.97 0 007 16c0 .34.024.673.07 1h5.86z" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-white">{stats.totalPlans}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Available membership plans
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-200">Active Plans</CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-white">{stats.activePlans}</div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-200">Most Popular</CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-900 dark:text-white truncate">
              {stats.mostPopularPlan?.name || 'None'}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              {stats.mostPopularPlan ? `${memberCounts[stats.mostPopularPlan.id] || 0} members` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">Total Members</CardTitle>
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900 dark:text-white">{stats.totalMembers}</div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Active memberships
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const allotments: Record<string, number> | undefined =
              (plan as any).sessionAllotments || (plan as any).session_allotments;
            const hasAllotments = allotments && Object.keys(allotments).length > 0;
            
            return (
              <Card key={plan.id} className="relative overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group">                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <CardTitle className="text-xl font-bold break-words">{plan.name}</CardTitle>
                        <Badge 
                          variant={plan.is_active ? "default" : "secondary"}
                          className={`text-xs h-5 font-medium shadow-sm whitespace-nowrap ${plan.is_active ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100'}`}
                        >
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(plan.price)}</div>
                      <div className="text-xs text-muted-foreground">{formatDuration(plan.duration_months)}</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-2">
                  {/* Features */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Features</h4>
                      <ul className="space-y-1 text-sm">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-xs text-muted-foreground">+{plan.features.length - 4} more features</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {/* Session Allotments */}
                  {hasAllotments && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Session Allotments</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(allotments).slice(0, 4).map(([name, qty]) => (
                          <div key={name} className="flex items-center bg-muted/50 rounded px-2 py-1">
                            <span className="font-medium">{name}:</span>
                            <span className="ml-1">{qty}</span>
                          </div>
                        ))}
                        {Object.keys(allotments).length > 4 && (
                          <div className="text-xs text-muted-foreground col-span-2">
                            +{Object.keys(allotments).length - 4} more sessions
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm">
                      <span className="font-medium">{memberCounts[plan.id] || 0}</span>
                      <span className="text-muted-foreground ml-1">active members</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setViewingPlan(plan)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingPlan(plan)}
                        title="Edit Plan"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Membership Plan</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{plan.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeletePlan(plan.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* View Plan Modal */}
      {viewingPlan && (
        <AlertDialog open={!!viewingPlan} onOpenChange={() => setViewingPlan(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>{viewingPlan.name}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>{viewingPlan.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Price:</strong> {formatCurrency(viewingPlan.price)}
                    </div>
                    <div>
                      <strong>Duration:</strong> {formatDuration(viewingPlan.duration_months)}
                    </div>
                    <div>
                      <strong>Active Members:</strong> {memberCounts[viewingPlan.id] || 0}
                    </div>
                    <div>
                      <strong>Status:</strong> {viewingPlan.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  {viewingPlan.features && viewingPlan.features.length > 0 && (
                    <div>
                      <strong>Features:</strong>
                      <ul className="list-disc list-inside text-sm mt-2">
                        {viewingPlan.features.map((feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <AlertDialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Plan Feature</AlertDialogTitle>
              <AlertDialogDescription>
                Plan editing functionality would be implemented here. For now, this shows plan details that could be edited.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Save Changes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};