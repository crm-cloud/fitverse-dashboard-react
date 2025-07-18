
import { Lead, LeadStats, Note, Task } from '@/types/lead';

export const mockNotes: Note[] = [
  {
    id: 'note1',
    leadId: 'lead1',
    content: 'Initial contact made. Very interested in personal training.',
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: 'note2',
    leadId: 'lead1',
    content: 'Scheduled gym tour for this Friday at 2 PM.',
    createdBy: 'staff@gymfit.com',
    createdAt: new Date('2024-01-16T14:30:00Z')
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task1',
    leadId: 'lead1',
    title: 'Schedule gym tour',
    description: 'Show facilities and discuss membership options',
    assignedTo: 'staff@gymfit.com',
    dueDate: new Date('2024-01-20T14:00:00Z'),
    completed: false,
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    priority: 'high',
    type: 'meeting'
  },
  {
    id: 'task2',
    leadId: 'lead2',
    title: 'Follow up call',
    description: 'Check interest level and answer questions',
    assignedTo: 'trainer@gymfit.com',
    dueDate: new Date('2024-01-19T09:00:00Z'),
    completed: true,
    createdBy: 'admin@gymfit.com',
    createdAt: new Date('2024-01-14T15:00:00Z'),
    completedAt: new Date('2024-01-19T09:15:00Z'),
    priority: 'medium',
    type: 'call'
  }
];

export const mockLeads: Lead[] = [
  {
    id: 'lead1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    status: 'qualified',
    source: 'website',
    priority: 'high',
    interestedPrograms: ['Personal Training', 'Weight Loss'],
    message: 'I want to lose 20 pounds and get in shape for my wedding.',
    assignedTo: 'trainer@gymfit.com',
    createdAt: new Date('2024-01-15T09:30:00Z'),
    updatedAt: new Date('2024-01-16T14:30:00Z'),
    lastContactDate: new Date('2024-01-16T14:30:00Z'),
    nextFollowUpDate: new Date('2024-01-20T14:00:00Z'),
    notes: mockNotes.filter(note => note.leadId === 'lead1'),
    tasks: mockTasks.filter(task => task.leadId === 'lead1'),
    estimatedValue: 1500,
    tags: ['wedding', 'weight-loss', 'motivated']
  },
  {
    id: 'lead2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    status: 'new',
    source: 'referral',
    priority: 'medium',
    interestedPrograms: ['Group Classes', 'Yoga'],
    message: 'My friend recommended your yoga classes.',
    referredBy: 'member@gymfit.com',
    createdAt: new Date('2024-01-16T11:00:00Z'),
    updatedAt: new Date('2024-01-16T11:00:00Z'),
    notes: [],
    tasks: mockTasks.filter(task => task.leadId === 'lead2'),
    estimatedValue: 800,
    tags: ['referral', 'yoga', 'friend-recommended']
  },
  {
    id: 'lead3',
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike.davis@email.com',
    phone: '+1 (555) 345-6789',
    status: 'contacted',
    source: 'social',
    priority: 'medium',
    interestedPrograms: ['Strength Training'],
    message: 'Saw your Instagram posts about strength training programs.',
    assignedTo: 'trainer@gymfit.com',
    createdAt: new Date('2024-01-14T16:45:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    lastContactDate: new Date('2024-01-15T10:00:00Z'),
    nextFollowUpDate: new Date('2024-01-18T15:00:00Z'),
    notes: [],
    tasks: [],
    estimatedValue: 1200,
    tags: ['instagram', 'strength-training', 'social-media']
  },
  {
    id: 'lead4',
    firstName: 'Lisa',
    lastName: 'Chen',
    email: 'lisa.chen@email.com',
    phone: '+1 (555) 456-7890',
    status: 'converted',
    source: 'walk-in',
    priority: 'high',
    interestedPrograms: ['Full Membership', 'Personal Training'],
    assignedTo: 'staff@gymfit.com',
    createdAt: new Date('2024-01-10T14:00:00Z'),
    updatedAt: new Date('2024-01-12T16:00:00Z'),
    lastContactDate: new Date('2024-01-12T16:00:00Z'),
    conversionDate: new Date('2024-01-12T16:00:00Z'),
    notes: [],
    tasks: [],
    estimatedValue: 2000,
    tags: ['walk-in', 'converted', 'premium-member']
  },
  {
    id: 'lead5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 (555) 567-8901',
    status: 'lost',
    source: 'phone',
    priority: 'low',
    interestedPrograms: ['Basic Membership'],
    assignedTo: 'staff@gymfit.com',
    createdAt: new Date('2024-01-08T09:00:00Z'),
    updatedAt: new Date('2024-01-13T17:00:00Z'),
    lastContactDate: new Date('2024-01-13T17:00:00Z'),
    notes: [],
    tasks: [],
    estimatedValue: 500,
    tags: ['price-sensitive', 'not-ready']
  }
];

export const mockLeadStats: LeadStats = {
  totalLeads: 45,
  newLeads: 12,
  qualifiedLeads: 15,
  convertedLeads: 8,
  conversionRate: 17.8,
  averageResponseTime: 2.5, // hours
  leadsThisMonth: 23,
  leadsLastMonth: 18
};
