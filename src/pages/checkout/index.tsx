import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { membershipService, MembershipPlan } from '@/services/membershipService';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import CheckoutForm from './CheckoutForm';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState('');
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const planId = searchParams.get('planId');

  // Fetch plan details
  const { data: plan, isLoading: isLoadingPlan } = useQuery<MembershipPlan>({
    queryKey: ['membershipPlan', planId],
    queryFn: () => membershipService.getPlanDetails(planId!), 
    enabled: !!planId,
  });

  // Create payment intent when plan is loaded
  useEffect(() => {
    if (!planId) return;

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/membership/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
      }
    };

    createPaymentIntent();
  }, [planId, toast]);

  // Load Stripe
  useEffect(() => {
    stripePromise.then(stripe => {
      setStripe(stripe);
    });
  }, []);

  if (!planId) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Plan Selected</h2>
          <p className="text-muted-foreground mb-6">Please select a membership plan to continue.</p>
          <Button onClick={() => navigate('/membership/plans')}>
            View Plans
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingPlan || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const appearance: StripeElementsOptions['appearance'] = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
    },
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
      </Button>

      <h1 className="text-3xl font-bold mb-8">Complete Your Purchase</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              {stripe && clientSecret ? (
                <Elements stripe={stripe} options={options}>
                  <CheckoutForm planId={planId} />
                </Elements>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Billed {plan.billingCycle === 'month' ? 'monthly' : 'annually'}
                    </p>
                  </div>
                  <p className="font-bold">
                    ${plan.price}/{plan.billingCycle}
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Access to all gym facilities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Free fitness assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Group classes included</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you need any assistance with your purchase, please contact our support team.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
