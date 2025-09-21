import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  Users, 
  TrendingUp, 
  Copy, 
  Share2, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ReferralSettingsDialog } from './ReferralSettingsDialog';
import { ReferralCodeGenerator } from './ReferralCodeGenerator';
import { ReferralRewardsTable } from './ReferralRewardsTable';

export const ReferralDashboard = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Fetch referral settings
  const { data: settings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .like('key', 'referral_%');
      
      if (error) throw error;
      
      // Convert to object for easier access
      const settingsObj = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);
      
      return settingsObj;
    }
  });

  // Fetch user's referral data
  const { data: referralData } = useQuery({
    queryKey: ['my-referrals', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) return null;

      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referral_bonuses (
            id,
            amount,
            bonus_type,
            created_at,
            description
          )
        `)
        .eq('referrer_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!authState.user?.id
  });

  // Fetch user's referral code
  const { data: myReferralCode } = useQuery({
    queryKey: ['my-referral-code', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) return null;

      const { data, error } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', authState.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data?.referral_code;
    },
    enabled: !!authState.user?.id
  });

  // Generate new referral code
  const generateReferralCode = useMutation({
    mutationFn: async () => {
      if (!authState.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('generate_referral_code')
        .single();

      if (error) throw error;

      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: authState.user.id,
          referral_code: data,
          status: 'active',
          signup_bonus_amount: settings?.referral_signup_bonus || 500,
          membership_bonus_amount: settings?.referral_membership_bonus || 2500
        });

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'New referral code generated successfully!'
      });
      queryClient.invalidateQueries({ queryKey: ['my-referral-code'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate referral code',
        variant: 'destructive'
      });
    }
  });

  const copyReferralCode = () => {
    if (myReferralCode) {
      navigator.clipboard.writeText(myReferralCode);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard'
      });
    }
  };

  const shareReferralCode = () => {
    if (myReferralCode && navigator.share) {
      navigator.share({
        title: 'Join our gym with my referral code!',
        text: `Use my referral code ${myReferralCode} to get exclusive bonuses when you join!`,
        url: `${window.location.origin}?ref=${myReferralCode}`
      });
    }
  };

  // Calculate stats
  const stats = {
    totalReferrals: referralData?.length || 0,
    completedReferrals: referralData?.filter(r => r.status === 'completed').length || 0,
    totalEarnings: referralData?.reduce((sum, r) => {
      const bonuses = Array.isArray(r.referral_bonuses) ? r.referral_bonuses : [];
      return sum + bonuses.reduce((bonusSum: number, b: any) => bonusSum + (b.amount || 0), 0);
    }, 0) || 0,
    pendingReferrals: referralData?.filter(r => r.status === 'pending').length || 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
          <p className="text-muted-foreground mt-2">
            Refer friends and earn rewards for every successful signup and membership
          </p>
        </div>
        <Button onClick={() => setSettingsOpen(true)} variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              All time referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Successful referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Earned through referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting completion
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rewards">Rewards History</TabsTrigger>
          <TabsTrigger value="generate">Generate Code</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Referral Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Your Referral Code
              </CardTitle>
              <CardDescription>
                Share this code with friends to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myReferralCode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 px-4 py-2 rounded-lg font-mono text-lg font-bold">
                      {myReferralCode}
                    </div>
                    <Button size="sm" variant="outline" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    {navigator.share && (
                      <Button size="sm" variant="outline" onClick={shareReferralCode}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Rewards per referral:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Signup bonus: {formatCurrency(settings?.referral_signup_bonus || 500)}</li>
                      <li>Membership bonus: {formatCurrency(settings?.referral_membership_bonus || 2500)}</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have a referral code yet</p>
                  <Button onClick={() => generateReferralCode.mutate()}>
                    Generate Referral Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>Your latest referral activity</CardDescription>
            </CardHeader>
            <CardContent>
              {referralData && referralData.length > 0 ? (
                <div className="space-y-4">
                  {referralData.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{referral.referred_email || 'Email not provided'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                        {referral.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No referrals yet. Start sharing your code!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <ReferralRewardsTable userId={authState.user?.id} />
        </TabsContent>

        <TabsContent value="generate">
          <ReferralCodeGenerator 
            onCodeGenerated={() => queryClient.invalidateQueries({ queryKey: ['my-referral-code'] })}
          />
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <ReferralSettingsDialog 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
};