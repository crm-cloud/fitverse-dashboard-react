import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays } from 'date-fns';
import { CalendarIcon, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { MembershipFormData, MembershipPlan } from '@/types/membership';
import { mockMembershipPlans, accessTypeLabels } from '@/mock/membership';
import { mockBranches } from '@/mock/members';
import { useBranches } from '@/hooks/useBranches';

const membershipFormSchema = z.object({
  planId: z.string().min(1, 'Please select a membership plan'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  gstEnabled: z.boolean().default(false),
});

interface AssignMembershipDrawerProps {
  open: boolean;
  onClose: () => void;
  memberName: string;
  onSubmit: (data: MembershipFormData) => void;
}

export const AssignMembershipDrawer = ({ 
  open, 
  onClose, 
  memberName, 
  onSubmit 
}: AssignMembershipDrawerProps) => {
  const { selectedBranch } = useBranches();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [calculatedValues, setCalculatedValues] = useState({
    endDate: new Date(),
    originalAmount: 0,
    discountAmount: 0,
    gstAmount: 0,
    finalAmount: 0
  });

  const form = useForm<z.infer<typeof membershipFormSchema>>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      gstEnabled: false,
      discountPercent: 0,
    }
  });

  const watchedPlanId = form.watch('planId');
  const watchedStartDate = form.watch('startDate');
  const watchedDiscountPercent = form.watch('discountPercent');
  const watchedDiscountAmount = form.watch('discountAmount');
  const watchedGstEnabled = form.watch('gstEnabled');

  // Update selected plan when plan ID changes
  useEffect(() => {
    if (watchedPlanId) {
      const plan = mockMembershipPlans.find(p => p.id === watchedPlanId);
      setSelectedPlan(plan || null);
    }
  }, [watchedPlanId]);

  // Recalculate values when dependencies change
  useEffect(() => {
    if (selectedPlan && watchedStartDate) {
      const endDate = addDays(watchedStartDate, selectedPlan.duration);
      const originalAmount = selectedPlan.price;
      
      let discountAmount = 0;
      if (watchedDiscountPercent && watchedDiscountPercent > 0) {
        discountAmount = (originalAmount * watchedDiscountPercent) / 100;
      } else if (watchedDiscountAmount && watchedDiscountAmount > 0) {
        discountAmount = watchedDiscountAmount;
      }

      const amountAfterDiscount = originalAmount - discountAmount;
      const gstAmount = watchedGstEnabled ? (amountAfterDiscount * 18) / 100 : 0;
      const finalAmount = amountAfterDiscount + gstAmount;

      setCalculatedValues({
        endDate,
        originalAmount,
        discountAmount,
        gstAmount,
        finalAmount
      });
    }
  }, [selectedPlan, watchedStartDate, watchedDiscountPercent, watchedDiscountAmount, watchedGstEnabled]);

  const handleDiscountPercentChange = (value: string) => {
    const percent = parseFloat(value) || 0;
    form.setValue('discountPercent', percent);
    form.setValue('discountAmount', 0); // Clear fixed amount
  };

  const handleDiscountAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    form.setValue('discountAmount', amount);
    form.setValue('discountPercent', 0); // Clear percentage
  };

  const handleSubmit = (data: z.infer<typeof membershipFormSchema>) => {
    const membershipData: MembershipFormData = {
      planId: data.planId,
      startDate: data.startDate,
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
      gstEnabled: data.gstEnabled,
    };

    onSubmit(membershipData);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Assign Membership</SheetTitle>
          <SheetDescription>
            Assign a membership plan to {memberName}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            {/* Plan Selection */}
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership Plan *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a membership plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockMembershipPlans.filter(plan => plan.isActive).map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{plan.name}</span>
                            <span className="font-medium">{formatCurrency(plan.price)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Details */}
            {selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Duration</Label>
                      <p>{selectedPlan.duration} days</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Classes</Label>
                      <p>{selectedPlan.classesAllowed === -1 ? 'Unlimited' : selectedPlan.classesAllowed}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Access Types</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPlan.accessTypes.map((access) => (
                        <Badge key={access} variant="secondary" className="text-xs">
                          {accessTypeLabels[access]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm">{selectedPlan.description}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick start date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date Display */}
            {selectedPlan && watchedStartDate && (
              <div>
                <Label className="text-muted-foreground">End Date</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {format(calculatedValues.endDate, "PPP")}
                </div>
              </div>
            )}

            {/* Discount Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Discount (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Discount Percentage (%)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={watchedDiscountPercent || ''}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Discount Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={watchedDiscountAmount || ''}
                      onChange={(e) => handleDiscountAmountChange(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GST Toggle */}
            <FormField
              control={form.control}
              name="gstEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Apply GST (18%)</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Add 18% GST to the membership amount
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Amount Breakdown */}
            {selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Amount Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Original Amount:</span>
                    <span>{formatCurrency(calculatedValues.originalAmount)}</span>
                  </div>
                  {calculatedValues.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(calculatedValues.discountAmount)}</span>
                    </div>
                  )}
                  {calculatedValues.gstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span>+{formatCurrency(calculatedValues.gstAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Final Amount:</span>
                    <span>{formatCurrency(calculatedValues.finalAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <SheetFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedPlan}>
                Generate Invoice
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};