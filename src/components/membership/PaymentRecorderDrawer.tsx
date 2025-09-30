import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
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
      const paymentId = uuidv4();
      const now = new Date().toISOString();
      
      // 1. Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          id: paymentId,
          invoice_id: invoice.id,
          member_id: invoice.memberId,
          amount: data.amount,
          payment_method: data.paymentMethod,
          reference_number: data.referenceNumber,
          notes: data.notes,
          status: 'completed',
          created_at: now,
          updated_at: now,
        }]);

      if (paymentError) throw paymentError;

      // 2. Create finance transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          id: uuidv4(),
          type: 'income',
          amount: data.amount,
          category: 'membership',
          payment_method: data.paymentMethod,
          reference: `Payment for Invoice #${invoice.invoiceNumber}`,
          notes: data.notes,
          status: 'completed',
          date: now,
          created_at: now,
          updated_at: now,
          related_entity_type: 'payment',
          related_entity_id: paymentId,
        }]);

      if (transactionError) throw transactionError;

      // 3. Update member's balance
      const { error: balanceError } = await supabase.rpc('update_member_balance', {
        member_id: invoice.memberId,
        amount: -data.amount, // Negative because we're reducing the balance
      });

      if (balanceError) throw balanceError;

      // 4. Update invoice status if fully paid
      if (data.amount >= invoice.finalAmount) {
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({ 
            status: 'paid',
            updated_at: now,
            paid_at: now
          })
          .eq('id', invoice.id);

        if (invoiceError) throw invoiceError;
      }

      toast({
        title: 'Payment Recorded',
        description: `Payment of ${formatCurrency(data.amount)} has been successfully recorded.`,
      });

      onPaymentRecorded();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
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