
import { useState, useCallback, useEffect } from 'react';
import { useTrainerAutoAssignment } from './useTrainerAutoAssignment';
import { useTrainerUtilization } from './useTrainerUtilization';
import { TrainerProfile, TrainerAssignment } from '@/types/trainer';
import { TrainerConfigSettings as ConfigType } from '@/types/trainer-config';
import { useToast } from '@/hooks/use-toast';

interface UseTrainerManagementReturn {
  // Trainer Management
  trainers: TrainerProfile[];
  assignments: TrainerAssignment[];
  
  // Auto Assignment
  autoAssignTrainer: (request: any) => Promise<any>;
  getTrainerRecommendations: (request: any) => TrainerProfile[];
  
  // Utilization
  getTrainerMetrics: (trainerId: string) => any;
  getBranchUtilizationSummary: (branchId: string) => any;
  
  // Configuration
  config: ConfigType | null;
  updateConfig: (newConfig: Partial<ConfigType>) => Promise<void>;
  
  // Booking Management
  createBooking: (bookingData: any) => Promise<string>;
  cancelBooking: (bookingId: string) => Promise<void>;
  rescheduleBooking: (bookingId: string, newDateTime: Date) => Promise<void>;
  
  // Notifications
  notifications: any[];
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Loading States
  isLoading: boolean;
  isAssigning: boolean;
  isBooking: boolean;
}

export const useTrainerManagement = (branchId: string): UseTrainerManagementReturn => {
  const { toast } = useToast();
  
  // Integration with existing hooks
  const {
    autoAssignTrainer,
    getTrainerRecommendations,
    isAssigning
  } = useTrainerAutoAssignment(branchId);
  
  const {
    getTrainerMetrics,
    getBranchUtilizationSummary
  } = useTrainerUtilization(branchId);

  // State management
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [assignments, setAssignments] = useState<TrainerAssignment[]>([]);
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Configuration Management
  const updateConfig = useCallback(async (newConfig: Partial<ConfigType>) => {
    try {
      setIsLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedConfig = {
        ...config,
        ...newConfig,
        updatedAt: new Date()
      } as ConfigType;
      
      setConfig(updatedConfig);
      
      toast({
        title: "Configuration Updated",
        description: "Trainer management settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [config, toast]);

  // Booking Management
  const createBooking = useCallback(async (bookingData: any): Promise<string> => {
    setIsBooking(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const bookingId = `booking_${Date.now()}`;
      
      // Create new assignment
      const newAssignment: TrainerAssignment = {
        id: `assignment_${Date.now()}`,
        trainerId: bookingData.trainerId,
        memberId: bookingData.memberId,
        sessionType: 'single',
        scheduledDate: bookingData.scheduledDate,
        duration: bookingData.duration,
        sessionType_detail: bookingData.specialty,
        notes: bookingData.notes,
        status: 'scheduled',
        isPaid: false,
        amount: bookingData.amount,
        assignedBy: 'member_request',
        assignmentReason: 'Direct member booking',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setAssignments(prev => [...prev, newAssignment]);
      
      toast({
        title: "Booking Confirmed",
        description: "Your training session has been booked successfully.",
      });
      
      return bookingId;
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to complete your booking. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsBooking(false);
    }
  }, [toast]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === bookingId 
            ? { ...assignment, status: 'cancelled' as const, updatedAt: new Date() }
            : assignment
        )
      );
      
      toast({
        title: "Booking Cancelled",
        description: "The training session has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Unable to cancel the booking. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const rescheduleBooking = useCallback(async (bookingId: string, newDateTime: Date) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === bookingId 
            ? { 
                ...assignment, 
                scheduledDate: newDateTime, 
                status: 'rescheduled' as const,
                updatedAt: new Date() 
              }
            : assignment
        )
      );
      
      toast({
        title: "Booking Rescheduled",
        description: "The training session has been rescheduled successfully.",
      });
    } catch (error) {
      toast({
        title: "Reschedule Failed",
        description: "Unable to reschedule the booking. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Notification Management
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been marked as read.",
    });
  }, [toast]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Mock data loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This would normally come from API calls
        // For now, we'll use the enhanced mock data
        
      } catch (error) {
        console.error('Failed to initialize trainer management data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [branchId]);

  return {
    trainers,
    assignments,
    autoAssignTrainer,
    getTrainerRecommendations,
    getTrainerMetrics,
    getBranchUtilizationSummary,
    config,
    updateConfig,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    isLoading,
    isAssigning,
    isBooking
  };
};
