
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Settings, TestTube } from 'lucide-react';
import { WhatsAppProvider } from '@/types/whatsapp';

interface WhatsAppProviderConfigProps {
  provider?: WhatsAppProvider;
  onSave: (provider: WhatsAppProvider) => void;
  onCancel: () => void;
}

export function WhatsAppProviderConfig({ provider, onSave, onCancel }: WhatsAppProviderConfigProps) {
  const [formData, setFormData] = useState<Partial<WhatsAppProvider>>(provider || {
    name: '',
    type: 'whatsapp-business-api',
    isActive: true,
    config: {},
    rateLimit: {
      perMinute: 5,
      perHour: 100,
      perDay: 1000
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as WhatsAppProvider);
  };

  const renderProviderConfig = () => {
    switch (formData.type) {
      case 'whatsapp-business-api':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input
                id="phoneNumberId"
                value={formData.config?.phoneNumberId || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, phoneNumberId: e.target.value }
                })}
                placeholder="Enter WhatsApp Business Phone Number ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={formData.config?.accessToken || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, accessToken: e.target.value }
                })}
                placeholder="Enter WhatsApp Business API Access Token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
              <Input
                id="webhookVerifyToken"
                value={formData.config?.webhookVerifyToken || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, webhookVerifyToken: e.target.value }
                })}
                placeholder="Enter Webhook Verify Token"
              />
            </div>
          </div>
        );

      case 'twilio-whatsapp':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountSid">Account SID</Label>
              <Input
                id="accountSid"
                value={formData.config?.accountSid || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, accountSid: e.target.value }
                })}
                placeholder="Enter Twilio Account SID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authToken">Auth Token</Label>
              <Input
                id="authToken"
                type="password"
                value={formData.config?.authToken || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, authToken: e.target.value }
                })}
                placeholder="Enter Twilio Auth Token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromNumber">WhatsApp Number</Label>
              <Input
                id="fromNumber"
                value={formData.config?.fromNumber || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, fromNumber: e.target.value }
                })}
                placeholder="whatsapp:+1234567890"
              />
            </div>
          </div>
        );

      case 'meta-whatsapp':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appId">App ID</Label>
              <Input
                id="appId"
                value={formData.config?.appId || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, appId: e.target.value }
                })}
                placeholder="Enter Meta App ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appSecret">App Secret</Label>
              <Input
                id="appSecret"
                type="password"
                value={formData.config?.appSecret || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, appSecret: e.target.value }
                })}
                placeholder="Enter Meta App Secret"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageAccessToken">Page Access Token</Label>
              <Input
                id="pageAccessToken"
                type="password"
                value={formData.config?.pageAccessToken || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, pageAccessToken: e.target.value }
                })}
                placeholder="Enter Page Access Token"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {provider ? 'Edit WhatsApp Provider' : 'Add WhatsApp Provider'}
        </CardTitle>
        <CardDescription>
          Configure WhatsApp provider settings and authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="limits">Rate Limits</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Provider Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter provider name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Provider Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp-business-api">WhatsApp Business API</SelectItem>
                      <SelectItem value="twilio-whatsapp">Twilio WhatsApp</SelectItem>
                      <SelectItem value="meta-whatsapp">Meta WhatsApp</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-muted-foreground">Enable this provider</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <Separator />

              {renderProviderConfig()}
            </TabsContent>

            <TabsContent value="limits" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="perMinute">Per Minute</Label>
                  <Input
                    id="perMinute"
                    type="number"
                    value={formData.rateLimit?.perMinute || 5}
                    onChange={(e) => setFormData({
                      ...formData,
                      rateLimit: { ...formData.rateLimit!, perMinute: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perHour">Per Hour</Label>
                  <Input
                    id="perHour"
                    type="number"
                    value={formData.rateLimit?.perHour || 100}
                    onChange={(e) => setFormData({
                      ...formData,
                      rateLimit: { ...formData.rateLimit!, perHour: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perDay">Per Day</Label>
                  <Input
                    id="perDay"
                    type="number"
                    value={formData.rateLimit?.perDay || 1000}
                    onChange={(e) => setFormData({
                      ...formData,
                      rateLimit: { ...formData.rateLimit!, perDay: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="10000"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-6">
              <div className="text-center py-8">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Test WhatsApp Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Send a test message to verify your configuration
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <Input placeholder="Enter phone number (with country code)" />
                  <Button type="button" variant="outline" className="w-full">
                    Send Test Message
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {provider ? 'Update' : 'Create'} Provider
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
