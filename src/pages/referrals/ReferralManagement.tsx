import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { toast } from 'sonner';

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referral_code: string;
  status: 'pending' | 'converted' | 'expired';
  bonus_amount: number;
  created_at: string;
  converted_at?: string;
  referrer_name?: string;
  referrer_email?: string;
  referred_name?: string;
  referred_email?: string;
}

interface ReferralSettings {
  id?: string;
  bonus_amount: number;
  expiry_days: number;
  is_active: boolean;
}

export default function ReferralManagement() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch referrals from database
  const { data: referrals = [], isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrer_id(full_name, email),
          referred:profiles!referred_id(full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data?.map((referral: any) => ({
        id: referral.id,
        referrer_id: referral.referrer_id,
        referred_id: referral.referred_id,
        referral_code: referral.referral_code,
        status: referral.status,
        bonus_amount: referral.bonus_amount,
        created_at: referral.created_at,
        converted_at: referral.converted_at,
        referrer_name: referral.referrer?.full_name,
        referrer_email: referral.referrer?.email,
        referred_name: referral.referred?.full_name || 'Pending',
        referred_email: referral.referred?.email || 'Pending'
      })) || [];
    },
  });

  // Fetch referral settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || { bonus_amount: 50, expiry_days: 30, is_active: true };
    },
  });

  // Update referral status mutation
  const updateReferralMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('referrals')
        .update({ 
          status, 
          converted_at: status === 'converted' ? new Date().toISOString() : null 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      toast.success('Referral status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update referral status');
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: ReferralSettings) => {
      const { error } = await supabase
        .from('referral_settings')
        .upsert(newSettings);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-settings'] });
      toast.success('Referral settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update referral settings');
    },
  });

  const stats = {
    totalReferrals: referrals.length,
    convertedReferrals: referrals.filter((r: Referral) => r.status === 'converted').length,
    pendingReferrals: referrals.filter((r: Referral) => r.status === 'pending').length,
    totalBonusPaid: referrals
      .filter((r: Referral) => r.status === 'converted')
      .reduce((sum: number, r: Referral) => sum + r.bonus_amount, 0)
  };

  const conversionRate = stats.totalReferrals > 0 
    ? ((stats.convertedReferrals / stats.totalReferrals) * 100).toFixed(1)
    : '0';

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Referral code copied to clipboard');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Failed to copy referral code');
    }
  };

  const handleMarkAsConverted = (referralId: string) => {
    updateReferralMutation.mutate({ id: referralId, status: 'converted' });
  };

  const handleUpdateSettings = () => {
    if (settings) {
      updateSettingsMutation.mutate(settings);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'default';
      case 'pending': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoadingReferrals || isLoadingSettings) {
    return <div className="flex items-center justify-center p-8">Loading referrals...</div>;
  }

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
            {referrals.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No referrals found</h3>
                <p className="text-muted-foreground mb-4">
                  Start promoting the referral program to see referrals here
                </p>
              </Card>
            ) : (
              referrals.map((referral: Referral) => (
                <Card key={referral.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">
                            {referral.referrer_name} → {referral.referred_name}
                          </CardTitle>
                          <Badge variant={getStatusColor(referral.status)}>
                            {referral.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Referrer: {referral.referrer_email} | Referred: {referral.referred_email}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Code:</span>
                          <Badge variant="outline" className="font-mono">
                            {referral.referral_code}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCopyCode(referral.referral_code)}
                          >
                            {copiedCode === referral.referral_code ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          ${referral.bonus_amount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {referral.status === 'converted' && referral.converted_at
                            ? `Converted: ${new Date(referral.converted_at).toLocaleDateString()}`
                            : `Created: ${new Date(referral.created_at).toLocaleDateString()}`
                          }
                        </p>
                        {referral.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleMarkAsConverted(referral.id)}
                            disabled={updateReferralMutation.isPending}
                          >
                            Mark Converted
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Referral Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bonusAmount">Bonus Amount ($)</Label>
                      <Input
                        id="bonusAmount"
                        type="number"
                        value={settings.bonus_amount}
                        onChange={(e) => queryClient.setQueryData(['referral-settings'], {
                          ...settings,
                          bonus_amount: Number(e.target.value)
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="expiryDays">Referral Expiry (days)</Label>
                      <Input
                        id="expiryDays"
                        type="number"
                        value={settings.expiry_days}
                        onChange={(e) => queryClient.setQueryData(['referral-settings'], {
                          ...settings,
                          expiry_days: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={settings.is_active}
                      onChange={(e) => queryClient.setQueryData(['referral-settings'], {
                        ...settings,
                        is_active: e.target.checked
                      })}
                      className="rounded border-input"
                    />
                    <Label htmlFor="isActive">Enable Referral Program</Label>
                  </div>
                  
                  <Button 
                    onClick={handleUpdateSettings}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? 'Updating...' : 'Update Settings'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}