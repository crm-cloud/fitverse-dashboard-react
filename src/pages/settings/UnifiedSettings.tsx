import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, CreditCard, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBranches } from '@/hooks/useBranches';
import EmailSettings from '@/pages/system/EmailSettings';
import SMSSettings from '@/pages/system/SMSSettings';
import WhatsAppSettings from '@/pages/system/WhatsAppSettings';
import PaymentGatewaySettings from '@/pages/system/PaymentGatewaySettings';

export default function UnifiedSettings() {
  const { authState } = useAuth();
  const { branches = [] } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id);
  
  const isAdmin = authState.user?.role === 'admin';
  const isSuperAdmin = authState.user?.role === 'super-admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isSuperAdmin ? 'Global Settings' : 'Gym & Branch Settings'}
          </h1>
          <p className="text-muted-foreground">
            Configure communication and payment settings for your gym
          </p>
        </div>
        
        {/* Branch Selector for Admins */}
        {isAdmin && branches.length > 0 && (
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Card className="p-6">
        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Gateway
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <EmailSettings />
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <SMSSettings />
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <WhatsAppSettings />
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <PaymentGatewaySettings />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
