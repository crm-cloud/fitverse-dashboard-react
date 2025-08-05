import { AttendanceRecord, BiometricDevice, WorkShift, AttendanceSummary, AttendanceSettings } from '@/types/attendance';

// Mock biometric devices
export const mockBiometricDevices: BiometricDevice[] = [
  {
    id: 'device-001',
    name: 'Main Entrance Scanner',
    model: 'Hikvision DS-K1T341A',
    ipAddress: '192.168.1.100',
    location: 'Main Entrance',
    branchId: 'branch-001',
    branchName: 'Downtown Branch',
    status: 'online',
    lastSync: new Date('2024-01-15T10:30:00'),
    totalRecords: 1250,
    isActive: true,
    settings: {
      syncInterval: 15,
      autoApproval: true,
      requirePhoto: false,
      workingHours: {
        start: '06:00',
        end: '23:00'
      }
    }
  },
  {
    id: 'device-002',
    name: 'Staff Room Scanner',
    model: 'Hikvision DS-K1T341A',
    ipAddress: '192.168.1.101',
    location: 'Staff Room',
    branchId: 'branch-001',
    branchName: 'Downtown Branch',
    status: 'online',
    lastSync: new Date('2024-01-15T10:25:00'),
    totalRecords: 890,
    isActive: true,
    settings: {
      syncInterval: 10,
      autoApproval: true,
      requirePhoto: true,
      workingHours: {
        start: '05:30',
        end: '23:30'
      }
    }
  },
  {
    id: 'device-003',
    name: 'Secondary Entrance',
    model: 'Hikvision DS-K1T341A',
    ipAddress: '192.168.2.100',
    location: 'Side Entrance',
    branchId: 'branch-002',
    branchName: 'Westside Branch',
    status: 'maintenance',
    lastSync: new Date('2024-01-14T18:45:00'),
    totalRecords: 756,
    isActive: false,
    settings: {
      syncInterval: 20,
      autoApproval: false,
      requirePhoto: true,
      workingHours: {
        start: '06:00',
        end: '22:00'
      }
    }
  }
];

// Mock work shifts
export const mockWorkShifts: WorkShift[] = [
  {
    id: 'shift-001',
    name: 'Morning Shift',
    startTime: '06:00',
    endTime: '14:00',
    branchId: 'branch-001',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    userIds: ['user-001', 'user-002', 'user-003'],
    isActive: true,
    gracePeriod: 15,
    lateThreshold: 30,
    breakDuration: 60,
    minimumHours: 7,
    maximumHours: 9
  },
  {
    id: 'shift-002',
    name: 'Evening Shift',
    startTime: '14:00',
    endTime: '22:00',
    branchId: 'branch-001',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    userIds: ['user-004', 'user-005', 'user-006'],
    isActive: true,
    gracePeriod: 10,
    lateThreshold: 20,
    breakDuration: 45,
    minimumHours: 7,
    maximumHours: 9
  },
  {
    id: 'shift-003',
    name: 'Weekend Shift',
    startTime: '08:00',
    endTime: '18:00',
    branchId: 'branch-001',
    days: ['Saturday', 'Sunday'],
    userIds: ['user-007', 'user-008'],
    isActive: true,
    gracePeriod: 20,
    lateThreshold: 40,
    breakDuration: 90,
    minimumHours: 8,
    maximumHours: 10
  }
];

