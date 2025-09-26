import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PaymentFormData, PaymentMethod, Invoice } from '@/types/membership';
import { useToast } from '@/hooks/use-toast';

const paymentFormSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank-transfer']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

interface PaymentRecorderDrawerProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  onPaymentRecorded: () => void;
}

const paymentMethodOptions = [
  { value: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote },
  { value: 'card' as PaymentMethod, label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'upi' as PaymentMethod, label: 'UPI', icon: Smartphone },
  { value: 'bank-transfer' as PaymentMethod, label: 'Bank Transfer', icon: Building2 },
];

export const PaymentRecorderDrawer = ({ 
  open, 
  onClose, 
  invoice, 
  onPaymentRecorded 
}: PaymentRecorderDrawerProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: invoice.finalAmount,
      paymentMethod: 'cash',
    }
  });

  const watchedPaymentMethod = form.watch('paymentMethod');
  const watchedAmount = form.watch('amount');

  const handleSubmit = async (data: z.infer<typeof paymentFormSchema>) => {
    setIsProcessing(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get payment method record
      const { data: paymentMethodRecord } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('type', data.paymentMethod)
        .single();

      // Get or create transaction category for membership payments
      const { data: categoryRecord } = await supabase
        .from('transaction_categories')
        .select('id')
        .eq('name', 'Membership Payment')
        .eq('type', 'income')
        .single();

      let categoryId = categoryRecord?.id;
      if (!categoryId) {
        const { data: newCategory } = await supabase
          .from('transaction_categories')
          .insert({
            name: 'Membership Payment',
            type: 'income',
            color: '#10B981',
            icon: 'CreditCard',
            description: 'Payments received for gym memberships',
            is_active: true
          })
          .select('id')
          .single();
        categoryId = newCategory?.id;
      }

      // Create transaction record
      const transactionData = {
        date: new Date().toISOString().split('T')[0],
        type: 'income' as const,
        category_id: categoryId,
        amount: data.amount,
        description: `Payment for invoice ${invoice.invoiceNumber}`,
        payment_method_id: paymentMethodRecord?.id,
        reference: data.referenceNumber,
        member_id: invoice.memberId,
        member_name: invoice.memberName,
        status: 'completed' as const
      };

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData);

      if (transactionError) throw transactionError;

      // Update invoice status
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({ 
          status: data.amount >= invoice.finalAmount ? 'paid' : 'sent'
        })
        .eq('id', invoice.id);

      if (invoiceError) throw invoiceError;

      // Update membership payment status if linked
      if (invoice.membershipId) {
        const { error: membershipError } = await supabase
          .from('member_memberships')
          .update({ 
            payment_status: data.amount >= invoice.finalAmount ? 'completed' : 'pending'
          })
          .eq('id', invoice.membershipId);
        
        if (membershipError) console.warn('Failed to update membership status:', membershipError);
      }

      toast({
        title: 'Payment Recorded',
        description: `Payment of ${formatCurrency(data.amount)} has been successfully recorded.`,
      });

      onPaymentRecorded();
      onClose();
    } catch (error: any) {
      console.error('Payment recording error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const needsReference = watchedPaymentMethod === 'card' || 
                        watchedPaymentMethod === 'upi' || 
                        watchedPaymentMethod === 'bank-transfer';

  const isPartialPayment = watchedAmount < invoice.finalAmount;
  const isOverPayment = watchedAmount > invoice.finalAmount;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Record Payment</SheetTitle>
          <SheetDescription>
            Record payment for invoice {invoice.invoiceNumber}
          </SheetDescription>
        </SheetHeader>

        {/* Invoice Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Member:</span>
              <span className="font-medium">{invoice.memberName}</span>
            </div>
            <div className="flex justify-between">
              <span>Plan:</span>
              <span>{invoice.planName}</span>
            </div>
            <div className="flex justify-between">
              <span>Due Date:</span>
              <span>{format(invoice.dueDate, 'MMM dd, yyyy')}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Amount Due:</span>
              <span>{formatCurrency(invoice.finalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            {/* Payment Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      step="0.01"
                      min="0.01"
                      max={invoice.finalAmount * 1.1} // Allow 10% overpayment
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  
                  {/* Payment Amount Alerts */}
                  {isPartialPayment && (
                    <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
                      ⚠️ Partial payment: {formatCurrency(invoice.finalAmount - watchedAmount)} remaining
                    </div>
                  )}
                  {isOverPayment && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
                      ℹ️ Overpayment: {formatCurrency(watchedAmount - invoice.finalAmount)} excess
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Quick Amount Buttons */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue('amount', invoice.finalAmount)}
              >
                Full Amount
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue('amount', invoice.finalAmount / 2)}
              >
                Half Amount
              </Button>
            </div>

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              <IconComponent className="h-4 w-4 mr-2" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference Number */}
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reference Number {needsReference ? '*' : '(Optional)'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter transaction reference"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {needsReference && (
                    <div className="text-sm text-muted-foreground">
                      Reference number is required for {paymentMethodOptions.find(o => o.value === watchedPaymentMethod)?.label}
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? 'Recording...' : 'Record Payment'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};