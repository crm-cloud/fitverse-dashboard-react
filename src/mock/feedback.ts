
import { Feedback, FeedbackResponse, FeedbackStats } from '@/types/feedback';

export const mockFeedback: Feedback[] = [
  {
    id: 'fb_001',
    memberId: 'mem_001',
    memberName: 'John Smith',
    memberEmail: 'john@example.com',
    type: 'facility',
    category: 'Cleanliness',
    title: 'Locker room needs better maintenance',
    description: 'The locker room floors are often wet and slippery. Could use more frequent cleaning and better ventilation.',
    rating: 3,
    status: 'in-review',
    priority: 'medium',
    branchId: 'branch_001',
    branchName: 'Mumbai Central',
    tags: ['cleanliness', 'safety', 'locker-room'],
    isAnonymous: false,
    createdAt: new Date(2024, 2, 15, 10, 30),
    updatedAt: new Date(2024, 2, 16, 14, 20)
  },
  {
    id: 'fb_002',
    memberId: 'mem_002',
    memberName: 'Sarah Wilson',
    memberEmail: 'sarah@example.com',
    type: 'trainer',
    category: 'Service Quality',
    title: 'Excellent personal training session',
    description: 'Mike was incredibly helpful and motivated me throughout the session. Great technique corrections and personalized workout plan.',
    rating: 5,
    status: 'resolved',
    priority: 'low',
    branchId: 'branch_001',
    branchName: 'Mumbai Central',
    relatedEntityId: 'trainer_mike',
    relatedEntityName: 'Mike Rodriguez',
    tags: ['personal-training', 'positive', 'technique'],
    isAnonymous: false,
    createdAt: new Date(2024, 2, 12, 16, 45),
    updatedAt: new Date(2024, 2, 13, 9, 15),
    resolvedAt: new Date(2024, 2, 13, 9, 15),
    resolvedBy: 'admin_001',
    adminResponse: 'Thank you for the positive feedback! We\'ve shared this with Mike and the training team.'
  },
  {
    id: 'fb_003',
    memberId: 'mem_003',
    memberName: 'Anonymous Member',
    memberEmail: 'anonymous@gym.com',
    type: 'equipment',
    category: 'Maintenance',
    title: 'Treadmill #5 making strange noise',
    description: 'The treadmill near the windows has been making a grinding noise for the past week. It might need maintenance.',
    rating: 2,
    status: 'pending',
    priority: 'high',
    branchId: 'branch_001',
    branchName: 'Mumbai Central',
    relatedEntityId: 'treadmill_005',
    relatedEntityName: 'Treadmill #5',
    tags: ['equipment', 'maintenance', 'cardio'],
    isAnonymous: true,
    createdAt: new Date(2024, 2, 18, 8, 20),
    updatedAt: new Date(2024, 2, 18, 8, 20)
  },
  {
    id: 'fb_004',
    memberId: 'mem_001',
    memberName: 'John Smith',
    memberEmail: 'john@example.com',
    type: 'class',
    category: 'Scheduling',
    title: 'More evening yoga classes needed',
    description: 'The 7 PM yoga class is always full. Would love to see an additional 8 PM slot added to accommodate more members.',
    rating: 4,
    status: 'in-review',
    priority: 'medium',
    branchId: 'branch_001',
    branchName: 'Mumbai Central',
    relatedEntityId: 'class_yoga_001',
    relatedEntityName: 'Evening Yoga Flow',
    tags: ['scheduling', 'yoga', 'capacity'],
    isAnonymous: false,
    createdAt: new Date(2024, 2, 20, 19, 30),
    updatedAt: new Date(2024, 2, 21, 10, 15)
  },
  {
    id: 'fb_005',
    memberId: 'mem_004',
    memberName: 'Emily Chen',
    memberEmail: 'emily@example.com',
    type: 'service',
    category: 'Staff',
    title: 'Front desk staff very helpful',
    description: 'The reception team is always friendly and quick to help with any questions or issues. Great customer service!',
    rating: 5,
    status: 'resolved',
    priority: 'low',
    branchId: 'branch_001',
    branchName: 'Mumbai Central',
    tags: ['staff', 'positive', 'customer-service'],
    isAnonymous: false,
    createdAt: new Date(2024, 2, 10, 14, 0),
    updatedAt: new Date(2024, 2, 11, 11, 30),
    resolvedAt: new Date(2024, 2, 11, 11, 30),
    resolvedBy: 'manager_001',
    adminResponse: 'We appreciate your kind words! Our front desk team works hard to provide excellent service.'
  }
];

export const mockFeedbackResponses: FeedbackResponse[] = [
  {
    id: 'resp_001',
    feedbackId: 'fb_001',
    responderId: 'manager_001',
    responderName: 'Alex Johnson',
    responderRole: 'manager',
    message: 'Thank you for bringing this to our attention. We\'ve scheduled additional cleaning rounds for the locker room and are looking into improved ventilation options.',
    isPublic: true,
    createdAt: new Date(2024, 2, 16, 14, 20)
  },
  {
    id: 'resp_002',
    feedbackId: 'fb_002',
    responderId: 'admin_001',
    responderName: 'Admin User',
    responderRole: 'admin',
    message: 'We\'re thrilled to hear about your positive experience with Mike! We\'ve shared your feedback with him and the entire training team.',
    isPublic: true,
    createdAt: new Date(2024, 2, 13, 9, 15)
  }
];

export const mockFeedbackStats: FeedbackStats = {
  total: 5,
  pending: 1,
  inReview: 2,
  resolved: 2,
  closed: 0,
  averageRating: 3.8,
  averageResolutionTime: 18.5,
  byType: {
    facility: 1,
    trainer: 1,
    class: 1,
    equipment: 1,
    service: 1,
    general: 0
  },
  byPriority: {
    low: 2,
    medium: 2,
    high: 1,
    urgent: 0
  }
};
