import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemEvent {
  id: string;
  event_type: 'info' | 'warning' | 'error' | 'success';
  event_category: 'system' | 'database' | 'backup' | 'security' | 'performance' | 'user_activity';
  title: string;
  description?: string;
  metadata: any;
  severity: number;
  resolved: boolean;
  created_at: string;
}

export const useSystemEvents = (limit = 10) => {
  return useQuery({
    queryKey: ['system-events', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as SystemEvent[];
    }
  });
};

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      // Get recent system events for status
      const { data: events, error: eventsError } = await supabase
        .from('system_events')
        .select('event_type, severity')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (eventsError) console.warn('Could not fetch system events:', eventsError);
      
      // Calculate health status based on recent events
      const warningEvents = events?.filter(e => e.event_type === 'warning' || e.severity >= 3).length || 0;
      const errorEvents = events?.filter(e => e.event_type === 'error' || e.severity >= 4).length || 0;
      
      const serverStatus = errorEvents > 0 ? 'error' : warningEvents > 2 ? 'warning' : 'healthy';
      
      // Mock additional metrics - in real implementation, these would come from actual monitoring
      return {
        server: {
          status: serverStatus,
          uptime: '99.9%'
        },
        database: {
          status: 'healthy',
          connections: 5,
          size: '124.5MB'
        },
        storage: {
          used: 78,
          status: 'warning' // over 75%
        },
        cpu: {
          usage: 45,
          status: 'healthy'
        },
        memory: {
          usage: 62,
          status: 'healthy'
        },
        network: {
          status: 'healthy',
          latency: '12ms'
        }
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
};

export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      // Get recent API performance from analytics
      const { data: analytics, error } = await supabase
        .from('analytics_events')
        .select('properties, created_at')
        .eq('event_category', 'api_performance')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.warn('Could not fetch performance metrics:', error);
      }
      
      // Return mock data since analytics might not be set up yet
      return {
        responseTime: { avg: 125, trend: 'stable' },
        throughput: { current: analytics?.length || 1250, trend: 'up' },
        errorRate: { current: 0.02, trend: 'down' }
      };
    },
    refetchInterval: 60000 // Refresh every minute
  });
};