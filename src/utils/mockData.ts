// Comprehensive mock data exports to replace all deleted mock files
export const mockProgressSummary: any = {};
export const mockMemberGoals: any[] = [];
export const mockFeedback: any[] = [];
export const mockAIInsights: any[] = [];
export const mockDietPlans: any[] = [];
export const mockWorkoutPlans: any[] = [];
export const mockPlanAssignments: any[] = [];
export const mockTransactionCategories: any[] = [];
export const mockPaymentMethods: any[] = [];
export const mockMembershipPlans: any[] = [];
export const mockLockers: any[] = [];
export const mockLockerSizes: any[] = [];
export const mockMeasurementHistory: any[] = [];
export const mockAttendanceRecords: any[] = [];
export const mockProducts: any[] = [];
export const mockTeamMembers: any[] = [];
export const mockTrainerAssignments: any[] = [];
export const mockTrainerUtilization: any[] = [];
export const mockLeads: any[] = [];
export const mockTransactions: any[] = [];
export const mockMonthlyData: any[] = [];
export const mockEnhancedTrainers: any[] = [];
export const mockClasses: any[] = [];
// Temporary mockInvoices for backward compatibility - other components will be updated later
export const mockInvoices: any[] = [];
export const mockBranches: any[] = [];
export const mockTrainers: any[] = [];
export const mockTeamRoles: any[] = [];
export const mockPermissions: any[] = [];
export const mockMembershipData: any = {};
export const mockBillingHistory: any[] = [];
export const mockBenefits: any[] = [];
export const mockMembers: any[] = [];
export const mockCategories: any[] = [];
export const accessTypeLabels: any = {};
export const feedbackCategories: any[] = [];
export const leadSources: any[] = [];
export const lockerStatuses: any[] = [];
export const classTagLabels: any = {};

// Mock attendance data  
export const mockAttendanceSummary: any = {};
export const mockAttendanceData: any[] = [];

// Add missing exports to mockData
export const mockMembershipAssignments: any[] = [];
export const mockOrders: any[] = [];
export const mockClassEnrollments: any[] = [];
export const mockMemberships: any[] = [];
export const mockPaymentHistory: any[] = [];
export const mockFinanceCategories: any[] = [];
export const mockFinancialSummary: any = {};

export const generateMockAttendanceRecords = (count: number) => [];

// Team Member types and utilities
export enum TeamMemberRole {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  TRAINER = 'trainer',
  RECEPTIONIST = 'receptionist',
  CLEANER = 'cleaner',
  MAINTENANCE = 'maintenance'
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamMemberRole;
  department?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  branchName: string;
  branchId: string;
  createdAt: Date;
  lastLogin?: Date;
}

export const getTeamMemberByEmail = (email: string): TeamMember | undefined => {
  return mockTeamMembers.find(member => member.email === email);
};

export const enhancedTrainers = mockEnhancedTrainers;

// Export enums and types
export enum FeedbackType {
  GENERAL = 'general',
  TRAINER = 'trainer',
  EQUIPMENT = 'equipment',
  FACILITY = 'facility',
  CLASS = 'class'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  LOST = 'lost'
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social-media',
  WALK_IN = 'walk-in',
  ADVERTISEMENT = 'advertisement'
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum LockerStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  OUT_OF_ORDER = 'out-of-order'
}

export interface LockerSize {
  id: string;
  name: string;
  dimensions: string;
  monthlyFee: number;
}

// Add missing mock exports
export const mockFeedbackStats: any = {};
export const mockLeadStats: any = {};
export const mockLockerSummary: any = {};
export const mockLockerAssignments: any[] = [];
export const mockPayments: any[] = [];

// Add more exports as needed for remaining components
export const placeholderData = 'Replace with actual database queries';