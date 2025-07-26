import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanForm } from '@/components/membership/PlanForm';

export function PlanCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Membership Plan</h1>
        <p className="text-muted-foreground">Define a new membership plan with pricing and benefits</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Configuration</CardTitle>
          <CardDescription>
            Set up the plan details, pricing, and member benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanForm />
        </CardContent>
      </Card>
    </div>
  );
}