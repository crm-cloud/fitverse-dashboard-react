import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  planId: string;
}

export default function CheckoutForm({ planId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/membership/success`,
          receipt_email: 'customer@example.com', // Replace with actual user email
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        throw stripeError;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Redirect to success page or show success message
        navigate('/membership/success', { 
          state: { 
            planId,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          } 
        });
        return;
      }

      // If we get here, something went wrong
      throw new Error('Payment processing failed. Please try again.');
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing.');
      toast({
        title: 'Payment Error',
        description: err.message || 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#374151',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Card Information</label>
          <div className="border rounded-md p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name on Card</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="John Smith"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Postal Code</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="12345"
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="mt-6">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </Button>

        <p className="mt-3 text-xs text-muted-foreground text-center">
          Your payment is secure and encrypted. We never store your card details.
        </p>
      </div>
    </form>
  );
}
