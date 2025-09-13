import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Share2, Plus, Users, TrendingUp, DollarSign, Gift, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referredName: string;
  referredEmail: string;
  status: 'pending' | 'converted' | 'expired';
  referralCode: string;
  bonusAmount: number;
  createdAt: Date;
  convertedAt?: Date;
}

interface ReferralSettings {
  bonusAmount: number;
  expiryDays: number;
  isActive: boolean;
}

const mockReferrals: Referral[] = [
  {
    id: '1',
    referrerName: 'John Smith',
    referrerEmail: 'john@email.com',
    referredName: 'Jane Doe',
    referredEmail: 'jane@email.com',
    status: 'converted',
    referralCode: 'GYM123ABC',
    bonusAmount: 50,
    createdAt: new Date('2024-01-10'),
    convertedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    referrerName: 'Mike Johnson',
    referrerEmail: 'mike@email.com',
    referredName: 'Sarah Wilson',
    referredEmail: 'sarah@email.com',
    status: 'pending',
    referralCode: 'GYM456DEF',
    bonusAmount: 50,
    createdAt: new Date('2024-01-20')
  }
];

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals);
  const [settings, setSettings] = useState<ReferralSettings>({
    bonusAmount: 50,
    expiryDays: 30,
    isActive: true
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const stats = {
    totalReferrals: referrals.length,
    convertedReferrals: referrals.filter(r => r.status === 'converted').length,
    pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    totalBonusPaid: referrals
      .filter(r => r.status === 'converted')
      .reduce((sum, r) => sum + r.bonusAmount, 0)
  };

  const conversionRate = stats.totalReferrals > 0 
    ? ((stats.convertedReferrals / stats.totalReferrals) * 100).toFixed(1)
    : '0';

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard"
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy referral code",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsConverted = (referralId: string) => {
    setReferrals(prev => prev.map(ref => 
      ref.id === referralId 
        ? { ...ref, status: 'converted' as const, convertedAt: new Date() }
        : ref
    ));
    toast({
      title: "Success",
      description: "Referral marked as converted"
    });
  };

  const handleUpdateSettings = () => {
    toast({
      title: "Success",
      description: "Referral settings updated successfully"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'default';
      case 'pending': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referral Management</h1>
          <p className="text-muted-foreground">Track and manage member referrals and bonuses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonus Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBonusPaid}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referrals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="referrals">
          <div className="grid gap-4">
            {referrals.map((referral) => (
              <Card key={referral.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {referral.referrerName} → {referral.referredName}
                        </CardTitle>
                        <Badge variant={getStatusColor(referral.status)}>
                          {referral.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Referrer: {referral.referrerEmail} | Referred: {referral.referredEmail}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Code:</span>
                        <Badge variant="outline" className="font-mono">
                          {referral.referralCode}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleCopyCode(referral.referralCode)}
                        >
                          {copiedCode === referral.referralCode ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        ${referral.bonusAmount}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {referral.status === 'converted' && referral.convertedAt
                          ? `Converted: ${referral.convertedAt.toLocaleDateString()}`
                          : `Created: ${referral.createdAt.toLocaleDateString()}`
                        }
                      </p>
                      {referral.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => handleMarkAsConverted(referral.id)}
                        >
                          Mark Converted
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Referral Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bonusAmount">Bonus Amount ($)</Label>
                  <Input
                    id="bonusAmount"
                    type="number"
                    value={settings.bonusAmount}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      bonusAmount: Number(e.target.value) 
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiryDays">Referral Expiry (days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    value={settings.expiryDays}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      expiryDays: Number(e.target.value) 
                    }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={settings.isActive}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    isActive: e.target.checked 
                  }))}
                  className="rounded border-input"
                />
                <Label htmlFor="isActive">Enable Referral Program</Label>
              </div>
              
              <Button onClick={handleUpdateSettings}>
                Update Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}