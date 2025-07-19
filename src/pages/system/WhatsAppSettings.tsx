
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, MessageCircle, BarChart3 } from 'lucide-react';
import { WhatsAppProviderConfig } from '@/components/whatsapp/WhatsAppProviderConfig';
import { WhatsAppTemplateEditor } from '@/components/whatsapp/WhatsAppTemplateEditor';
import { WhatsAppProvider, WhatsAppTemplate } from '@/types/whatsapp';

export default function WhatsAppSettings() {
  const [activeTab, setActiveTab] = useState('providers');
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<WhatsAppProvider | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | undefined>();

  // Mock data - in real app, this would come from an API
  const [providers, setProviders] = useState<WhatsAppProvider[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);

  const handleSaveProvider = (provider: WhatsAppProvider) => {
    if (selectedProvider) {
      setProviders(providers.map(p => p.id === provider.id ? provider : p));
    } else {
      setProviders([...providers, { ...provider, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }]);
    }
    setShowProviderForm(false);
    setSelectedProvider(undefined);
  };

  const handleSaveTemplate = (template: WhatsAppTemplate) => {
    if (selectedTemplate) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([...templates, { 
        ...template, 
        id: Date.now().toString(), 
        createdAt: new Date(), 
        updatedAt: new Date(),
        createdBy: 'current-user'
      }]);
    }
    setShowTemplateForm(false);
    setSelectedTemplate(undefined);
  };

  const handleEditProvider = (provider: WhatsAppProvider) => {
    setSelectedProvider(provider);
    setShowProviderForm(true);
  };

  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateForm(true);
  };

  if (showProviderForm) {
    return (
      <div className="space-y-6">
        <WhatsAppProviderConfig
          provider={selectedProvider}
          onSave={handleSaveProvider}
          onCancel={() => {
            setShowProviderForm(false);
            setSelectedProvider(undefined);
          }}
        />
      </div>
    );
  }

  if (showTemplateForm) {
    return (
      <div className="space-y-6">
        <WhatsAppTemplateEditor
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setShowTemplateForm(false);
            setSelectedTemplate(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Settings</h1>
          <p className="text-muted-foreground">
            Configure WhatsApp providers, templates, and messaging settings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">WhatsApp Providers</h2>
            <Button onClick={() => setShowProviderForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </div>

          {providers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No WhatsApp Providers</h3>
                <p className="text-muted-foreground mb-4">
                  Add a WhatsApp provider to start sending messages
                </p>
                <Button onClick={() => setShowProviderForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {providers.map((provider) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {provider.name}
                          <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                            {provider.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {provider.type.replace('-', ' ').toUpperCase()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProvider(provider)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Rate Limits: {provider.rateLimit.perMinute}/min, {provider.rateLimit.perHour}/hour, {provider.rateLimit.perDay}/day
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Message Templates</h2>
            <Button onClick={() => setShowTemplateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Templates Created</h3>
                <p className="text-muted-foreground mb-4">
                  Create message templates for automated WhatsApp communication
                </p>
                <Button onClick={() => setShowTemplateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {template.name}
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {template.category}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {template.subject}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.body}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general WhatsApp messaging settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Settings panel will be implemented in the next phase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                WhatsApp Analytics
              </CardTitle>
              <CardDescription>
                View messaging statistics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analytics dashboard will be implemented in the next phase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
