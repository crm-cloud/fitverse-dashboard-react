import { useState } from 'react';
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

  const { data: plans = [], isLoading, error } = useSupabaseQuery(
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

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('membership_plans')
        .update({ is_active: false })
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: 'Plan Deleted',
        description: 'Membership plan has been successfully deleted.',
      });
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
                <TableHead>Details</TableHead>
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
                  <TableCell>
                    <span className="text-sm text-muted-foreground">Features included</span>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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
    </div>
  );
};