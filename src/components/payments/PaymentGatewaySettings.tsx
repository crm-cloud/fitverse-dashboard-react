import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Settings, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { PaymentGateway, PaymentGatewayType } from '@/types/payment';

interface PaymentGatewaySettingsProps {
  gateways: PaymentGateway[];
  onUpdateGateway: (gateway: PaymentGateway) => void;
  onTestConnection: (gatewayId: string) => Promise<boolean>;
}

export function PaymentGatewaySettings({ 
  gateways, 
  onUpdateGateway, 
  onTestConnection 
}: PaymentGatewaySettingsProps) {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingGateway, setTestingGateway] = useState<string | null>(null);

  const toggleSecretVisibility = (gatewayId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  const handleTestConnection = async (gateway: PaymentGateway) => {
    if (!gateway.apiKey || !gateway.apiSecret) {
      toast({
        title: "Missing Configuration",
        description: "Please configure API keys before testing connection.",
        variant: "destructive"
      });
      return;
    }

    setTestingGateway(gateway.id);
    try {
      const success = await onTestConnection(gateway.id);
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? `${gateway.name} is configured correctly.`
          : `Unable to connect to ${gateway.name}. Please check your credentials.`,
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "An error occurred while testing the connection.",
        variant: "destructive"
      });
    } finally {
      setTestingGateway(null);
    }
  };

  const handleFieldUpdate = (gateway: PaymentGateway, field: keyof PaymentGateway, value: any) => {
    onUpdateGateway({
      ...gateway,
      [field]: value,
      updatedAt: new Date()
    });
  };

  const getGatewayConfig = (type: PaymentGatewayType) => {
    switch (type) {
      case 'razorpay':
        return {
          fields: [
            { key: 'apiKey', label: 'Key ID', placeholder: 'rzp_test_...' },
            { key: 'apiSecret', label: 'Key Secret', placeholder: 'Your key secret', secret: true },
            { key: 'webhookSecret', label: 'Webhook Secret', placeholder: 'Webhook secret', secret: true }
          ],
          docs: 'https://razorpay.com/docs/',
          testUrl: 'https://dashboard.razorpay.com/'
        };
      case 'payu':
        return {
          fields: [
            { key: 'merchantId', label: 'Merchant ID', placeholder: 'Your merchant ID' },
            { key: 'apiKey', label: 'Merchant Key', placeholder: 'Your merchant key' },
            { key: 'apiSecret', label: 'Salt', placeholder: 'Your salt key', secret: true }
          ],
          docs: 'https://docs.payu.in/',
          testUrl: 'https://test.payu.in/'
        };
      case 'phonepe':
        return {
          fields: [
            { key: 'merchantId', label: 'Merchant ID', placeholder: 'Your merchant ID' },
            { key: 'apiKey', label: 'Salt Key', placeholder: 'Your salt key', secret: true },
            { key: 'apiSecret', label: 'Salt Index', placeholder: 'Salt index' }
          ],
          docs: 'https://developer.phonepe.com/',
          testUrl: 'https://mercury-t2.phonepe.com/'
        };
      case 'ccavenue':
        return {
          fields: [
            { key: 'merchantId', label: 'Merchant ID', placeholder: 'Your merchant ID' },
            { key: 'apiKey', label: 'Access Code', placeholder: 'Your access code' },
            { key: 'apiSecret', label: 'Working Key', placeholder: 'Your working key', secret: true }
          ],
          docs: 'https://www.ccavenue.com/developers/',
          testUrl: 'https://test.ccavenue.com/'
        };
      default:
        return { fields: [], docs: '', testUrl: '' };
    }
  };

  const renderGatewayCard = (gateway: PaymentGateway) => {
    const config = getGatewayConfig(gateway.type);
    const isConfigured = gateway.apiKey && gateway.apiSecret;
    
    return (
      <Card key={gateway.id} className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{gateway.name}</CardTitle>
                <CardDescription>
                  {gateway.environment === 'sandbox' ? 'Test Environment' : 'Live Environment'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConfigured ? "default" : "secondary"}>
                {isConfigured ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configured
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Configured
                  </>
                )}
              </Badge>
              <Switch
                checked={gateway.isActive}
                onCheckedChange={(checked) => handleFieldUpdate(gateway, 'isActive', checked)}
                disabled={!isConfigured}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isConfigured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configure your API credentials to enable this payment gateway.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4">
            {config.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={`${gateway.id}-${field.key}`}>
                  {field.label}
                </Label>
                <div className="relative">
                  <Input
                    id={`${gateway.id}-${field.key}`}
                    type={field.secret && !showSecrets[`${gateway.id}-${field.key}`] ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    value={(gateway as any)[field.key] || ''}
                    onChange={(e) => handleFieldUpdate(gateway, field.key as keyof PaymentGateway, e.target.value)}
                  />
                  {field.secret && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility(`${gateway.id}-${field.key}`)}
                    >
                      {showSecrets[`${gateway.id}-${field.key}`] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestConnection(gateway)}
                disabled={!isConfigured || testingGateway === gateway.id}
              >
                {testingGateway === gateway.id ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(config.docs, '_blank')}
              >
                Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const sandboxGateways = gateways.filter(g => g.environment === 'sandbox');
  const liveGateways = gateways.filter(g => g.environment === 'live');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Gateway Settings</h2>
          <p className="text-muted-foreground">
            Configure your payment gateways for processing transactions
          </p>
        </div>
      </div>

      <Tabs defaultValue="sandbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sandbox">Sandbox/Test</TabsTrigger>
          <TabsTrigger value="live">Live/Production</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sandbox" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sandbox mode is for testing payments. No real money will be charged.
            </AlertDescription>
          </Alert>
          <div className="grid gap-6">
            {sandboxGateways.map(renderGatewayCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="live" className="space-y-6">
          <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Live mode processes real payments. Ensure all credentials are correct before enabling.
            </AlertDescription>
          </Alert>
          <div className="grid gap-6">
            {liveGateways.map(renderGatewayCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}