// Mock attendance records
export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-001',
    userId: 'member-001',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@email.com',
    userRole: 'member',
    branchId: 'branch-001',
    branchName: 'Downtown Branch',
    checkInTime: new Date('2024-01-15T07:30:00'),
    checkOutTime: new Date('2024-01-15T09:45:00'),
    entryMethod: 'biometric',
    deviceId: 'device-001',
    deviceLocation: 'Main Entrance',
    status: 'checked-out',
    notes: 'Regular workout session',
    duration: 135,
    isLate: false,
    membershipId: 'membership-001',
    createdAt: new Date('2024-01-15T07:30:00'),
    updatedAt: new Date('2024-01-15T09:45:00')
  },
  {
    id: 'att-002',
    userId: 'trainer-001',
    userName: 'Mike Rodriguez',
    userEmail: 'mike.rodriguez@gymfit.com',
    userRole: 'trainer',
    branchId: 'branch-001',
    branchName: 'Downtown Branch',
    checkInTime: new Date('2024-01-15T06:00:00'),
    checkOutTime: new Date('2024-01-15T14:30:00'),
    entryMethod: 'biometric',
    deviceId: 'device-002',
    deviceLocation: 'Staff Room',
    status: 'checked-out',
    duration: 510,
    isLate: false,
    workShift: {
      id: 'shift-001',
      name: 'Morning Shift',
      startTime: '06:00',
      endTime: '14:00'
    },
    createdAt: new Date('2024-01-15T06:00:00'),
    updatedAt: new Date('2024-01-15T14:30:00')
  },
  {
    id: 'att-003',
    userId: 'staff-001',
    userName: 'Lisa Chen',
    userEmail: 'lisa.chen@gymfit.com',
    userRole: 'staff',
    branchId: 'branch-001',
    branchName: 'Downtown Branch',
    checkInTime: new Date('2024-01-15T06:20:00'),
    entryMethod: 'card',
    deviceId: 'device-001',
    deviceLocation: 'Main Entrance',
    status: 'checked-in',
    duration: 0,
    isLate: true,
    expectedCheckIn: new Date('2024-01-15T06:00:00'),
    workShift: {
      id: 'shift-001',
      name: 'Morning Shift',
      startTime: '06:00',
      endTime: '14:00'
    },
    notes: 'Late due to traffic',
    createdAt: new Date('2024-01-15T06:20:00'),
    updatedAt: new Date('2024-01-15T06:20:00')
  },
  {
    id: 'att-004',
    userId: 'member-002',
    userName: 'David Wilson',
    userEmail: 'david.wilson@email.com',
    userRole: 'member',
    branchId: 'branch-001',
    branchName: 'Downtown Branch',
    checkInTime: new Date('2024-01-15T18:00:00'),
    checkOutTime: new Date('2024-01-15T19:30:00'),
    entryMethod: 'mobile',
    status: 'checked-out',
    duration: 90,
    isLate: false,
    classId: 'class-001',
    className: 'Evening Yoga',
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    membershipId: 'membership-002',
    createdAt: new Date('2024-01-15T18:00:00'),
    updatedAt: new Date('2024-01-15T19:30:00')
  },
  {
    id: 'att-005',
    userId: 'member-003',
    userName: 'Emma Thompson',
    userEmail: 'emma.thompson@email.com',
    userRole: 'member',
    branchId: 'branch-002',
    branchName: 'Westside Branch',
    checkInTime: new Date('2024-01-15T08:45:00'),
    entryMethod: 'manual',
    status: 'checked-in',
    duration: 0,
    isLate: false,
    notes: 'Fingerprint scanner not working',
    approvedBy: 'staff-002',
    approvedAt: new Date('2024-01-15T08:46:00'),
    membershipId: 'membership-003',
    createdAt: new Date('2024-01-15T08:45:00'),
    updatedAt: new Date('2024-01-15T08:46:00')
  },
  {
    id: 'att-006',
    userId: 'trainer-002',
    userName: 'Alex Morgan',
    userEmail: 'alex.morgan@gymfit.com',
    userRole: 'trainer',
    branchId: 'branch-002',
    branchName: 'Westside Branch',
    checkInTime: new Date('2024-01-15T14:30:00'),
    entryMethod: 'biometric',
    deviceId: 'device-003',
    deviceLocation: 'Side Entrance',
    status: 'checked-in',
    duration: 0,
    isLate: true,
    expectedCheckIn: new Date('2024-01-15T14:00:00'),
    workShift: {
      id: 'shift-002',
      name: 'Evening Shift',
      startTime: '14:00',
      endTime: '22:00'
    },
    notes: 'Late arrival - personal appointment',
    createdAt: new Date('2024-01-15T14:30:00'),
    updatedAt: new Date('2024-01-15T14:30:00')
  }
];

