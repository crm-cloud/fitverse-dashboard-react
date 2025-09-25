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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              Available membership plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlans}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {stats.mostPopularPlan?.name || 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.mostPopularPlan ? `${memberCounts[stats.mostPopularPlan.id] || 0} members` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active memberships
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {plan.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(plan.price)}
                  </TableCell>
                  <TableCell>{formatDuration(plan.duration_months)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-1">
                        {plan.features.slice(0, 2).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {plan.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{plan.features.length - 2}
                          </Badge>
                        )}
                      </div>
                      {/* Support both camelCase and snake_case from API */}
                      {(() => {
                        const allotments: Record<string, number> | undefined =
                          (plan as any).sessionAllotments || (plan as any).session_allotments;
                        if (!allotments || Object.keys(allotments).length === 0) return null;
                        return (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {Object.entries(allotments).slice(0, 2).map(([name, qty]) => (
                              <Badge key={name} variant="outline" className="text-[10px]">
                                {name}: {qty}
                              </Badge>
                            ))}
                            {Object.keys(allotments).length > 2 && (
                              <Badge variant="outline" className="text-[10px]">+{Object.keys(allotments).length - 2}</Badge>
                            )}
                          </div>
                        );
                      })()}
                      
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-semibold">{memberCounts[plan.id] || 0}</div>
                    <div className="text-xs text-muted-foreground">active</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={plan.is_active ? "default" : "secondary"}
                      className={plan.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setViewingPlan(plan)}
                        title="View Plan Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingPlan(plan)}
                        title="Edit Plan"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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