export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'staff' | 'manager' | 'trainer';
  branchId: string;
  branchName: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  department?: string;
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@gymfit.com',
    phone: '+1 (555) 123-4567',
    role: 'manager',
    branchId: '1',
    branchName: 'Downtown Fitness Center',
    status: 'active',
    createdAt: new Date('2023-01-15'),
    lastLogin: new Date('2024-01-15'),
    department: 'Operations'
  },
  {
    id: 'tm_002',
    name: 'Mike Rodriguez',
    email: 'mike.rodriguez@gymfit.com',
    phone: '+1 (555) 234-5678',
    role: 'trainer',
    branchId: '1',
    branchName: 'Downtown Fitness Center',
    status: 'active',
    createdAt: new Date('2023-03-20'),
    lastLogin: new Date('2024-01-14'),
    department: 'Personal Training'
  },
  {
    id: 'tm_003',
    name: 'Emily Chen',
    email: 'emily.chen@gymfit.com',
    phone: '+1 (555) 345-6789',
    role: 'staff',
    branchId: '2',
    branchName: 'Westside Athletic Club',
    status: 'active',
    createdAt: new Date('2023-05-10'),
    lastLogin: new Date('2024-01-13'),
    department: 'Customer Service'
  },
  {
    id: 'tm_004',
    name: 'David Wilson',
    email: 'david.wilson@gymfit.com',
    phone: '+1 (555) 456-7890',
    role: 'trainer',
    branchId: '2',
    branchName: 'Westside Athletic Club',
    status: 'active',
    createdAt: new Date('2023-07-25'),
    lastLogin: new Date('2024-01-12'),
    department: 'Group Fitness'
  },
  {
    id: 'tm_005',
    name: 'Lisa Park',
    email: 'lisa.park@gymfit.com',
    phone: '+1 (555) 567-8901',
    role: 'staff',
    branchId: '1',
    branchName: 'Downtown Fitness Center',
    status: 'inactive',
    createdAt: new Date('2023-02-28'),
    lastLogin: new Date('2023-12-20'),
    department: 'Reception'
  },
  {
    id: 'tm_006',
    name: 'James Thompson',
    email: 'james.thompson@gymfit.com',
    phone: '+1 (555) 678-9012',
    role: 'manager',
    branchId: '2',
    branchName: 'Westside Athletic Club',
    status: 'active',
    createdAt: new Date('2023-04-15'),
    lastLogin: new Date('2024-01-15'),
    department: 'Operations'
  },
  {
    id: 'tm_007',
    name: 'Maria Garcia',
    email: 'maria.garcia@gymfit.com',
    phone: '+1 (555) 789-0123',
    role: 'trainer',
    branchId: '2',
    branchName: 'Westside Athletic Club',
    status: 'active',
    createdAt: new Date('2023-06-08'),
    lastLogin: new Date('2024-01-11'),
    department: 'Strength Training'
  },
  {
    id: 'tm_008',
    name: 'Robert Kim',
    email: 'robert.kim@gymfit.com',
    phone: '+1 (555) 890-1234',
    role: 'staff',
    branchId: '1',
    branchName: 'Downtown Fitness Center',
    status: 'active',
    createdAt: new Date('2023-08-12'),
    lastLogin: new Date('2024-01-10'),
    department: 'Maintenance'
  }
];

export const getTeamMembersByBranch = (branchId: string): TeamMember[] => {
  return mockTeamMembers.filter(member => member.branchId === branchId);
};

export const getTeamMemberByEmail = (email: string): TeamMember | undefined => {
  return mockTeamMembers.find(member => member.email === email);
};