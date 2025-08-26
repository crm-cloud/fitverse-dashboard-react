import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CheckCircle, Clock, Dumbbell, HeartPulse, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MembershipPlan } from '@/types/membership';
import { membershipService } from '@/services/membershipService';
import { useToast } from '@/hooks/use-toast';

export function MembershipPlansPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: plans = [], isLoading, error } = useQuery<MembershipPlan[]>({
    queryKey: ['membershipPlans'],
    queryFn: membershipService.getAvailablePlans,
  });

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    navigate(`/checkout?planId=${planId}`);
  };

  if (isLoading) return <div>Loading plans...</div>;
  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load membership plans. Please try again later.',
      variant: 'destructive',
    });
    return <div>Error loading plans. Please try again later.</div>;
  }

  const features = [
    'Access to all gym facilities',
    'Free fitness assessment',
    'Personal trainer discount',
    'Group classes included',
    '24/7 gym access',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Choose Your Membership</h1>
        <p className="text-muted-foreground">Select the plan that best fits your fitness goals</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              plan.isPopular ? 'border-2 border-primary' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 transform translate-x-2 -translate-y-2 rotate-12">
                POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.name}
                {plan.isPopular && <Zap className="w-5 h-5 text-yellow-400" />}
              </CardTitle>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.billingCycle}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleSelectPlan(plan.id)}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 bg-muted/50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Membership Benefits</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Unlimited Access</h3>
              <p className="text-sm text-muted-foreground">Access to all gym facilities and equipment</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <HeartPulse className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Health Tracking</h3>
              <p className="text-sm text-muted-foreground">Track your progress and set fitness goals</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Flexible Hours</h3>
              <p className="text-sm text-muted-foreground">24/7 access with all membership plans</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MembershipPlansPage;
