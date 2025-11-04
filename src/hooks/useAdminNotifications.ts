import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { User, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'payment';
  timestamp: Date;
  read: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  data?: any;
}

export const useAdminNotifications = () => {
  const { authState } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!authState.user || !['admin', 'super-admin'].includes(authState.user.role)) {
      return;
    }

    // Load persisted notifications
    const stored = localStorage.getItem('admin_notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    }

    // Subscribe to check-ins (attendance_records)
    const checkInChannel = supabase
      .channel('admin_checkins')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'attendance_records'
        },
        async (payload) => {
          // Fetch member details
          const { data: member } = await supabase
            .from('members')
            .select('full_name')
            .eq('id', payload.new.member_id)
            .single();

          const newNotification: Notification = {
            id: `checkin_${payload.new.id}`,
            title: 'Member Check-In',
            message: `${member?.full_name || 'A member'} just checked in`,
            type: 'info',
            timestamp: new Date(),
            read: false,
            icon: User,
            data: payload.new
          };
          
          setNotifications(prev => {
            const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50
            localStorage.setItem('admin_notifications', JSON.stringify(updated));
            return updated;
          });

          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 3000
          });
        }
      )
      .subscribe();

    // Subscribe to membership expiration warnings
    const membershipChannel = supabase
      .channel('admin_memberships')
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'member_memberships'
        },
        async (payload) => {
          const endDate = new Date(payload.new.end_date);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          // Only notify for memberships expiring in 7 days or less
          if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
            const { data: member } = await supabase
              .from('members')
              .select('full_name')
              .eq('id', payload.new.member_id)
              .single();

            const newNotification: Notification = {
              id: `membership_${payload.new.id}_${Date.now()}`,
              title: 'Membership Expiring Soon',
              message: `${member?.full_name || 'Member'} membership expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
              type: 'warning',
              timestamp: new Date(),
              read: false,
              icon: AlertTriangle,
              data: payload.new
            };
            
            setNotifications(prev => {
              const updated = [newNotification, ...prev].slice(0, 50);
              localStorage.setItem('admin_notifications', JSON.stringify(updated));
              return updated;
            });

            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000
            });
          }

          // Check if membership just expired
          if (payload.new.status === 'expired' && payload.old.status !== 'expired') {
            const { data: member } = await supabase
              .from('members')
              .select('full_name')
              .eq('id', payload.new.member_id)
              .single();

            const newNotification: Notification = {
              id: `expired_${payload.new.id}`,
              title: 'Membership Expired',
              message: `${member?.full_name || 'Member'} membership has expired`,
              type: 'warning',
              timestamp: new Date(),
              read: false,
              icon: AlertTriangle,
              data: payload.new
            };
            
            setNotifications(prev => {
              const updated = [newNotification, ...prev].slice(0, 50);
              localStorage.setItem('admin_notifications', JSON.stringify(updated));
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Subscribe to overdue payments
    const paymentChannel = supabase
      .channel('admin_payments')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'invoices'
        },
        async (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          if (newData && newData.status === 'overdue') {
            const { data: member } = await supabase
              .from('members')
              .select('full_name')
              .eq('id', newData.member_id)
              .single();

            const newNotification: Notification = {
              id: `payment_${newData.id}`,
              title: 'Payment Overdue',
              message: `Invoice ${newData.invoice_number} for ${member?.full_name || 'member'} is overdue`,
              type: 'payment',
              timestamp: new Date(),
              read: false,
              icon: DollarSign,
              data: newData
            };
            
            setNotifications(prev => {
              const updated = [newNotification, ...prev].slice(0, 50);
              localStorage.setItem('admin_notifications', JSON.stringify(updated));
              return updated;
            });

            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000
            });
          }

          // Payment received
          if (newData && newData.status === 'paid' && oldData?.status !== 'paid') {
            const newNotification: Notification = {
              id: `paid_${newData.id}`,
              title: 'Payment Received',
              message: `Payment received for invoice ${newData.invoice_number}`,
              type: 'success',
              timestamp: new Date(),
              read: false,
              icon: CheckCircle,
              data: newData
            };
            
            setNotifications(prev => {
              const updated = [newNotification, ...prev].slice(0, 50);
              localStorage.setItem('admin_notifications', JSON.stringify(updated));
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      checkInChannel.unsubscribe();
      membershipChannel.unsubscribe();
      paymentChannel.unsubscribe();
    };
  }, [authState.user]);

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('admin_notifications');
  };

  return { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAll
  };
};