// Mock attendance summary
export const mockAttendanceSummary: AttendanceSummary = {
  totalRecords: 156,
  totalMembers: 89,
  totalStaff: 12,
  checkedInCount: 34,
  checkedOutCount: 122,
  lateArrivals: 8,
  noShows: 3,
  averageDuration: 125,
  peakHours: [
    { hour: 7, count: 23 },
    { hour: 8, count: 31 },
    { hour: 18, count: 28 },
    { hour: 19, count: 25 }
  ],
  busyDays: [
    { day: 'Monday', count: 45 },
    { day: 'Wednesday', count: 42 },
    { day: 'Friday', count: 38 },
    { day: 'Saturday', count: 31 }
  ],
  methodBreakdown: {
    biometric: 89,
    manual: 23,
    card: 31,
    mobile: 13
  },
  branchBreakdown: [
    { branchId: 'branch-001', branchName: 'Downtown Branch', count: 98 },
    { branchId: 'branch-002', branchName: 'Westside Branch', count: 58 }
  ]
};

// Mock attendance settings
export const mockAttendanceSettings: AttendanceSettings = {
  autoApprovalEnabled: true,
  gracePeriodMinutes: 15,
  lateThresholdMinutes: 30,
  requireCheckout: false,
  allowManualEntry: true,
  allowMobileCheckIn: true,
  geofencingEnabled: true,
  geofenceRadius: 100,
  workingHours: {
    start: '06:00',
    end: '23:00'
  },
  notifications: {
    lateArrival: true,
    noShow: true,
    earlyDeparture: false,
    overtime: true
  },
  integrations: {
    payrollEnabled: true,
    leaveManagementEnabled: true,
    hikvisionEnabled: true,
    hikvisionSettings: {
      serverUrl: 'http://192.168.1.10:8080',
      username: 'admin',
      syncInterval: 15
    }
  }
};

// Generate more mock data for realistic testing
export const generateMockAttendanceRecords = (count: number = 50): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const userNames = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Maria Garcia', 'Chris Brown', 'Sarah Davis'];
  const entryMethods: ('biometric' | 'manual' | 'card' | 'mobile')[] = ['biometric', 'manual', 'card', 'mobile'];
  const branches = [
    { id: 'branch-001', name: 'Downtown Branch' },
    { id: 'branch-002', name: 'Westside Branch' }
  ];

  for (let i = 0; i < count; i++) {
    const branch = branches[Math.floor(Math.random() * branches.length)];
    const userName = userNames[Math.floor(Math.random() * userNames.length)];
    const entryMethod = entryMethods[Math.floor(Math.random() * entryMethods.length)];
    const isLate = Math.random() < 0.15; // 15% chance of being late
    const hasCheckedOut = Math.random() < 0.8; // 80% chance of having checked out
    
    const checkInTime = new Date();
    checkInTime.setDate(checkInTime.getDate() - Math.floor(Math.random() * 7));
    checkInTime.setHours(6 + Math.floor(Math.random() * 16), Math.floor(Math.random() * 60));
    
    let checkOutTime: Date | undefined;
    let duration = 0;
    
    if (hasCheckedOut) {
      checkOutTime = new Date(checkInTime);
      duration = 60 + Math.floor(Math.random() * 180); // 1-4 hours
      checkOutTime.setMinutes(checkOutTime.getMinutes() + duration);
    }

    records.push({
      id: `att-${String(i + 100).padStart(3, '0')}`,
      userId: `user-${String(i + 100).padStart(3, '0')}`,
      userName,
      userEmail: `${userName.toLowerCase().replace(' ', '.')}@email.com`,
      userRole: Math.random() < 0.8 ? 'member' : (Math.random() < 0.7 ? 'trainer' : 'staff'),
      branchId: branch.id,
      branchName: branch.name,
      checkInTime,
      checkOutTime,
      entryMethod,
      deviceId: entryMethod === 'biometric' ? `device-${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}` : undefined,
      deviceLocation: entryMethod === 'biometric' ? 'Main Entrance' : undefined,
      status: hasCheckedOut ? 'checked-out' : 'checked-in',
      duration,
      isLate,
      membershipId: `membership-${String(i + 100).padStart(3, '0')}`,
      createdAt: checkInTime,
      updatedAt: checkOutTime || checkInTime
    });
  }

  return records;
};