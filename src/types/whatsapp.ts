
export interface WhatsAppProvider {
  id: string;
  name: string;
  type: 'whatsapp-business-api' | 'twilio-whatsapp' | 'meta-whatsapp' | 'custom';
  isActive: boolean;
  config: WhatsAppProviderConfig;
  rateLimit: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppProviderConfig {
  // WhatsApp Business API
  phoneNumberId?: string;
  accessToken?: string;
  webhookVerifyToken?: string;
  
  // Twilio WhatsApp
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  
  // Meta WhatsApp
  appId?: string;
  appSecret?: string;
  pageAccessToken?: string;
  
  // Custom
  apiUrl?: string;
  headers?: Record<string, string>;
  method?: 'POST' | 'GET' | 'PUT';
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: WhatsAppTemplateCategory;
  event: WhatsAppEventType;
  subject: string;
  body: string;
  mediaType?: 'none' | 'image' | 'document' | 'video';
  mediaUrl?: string;
  variables: string[];
  buttons?: WhatsAppButton[];
  isActive: boolean;
  language: string;
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type WhatsAppTemplateCategory = 
  | 'membership'
  | 'classes'
  | 'payments'
  | 'appointments'
  | 'promotions'
  | 'reminders'
  | 'alerts'
  | 'welcome'
  | 'support'
  | 'system';

export type WhatsAppEventType =
  // Membership
  | 'member_welcome'
  | 'membership_renewal'
  | 'membership_expiry'
  | 'membership_suspended'
  | 'membership_cancelled'
  
  // Classes
  | 'class_booking_confirmed'
  | 'class_booking_cancelled'
  | 'class_reminder'
  | 'class_cancelled'
  | 'class_rescheduled'
  | 'waitlist_available'
  
  // Payments
  | 'payment_received'
  | 'payment_failed'
  | 'payment_overdue'
  | 'payment_reminder'
  | 'refund_processed'
  
  // Appointments
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  
  // Promotions
  | 'promotion_code'
  | 'special_offer'
  | 'birthday_offer'
  | 'referral_reward'
  
  // Support
  | 'support_ticket_created'
  | 'support_ticket_resolved'
  | 'feedback_request'
  
  // System
  | 'account_created'
  | 'password_reset'
  | 'security_alert'
  | 'system_maintenance';

export interface WhatsAppButton {
  type: 'quick_reply' | 'url' | 'phone_number';
  title: string;
  payload?: string;
  url?: string;
  phone_number?: string;
}

export interface WhatsAppSettings {
  id: string;
  branchId?: string;
  isEnabled: boolean;
  defaultProvider: string;
  fallbackProvider?: string;
  rateLimiting: {
    enabled: boolean;
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
  scheduling: {
    enabled: boolean;
    allowedHours: {
      start: string;
      end: string;
    };
    timezone: string;
    blackoutDates: string[];
  };
  businessHours: {
    enabled: boolean;
    autoResponse: boolean;
    autoResponseMessage: string;
    hours: Array<{
      day: string;
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    }>;
  };
  notifications: {
    deliveryReports: boolean;
    readReceipts: boolean;
    failureAlerts: boolean;
    quotaWarnings: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessage {
  id: string;
  messageId: string;
  branchId?: string;
  recipientId: string;
  recipientPhone: string;
  recipientName?: string;
  templateId?: string;
  subject: string;
  body: string;
  mediaType?: 'none' | 'image' | 'document' | 'video';
  mediaUrl?: string;
  provider: string;
  status: WhatsAppStatus;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  cost?: number;
  direction: 'outbound' | 'inbound';
  conversationId?: string;
  metadata: Record<string, any>;
}

export type WhatsAppStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'rejected'
  | 'cancelled';

export interface WhatsAppConversation {
  id: string;
  branchId?: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: number;
  status: 'active' | 'resolved' | 'pending';
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppVariables {
  // Member variables
  member_name: string;
  member_email: string;
  member_phone: string;
  member_id: string;
  membership_type: string;
  membership_expiry: string;
  
  // Branch variables
  branch_name: string;
  branch_address: string;
  branch_phone: string;
  branch_email: string;
  
  // Class variables
  class_name: string;
  class_date: string;
  class_time: string;
  class_instructor: string;
  class_location: string;
  
  // Payment variables
  payment_amount: string;
  payment_date: string;
  payment_method: string;
  invoice_number: string;
  
  // System variables
  company_name: string;
  current_date: string;
  current_time: string;
  support_link: string;
}

export interface WhatsAppAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  averageResponseTime: number;
  activeConversations: number;
  resolvedConversations: number;
  averageCost: number;
  topProviders: Array<{
    provider: string;
    count: number;
    successRate: number;
  }>;
  topTemplates: Array<{
    templateId: string;
    name: string;
    count: number;
    successRate: number;
  }>;
  conversationMetrics: {
    totalConversations: number;
    averageMessagesPerConversation: number;
    averageResolutionTime: number;
  };
  volumeByDay: Array<{
    date: string;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
}
