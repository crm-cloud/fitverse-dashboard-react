
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Eye, Code, Send, Plus, Trash2 } from 'lucide-react';
import { WhatsAppTemplate, WhatsAppTemplateCategory, WhatsAppEventType, WhatsAppButton } from '@/types/whatsapp';

interface WhatsAppTemplateEditorProps {
  template?: WhatsAppTemplate;
  onSave: (template: WhatsAppTemplate) => void;
  onCancel: () => void;
}

const templateCategories: { value: WhatsAppTemplateCategory; label: string }[] = [
  { value: 'membership', label: 'Membership' },
  { value: 'classes', label: 'Classes' },
  { value: 'payments', label: 'Payments' },
  { value: 'appointments', label: 'Appointments' },
  { value: 'promotions', label: 'Promotions' },
  { value: 'reminders', label: 'Reminders' },
  { value: 'alerts', label: 'Alerts' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'support', label: 'Support' },
  { value: 'system', label: 'System' }
];

const eventTypes: { value: WhatsAppEventType; label: string; category: WhatsAppTemplateCategory }[] = [
  { value: 'member_welcome', label: 'Member Welcome', category: 'welcome' },
  { value: 'membership_renewal', label: 'Membership Renewal', category: 'membership' },
  { value: 'membership_expiry', label: 'Membership Expiry', category: 'membership' },
  { value: 'class_booking_confirmed', label: 'Class Booking Confirmed', category: 'classes' },
  { value: 'class_reminder', label: 'Class Reminder', category: 'reminders' },
  { value: 'payment_received', label: 'Payment Received', category: 'payments' },
  { value: 'payment_failed', label: 'Payment Failed', category: 'payments' },
  { value: 'appointment_confirmed', label: 'Appointment Confirmed', category: 'appointments' },
  { value: 'support_ticket_created', label: 'Support Ticket Created', category: 'support' },
  { value: 'special_offer', label: 'Special Offer', category: 'promotions' }
];

const availableVariables = [
  { name: 'member_name', description: 'Member\'s full name' },
  { name: 'member_phone', description: 'Member\'s phone number' },
  { name: 'branch_name', description: 'Branch name' },
  { name: 'branch_phone', description: 'Branch phone number' },
  { name: 'class_name', description: 'Class name' },
  { name: 'class_date', description: 'Class date' },
  { name: 'class_time', description: 'Class time' },
  { name: 'payment_amount', description: 'Payment amount' },
  { name: 'company_name', description: 'Company name' },
  { name: 'support_link', description: 'Support link' }
];

export function WhatsAppTemplateEditor({ template, onSave, onCancel }: WhatsAppTemplateEditorProps) {
  const [formData, setFormData] = useState<Partial<WhatsAppTemplate>>(template || {
    name: '',
    category: 'membership',
    event: 'member_welcome',
    subject: '',
    body: '',
    mediaType: 'none',
    variables: [],
    buttons: [],
    isActive: true,
    language: 'en'
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const handleBodyChange = (value: string) => {
    setFormData({ ...formData, body: value });
    setCharacterCount(value.length);
    
    // Extract variables from the message
    const variableMatches = value.match(/\{\{([^}]+)\}\}/g);
    const extractedVariables = variableMatches 
      ? variableMatches.map(match => match.replace(/[{}]/g, ''))
      : [];
    
    setFormData({ ...formData, body: value, variables: extractedVariables });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = formData.body || '';
      const newValue = currentValue.substring(0, start) + `{{${variable}}}` + currentValue.substring(end);
      handleBodyChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const addButton = () => {
    const newButton: WhatsAppButton = {
      type: 'quick_reply',
      title: '',
      payload: ''
    };
    setFormData({
      ...formData,
      buttons: [...(formData.buttons || []), newButton]
    });
  };

  const removeButton = (index: number) => {
    const updatedButtons = formData.buttons?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, buttons: updatedButtons });
  };

  const updateButton = (index: number, updatedButton: WhatsAppButton) => {
    const updatedButtons = formData.buttons?.map((button, i) => 
      i === index ? updatedButton : button
    ) || [];
    setFormData({ ...formData, buttons: updatedButtons });
  };

  const getPreviewText = () => {
    let preview = formData.body || '';
    availableVariables.forEach(variable => {
      const placeholder = `{{${variable.name}}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), `[${variable.name}]`);
    });
    return preview;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as WhatsAppTemplate);
  };

  const filteredEventTypes = eventTypes.filter(event => 
    !formData.category || event.category === formData.category
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {template ? 'Edit WhatsApp Template' : 'Create WhatsApp Template'}
        </CardTitle>
        <CardDescription>
          Create and customize WhatsApp templates for automated messaging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter template name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as WhatsAppTemplateCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event">Event Type</Label>
                  <Select
                    value={formData.event}
                    onValueChange={(value) => setFormData({ ...formData, event: value as WhatsAppEventType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredEventTypes.map(event => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter message subject"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message-body">Message Body</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={characterCount > 4096 ? 'destructive' : 'secondary'}>
                      {characterCount}/4096
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {previewMode ? 'Edit' : 'Preview'}
                    </Button>
                  </div>
                </div>
                
                {previewMode ? (
                  <div className="min-h-32 p-3 border rounded-md bg-muted">
                    <p className="text-sm whitespace-pre-wrap">{getPreviewText()}</p>
                  </div>
                ) : (
                  <Textarea
                    id="message-body"
                    value={formData.body}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    placeholder="Enter your WhatsApp message here..."
                    className="min-h-32"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Available Variables</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableVariables.map(variable => (
                    <Button
                      key={variable.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable.name)}
                      className="justify-start text-xs"
                    >
                      {variable.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type</Label>
                  <Select
                    value={formData.mediaType}
                    onValueChange={(value) => setFormData({ ...formData, mediaType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Media</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.mediaType && formData.mediaType !== 'none' && (
                  <div className="space-y-2">
                    <Label htmlFor="mediaUrl">Media URL</Label>
                    <Input
                      id="mediaUrl"
                      value={formData.mediaUrl || ''}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      placeholder="Enter media URL"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="buttons" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Action Buttons</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addButton}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Button
                  </Button>
                </div>

                {formData.buttons?.map((button, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Button {index + 1}</Label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeButton(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Button Type</Label>
                        <Select
                          value={button.type}
                          onValueChange={(value) => updateButton(index, { ...button, type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quick_reply">Quick Reply</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="phone_number">Phone Number</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Button Title</Label>
                        <Input
                          value={button.title}
                          onChange={(e) => updateButton(index, { ...button, title: e.target.value })}
                          placeholder="Enter button title"
                        />
                      </div>
                    </div>

                    {button.type === 'quick_reply' && (
                      <div className="space-y-2">
                        <Label>Payload</Label>
                        <Input
                          value={button.payload || ''}
                          onChange={(e) => updateButton(index, { ...button, payload: e.target.value })}
                          placeholder="Enter payload"
                        />
                      </div>
                    )}

                    {button.type === 'url' && (
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={button.url || ''}
                          onChange={(e) => updateButton(index, { ...button, url: e.target.value })}
                          placeholder="Enter URL"
                        />
                      </div>
                    )}

                    {button.type === 'phone_number' && (
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          value={button.phone_number || ''}
                          onChange={(e) => updateButton(index, { ...button, phone_number: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                    )}
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-8">
                    No buttons added yet. Click "Add Button" to create interactive buttons.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Active</Label>
              <p className="text-sm text-muted-foreground">Enable this template</p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Send Test
            </Button>
            <Button type="submit">
              {template ? 'Update' : 'Create'} Template
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
