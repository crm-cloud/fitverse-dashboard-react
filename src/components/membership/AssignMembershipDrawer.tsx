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
import { useBranches } from '@/hooks/useBranches';
import { useMembershipPlans } from '@/hooks/useSupabaseQuery';

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
  const { data: membershipPlans } = useMembershipPlans();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  const form = useForm<z.infer<typeof membershipFormSchema>>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      gstEnabled: false,
      discountPercent: 0,
    }
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Assign Membership</SheetTitle>
          <SheetDescription>
            Database integration in progress for {memberName}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Component being migrated to database</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};